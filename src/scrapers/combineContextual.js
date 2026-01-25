/**
 * @fileoverview Contextual Pokemon GO Data Aggregator.
 * Cross-references all scraped data sources into player-focused contextual
 * groupings, answering "What's available now, from where, and when does it end?"
 * @module scrapers/combineContextual
 */

const fs = require('fs');

/**
 * @typedef {Object} TimelineEvent
 * @property {string} eventID - Unique event identifier
 * @property {string} name - Event display name
 * @property {string} eventType - Event category type
 * @property {string} image - Event banner image URL
 * @property {string} start - ISO 8601 start datetime
 * @property {string} end - ISO 8601 end datetime
 * @property {number} priority - Calculated priority score
 * @property {boolean} hasShiny - Event has shiny opportunities
 * @property {boolean} hasRaids - Event has raid content
 * @property {boolean} hasEggs - Event has egg pool changes
 * @property {boolean} hasBonuses - Event has active bonuses
 * @property {boolean} hasSpawns - Event has wild spawn changes
 * @property {boolean} hasFieldResearchTasks - Event has field research
 */

/**
 * @typedef {Object} Timeline
 * @property {TimelineEvent[]} endingSoon - Events ending within 24 hours
 * @property {TimelineEvent[]} active - Currently active events
 * @property {TimelineEvent[]} upcoming - Events starting within 7 days
 */

/**
 * @typedef {Object} PokemonIndexEntry
 * @property {string} name - Pokemon display name
 * @property {Object[]} sources - Array of availability sources
 * @property {boolean} shinyEligible - Whether shiny is available
 * @property {{min: number|null, max: number|null}} cpRange - CP range across sources
 * @property {Object} [shinyData] - Shiny release information if available
 * @property {string[]} [activeEventIDs] - Currently active related events
 * @property {string} [baseSpecies] - Base species name for forms
 */

/**
 * @typedef {Object} ContextualData
 * @property {Timeline} timeline - Events grouped by time urgency
 * @property {Object} currentAvailability - Current Pokemon availability by source
 * @property {PokemonIndexEntry[]} pokemonIndex - Per-Pokemon lookup of all sources
 * @property {Object} shinyOpportunities - Shiny hunting opportunities
 */

// ============================================================================
// Data Loading
// ============================================================================

/**
 * Loads and parses a JSON data file from the data directory.
 * 
 * @param {string} filename - Name of the file in ./data/ directory
 * @returns {Object|null} Parsed JSON data or null on error
 * 
 * @example
 * const events = loadDataFile('events.json');
 */
function loadDataFile(filename) {
    try {
        const data = fs.readFileSync(`./data/${filename}`, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading ${filename}:`, err.message);
        return null;
    }
}

/**
 * Gets the last modified timestamp of a data file.
 * Used for versioning and cache invalidation.
 * 
 * @param {string} filename - Name of the file in ./data/ directory
 * @returns {string|null} ISO 8601 timestamp or null on error
 */
function getFileVersion(filename) {
    try {
        const stats = fs.statSync(`./data/${filename}`);
        return stats.mtime.toISOString();
    } catch (err) {
        return null;
    }
}

// ============================================================================
// Timeline Grouping
// ============================================================================

/**
 * Categorizes events into time-based urgency groups.
 * Events are sorted by priority within each group.
 * 
 * @param {Object[]} events - Events array from events.json
 * @param {Date} now - Current timestamp for comparison
 * @returns {Timeline} Events grouped by urgency
 * 
 * @example
 * const timeline = buildTimeline(events, new Date());
 * // Returns { endingSoon: [...], active: [...], upcoming: [...] }
 */
function buildTimeline(events, now) {
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    
    const timeline = {
        endingSoon: [],
        active: [],
        upcoming: []
    };
    
    events.forEach(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        
        // Calculate time differences
        const timeUntilEnd = end - now;
        const timeUntilStart = start - now;
        
        // Priority scoring based on event type and time
        const priority = calculateEventPriority(event, timeUntilEnd, timeUntilStart);
        
        const eventEntry = {
            eventID: event.eventID,
            name: event.name,
            eventType: event.eventType,
            image: event.image,
            start: event.start,
            end: event.end,
            priority,
            hasShiny: event.hasShiny || false,
            hasRaids: event.hasRaids || false,
            hasEggs: event.hasEggs || false,
            hasBonuses: event.hasBonuses || false,
            hasSpawns: event.hasSpawns || false,
            hasFieldResearchTasks: event.hasFieldResearchTasks || false
        };
        
        // Categorize by time
        if (timeUntilEnd > 0 && timeUntilStart <= 0) {
            // Event is currently active
            if (timeUntilEnd <= DAY) {
                // Ending within 24 hours
                timeline.endingSoon.push(eventEntry);
            } else {
                timeline.active.push(eventEntry);
            }
        } else if (timeUntilStart > 0 && timeUntilStart <= WEEK) {
            // Event starts within 7 days
            timeline.upcoming.push(eventEntry);
        }
    });
    
    // Sort by priority (highest first)
    timeline.endingSoon.sort((a, b) => b.priority - a.priority);
    timeline.active.sort((a, b) => b.priority - a.priority);
    timeline.upcoming.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    return timeline;
}

/**
 * Calculates priority score for an event based on type and timing.
 * Higher scores indicate more important/urgent events for players.
 * 
 * @param {Object} event - Event object with eventType and feature flags
 * @param {number} timeUntilEnd - Milliseconds until event ends
 * @param {number} timeUntilStart - Milliseconds until event starts
 * @returns {number} Priority score (higher = more important)
 */
function calculateEventPriority(event, timeUntilEnd, timeUntilStart) {
    let priority = 0;
    
    // Event type weights
    const typeWeights = {
        'community-day': 100,
        'pokemon-go-tour': 95,
        'go-fest': 95,
        'raid-day': 90,
        'raid-hour': 85,
        'spotlight': 80,
        'team-go-rocket': 75,
        'go-rocket-takeover': 75,
        'event': 70,
        'raid-battles': 60,
        'season': 50,
        'research-breakthrough': 45,
        'go-battle-league': 40
    };
    
    priority += typeWeights[event.eventType] || 30;
    
    // Bonus for shiny opportunities
    if (event.hasShiny) priority += 15;
    
    // Bonus for events with bonuses
    if (event.hasBonuses) priority += 10;
    
    // Urgency bonus for events ending soon
    if (timeUntilEnd > 0 && timeUntilEnd <= 24 * 60 * 60 * 1000) {
        priority += 25;
    }
    
    return priority;
}

/**
 * Formats milliseconds duration into human-readable form.
 * 
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2d 5h" or "12h")
 */
function formatDuration(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
        return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
}

// ============================================================================
// Current Availability Aggregator
// ============================================================================

/**
 * Builds unified availability object from all data sources.
 * Combines raids, eggs, research, and rocket data with event context.
 * 
 * @param {Object[]} raids - Raid boss data
 * @param {Object[]} eggs - Egg pool data
 * @param {Object[]} research - Research task data
 * @param {Object[]} rocketLineups - Team GO Rocket lineup data
 * @param {Object[]} events - Events data for context
 * @param {Date} now - Current timestamp
 * @returns {Object} Availability grouped by source type
 */
function buildCurrentAvailability(raids, eggs, research, rocketLineups, events, now) {
    const availability = {
        raids: buildRaidAvailability(raids, events, now),
        eggs: buildEggAvailability(eggs, events, now),
        research: buildResearchAvailability(research),
        rocket: buildRocketAvailability(rocketLineups)
    };
    
    return availability;
}

/**
 * Groups raid bosses by tier with event context.
 * Links active raid events to relevant bosses.
 * 
 * @param {Object[]} raids - Raid boss data
 * @param {Object[]} events - Events data
 * @param {Date} now - Current timestamp
 * @returns {Object} Raids organized by tier keys
 */
function buildRaidAvailability(raids, events, now) {
    const tiers = {
        'mega': [],
        '5-star': [],
        '3-star': [],
        '1-star': [],
        'shadow': []
    };
    
    // Get active raid events for context
    const activeRaidEvents = events.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start <= now && end > now && e.hasRaids;
    });
    
    const activeEventIDs = activeRaidEvents.map(e => e.eventID);
    
    raids.forEach(raid => {
        const tierKey = normalizeTierKey(raid.tier);
        if (!tierKey) return;
        
        const raidEntry = {
            name: raid.name,
            originalName: raid.originalName,
            form: raid.form,
            image: raid.image,
            imageWidth: raid.imageWidth,
            imageHeight: raid.imageHeight,
            imageType: raid.imageType,
            canBeShiny: raid.canBeShiny,
            isShadowRaid: raid.isShadowRaid,
            types: raid.types,
            combatPower: raid.combatPower,
            boostedWeather: raid.boostedWeather,
            activeEventIDs: activeEventIDs.length > 0 ? activeEventIDs : undefined
        };
        
        if (raid.isShadowRaid) {
            tiers['shadow'].push(raidEntry);
        } else if (tiers[tierKey]) {
            tiers[tierKey].push(raidEntry);
        }
    });
    
    return tiers;
}

/**
 * Normalizes raid tier header text to consistent key.
 * 
 * @param {string} tier - Tier text from raid page
 * @returns {string|null} Normalized tier key or null if unrecognized
 */
function normalizeTierKey(tier) {
    if (!tier) return null;
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('mega')) return 'mega';
    if (tierLower.includes('5') || tierLower.includes('five')) return '5-star';
    if (tierLower.includes('3') || tierLower.includes('three')) return '3-star';
    if (tierLower.includes('1') || tierLower.includes('one')) return '1-star';
    return null;
}

/**
 * Groups eggs by distance pool with event override detection.
 * Identifies when active events modify the standard egg pools.
 * 
 * @param {Object[]} eggs - Egg pool data
 * @param {Object[]} events - Events data
 * @param {Date} now - Current timestamp
 * @returns {Object} Eggs organized by distance pool keys
 */
function buildEggAvailability(eggs, events, now) {
    const pools = {
        '2km': [],
        '5km': [],
        '7km': [],
        '10km': [],
        '12km': [],
        'adventureSync5km': [],
        'adventureSync10km': []
    };
    
    // Check for active events with egg pools
    const activeEggEvents = events.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start <= now && end > now && e.hasEggs;
    });
    
    eggs.forEach(egg => {
        const poolKey = normalizeEggPool(egg.eggType, egg.isAdventureSync);
        if (!poolKey || !pools[poolKey]) return;
        
        const eggEntry = {
            name: egg.name,
            image: egg.image,
            imageWidth: egg.imageWidth,
            imageHeight: egg.imageHeight,
            imageType: egg.imageType,
            canBeShiny: egg.canBeShiny,
            combatPower: egg.combatPower,
            rarity: egg.rarity,
            isRegional: egg.isRegional,
            isGiftExchange: egg.isGiftExchange,
            eventOverride: activeEggEvents.length > 0 ? activeEggEvents.map(e => e.eventID) : undefined
        };
        
        pools[poolKey].push(eggEntry);
    });
    
    return pools;
}

/**
 * Normalizes egg type text to consistent pool key.
 * 
 * @param {string} eggType - Egg type text (e.g., "2km", "5 km")
 * @param {boolean} isAdventureSync - Whether this is an Adventure Sync egg
 * @returns {string|null} Normalized pool key or null if unrecognized
 */
function normalizeEggPool(eggType, isAdventureSync) {
    if (!eggType) return null;
    const distance = eggType.replace(/\s/g, '').toLowerCase();
    
    if (isAdventureSync) {
        if (distance.includes('5')) return 'adventureSync5km';
        if (distance.includes('10')) return 'adventureSync10km';
    }
    
    if (distance.includes('2') || distance.includes('1km')) return '2km';
    if (distance.includes('5')) return '5km';
    if (distance.includes('7')) return '7km';
    if (distance.includes('10')) return '10km';
    if (distance.includes('12')) return '12km';
    
    return null;
}

/**
 * Builds research encounter and item availability from tasks.
 * Deduplicates encounters and groups by Pokemon.
 * 
 * @param {Object[]} research - Research task data
 * @returns {Object} Research rewards with encounters and items
 */
function buildResearchAvailability(research) {
    const encounters = [];
    const items = [];
    
    research.forEach(task => {
        if (!task.rewards) return;
        
        task.rewards.forEach(reward => {
            if (reward.type === 'encounter') {
                encounters.push({
                    pokemon: reward.name,
                    task: task.text,
                    taskType: task.type,
                    image: reward.image,
                    imageWidth: reward.imageWidth,
                    imageHeight: reward.imageHeight,
                    imageType: reward.imageType,
                    canBeShiny: reward.canBeShiny,
                    combatPower: reward.combatPower
                });
            } else if (reward.type === 'item') {
                items.push({
                    item: reward.name,
                    task: task.text,
                    taskType: task.type,
                    quantity: reward.quantity,
                    image: reward.image,
                    imageWidth: reward.imageWidth,
                    imageHeight: reward.imageHeight,
                    imageType: reward.imageType
                });
            }
        });
    });
    
    // Deduplicate encounters by pokemon name (keep first instance with all task sources)
    const encounterMap = new Map();
    encounters.forEach(enc => {
        const key = enc.pokemon;
        if (!encounterMap.has(key)) {
            encounterMap.set(key, {
                pokemon: enc.pokemon,
                image: enc.image,
                imageWidth: enc.imageWidth,
                imageHeight: enc.imageHeight,
                imageType: enc.imageType,
                canBeShiny: enc.canBeShiny,
                combatPower: enc.combatPower,
                tasks: []
            });
        }
        encounterMap.get(key).tasks.push({
            text: enc.task,
            type: enc.taskType
        });
    });
    
    return {
        encounters: Array.from(encounterMap.values()),
        itemRewards: items.slice(0, 50) // Limit items for brevity
    };
}

/**
 * Builds Team GO Rocket lineup availability.
 * Separates leaders from grunts with catchable Pokemon info.
 * 
 * @param {Object[]} rocketLineups - Rocket lineup data
 * @returns {Object} Rocket availability with leaders and grunts arrays
 */
function buildRocketAvailability(rocketLineups) {
    const availability = {
        leaders: [],
        grunts: []
    };
    
    rocketLineups.forEach(lineup => {
        const isLeader = ['Giovanni', 'Cliff', 'Arlo', 'Sierra'].includes(lineup.name);
        
        // Collect all catchable Pokemon from lineup
        const catchable = [];
        
        [lineup.firstPokemon, lineup.secondPokemon, lineup.thirdPokemon].forEach((slot, index) => {
            if (!Array.isArray(slot)) return;
            slot.forEach(pokemon => {
                if (pokemon.isEncounter) {
                    catchable.push({
                        name: pokemon.name,
                        image: pokemon.image,
                        canBeShiny: pokemon.canBeShiny,
                        slot: index + 1
                    });
                }
            });
        });
        
        const entry = {
            name: lineup.name,
            title: lineup.title,
            type: lineup.type || null,
            catchablePokemon: catchable,
            lineup: {
                first: lineup.firstPokemon?.map(p => p.name) || [],
                second: lineup.secondPokemon?.map(p => p.name) || [],
                third: lineup.thirdPokemon?.map(p => p.name) || []
            }
        };
        
        if (isLeader) {
            availability.leaders.push(entry);
        } else {
            availability.grunts.push(entry);
        }
    });
    
    return availability;
}

// ============================================================================
// Pokemon Index Cross-Reference
// ============================================================================

/**
 * Generates per-Pokemon lookup showing every availability source.
 * Cross-references all data sources to build a comprehensive index
 * of where each Pokemon can be obtained.
 * 
 * @param {Object[]} raids - Raid boss data
 * @param {Object[]} eggs - Egg pool data
 * @param {Object[]} research - Research task data
 * @param {Object[]} rocketLineups - Team GO Rocket lineup data
 * @param {Object} shinies - Shiny Pokemon data
 * @param {Object[]} events - Events data for context
 * @param {Date} now - Current timestamp
 * @returns {PokemonIndexEntry[]} Sorted array of Pokemon index entries
 */
function buildPokemonIndex(raids, eggs, research, rocketLineups, shinies, events, now) {
    const index = new Map();
    
    // Process raids
    raids.forEach(raid => {
        const key = normalizePokemonKey(raid.name);
        const entry = getOrCreateIndexEntry(index, key, raid.name);
        
        entry.sources.push({
            type: 'raid',
            tier: raid.tier,
            isShadow: raid.isShadowRaid,
            canBeShiny: raid.canBeShiny,
            combatPower: raid.combatPower
        });
        
        if (raid.canBeShiny) entry.shinyEligible = true;
        if (raid.combatPower) {
            updateCPRange(entry, raid.combatPower);
        }
    });
    
    // Process eggs
    eggs.forEach(egg => {
        const key = normalizePokemonKey(egg.name);
        const entry = getOrCreateIndexEntry(index, key, egg.name);
        
        entry.sources.push({
            type: 'egg',
            eggType: egg.eggType,
            isAdventureSync: egg.isAdventureSync,
            canBeShiny: egg.canBeShiny,
            rarity: egg.rarity
        });
        
        if (egg.canBeShiny) entry.shinyEligible = true;
        if (egg.combatPower) {
            updateCPRange(entry, egg.combatPower);
        }
    });
    
    // Process research
    research.forEach(task => {
        if (!task.rewards) return;
        task.rewards.forEach(reward => {
            if (reward.type !== 'encounter') return;
            
            const key = normalizePokemonKey(reward.name);
            const entry = getOrCreateIndexEntry(index, key, reward.name);
            
            entry.sources.push({
                type: 'research',
                task: task.text,
                taskType: task.type,
                canBeShiny: reward.canBeShiny
            });
            
            if (reward.canBeShiny) entry.shinyEligible = true;
            if (reward.combatPower) {
                updateCPRange(entry, reward.combatPower);
            }
        });
    });
    
    // Process rocket lineups
    rocketLineups.forEach(lineup => {
        [lineup.firstPokemon, lineup.secondPokemon, lineup.thirdPokemon].forEach(slot => {
            if (!Array.isArray(slot)) return;
            slot.forEach(pokemon => {
                if (!pokemon.isEncounter) return;
                
                const key = normalizePokemonKey(pokemon.name);
                const entry = getOrCreateIndexEntry(index, key, pokemon.name);
                
                // Mark as shadow available
                entry.sources.push({
                    type: 'rocket',
                    leader: lineup.name,
                    canBeShiny: pokemon.canBeShiny,
                    isShadow: true
                });
                
                if (pokemon.canBeShiny) entry.shinyEligible = true;
            });
        });
    });
    
    // Enrich with shiny data
    if (shinies && shinies.shinies) {
        shinies.shinies.forEach(shiny => {
            const key = normalizePokemonKey(shiny.name);
            const entry = index.get(key);
            
            if (entry) {
                entry.shinyData = {
                    releasedDate: shiny.releasedDate,
                    dexNumber: shiny.dexNumber,
                    family: shiny.family
                };
            }
        });
    }
    
    // Add event context to Pokemon
    const activeEvents = events.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start <= now && end > now;
    });
    
    activeEvents.forEach(event => {
        // Featured Pokemon
        if (event.featured) {
            event.featured.forEach(pokemon => {
                const key = normalizePokemonKey(pokemon.name);
                const entry = index.get(key);
                if (entry) {
                    if (!entry.activeEventIDs) entry.activeEventIDs = [];
                    if (!entry.activeEventIDs.includes(event.eventID)) {
                        entry.activeEventIDs.push(event.eventID);
                    }
                }
            });
        }
        
        // Shadow Pokemon from events
        if (event.shadowPokemon) {
            event.shadowPokemon.forEach(pokemon => {
                const key = normalizePokemonKey(pokemon.name);
                const entry = index.get(key);
                if (entry) {
                    if (!entry.activeEventIDs) entry.activeEventIDs = [];
                    if (!entry.activeEventIDs.includes(event.eventID)) {
                        entry.activeEventIDs.push(event.eventID);
                    }
                }
            });
        }
    });
    
    // Convert to array and add baseSpecies for forms
    const result = [];
    index.forEach((entry, key) => {
        // Detect forms and set baseSpecies
        const baseSpecies = extractBaseSpecies(entry.name);
        if (baseSpecies !== entry.name) {
            entry.baseSpecies = baseSpecies;
        }
        
        result.push(entry);
    });
    
    // Sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
}

/**
 * Normalizes Pokemon name to consistent lowercase key for lookup.
 * 
 * @param {string} name - Pokemon name to normalize
 * @returns {string} Lowercase trimmed key
 */
function normalizePokemonKey(name) {
    return name.toLowerCase().trim();
}

/**
 * Gets or creates an index entry for a Pokemon key.
 * 
 * @param {Map} index - Pokemon index map
 * @param {string} key - Normalized Pokemon key
 * @param {string} name - Display name to use if creating new entry
 * @returns {PokemonIndexEntry} Index entry (existing or newly created)
 */
function getOrCreateIndexEntry(index, key, name) {
    if (!index.has(key)) {
        index.set(key, {
            name: name,
            sources: [],
            shinyEligible: false,
            cpRange: { min: null, max: null }
        });
    }
    return index.get(key);
}

/**
 * Updates CP range bounds from combat power data.
 * Expands the range if new values are outside current bounds.
 * 
 * @param {PokemonIndexEntry} entry - Index entry to update
 * @param {Object} combatPower - CP data with min/max or normal/boosted
 */
function updateCPRange(entry, combatPower) {
    if (!combatPower) return;
    
    // Handle different CP formats
    let min, max;
    if (combatPower.normal) {
        min = combatPower.normal.min;
        max = combatPower.boosted?.max || combatPower.normal.max;
    } else if (combatPower.min !== undefined) {
        min = combatPower.min;
        max = combatPower.max;
    } else {
        return;
    }
    
    if (entry.cpRange.min === null || min < entry.cpRange.min) {
        entry.cpRange.min = min;
    }
    if (entry.cpRange.max === null || max > entry.cpRange.max) {
        entry.cpRange.max = max;
    }
}

/**
 * Extracts base species name from a Pokemon name with form indicators.
 * Strips regional prefixes, form suffixes, and modifiers.
 * 
 * @param {string} name - Full Pokemon name
 * @returns {string} Base species name
 * 
 * @example
 * extractBaseSpecies("Alolan Ninetales"); // Returns "Ninetales"
 * extractBaseSpecies("Giratina (Origin)"); // Returns "Giratina"
 */
function extractBaseSpecies(name) {
    // Remove form indicators
    const formPatterns = [
        /\s*\(.*?\)\s*/g,           // (Incarnate), (Therian), etc.
        /^Shadow\s+/i,               // Shadow prefix
        /^Mega\s+/i,                 // Mega prefix
        /^Alolan\s+/i,               // Alolan prefix
        /^Galarian\s+/i,             // Galarian prefix
        /^Hisuian\s+/i,              // Hisuian prefix
        /^Paldean\s+/i               // Paldean prefix
    ];
    
    let base = name;
    formPatterns.forEach(pattern => {
        base = base.replace(pattern, '').trim();
    });
    
    return base || name;
}

// ============================================================================
// Shiny Opportunities
// ============================================================================

/**
 * Cross-references shinies with current availability to find hunting opportunities.
 * Categorizes into recent debuts, boosted rates, and permanently available.
 * 
 * @param {Object[]} shinies - Shiny Pokemon data
 * @param {Object[]} raids - Raid boss data
 * @param {Object[]} eggs - Egg pool data
 * @param {Object[]} research - Research task data
 * @param {Object[]} rocketLineups - Team GO Rocket lineup data
 * @param {Object[]} events - Events data
 * @param {Date} now - Current timestamp
 * @returns {Object} Shiny opportunities grouped by category
 */
function buildShinyOpportunities(shinies, raids, eggs, research, rocketLineups, events, now) {
    const opportunities = {
        recentDebuts: [],
        boostedRates: [],
        permanentlyAvailable: []
    };
    
    if (!shinies || !Array.isArray(shinies)) return opportunities;
    
    const MONTH = 30 * 24 * 60 * 60 * 1000;
    
    // Build set of currently available Pokemon
    const availableSet = new Set();
    
    raids.forEach(r => availableSet.add(normalizePokemonKey(r.name)));
    eggs.forEach(e => availableSet.add(normalizePokemonKey(e.name)));
    research.forEach(task => {
        if (task.rewards) {
            task.rewards.forEach(r => {
                if (r.type === 'encounter') availableSet.add(normalizePokemonKey(r.name));
            });
        }
    });
    rocketLineups.forEach(lineup => {
        [lineup.firstPokemon, lineup.secondPokemon, lineup.thirdPokemon].forEach(slot => {
            if (Array.isArray(slot)) {
                slot.forEach(p => {
                    if (p.isEncounter) availableSet.add(normalizePokemonKey(p.name));
                });
            }
        });
    });
    
    // Get active events with shiny bonuses
    const activeShinyEvents = events.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        return start <= now && end > now && e.hasShiny;
    });
    
    // Extract boosted shinies from events
    const boostedShinies = new Set();
    activeShinyEvents.forEach(event => {
        if (event.shinies) {
            event.shinies.forEach(s => boostedShinies.add(normalizePokemonKey(s.name)));
        }
        if (event.featured) {
            event.featured.forEach(f => {
                if (f.canBeShiny) boostedShinies.add(normalizePokemonKey(f.name));
            });
        }
    });
    
    // Process shinies
    shinies.forEach(shiny => {
        const key = normalizePokemonKey(shiny.name);
        const releaseDate = parseShinyDate(shiny.releasedDate);
        const isRecent = releaseDate && (now - releaseDate) < MONTH;
        const isAvailable = availableSet.has(key);
        const isBoosted = boostedShinies.has(key);
        
        if (!isAvailable) return;
        
        const entry = {
            name: shiny.name,
            dexNumber: shiny.dexNumber,
            releasedDate: shiny.releasedDate,
            imageUrl: shiny.imageUrl,
            family: shiny.family
        };
        
        if (isRecent) {
            entry.debutType = 'recent';
            opportunities.recentDebuts.push(entry);
        } else if (isBoosted) {
            entry.boostSource = activeShinyEvents
                .filter(e => {
                    const eventShinies = [...(e.shinies || []), ...(e.featured || [])];
                    return eventShinies.some(s => normalizePokemonKey(s.name) === key);
                })
                .map(e => e.eventID);
            opportunities.boostedRates.push(entry);
        } else {
            opportunities.permanentlyAvailable.push(entry);
        }
    });
    
    // Sort recent debuts by date (newest first)
    opportunities.recentDebuts.sort((a, b) => {
        const dateA = parseShinyDate(a.releasedDate);
        const dateB = parseShinyDate(b.releasedDate);
        return (dateB || 0) - (dateA || 0);
    });
    
    // Limit permanently available for file size
    opportunities.permanentlyAvailable = opportunities.permanentlyAvailable.slice(0, 100);
    
    return opportunities;
}

/**
 * Parses shiny release date string into Date object.
 * 
 * @param {string} dateStr - Date in "YYYY/MM/DD" format
 * @returns {Date|null} Parsed Date or null if invalid
 */
function parseShinyDate(dateStr) {
    if (!dateStr) return null;
    // Format: "2018/03/25"
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Main function that generates contextual.json from all data sources.
 * Loads all scraped data, builds contextual aggregations, and writes output files.
 * 
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run after all scrapers complete:
 * // node src/scrapers/combineContextual.js
 * // Creates data/contextual.json and data/contextual.min.json
 */
function main() {
    console.log('Generating contextual.json...');
    
    const now = new Date();
    
    // Load all data files
    const eventsData = loadDataFile('events.min.json');
    
    // Flatten eventType-keyed structure into array
    let events = [];
    if (eventsData && typeof eventsData === 'object') {
        // New structure: { "event-type": [...], "another-type": [...] }
        Object.values(eventsData).forEach(typeArray => {
            if (Array.isArray(typeArray)) {
                events = events.concat(typeArray);
            }
        });
    }
    
    const raids = loadDataFile('raids.min.json');
    const eggs = loadDataFile('eggs.min.json');
    const research = loadDataFile('research.min.json');
    const rocketLineups = loadDataFile('rocketLineups.min.json');
    const shinies = loadDataFile('shinies.min.json');
    
    // Validate required data
    if (!events || !raids || !eggs || !research || !rocketLineups) {
        console.error('Failed to load required data files');
        process.exit(1);
    }
    
    // Build contextual data
    const contextual = {
        timeline: buildTimeline(events, now),
        currentAvailability: buildCurrentAvailability(raids, eggs, research, rocketLineups, events, now),
        pokemonIndex: buildPokemonIndex(raids, eggs, research, rocketLineups, shinies, events, now),
        shinyOpportunities: buildShinyOpportunities(shinies, raids, eggs, research, rocketLineups, events, now)
    };
    
    // Write output files
    fs.writeFile('data/contextual.min.json', JSON.stringify(contextual), err => {
        if (err) {
            console.error('Error writing contextual.min.json:', err);
            process.exit(1);
        }
        console.log('Created data/contextual.min.json');
    });
}

try {
    main();
} catch (e) {
    console.error('ERROR: ' + e);
    process.exit(1);
}
