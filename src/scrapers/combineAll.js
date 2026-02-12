/**
 * combineAll.js
 * 
 * Generates a unified comprehensive data file that includes all scraped datasets,
 * metadata, and indices for cross-referencing Pokemon across different contexts.
 * 
 * Usage: npm run combineall
 * 
 * Output: data/unified.min.json
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { transformUrls, isEnabled: isBlobEnabled } = require('../utils/blobUrls');

const DATA_DIR = path.join(__dirname, '../../data');
const EVENT_TYPES_DIR = path.join(DATA_DIR, 'eventTypes');

// Helper to safely read JSON file
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        logger.warn(`Could not read ${filePath}: ${err.message}`);
        return [];
    }
}

// Helper to read all eventType files
async function readEventTypeFiles() {
    const eventTypes = {};
    try {
        const files = await fs.promises.readdir(EVENT_TYPES_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.min.json'));

        const results = await Promise.all(jsonFiles.map(async (file) => {
            const typeName = file.replace('.min.json', '');
            const fullPath = path.join(EVENT_TYPES_DIR, file);
            try {
                const content = await fs.promises.readFile(fullPath, 'utf8');
                return { typeName, data: JSON.parse(content) };
            } catch (err) {
                logger.warn(`Could not read ${fullPath}: ${err.message}`);
                return { typeName, data: [] };
            }
        }));

        for (const { typeName, data } of results) {
            eventTypes[typeName] = data;
        }
    } catch (err) {
        logger.warn(`Could not read eventTypes directory: ${err.message}`);
    }
    return eventTypes;
}

// Normalize Pokemon name for indexing (lowercase, no special chars)
function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/['']/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim();
}

// Extract dex number from image URL if possible (e.g., pm123.icon.png -> 123)
function extractDexFromImage(imageUrl) {
    if (!imageUrl) return null;
    const match = imageUrl.match(/pm(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

// Build Pokemon index from shinies data (primary source of dex numbers)
function buildPokemonIndex(shinies, raids, eggs, research, rocketLineups) {
    const index = {};
    
    // First pass: shinies have authoritative dex numbers
    for (const shiny of shinies) {
        const key = normalizeName(shiny.name);
        if (!index[key]) {
            index[key] = {
                name: shiny.name,
                dexNumber: shiny.dexNumber,
                family: shiny.family || null,
                typeCode: shiny.typeCode || null,
                canBeShiny: true,
                sources: ['shinies']
            };
        }
    }
    
    // Second pass: add Pokemon from raids
    for (const raid of raids) {
        const key = normalizeName(raid.name);
        const dex = extractDexFromImage(raid.image);
        if (!index[key]) {
            index[key] = {
                name: raid.name,
                dexNumber: dex,
                family: null,
                typeCode: null,
                canBeShiny: raid.canBeShiny || false,
                sources: []
            };
        }
        if (!index[key].sources.includes('raids')) {
            index[key].sources.push('raids');
        }
        if (raid.canBeShiny) {
            index[key].canBeShiny = true;
        }
        // Add types if available
        if (raid.types && raid.types.length > 0) {
            index[key].types = raid.types.map(t => t.name);
        }
    }
    
    // Third pass: add Pokemon from eggs
    for (const egg of eggs) {
        const key = normalizeName(egg.name);
        const dex = extractDexFromImage(egg.image);
        if (!index[key]) {
            index[key] = {
                name: egg.name,
                dexNumber: dex,
                family: null,
                typeCode: null,
                canBeShiny: egg.canBeShiny || false,
                sources: []
            };
        }
        if (!index[key].sources.includes('eggs')) {
            index[key].sources.push('eggs');
        }
        if (egg.canBeShiny) {
            index[key].canBeShiny = true;
        }
    }
    
    // Fourth pass: add Pokemon from research rewards
    for (const task of research) {
        for (const reward of task.rewards || []) {
            if (reward.type === 'encounter' && reward.name) {
                const key = normalizeName(reward.name);
                const dex = extractDexFromImage(reward.image);
                if (!index[key]) {
                    index[key] = {
                        name: reward.name,
                        dexNumber: dex,
                        family: null,
                        typeCode: null,
                        canBeShiny: reward.canBeShiny || false,
                        sources: []
                    };
                }
                if (!index[key].sources.includes('research')) {
                    index[key].sources.push('research');
                }
                if (reward.canBeShiny) {
                    index[key].canBeShiny = true;
                }
            }
        }
    }
    
    // Fifth pass: add Pokemon from Rocket lineups
    for (const lineup of rocketLineups) {
        const allSlots = (lineup.slots || []).flat();
        for (const pokemon of allSlots) {
            if (pokemon.name) {
                const key = normalizeName(pokemon.name);
                const dex = extractDexFromImage(pokemon.image);
                if (!index[key]) {
                    index[key] = {
                        name: pokemon.name,
                        dexNumber: dex,
                        family: null,
                        typeCode: null,
                        canBeShiny: pokemon.canBeShiny || false,
                        sources: []
                    };
                }
                if (!index[key].sources.includes('rockets')) {
                    index[key].sources.push('rockets');
                }
                if (pokemon.canBeShiny) {
                    index[key].canBeShiny = true;
                }
                // Add types if available
                if (pokemon.types && pokemon.types.length > 0 && !index[key].types) {
                    index[key].types = pokemon.types;
                }
            }
        }
    }
    
    return index;
}

// Build indices for quick lookups
function buildIndices(data) {
    const indices = {};
    
    // Events by ID
    indices.eventsById = {};
    for (const event of data.events) {
        if (event.eventID) {
            indices.eventsById[event.eventID] = event;
        }
    }
    
    // Events by type
    indices.eventsByType = {};
    for (const event of data.events) {
        const type = event.eventType || 'unknown';
        if (!indices.eventsByType[type]) {
            indices.eventsByType[type] = [];
        }
        indices.eventsByType[type].push(event.eventID);
    }
    
    // Raids by tier
    indices.raidsByTier = {};
    for (const raid of data.raids) {
        const tier = raid.tier || 'unknown';
        if (!indices.raidsByTier[tier]) {
            indices.raidsByTier[tier] = [];
        }
        indices.raidsByTier[tier].push(raid.name);
    }
    
    // Raids by Pokemon name
    indices.raidsByPokemon = {};
    for (let i = 0; i < data.raids.length; i++) {
        const raid = data.raids[i];
        const key = normalizeName(raid.name);
        if (!indices.raidsByPokemon[key]) {
            indices.raidsByPokemon[key] = [];
        }
        indices.raidsByPokemon[key].push(i);
    }
    
    // Eggs by distance
    indices.eggsByDistance = {};
    for (let i = 0; i < data.eggs.length; i++) {
        const egg = data.eggs[i];
        const distance = egg.eggType || 'unknown';
        if (!indices.eggsByDistance[distance]) {
            indices.eggsByDistance[distance] = [];
        }
        indices.eggsByDistance[distance].push(i);
    }
    
    // Research by type
    indices.researchByType = {};
    for (let i = 0; i < data.research.length; i++) {
        const task = data.research[i];
        const type = task.type || 'unknown';
        if (!indices.researchByType[type]) {
            indices.researchByType[type] = [];
        }
        indices.researchByType[type].push(i);
    }
    
    // Shinies by dex number
    indices.shiniesByDex = {};
    for (let i = 0; i < data.shinies.length; i++) {
        const shiny = data.shinies[i];
        if (shiny.dexNumber) {
            if (!indices.shiniesByDex[shiny.dexNumber]) {
                indices.shiniesByDex[shiny.dexNumber] = [];
            }
            indices.shiniesByDex[shiny.dexNumber].push(i);
        }
    }
    
    // Shinies by name
    indices.shiniesByName = {};
    for (let i = 0; i < data.shinies.length; i++) {
        const shiny = data.shinies[i];
        const key = normalizeName(shiny.name);
        indices.shiniesByName[key] = i;
    }
    
    // Rockets by type
    indices.rocketsByType = {};
    for (let i = 0; i < data.rocketLineups.length; i++) {
        const lineup = data.rocketLineups[i];
        const type = lineup.type || 'leader';
        if (!indices.rocketsByType[type]) {
            indices.rocketsByType[type] = [];
        }
        indices.rocketsByType[type].push(i);
    }
    
    return indices;
}

// Calculate statistics
function calculateStats(data) {
    return {
        totalEvents: data.events.length,
        totalRaids: data.raids.length,
        totalEggs: data.eggs.length,
        totalResearch: data.research.length,
        totalShinies: data.shinies.length,
        totalRocketLineups: data.rocketLineups.length,
        totalUniquePokemon: Object.keys(data.pokemonIndex).length,
        eventTypesCounts: Object.fromEntries(
            Object.entries(data.eventTypes).map(([k, v]) => [k, v.length])
        ),
        raidTierCounts: Object.fromEntries(
            Object.entries(data.indices.raidsByTier).map(([k, v]) => [k, v.length])
        ),
        eggDistanceCounts: Object.fromEntries(
            Object.entries(data.indices.eggsByDistance).map(([k, v]) => [k, v.length])
        )
    };
}

async function main() {
    logger.start('Building unified data file...');
    
    // Read all data files
    logger.info('Reading data files...');
    const events = readJsonFile(path.join(DATA_DIR, 'events.min.json'));
    const raids = readJsonFile(path.join(DATA_DIR, 'raids.min.json'));
    const eggs = readJsonFile(path.join(DATA_DIR, 'eggs.min.json'));
    const research = readJsonFile(path.join(DATA_DIR, 'research.min.json'));
    const shinies = readJsonFile(path.join(DATA_DIR, 'shinies.min.json'));
    const rocketLineups = readJsonFile(path.join(DATA_DIR, 'rocketLineups.min.json'));
    const eventTypes = await readEventTypeFiles();
    
    logger.info(`  Events: ${events.length}`);
    logger.info(`  Raids: ${raids.length}`);
    logger.info(`  Eggs: ${eggs.length}`);
    logger.info(`  Research: ${research.length}`);
    logger.info(`  Shinies: ${shinies.length}`);
    logger.info(`  Rocket Lineups: ${rocketLineups.length}`);
    logger.info(`  Event Types: ${Object.keys(eventTypes).length}`);
    
    // Build Pokemon index
    logger.info('Building Pokemon index...');
    const pokemonIndex = buildPokemonIndex(shinies, raids, eggs, research, rocketLineups);
    logger.info(`  Unique Pokemon: ${Object.keys(pokemonIndex).length}`);
    
    // Create unified data structure
    const unified = {
        meta: {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            schemaVersion: '1.0'
        },
        events,
        eventTypes,
        raids,
        eggs,
        research,
        shinies,
        rocketLineups,
        pokemonIndex
    };
    
    // Build indices
    logger.info('Building indices...');
    unified.indices = buildIndices(unified);
    
    // Calculate statistics
    logger.info('Calculating statistics...');
    unified.stats = calculateStats(unified);
    
    // Transform all image URLs to blob URLs if enabled
    let outputData = unified;
    if (isBlobEnabled()) {
        logger.info('Transforming image URLs to blob storage...');
        outputData = transformUrls(unified);
        // Update imageBase in meta
        outputData.meta.imageBase = 'https://pokemn.quest/images/';
    }

    // Write minified file
    const minifiedPath = path.join(DATA_DIR, 'unified.min.json');
    fs.writeFileSync(minifiedPath, JSON.stringify(outputData));
    const minSize = fs.statSync(minifiedPath).size;
    logger.success(`Wrote: ${minifiedPath} (${(minSize / 1024).toFixed(1)} KB)`);
    
    // Print summary
    logger.info(`Summary: ${JSON.stringify(unified.stats)}`);
}

main().catch(err => {
    logger.error(err);
    process.exit(1);
});
