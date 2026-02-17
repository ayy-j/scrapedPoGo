/**
 * @fileoverview Raid Battles event scraper.
 * Extracts raid boss information by tier, shinies, alternation patterns,
 * and featured exclusive attacks.
 * @module pages/detailed/raidbattles
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractRaidInfo, 
    extractPokemonList, 
    extractSection, 
    getSectionHeaders,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} RaidTiers
 * @property {Object[]} mega - Mega raid bosses
 * @property {Object[]} fiveStar - 5-star raid bosses
 * @property {Object[]} threeStar - 3-star raid bosses
 * @property {Object[]} oneStar - 1-star raid bosses
 */

/**
 * @typedef {Object} RaidBattlesData
 * @property {Object[]} bosses - All raid bosses (legacy format)
 * @property {Object[]} shinies - Shiny-eligible bosses
 * @property {RaidTiers} tiers - Bosses organized by tier
 * @property {string} alternationPattern - Boss rotation schedule description
 * @property {string[]} featuredAttacks - Exclusive move descriptions
 */

/**
 * Scrapes Raid Battles event data from LeekDuck.
 * Extracts raid bosses organized by tier, identifies shiny-eligible
 * bosses, captures any alternation/rotation patterns, and notes
 * featured exclusive attacks.
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
 * await get('https://leekduck.com/events/raid-battles-legendaries/', 'raid-battles-legendaries', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;

        const raidboss = {
            bosses: [],
            shinies: [],
            tiers: {
                mega: [],
                fiveStar: [],
                threeStar: [],
                oneStar: []
            },
            alternationPattern: '',
            featuredAttacks: []
        };

        // Use the shared extraction utility for raid info
        const raidInfo = await extractRaidInfo(doc);
        raidboss.tiers = raidInfo.tiers;
        raidboss.shinies = raidInfo.shinies;
        raidboss.bosses = raidInfo.bosses;

        // Fallback: original section-based parsing for bosses if utility didn't find them
        if (raidboss.bosses.length === 0 && raidboss.tiers.fiveStar.length === 0) {
            const pageContent = doc.querySelector('.page-content');
            let lastHeader = '';

            for (const n of pageContent?.childNodes || []) {
                if (n.className?.includes('event-section-header')) {
                    lastHeader = n.id;
                }

                if (lastHeader === 'raids' && n.className === 'pkmn-list-flex') {
                    raidboss.bosses.push(...(await extractPokemonList(n)));
                } else if (lastHeader === 'shiny' && n.className === 'pkmn-list-flex') {
                    raidboss.shinies.push(...(await extractPokemonList(n)));
                }
            }
        }

        // Check for alternation patterns and featured attacks
        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Alternation pattern detection
            if (sectionId.includes('featured') || sectionId.includes('raids')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('alternate') || p.includes('half hour') || p.includes('rotation')) {
                        raidboss.alternationPattern = p;
                    }
                });
            }

            // Featured attacks
            if (sectionId.includes('attack')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Charged Attack') || p.includes('Fast Attack') || p.includes('know')) {
                        raidboss.featuredAttacks.push(p);
                    }
                });
            }
        }

        if (raidboss.bosses.length > 0 || Object.values(raidboss.tiers).some(t => t.length > 0)) {
            await writeTempFile(id, 'raid-battles', raidboss);
        }
    } catch (err) {
        await handleScraperError(err, id, 'raid-battles', bkp, 'raidbattles');
    }
}

module.exports = { get };
