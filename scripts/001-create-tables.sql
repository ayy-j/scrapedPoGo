-- ============================================================
-- Pokemon GO Scraper: Database Schema Migration
-- Creates all tables, indexes, and constraints for persistent
-- storage of scraped Pokemon GO data from LeekDuck.
-- ============================================================

-- 1. Scrape Runs: tracks each pipeline execution
CREATE TABLE IF NOT EXISTS scrape_runs (
    id              SERIAL PRIMARY KEY,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'running'
                        CHECK (status IN ('running', 'completed', 'failed')),
    pipeline_step   TEXT,
    error_message   TEXT,
    stats           JSONB
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_status ON scrape_runs (status);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_started ON scrape_runs (started_at DESC);

-- 2. Events: central event records with relational columns for common
--    query patterns and a JSONB column for all variable/nested detail data.
CREATE TABLE IF NOT EXISTS events (
    id              SERIAL PRIMARY KEY,
    event_id        TEXT NOT NULL,
    name            TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    heading         TEXT,
    image_url       TEXT,
    image_width     INTEGER,
    image_height    INTEGER,
    image_type      TEXT,
    start_time      TIMESTAMPTZ,
    end_time        TIMESTAMPTZ,
    is_global       BOOLEAN DEFAULT FALSE,
    event_status    TEXT CHECK (event_status IN ('upcoming', 'active', 'ended')),
    detail_data     JSONB DEFAULT '{}'::jsonb,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, scraped_at)
);

CREATE INDEX IF NOT EXISTS idx_events_event_id ON events (event_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events (end_time);
CREATE INDEX IF NOT EXISTS idx_events_event_status ON events (event_status);
CREATE INDEX IF NOT EXISTS idx_events_scraped_at ON events (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_detail_data ON events USING GIN (detail_data);

-- 3. Raids: current and historical raid boss data
CREATE TABLE IF NOT EXISTS raids (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    original_name   TEXT,
    form            TEXT,
    gender          TEXT CHECK (gender IN ('male', 'female', NULL)),
    tier            TEXT NOT NULL,
    is_shadow_raid  BOOLEAN DEFAULT FALSE,
    event_status    TEXT CHECK (event_status IN ('ongoing', 'upcoming', 'inactive', 'unknown')),
    can_be_shiny    BOOLEAN DEFAULT FALSE,
    types           JSONB DEFAULT '[]'::jsonb,
    combat_power    JSONB DEFAULT '{}'::jsonb,
    boosted_weather JSONB DEFAULT '[]'::jsonb,
    image_url       TEXT,
    image_width     INTEGER,
    image_height    INTEGER,
    image_type      TEXT,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raids_name ON raids (name);
CREATE INDEX IF NOT EXISTS idx_raids_tier ON raids (tier);
CREATE INDEX IF NOT EXISTS idx_raids_event_status ON raids (event_status);
CREATE INDEX IF NOT EXISTS idx_raids_can_be_shiny ON raids (can_be_shiny);
CREATE INDEX IF NOT EXISTS idx_raids_scraped_at ON raids (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_raids_types ON raids USING GIN (types);

-- 4. Eggs: egg hatch pool data
CREATE TABLE IF NOT EXISTS eggs (
    id              SERIAL PRIMARY KEY,
    pokemon_name    TEXT NOT NULL,
    egg_type        TEXT NOT NULL,
    is_adventure_sync BOOLEAN DEFAULT FALSE,
    can_be_shiny    BOOLEAN DEFAULT FALSE,
    combat_power_min INTEGER,
    combat_power_max INTEGER,
    is_regional     BOOLEAN DEFAULT FALSE,
    is_gift_exchange BOOLEAN DEFAULT FALSE,
    rarity          INTEGER DEFAULT 0,
    image_url       TEXT,
    image_width     INTEGER,
    image_height    INTEGER,
    image_type      TEXT,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eggs_pokemon_name ON eggs (pokemon_name);
CREATE INDEX IF NOT EXISTS idx_eggs_egg_type ON eggs (egg_type);
CREATE INDEX IF NOT EXISTS idx_eggs_can_be_shiny ON eggs (can_be_shiny);
CREATE INDEX IF NOT EXISTS idx_eggs_scraped_at ON eggs (scraped_at DESC);

-- 5. Research Tasks: field research with JSONB rewards
CREATE TABLE IF NOT EXISTS research_tasks (
    id              SERIAL PRIMARY KEY,
    task_text       TEXT NOT NULL,
    research_type   TEXT,
    rewards         JSONB DEFAULT '[]'::jsonb,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_type ON research_tasks (research_type);
CREATE INDEX IF NOT EXISTS idx_research_scraped_at ON research_tasks (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_rewards ON research_tasks USING GIN (rewards);

-- 6. Shinies: shiny availability tracking
CREATE TABLE IF NOT EXISTS shinies (
    id              SERIAL PRIMARY KEY,
    dex_number      INTEGER NOT NULL,
    name            TEXT NOT NULL,
    released_date   DATE,
    family          TEXT,
    region          TEXT,
    forms           JSONB DEFAULT '[]'::jsonb,
    image_url       TEXT,
    image_width     INTEGER,
    image_height    INTEGER,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shinies_dex_number ON shinies (dex_number);
CREATE INDEX IF NOT EXISTS idx_shinies_name ON shinies (name);
CREATE INDEX IF NOT EXISTS idx_shinies_released_date ON shinies (released_date);
CREATE INDEX IF NOT EXISTS idx_shinies_region ON shinies (region);
CREATE INDEX IF NOT EXISTS idx_shinies_scraped_at ON shinies (scraped_at DESC);

-- 7. Rocket Lineups: Team GO Rocket battle data
CREATE TABLE IF NOT EXISTS rocket_lineups (
    id                  SERIAL PRIMARY KEY,
    member_name         TEXT NOT NULL,
    title               TEXT,
    type_specialization TEXT,
    slots               JSONB DEFAULT '[]'::jsonb,
    scrape_run_id       INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rocket_member ON rocket_lineups (member_name);
CREATE INDEX IF NOT EXISTS idx_rocket_title ON rocket_lineups (title);
CREATE INDEX IF NOT EXISTS idx_rocket_scraped_at ON rocket_lineups (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_rocket_slots ON rocket_lineups USING GIN (slots);

-- 8. Event Pokemon: junction table linking pokemon to events
CREATE TABLE IF NOT EXISTS event_pokemon (
    id              SERIAL PRIMARY KEY,
    event_id        TEXT NOT NULL,
    pokemon_name    TEXT NOT NULL,
    source          TEXT,
    can_be_shiny    BOOLEAN DEFAULT FALSE,
    dex_number      INTEGER,
    image_url       TEXT,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_pokemon_event_id ON event_pokemon (event_id);
CREATE INDEX IF NOT EXISTS idx_event_pokemon_name ON event_pokemon (pokemon_name);
CREATE INDEX IF NOT EXISTS idx_event_pokemon_source ON event_pokemon (source);
CREATE INDEX IF NOT EXISTS idx_event_pokemon_composite ON event_pokemon (event_id, pokemon_name);
CREATE INDEX IF NOT EXISTS idx_event_pokemon_scraped_at ON event_pokemon (scraped_at DESC);

-- 9. Pokemon Index: master pokemon reference built from all sources
CREATE TABLE IF NOT EXISTS pokemon_index (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    dex_number      INTEGER,
    family          TEXT,
    region          TEXT,
    can_be_shiny    BOOLEAN DEFAULT FALSE,
    types           JSONB DEFAULT '[]'::jsonb,
    sources         JSONB DEFAULT '[]'::jsonb,
    first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_pokemon_index_name ON pokemon_index (name);
CREATE INDEX IF NOT EXISTS idx_pokemon_index_normalized ON pokemon_index (normalized_name);
CREATE INDEX IF NOT EXISTS idx_pokemon_index_dex ON pokemon_index (dex_number);
CREATE INDEX IF NOT EXISTS idx_pokemon_index_sources ON pokemon_index USING GIN (sources);

-- 10. Event Type Snapshots: per-eventType aggregated data
CREATE TABLE IF NOT EXISTS event_type_snapshots (
    id              SERIAL PRIMARY KEY,
    event_type      TEXT NOT NULL,
    snapshot_data   JSONB NOT NULL DEFAULT '[]'::jsonb,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_type_snap_type ON event_type_snapshots (event_type);
CREATE INDEX IF NOT EXISTS idx_event_type_snap_scraped ON event_type_snapshots (scraped_at DESC);

-- 11. Unified Snapshots: versioned unified data captures
CREATE TABLE IF NOT EXISTS unified_snapshots (
    id              SERIAL PRIMARY KEY,
    version         TEXT NOT NULL DEFAULT '1.0.0',
    stats           JSONB DEFAULT '{}'::jsonb,
    indices         JSONB DEFAULT '{}'::jsonb,
    meta            JSONB DEFAULT '{}'::jsonb,
    scrape_run_id   INTEGER REFERENCES scrape_runs(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_snap_created ON unified_snapshots (created_at DESC);

-- ============================================================
-- Helper views for common query patterns
-- ============================================================

-- Latest snapshot of each event (most recent scrape per event_id)
CREATE OR REPLACE VIEW latest_events AS
SELECT DISTINCT ON (event_id) *
FROM events
ORDER BY event_id, scraped_at DESC;

-- Latest snapshot of raids
CREATE OR REPLACE VIEW latest_raids AS
SELECT *
FROM raids
WHERE scraped_at = (SELECT MAX(scraped_at) FROM raids);

-- Latest snapshot of eggs
CREATE OR REPLACE VIEW latest_eggs AS
SELECT *
FROM eggs
WHERE scraped_at = (SELECT MAX(scraped_at) FROM eggs);

-- Latest snapshot of research tasks
CREATE OR REPLACE VIEW latest_research AS
SELECT *
FROM research_tasks
WHERE scraped_at = (SELECT MAX(scraped_at) FROM research_tasks);

-- Latest snapshot of rocket lineups
CREATE OR REPLACE VIEW latest_rocket_lineups AS
SELECT *
FROM rocket_lineups
WHERE scraped_at = (SELECT MAX(scraped_at) FROM rocket_lineups);

-- Active events right now
CREATE OR REPLACE VIEW active_events AS
SELECT *
FROM events
WHERE event_status = 'active'
  AND scraped_at = (SELECT MAX(scraped_at) FROM events);
