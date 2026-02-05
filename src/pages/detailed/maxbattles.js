/**
 * @fileoverview Max Battles (Dynamax Weekend) event scraper.
 * Extracts featured Dynamax and Gigantamax boss information and bonuses.
 * @module pages/detailed/maxbattles
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractPokemonList, 
    extractSection, 
    getSectionHeaders,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} MaxBattlesData
 * @property {Object[]} featured - Featured Max Battle Pokemon
 * @property {string[]} bonuses - Active event bonuses
 * @property {Object[]} gigantamax - Gigantamax Pokemon available
 * @property {Object[]} dynamax - Dynamax Pokemon available
 */

/**
 * Scrapes Max Battles event data from LeekDuck.
 * Extracts featured Dynamax/Gigantamax Pokemon, associated bonuses,
 * and categorizes by battle type.
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
 * await get('https://leekduck.com/events/dynamax-weekend/', 'dynamax-weekend', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const maxBattlesData = {
            featured: [],
            bonuses: [],
            gigantamax: [],
            dynamax: []
        };

        const firstPkmnList = doc.querySelector('.pkmn-list-flex');
        if (firstPkmnList) {
            maxBattlesData.featured = await extractPokemonList(firstPkmnList);
        }

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            if (sectionId.includes('gigantamax')) {
                maxBattlesData.gigantamax.push(...sectionContent.pokemon);
            } else if (sectionId.includes('dynamax')) {
                maxBattlesData.dynamax.push(...sectionContent.pokemon);
            } else if (sectionId === 'bonuses') {
                sectionContent.lists.forEach(list => {
                    maxBattlesData.bonuses.push(...list);
                });
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) maxBattlesData.bonuses.push(p);
                });
            }
        }

        if (maxBattlesData.featured.length > 0 || maxBattlesData.gigantamax.length > 0 || maxBattlesData.dynamax.length > 0) {
            writeTempFile(id, 'max-battles', maxBattlesData);
        }
    } catch (err) {
        handleScraperError(err, id, 'max-battles', bkp, 'maxbattles');
    }
}

module.exports = { get };
