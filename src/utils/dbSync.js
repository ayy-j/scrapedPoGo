/**
 * @fileoverview Database synchronization functions for the scraper pipeline.
 * Each function maps one scraped dataset to its corresponding Postgres table(s).
 * All functions are safe to call when the database is unavailable — they
 * return silently so the existing JSON-file pipeline is never blocked.
 * @module utils/dbSync
 */

const { getClient, isEnabled } = require('./database');
const logger = require('./logger');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a value as JSON string for parameterized JSONB inserts. */
function jsonb(value) {
    if (value === undefined || value === null) return null;
    return JSON.stringify(value);
}

/** Safely truncate a string to a max length. */
function trunc(str, len = 1000) {
    if (!str) return str;
    return str.length > len ? str.slice(0, len) : str;
}

// ---------------------------------------------------------------------------
// Scrape Runs
// ---------------------------------------------------------------------------

/**
 * Creates a new scrape_run record and returns its id.
 * @param {string} pipelineStep - e.g. "scrape", "detailedscrape", "combinedetails", "combineall"
 * @returns {Promise<number|null>} The run id, or null if DB is unavailable.
 */
async function startRun(pipelineStep) {
    if (!isEnabled()) return null;
    const sql = getClient();
    try {
        const rows = await sql`
            INSERT INTO scrape_runs (pipeline_step, status)
            VALUES (${pipelineStep}, 'running')
            RETURNING id
        `;
        const runId = rows[0]?.id ?? null;
        if (runId) logger.info(`DB: scrape_run #${runId} started (${pipelineStep})`);
        return runId;
    } catch (err) {
        logger.error('DB startRun failed: ' + err.message);
        return null;
    }
}

/**
 * Marks a scrape_run as completed with optional stats.
 * @param {number} runId
 * @param {object} [stats] - Optional summary stats
 */
async function completeRun(runId, stats = null) {
    if (!isEnabled() || !runId) return;
    const sql = getClient();
    try {
        await sql`
            UPDATE scrape_runs
            SET completed_at = NOW(),
                status = 'completed',
                stats = ${jsonb(stats)}
            WHERE id = ${runId}
        `;
    } catch (err) {
        logger.error('DB completeRun failed: ' + err.message);
    }
}

/**
 * Marks a scrape_run as failed.
 * @param {number} runId
 * @param {string} errorMessage
 */
async function failRun(runId, errorMessage) {
    if (!isEnabled() || !runId) return;
    const sql = getClient();
    try {
        await sql`
            UPDATE scrape_runs
            SET completed_at = NOW(),
                status = 'failed',
                error_message = ${trunc(errorMessage, 2000)}
            WHERE id = ${runId}
        `;
    } catch (err) {
        logger.error('DB failRun failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Events  (from events.js page scraper — basic event list)
// ---------------------------------------------------------------------------

/**
 * Syncs the basic event list (pre-detail-merge) to the events table.
 * Each event is inserted as a new row keyed by (event_id, scraped_at).
 *
 * @param {Object[]} events - Array of event objects from events.js
 * @param {number|null} runId - scrape_run id
 */
async function syncEvents(events, runId) {
    if (!isEnabled() || !events?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const e of events) {
            await sql`
                INSERT INTO events (event_id, name, event_type, heading,
                    image_url, image_width, image_height, image_type,
                    start_time, end_time, is_global, event_status,
                    detail_data, scrape_run_id, scraped_at)
                VALUES (
                    ${e.eventID},
                    ${e.name},
                    ${e.eventType},
                    ${e.heading || null},
                    ${e.image || null},
                    ${e.imageWidth || null},
                    ${e.imageHeight || null},
                    ${e.imageType || null},
                    ${e.start || null},
                    ${e.end || null},
                    ${false},
                    ${'active'},
                    ${jsonb({})},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${events.length} events`);
    } catch (err) {
        logger.error('DB syncEvents failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Events (enriched — from combinedetails.js after detail merge + segmentation)
// ---------------------------------------------------------------------------

/**
 * Syncs the fully enriched & segmented events from combinedetails.
 * These events contain detail_data with pokemon, raids, bonuses, etc.
 * Also populates the event_pokemon junction table.
 *
 * @param {Object[]} events - Segmented event objects from combinedetails
 * @param {number|null} runId
 */
async function syncEnrichedEvents(events, runId) {
    if (!isEnabled() || !events?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const e of events) {
            // Build the detail_data JSONB from all the flattened detail fields
            const detailKeys = [
                'pokemon', 'raids', 'battle', 'rocket', 'eggs', 'bonuses',
                'bonusDisclaimers', 'lureModuleBonus', 'exclusiveBonuses',
                'research', 'rewards', 'showcases', 'shinies', 'shinyDebuts',
                'photobomb', 'communityDays', 'features', 'goBattleLeague',
                'goPass', 'pricing', 'pointTasks', 'ranks', 'featuredPokemon',
                'milestoneBonuses', 'eventInfo', 'habitats', 'whatsNew', 'sales',
                'customSections', 'maxBattles', 'maxMondays', 'description',
                'canBeShiny', 'bonus', 'raidAlternation', 'raidFeaturedAttacks'
            ];
            const detailData = {};
            for (const key of detailKeys) {
                if (e[key] !== undefined && e[key] !== null) {
                    detailData[key] = e[key];
                }
            }

            await sql`
                INSERT INTO events (event_id, name, event_type, heading,
                    image_url, image_width, image_height, image_type,
                    start_time, end_time, is_global, event_status,
                    detail_data, scrape_run_id, scraped_at)
                VALUES (
                    ${e.eventID},
                    ${e.name},
                    ${e.eventType},
                    ${e.heading || null},
                    ${e.image || null},
                    ${e.imageWidth || null},
                    ${e.imageHeight || null},
                    ${e.imageType || null},
                    ${e.start || null},
                    ${e.end || null},
                    ${e.isGlobal || false},
                    ${e.eventStatus || 'active'},
                    ${jsonb(detailData)},
                    ${runId},
                    ${now}
                )
            `;

            // Populate event_pokemon junction from pokemon array
            const pokemonList = e.pokemon || [];
            for (const p of pokemonList) {
                if (!p.name) continue;
                await sql`
                    INSERT INTO event_pokemon (event_id, pokemon_name, source,
                        can_be_shiny, image_url, scrape_run_id, scraped_at)
                    VALUES (
                        ${e.eventID},
                        ${p.name},
                        ${p.source || null},
                        ${p.canBeShiny || false},
                        ${p.image || null},
                        ${runId},
                        ${now}
                    )
                `;
            }
        }
        logger.info(`DB: synced ${events.length} enriched events`);
    } catch (err) {
        logger.error('DB syncEnrichedEvents failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Event Type Snapshots
// ---------------------------------------------------------------------------

/**
 * Syncs per-eventType grouped data to event_type_snapshots.
 *
 * @param {Object} eventsByType - { eventType: [...events] }
 * @param {number|null} runId
 */
async function syncEventTypeSnapshots(eventsByType, runId) {
    if (!isEnabled() || !eventsByType) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const [eventType, items] of Object.entries(eventsByType)) {
            await sql`
                INSERT INTO event_type_snapshots (event_type, snapshot_data, scrape_run_id, scraped_at)
                VALUES (${eventType}, ${jsonb(items)}, ${runId}, ${now})
            `;
        }
        logger.info(`DB: synced ${Object.keys(eventsByType).length} event type snapshots`);
    } catch (err) {
        logger.error('DB syncEventTypeSnapshots failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Raids
// ---------------------------------------------------------------------------

/**
 * Syncs raid boss data to the raids table.
 *
 * @param {Object[]} raids - Array of RaidBoss objects from raids.js
 * @param {number|null} runId
 */
async function syncRaids(raids, runId) {
    if (!isEnabled() || !raids?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const r of raids) {
            await sql`
                INSERT INTO raids (name, original_name, form, gender, tier,
                    is_shadow_raid, event_status, can_be_shiny,
                    types, combat_power, boosted_weather,
                    image_url, image_width, image_height, image_type,
                    scrape_run_id, scraped_at)
                VALUES (
                    ${r.name},
                    ${r.originalName || null},
                    ${r.form || null},
                    ${r.gender || null},
                    ${r.tier},
                    ${r.isShadowRaid || false},
                    ${r.eventStatus || 'unknown'},
                    ${r.canBeShiny || false},
                    ${jsonb(r.types || [])},
                    ${jsonb(r.combatPower || {})},
                    ${jsonb(r.boostedWeather || [])},
                    ${r.image || null},
                    ${r.imageWidth || null},
                    ${r.imageHeight || null},
                    ${r.imageType || null},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${raids.length} raids`);
    } catch (err) {
        logger.error('DB syncRaids failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Eggs
// ---------------------------------------------------------------------------

/**
 * Syncs egg hatch pool data to the eggs table.
 *
 * @param {Object[]} eggs - Array of EggPokemon objects from eggs.js
 * @param {number|null} runId
 */
async function syncEggs(eggs, runId) {
    if (!isEnabled() || !eggs?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const e of eggs) {
            await sql`
                INSERT INTO eggs (pokemon_name, egg_type, is_adventure_sync,
                    can_be_shiny, combat_power_min, combat_power_max,
                    is_regional, is_gift_exchange, rarity,
                    image_url, image_width, image_height, image_type,
                    scrape_run_id, scraped_at)
                VALUES (
                    ${e.name},
                    ${e.eggType},
                    ${e.isAdventureSync || false},
                    ${e.canBeShiny || false},
                    ${e.combatPower?.min || null},
                    ${e.combatPower?.max || null},
                    ${e.isRegional || false},
                    ${e.isGiftExchange || false},
                    ${e.rarity || 0},
                    ${e.image || null},
                    ${e.imageWidth || null},
                    ${e.imageHeight || null},
                    ${e.imageType || null},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${eggs.length} eggs`);
    } catch (err) {
        logger.error('DB syncEggs failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Research Tasks
// ---------------------------------------------------------------------------

/**
 * Syncs field research task data to the research_tasks table.
 *
 * @param {Object[]} research - Array of ResearchTask objects from research.js
 * @param {number|null} runId
 */
async function syncResearch(research, runId) {
    if (!isEnabled() || !research?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const task of research) {
            await sql`
                INSERT INTO research_tasks (task_text, research_type, rewards,
                    scrape_run_id, scraped_at)
                VALUES (
                    ${task.text},
                    ${task.type || null},
                    ${jsonb(task.rewards || [])},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${research.length} research tasks`);
    } catch (err) {
        logger.error('DB syncResearch failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Shinies
// ---------------------------------------------------------------------------

/**
 * Syncs shiny Pokemon availability data to the shinies table.
 *
 * @param {Object[]} shinies - Array of ShinyPokemon objects from shinies.js
 * @param {number|null} runId
 */
async function syncShinies(shinies, runId) {
    if (!isEnabled() || !shinies?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const s of shinies) {
            await sql`
                INSERT INTO shinies (dex_number, name, released_date,
                    family, region, forms,
                    image_url, image_width, image_height,
                    scrape_run_id, scraped_at)
                VALUES (
                    ${s.dexNumber},
                    ${s.name},
                    ${s.releasedDate || null},
                    ${s.family || null},
                    ${s.region || null},
                    ${jsonb(s.forms || [])},
                    ${s.image || null},
                    ${s.imageWidth || null},
                    ${s.imageHeight || null},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${shinies.length} shinies`);
    } catch (err) {
        logger.error('DB syncShinies failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Rocket Lineups
// ---------------------------------------------------------------------------

/**
 * Syncs Team GO Rocket lineup data to the rocket_lineups table.
 *
 * @param {Object[]} lineups - Array of RocketLineup objects from rocketLineups.js
 * @param {number|null} runId
 */
async function syncRocketLineups(lineups, runId) {
    if (!isEnabled() || !lineups?.length) return;
    const sql = getClient();
    const now = new Date().toISOString();
    try {
        for (const l of lineups) {
            await sql`
                INSERT INTO rocket_lineups (member_name, title, type_specialization,
                    slots, scrape_run_id, scraped_at)
                VALUES (
                    ${l.name},
                    ${l.title || null},
                    ${l.type || null},
                    ${jsonb(l.slots || [])},
                    ${runId},
                    ${now}
                )
            `;
        }
        logger.info(`DB: synced ${lineups.length} rocket lineups`);
    } catch (err) {
        logger.error('DB syncRocketLineups failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Pokemon Index  (from combineAll.js)
// ---------------------------------------------------------------------------

/**
 * Syncs the master pokemon index using upsert (ON CONFLICT on normalized_name).
 * Updates last_seen_at and merges sources on subsequent scrapes.
 *
 * @param {Object} pokemonIndex - Object keyed by normalized name from combineAll
 * @param {number|null} runId
 */
async function syncPokemonIndex(pokemonIndex) {
    if (!isEnabled() || !pokemonIndex) return;
    const sql = getClient();
    try {
        const entries = Object.entries(pokemonIndex);
        for (const [normalizedName, p] of entries) {
            await sql`
                INSERT INTO pokemon_index (name, normalized_name, dex_number,
                    family, region, can_be_shiny, types, sources,
                    first_seen_at, last_seen_at)
                VALUES (
                    ${p.name},
                    ${normalizedName},
                    ${p.dexNumber || null},
                    ${p.family || null},
                    ${null},
                    ${p.canBeShiny || false},
                    ${jsonb(p.types || [])},
                    ${jsonb(p.sources || [])},
                    NOW(),
                    NOW()
                )
                ON CONFLICT (normalized_name) DO UPDATE SET
                    can_be_shiny = EXCLUDED.can_be_shiny OR pokemon_index.can_be_shiny,
                    types = COALESCE(NULLIF(EXCLUDED.types, '[]'::jsonb), pokemon_index.types),
                    sources = EXCLUDED.sources,
                    last_seen_at = NOW()
            `;
        }
        logger.info(`DB: synced ${entries.length} pokemon index entries`);
    } catch (err) {
        logger.error('DB syncPokemonIndex failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Unified Snapshots (from combineAll.js)
// ---------------------------------------------------------------------------

/**
 * Stores a versioned unified data snapshot.
 *
 * @param {Object} unified - The full unified data object
 * @param {number|null} runId
 */
async function syncUnifiedSnapshot(unified, runId) {
    if (!isEnabled() || !unified) return;
    const sql = getClient();
    try {
        await sql`
            INSERT INTO unified_snapshots (version, stats, indices, meta, scrape_run_id)
            VALUES (
                ${unified.meta?.version || '1.0.0'},
                ${jsonb(unified.stats || {})},
                ${jsonb(unified.indices || {})},
                ${jsonb(unified.meta || {})},
                ${runId}
            )
        `;
        logger.info('DB: synced unified snapshot');
    } catch (err) {
        logger.error('DB syncUnifiedSnapshot failed: ' + err.message);
    }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
    startRun,
    completeRun,
    failRun,
    syncEvents,
    syncEnrichedEvents,
    syncEventTypeSnapshots,
    syncRaids,
    syncEggs,
    syncResearch,
    syncShinies,
    syncRocketLineups,
    syncPokemonIndex,
    syncUnifiedSnapshot
};
