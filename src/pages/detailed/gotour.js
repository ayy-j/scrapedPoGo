/**
 * @fileoverview Pokemon GO Tour event scraper.
 * Complex multi-section handler for large-scale in-person events.
 * Extracts habitats, raids, eggs, research, shiny debuts, and ticket add-ons.
 * @module pages/detailed/gotour
 */

const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList, 
    extractRaidInfo, 
    extractResearchTasks,
    extractEggPools,
    extractPrice,
    getJSDOM
} = require('../../utils/scraperUtils');

/**
 * @typedef {Object} EventInfo
 * @property {string} name - Event name from page title
 * @property {string} location - Event venue/city
 * @property {string} dates - Event date range
 * @property {string} time - Event hours
 * @property {number|null} ticketPrice - Base ticket price in USD
 * @property {string} ticketUrl - URL to purchase tickets
 */

/**
 * @typedef {Object} Habitat
 * @property {Object[]} spawns - Pokemon spawning in this habitat
 * @property {Object[]} rareSpawns - Rare Pokemon in this habitat
 */

/**
 * @typedef {Object} ResearchInfo
 * @property {Object[]} field - Field research encounters and info
 * @property {string[]} special - Special research descriptions
 * @property {string[]} timed - Timed research descriptions
 * @property {string[]} masterwork - Masterwork research descriptions
 */

/**
 * @typedef {Object} GOTourData
 * @property {EventInfo} eventInfo - Basic event information
 * @property {string[]} exclusiveBonuses - Ticket-exclusive bonuses
 * @property {string[]} ticketAddOns - Available add-on purchases
 * @property {string[]} whatsNew - New features for this tour
 * @property {Object.<string, Habitat>} habitats - Habitats keyed by name
 * @property {Object[]} incenseEncounters - Incense-exclusive spawns
 * @property {Object} eggs - Egg pools by distance
 * @property {Object} raids - Raid bosses by tier
 * @property {ResearchInfo} research - Research task information
 * @property {Object[]} shinyDebuts - Pokemon with shiny debut
 * @property {Object[]} shinies - All available shinies
 * @property {string[]} sales - Merchandise/sale info
 * @property {Object[]} costumedPokemon - Event-costumed Pokemon
 */

/**
 * Scrapes Pokemon GO Tour event data from LeekDuck.
 * Comprehensive extraction for large-scale in-person events including
 * multiple habitats, raid tiers, egg pools, various research types,
 * shiny debuts, and ticket information.
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
 * await get('https://leekduck.com/events/pokemon-go-tour-sinnoh/', 'pokemon-go-tour-sinnoh', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        
        const tourData = {
            eventInfo: {
                name: '',
                location: '',
                dates: '',
                time: '',
                ticketPrice: null,
                ticketUrl: ''
            },
            exclusiveBonuses: [],
            ticketAddOns: [],
            whatsNew: [],
            habitats: {},
            incenseEncounters: [],
            eggs: {
                '2km': [],
                '5km': [],
                '7km': [],
                '10km': []
            },
            raids: {
                oneStar: [],
                threeStar: [],
                fiveStar: [],
                mega: []
            },
            research: {
                field: [],
                special: [],
                timed: [],
                masterwork: []
            },
            shinyDebuts: [],
            shinies: [],
            sales: [],
            costumedPokemon: []
        };

        // Get event name from title
        const title = doc.querySelector('h1');
        if (title) {
            tourData.eventInfo.name = title.textContent?.trim() || '';
        }

        // Extract eggs using shared utility
        tourData.eggs = await extractEggPools(doc);

        // Extract raid info using shared utility
        const raidInfo = await extractRaidInfo(doc);
        tourData.raids.fiveStar = raidInfo.tiers.fiveStar;
        tourData.raids.mega = raidInfo.tiers.mega;
        tourData.raids.threeStar = raidInfo.tiers.threeStar;
        tourData.raids.oneStar = raidInfo.tiers.oneStar;
        tourData.shinies = raidInfo.shinies;

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Event Overview
            if (sectionId.includes('overview') || sectionId.includes('event-overview')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Location:')) {
                        tourData.eventInfo.location = p.replace('Location:', '').trim();
                    } else if (p.includes('Dates:') || p.includes('Date:')) {
                        tourData.eventInfo.dates = p.replace(/Dates?:/, '').trim();
                    } else if (p.includes('Time:')) {
                        tourData.eventInfo.time = p.replace('Time:', '').trim();
                    } else if (p.includes('Ticket Price:') || p.includes('Price:')) {
                        const priceInfo = extractPrice(p);
                        if (priceInfo) {
                            tourData.eventInfo.ticketPrice = priceInfo.price;
                        }
                    }
                });
            }

            // Exclusive Bonuses
            if (sectionId.includes('exclusive') && sectionId.includes('bonus')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.exclusiveBonuses.push(p);
                });
                sectionContent.lists.forEach(list => {
                    tourData.exclusiveBonuses.push(...list);
                });
            }

            // Ticket Add-ons
            if (sectionId.includes('add-on') || sectionId.includes('addon') || sectionId.includes('evolve-your-gameplay')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.ticketAddOns.push(p);
                });
            }

            // What's New
            if (sectionId.includes('new') || sectionId.includes('whats-new')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.whatsNew.push(p);
                });
                tourData.costumedPokemon.push(...sectionContent.pokemon);
            }

            // Habitat sections (Central Village, Coastal Laboratory, Mountain Manor, etc.)
            if (sectionId.includes('village') || sectionId.includes('laboratory') || sectionId.includes('manor') || 
                sectionId.includes('habitat') || sectionId.includes('coastal') || sectionId.includes('mountain') ||
                sectionId.includes('central')) {
                const habitatName = sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tourData.habitats[habitatName] = {
                    spawns: sectionContent.pokemon,
                    rareSpawns: []
                };
            }

            // Wild Habitats overview
            if (sectionId === 'wild-habitats' || sectionId === 'spawns') {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim() && !tourData.habitats['General']) {
                        tourData.habitats['General'] = { info: p, spawns: [] };
                    }
                });
            }

            // Incense Encounters
            if (sectionId.includes('incense')) {
                tourData.incenseEncounters.push(...sectionContent.pokemon);
            }

            // Raids by tier
            if (sectionId.includes('one-star') || sectionId.includes('1-star')) {
                tourData.raids.oneStar.push(...sectionContent.pokemon);
            } else if (sectionId.includes('three-star') || sectionId.includes('3-star')) {
                tourData.raids.threeStar.push(...sectionContent.pokemon);
            } else if (sectionId.includes('five-star') || sectionId.includes('5-star')) {
                tourData.raids.fiveStar.push(...sectionContent.pokemon);
            } else if (sectionId.includes('mega')) {
                tourData.raids.mega.push(...sectionContent.pokemon);
            }

            // Research sections
            if (sectionId.includes('field-research')) {
                tourData.research.field.push(...sectionContent.pokemon);
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.field.push({ info: p });
                });
            } else if (sectionId.includes('special-research')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.special.push(p);
                });
            } else if (sectionId.includes('timed-research') || sectionId.includes('furfrou')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.timed.push(p);
                });
                sectionContent.lists.forEach(list => {
                    tourData.research.timed.push(...list);
                });
            } else if (sectionId.includes('masterwork')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.research.masterwork.push(p);
                });
            }

            // Shiny debuts
            if (sectionId.includes('shiny') && (sectionId.includes('debut') || sectionId.includes('new'))) {
                tourData.shinyDebuts.push(...sectionContent.pokemon);
            } else if (sectionId === 'shiny') {
                tourData.shinies.push(...sectionContent.pokemon);
            }

            // Sales / Merchandise
            if (sectionId.includes('sales') || sectionId.includes('collection') || sectionId.includes('merchandise')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) tourData.sales.push(p);
                });
            }
        }

        if (tourData.eventInfo.name || Object.keys(tourData.habitats).length > 0) {
            writeTempFile(id, 'pokemon-go-tour', tourData);
        }
    } catch (err) {
        handleScraperError(err, id, 'pokemon-go-tour', bkp, 'gotour');
    }
}

module.exports = { get };
