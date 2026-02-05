/**
 * @fileoverview Timed Research event scraper.
 * Extracts timed research tasks, rewards, availability window,
 * and pricing for ticketed research.
 * @module pages/detailed/timedresearch
 */

const { 
    writeTempFile, 
    handleScraperError,
    extractResearchTasks, 
    extractSection, 
    getSectionHeaders,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} TimedAvailability
 * @property {string} start - Start date/time description
 * @property {string} end - End date/time description
 */

/**
 * @typedef {Object} TimedResearchData
 * @property {string} name - Research name from page title
 * @property {string} description - Research description
 * @property {boolean} isPaid - Whether this research requires purchase
 * @property {number|null} price - Price in USD if paid, null otherwise
 * @property {Object[]} tasks - Research task steps or individual tasks
 * @property {string[]} rewards - List of rewards
 * @property {Object[]} encounters - Pokemon encounter rewards
 * @property {TimedAvailability} availability - Time window for completion
 */

/**
 * Scrapes Timed Research event data from LeekDuck.
 * Extracts time-limited research including tasks, rewards, encounter
 * Pokemon, availability windows, and pricing for ticketed content.
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
 * await get('https://leekduck.com/events/timed-research-furfrou/', 'timed-research-furfrou', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const timedResearchData = {
            name: '',
            description: '',
            isPaid: false,
            price: null,
            tasks: [],
            rewards: [],
            encounters: [],
            availability: {
                start: '',
                end: ''
            }
        };

        // Get title
        const title = doc.querySelector('h1');
        if (title) {
            timedResearchData.name = title.textContent?.trim() || '';
        }

        // Try to extract structured research
        const researchData = await extractResearchTasks(doc, 'timed');
        timedResearchData.tasks = researchData.tasks;
        timedResearchData.rewards = researchData.rewards;
        if (researchData.steps.length > 0) {
            timedResearchData.tasks = researchData.steps;
        }

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Main timed research section (usually named after the event)
            if (sectionId.includes('timed-research') || sectionId.includes('research')) {
                sectionContent.paragraphs.forEach(p => {
                    // Check for pricing
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        timedResearchData.isPaid = true;
                        timedResearchData.price = priceInfo.price;
                    }

                    // Check for dates
                    const dateMatch = p.match(/(\w+day,\s+\w+\s+\d+.*?(?:local time|p\.m\.|a\.m\.))/gi);
                    if (dateMatch) {
                        if (!timedResearchData.availability.start) {
                            timedResearchData.availability.start = dateMatch[0];
                        }
                        if (dateMatch[1]) {
                            timedResearchData.availability.end = dateMatch[1];
                        }
                    }

                    // Description
                    if (!timedResearchData.description && p.trim() && !p.includes('US$')) {
                        timedResearchData.description = p;
                    }
                });

                // Encounter rewards
                timedResearchData.encounters.push(...sectionContent.pokemon);

                // List-based rewards
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        timedResearchData.rewards.push(item);
                    });
                });
            }
        }

        if (timedResearchData.name || timedResearchData.tasks.length > 0 || timedResearchData.encounters.length > 0) {
            writeTempFile(id, 'timed-research', timedResearchData);
        }
    } catch (err) {
        handleScraperError(err, id, 'timed-research', bkp, 'timedresearch');
    }
}

module.exports = { get };
