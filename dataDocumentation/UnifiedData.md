# Unified Data File

The unified data file (`unified.min.json`) combines all scraped Pokémon GO datasets into a single comprehensive payload with metadata, indices, and a deduplicated Pokemon index for cross-referencing.

## Endpoint

`https://pokemn.quest/data/unified.min.json`

---

## Top-Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `meta` | object | Metadata about the unified file |
| `events` | array | All events (flat model with type-specific fields) |
| `eventTypes` | object | Events grouped by event type slug |
| `raids` | array | Current raid bosses |
| `eggs` | array | Egg hatch pool |
| `research` | array | Field research tasks |
| `shinies` | array | Shiny-eligible Pokemon |
| `rocketLineups` | array | Team GO Rocket lineups |
| `pokemonIndex` | object | Deduplicated Pokemon index keyed by normalized name |
| `indices` | object | Pre-computed lookup indices for fast access |
| `stats` | object | Summary statistics |

---

## `meta`

Metadata about the unified file generation.

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Data format version (e.g., `"1.0.0"`) |
| `generatedAt` | string | ISO 8601 timestamp when file was generated |
| `schemaVersion` | string | Schema version for validation |
| `dataSource` | string | Source of scraped data (`"leekduck.com"`) |
| `imageBase` | string | Base URL for image assets (`"https://cdn.leekduck.com/assets/img/"` or `"https://pokemn.quest/images/"` when Blob URLs are enabled) |

---

## `events`

Array of all Pokémon GO events. Each event uses a **flat model** — there is no nested `details` wrapper. Type-specific fields are merged directly onto the event object.

### Core Event Fields (always present)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventID` | string | ✓ | Unique identifier (URL slug, e.g., `"community-day-january-2026"`) |
| `name` | string | ✓ | Display name of the event |
| `eventType` | string | ✓ | Type classification (see Event Types below) |
| `heading` | string | ✓ | Category heading (auto-generated from eventType) |
| `image` | string | ✓ | URL to event banner image |
| `start` | string | ✓ | Start timestamp (ISO 8601 with milliseconds) |
| `end` | string | ✓ | End timestamp (ISO 8601 with milliseconds) |

### Optional Event Fields (added by detailed scrapers)

| Field | Type | Description |
|-------|------|-------------|
| `pokemon` | array | Featured Pokémon list (flat array with `source` field) |
| `raids` | array | Featured raid bosses by tier |
| `bonuses` | array | Active bonuses during event |
| `bonusDisclaimers` | array | Qualifying notes for bonuses (e.g., `"*Regional only"`) |
| `eggs` | array | Modified egg pools |
| `research` | object | Research tasks: `{ field, special, timed }` arrays |
| `rewards` | object | Ticketed rewards: `{ ticketedResearch, ticketBonuses, ticketPrice }` |
| `battle` | object | GO Battle League info: `{ leagues }` |
| `rocket` | object | Team Rocket changes: `{ shadows, leaders, giovanni }` |
| `showcases` | array | PokéStop Showcase details |
| `habitats` | array | GO Tour habitat rotations |
| `goPass` | object | GO Pass tier structure |
| `shinies` | array | Newly available or featured shinies |
| `photobomb` | object | Photobomb details: `{ description, pokemon }` |
| `featuredAttack` | string | Exclusive move for Community Day evolutions |
| `customSections` | object | Generic extracted sections (from `event.js` scraper) |

### Boolean Flags

| Field | Type | Description |
|-------|------|-------------|
| `hasSpawns` | boolean | Whether event has wild spawns |
| `hasFieldResearchTasks` | boolean | Whether event has field research |
| `hasBonuses` | boolean | Whether event has active bonuses |
| `hasRaids` | boolean | Whether event has raid content |
| `hasEggs` | boolean | Whether event has egg pool changes |
| `hasShiny` | boolean | Whether event has shiny debuts/features |
| `isGlobal` | boolean | Whether event is available globally |

### Event Types

| Value | Description |
|-------|-------------|
| `community-day` | Community Day events |
| `event` | General in-game events |
| `go-battle-league` | GO Battle League seasons |
| `go-pass` | Paid pass events |
| `go-rocket-takeover` | GO Rocket Takeover events |
| `max-battles` | Max Battle events |
| `max-mondays` | Max Monday events |
| `pokemon-go-tour` | Pokémon GO Tour events |
| `pokemon-spotlight-hour` | Spotlight Hour events |
| `pokestop-showcase` | PokéStop Showcase events |
| `raid-battles` | Raid rotation events |
| `raid-day` | Raid Day events |
| `raid-hour` | Raid Hour events |
| `research` | Special/Masterwork Research events |
| `research-breakthrough` | Research Breakthrough events |
| `research-day` | Research Day events |
| `season` | Seasonal events |
| `special-research` | Special Research storylines |
| `team-go-rocket` | Team GO Rocket events |
| `timed-research` | Timed Research events |

### Pokemon Object (within events)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Pokemon name |
| `image` | string | URL to Pokemon image |
| `canBeShiny` | boolean | Whether shiny form is available |
| `source` | string | Encounter source (see below) |
| `imageWidth` | number | Image width in pixels (when available) |
| `imageHeight` | number | Image height in pixels (when available) |

**Source values:**

| Value | Description |
|-------|-------------|
| `"spawn"` | Standard wild spawn |
| `"featured"` | Highlighted/boosted spawn |
| `"incense"` | Incense-exclusive spawn |
| `"costumed"` | Wearing event costume |
| `"debut"` | Newly released Pokémon |
| `"maxDebut"` | New Dynamax form debut |
| `"raid"` | Available in raids |
| `"egg"` | Hatchable from eggs |
| `"research"` | Research task encounter reward |
| `"reward"` | Event/completion reward |
| `"encounter"` | Generic catch encounter |

### Bonus Object

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Bonus description (e.g., `"2× Catch XP"`) |
| `image` | string | URL to bonus icon image |

---

## `eventTypes`

Object containing events grouped by their `eventType` value. Each key is an event type slug, and its value is an array of event objects matching that type.

```json
{
  "community-day": [ /* Community Day event objects */ ],
  "raid-hour": [ /* Raid Hour event objects */ ],
  "season": [ /* Season event objects */ ]
}
```

These are read from the per-eventType files in `data/eventTypes/`.

---

## `raids`

Array of current raid bosses.

### Raid Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Cleaned Pokemon name |
| `originalName` | string | ✓ | Full display name including form/gender |
| `form` | string\|null | ✓ | Form variant (e.g., `"Origin"`, `"Alola"`) or `null` |
| `gender` | string\|null | ✓ | Gender if relevant or `null` |
| `tier` | string | ✓ | Raid tier |
| `isShadowRaid` | boolean | ✓ | Whether this is a shadow raid |
| `eventStatus` | string | ✓ | Status: `"ongoing"`, `"upcoming"`, `"inactive"`, `"unknown"` |
| `canBeShiny` | boolean | ✓ | Whether shiny form is available |
| `types` | array | ✓ | Pokemon types |
| `combatPower` | object | ✓ | CP ranges (normal and boosted) |
| `boostedWeather` | array | ✓ | Weather boost conditions |
| `image` | string | ✓ | URL to Pokemon image |
| `imageWidth` | number | ✓ | Image width in pixels |
| `imageHeight` | number | ✓ | Image height in pixels |
| `imageType` | string | ✓ | Image format (e.g., `"png"`) |

### Raid Tiers

| Value | Description |
|-------|-------------|
| `"1-Star Raids"` | Tier 1 raids |
| `"3-Star Raids"` | Tier 3 raids |
| `"5-Star Raids"` | Tier 5 legendary raids |
| `"Mega Raids"` | Mega Evolution raids |

### Type Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Type name (lowercase, e.g., `"fire"`, `"water"`) |
| `image` | string | URL to type icon |

### Combat Power Object

| Field | Type | Description |
|-------|------|-------------|
| `normal` | object | Non-boosted CP range |
| `normal.min` | integer\|null | Minimum CP, or `null` if unknown |
| `normal.max` | integer\|null | Maximum CP, or `null` if unknown |
| `boosted` | object | Weather-boosted CP range |
| `boosted.min` | integer\|null | Minimum boosted CP, or `null` if unknown |
| `boosted.max` | integer\|null | Maximum boosted CP, or `null` if unknown |

### Boosted Weather Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Weather condition (e.g., `"sunny"`, `"rainy"`, `"fog"`) |
| `image` | string | URL to weather icon |

---

## `eggs`

Array of Pokemon that can hatch from eggs.

### Egg Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Pokemon name |
| `eggType` | string | ✓ | Egg distance tier |
| `isAdventureSync` | boolean | ✓ | Whether from Adventure Sync rewards |
| `image` | string | ✓ | URL to Pokemon image |
| `canBeShiny` | boolean | ✓ | Whether shiny form is available |
| `combatPower` | object | ✓ | CP range at hatch |
| `isRegional` | boolean | ✓ | Whether regionally exclusive |
| `isGiftExchange` | boolean | ✓ | Whether from gift eggs |
| `rarity` | integer | ✓ | Rarity tier (0–5, higher = rarer) |
| `imageWidth` | integer | ✓ | Image width in pixels |
| `imageHeight` | integer | ✓ | Image height in pixels |
| `imageType` | string | ✓ | Image format |

### Egg Types

| Value | Description |
|-------|-------------|
| `"1km"` | 1 kilometer eggs |
| `"2km"` | 2 kilometer eggs |
| `"5km"` | 5 kilometer eggs |
| `"7km"` | 7 kilometer eggs (from friend gifts) |
| `"10km"` | 10 kilometer eggs |
| `"12km"` | 12 kilometer eggs (from Rocket Leaders) |
| `"route"` | Route gift eggs |
| `"adventure5km"` | Adventure Sync 5 km rewards |
| `"adventure10km"` | Adventure Sync 10 km rewards |

### Egg Combat Power Object

| Field | Type | Description |
|-------|------|-------------|
| `min` | integer\|null | Minimum CP at hatch, or `null` if unknown |
| `max` | integer\|null | Maximum CP at hatch, or `null` if unknown |

---

## `research`

Array of field research tasks.

### Research Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✓ | Task description |
| `type` | string | ✓ | Task category |
| `rewards` | array | ✓ | Possible rewards |

### Research Types

| Value | Description |
|-------|-------------|
| `"event"` | Event-specific tasks |
| `"catch"` | Catch Pokemon tasks |
| `"throw"` | Throwing technique tasks |
| `"explore"` | Exploration tasks (walking, spinning) |
| `"battle"` | Battle tasks (raids, trainers) |
| `"training"` | Pokemon training tasks (power up, evolve) |
| `"buddy"` | Buddy Pokemon tasks |
| `"rocket"` | Team GO Rocket tasks |
| `"sponsored"` | Sponsored tasks |
| `"ar"` | AR scanning tasks |

### Reward Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✓ | Reward type: `"encounter"`, `"item"`, `"resource"` |
| `name` | string | ✓ | Reward name |
| `image` | string | ✓ | URL to reward image |
| `imageWidth` | integer | ✓ | Image width in pixels |
| `imageHeight` | integer | ✓ | Image height in pixels |
| `imageType` | string | ✓ | Image format |
| `canBeShiny` | boolean | | For encounters: shiny availability |
| `combatPower` | object | | For encounters: CP range (`min`/`max`, integer or null) |
| `quantity` | number | | For items/resources: amount given |

---

## `shinies`

Array of all shiny-eligible Pokemon.

### Shiny Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dexNumber` | integer | ✓ | National Pokédex number |
| `name` | string | ✓ | Pokemon name (includes regional prefix if applicable) |
| `releasedDate` | string\|null | ✓ | Date shiny was released (`YYYY-MM-DD`), or `null` if not yet released |
| `family` | string\|null | ✓ | Evolution family identifier |
| `region` | string\|null | ✓ | Regional variant label (e.g., `"alolan"`, `"galarian"`, `"hisuian"`, `"paldean"`), or `null` for base form |
| `forms` | array | ✓ | Available shiny forms (may be empty) |
| `image` | string | | URL to base shiny sprite (absent for Pokemon with only form variants) |
| `imageWidth` | integer | | Image width in pixels (absent when `image` is absent) |
| `imageHeight` | integer | | Image height in pixels (absent when `image` is absent) |

### Shiny Form Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Form identifier (e.g., `"f19"` for Fall 2019, `"11"` for costume) |
| `image` | string | ✓ | URL to form's shiny sprite |
| `imageWidth` | integer | ✓ | Image width in pixels |
| `imageHeight` | integer | ✓ | Image height in pixels |

---

## `rocketLineups`

Array of Team GO Rocket lineups.

### Lineup Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Character name or grunt type (e.g., `"Giovanni"`, `"Fire-type Female Grunt"`) |
| `title` | string | ✓ | Character title: `"Team GO Rocket Boss"`, `"Team GO Rocket Leader"`, or `"Team GO Rocket Grunt"` |
| `type` | string | ✓ | Pokemon type specialization (empty string for Leaders/Giovanni) |
| `slots` | array | ✓ | Array of exactly 3 battle slots, each containing an array of possible Shadow Pokemon |

### Slot Structure

```json
"slots": [
  [ /* Slot 1: array of possible Pokemon (usually 1, fixed) */ ],
  [ /* Slot 2: array of possible Pokemon (usually 2-3) */ ],
  [ /* Slot 3: array of possible Pokemon (usually 2-3) */ ]
]
```

### Shadow Pokemon Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Pokemon name |
| `image` | string | ✓ | URL to Pokemon image |
| `types` | array | ✓ | Pokemon type(s) as lowercase strings (1–2 items) |
| `weaknesses` | object | ✓ | Type weaknesses |
| `isEncounter` | boolean | ✓ | Whether catchable after winning the battle |
| `canBeShiny` | boolean | ✓ | Whether the encounter can be shiny |

### Weaknesses Object

| Field | Type | Description |
|-------|------|-------------|
| `double` | array | Types that deal 4× (double super-effective) damage |
| `single` | array | Types that deal 2× (single super-effective) damage |

---

## `pokemonIndex`

Object containing deduplicated Pokemon entries, keyed by normalized name (lowercase, special characters removed).

Built by cross-referencing all datasets: shinies (primary source with authoritative dex numbers), raids, eggs, research rewards, and rocket lineups.

### Pokemon Index Entry

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name of the Pokemon |
| `dexNumber` | integer\|null | National Pokédex number (from shinies data or extracted from image URL) |
| `family` | string\|null | Evolution family identifier (from shinies data) |
| `typeCode` | string\|null | Form/variant type code (from shinies data) |
| `canBeShiny` | boolean | Whether shiny form is available in-game |
| `types` | array | Pokemon types as strings (when available from raids or rocket data) |
| `sources` | array | Which datasets reference this Pokemon |

### Source Values

| Value | Description |
|-------|-------------|
| `"shinies"` | Appears in shinies data |
| `"raids"` | Appears in raids data |
| `"eggs"` | Appears in eggs data |
| `"research"` | Appears in research rewards |
| `"rockets"` | Appears in Rocket lineups |

---

## `indices`

Pre-computed lookup indices for fast data access.

### `indices.eventsById`

Object mapping `eventID` → full event object.

### `indices.eventsByType`

Object mapping event type slug → array of `eventID` strings.

### `indices.raidsByTier`

Object mapping raid tier → array of Pokemon names.

| Key Examples | Value |
|--------------|-------|
| `"1-Star Raids"` | Array of Pokemon names |
| `"3-Star Raids"` | Array of Pokemon names |
| `"5-Star Raids"` | Array of Pokemon names |
| `"Mega Raids"` | Array of Pokemon names |

### `indices.raidsByPokemon`

Object mapping normalized Pokemon name → array of numeric indices into the `raids` array.

### `indices.eggsByDistance`

Object mapping egg distance tier → array of numeric indices into the `eggs` array.

| Key Examples | Value |
|--------------|-------|
| `"1km"`, `"2km"`, `"5km"`, `"7km"`, `"10km"`, `"12km"` | Array of indices |
| `"route"`, `"adventure5km"`, `"adventure10km"` | Array of indices |

### `indices.researchByType`

Object mapping research type → array of numeric indices into the `research` array.

### `indices.shiniesByDex`

Object mapping Pokédex number → array of numeric indices into the `shinies` array. Multiple entries per dex number are possible (regional forms, costumes).

### `indices.shiniesByName`

Object mapping normalized Pokemon name → single numeric index into the `shinies` array.

### `indices.rocketsByType`

Object mapping grunt type → array of numeric indices into the `rocketLineups` array. Leaders and Giovanni use the key `"leader"` (since their `type` is an empty string).

---

## `stats`

Summary statistics about the unified data.

| Field | Type | Description |
|-------|------|-------------|
| `totalEvents` | number | Count of events |
| `totalRaids` | number | Count of raid bosses |
| `totalEggs` | number | Count of egg hatches |
| `totalResearch` | number | Count of research tasks |
| `totalShinies` | number | Count of shiny entries |
| `totalRocketLineups` | number | Count of Rocket lineups |
| `totalUniquePokemon` | number | Count of entries in `pokemonIndex` |
| `eventTypesCounts` | object | Object mapping event type slug → count |
| `raidTierCounts` | object | Object mapping raid tier → count |
| `eggDistanceCounts` | object | Object mapping egg distance → count |

---

## Date Format

All timestamps use ISO 8601 format with milliseconds:

```
YYYY-MM-DDTHH:mm:ss.SSS
```

Example: `"2026-03-14T14:00:00.000"`

---

## Image URLs

When Vercel Blob storage is enabled (`USE_BLOB_URLS=true`), image URLs are served from `pokemn.quest` with a semantic folder structure:

| Path Pattern | Content |
|--------------|---------|
| `pokemon/<dex>-<name>/<filename>` | Pokemon sprites and icons |
| `events/<slug>.<ext>` | Event banner images |
| `types/<type>.png` | Type icons |
| `weather/<weather>.png` | Weather icons |
| `bonuses/<bonus>.png` | Bonus icons |
| `items/<item>.png` | Item icons |
| `eggs/<file>` | Egg-related images |
| `raids/<file>` | Raid-related images |

When Blob URLs are disabled, images are served from the original sources (primarily `cdn.leekduck.com`).

Standard Pokemon icon dimensions: 256×256 pixels.

---

## Example Usage

### Fetch all data

```javascript
const response = await fetch('https://pokemn.quest/data/unified.min.json');
const data = await response.json();
```

### Look up a Pokemon across all datasets

```javascript
const { pokemonIndex } = data;
const pikachu = pokemonIndex['pikachu'];
// → { name: 'Pikachu', dexNumber: 25, canBeShiny: true, sources: ['shinies', 'raids', 'eggs'] }
```

### Find all 5-Star raid bosses

```javascript
const fiveStarIndices = data.indices.raidsByTier['5-Star Raids'];
const fiveStarBosses = fiveStarIndices.map(i => data.raids[i]);
```

### Get events by type

```javascript
const communityDayIds = data.indices.eventsByType['community-day'];
const communityDays = communityDayIds.map(id => data.indices.eventsById[id]);
```

### Get eggs by distance

```javascript
const tenKmIndices = data.indices.eggsByDistance['10km'];
const tenKmEggs = tenKmIndices.map(i => data.eggs[i]);
```
