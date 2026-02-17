/**
 * @fileoverview Max Mondays event scraper.
 * Extracts featured weekly Dynamax Pokemon and associated bonuses.
 * @module pages/detailed/maxmondays
 */

const { writeTempFile, handleScraperError, extractPokemonList, getJSDOM } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} MaxMondaysData
 * @property {Object|null} featured - Featured Dynamax Pokemon for the week
 * @property {string} bonus - Weekly bonus description
 */

/**
 * Scrapes Max Mondays event data from LeekDuck.
 * Lightweight extraction of the weekly featured Dynamax Pokemon
 * and any associated bonus.
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
 * await get('https://leekduck.com/events/max-mondays-jan-13/', 'max-mondays-jan-13', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const maxMondaysData = {
            featured: null,
            bonus: ''
        };

        const pkmnList = doc.querySelector('.pkmn-list-flex');
        if (pkmnList) {
            const pokemon = await extractPokemonList(pkmnList);
            if (pokemon.length > 0) {
                maxMondaysData.featured = pokemon[0];
            }
        }

        const eventDesc = doc.querySelector('.event-description');
        if (eventDesc) {
            const strong = eventDesc.querySelector('strong');
            if (strong) {
                maxMondaysData.bonus = strong.textContent.trim();
            }
        }

        if (maxMondaysData.featured) {
            await writeTempFile(id, 'max-mondays', maxMondaysData);
        }
    } catch (err) {
        await handleScraperError(err, id, 'max-mondays', bkp, 'maxmondays');
    }
}

module.exports = { get };
