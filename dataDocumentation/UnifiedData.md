# Unified Data File

The unified data file (`unified.min.json`) combines all scraped Pokémon GO datasets into a single comprehensive payload with metadata, indices, and a deduplicated Pokemon index for cross-referencing.

## Endpoint

`https://pokemn.quest/data/unified.min.json`

---

## Top-Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `meta` | object | Metadata about the unified file |
| `events` | array | All events |
| `eventTypes` | object | Events grouped by event type |
| `raids` | array | Current raid bosses |
| `eggs` | array | Egg hatches |
| `research` | array | Field research tasks |
| `shinies` | array | Shiny-eligible Pokemon |
| `rocketLineups` | array | Team GO Rocket lineups |
| `pokemonIndex` | object | Deduplicated Pokemon index |
| `indices` | object | Pre-computed lookup indices |
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
| `imageBase` | string | Base URL for image assets |

---

## `events`

Array of all Pokémon GO events.

### Event Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventID` | string | ✓ | Unique identifier for the event |
| `name` | string | ✓ | Display name of the event |
| `eventType` | string | ✓ | Type classification (see Event Types below) |
| `heading` | string | ✓ | Category heading |
| `image` | string | ✓ | URL to event banner image |
| `start` | string | ✓ | Start timestamp (ISO 8601 with milliseconds) |
| `end` | string | ✓ | End timestamp (ISO 8601 with milliseconds) |
| `pokemon` | array | | Featured Pokemon list |
| `raids` | object | | Raid Pokemon by tier |
| `bonuses` | array | | Active bonuses during event |
| `eggs` | object | | Egg hatches by distance |
| `research` | array | | Event-specific research tasks |
| `specialresearch` | array | | Special research storylines |
| `timedresearch` | array | | Timed research tasks |
| `fieldresearch` | array | | Field research tasks |
| `pokemon7km` | array | | Pokemon from 7km eggs |
| `pokemon2km` | array | | Pokemon from 2km eggs |
| `pokemon5km` | array | | Pokemon from 5km eggs |
| `pokemon10km` | array | | Pokemon from 10km eggs |
| `pokemonOneStarRaids` | array | | 1-Star raid Pokemon |
| `pokemonThreeStarRaids` | array | | 3-Star raid Pokemon |
| `pokemonFiveStarRaids` | array | | 5-Star raid Pokemon |
| `pokemonMegaRaids` | array | | Mega raid Pokemon |
| `pokemonShadowRaids` | array | | Shadow raid Pokemon |
| `spotlightPokemon` | object | | Spotlight Hour featured Pokemon |
| `spotlightBonus` | string | | Spotlight Hour bonus description |
| `leagues` | array | | GO Battle League rotations |
| `featuredAttack` | string | | Featured attack for evolutions |
| `shadows` | array | | New shadow Pokemon |
| `leaders` | array | | Team Rocket leader lineups |
| `giovanni` | object | | Giovanni lineup |
| `grunts` | array | | Grunt type rotations |
| `costumedPokemon` | array | | Costumed Pokemon available |
| `pokemon_wild` | array | | Wild spawns |
| `pokemon_incense` | array | | Incense spawns |
| `pokemon_lure` | array | | Lure spawns |
| `pokemon_debut` | array | | Debuting Pokemon |
| `pokemon_maxdebut` | array | | Dynamax debuts |
| `maxBattles` | array | | Max Battle Pokemon |
| `showcasePokemon` | array | | PokéStop Showcase Pokemon |
| `showcase` | object | | Showcase details |
| `passes` | array | | Pass/ticket details |
| `shiniesReleased` | boolean | | Whether new shinies released |
| `pokemon_evolve` | array | | Pokemon with special evolutions |
| `pokemon_hatch` | array | | Pokemon hatching from eggs |
| `pokemon_featured` | array | | Featured Pokemon |

### Event Types

| Value | Description |
|-------|-------------|
| `community-day` | Community Day events |
| `event` | General in-game events |
| `go-battle-league` | GO Battle League seasons |
| `go-pass` | Paid pass events |
| `max-battles` | Max Battle events |
| `max-mondays` | Max Monday events |
| `pokemon-go-tour` | Pokémon GO Tour events |
| `pokemon-spotlight-hour` | Spotlight Hour events |
| `pokestop-showcase` | PokéStop Showcase events |
| `raid-battles` | Raid rotation events |
| `raid-day` | Raid Day events |
| `raid-hour` | Raid Hour events |
| `research-day` | Research Day events |
| `season` | Seasonal events |
| `team-go-rocket` | Team GO Rocket events |
| `go-rocket-takeover` | GO Rocket Takeover events |
| `timed-research` | Timed Research events |
| `safari-zone` | Safari Zone events |
| `go-fest` | GO Fest events |

### Pokemon Object (within events)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Pokemon name |
| `image` | string | URL to Pokemon image |
| `canBeShiny` | boolean | Whether shiny form is available |
| `source` | string | Source type: `"spawn"`, `"featured"`, `"incense"`, `"costumed"`, `"debut"`, `"maxDebut"` |

### Bonus Object

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Bonus description |
| `pokemon` | object | Associated Pokemon (if applicable) |

---

## `eventTypes`

Object containing events grouped by their `eventType` value. Each key is an event type slug, and its value is an array of event objects matching that type.

| Key Pattern | Value Type | Description |
|-------------|------------|-------------|
| `"community-day"` | array | Array of Community Day event objects |
| `"raid-hour"` | array | Array of Raid Hour event objects |
| `"<event-type>"` | array | Array of events of that type |

---

## `raids`

Array of current raid bosses.

### Raid Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Pokemon name |
| `originalName` | string | ✓ | Full original name including form |
| `form` | string | | Form variant (e.g., `"Incarnate"`, `"Curly"`) |
| `gender` | string | | Gender if relevant |
| `tier` | string | ✓ | Raid tier |
| `isShadowRaid` | boolean | ✓ | Whether this is a shadow raid |
| `eventStatus` | string | ✓ | Status: `"ongoing"`, `"upcoming"`, `"unknown"` |
| `canBeShiny` | boolean | ✓ | Whether shiny form is available |
| `types` | array | ✓ | Pokemon types |
| `combatPower` | object | ✓ | CP ranges |
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
| `name` | string | Type name (lowercase) |
| `image` | string | URL to type icon |

### Combat Power Object

| Field | Type | Description |
|-------|------|-------------|
| `normal` | object | Non-boosted CP range |
| `normal.min` | number | Minimum CP |
| `normal.max` | number | Maximum CP |
| `boosted` | object | Weather-boosted CP range |
| `boosted.min` | number | Minimum boosted CP |
| `boosted.max` | number | Maximum boosted CP |

### Weather Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Weather condition name |
| `image` | string | URL to weather icon |

---

## `eggs`

Array of Pokemon that can hatch from eggs.

### Egg Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Pokemon name |
| `eggType` | string | ✓ | Egg distance |
| `isAdventureSync` | boolean | ✓ | Whether from Adventure Sync rewards |
| `image` | string | ✓ | URL to Pokemon image |
| `canBeShiny` | boolean | ✓ | Whether shiny form is available |
| `combatPower` | object | ✓ | CP range at hatch |
| `isRegional` | boolean | ✓ | Whether regionally exclusive |
| `isGiftExchange` | boolean | ✓ | Whether from gift eggs |
| `rarity` | number | ✓ | Rarity tier (1-5, higher = rarer) |
| `imageWidth` | number | ✓ | Image width in pixels |
| `imageHeight` | number | ✓ | Image height in pixels |
| `imageType` | string | ✓ | Image format |

### Egg Types

| Value | Description |
|-------|-------------|
| `"1 km"` | 1 kilometer eggs (starter Pokemon) |
| `"2 km"` | 2 kilometer eggs |
| `"5 km"` | 5 kilometer eggs |
| `"7 km"` | 7 kilometer eggs (gift eggs) |
| `"10 km"` | 10 kilometer eggs |
| `"12 km"` | 12 kilometer eggs (strange eggs from Rocket) |

### Egg Combat Power Object

| Field | Type | Description |
|-------|------|-------------|
| `min` | number | Minimum CP at hatch |
| `max` | number | Maximum CP at hatch |

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
| `"catch"` | Catch Pokemon tasks |
| `"throw"` | Throwing technique tasks |
| `"explore"` | Exploration tasks (walking, spinning) |
| `"battle"` | Battle tasks (raids, trainers, rockets) |
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
| `imageWidth` | number | ✓ | Image width in pixels |
| `imageHeight` | number | ✓ | Image height in pixels |
| `imageType` | string | ✓ | Image format |
| `canBeShiny` | boolean | | For encounters: shiny availability |
| `combatPower` | object | | For encounters: CP range |
| `quantity` | number | | For items/resources: amount given |

---

## `shinies`

Array of all shiny-eligible Pokemon.

### Shiny Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dexNumber` | number | ✓ | National Pokedex number |
| `name` | string | ✓ | Pokemon name |
| `releasedDate` | string | ✓ | Date shiny was released (YYYY/MM/DD) |
| `family` | string | ✓ | Evolution family identifier |
| `typeCode` | string | | Form/variant code (e.g., `"_51"` for Hisuian) |
| `forms` | array | | Available shiny forms |
| `imageUrl` | string | | URL to default shiny sprite |
| `width` | number | | Image width in pixels |
| `height` | number | | Image height in pixels |

### Shiny Form Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Form identifier |
| `imageUrl` | string | URL to form's shiny sprite |
| `width` | number | Image width in pixels |
| `height` | number | Image height in pixels |

---

## `rocketLineups`

Array of Team GO Rocket lineups.

### Lineup Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Character name or grunt type |
| `title` | string | ✓ | Character title |
| `type` | string | ✓ | Pokemon type specialization (empty for leaders) |
| `firstPokemon` | array | ✓ | First slot Pokemon options |
| `secondPokemon` | array | ✓ | Second slot Pokemon options |
| `thirdPokemon` | array | ✓ | Third slot Pokemon options |

### Lineup Names

| Value | Title | Description |
|-------|-------|-------------|
| `"Giovanni"` | Team GO Rocket Boss | Main boss |
| `"Cliff"` | Team GO Rocket Leader | Leader |
| `"Arlo"` | Team GO Rocket Leader | Leader |
| `"Sierra"` | Team GO Rocket Leader | Leader |
| `"<Type>-type Male Grunt"` | Team GO Rocket Grunt | Type-specific grunt |
| `"<Type>-type Female Grunt"` | Team GO Rocket Grunt | Type-specific grunt |
| `"Male Grunt"` | Team GO Rocket Grunt | Generic grunt |
| `"Female Grunt"` | Team GO Rocket Grunt | Generic grunt |
| `"Decoy Female Grunt"` | Team GO Rocket Grunt | Decoy grunt |

### Rocket Pokemon Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Pokemon name |
| `image` | string | ✓ | URL to Pokemon image |
| `types` | array | ✓ | Pokemon types (string array) |
| `weaknesses` | object | ✓ | Type weaknesses |
| `isEncounter` | boolean | ✓ | Whether catchable after battle |
| `canBeShiny` | boolean | ✓ | Whether shiny form is available |

### Weaknesses Object

| Field | Type | Description |
|-------|------|-------------|
| `double` | array | Types that deal 2x damage |
| `single` | array | Types that deal 1.6x damage |

---

## `pokemonIndex`

Object containing deduplicated Pokemon entries, keyed by normalized name (lowercase, special characters removed).

### Pokemon Index Entry

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name of the Pokemon |
| `dexNumber` | number | National Pokedex number (if known) |
| `family` | string | Evolution family identifier |
| `typeCode` | string | Form/variant code |
| `canBeShiny` | boolean | Whether shiny form is available in-game |
| `types` | array | Pokemon types (when available) |
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

Object mapping `eventID` string to full event object.

| Key | Value |
|-----|-------|
| `"<eventID>"` | Event object |

### `indices.eventsByType`

Object mapping event type slug to array of event IDs.

| Key | Value |
|-----|-------|
| `"<eventType>"` | Array of `eventID` strings |

### `indices.raidsByTier`

Object mapping raid tier to array of Pokemon names.

| Key | Value |
|-----|-------|
| `"1-Star Raids"` | Array of Pokemon names |
| `"3-Star Raids"` | Array of Pokemon names |
| `"5-Star Raids"` | Array of Pokemon names |
| `"Mega Raids"` | Array of Pokemon names |

### `indices.raidsByPokemon`

Object mapping normalized Pokemon name to array of indices into `raids` array.

| Key | Value |
|-----|-------|
| `"<normalized-name>"` | Array of numeric indices |

### `indices.eggsByDistance`

Object mapping egg distance to array of indices into `eggs` array.

| Key | Value |
|-----|-------|
| `"1 km"` | Array of numeric indices |
| `"2 km"` | Array of numeric indices |
| `"5 km"` | Array of numeric indices |
| `"7 km"` | Array of numeric indices |
| `"10 km"` | Array of numeric indices |
| `"12 km"` | Array of numeric indices |

### `indices.researchByType`

Object mapping research type to array of indices into `research` array.

| Key | Value |
|-----|-------|
| `"<research-type>"` | Array of numeric indices |

### `indices.shiniesByDex`

Object mapping Pokedex number to array of indices into `shinies` array.

| Key | Value |
|-----|-------|
| `<dexNumber>` | Array of numeric indices |

### `indices.shiniesByName`

Object mapping normalized Pokemon name to single index into `shinies` array.

| Key | Value |
|-----|-------|
| `"<normalized-name>"` | Numeric index |

### `indices.rocketsByType`

Object mapping grunt type to array of indices into `rocketLineups` array.

| Key | Value |
|-----|-------|
| `"<type>"` | Array of numeric indices |
| `"leader"` | Array of indices for leaders (empty type) |

---

## `stats`

Summary statistics about the unified data.

| Field | Type | Description |
|-------|------|-------------|
| `totalEvents` | number | Count of events in `events` array |
| `totalRaids` | number | Count of raids in `raids` array |
| `totalEggs` | number | Count of eggs in `eggs` array |
| `totalResearch` | number | Count of research tasks in `research` array |
| `totalShinies` | number | Count of shinies in `shinies` array |
| `totalRocketLineups` | number | Count of lineups in `rocketLineups` array |
| `totalUniquePokemon` | number | Count of entries in `pokemonIndex` |
| `eventTypesCounts` | object | Object mapping event type to count |
| `raidTierCounts` | object | Object mapping raid tier to count |
| `eggDistanceCounts` | object | Object mapping egg distance to count |

---

## Date Format

All timestamps use ISO 8601 format with milliseconds:

```
YYYY-MM-DDTHH:mm:ss.SSS
```

Example: `"2026-03-14T14:00:00.000"`

---

## Image URLs

Images are served from multiple sources:

| Base URL | Content |
|----------|---------|
| `https://cdn.leekduck.com/assets/img/` | Event banners, Pokemon icons, type icons |
| `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/` | Shiny sprites |

Standard Pokemon icon dimensions: 256×256 pixels
