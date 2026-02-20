/**
 * @fileoverview Raid bosses page scraper for Pokemon GO data.
 * Scrapes current raid boss information from LeekDuck including regular
 * and shadow raids, CP ranges, types, weather boosts, and shiny availability.
 * @module pages/raids
 */

const fs = require('fs');
const { loadShinyData, extractDexNumber, hasShiny } = require('../utils/shinyData');
const { enrichMissingImageDimensions } = require('../utils/imageDimensions');
const { transformUrls } = require('../utils/blobUrls');
const logger = require('../utils/logger');
const { fetchJson, getJSDOM } = require('../utils/scraperUtils');

/**
 * @typedef {Object} RaidCombatPower
 * @property {{min: number, max: number}} normal - CP range at level 20
 * @property {{min: number, max: number}} boosted - CP range at level 25 (weather boosted)
 */

/**
 * @typedef {Object} PokemonType
 * @property {string} name - Type name in lowercase (e.g., "fire", "water")
 * @property {string} image - URL to type icon image
 */

/**
 * @typedef {Object} WeatherBoost
 * @property {string} name - Weather condition name in lowercase
 * @property {string} image - URL to weather icon image
 */

/**
 * @typedef {Object} RaidBoss
 * @property {string} name - Pokemon name (cleaned of form/gender suffixes)
 * @property {string} originalName - Full Pokemon name as displayed
 * @property {string|null} form - Pokemon form (e.g., "Origin Forme") or null
 * @property {"male"|"female"|null} gender - Pokemon gender or null
 * @property {string} tier - Raid tier (e.g., "Mega Raids", "5-Star Raids")
 * @property {boolean} isShadowRaid - Whether this is a shadow raid boss
 * @property {string} eventStatus - Status: "ongoing", "upcoming", "inactive", or "unknown"
 * @property {boolean} canBeShiny - Whether this Pokemon can be shiny
 * @property {PokemonType[]} types - Array of Pokemon types
 * @property {RaidCombatPower} combatPower - CP ranges for normal and weather-boosted catches
 * @property {WeatherBoost[]} boostedWeather - Weather conditions that boost this Pokemon
 * @property {string} image - URL to Pokemon image
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {string} [imageType] - Image format type
 */

/**
 * Determines event status for a raid boss by checking events data.
 * Looks up matching raid-related events and compares current time against
 * event start/end dates.
 * 
 * @param {string} bossName - Name of the raid boss to check
 * @param {boolean} isShadowRaid - Whether this is a shadow raid
 * @param {Array<Object>} raidEvents - Pre-filtered array of raid events with startDate/endDate properties
 * @param {Date} now - Current date/time to compare against
 * @returns {string} Event status: "ongoing", "upcoming", "inactive", or "unknown"
 * 
 * @example
 * const status = determineEventStatus("Giratina", false, raidEvents, new Date());
 * // Returns "ongoing" if Giratina raid event is currently active
 */
function determineEventStatus(bossName, isShadowRaid, raidEvents, now) {
    try {
        if (!raidEvents || !Array.isArray(raidEvents)) {
            return 'unknown';
        }

        // Look for raid-related events that match this boss
        for (const event of raidEvents) {
            // Check if event mentions this boss
            const eventNameLower = event.name.toLowerCase();
            const bossNameLower = bossName.toLowerCase();
            
            // Special handling for forms (e.g., "Thundurus" matches "Thundurus (Incarnate)")
            const bossBaseName = bossNameLower.split('(')[0].trim();
            
            if (eventNameLower.includes(bossBaseName)) {
                const startDate = event.startDate;
                const endDate = event.endDate;
                
                // Determine status based on dates
                if (startDate && endDate) {
                    if (now >= startDate && now <= endDate) {
                        return 'ongoing';
                    } else if (now < startDate) {
                        return 'upcoming';
                    } else if (now > endDate) {
                        return 'inactive';
                    }
                }
            }
        }
        
        // If no matching event found, return unknown
        return 'unknown';
    } catch (error) {
        logger.error('Error determining event status: ' + error.message);
        return 'unknown';
    }
}

/**
 * Parses form from Pokemon name (e.g., "Giratina (Origin Forme)" -> "Origin Forme").
 * Extracts text within parentheses.
 * 
 * @param {string} name - Full Pokemon name potentially containing form info
 * @returns {string|null} The form name if found, null otherwise
 * 
 * @example
 * parseForm("Giratina (Origin Forme)"); // Returns "Origin Forme"
 * parseForm("Pikachu"); // Returns null
 */
function parseForm(name) {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
}

/**
 * Parses gender from Pokemon name by detecting gender symbols.
 * 
 * @param {string} name - Pokemon name potentially containing gender symbol
 * @returns {"male"|"female"|null} Gender if symbol found, null otherwise
 * 
 * @example
 * parseGender("Nidoran♂"); // Returns "male"
 * parseGender("Nidoran♀"); // Returns "female"
 * parseGender("Pikachu"); // Returns null
 */
function parseGender(name) {
    if (name.includes('♂')) return 'male';
    if (name.includes('♀')) return 'female';
    return null;
}

/**
 * Cleans Pokemon name by removing form suffixes and gender symbols.
 * Returns the base Pokemon name suitable for display and matching.
 * 
 * @param {string} name - Full Pokemon name with potential form/gender info
 * @returns {string} Cleaned Pokemon name
 * 
 * @example
 * cleanName("Giratina (Origin Forme)"); // Returns "Giratina"
 * cleanName("Nidoran♂"); // Returns "Nidoran"
 */
function cleanName(name) {
    return name
        .replace(/\s*\([^)]+\)\s*/g, '')  // Remove parenthetical forms
        .replace(/\s*[♂♀]\s*/g, '')       // Remove gender symbols
        .trim();
}

/**
 * Scrapes raid boss data from LeekDuck and writes to data files.
 * 
 * Fetches the raid bosses page, parses both regular and shadow raid bosses,
 * extracts tier information, types, CP ranges, weather boosts, and shiny
 * availability. Cross-references with shiny data and fetches image dimensions.
 * 
 * @async
 * @function get
 * @returns {Promise<RaidBoss[]>} Resolves with array of raid boss data
 * @throws {Error} On network failure, falls back to cached CDN data
 * 
 * @example
 * // Scrape raids data
 * const raids = require('./pages/raids');
 * const bosses = await raids.get();
 * // Creates data/raids.json and data/raids.min.json
 */
async function get() {
    logger.info("Scraping raids...");
    try {
        try {
            const dom = await getJSDOM("https://leekduck.com/raid-bosses/");

            let bosses = [];

            // Load shiny data for cross-referencing
            const shinyMap = loadShinyData();

            // Load events data for status determination
            let events = [];
            try {
                const eventsDataRaw = await fs.promises.readFile('data/events.min.json', 'utf8');
                const eventsData = JSON.parse(eventsDataRaw);
                // Flatten eventType-keyed structure into array if needed
                if (Array.isArray(eventsData)) {
                    events = eventsData;
                } else if (eventsData && typeof eventsData === 'object') {
                    Object.values(eventsData).forEach(typeArray => {
                        if (Array.isArray(typeArray)) {
                            events = events.concat(typeArray);
                        }
                    });
                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    logger.error('Error loading events data: ' + error.message);
                }
            }

            // Pre-process events for performance: filter relevant types and parse dates once
            const now = new Date();
            const raidEvents = events
                .filter(e => ['raid-battles', 'raid-hour', 'raid-day'].includes(e.eventType))
                .map(e => ({
                    ...e,
                    startDate: e.start ? new Date(e.start) : null,
                    endDate: e.end ? new Date(e.end) : null
                }));

            const raidBosses = dom.window.document.querySelectorAll('.raid-bosses, .shadow-raid-bosses');

                raidBosses.forEach(raidBossContainer => {
                    // Determine if this is a shadow raid container
                    const isShadowRaid = raidBossContainer.classList.contains('shadow-raid-bosses');
                    
                    const tiers = raidBossContainer.querySelectorAll('.tier');

                    tiers.forEach(tierDiv => {
                        const tierHeader = tierDiv.querySelector('h2.header');
                        const currentTier = tierHeader ? tierHeader.textContent.trim() : "";

                        const cards = tierDiv.querySelectorAll('.grid .card');
                        cards.forEach(card => {
                            // Get raw name first for parsing
                            const rawName = card.querySelector('.identity .name')?.textContent.trim() || "";
                            
                            let boss = {
                                name: cleanName(rawName),
                                originalName: rawName,
                                form: parseForm(rawName),
                                gender: parseGender(rawName),
                                tier: currentTier,
                                isShadowRaid: isShadowRaid,
                                eventStatus: 'unknown', // Will be determined below
                                canBeShiny: false,
                                types: [],
                                combatPower: {
                                    normal: { min: null, max: null },
                                    boosted: { min: null, max: null }
                                },
                                boostedWeather: [],
                                image: ""
                            };
                            
                            // Determine event status based on events data
                            boss.eventStatus = determineEventStatus(boss.name, isShadowRaid, raidEvents, now);

                            // Image
                            const img = card.querySelector('.boss-img img');
                            boss.image = img?.src || "";
                            boss.altText = img?.alt || "";

                            // Shiny - check both LeekDuck icon and PogoAssets data
                            const hasShinyIcon = !!card.querySelector('.boss-img .shiny-icon');
                            const dexNumber = extractDexNumber(boss.image);
                            const hasShinyInAssets = dexNumber ? hasShiny(shinyMap, dexNumber, boss.form) : false;
                            boss.canBeShiny = hasShinyIcon || hasShinyInAssets;

                            // Types
                            card.querySelectorAll('.boss-type .type img').forEach(img => {
                                boss.types.push({
                                    name: img.getAttribute('title')?.toLowerCase() || "",
                                    image: img.src
                                });
                            });

                            // Combat Power (normal)
                            let cpText = card.querySelector('.cp-range')?.textContent.replace('CP', '').trim() || "";
                            let [cpMin, cpMax] = cpText.split('-').map(s => parseInt(s.trim()));
                            boss.combatPower.normal.min = cpMin || null;
                            boss.combatPower.normal.max = cpMax || null;

                            // Combat Power (boosted)
                            let boostedText = card.querySelector('.boosted-cp-row .boosted-cp')?.textContent.replace('CP', '').trim() || "";
                            let [boostMin, boostMax] = boostedText.split('-').map(s => parseInt(s.trim()));
                            boss.combatPower.boosted.min = boostMin || null;
                            boss.combatPower.boosted.max = boostMax || null;

                            // Boosted Weather
                            card.querySelectorAll('.weather-boosted .boss-weather .weather-pill img').forEach(img => {
                                boss.boostedWeather.push({
                                    name: img.getAttribute('alt')?.toLowerCase() || "",
                                    image: img.src
                                });
                            });

                            bosses.push(boss);
                        });
                    });
                });

            // Populate dimensions for raid bosses and nested image assets (types/weather).
            await enrichMissingImageDimensions(bosses);

            const output = transformUrls(bosses);

            await fs.promises.writeFile('data/raids.min.json', JSON.stringify(output));
            logger.success("Raids saved.");
            return output;

        } catch (_err) {
            logger.error(_err);

            const json = await fetchJson("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.min.json");
            const output = transformUrls(json);

            await fs.promises.writeFile('data/raids.min.json', JSON.stringify(output));
            logger.success("Raids saved (fallback).");
            return output;
        }
    } catch (error) {
        logger.error(error.message);
    }
}

module.exports = { get }
