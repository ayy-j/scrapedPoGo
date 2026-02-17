/**
 * @fileoverview PokeStop Showcase event scraper.
 * Extracts featured Pokemon for showcase competitions at PokeStops.
 * @module pages/detailed/pokestopshowcase
 */

const { writeTempFile, handleScraperError, extractPokemonList, extractSection, getJSDOM } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} ShowcaseData
 * @property {Object[]} featured - Pokemon featured in showcases
 * @property {string} description - Showcase event description
 */

/**
 * Scrapes PokeStop Showcase event data from LeekDuck.
 * Extracts Pokemon that will be featured in PokeStop showcase
 * competitions during the event period.
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
 * await get('https://leekduck.com/events/pokestop-showcase-jan/', 'pokestop-showcase-jan', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const showcaseData = {
            featured: [],
            description: ''
        };

        const pkmnLists = doc.querySelectorAll('.pkmn-list-flex');
        for (const list of pkmnLists) {
            showcaseData.featured.push(...(await extractPokemonList(list)));
        }

        const eventDesc = doc.querySelector('.event-description');
        if (eventDesc) {
            showcaseData.description = eventDesc.textContent?.trim() || '';
        }

        const showcaseSection = await extractSection(doc, 'pokestop-showcases');
        if (showcaseSection.paragraphs.length > 0) {
            showcaseData.description = showcaseSection.paragraphs[0];
        }
        showcaseData.featured.push(...showcaseSection.pokemon);

        if (showcaseData.featured.length > 0) {
            await writeTempFile(id, 'pokestop-showcase', showcaseData);
        }
    } catch (err) {
        await handleScraperError(err, id, 'pokestop-showcase', bkp, 'pokestopshowcase');
    }
}

module.exports = { get };
