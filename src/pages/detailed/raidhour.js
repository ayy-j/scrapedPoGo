/**
 * @fileoverview Raid Hour event scraper.
 * Lightweight scraper for weekly Raid Hour events featuring a single boss.
 * @module pages/detailed/raidhour
 */

const { writeTempFile, handleScraperError, extractPokemonList, extractBonuses, getJSDOM } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} RaidHourData
 * @property {Object|null} featured - Featured raid boss Pokemon with name, image, shiny info
 * @property {boolean} canBeShiny - Whether the featured boss can be shiny
 * @property {Object[]} bonuses - Active bonuses during raid hour
 * @property {string[]} bonusDisclaimers - Disclaimers for bonuses
 */

/**
 * Scrapes Raid Hour event data from LeekDuck.
 * Lightweight extraction of the single featured raid boss for the
 * weekly Raid Hour event.
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
 * await get('https://leekduck.com/events/raid-hour-jan-17/', 'raid-hour-jan-17', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const raidHourData = {
            featured: null,
            canBeShiny: false,
            bonuses: [],
            bonusDisclaimers: []
        };

        const pkmnList = doc.querySelector('.pkmn-list-flex');
        if (pkmnList) {
            const pokemon = await extractPokemonList(pkmnList);
            if (pokemon.length > 0) {
                raidHourData.featured = pokemon[0];
                raidHourData.canBeShiny = pokemon[0].canBeShiny;
            }
        }

        // Fallback: try to get name from title
        if (!raidHourData.featured) {
            const eventTitle = doc.querySelector('.event-pokemon-name, h1');
            if (eventTitle) {
                raidHourData.featured = {
                    name: eventTitle.textContent?.replace('Raid Hour', '').trim() || '',
                    image: '',
                    canBeShiny: false
                };
            }
        }

        // Extract bonuses
        const bonusData = await extractBonuses(doc);
        raidHourData.bonuses = bonusData.bonuses;
        raidHourData.bonusDisclaimers = bonusData.disclaimers;

        if (raidHourData.featured) {
            writeTempFile(id, 'raid-hour', raidHourData);
        }
    } catch (err) {
        handleScraperError(err, id, 'raid-hour', bkp, 'raidhour');
    }
}

module.exports = { get };
