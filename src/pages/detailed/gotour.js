/**
 * @fileoverview Pokemon GO Tour event scraper.
 * Complex multi-section handler for large-scale in-person and global events.
 * Extracts habitats (with rotation schedules), raids (with mega hourly schedules),
 * eggs, bonuses (categorized), research (branching, timed with regional groups),
 * shiny debuts, routes, costumed Pokemon, and event metadata.
 * @module pages/detailed/gotour
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList, 
    extractRaidInfo, 
    extractEggPools,
    extractBonusByCategory,
    extractSchedule,
    extractHabitatRotation,
    extractEventMeta,
    extractRegionalGroups,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} GOTourData
 * @property {Object} eventInfo - Basic event info (name, location, dates, time, ticketPrice, ticketUrl)
 * @property {string[]} eventTags - Page tags ("Pokémon GO Tour", "Ticketed Event")
 * @property {Object[]} eventLocations - Other event locations [{name, url}]
 * @property {Object[]} bonusCategories - Categorized bonuses [{category, timeframe, bonuses}]
 * @property {string[]} exclusiveBonuses - Ticket-exclusive bonus text (legacy)
 * @property {Object.<string, {timeInfo, spawns, rareSpawns}>} habitats - Habitats keyed by name
 * @property {Object[]} habitatRotation - Rotation schedule [{name, timeSlots}]
 * @property {Object[]} incenseEncounters - Incense-exclusive spawns
 * @property {Object} eggs - Egg pools by distance
 * @property {Object} raids - Raid bosses by tier {oneStar, threeStar, fiveStar, mega}
 * @property {Object} megaRaidSchedule - Per-day hourly mega schedules {saturday, sunday}
 * @property {string[]} megaDebuts - Newly debuting Mega Pokemon names
 * @property {Object} research - Research info {field, special, timed, masterwork}
 * @property {Object|null} branchingResearch - Branching research {description, paths}
 * @property {Object[]} timedResearchRegions - Regional groups [{region, pokemon}]
 * @property {Object|null} routes - Route data {description, pokemon, regionalAppearances}
 * @property {Object[]} shinyDebuts - Pokemon with shiny debut
 * @property {Object[]} shinies - All available shinies
 * @property {Object[]} costumedPokemon - Event-costumed Pokemon
 * @property {string[]} specialBackgrounds - Special background descriptions
 * @property {string[]} sales - Merchandise/sale/avatar info
 * @property {string[]} whatsNew - New features descriptions
 */

/**
 * Scrapes Pokemon GO Tour event data from LeekDuck.
 * Comprehensive extraction for large-scale events including habitats with
 * rotation schedules, categorized bonuses, Mega raid hourly schedules,
 * branching research, regional timed research, routes, and event metadata.
 * 
 * @async
 * @function get
 * @param {string} url - Full URL to the event page
 * @param {string} id - Event ID (URL slug)
 * @param {Object[]} bkp - Backup data array for fallback on scraping failure
 * @returns {Promise<void>} Writes temp file on success
 * @throws {Error} Falls back to backup data on failure
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const tourData = {
            eventInfo: {
                name: '',
                location: '',
                dates: '',
                time: '',
                ticketPrice: null,
                ticketUrl: ''
            },
            eventTags: [],
            eventLocations: [],
            bonusCategories: [],
            exclusiveBonuses: [],
            habitats: {},
            incenseEncounters: [],
            eggs: {},
            raids: {
                oneStar: [],
                threeStar: [],
                fiveStar: [],
                mega: []
            },
            megaRaidSchedule: {},
            megaDebuts: [],
            research: {
                field: [],
                special: [],
                timed: [],
                masterwork: []
            },
            branchingResearch: null,
            timedResearchRegions: [],
            routes: null,
            shinyDebuts: [],
            shinies: [],
            costumedPokemon: [],
            specialBackgrounds: [],
            sales: [],
            whatsNew: []
        };

        // ── Event metadata ──────────────────────────────────────────────
        const meta = extractEventMeta(doc);
        tourData.eventInfo.name = meta.title;
        tourData.eventInfo.ticketUrl = meta.ticketUrl;
        tourData.eventTags = meta.tags;
        tourData.eventLocations = meta.otherLocations;

        // ── Categorized bonuses ─────────────────────────────────────────
        tourData.bonusCategories = await extractBonusByCategory(doc);

        // ── Eggs ────────────────────────────────────────────────────────
        tourData.eggs = await extractEggPools(doc);

        // ── Raids (shared utility) ──────────────────────────────────────
        const raidInfo = await extractRaidInfo(doc);
        tourData.raids.fiveStar = raidInfo.tiers.fiveStar;
        tourData.raids.mega = raidInfo.tiers.mega;
        tourData.raids.threeStar = raidInfo.tiers.threeStar;
        tourData.raids.oneStar = raidInfo.tiers.oneStar;
        tourData.shinies = raidInfo.shinies;

        // ── Mega raid hourly schedule ───────────────────────────────────
        const sections = getSectionHeaders(doc);
        const satId = sections.find(s => s.includes('saturday'));
        const sunId = sections.find(s => s.includes('sunday'));
        if (satId || sunId) {
            tourData.megaRaidSchedule = {};
            if (satId) tourData.megaRaidSchedule.saturday = extractSchedule(doc, satId);
            if (sunId) tourData.megaRaidSchedule.sunday = extractSchedule(doc, sunId);
        }

        // ── Habitat rotation schedule ───────────────────────────────────
        const rotationId = sections.find(s => s.includes('habitat-rotation'));
        if (rotationId) {
            const rotations = extractHabitatRotation(doc, rotationId);
            if (rotations.length > 0) {
                tourData.habitatRotation = rotations;
            }
        }

        // ── Section-by-section extraction ───────────────────────────────
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Event overview / location / ticket info
            if (sectionId.includes('overview') || sectionId.includes('event-overview')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Location:')) {
                        tourData.eventInfo.location = p.replace('Location:', '').trim();
                    } else if (p.includes('Dates:') || p.includes('Date:')) {
                        tourData.eventInfo.dates = p.replace(/Dates?:/, '').trim();
                    } else if (p.includes('Time:')) {
                        tourData.eventInfo.time = p.replace('Time:', '').trim();
                    } else if (p.includes('Ticket Price:') || p.includes('Price:')) {
                        const priceInfo = extractPrice(p);
                        if (priceInfo) {
                            tourData.eventInfo.ticketPrice = priceInfo.price;
                        }
                    }
                });
            }

            // Exclusive bonuses (legacy - still capture for backward compat)
            if (sectionId.includes('exclusive') && sectionId.includes('bonus')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.exclusiveBonuses.push(p);
                });
                sectionContent.lists.forEach(list => {
                    tourData.exclusiveBonuses.push(...list);
                });
            }

            // Habitat sections (Central Village, Coastal Laboratory, Mountain Manor, etc.)
            if (sectionId.includes('village') || sectionId.includes('laboratory') || 
                sectionId.includes('manor') || sectionId.includes('coastal') || 
                sectionId.includes('mountain') || sectionId.includes('central')) {
                // Get time info from the paragraph below the h2
                const headerEl = doc.getElementById(sectionId);
                let timeInfo = '';
                if (headerEl) {
                    const nextP = headerEl.nextElementSibling;
                    if (nextP && nextP.tagName === 'P') {
                        timeInfo = nextP.textContent.trim();
                    }
                }
                const habitatName = sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tourData.habitats[habitatName] = {
                    timeInfo: timeInfo,
                    spawns: sectionContent.pokemon,
                    rareSpawns: []
                };
            }

            // Incense encounters
            if (sectionId.includes('incense')) {
                tourData.incenseEncounters.push(...sectionContent.pokemon);
            }

            // Raid tiers (section-specific catch for individual tier headers)
            if (sectionId.includes('one-star') || sectionId.includes('1-star')) {
                tourData.raids.oneStar.push(...sectionContent.pokemon);
            } else if (sectionId.includes('three-star') || sectionId.includes('3-star')) {
                tourData.raids.threeStar.push(...sectionContent.pokemon);
            } else if (sectionId.includes('five-star') || sectionId.includes('5-star')) {
                tourData.raids.fiveStar.push(...sectionContent.pokemon);
            }

            // Mega debuts
            if (sectionId.includes('mega') && (sectionId.includes('debut') || sectionId.includes('make'))) {
                // Extract debut names from paragraphs - match "Mega PokemonName" but not generic terms
                sectionContent.paragraphs.forEach(p => {
                    const matches = p.match(/Mega\s+[A-Z][a-z]+/g);
                    if (matches) {
                        matches.forEach(name => {
                            // Exclude generic terms like "Mega Raids", "Mega Evolution", "Mega Night"
                            if (!/Mega\s+(Raid|Evolution|Evolv|Battle|Energy|Night|Event|Week)/i.test(name) &&
                                !tourData.megaDebuts.includes(name)) {
                                tourData.megaDebuts.push(name);
                            }
                        });
                    }
                });
            }

            // Routes / Flabébé regional
            if (sectionId.includes('route')) {
                const routeData = {
                    description: [],
                    pokemon: sectionContent.pokemon,
                    regionalAppearances: []
                };
                sectionContent.paragraphs.forEach(p => {
                    routeData.description.push(p);
                });
                // Parse regional appearances from list items
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        const regionMatch = item.match(/^(.+?):\s*Appearing\s+in\s+(.+)/i);
                        if (regionMatch) {
                            routeData.regionalAppearances.push({
                                pokemon: regionMatch[1].trim(),
                                region: regionMatch[2].trim()
                            });
                        }
                    });
                });
                tourData.routes = routeData;
            }

            // Research sections
            if (sectionId.includes('field-research')) {
                tourData.research.field.push(...sectionContent.pokemon);
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.field.push({ info: p });
                });
            } else if (sectionId.includes('branching') || 
                       (sectionId.includes('special-research') && sectionId.includes('version')) ||
                       (sectionId.includes('xerneas') && sectionId.includes('special-research')) ||
                       (sectionId.includes('yveltal') && sectionId.includes('special-research'))) {
                // Branching Special Research (X/Y version choice)
                if (!tourData.branchingResearch) {
                    tourData.branchingResearch = { description: [], paths: [] };
                }
                // Walk the DOM directly for interleaved P/UL structure
                const branchHeader = doc.getElementById(sectionId);
                if (branchHeader) {
                    let el = branchHeader.nextElementSibling;
                    let currentPath = null;
                    while (el && el.tagName !== 'H2' && !el.classList?.contains('event-section-header')) {
                        if (el.tagName === 'HR') { el = el.nextElementSibling; continue; }
                        if (el.tagName === 'P') {
                            const text = el.textContent.trim();
                            if (!text) { el = el.nextElementSibling; continue; }
                            const pathMatch = text.match(/Trainers who choose the ([\w\s]+?) path/i);
                            if (pathMatch) {
                                currentPath = { name: pathMatch[1].trim(), details: [] };
                                tourData.branchingResearch.paths.push(currentPath);
                            } else if (currentPath) {
                                currentPath.details.push(text);
                            } else {
                                tourData.branchingResearch.description.push(text);
                            }
                        }
                        if (el.tagName === 'UL' || el.tagName === 'OL') {
                            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim());
                            if (currentPath) {
                                currentPath.details.push(...items);
                            } else {
                                tourData.branchingResearch.description.push(...items);
                            }
                        }
                        el = el.nextElementSibling;
                    }
                }
            } else if (sectionId.includes('special-research')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.special.push(p);
                });
            } else if (sectionId.includes('timed-research') || sectionId.includes('furfrou') ||
                        sectionId.includes('trim-mendous')) {
                // Timed research paragraphs
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.timed.push(p);
                });
                sectionContent.lists.forEach(list => {
                    tourData.research.timed.push(...list);
                });
                // Regional Furfrou groups
                const regions = await extractRegionalGroups(doc, sectionId);
                if (regions.length > 0) {
                    tourData.timedResearchRegions = regions;
                }
            } else if (sectionId.includes('masterwork')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.masterwork.push(p);
                });
            }

            // Shiny debuts
            if (sectionId.includes('shiny') && (sectionId.includes('debut') || sectionId.includes('new'))) {
                sectionContent.pokemon.forEach(p => {
                    if (!tourData.shinyDebuts.find(s => s.name === p.name)) {
                        tourData.shinyDebuts.push(p);
                    }
                });
            } else if (sectionId === 'shiny') {
                tourData.shinies.push(...sectionContent.pokemon);
            }

            // Costumed Pokemon (e.g., "looking-good-pikachu")
            if (sectionId.includes('looking-good') || sectionId.includes('costumed') ||
                sectionId.includes('costume')) {
                // Pokemon grids in this section are typically shiny debuts, not costumed
                // Add them to shinyDebuts instead
                sectionContent.pokemon.forEach(p => {
                    if (p.canBeShiny && !tourData.shinyDebuts.find(s => s.name === p.name)) {
                        tourData.shinyDebuts.push(p);
                    }
                });
                // Extract costume references from paragraph text
                sectionContent.paragraphs.forEach(p => {
                    // Match "Pikachu wearing Calem's hat" patterns (smart/curly quote safe)
                    // Uses RegExp constructor with \u escapes to prevent file-save encoding issues
                    const costumeRe = new RegExp('(\\w+)\\s+wearing\\s+[\\w\\s\u2018\u2019\u0027`\u00b4]+(?:hat|outfit|costume)', 'gi');
                    const costumeMatches = p.match(costumeRe);
                    if (costumeMatches) {
                        costumeMatches.forEach(m => {
                            // Split compound descriptions like "X wearing A's hat or B's hat"
                            const orSplit = m.match(/^(\w+)\s+wearing\s+(.+)$/i);
                            if (orSplit) {
                                const pokemon = orSplit[1];
                                const costumeParts = orSplit[2].split(/\s+or\s+/i);
                                costumeParts.forEach(part => {
                                    const desc = `${pokemon} wearing ${part.trim()}`;
                                    if (!tourData.costumedPokemon.find(c => c.description === desc)) {
                                        tourData.costumedPokemon.push({ description: desc });
                                    }
                                });
                            } else if (!tourData.costumedPokemon.find(c => c.description === m.trim())) {
                                tourData.costumedPokemon.push({ description: m.trim() });
                            }
                        });
                    }
                });
            }

            // Shining surprises section - these are shiny-highlighted pokemon, not costumed
            // Skip adding to costumedPokemon; they're already captured in shinies

            // Special Backgrounds
            if (sectionId.includes('special-background')) {
                const backgrounds = [];
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) backgrounds.push(p);
                });
                sectionContent.lists.forEach(list => {
                    list.forEach(item => backgrounds.push(item));
                });
                if (backgrounds.length > 0) {
                    tourData.specialBackgrounds = backgrounds;
                }
            }

            // Sales / Avatar items / Stickers
            if (sectionId.includes('sales') || sectionId.includes('sticker') || 
                sectionId.includes('avatar-item') || sectionId.includes('t-shirt') ||
                sectionId.includes('go-pass')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.sales.push(p);
                });
                sectionContent.lists.forEach(list => {
                    list.forEach(item => tourData.sales.push(item));
                });
            }

            // Features - "what's new" catch-all for remaining feature sections
            if (sectionId.includes('experience-the') || sectionId.includes('new-music') ||
                sectionId.includes('diancie') && sectionId.includes('debut')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.whatsNew.push(p);
                });
            }
        }

        // ── Cleanup: remove empty optional fields ──────────────────────
        // Note: keep costumedPokemon even if empty to overwrite stale data
        if (tourData.megaDebuts.length === 0) delete tourData.megaDebuts;
        if (!tourData.branchingResearch || 
            (tourData.branchingResearch.paths.length === 0 && tourData.branchingResearch.description.length === 0)) {
            delete tourData.branchingResearch;
        }
        if (!tourData.routes) delete tourData.routes;
        if (tourData.timedResearchRegions.length === 0) delete tourData.timedResearchRegions;
        if (tourData.specialBackgrounds.length === 0) delete tourData.specialBackgrounds;
        if (tourData.eventLocations.length === 0) delete tourData.eventLocations;
        if (tourData.eventTags.length === 0) delete tourData.eventTags;
        if (tourData.sales.length === 0) delete tourData.sales;
        if (tourData.whatsNew.length === 0) delete tourData.whatsNew;
        if (Object.keys(tourData.megaRaidSchedule).length === 0) delete tourData.megaRaidSchedule;

        if (tourData.eventInfo.name || Object.keys(tourData.habitats).length > 0) {
            await writeTempFile(id, 'pokemon-go-tour', tourData);
        }
    } catch (err) {
        await handleScraperError(err, id, 'pokemon-go-tour', bkp, 'gotour');
    }
}

module.exports = { get };
