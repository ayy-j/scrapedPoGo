/**
 * @fileoverview Pokemon Spotlight Hour event scraper.
 * Extracts featured Pokemon and bonus information for weekly Spotlight Hours.
 * @module pages/detailed/spotlight
 */

const { writeTempFile, handleScraperError, extractPokemonList, getJSDOM } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} SpotlightData
 * @property {string} name - Featured Pokemon name
 * @property {boolean} canBeShiny - Whether the featured Pokemon can be shiny
 * @property {string} image - URL to Pokemon image
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {string} bonus - Event bonus description (e.g., "2× Catch XP")
 * @property {Object[]} list - Full list of featured Pokemon (usually one)
 */

/**
 * Scrapes Pokemon Spotlight Hour event data from LeekDuck.
 * Extracts the featured Pokemon and the weekly bonus for the
 * Tuesday Spotlight Hour event.
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
 * await get('https://leekduck.com/events/spotlight-hour-jan-21/', 'spotlight-hour-jan-21', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;

        const content = doc.querySelector('.pkmn-list-flex');
        
        // Extract bonus from event description
        const eventDesc = doc.querySelector('.event-description');
        let bonus = '';
        if (eventDesc) {
            const temp = eventDesc.innerHTML;
            const split = temp.split('<strong>');
            if (split.length > 1) {
                bonus = split[split.length - 1].split('</strong>')[0];
            }
        }

        const pokemonList = await extractPokemonList(content);
        
        if (pokemonList.length === 0) {
            throw new Error('No pokemon found in spotlight page');
        }

        const spotlight = {
            name: pokemonList[0].name,
            canBeShiny: pokemonList[0].canBeShiny,
            image: pokemonList[0].image,
            imageWidth: pokemonList[0].imageWidth,
            imageHeight: pokemonList[0].imageHeight,
            bonus,
            list: pokemonList
        };

        writeTempFile(id, 'pokemon-spotlight-hour', spotlight);
    } catch (err) {
        handleScraperError(err, id, 'pokemon-spotlight-hour', bkp, 'spotlight');
    }
}

module.exports = { get };
