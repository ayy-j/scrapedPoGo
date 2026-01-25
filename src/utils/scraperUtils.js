/**
 * @fileoverview Shared utility functions for LeekDuck scrapers.
 * Provides standardized extraction methods, error handling, and file operations
 * used across all detailed event scrapers.
 * @module utils/scraperUtils
 */

const fs = require('fs');
const path = require('path');
const { getMultipleImageDimensions, clearCache } = require('./imageDimensions');

/**
 * @typedef {Object} Pokemon
 * @property {string} name - Pokemon display name
 * @property {string} image - URL to Pokemon image
 * @property {boolean} canBeShiny - Whether this Pokemon can be shiny
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {string} [imageType] - Image format type
 */

/**
 * @typedef {Object} Bonus
 * @property {string} text - Bonus description text
 * @property {string} image - URL to bonus icon image
 */

/**
 * @typedef {Object} SectionContent
 * @property {string[]} paragraphs - Paragraph text content
 * @property {string[][]} lists - Array of list item arrays
 * @property {Pokemon[]} pokemon - Extracted Pokemon data
 * @property {Object[]} tables - Extracted table data
 */

// ============================================================================
// File Operations
// ============================================================================

/**
 * Writes a temporary JSON file for scraped event data.
 * Files are written to data/temp/ directory and later combined by combinedetails.js.
 * 
 * @param {string} id - Event ID (URL slug)
 * @param {string} type - Event type identifier (e.g., 'community-day', 'raid-battles')
 * @param {Object} data - Scraped data object to serialize
 * @param {string} [suffix=''] - Optional filename suffix (e.g., '_generic', '_codes')
 * @returns {void}
 * 
 * @example
 * writeTempFile('january-community-day', 'community-day', { spawns: [...] });
 * // Creates: data/temp/january-community-day.json
 * 
 * writeTempFile('event-id', 'promo-codes', ['CODE1', 'CODE2'], '_codes');
 * // Creates: data/temp/event-id_codes.json
 */
function writeTempFile(id, type, data, suffix = '') {
    const filename = `data/temp/${id}${suffix}.json`;
    const content = JSON.stringify({ id, type, data });
    
    fs.writeFile(filename, content, err => {
        if (err) {
            console.error(`Error writing ${filename}:`, err);
        }
    });
}

/**
 * Centralized error handler for scrapers with fallback to backup data.
 * When scraping fails, searches backup data for previously scraped content
 * and writes it to maintain data availability.
 * 
 * @param {Error} err - The error that occurred during scraping
 * @param {string} id - Event ID (URL slug)
 * @param {string} type - Event type for the output file
 * @param {Object[]} bkp - Backup data array from events_min.json (CDN fallback)
 * @param {string} scraperKey - Key to look up in extraData (e.g., 'communityday', 'raidbattles')
 * @returns {void}
 * 
 * @example
 * try {
 *   // scraping code
 * } catch (err) {
 *   handleScraperError(err, 'event-id', 'community-day', backupData, 'communityday');
 * }
 */
function handleScraperError(err, id, type, bkp, scraperKey) {
    // Log error for debugging
    if (process.env.DEBUG) {
        console.error(`Scraper error for ${id} (${type}):`, err.message);
    }
    
    // Search backup data for fallback
    for (let i = 0; i < bkp.length; i++) {
        if (bkp[i].eventID === id && bkp[i].extraData != null) {
            if (scraperKey in bkp[i].extraData) {
                writeTempFile(id, type, bkp[i].extraData[scraperKey].data);
                return;
            }
        }
    }
}

// ============================================================================
// Pokemon Extraction
// ============================================================================

/**
 * Extracts a list of Pokemon from a .pkmn-list-flex container element.
 * Parses name, image, shiny status, and optionally fetches image dimensions.
 * 
 * @async
 * @param {Element} container - DOM element containing .pkmn-list-item elements
 * @param {Object} [options] - Extraction options
 * @param {boolean} [options.fetchDimensions=true] - Whether to fetch image dimensions from URLs
 * @returns {Promise<Pokemon[]>} Array of Pokemon objects
 * 
 * @example
 * const pokemonList = doc.querySelector('.pkmn-list-flex');
 * const pokemon = await extractPokemonList(pokemonList);
 * // Returns: [{ name: 'Pikachu', image: '...', canBeShiny: true, ... }, ...]
 */
async function extractPokemonList(container, options = {}) {
    const { fetchDimensions = true } = options;
    
    if (!container) return [];
    
    const pokemon = [];
    const items = container.querySelectorAll(':scope > .pkmn-list-item');
    
    // First pass: extract all Pokemon data
    items.forEach(item => {
        const poke = {};
        
        // Name
        const nameEl = item.querySelector(':scope > .pkmn-name');
        poke.name = nameEl ? nameEl.innerHTML.trim() : '';
        
        // Image
        const imgEl = item.querySelector(':scope > .pkmn-list-img > img');
        if (imgEl) {
            poke.image = imgEl.src || '';
        } else {
            poke.image = '';
        }
        
        // Shiny indicator - check for shiny icon or class
        const shinyIcon = item.querySelector('.pokemon-shiny-icon, .shiny-icon, [class*="shiny"]');
        const hasShinyClass = item.className?.includes('shiny') || false;
        poke.canBeShiny = !!(shinyIcon || hasShinyClass);
        
        // Also check image src for shiny indicator
        if (poke.image && poke.image.includes('_shiny')) {
            poke.canBeShiny = true;
        }
        
        if (poke.name) {
            pokemon.push(poke);
        }
    });
    
    // Second pass: fetch dimensions for all images
    if (fetchDimensions && pokemon.length > 0) {
        const imageUrls = pokemon.map(p => p.image).filter(Boolean);
        
        if (imageUrls.length > 0) {
            const dimensionsMap = await getMultipleImageDimensions(imageUrls);
            
            // Assign dimensions back to Pokemon objects
            pokemon.forEach(poke => {
                if (poke.image && dimensionsMap.has(poke.image)) {
                    const dims = dimensionsMap.get(poke.image);
                    poke.imageWidth = dims.width;
                    poke.imageHeight = dims.height;
                    poke.imageType = dims.type;
                }
            });
        }
    }
    
    return pokemon;
}

// ============================================================================
// Section Extraction
// ============================================================================

/**
 * Gets all section header IDs from a page document.
 * Finds event-section-header elements and h2/h3 elements with IDs.
 * 
 * @param {Document} doc - DOM document to search
 * @returns {string[]} Array of section ID strings
 * 
 * @example
 * const sections = getSectionHeaders(doc);
 * // Returns: ['spawns', 'bonuses', 'shiny', 'raids', ...]
 */
function getSectionHeaders(doc) {
    const headers = doc.querySelectorAll('.event-section-header, h2[id], h3[id]');
    const sections = [];
    
    headers.forEach(header => {
        if (header.id) {
            sections.push(header.id);
        }
    });
    
    return sections;
}

/**
 * Extracts content from a specific section by header ID.
 * Walks through sibling elements until the next section header,
 * collecting paragraphs, lists, pokemon, and tables.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @param {string} sectionId - Section header ID to extract from
 * @returns {Promise<SectionContent>} Object with paragraphs, lists, pokemon, tables arrays
 * 
 * @example
 * const spawnSection = await extractSection(doc, 'spawns');
 * console.log(spawnSection.pokemon); // Array of Pokemon in spawns section
 * console.log(spawnSection.paragraphs); // Text descriptions
 */
async function extractSection(doc, sectionId) {
    const result = {
        paragraphs: [],
        lists: [],
        pokemon: [],
        tables: []
    };
    
    const header = doc.getElementById(sectionId);
    if (!header) return result;
    
    // Walk through siblings until next section header
    let sibling = header.nextElementSibling;
    
    while (sibling && !sibling.classList?.contains('event-section-header') && 
           !(sibling.tagName === 'H2' && sibling.id)) {
        
        // Paragraphs
        if (sibling.tagName === 'P') {
            const text = sibling.innerHTML?.trim();
            if (text) {
                result.paragraphs.push(text);
            }
        }
        
        // Unordered/Ordered lists
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
            const listItems = [];
            sibling.querySelectorAll('li').forEach(li => {
                listItems.push(li.innerHTML?.trim());
            });
            if (listItems.length > 0) {
                result.lists.push(listItems);
            }
        }
        
        // Pokemon lists
        if (sibling.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(sibling);
            result.pokemon.push(...pokemon);
        }
        
        // Tables
        if (sibling.tagName === 'TABLE') {
            const tableData = extractTable(sibling);
            result.tables.push(tableData);
        }
        
        sibling = sibling.nextElementSibling;
    }
    
    return result;
}

/**
 * Extracts data from a table element into structured format.
 * Parses header row and body rows into separate arrays.
 * 
 * @param {Element} table - Table DOM element
 * @returns {{headers: string[], rows: string[][]}} Object with headers and rows arrays
 * 
 * @example
 * const tableData = extractTable(tableElement);
 * // Returns: { headers: ['Pokemon', 'CP Range'], rows: [['Pikachu', '200-400'], ...] }
 */
function extractTable(table) {
    const data = { headers: [], rows: [] };
    
    // Headers
    const headerCells = table.querySelectorAll('thead th, tr:first-child th');
    headerCells.forEach(th => {
        data.headers.push(th.textContent?.trim() || '');
    });
    
    // Rows
    const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
    rows.forEach(row => {
        const cells = [];
        row.querySelectorAll('td').forEach(td => {
            cells.push(td.innerHTML?.trim() || '');
        });
        if (cells.length > 0) {
            data.rows.push(cells);
        }
    });
    
    return data;
}

// ============================================================================
// Bonus Extraction
// ============================================================================

/**
 * Extracts bonus items from a page's .bonus-list section.
 * Also extracts disclaimer paragraphs if any bonus has an asterisk.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{bonuses: Bonus[], disclaimers: string[]}>} Bonuses and their disclaimers
 * 
 * @example
 * const { bonuses, disclaimers } = await extractBonuses(doc);
 * // bonuses: [{ text: '2× Catch XP', image: '...' }, ...]
 * // disclaimers: ['*Bonus only available in certain regions']
 */
async function extractBonuses(doc) {
    const result = {
        bonuses: [],
        disclaimers: []
    };
    
    const bonusItems = doc.querySelectorAll('.bonus-item');
    let hasDisclaimer = false;
    
    bonusItems.forEach(item => {
        const bonus = {};
        
        const textEl = item.querySelector(':scope > .bonus-text');
        bonus.text = textEl ? textEl.innerHTML.trim() : '';
        
        const imgEl = item.querySelector(':scope > .item-circle > img');
        bonus.image = imgEl ? imgEl.src : '';
        
        if (bonus.text) {
            result.bonuses.push(bonus);
            
            if (bonus.text.includes('*')) {
                hasDisclaimer = true;
            }
        }
    });
    
    // Extract disclaimers if any bonus has asterisk
    if (hasDisclaimer) {
        const bonusList = doc.querySelector('.bonus-list');
        if (bonusList) {
            let sibling = bonusList.nextSibling;
            
            while (sibling && sibling.tagName !== 'H2' && sibling.nextSibling) {
                if (sibling.tagName === 'P') {
                    const html = sibling.innerHTML;
                    if (html.includes('<br>\n')) {
                        html.split('<br>\n').forEach(s => {
                            if (s.trim()) result.disclaimers.push(s.trim());
                        });
                    } else if (html.trim()) {
                        result.disclaimers.push(html.trim());
                    }
                }
                sibling = sibling.nextSibling;
            }
        }
    }
    
    return result;
}

// ============================================================================
// Raid Extraction
// ============================================================================

/**
 * Extracts raid information from a page including boss tiers.
 * Categorizes Pokemon lists by their section headers into appropriate tiers.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{tiers: {mega: Pokemon[], fiveStar: Pokemon[], threeStar: Pokemon[], oneStar: Pokemon[]}, bosses: Pokemon[], shinies: Pokemon[]}>} Raid data organized by tier
 * 
 * @example
 * const raidInfo = await extractRaidInfo(doc);
 * console.log(raidInfo.tiers.fiveStar); // 5-star raid bosses
 * console.log(raidInfo.tiers.mega); // Mega raid bosses
 */
async function extractRaidInfo(doc) {
    const result = {
        tiers: {
            mega: [],
            fiveStar: [],
            threeStar: [],
            oneStar: []
        },
        bosses: [],
        shinies: []
    };
    
    const pageContent = doc.querySelector('.page-content');
    if (!pageContent) return result;
    
    let lastHeader = '';
    let lastHeaderText = '';
    
    for (const node of pageContent.childNodes) {
        if (node.className?.includes('event-section-header')) {
            lastHeader = node.id || '';
            lastHeaderText = node.textContent?.toLowerCase() || '';
        }
        
        if (node.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(node);
            
            // Categorize by section header ID and text content
            const headerLower = lastHeader.toLowerCase();
            const textLower = lastHeaderText;
            
            if (headerLower.includes('mega') || textLower.includes('mega')) {
                result.tiers.mega.push(...pokemon);
            } else if (headerLower.includes('5-star') || headerLower.includes('five-star') || 
                       textLower.includes('5-star') || textLower.includes('five-star') ||
                       headerLower.includes('legendary') || textLower.includes('legendary')) {
                result.tiers.fiveStar.push(...pokemon);
            } else if (headerLower.includes('3-star') || headerLower.includes('three-star') ||
                       textLower.includes('3-star') || textLower.includes('three-star')) {
                result.tiers.threeStar.push(...pokemon);
            } else if (headerLower.includes('1-star') || headerLower.includes('one-star') ||
                       textLower.includes('1-star') || textLower.includes('one-star')) {
                result.tiers.oneStar.push(...pokemon);
            } else if (headerLower.includes('raids') || headerLower.includes('boss') ||
                       textLower.includes('raids') || textLower.includes('appearing in')) {
                result.bosses.push(...pokemon);
            } else if (headerLower.includes('shiny') || textLower.includes('shiny')) {
                result.shinies.push(...pokemon);
            }
        }
    }
    
    return result;
}

// ============================================================================
// Research Extraction
// ============================================================================

/**
 * Extracts research tasks from a page.
 * Handles Special Research with multi-step format and simpler Field Research.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @param {string} [researchType='special'] - Type: 'special', 'timed', 'masterwork', 'field'
 * @returns {Promise<{tasks: Object[], steps: Object[], rewards: string[]}>} Research data
 * 
 * @example
 * const research = await extractResearchTasks(doc, 'special');
 * // For special research with steps:
 * // research.steps = [{ name: 'Step 1', step: 1, tasks: [...], rewards: [...] }, ...]
 * 
 * // For field research:
 * // research.tasks = [{ task: 'Catch 5 Pokemon', reward: 'Pikachu encounter' }, ...]
 */
async function extractResearchTasks(doc, researchType = 'special') {
    const result = {
        tasks: [],
        steps: [],
        rewards: []
    };
    
    // Special Research with steps
    const stepItems = doc.querySelectorAll('.special-research-list > .step-item');
    
    stepItems.forEach(stepItem => {
        const step = {
            name: '',
            step: 0,
            tasks: [],
            rewards: []
        };
        
        // Step number
        const stepNumEl = stepItem.querySelector(':scope > .step-label > .step-number');
        if (stepNumEl) {
            step.step = parseInt(stepNumEl.innerHTML) || 0;
        }
        
        // Step name
        const stepNameEl = stepItem.querySelector(':scope > .task-reward-wrapper > .step-name');
        if (stepNameEl) {
            step.name = stepNameEl.innerHTML?.trim() || '';
        }
        
        // Tasks within step
        const taskItems = stepItem.querySelectorAll(':scope > .task-reward-wrapper > .task-reward');
        taskItems.forEach(taskItem => {
            const task = {
                text: '',
                reward: {
                    text: '',
                    image: ''
                }
            };
            
            const taskTextEl = taskItem.querySelector(':scope > .task-text');
            if (taskTextEl) {
                task.text = taskTextEl.innerHTML?.replace(/\n\s+/g, ' ').trim() || '';
            }
            
            const rewardLabelEl = taskItem.querySelector(':scope > .reward-text > .reward-label');
            if (rewardLabelEl) {
                task.reward.text = rewardLabelEl.innerHTML?.replace(/<span>|<\/span>/g, '').trim() || '';
            }
            
            const rewardImgEl = taskItem.querySelector(':scope > .reward-text > .reward-bubble > .reward-image');
            if (rewardImgEl) {
                task.reward.image = rewardImgEl.src || '';
            }
            
            if (task.text) {
                step.tasks.push(task);
            }
        });
        
        // Page rewards (completion rewards)
        const pageRewards = stepItem.querySelectorAll(':scope > .page-reward-wrapper > .page-reward-list > .page-reward');
        pageRewards.forEach(rewardItem => {
            const reward = {
                text: '',
                image: ''
            };
            
            const labelEl = rewardItem.querySelector(':scope > .reward-label > span');
            if (labelEl) {
                reward.text = labelEl.innerHTML?.trim() || '';
            }
            
            const imgEl = rewardItem.querySelector(':scope > .page-reward-item > .reward-image');
            if (imgEl) {
                reward.image = imgEl.src || '';
            }
            
            if (reward.text) {
                step.rewards.push(reward);
            }
        });
        
        if (step.tasks.length > 0 || step.rewards.length > 0) {
            result.steps.push(step);
        }
    });
    
    // Field research tasks (simpler format)
    const fieldTasks = doc.querySelectorAll('.field-research-task, .research-task');
    fieldTasks.forEach(taskEl => {
        const task = {
            task: '',
            reward: ''
        };
        
        const taskTextEl = taskEl.querySelector('.task-text, .research-task-text');
        if (taskTextEl) {
            task.task = taskTextEl.textContent?.trim() || '';
        }
        
        const rewardEl = taskEl.querySelector('.reward-text, .research-reward');
        if (rewardEl) {
            task.reward = rewardEl.textContent?.trim() || '';
        }
        
        if (task.task) {
            result.tasks.push(task);
        }
    });
    
    return result;
}

// ============================================================================
// Price/Ticket Extraction
// ============================================================================

/**
 * Extracts price information from text content.
 * Supports USD ($), EUR (€), and GBP (£) formats.
 * 
 * @param {string} text - Text that may contain price information
 * @returns {{price: number, currency: string}|null} Price object or null if not found
 * 
 * @example
 * extractPrice('Get access for US$4.99!'); // { price: 4.99, currency: 'USD' }
 * extractPrice('Only €2.99'); // { price: 2.99, currency: 'EUR' }
 * extractPrice('No price here'); // null
 */
function extractPrice(text) {
    const patterns = [
        /US\$(\d+\.?\d*)/,
        /\$(\d+\.?\d*)\s*USD/i,
        /€(\d+\.?\d*)/,
        /£(\d+\.?\d*)/,
        /\$(\d+\.?\d*)/
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let currency = 'USD';
            if (text.includes('€')) currency = 'EUR';
            if (text.includes('£')) currency = 'GBP';
            
            return {
                price: parseFloat(match[1]),
                currency
            };
        }
    }
    
    return null;
}

/**
 * Extracts promo codes from page links.
 * Finds links to Pokemon GO Web Store offer redemption and extracts passcodes.
 * 
 * @param {Document} doc - DOM document
 * @returns {string[]} Array of promo code strings
 * 
 * @example
 * const codes = extractPromoCodes(doc);
 * // Returns: ['PROMOCODE1', 'ANOTHERCODE', ...]
 */
function extractPromoCodes(doc) {
    const codes = [];
    const links = doc.querySelectorAll('a[href*="store.pokemongo.com/offer-redemption"]');
    
    links.forEach(link => {
        const href = link.href || '';
        const match = /passcode=(\w+)/.exec(href);
        if (match && match[1]) {
            codes.push(match[1]);
        }
    });
    
    return codes;
}

// ============================================================================
// Egg Extraction
// ============================================================================

/**
 * Extracts egg pool data organized by distance tier.
 * Parses the eggs section and categorizes Pokemon by egg distance.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{[key: string]: Pokemon[]}>} Eggs organized by distance tier keys
 * 
 * @example
 * const eggs = await extractEggPools(doc);
 * // Returns: { '2km': [...], '5km': [...], '10km': [...], 'adventure': [...] }
 */
async function extractEggPools(doc) {
    const eggs = {
        '2km': [],
        '5km': [],
        '7km': [],
        '10km': [],
        '12km': [],
        'route': [],
        'adventure': []
    };
    
    const pageContent = doc.querySelector('.page-content');
    if (!pageContent) return eggs;
    
    let inEggSection = false;
    let currentTier = '5km';
    
    for (const node of pageContent.childNodes) {
        // Check if we're in the eggs section
        if (node.className?.includes('event-section-header')) {
            inEggSection = node.id === 'eggs';
        }
        
        if (!inEggSection) continue;
        
        // Detect tier from paragraph text
        if (node.tagName === 'P') {
            const text = node.textContent || '';
            if (text.includes('2 km') || text.includes('2km')) currentTier = '2km';
            else if (text.includes('5 km') || text.includes('5km')) currentTier = '5km';
            else if (text.includes('7 km') || text.includes('7km')) currentTier = '7km';
            else if (text.includes('10 km') || text.includes('10km')) currentTier = '10km';
            else if (text.includes('12 km') || text.includes('12km')) currentTier = '12km';
            else if (text.includes('Route') || text.includes('Mateo')) currentTier = 'route';
            else if (text.includes('Adventure Sync')) currentTier = 'adventure';
        }
        
        // Extract pokemon for current tier
        if (node.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(node);
            if (eggs[currentTier]) {
                eggs[currentTier].push(...pokemon);
            }
        }
    }
    
    return eggs;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    // File operations
    writeTempFile,
    handleScraperError,
    
    // Pokemon extraction
    extractPokemonList,
    
    // Image dimension cache management
    clearImageDimensionCache: clearCache,
    
    // Section extraction
    getSectionHeaders,
    extractSection,
    extractTable,
    
    // Bonus extraction
    extractBonuses,
    
    // Raid extraction
    extractRaidInfo,
    
    // Research extraction
    extractResearchTasks,
    
    // Price/promo extraction
    extractPrice,
    extractPromoCodes,
    
    // Egg extraction
    extractEggPools
};
