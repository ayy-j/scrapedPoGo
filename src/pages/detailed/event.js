/**
 * @fileoverview Generic event type scraper.
 * Handles miscellaneous event types like Winter Weekend, Summer events,
 * and other non-specific event categories.
 * @module pages/detailed/event
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractBonuses, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} EventData
 * @property {Object[]} bonuses - Active event bonuses
 * @property {string[]} bonusDisclaimers - Bonus restriction disclaimers
 * @property {string[]} features - Event feature descriptions
 * @property {Object[]} shinies - Shiny Pokemon available
 * @property {Object[]} spawns - Wild Pokemon spawns
 * @property {Object.<string, Object>} customSections - Dynamically extracted sections
 */

/**
 * Scrapes generic event data from LeekDuck.
 * Handles event types that don't fit specific categories, extracting
 * bonuses, features, shiny info, spawns, and any custom sections
 * present on the event page.
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
 * await get('https://leekduck.com/events/winter-weekend-2024/', 'winter-weekend-2024', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const eventData = {
            bonuses: [],
            bonusDisclaimers: [],
            features: [],
            shinies: [],
            spawns: [],
            customSections: {}
        };

        // Extract bonuses
        const bonusData = await extractBonuses(doc);
        eventData.bonuses = bonusData.bonuses;
        eventData.bonusDisclaimers = bonusData.disclaimers;

        // Extract all sections
        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'bonuses' || sectionId === 'leek-duck' || sectionId === 'graphic') continue;
            
            const sectionContent = await extractSection(doc, sectionId);
            
            if (sectionId === 'shiny' || sectionId.includes('shiny')) {
                eventData.shinies.push(...sectionContent.pokemon);
            } else if (sectionId === 'features') {
                eventData.features = sectionContent.paragraphs;
            } else if (sectionId === 'spawns' || sectionId.includes('wild')) {
                eventData.spawns.push(...sectionContent.pokemon);
            } else {
                // Store any other sections in customSections
                if (sectionContent.paragraphs.length > 0 || 
                    sectionContent.lists.length > 0 || 
                    sectionContent.pokemon.length > 0) {
                    eventData.customSections[sectionId] = sectionContent;
                }
            }
        }

        if (eventData.bonuses.length > 0 || 
            eventData.spawns.length > 0 || 
            Object.keys(eventData.customSections).length > 0) {
            writeTempFile(id, 'event', eventData);
        }
    } catch (err) {
        handleScraperError(err, id, 'event', bkp, 'event');
    }
}

module.exports = { get };
