/**
 * @fileoverview GO Battle League event scraper.
 * Extracts league information including brackets, CP caps,
 * type restrictions, and special rules.
 * @module pages/detailed/gobattleleague
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} LeagueInfo
 * @property {string} name - League name (e.g., "Great League", "Little Jungle Cup")
 * @property {number|null} cpCap - Maximum CP allowed (e.g., 1500, 2500) or null for no limit
 * @property {string[]} typeRestrictions - Required Pokemon types (empty for unrestricted)
 * @property {string[]} rules - Array of league-specific rules and restrictions
 */

/**
 * @typedef {Object} GBLData
 * @property {LeagueInfo[]} leagues - Array of active league configurations
 */

/**
 * Scrapes GO Battle League event data from LeekDuck.
 * Extracts information about active leagues including CP caps,
 * type restrictions, and special rules for themed cups.
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
 * await get('https://leekduck.com/events/go-battle-league-jan/', 'go-battle-league-jan', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const gblData = { leagues: [] };

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);
            
            const league = {
                name: sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                cpCap: null,
                typeRestrictions: [],
                rules: []
            };

            sectionContent.lists.forEach(list => {
                list.forEach(item => {
                    // CP cap detection
                    const cpMatch = item.match(/(\d{1,4}(?:,\d{3})?)\s*CP/i);
                    if (cpMatch) {
                        league.cpCap = parseInt(cpMatch[1].replace(',', ''));
                    }
                    
                    // Type restriction detection
                    const typeMatch = item.match(/Only\s+([\w,\s-]+)-type/i);
                    if (typeMatch) {
                        league.typeRestrictions = typeMatch[1].split(/,\s*and\s*|,\s*/).map(t => t.trim().replace(/-$/, ''));
                    }
                    
                    league.rules.push(item);
                });
            });

            sectionContent.paragraphs.forEach(p => {
                if (p.trim()) league.rules.push(p);
            });

            if (league.rules.length > 0) {
                gblData.leagues.push(league);
            }
        }

        if (gblData.leagues.length > 0) {
            writeTempFile(id, 'go-battle-league', gblData);
        }
    } catch (err) {
        handleScraperError(err, id, 'go-battle-league', bkp, 'gobattleleague');
    }
}

module.exports = { get };
