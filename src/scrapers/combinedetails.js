/**
 * @fileoverview Event details combiner.
 * Merges scraped event detail data from temporary files back into
 * the main events.json file, generates per-eventType files, then cleans up temp files.
 * @module scrapers/combinedetails
 */

const fs = require('fs');
const path = require('path');

/**
 * Sanitizes an event type to a safe filename.
 * 
 * @param {string} type - Event type string
 * @returns {string} Safe filename segment
 */
function sanitizeType(type) {
    return String(type || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Segments event data into logical sections for better organization.
 * Moves event-specific fields into nested objects: flags, pokemon, rewards, raids, battle, rocket.
 * 
 * @param {Object} event - Event object with flat structure
 * @returns {Object} Event with segmented structure
 */
function segmentEventData(event) {
    const segmented = {
        eventID: event.eventID,
        name: event.name,
        eventType: event.eventType,
        heading: event.heading,
        image: event.image,
        start: event.start,
        end: event.end
    };

    // Flags section
    segmented.flags = {
        hasSpawns: event.hasSpawns || false,
        hasFieldResearchTasks: event.hasFieldResearchTasks || false,
        hasBonuses: event.hasBonuses || false,
        hasRaids: event.hasRaids || false,
        hasEggs: event.hasEggs || false,
        hasShiny: event.hasShiny || false
    };

    // Pokemon section
    const pokemon = {};
    if (event.spawns) pokemon.spawns = event.spawns;
    if (event.shinies) pokemon.shinies = event.shinies;
    if (event.featured) pokemon.featured = event.featured;
    if (event.photobomb) pokemon.photobomb = event.photobomb;
    if (event.pokestopShowcases) pokemon.showcases = event.pokestopShowcases;
    if (event.incenseEncounters) pokemon.incense = event.incenseEncounters;
    if (event.costumedPokemon) pokemon.costumed = event.costumedPokemon;
    if (event.pokemonDebuts) pokemon.debuts = event.pokemonDebuts;
    if (event.maxPokemonDebuts) pokemon.maxDebuts = event.maxPokemonDebuts;
    if (event.shinyDebuts) pokemon.shinyDebuts = event.shinyDebuts;
    if (Object.keys(pokemon).length > 0) segmented.pokemon = pokemon;

    // Rewards section
    const rewards = {};
    if (event.bonuses) rewards.bonuses = event.bonuses;
    if (event.bonusDisclaimers) rewards.bonusDisclaimers = event.bonusDisclaimers;
    if (event.lureModuleBonus) rewards.lureModuleBonus = event.lureModuleBonus;
    
    const research = {};
    if (event.fieldResearchTasks) research.field = event.fieldResearchTasks;
    if (event.specialresearch) research.special = event.specialresearch;
    if (event.timedResearch) research.timed = event.timedResearch;
    if (event.researchBreakthrough) research.breakthrough = event.researchBreakthrough;
    if (event.masterworkResearch) research.masterwork = event.masterworkResearch;
    if (Object.keys(research).length > 0) rewards.research = research;
    
    if (event.ticketedResearch) rewards.ticket = event.ticketedResearch;
    if (event.ticketBonuses) rewards.ticketBonuses = event.ticketBonuses;
    if (event.ticketPrice) rewards.ticketPrice = event.ticketPrice;
    if (event.exclusiveBonuses) rewards.exclusiveBonuses = event.exclusiveBonuses;
    if (event.ticketAddOns) rewards.ticketAddOns = event.ticketAddOns;
    if (Object.keys(rewards).length > 0) segmented.rewards = rewards;

    // Raids section
    const raids = {};
    if (event.bosses) raids.bosses = event.bosses;
    if (event.tiers) raids.tiers = event.tiers;
    if (event.alternationPattern) raids.alternation = event.alternationPattern;
    if (event.featuredAttacks) raids.featuredAttacks = event.featuredAttacks;
    if (Object.keys(raids).length > 0) segmented.raids = raids;

    // Battle section
    const battle = {};
    if (event.featuredAttack) battle.featuredAttack = event.featuredAttack;
    if (event.leagues) battle.leagues = event.leagues;
    if (Object.keys(battle).length > 0) segmented.battle = battle;

    // Rocket section
    const rocket = {};
    if (event.shadowPokemon) rocket.shadows = event.shadowPokemon;
    if (event.leaders) rocket.leaders = event.leaders;
    if (event.giovanni) rocket.giovanni = event.giovanni;
    if (event.grunts) rocket.grunts = event.grunts;
    if (Object.keys(rocket).length > 0) segmented.rocket = rocket;

    // Season-specific
    if (event.eggs) segmented.eggs = event.eggs;
    if (event.communityDays) segmented.communityDays = event.communityDays;
    if (event.features) segmented.features = event.features;
    if (event.goBattleLeague) segmented.goBattleLeague = event.goBattleLeague;
    if (event.goPass) segmented.goPass = event.goPass;
    
    // GO Tour specific
    if (event.eventInfo) segmented.eventInfo = event.eventInfo;
    if (event.habitats) segmented.habitats = event.habitats;
    if (event.whatsNew) segmented.whatsNew = event.whatsNew;
    if (event.sales) segmented.sales = event.sales;
    
    // Special properties
    if (event.canBeShiny !== undefined) segmented.canBeShiny = event.canBeShiny;
    if (event.bonus) segmented.bonus = event.bonus;
    if (event.description) segmented.description = event.description;

    return segmented;
}

/**
 * Generates per-eventType JSON files from the events array.
 * Creates data/eventTypes/ directory and writes both formatted and minified
 * versions for each event type.
 * 
 * @param {Object[]} events - Array of event objects
 * @returns {void}
 */
function generateEventTypeFiles(events) {
    const outputDir = './data/eventTypes';
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Clear existing JSON files to avoid stale types
    if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(outputDir, file));
            }
        });
    }
    
    // Group events by type and segment each event
    const grouped = new Map();
    events.forEach(event => {
        const segmentedEvent = segmentEventData(event);
        const type = segmentedEvent.eventType || 'unknown';
        if (!grouped.has(type)) {
            grouped.set(type, []);
        }
        grouped.get(type).push(segmentedEvent);
    });
    
    // Write per-type files
    grouped.forEach((items, type) => {
        const safeType = sanitizeType(type);
        const minPath = path.join(outputDir, `${safeType}.min.json`);
        
        fs.writeFileSync(minPath, JSON.stringify(items));
    });
    
    console.log(`Generated ${grouped.size} eventType files in ${outputDir}`);
}

/**
 * Main function that combines detailed event data with base events.
 * Reads all temporary JSON files from data/temp, matches them to events
 * by ID, merges the detailed data, writes updated events files,
 * generates per-eventType files, and finally cleans up the temporary directory.
 * 
 * Supported event types for merging:
 * - generic (meta flags)
 * - research-breakthrough, pokemon-spotlight-hour, community-day
 * - raid-battles, raid-hour, raid-day
 * - team-go-rocket, go-rocket-takeover, go-battle-league
 * - season, pokemon-go-tour, timed-research, special-research
 * - max-battles, max-mondays, go-pass, pokestop-showcase
 * - event, promo-codes
 * 
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run after detailedscrape.js completes:
 * // node src/scrapers/combinedetails.js
 * // Updates data/events.json with detailed event data
 * // Generates data/eventTypes/*.json files
 */
function main()
{
    var events = JSON.parse(fs.readFileSync("./data/events.min.json"));

    fs.readdir("data/temp", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(f =>
        {
            var data = JSON.parse(fs.readFileSync("./data/temp/" + f));

            events.forEach(e =>
            {
                if (e.eventID == data.id)
                {
                    // add generic data fields directly to event (available for all possible events)
                    if (data.type == "generic")
                    {
                        Object.assign(e, data.data);
                    }
                    // add event specific data directly to event object
                    if (data.type == "research-breakthrough" ||
                        data.type == "pokemon-spotlight-hour" ||
                        data.type == "community-day" ||
                        data.type == "raid-battles" ||
                        data.type == "raid-hour" ||
                        data.type == "raid-day" ||
                        data.type == "team-go-rocket" ||
                        data.type == "go-rocket-takeover" ||
                        data.type == "go-battle-league" ||
                        data.type == "season" ||
                        data.type == "pokemon-go-tour" ||
                        data.type == "timed-research" ||
                        data.type == "special-research" ||
                        data.type == "max-battles" ||
                        data.type == "max-mondays" ||
                        data.type == "go-pass" ||
                        data.type == "pokestop-showcase" ||
                        data.type == "event" ||
                        data.type == "promo-codes")
                    {
                        Object.assign(e, data.data);
                    }
                }
            });
        });

        // Group events by eventType with segmented structure
        const eventsByType = {};
        events.forEach(event => {
            const segmentedEvent = segmentEventData(event);
            const type = segmentedEvent.eventType || 'unknown';
            if (!eventsByType[type]) {
                eventsByType[type] = [];
            }
            eventsByType[type].push(segmentedEvent);
        });

        // Write main events file with eventType-keyed structure
        fs.writeFile('data/events.min.json', JSON.stringify(eventsByType), err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Created data/events.min.json with eventType-keyed structure');
        });

        // Generate per-eventType files (keeping for backwards compatibility)
        generateEventTypeFiles(events);

        fs.rm("data/temp", { recursive: true }, (err) => {
            if (err) { throw err; }
        });
    });
}

try
{
    main();
}
catch (e)
{
    console.error("ERROR: " + e);
    process.exit(1);
}