/**
 * @fileoverview Community Day event scraper.
 * Extracts comprehensive Community Day data including spawns, bonuses,
 * shinies, special research, featured attacks, and ticketed content.
 * @module pages/detailed/communityday
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractPokemonList, 
    extractBonuses, 
    extractResearchTasks,
    extractSection,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} FeaturedAttack
 * @property {string} description - Description of the exclusive move
 * @property {string[]} stats - Array of move statistics and effects
 */

/**
 * @typedef {Object} Photobomb
 * @property {string} description - Description of photobomb feature
 * @property {Object[]} pokemon - Pokemon that can photobomb
 */

/**
 * @typedef {Object} TicketedResearch
 * @property {number} price - Ticket price in USD
 * @property {string} description - Description of ticketed content
 */

/**
 * @typedef {Object} CommunityDayData
 * @property {Object[]} spawns - Featured wild spawns
 * @property {Object[]} bonuses - Active bonuses during the event
 * @property {string[]} bonusDisclaimers - Disclaimers for bonuses (e.g., regional restrictions)
 * @property {Object[]} shinies - Shiny Pokemon available
 * @property {Object[]} specialresearch - Special research task steps
 * @property {FeaturedAttack|null} featuredAttack - Exclusive move information
 * @property {Photobomb|null} photobomb - Photobomb feature details
 * @property {Object[]} pokestopShowcases - PokeStop Showcase Pokemon
 * @property {Object[]} fieldResearchTasks - Event-specific field research
 * @property {string|null} lureModuleBonus - Lure module bonus description
 * @property {TicketedResearch|null} ticketedResearch - Paid research ticket info
 */

/**
 * Scrapes Community Day event data from LeekDuck.
 * Comprehensive extraction of all Community Day features including spawns,
 * bonuses, shinies, special research, featured attacks, photobombs,
 * PokeStop showcases, field research, and ticketed content.
 * 
 * @async
 * @function get
 * @param {string} url - Full URL to the event page
 * @param {string} id - Event ID (URL slug)
 * @param {Object[]} bkp - Backup data array for fallback on scraping failure
 * @returns {Promise<void>} Writes temp file on success
 * @throws {Error} Falls back to backup data on failure
 * 
 * @example
 * await get('https://leekduck.com/events/january-2024-community-day/', 'january-2024-community-day', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;

        const commday = {
            spawns: [],
            bonuses: [],
            bonusDisclaimers: [],
            shinies: [],
            specialresearch: [],
            // Enhanced fields from EXAMPLE_detailed
            featuredAttack: null,
            photobomb: null,
            pokestopShowcases: [],
            fieldResearchTasks: [],
            lureModuleBonus: null,
            ticketedResearch: null
        };

        const pageContent = doc.querySelector('.page-content');
        let lastHeader = '';

        // Iterate through page content sections
        for (const n of pageContent?.childNodes || []) {
            if (n.className?.includes('event-section-header')) {
                lastHeader = n.id;
            }

            // Spawns
            if (lastHeader === 'spawns' && n.className === 'pkmn-list-flex') {
                commday.spawns.push(...(await extractPokemonList(n)));
            }
            // Shinies
            else if (lastHeader === 'shiny' && n.className === 'pkmn-list-flex') {
                commday.shinies.push(...(await extractPokemonList(n)));
            }
            // Featured Attack
            else if (lastHeader === 'featured-attack') {
                if (n.tagName === 'P') {
                    if (!commday.featuredAttack) {
                        commday.featuredAttack = { description: n.textContent.trim(), stats: [] };
                    }
                } else if (n.tagName === 'UL' && commday.featuredAttack) {
                    n.querySelectorAll('li').forEach(li => {
                        commday.featuredAttack.stats.push(li.textContent.trim());
                    });
                }
            }
            // Photobomb
            else if (lastHeader === 'photobomb') {
                if (n.tagName === 'P') {
                    if (!commday.photobomb) {
                        commday.photobomb = { description: n.textContent.trim(), pokemon: [] };
                    }
                } else if (n.className === 'pkmn-list-flex' && commday.photobomb) {
                    commday.photobomb.pokemon.push(...(await extractPokemonList(n)));
                }
            }
            // PokéStop Showcases
            else if ((lastHeader === 'pokestop-showcases' || lastHeader === 'pokéstop-showcases') && 
                     n.className === 'pkmn-list-flex') {
                commday.pokestopShowcases.push(...(await extractPokemonList(n)));
            }
            // Lure Module Bonus
            else if (lastHeader === 'lure-module-bonus' && n.tagName === 'P') {
                if (!commday.lureModuleBonus) {
                    commday.lureModuleBonus = n.textContent.trim();
                }
            }
            // Field Research Tasks
            else if (lastHeader === 'field-research-tasks') {
                if (n.tagName === 'P') {
                    commday.fieldResearchTasks.push({ type: 'info', text: n.textContent.trim() });
                } else if (n.tagName === 'UL') {
                    n.querySelectorAll('li').forEach(li => {
                        commday.fieldResearchTasks.push({ type: 'task', text: li.textContent.trim() });
                    });
                } else if (n.className === 'pkmn-list-flex') {
                    const pokemon = await extractPokemonList(n);
                    commday.fieldResearchTasks.push({ type: 'encounters', pokemon });
                }
            }
        }

        // Extract bonuses using shared utility
        const bonusData = await extractBonuses(doc);
        commday.bonuses = bonusData.bonuses;
        commday.bonusDisclaimers = bonusData.disclaimers;

        // Extract special research using shared utility
        const researchData = await extractResearchTasks(doc, 'special');
        if (researchData.steps.length > 0) {
            commday.specialresearch = researchData.steps;
        }

        // Check for ticketed/paid research
        const pageText = pageContent?.textContent || '';
        if (pageText.includes('US$') && pageText.includes('Special Research')) {
            const priceInfo = extractPrice(pageText);
            if (priceInfo) {
                commday.ticketedResearch = {
                    price: priceInfo.price,
                    description: ''
                };
                // Try to find ticketed research description
                const ticketedSection = await extractSection(doc, 'community-day-classic');
                if (ticketedSection.paragraphs.length > 0) {
                    commday.ticketedResearch.description = ticketedSection.paragraphs.join(' ');
                }
            }
        }

        // Only write if we have meaningful data
        if (commday.spawns.length > 0 || commday.bonuses.length > 0 || commday.specialresearch.length > 0) {
            writeTempFile(id, 'community-day', commday);
        }
    } catch (err) {
        handleScraperError(err, id, 'community-day', bkp, 'communityday');
    }
}

module.exports = { get };
