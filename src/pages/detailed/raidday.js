/**
 * @fileoverview Raid Day event scraper.
 * Extracts raid day information including featured bosses, exclusive attacks,
 * ticket bonuses, and special mechanics like fusion.
 * @module pages/detailed/raidday
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractRaidInfo, 
    extractBonuses, 
    extractSection, 
    getSectionHeaders,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} RaidDayRaids
 * @property {Object[]} fiveStar - 5-star raid bosses
 * @property {Object[]} mega - Mega raid bosses
 * @property {Object[]} other - Other tier raid bosses
 */

/**
 * @typedef {Object} RaidDayData
 * @property {Object[]} featured - Featured raid boss Pokemon
 * @property {string[]} featuredAttacks - Exclusive move descriptions
 * @property {RaidDayRaids} raids - Raid bosses by tier
 * @property {Object[]} shinies - Shiny-eligible Pokemon
 * @property {Object[]} bonuses - Active event bonuses
 * @property {string[]} ticketBonuses - Ticket-holder exclusive bonuses
 * @property {number|null} ticketPrice - Ticket price in USD
 * @property {string} alternationPattern - Boss rotation schedule
 * @property {string[]} specialMechanics - Special features (fusion, mega, etc.)
 */

/**
 * Scrapes Raid Day event data from LeekDuck.
 * Comprehensive extraction of raid day features including alternating
 * bosses, featured exclusive attacks, free and ticketed bonuses,
 * and special mechanics like fusion or mega evolution.
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
 * await get('https://leekduck.com/events/raid-day-january/', 'raid-day-january', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const raidDayData = {
            featured: [],
            featuredAttacks: [],
            raids: {
                fiveStar: [],
                mega: [],
                other: []
            },
            shinies: [],
            bonuses: [],
            ticketBonuses: [],
            ticketPrice: null,
            alternationPattern: '',
            specialMechanics: []
        };

        // Extract raid info
        const raidInfo = await extractRaidInfo(doc);
        raidDayData.raids.fiveStar = raidInfo.tiers.fiveStar;
        raidDayData.raids.mega = raidInfo.tiers.mega;
        raidDayData.shinies = raidInfo.shinies;
        if (raidInfo.bosses.length > 0) {
            raidDayData.featured = raidInfo.bosses;
        }

        // Extract bonuses
        const bonusData = await extractBonuses(doc);
        raidDayData.bonuses = bonusData.bonuses;

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Featured attacks
            if (sectionId.includes('attack')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Charged Attack') || p.includes('Fast Attack')) {
                        raidDayData.featuredAttacks.push(p);
                    }
                });
            }

            // Ticket info
            if (sectionId.includes('ticket')) {
                sectionContent.paragraphs.forEach(p => {
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        raidDayData.ticketPrice = priceInfo.price;
                    }
                    raidDayData.ticketBonuses.push(p);
                });
                sectionContent.lists.forEach(list => {
                    raidDayData.ticketBonuses.push(...list);
                });
            }

            // Featured pokemon
            if (sectionId.includes('featured')) {
                raidDayData.featured.push(...sectionContent.pokemon);
                // Look for alternation pattern
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('alternate') || p.includes('half hour')) {
                        raidDayData.alternationPattern = p;
                    }
                });
            }

            // Special mechanics (fusion, mega evolution, etc.)
            if (sectionId.includes('fusion') || sectionId.includes('mega') || sectionId.includes('special')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) raidDayData.specialMechanics.push(p);
                });
                sectionContent.lists.forEach(list => {
                    raidDayData.specialMechanics.push(...list);
                });
            }

            // 5-star raids section
            if (sectionId.includes('5-star') || sectionId.includes('five-star')) {
                raidDayData.raids.fiveStar.push(...sectionContent.pokemon);
            }
        }

        if (raidDayData.featured.length > 0 || raidDayData.raids.fiveStar.length > 0) {
            await writeTempFile(id, 'raid-day', raidDayData);
        }
    } catch (err) {
        await handleScraperError(err, id, 'raid-day', bkp, 'raidday');
    }
}

module.exports = { get };
