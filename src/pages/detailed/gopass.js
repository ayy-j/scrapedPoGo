/**
 * @fileoverview GO Pass event scraper.
 * Extracts GO Pass season information including tier rewards,
 * point tasks, milestone bonuses, and pricing tiers.
 * @module pages/detailed/gopass
 */

const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} PointTask
 * @property {string} task - Task description
 * @property {number} points - Points awarded for completion
 */

/**
 * @typedef {Object} MilestoneBonus
 * @property {string} tier - Tier identifier (e.g., "Tier 1 - Rank 5")
 * @property {string} bonus - Bonus description
 */

/**
 * @typedef {Object} GOPassData
 * @property {string} description - GO Pass overview description
 * @property {{deluxe: number|null, deluxePlus: number|null}} pricing - Pricing in USD
 * @property {Object[]} tiers - Tier progression information
 * @property {PointTask[]} pointTasks - Tasks that award points
 * @property {{free: Array, deluxe: Array}} rewards - Rewards by tier
 * @property {MilestoneBonus[]} milestoneBonuses - Milestone completion bonuses
 */

/**
 * Scrapes GO Pass event data from LeekDuck.
 * Extracts comprehensive GO Pass information including tier bonuses,
 * point tasks with their values, rewards for free and deluxe tiers,
 * and milestone bonuses.
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
 * await get('https://leekduck.com/events/go-pass-season-1/', 'go-pass-season-1', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const goPassData = {
            description: '',
            pricing: {
                deluxe: null,
                deluxePlus: null
            },
            tiers: [],
            pointTasks: [],
            rewards: {
                free: [],
                deluxe: []
            },
            milestoneBonuses: []
        };

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // GO Pass description/point tasks
            if (sectionId === 'go-pass') {
                sectionContent.paragraphs.forEach(p => {
                    if (!goPassData.description) goPassData.description = p;
                });
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        const ptsMatch = item.match(/(.+?)\s*-\s*(\d+)\s*PTS/i);
                        if (ptsMatch) {
                            goPassData.pointTasks.push({
                                task: ptsMatch[1].trim(),
                                points: parseInt(ptsMatch[2])
                            });
                        }
                    });
                });
            }

            // Pricing info
            if (sectionId.includes('go-pass') && sectionId.includes('deluxe')) {
                sectionContent.paragraphs.forEach(p => {
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        if (sectionId.includes('10-ranks') || p.includes('10 Ranks')) {
                            goPassData.pricing.deluxePlus = priceInfo.price;
                        } else {
                            goPassData.pricing.deluxe = priceInfo.price;
                        }
                    }
                });
            }

            // Rewards
            if (sectionId.includes('reward') || sectionId.includes('featured')) {
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        if (item.includes('Deluxe') || item.includes('upgrade')) {
                            goPassData.rewards.deluxe.push(item);
                        } else {
                            goPassData.rewards.free.push(item);
                        }
                    });
                });
                sectionContent.pokemon.forEach(p => {
                    goPassData.rewards.free.push(p);
                });
            }

            // Milestone bonuses
            if (sectionId.includes('milestone')) {
                let currentTier = '';
                sectionContent.paragraphs.forEach(p => {
                    const tierMatch = p.match(/Tier\s*(\d+)\s*[–-]\s*Rank\s*(\d+)/i);
                    if (tierMatch) {
                        currentTier = `Tier ${tierMatch[1]} - Rank ${tierMatch[2]}`;
                    }
                });
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        goPassData.milestoneBonuses.push({
                            tier: currentTier,
                            bonus: item
                        });
                    });
                });
            }
        }

        if (goPassData.pointTasks.length > 0 || goPassData.rewards.free.length > 0) {
            writeTempFile(id, 'go-pass', goPassData);
        }
    } catch (err) {
        handleScraperError(err, id, 'go-pass', bkp, 'gopass');
    }
}

module.exports = { get };
