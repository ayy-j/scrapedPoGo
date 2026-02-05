/**
 * @fileoverview Research event scraper (Special/Masterwork Research).
 * Extracts research tasks, rewards, promo codes, and pricing for
 * Special Research, Masterwork Research, and paid research events.
 * @module pages/detailed/research
 */

const { 
    writeTempFile, 
    handleScraperError,
    extractResearchTasks, 
    extractSection, 
    getSectionHeaders,
    extractPromoCodes,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} ResearchAvailability
 * @property {string} start - Start date/time description
 * @property {string} end - End date/time description
 */

/**
 * @typedef {Object} ResearchData
 * @property {string} name - Research story name from page title
 * @property {"special"|"masterwork"|"timed"} researchType - Type of research
 * @property {boolean} isPaid - Whether this research requires purchase
 * @property {number|null} price - Price in USD if paid, null otherwise
 * @property {string} description - Research description
 * @property {Object[]} tasks - Research task steps or individual tasks
 * @property {string[]} rewards - List of rewards
 * @property {Object[]} encounters - Pokemon encounter rewards
 * @property {string[]} promoCodes - Extracted promo codes from page links
 * @property {boolean} expires - Whether the research expires
 * @property {string} webStoreInfo - Web store purchase information
 */

/**
 * Scrapes research event data from LeekDuck.
 * Extracts comprehensive research information including structured tasks,
 * rewards, promo codes, pricing for paid research, and availability windows.
 * Also writes a separate file for promo codes if found.
 * 
 * @async
 * @function get
 * @param {string} url - Full URL to the event page
 * @param {string} id - Event ID (URL slug)
 * @param {Object[]} bkp - Backup data array for fallback on scraping failure
 * @returns {Promise<void>} Writes temp file(s) on success
 * @throws {Error} Falls back to backup data on failure
 * 
 * @example
 * await get('https://leekduck.com/events/masterwork-research-mew/', 'masterwork-research-mew', backupData);
 * // Creates: data/temp/masterwork-research-mew.json
 * // May also create: data/temp/masterwork-research-mew_codes.json
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;

        const researchData = {
            name: '',
            researchType: 'special',
            isPaid: false,
            price: null,
            description: '',
            tasks: [],
            rewards: [],
            encounters: [],
            promoCodes: [],
            expires: false,
            webStoreInfo: ''
        };

        // Get research name from title
        const title = doc.querySelector('h1');
        if (title) {
            researchData.name = title.textContent?.trim() || '';
            if (researchData.name.toLowerCase().includes('masterwork')) {
                researchData.researchType = 'masterwork';
            } else if (researchData.name.toLowerCase().includes('timed')) {
                researchData.researchType = 'timed';
            }
        }

        // Extract structured research using shared utility
        const structuredResearch = await extractResearchTasks(doc, researchData.researchType);
        if (structuredResearch.steps.length > 0) {
            researchData.tasks = structuredResearch.steps;
        } else {
            researchData.tasks = structuredResearch.tasks;
        }
        researchData.rewards = structuredResearch.rewards;

        // Extract promo codes using shared utility
        researchData.promoCodes = extractPromoCodes(doc);

        // Process sections for additional data
        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Research sections (not field research)
            if (sectionId.includes('research') && !sectionId.includes('field')) {
                sectionContent.paragraphs.forEach(p => {
                    // Check for pricing
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        researchData.isPaid = true;
                        researchData.price = priceInfo.price;
                    }

                    // Check expiration
                    if (p.toLowerCase().includes('does not expire')) {
                        researchData.expires = false;
                    } else if (p.toLowerCase().includes('expire')) {
                        researchData.expires = true;
                    }

                    // Description (first non-price paragraph)
                    if (!researchData.description && p.trim() && !p.includes('US$')) {
                        researchData.description = p;
                    }
                });

                // List-based rewards
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        researchData.rewards.push(item);
                    });
                });

                // Pokemon encounters
                researchData.encounters.push(...sectionContent.pokemon);
            }

            // Web store info
            if (sectionId.includes('web-store') || sectionId.includes('pokemon-go-web-store')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) researchData.webStoreInfo += p + ' ';
                });
            }

            // Sales section
            if (sectionId === 'sales') {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) researchData.webStoreInfo += p + ' ';
                });
            }
        }

        researchData.webStoreInfo = researchData.webStoreInfo.trim();

        // Write data if we have meaningful content
        if (researchData.name || researchData.tasks.length > 0 || researchData.promoCodes.length > 0) {
            writeTempFile(id, 'research', researchData);
        }

        // Write promo codes separately if found
        if (researchData.promoCodes.length > 0) {
            writeTempFile(id, 'promo-codes', researchData.promoCodes, '_codes');
        }
    } catch (err) {
        handleScraperError(err, id, 'research', bkp, 'research');
    }
}

module.exports = { get };
