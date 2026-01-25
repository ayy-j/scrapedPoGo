/**
 * @fileoverview Research Breakthrough event scraper.
 * Extracts featured breakthrough reward Pokemon from LeekDuck event pages.
 * @module pages/detailed/breakthrough
 */

const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} BreakthroughReward
 * @property {string} name - Featured Pokemon name
 * @property {boolean} canBeShiny - Whether the reward can be shiny
 * @property {string} image - URL to Pokemon image
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {Object[]} list - Full list of possible breakthrough Pokemon
 */

/**
 * Scrapes Research Breakthrough event data from LeekDuck.
 * Extracts the featured breakthrough reward Pokemon including shiny availability
 * and image dimensions.
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
 * await get('https://leekduck.com/events/research-breakthrough-jan-2024/', 'research-breakthrough-jan-2024', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const content = doc.querySelector('.pkmn-list-flex');
        const pokemonList = await extractPokemonList(content);
        
        if (pokemonList.length === 0) {
            throw new Error('No pokemon found in breakthrough page');
        }

        const reward = {
            name: pokemonList[0].name,
            canBeShiny: pokemonList[0].canBeShiny,
            image: pokemonList[0].image,
            imageWidth: pokemonList[0].imageWidth,
            imageHeight: pokemonList[0].imageHeight,
            list: pokemonList
        };

        writeTempFile(id, 'research-breakthrough', reward);
    } catch (err) {
        handleScraperError(err, id, 'research-breakthrough', bkp, 'breakthrough');
    }
}

module.exports = { get };
