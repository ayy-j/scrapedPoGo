/**
 * @fileoverview Season event scraper.
 * Extracts comprehensive seasonal data including bonuses, spawns, eggs,
 * research, community days, and seasonal features.
 * @module pages/detailed/season
 */

const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList,
    extractEggPools
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} SeasonEggs
 * @property {Object[]} 2km - 2km egg pool
 * @property {Object[]} 5km - 5km egg pool
 * @property {Object[]} 7km - 7km egg pool (Gift eggs)
 * @property {Object[]} 10km - 10km egg pool
 * @property {Object[]} 12km - 12km egg pool (Strange eggs)
 * @property {Object[]} route - Route egg pool
 * @property {Object[]} adventure - Adventure Sync egg pool
 */

/**
 * @typedef {Object} SeasonData
 * @property {string} name - Season name from page title
 * @property {string[]} bonuses - Seasonal bonuses
 * @property {Object[]} spawns - Wild Pokemon spawns
 * @property {SeasonEggs} eggs - Egg pools by distance type
 * @property {Object[]} researchBreakthrough - Research breakthrough rewards
 * @property {(Object|string)[]} specialResearch - Special research info
 * @property {string[]} masterworkResearch - Masterwork research descriptions
 * @property {string[]} communityDays - Scheduled Community Days
 * @property {string[]} features - Season feature descriptions
 * @property {string} goBattleLeague - GBL season info
 * @property {string[]} goPass - GO Pass information
 * @property {(Object|string)[]} pokemonDebuts - New Pokemon debuts
 * @property {(Object|string)[]} maxPokemonDebuts - New Max Pokemon debuts
 */

/**
 * Scrapes Season event data from LeekDuck.
 * Comprehensive extraction of seasonal content including bonuses,
 * wild spawns, egg pools, various research types, community day
 * schedule, and new Pokemon/feature debuts.
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
 * await get('https://leekduck.com/events/season-of-adventures-abound/', 'season-of-adventures-abound', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const seasonData = {
            name: '',
            bonuses: [],
            spawns: [],
            eggs: {
                '2km': [],
                '5km': [],
                '7km': [],
                '10km': [],
                '12km': [],
                'route': [],
                'adventure': []
            },
            researchBreakthrough: [],
            specialResearch: [],
            masterworkResearch: [],
            communityDays: [],
            features: [],
            goBattleLeague: '',
            goPass: [],
            pokemonDebuts: [],
            maxPokemonDebuts: []
        };

        // Get season name from title
        const title = doc.querySelector('h1');
        if (title) {
            seasonData.name = title.textContent?.trim() || '';
        }

        // Extract eggs using shared utility
        seasonData.eggs = await extractEggPools(doc);

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Seasonal bonuses
            if (sectionId.includes('bonus')) {
                sectionContent.lists.forEach(list => {
                    seasonData.bonuses.push(...list);
                });
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim() && !p.includes('following bonuses')) {
                        seasonData.bonuses.push(p);
                    }
                });
            }

            // Spawns / Wild encounters
            if (sectionId.includes('spawn') || sectionId.includes('wild')) {
                seasonData.spawns.push(...sectionContent.pokemon);
            }

            // Research Breakthrough
            if (sectionId.includes('breakthrough')) {
                seasonData.researchBreakthrough.push(...sectionContent.pokemon);
            }

            // Special Research
            if (sectionId.includes('special-research') || 
                (sectionId.includes('research') && !sectionId.includes('breakthrough') && !sectionId.includes('masterwork'))) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) seasonData.specialResearch.push(p);
                });
                seasonData.specialResearch.push(...sectionContent.pokemon);
            }

            // Masterwork Research
            if (sectionId.includes('masterwork')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) seasonData.masterworkResearch.push(p);
                });
            }

            // Community Days
            if (sectionId.includes('community')) {
                sectionContent.lists.forEach(list => {
                    seasonData.communityDays.push(...list);
                });
            }

            // Features / New Pokemon
            if (sectionId.includes('new') || sectionId.includes('debut') || sectionId.includes('discover')) {
                if (sectionId.includes('max')) {
                    seasonData.maxPokemonDebuts.push(...sectionContent.pokemon);
                    sectionContent.paragraphs.forEach(p => {
                        if (p.trim()) seasonData.maxPokemonDebuts.push(p);
                    });
                } else {
                    seasonData.pokemonDebuts.push(...sectionContent.pokemon);
                    sectionContent.paragraphs.forEach(p => {
                        if (p.trim()) seasonData.pokemonDebuts.push(p);
                    });
                }
            }

            // GO Battle League
            if (sectionId.includes('battle-league')) {
                seasonData.goBattleLeague = sectionContent.paragraphs.join(' ');
            }

            // GO Pass
            if (sectionId === 'go-pass') {
                sectionContent.lists.forEach(list => {
                    seasonData.goPass.push(...list);
                });
            }
        }

        if (seasonData.name || seasonData.bonuses.length > 0) {
            writeTempFile(id, 'season', seasonData);
        }
    } catch (err) {
        handleScraperError(err, id, 'season', bkp, 'season');
    }
}

module.exports = { get };
