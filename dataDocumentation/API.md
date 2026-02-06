# Pokémon GO API Documentation

Complete reference for the Pokémon GO Events & Data API.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Endpoints](#endpoints)
- [Data Types](#data-types)
  - [Events](#events)
    - [Event Types](#event-types)
  - [Raids](#raids)
  - [Research](#research)
  - [Eggs](#eggs)
  - [Rocket Lineups](#rocket-lineups)
  - [Shinies](#shinies)
- [Unified Data](#unified-data)
- [Conventions](#conventions)
- [Usage Examples](#usage-examples)

---

## Overview

This API provides comprehensive, up-to-date Pokémon GO event data served as structured JSON.

**Base URL**: `https://pokemn.quest/data/`

**Update Frequency**: Data is automatically updated every 8 hours via GitHub Actions.

**Features**:
- Complete event calendar with dates, bonuses, and featured Pokémon
- Current raid boss rotations with CP ranges and type effectiveness
- Field research task catalog with encounter rewards
- Egg hatch pools by distance tier
- Team GO Rocket lineup information
- Comprehensive shiny availability data
- Unified data file combining all datasets with cross-references

---

## Quick Start

### Fetch All Events

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(response => response.json())
  .then(events => {
    console.log(`Loaded ${events.length} events`);
  });
```

### Fetch Current Raid Bosses

```javascript
fetch('https://pokemn.quest/data/raids.min.json')
  .then(response => response.json())
  .then(raids => {
    raids.forEach(boss => {
      console.log(`${boss.name} (${boss.tier})`);
    });
  });
```

### Fetch Field Research Tasks

```javascript
fetch('https://pokemn.quest/data/research.min.json')
  .then(response => response.json())
  .then(tasks => {
    tasks.forEach(task => {
      console.log(`${task.text} → ${task.rewards[0].name}`);
    });
  });
```

### CORS Support

All endpoints support CORS (Cross-Origin Resource Sharing), allowing direct browser requests from any domain.

### Response Format

All endpoints return minified JSON (`.min.json`) for production use. Human-readable formatted versions (`.json`) are also available for debugging.

---

## Endpoints

Complete list of API endpoints:

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Unified (All Data)** | `https://pokemn.quest/data/unified.min.json` | All datasets combined with indices |
| **Events** | `https://pokemn.quest/data/events.min.json` | All Pokémon GO events |
| **Raids** | `https://pokemn.quest/data/raids.min.json` | Current raid boss data |
| **Research** | `https://pokemn.quest/data/research.min.json` | Field research tasks |
| **Eggs** | `https://pokemn.quest/data/eggs.min.json` | Egg hatch pools |
| **Rocket Lineups** | `https://pokemn.quest/data/rocketLineups.min.json` | Team GO Rocket battles |
| **Shinies** | `https://pokemn.quest/data/shinies.min.json` | Shiny availability data |

### Event Type Endpoints

Filter events by type:

| Event Type | Endpoint |
|------------|----------|
| Community Day | `https://pokemn.quest/data/eventTypes/community-day.min.json` |
| Event | `https://pokemn.quest/data/eventTypes/event.min.json` |
| GO Battle League | `https://pokemn.quest/data/eventTypes/go-battle-league.min.json` |
| GO Pass | `https://pokemn.quest/data/eventTypes/go-pass.min.json` |
| GO Rocket Takeover | `https://pokemn.quest/data/eventTypes/go-rocket-takeover.min.json` |
| Max Battles | `https://pokemn.quest/data/eventTypes/max-battles.min.json` |
| Max Mondays | `https://pokemn.quest/data/eventTypes/max-mondays.min.json` |
| Pokémon GO Tour | `https://pokemn.quest/data/eventTypes/pokemon-go-tour.min.json` |
| Pokémon Spotlight Hour | `https://pokemn.quest/data/eventTypes/pokemon-spotlight-hour.min.json` |
| PokéStop Showcase | `https://pokemn.quest/data/eventTypes/pokestop-showcase.min.json` |
| Raid Battles | `https://pokemn.quest/data/eventTypes/raid-battles.min.json` |
| Raid Day | `https://pokemn.quest/data/eventTypes/raid-day.min.json` |
| Raid Hour | `https://pokemn.quest/data/eventTypes/raid-hour.min.json` |
| Research | `https://pokemn.quest/data/eventTypes/research.min.json` |
| Research Breakthrough | `https://pokemn.quest/data/eventTypes/research-breakthrough.min.json` |
| Research Day | `https://pokemn.quest/data/eventTypes/research-day.min.json` |
| Season | `https://pokemn.quest/data/eventTypes/season.min.json` |
| Special Research | `https://pokemn.quest/data/eventTypes/special-research.min.json` |
| Team GO Rocket | `https://pokemn.quest/data/eventTypes/team-go-rocket.min.json` |
| Timed Research | `https://pokemn.quest/data/eventTypes/timed-research.min.json` |

> **Note:** Some event type endpoints are periodic and only exist when events of that type are active.

---

## Data Types

### Events

**Endpoint**: `https://pokemn.quest/data/events.min.json`

The Events endpoint provides comprehensive data about all Pokémon GO events, including Community Days, raid rotations, research events, GO Battle League seasons, Pokémon GO Tours, seasonal events, and more.

#### Response Structure

The endpoint returns an array of event objects sorted chronologically by start date:

```json
[
  {
    "eventID": "into-the-depths-2026",
    "name": "Into the Depths",
    "eventType": "event",
    "heading": "Event",
    "image": "https://pokemn.quest/images/events/into-the-depths-2026.jpg",
    "start": "2026-01-27T10:00:00.000",
    "end": "2026-02-01T20:00:00.000",
    "isGlobal": false,
    "eventStatus": "active",
    "pokemon": [...],
    "bonuses": [...],
    "raids": [...]
  }
]
```

#### Core Event Fields

All events include these required fields:

| Field | Type | Description |
|-------|------|-------------|
| **`eventID`** | `string` | Unique identifier for the event (URL slug) |
| **`name`** | `string` | Display name of the event |
| **`eventType`** | `string` | Type of event (see [Event Types](#event-types)) |
| **`heading`** | `string` | Display heading/category for the event |
| **`image`** | `string` | Event header/banner image URL |
| **`imageWidth`** | `int` | Stored banner width in pixels when available (50% of source width when uploaded to Blob) |
| **`imageHeight`** | `int` | Stored banner height in pixels when available (50% of source height when uploaded to Blob) |
| **`imageType`** | `string` | Banner image format when available (e.g., `jpg`, `png`) |
| **`start`** | `string` | Event start date/time (ISO 8601 format) |
| **`end`** | `string` | Event end date/time (ISO 8601 format) |
| **`isGlobal`** | `boolean` | Whether the event uses a global start time |
| **`eventStatus`** | `string` | Status: `upcoming`, `active`, or `ended` |

#### Optional Event Fields

Events may include the following optional fields based on content:

##### Pokemon

| Field | Type | Description |
|-------|------|-------------|
| **`pokemon`** | `array` | Featured Pokémon in the event |
| **`pokemon[].name`** | `string` | Pokémon name |
| **`pokemon[].image`** | `string` | Pokémon image URL |
| **`pokemon[].source`** | `string` | Source: `spawn`, `featured`, `incense`, `costumed`, `debut`, `maxDebut`, `raid`, `egg`, `research`, `reward`, `encounter` |
| **`pokemon[].canBeShiny`** | `boolean` | Whether the Pokémon can be shiny |
| **`pokemon[].dexNumber`** | `int\|null` | National Pokédex number, or `null` if unknown |
| **`pokemon[].imageWidth`** | `int` | Image width in pixels |
| **`pokemon[].imageHeight`** | `int` | Image height in pixels |
| **`pokemon[].imageType`** | `string` | Image format (e.g., `png`) |

##### Bonuses

| Field | Type | Description |
|-------|------|-------------|
| **`bonuses`** | `array` | Event bonuses with `text` and `image` fields |
| **`bonuses[].text`** | `string` | Bonus description |
| **`bonuses[].image`** | `string` | Bonus icon image URL |
| **`bonuses[].imageWidth`** | `int` | Bonus icon width in pixels (when available) |
| **`bonuses[].imageHeight`** | `int` | Bonus icon height in pixels (when available) |
| **`bonuses[].imageType`** | `string` | Bonus icon format (e.g., `png`) when available |
| **`bonuses[].multiplier`** | `number` | Parsed bonus multiplier (e.g., `2` for 2×) |
| **`bonuses[].bonusType`** | `string` | Bonus category (e.g., `XP`, `Stardust`, `Candy`) |
| **`bonus`** | `string` | Single bonus text (used in Spotlight Hours) |
| **`bonusDisclaimers`** | `array` | Bonus restrictions/disclaimers |
| **`lureModuleBonus`** | `string` | Lure module bonus description |
| **`exclusiveBonuses`** | `array` | Bonuses exclusive to ticketed players |

##### Raids

| Field | Type | Description |
|-------|------|-------------|
| **`raids`** | `array` | Raid bosses featured in the event |
| **`raids[].name`** | `string` | Pokémon name |
| **`raids[].image`** | `string` | Pokémon image URL |
| **`raids[].canBeShiny`** | `boolean` | Whether the raid boss can be shiny |
| **`raids[].imageWidth`** | `int` | Image width in pixels |
| **`raids[].imageHeight`** | `int` | Image height in pixels |
| **`raids[].imageType`** | `string` | Image format |
| **`raidAlternation`** | `string` | Rotation pattern for alternating bosses |
| **`raidFeaturedAttacks`** | `array` | Featured moves available during the event |

##### Research

| Field | Type | Description |
|-------|------|-------------|
| **`research`** | `object` | Research tasks available |
| **`research.field`** | `array` | Field research tasks |
| **`research.special`** | `array` | Special research quest steps |
| **`research.timed`** | `array` | Timed research quest steps |
| **`research.masterwork`** | `array` | Masterwork research quest steps |
| **`research.breakthrough`** | `object` | Research Breakthrough reward |

##### Battle (GO Battle League)

| Field | Type | Description |
|-------|------|-------------|
| **`battle`** | `object` | GO Battle League information |
| **`battle.leagues`** | `array` | Active league configurations |
| **`battle.featuredAttack`** | `string` | Featured attack for the season |

##### Rocket (Team GO Rocket)

| Field | Type | Description |
|-------|------|-------------|
| **`rocket`** | `object` | Team GO Rocket information |
| **`rocket.shadows`** | `array` | Shadow Pokémon available |
| **`rocket.leaders`** | `array` | Leader lineup information |
| **`rocket.giovanni`** | `object` | Giovanni encounter details |
| **`rocket.grunts`** | `array` | Grunt lineup information |

##### Other Fields

| Field | Type | Description |
|-------|------|-------------|
| **`eggs`** | `object` | Egg pool changes keyed by distance |
| **`shinies`** | `array` | Shiny Pokémon available |
| **`shinyDebuts`** | `array` | New shiny debuts |
| **`showcases`** | `array` | PokéStop Showcase Pokémon |
| **`photobomb`** | `object` | Photobomb feature details |
| **`rewards`** | `object` | Ticketed content and rewards |
| **`habitats`** | `array` | GO Tour habitat rotations |
| **`goPass`** | `object` | GO Pass details |
| **`communityDays`** | `array` | Community Days during the season |
| **`features`** | `array` | Season feature descriptions |
| **`customSections`** | `object` | Generic extracted sections |

#### Boolean Flags

| Field | Type | Description |
|-------|------|-------------|
| **`hasSpawns`** | `boolean` | Whether event has wild spawns |
| **`hasFieldResearchTasks`** | `boolean` | Whether event has field research |
| **`hasBonuses`** | `boolean` | Whether event has active bonuses |
| **`hasRaids`** | `boolean` | Whether event has raid content |
| **`hasEggs`** | `boolean` | Whether event has egg pool changes |
| **`hasShiny`** | `boolean` | Whether event has shiny debuts/features |

#### Event Types

Complete list of supported event types:

| Value | Description | Notes |
|-------|-------------|-------|
| `community-day` | Community Day events | Monthly 3-hour events |
| `event` | General in-game events | Catch-all category |
| `go-battle-league` | GO Battle League seasons | PvP seasons and cups |
| `go-pass` | GO Pass events | Premium ticketed events |
| `go-rocket-takeover` | GO Rocket Takeover events | Large-scale Rocket events |
| `max-battles` | Max Battle events | Dynamax battle rotations |
| `max-mondays` | Max Monday events | Weekly Monday events |
| `pokemon-go-tour` | Pokémon GO Tour events | Major annual events |
| `pokemon-spotlight-hour` | Spotlight Hour events | Weekly 1-hour events |
| `pokestop-showcase` | PokéStop Showcase events | Competitive size contests |
| `raid-battles` | Raid rotation events | Boss rotation announcements |
| `raid-day` | Raid Day events | Special raid events |
| `raid-hour` | Raid Hour events | Weekly Wednesday events |
| `research` | Research events | Special/Masterwork Research |
| `research-breakthrough` | Research Breakthrough | Monthly breakthrough rewards |
| `research-day` | Research Day events | Field research focused |
| `season` | Seasonal events | 3-month seasons |
| `special-research` | Special Research | Story-driven research |
| `team-go-rocket` | Team GO Rocket events | Rocket rotation events |
| `timed-research` | Timed Research events | Time-limited research |

---

### Event Type Details

Each event type has specific characteristics and fields. Below is complete documentation for all 20 event types.

#### Community Day

**Endpoint**: `https://pokemn.quest/data/eventTypes/community-day.min.json`

Monthly events featuring specific Pokémon with increased spawns, exclusive moves, and special bonuses.

**Example**:
```json
{
  "eventID": "february-communityday2026",
  "name": "Vulpix Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://pokemn.quest/images/events/vulpix-community-day.jpg",
  "start": "2026-02-01T14:00:00.000",
  "end": "2026-02-01T17:00:00.000",
  "pokemon": [...],
  "bonuses": [...],
  "shinies": [...]
}
```

**Typical Fields**:
- `pokemon`: Featured Pokémon
- `bonuses`: Event bonuses (3× Catch XP, 2× Catch Candy, etc.)
- `shinies`: Shiny forms available
- `research`: Paid special research (optional)
- `featuredAttack`: Exclusive move for evolutions

**Notes**:
- Duration: Typically 3 hours (14:00-17:00 local time)
- Often includes exclusive moves for evolved forms
- Community Day Classic variants also use this type

---

#### Event (Generic)

**Endpoint**: `https://pokemn.quest/data/eventTypes/event.min.json`

Miscellaneous events that don't fit specific categories — seasonal celebrations, holiday events, themed weekends.

**Example**:
```json
{
  "eventID": "winter-weekend-2026",
  "name": "Winter Weekend 2026",
  "eventType": "event",
  "heading": "Event",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-12-19T10:00:00.000",
  "end": "2026-12-22T20:00:00.000",
  "bonuses": [...],
  "spawns": [...],
  "customSections": {...}
}
```

**Typical Fields**:
- `bonuses`: Event bonuses
- `bonusDisclaimers`: Bonus restrictions
- `features`: Event feature descriptions
- `shinies`: Shiny Pokémon available
- `spawns`: Wild Pokémon spawns
- `customSections`: Dynamically extracted content

**customSections Structure**:
```json
{
  "section-id": {
    "paragraphs": ["Text content..."],
    "lists": [["Item 1", "Item 2"]],
    "pokemon": [...],
    "tables": [...]
  }
}
```

**Notes**:
- Catch-all category for diverse event types
- `customSections` provides flexible access to event-specific content
- Duration varies widely (1 day to 1 week+)

---

#### GO Battle League

**Endpoint**: `https://pokemn.quest/data/eventTypes/go-battle-league.min.json`

GO Battle League season and cup rotation events.

**Example**:
```json
{
  "eventID": "gbl-precious-paths_great-league_ultra-league_master-league-split-3",
  "name": "Great League, Ultra League, and Master League | Precious Paths",
  "eventType": "go-battle-league",
  "heading": "Go Battle League",
  "image": "https://pokemn.quest/images/events/go-battle-league-season-25.jpg",
  "start": "2026-01-27T21:00:00.000Z",
  "end": "2026-02-03T21:00:00.000Z",
  "battle": {
    "leagues": [...]
  }
}
```

**League Object**:
```json
{
  "name": "Great League",
  "cpCap": 1500,
  "typeRestrictions": [],
  "rules": ["Pokémon must be at or below 1,500 CP to enter."]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | League name |
| `cpCap` | `int\|null` | CP limit (1500, 2500, or null) |
| `typeRestrictions` | `array` | Required Pokémon types (empty if unrestricted) |
| `rules` | `array` | League-specific rules |

**Notes**:
- Seasons align with in-game seasons (3 months)
- Rotating cups with different restrictions
- Timestamps use UTC (Z suffix)

---

#### GO Pass

**Endpoint**: `https://pokemn.quest/data/eventTypes/go-pass.min.json`

Paid pass events requiring tickets (GO Fest, Safari Zone, premium events).

**Example**:
```json
{
  "eventID": "party-play-pass-paid-timed-research-february-2026",
  "name": "Party Play Pass",
  "eventType": "go-pass",
  "heading": "Go Pass",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-02-01T10:00:00.000",
  "end": "2026-02-03T20:00:00.000",
  "pricing": {"usd": "$2.99"},
  "pointTasks": [...],
  "milestoneBonuses": [...]
}
```

**Typical Fields**:
- `pricing`: Price in currencies (e.g., `{"usd": "$2.99"}`)
- `pointTasks`: Tasks that award points
- `milestoneBonuses`: Rewards at point thresholds
- `description`: Pass benefits description

**Notes**:
- Requires purchased ticket for exclusive features
- Often the largest events in Pokémon GO
- May include in-person and global variants

---

#### GO Rocket Takeover

**Endpoint**: `https://pokemn.quest/data/eventTypes/go-rocket-takeover.min.json`

Large-scale Team GO Rocket events with increased Rocket activity globally.

**Example**:
```json
{
  "eventID": "team-go-rocket-takeover-jan-2026",
  "name": "Team GO Rocket Takeover",
  "eventType": "go-rocket-takeover",
  "heading": "GO Rocket Takeover",
  "image": "https://pokemn.quest/events/rocket-default.jpg",
  "start": "2026-01-25T00:00:00.000",
  "end": "2026-01-29T20:00:00.000",
  "shadowPokemon": [...],
  "leaders": {...},
  "giovanni": [...]
}
```

**Typical Fields**:
- `shadowPokemon`: Shadow Pokémon available
- `leaders`: Leader-specific lineups (`arlo`, `cliff`, `sierra`)
- `giovanni`: Giovanni's lineup
- `grunts`: Grunt Pokémon
- `bonuses`: Event bonus descriptions (strings)
- `specialResearch`: Special research tasks (strings)

**Notes**:
- Distinct from regular `team-go-rocket` events
- Giovanni's array may contain both Pokémon objects and `{ info: string }` entries
- Duration: Typically 3-5 days

---

#### Max Battles

**Endpoint**: `https://pokemn.quest/data/eventTypes/max-battles.min.json`

Max Battle events featuring specific Dynamax Pokémon.

**Example**:
```json
{
  "eventID": "max-battle-day-february-2026",
  "name": "Max Battle Day",
  "eventType": "max-battles",
  "heading": "Max Battles",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-02-15T14:00:00.000",
  "end": "2026-02-15T17:00:00.000"
}
```

**Typical Fields**:
- `pokemon`: Featured Dynamax Pokémon
- `bonuses`: Active bonuses

**Notes**:
- Rotations: Weekly or bi-weekly
- Requires Max Particles to participate
- Different difficulty tiers available

---

#### Max Mondays

**Endpoint**: `https://pokemn.quest/data/eventTypes/max-mondays.min.json`

Weekly Monday events featuring special Dynamax Pokémon.

**Example**:
```json
{
  "eventID": "max-mondays-2026-02-02",
  "name": "Dynamax Wailmer during Max Monday",
  "eventType": "max-mondays",
  "heading": "Max Mondays",
  "image": "https://pokemn.quest/events/max-battles-kanto.jpg",
  "start": "2026-02-02T18:00:00.000",
  "end": "2026-02-02T19:00:00.000",
  "bonus": "February 2, 2026"
}
```

**Typical Fields**:
- `bonus`: Date or bonus information

**Notes**:
- Occurs weekly on Mondays
- Typically 18:00-19:00 local time
- May include increased Max Particle spawns

---

#### Pokémon GO Tour

**Endpoint**: `https://pokemn.quest/data/eventTypes/pokemon-go-tour.min.json`

Major annual events featuring specific regions or themes.

**Example**:
```json
{
  "eventID": "pokemon-go-tour-kalos-tainan-2026",
  "name": "Pokémon GO Tour: Kalos - Tainan 2026",
  "eventType": "pokemon-go-tour",
  "heading": "Pokemon GO Tour",
  "image": "https://pokemn.quest/events/pogo-tour-kalos.jpg",
  "start": "2026-02-20T09:00:00.000",
  "end": "2026-02-22T17:00:00.000",
  "eventInfo": {...},
  "pokemon": [...],
  "eggs": {...},
  "shinies": [...],
  "shinyDebuts": [...]
}
```

**eventInfo Structure**:
```json
{
  "name": "Pokémon GO Tour: Kalos - Tainan 2026",
  "location": "Tainan Metropolitan Park, Tainan, Taiwan",
  "dates": "February 20–22, 2026",
  "time": "9:00 a.m. – 5:00 p.m. GMT+8",
  "ticketPrice": 733,
  "ticketUrl": ""
}
```

**Typical Fields**:
- `eventInfo`: Event metadata
- `pokemon`: Featured Pokémon
- `eggs`: Egg pools by distance
- `exclusiveBonuses`: Ticket holder bonuses
- `rewards`: Reward categories
- `shinies`: Available shinies
- `shinyDebuts`: New shiny releases
- `whatsNew`: New feature announcements
- `sales`: Merchandise offers

**Notes**:
- Features Pokémon from specific generation/region
- Typically requires ticket for full access
- In-person and global components
- May have version-exclusive spawns

---

#### Pokémon Spotlight Hour

**Endpoint**: `https://pokemn.quest/data/eventTypes/pokemon-spotlight-hour.min.json`

Weekly one-hour events featuring increased spawns of a specific Pokémon.

**Example**:
```json
{
  "eventID": "pokemonspotlighthour2026-02-03",
  "name": "Whismur Spotlight Hour",
  "eventType": "pokemon-spotlight-hour",
  "heading": "Pokemon Spotlight Hour",
  "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_293_00.png",
  "start": "2026-02-03T18:00:00.000",
  "end": "2026-02-03T19:00:00.000",
  "canBeShiny": true,
  "bonus": "2× Catch Stardust"
}
```

**Fields**:
- `canBeShiny`: Whether featured Pokémon can be shiny
- `bonus`: Active gameplay bonus

**Notes**:
- Occurs weekly on Tuesdays at 18:00 local time
- Duration: Exactly 1 hour
- Massively increased spawns of featured Pokémon
- Always includes one gameplay bonus

---

#### PokéStop Showcase

**Endpoint**: `https://pokemn.quest/data/eventTypes/pokestop-showcase.min.json`

Competitive events where Trainers enter Pokémon at PokéStops.

**Example**:
```json
{
  "eventID": "toucannon-ludicolo-quaquaval-showcase-february-2026",
  "name": "Toucannon, Ludicolo, and Quaquaval PokéStop Showcase",
  "eventType": "pokestop-showcase",
  "heading": "Pokestop Showcase",
  "image": "https://pokemn.quest/events/pokestop-showcases-default.jpg",
  "start": "2026-02-02T10:00:00.000",
  "end": "2026-02-04T20:00:00.000",
  "pokemon": [...],
  "description": "..."
}
```

**Typical Fields**:
- `pokemon`: Featured Pokémon eligible for showcase
- `description`: Competition rules and details

**Notes**:
- Duration: Typically several days
- Competition by size (XS or XL)
- Rewards for winners and participants

---

#### Raid Battles

**Endpoint**: `https://pokemn.quest/data/eventTypes/raid-battles.min.json`

Raid boss rotation announcements.

**Example**:
```json
{
  "eventID": "mega-ampharos-in-mega-raids-january-2026",
  "name": "Mega Ampharos in Mega Raids",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://pokemn.quest/events/mega-default.jpg",
  "start": "2026-01-25T10:00:00.000",
  "end": "2026-02-04T10:00:00.000",
  "raids": [...],
  "shinies": [...]
}
```

**Typical Fields**:
- `raids`: Raid boss objects
- `shinies`: Shiny-eligible Pokémon
- `raidAlternation`: Rotation pattern description
- `raidFeaturedAttacks`: Exclusive moves available

**Notes**:
- Rotations: Weekly or bi-weekly
- May feature Legendary, Mega, or Shadow bosses
- Different tiers have separate rotations
- Overlapping rotations common

---

#### Raid Day

**Endpoint**: `https://pokemn.quest/data/eventTypes/raid-day.min.json`

Special events featuring a specific Pokémon in raids throughout the day.

**Example**:
```json
{
  "eventID": "raid-day-february-2026",
  "name": "Raid Day",
  "eventType": "raid-day",
  "heading": "Raid Day",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-02-14T14:00:00.000",
  "end": "2026-02-14T17:00:00.000"
}
```

**Typical Fields**:
- `pokemon`: Featured Pokémon
- `bonuses`: Extra rewards (Rare Candy, XP, etc.)
- `raids`: Featured raid boss details

**Notes**:
- Duration: Typically 3-6 hours
- One specific Pokémon in most raids
- Often includes increased shiny rates
- Additional rewards like Rare Candy XL
- Free Raid Passes from spinning Gyms

---

#### Raid Hour

**Endpoint**: `https://pokemn.quest/data/eventTypes/raid-hour.min.json`

Weekly one-hour events featuring a specific Legendary in 5-star raids.

**Example**:
```json
{
  "eventID": "raidhour20260204",
  "name": "Landorus (Incarnate Forme) Raid Hour",
  "eventType": "raid-hour",
  "heading": "Raid Hour",
  "image": "https://pokemn.quest/events/raidhour.jpg",
  "start": "2026-02-04T18:00:00.000",
  "end": "2026-02-04T19:00:00.000",
  "canBeShiny": true
}
```

**Fields**:
- `canBeShiny`: Whether raid boss can be shiny

**Notes**:
- Occurs weekly on Wednesdays at 18:00 local time
- Duration: Exactly 1 hour
- Features current 5-star raid boss
- Most Gyms have the featured raid active

---

#### Research (Special/Masterwork)

**Endpoint**: `https://pokemn.quest/data/eventTypes/research.min.json`

Special Research or Masterwork Research storylines.

**Example**:
```json
{
  "eventID": "a-mythical-discovery-2026",
  "name": "A Mythical Discovery",
  "eventType": "research",
  "heading": "Research",
  "image": "https://pokemn.quest/events/research-mew.jpg",
  "start": "2026-01-01T00:00:00.000",
  "end": null,
  "hasSpawns": false,
  "hasFieldResearchTasks": false,
  "hasBonuses": false,
  "hasRaids": false,
  "hasEggs": false,
  "hasShiny": false
}
```

**Typical Fields**:
- `research`: Research task details
- `pokemon`: Featured Pokémon rewards

**Notes**:
- Periodic event type (only when active)
- Special Research has no time limit (`end: null`)
- Some auto-granted, others require purchase/participation
- Fully supported by scraper pipeline

---

#### Research Breakthrough

**Endpoint**: `https://pokemn.quest/data/eventTypes/research-breakthrough.min.json`

Research Breakthrough reward rotations (7-day stamp rewards).

**Example**:
```json
{
  "eventID": "research-breakthrough-jan-2026",
  "name": "Research Breakthrough: January 2026",
  "eventType": "research-breakthrough",
  "heading": "Research Breakthrough",
  "image": "https://pokemn.quest/images/pokemon/pm676.png",
  "start": "2026-01-01T13:00:00.000",
  "end": "2026-02-01T13:00:00.000",
  "canBeShiny": true,
  "imageWidth": 128,
  "imageHeight": 128,
  "list": [...]
}
```

**Typical Fields**:
- `canBeShiny`: Whether reward can be shiny
- `list`: All possible breakthrough rewards

**Notes**:
- Monthly rotation
- Periodic event type (only when active)
- Top-level fields may be overwritten with featured Pokémon data

---

#### Research Day

**Endpoint**: `https://pokemn.quest/data/eventTypes/research-day.min.json`

Special events focusing on Field Research tasks.

**Example**:
```json
{
  "eventID": "research-day-march-2026",
  "name": "Research Day",
  "eventType": "research-day",
  "heading": "Research Day",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-03-21T14:00:00.000",
  "end": "2026-03-21T17:00:00.000",
  "isPaid": false,
  "tasks": [],
  "rewards": []
}
```

**Typical Fields**:
- `description`: Event description
- `isPaid`: Whether requires payment
- `price`: Ticket price if paid
- `tasks`: Research tasks available
- `rewards`: Event rewards
- `encounters`: Encounter Pokémon

**Notes**:
- Duration: Typically 11:00-17:00
- Special Field Research from PokéStops
- Often focuses on one or small group of Pokémon
- May include increased shiny rates
- Tasks typically easy to complete

---

#### Season

**Endpoint**: `https://pokemn.quest/data/eventTypes/season.min.json`

Seasonal events defining the overall theme and content (3-month periods).

**Example**:
```json
{
  "eventID": "season-21-precious-paths",
  "name": "Precious Paths",
  "eventType": "season",
  "heading": "Season",
  "image": "https://pokemn.quest/events/season-21-precious-paths.jpg",
  "start": "2025-12-02T10:00:00.000",
  "end": "2026-03-03T10:00:00.000",
  "eggs": {...},
  "bonuses": [...],
  "research": {...},
  "communityDays": [...]
}
```

**Typical Fields**:
- `eggs`: Egg pools by distance
- `bonuses`: Season-long bonuses
- `research`: Research with `breakthrough` and `masterwork`
- `communityDays`: Scheduled Community Days
- `goBattleLeague`: League description

**Notes**:
- Duration: ~3 months (one quarter)
- Defines overall theme and content
- Includes seasonal spawn changes
- GO Battle League seasons align with overall seasons

---

#### Special Research

**Endpoint**: `https://pokemn.quest/data/eventTypes/special-research.min.json`

Story-driven research task lines, often tied to Mythical Pokémon.

**Example**:
```json
{
  "eventID": "special-research-spring-2026",
  "name": "Special Research: Spring 2026",
  "eventType": "special-research",
  "heading": "Special Research",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-03-01T10:00:00.000",
  "end": "2026-03-31T20:00:00.000",
  "description": "Complete special research tasks...",
  "isPaid": true,
  "price": 1.99
}
```

**Typical Fields**:
- `description`: Research description
- `isPaid`: Whether requires ticket
- `price`: Ticket price (USD)
- `tasks`: Research task steps
- `rewards`: Reward descriptions
- `encounters`: Encounter Pokémon

**Notes**:
- Shares scraper with Timed Research
- Often story-driven with Mythical/Legendary Pokémon
- Typically doesn't expire once started
- Periodic event type

---

#### Team GO Rocket

**Endpoint**: `https://pokemn.quest/data/eventTypes/team-go-rocket.min.json`

Team GO Rocket Takeover events (limited-time).

**Example**:
```json
{
  "eventID": "team-go-rocket-takeover-february-2026",
  "name": "Team GO Rocket Takeover",
  "eventType": "team-go-rocket",
  "heading": "Team GO Rocket",
  "image": "https://pokemn.quest/events/team-go-rocket-takeover.jpg",
  "start": "2026-02-15T00:00:00.000",
  "end": "2026-02-18T23:59:00.000"
}
```

**Typical Fields**:
- `pokemon`: New Shadow Pokémon
- `bonuses`: Event bonuses
- `description`: Event description

**Notes**:
- Duration: Typically 3-5 days
- Increased Rocket spawns at PokéStops
- New Shadow Pokémon may debut
- Periodic event type (only when active)
- For current lineups, see [Rocket Lineups endpoint](#rocket-lineups)

---

#### Timed Research

**Endpoint**: `https://pokemn.quest/data/eventTypes/timed-research.min.json`

Time-limited research tasks with exclusive rewards.

**Example**:
```json
{
  "eventID": "timed-research-furfrou",
  "name": "Timed Research: Furfrou",
  "eventType": "timed-research",
  "heading": "Timed Research",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-01-15T10:00:00.000",
  "end": "2026-01-22T20:00:00.000",
  "description": "Complete timed research tasks...",
  "isPaid": false,
  "tasks": [...],
  "encounters": [...]
}
```

**availability Object**:
```json
{
  "start": "Friday, January 15, 10:00 a.m. local time",
  "end": "Thursday, January 22, 8:00 p.m. local time"
}
```

**Typical Fields**:
- `description`: Event description
- `isPaid`: Whether requires ticket
- `price`: Ticket price (USD or `null`)
- `tasks`: Research task steps
- `rewards`: Reward descriptions
- `encounters`: Encounter Pokémon
- `availability`: Human-readable date descriptions

**Notes**:
- Has deadline — must complete before event ends
- Some free, others require ticket
- Shares scraper with Special Research
- Periodic event type

---

### Raids

**Endpoint**: `https://pokemn.quest/data/raids.min.json`

Current raid boss data including tier information, CP ranges, type effectiveness, and shiny availability.

#### Response Structure

```json
[
  {
    "name": "Ekans",
    "originalName": "Ekans",
    "form": null,
    "gender": null,
    "tier": "1-Star Raids",
    "isShadowRaid": false,
    "eventStatus": "ongoing",
    "canBeShiny": true,
    "types": [...],
    "combatPower": {...},
    "boostedWeather": [...],
    "image": "https://pokemn.quest/images/pokemon/...",
    "imageWidth": 256,
    "imageHeight": 256,
    "imageType": "png"
  }
]
```

#### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **`name`** | `string` | Yes | Cleaned name (form/gender removed) |
| **`originalName`** | `string` | Yes | Full display name with form/gender |
| **`form`** | `string\|null` | Yes | Form variant (e.g., `Incarnate`, `Alola`) or `null` |
| **`gender`** | `string\|null` | Yes | Gender (`male`, `female`) or `null` |
| **`tier`** | `string` | Yes | Raid tier |
| **`isShadowRaid`** | `boolean` | Yes | Whether this is a Shadow Raid |
| **`eventStatus`** | `string` | Yes | Status: `ongoing`, `upcoming`, `inactive`, `unknown` |
| **`canBeShiny`** | `boolean` | Yes | Whether shiny form available |
| **`types`** | `array` | Yes | Pokémon types |
| **`combatPower`** | `object` | Yes | CP ranges |
| **`boostedWeather`** | `array` | Yes | Weather boost conditions |
| **`image`** | `string` | Yes | Pokémon image URL |
| **`imageWidth`** | `int` | Yes | Image width in pixels |
| **`imageHeight`** | `int` | Yes | Image height in pixels |
| **`imageType`** | `string` | Yes | Image format |

#### Raid Tiers

| Value | Description |
|-------|-------------|
| `1-Star Raids` | Solo-able, beginner-friendly |
| `3-Star Raids` | Require 1-3 players |
| `5-Star Raids` | Legendary/Mythical, 3-5+ players |
| `Mega Raids` | Mega Evolutions |

#### Type Object

```json
{
  "name": "fire",
  "image": "https://pokemn.quest/images/types/fire.png",
  "imageWidth": 32,
  "imageHeight": 32,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Type name (lowercase) |
| `image` | `string` | Type icon URL |
| `imageWidth` | `int` | Type icon width in pixels (when available) |
| `imageHeight` | `int` | Type icon height in pixels (when available) |
| `imageType` | `string` | Type icon format (e.g., `png`) when available |

#### Combat Power Object

```json
{
  "normal": {
    "min": 988,
    "max": 1048
  },
  "boosted": {
    "min": 1235,
    "max": 1311
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `normal.min` | `int\|null` | Minimum CP (non-boosted) or `null` |
| `normal.max` | `int\|null` | Maximum CP (non-boosted) or `null` |
| `boosted.min` | `int\|null` | Minimum CP (weather-boosted) or `null` |
| `boosted.max` | `int\|null` | Maximum CP (weather-boosted) or `null` |

**Note**: Weather boosting increases CP by ~25% and indicates better IVs (minimum 4/4/4).

#### Weather Object

```json
{
  "name": "foggy",
  "image": "https://pokemn.quest/images/weather/foggy.png",
  "imageWidth": 32,
  "imageHeight": 32,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Weather type |
| `image` | `string` | Weather icon URL |
| `imageWidth` | `int` | Weather icon width in pixels (when available) |
| `imageHeight` | `int` | Weather icon height in pixels (when available) |
| `imageType` | `string` | Weather icon format (e.g., `png`) when available |

**Weather Types**: `sunny`, `rainy`, `partly cloudy`, `cloudy`, `windy`, `snow`, `fog`

---

### Research

**Endpoint**: `https://pokemn.quest/data/research.min.json`

Field research task catalog with encounter and item rewards.

#### Response Structure

```json
[
  {
    "text": "Defeat a Team GO Rocket Grunt",
    "type": "rocket",
    "rewards": [...]
  }
]
```

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| **`text`** | `string` | Research task text |
| **`type`** | `string\|null` | Task category |
| **`rewards`** | `array` | Task rewards |

#### Research Types

| Value | Description |
|-------|-------------|
| `event` | Event-specific tasks |
| `catch` | Catch Pokémon tasks |
| `throw` | Throwing technique tasks |
| `battle` | Battle tasks |
| `explore` | Exploration tasks |
| `training` | Pokémon training tasks |
| `rocket` | Team GO Rocket tasks |
| `buddy` | Buddy Pokémon tasks |
| `ar` | AR scanning tasks |
| `sponsored` | Sponsored tasks |

#### Reward Object

**Encounter Reward**:
```json
{
  "type": "encounter",
  "name": "Fidough",
  "image": "https://pokemn.quest/images/pokemon/pm926.png",
  "canBeShiny": true,
  "combatPower": {
    "min": 389,
    "max": 422
  },
  "imageWidth": 91,
  "imageHeight": 79,
  "imageType": "png"
}
```

**Item/Resource Reward**:
```json
{
  "type": "item",
  "name": "Mysterious Component",
  "quantity": 1,
  "image": "https://pokemn.quest/images/items/mysterious-component.png",
  "imageWidth": 512,
  "imageHeight": 512,
  "imageType": "png"
}
```

**Common Fields** (all reward types):

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Reward type: `encounter`, `item`, `resource` |
| `name` | `string` | Pokémon or item name |
| `image` | `string` | Image URL |
| `imageWidth` | `int` | Image width in pixels |
| `imageHeight` | `int` | Image height in pixels |
| `imageType` | `string` | Image format |

**Encounter-Only Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `canBeShiny` | `boolean` | Whether reward can be shiny |
| `combatPower.min` | `int\|null` | Minimum CP or `null` |
| `combatPower.max` | `int\|null` | Maximum CP or `null` |

**Item/Resource-Only Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `quantity` | `int` | Amount rewarded |

---

### Eggs

**Endpoint**: `https://pokemn.quest/data/eggs.min.json`

Egg hatch pool data organized by distance tier.

#### Response Structure

```json
[
  {
    "name": "Bulbasaur",
    "eggType": "2km",
    "isAdventureSync": false,
    "image": "https://pokemn.quest/images/pokemon/pm1.png",
    "canBeShiny": true,
    "combatPower": {
      "min": 637,
      "max": 637
    },
    "isRegional": false,
    "isGiftExchange": false,
    "rarity": 4,
    "imageWidth": 107,
    "imageHeight": 126,
    "imageType": "png"
  }
]
```

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Pokémon name |
| **`eggType`** | `string` | Egg distance tier |
| **`isAdventureSync`** | `boolean` | Whether from Adventure Sync |
| **`isRegional`** | `boolean` | Whether regionally exclusive |
| **`isGiftExchange`** | `boolean` | Whether from gift exchange |
| **`rarity`** | `int` | Rarity tier (0-5, higher = rarer) |
| **`image`** | `string` | Pokémon image URL |
| **`canBeShiny`** | `boolean` | Whether can be shiny |
| **`combatPower`** | `object` | CP range at hatch |
| **`imageWidth`** | `int` | Image width in pixels |
| **`imageHeight`** | `int` | Image height in pixels |
| **`imageType`** | `string` | Image format |

#### Egg Types

| Value | Description |
|-------|-------------|
| `1km` | 1 kilometer eggs |
| `2km` | 2 kilometer eggs |
| `5km` | 5 kilometer eggs |
| `7km` | 7 kilometer eggs (friend gifts) |
| `10km` | 10 kilometer eggs |
| `12km` | 12 kilometer eggs (Rocket Leaders) |
| `route` | Route gift eggs |
| `adventure5km` | Adventure Sync 5 km rewards |
| `adventure10km` | Adventure Sync 10 km rewards |

#### Combat Power Object

```json
{
  "min": 637,
  "max": 637
}
```

| Field | Type | Description |
|-------|------|-------------|
| `min` | `int\|null` | Minimum CP at hatch or `null` |
| `max` | `int\|null` | Maximum CP at hatch or `null` |

---

### Rocket Lineups

**Endpoint**: `https://pokemn.quest/data/rocketLineups.min.json`

Team GO Rocket battle lineup information.

#### Response Structure

```json
[
  {
    "name": "Cliff",
    "title": "Team GO Rocket Leader",
    "type": "",
    "slots": [
      [/* Slot 1 Pokemon */],
      [/* Slot 2 Pokemon */],
      [/* Slot 3 Pokemon */]
    ]
  }
]
```

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Rocket member name |
| **`title`** | `string` | Member title |
| **`type`** | `string` | Type specialization (empty for Leaders) |
| **`slots`** | `array` | 3 battle slots (arrays of possible Pokémon) |

**Title Values**:
- `Team GO Rocket Boss` (Giovanni)
- `Team GO Rocket Leader` (Arlo, Cliff, Sierra)
- `Team GO Rocket Grunt` (Type-specific grunts)

#### Shadow Pokemon Object

```json
{
  "name": "Magikarp",
  "image": "https://pokemn.quest/images/pokemon/pm129.png",
  "types": ["water"],
  "weaknesses": {
    "double": [],
    "single": ["grass", "electric"]
  },
  "isEncounter": true,
  "canBeShiny": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Pokémon name |
| `image` | `string` | Pokémon image URL |
| `imageWidth` | `int` | Pokemon image width in pixels (when available) |
| `imageHeight` | `int` | Pokemon image height in pixels (when available) |
| `imageType` | `string` | Pokemon image format (e.g., `png`) when available |
| `types` | `array` | Pokémon types (lowercase strings) |
| `weaknesses` | `object` | Type weaknesses |
| `isEncounter` | `boolean` | Whether catchable after battle |
| `canBeShiny` | `boolean` | Whether can be shiny |

#### Weaknesses Object

```json
{
  "double": ["fighting"],
  "single": ["ground", "bug", "steel", "water", "grass", "fairy"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `double` | `array` | Types dealing 4× damage |
| `single` | `array` | Types dealing 2× damage |

---

### Shinies

**Endpoint**: `https://pokemn.quest/data/shinies.min.json`

Comprehensive shiny availability data including release dates, regional variants, and costume forms.

#### Response Structure

```json
[
  {
    "dexNumber": 1,
    "name": "Bulbasaur",
    "releasedDate": "2018-03-25",
    "family": "Bulbasaur",
    "region": null,
    "forms": [...],
    "image": "https://pokemn.quest/images/pokemon/shiny/pm001.png",
    "imageWidth": 256,
    "imageHeight": 256
  }
]
```

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| **`dexNumber`** | `int` | National Pokédex number |
| **`name`** | `string` | Pokémon name (includes regional prefix if applicable) |
| **`releasedDate`** | `string\|null` | Release date (YYYY-MM-DD) or `null` |
| **`family`** | `string\|null` | Evolution family identifier |
| **`region`** | `string\|null` | Regional variant label or `null` |
| **`forms`** | `array` | Alternative forms/costumes |
| **`image`** | `string` | Base shiny sprite URL (optional) |
| **`imageWidth`** | `int` | Image width (optional) |
| **`imageHeight`** | `int` | Image height (optional) |

#### Region Values

| Value | Description |
|-------|-------------|
| `alolan` | Alolan form |
| `galarian` | Galarian form |
| `hisuian` | Hisuian form |
| `paldean` | Paldean form |

#### Form Object

```json
{
  "name": "f19",
  "image": "https://pokemn.quest/images/pokemon/shiny/pm0001_fall2019.png",
  "imageWidth": 256,
  "imageHeight": 256
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Form identifier |
| `image` | `string` | Form shiny sprite URL |
| `imageWidth` | `int` | Image width in pixels |
| `imageHeight` | `int` | Image height in pixels |

#### Integration

Shiny data is automatically cross-referenced in:
- **Raids** - Each boss has `canBeShiny` field
- **Eggs** - Each Pokémon has `canBeShiny` field
- **Research** - Each encounter has `canBeShiny` field

---

## Unified Data

**Endpoint**: `https://pokemn.quest/data/unified.min.json`

The unified data file combines all scraped datasets into a single comprehensive payload with metadata, indices, and a deduplicated Pokémon index.

### Top-Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `meta` | object | Metadata about the file |
| `events` | array | All events (flat model) |
| `eventTypes` | object | Events grouped by type |
| `raids` | array | Current raid bosses |
| `eggs` | array | Egg hatch pool |
| `research` | array | Field research tasks |
| `shinies` | array | Shiny-eligible Pokémon |
| `rocketLineups` | array | Team GO Rocket lineups |
| `pokemonIndex` | object | Deduplicated Pokémon index |
| `indices` | object | Pre-computed lookup indices |
| `stats` | object | Summary statistics |

### meta Object

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-05T12:00:00.000Z",
  "schemaVersion": "1.0.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Data format version |
| `generatedAt` | string | ISO 8601 generation timestamp |
| `schemaVersion` | string | Schema version |

### pokemonIndex

Object containing deduplicated Pokémon entries, keyed by normalized name (lowercase, special characters removed).

**Example Entry**:
```json
{
  "pikachu": {
    "name": "Pikachu",
    "dexNumber": 25,
    "family": "Pikachu",
    "typeCode": null,
    "canBeShiny": true,
    "types": ["electric"],
    "sources": ["shinies", "raids", "eggs"]
  }
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name |
| `dexNumber` | `int\|null` | National Pokédex number |
| `family` | `string\|null` | Evolution family identifier |
| `typeCode` | `string\|null` | Form/variant type code |
| `canBeShiny` | `boolean` | Whether shiny available |
| `types` | `array` | Pokémon types (when available) |
| `sources` | `array` | Which datasets reference this Pokémon |

**Source Values**: `shinies`, `raids`, `eggs`, `research`, `rockets`

### indices Object

Pre-computed lookup indices for fast data access.

#### indices.eventsById

Object mapping `eventID` → full event object.

```json
{
  "into-the-depths-2026": { /* full event object */ }
}
```

#### indices.eventsByType

Object mapping event type slug → array of `eventID` strings.

```json
{
  "community-day": ["february-communityday2026", "march-communityday2026"],
  "raid-hour": ["raidhour20260128", "raidhour20260204"]
}
```

#### indices.raidsByTier

Object mapping raid tier → array of Pokémon names.

```json
{
  "1-Star Raids": ["Ekans", "Koffing"],
  "5-Star Raids": ["Tornadus (Incarnate)"]
}
```

#### indices.raidsByPokemon

Object mapping normalized Pokémon name → array of numeric indices into `raids` array.

```json
{
  "tornadus": [0],
  "landorus": [1]
}
```

#### indices.eggsByDistance

Object mapping egg distance tier → array of numeric indices into `eggs` array.

```json
{
  "2km": [0, 1, 2],
  "10km": [15, 16, 17]
}
```

#### indices.researchByType

Object mapping research type → array of numeric indices into `research` array.

```json
{
  "rocket": [0, 1, 2],
  "catch": [3, 4, 5]
}
```

#### indices.shiniesByDex

Object mapping Pokédex number → array of numeric indices into `shinies` array.

```json
{
  "1": [0],
  "25": [24]
}
```

#### indices.shiniesByName

Object mapping normalized Pokémon name → single numeric index into `shinies` array.

```json
{
  "bulbasaur": 0,
  "pikachu": 24
}
```

#### indices.rocketsByType

Object mapping grunt type → array of numeric indices into `rocketLineups` array.

```json
{
  "fire": [0, 1],
  "leader": [10, 11, 12, 13]
}
```

**Note**: Leaders and Giovanni use key `"leader"` since their `type` field is empty.

### stats Object

Summary statistics about the unified data.

```json
{
  "totalEvents": 150,
  "totalRaids": 25,
  "totalEggs": 75,
  "totalResearch": 50,
  "totalShinies": 600,
  "totalRocketLineups": 20,
  "totalUniquePokemon": 800,
  "eventTypesCounts": {
    "community-day": 12,
    "raid-hour": 52
  },
  "raidTierCounts": {
    "1-Star Raids": 5,
    "5-Star Raids": 2
  },
  "eggDistanceCounts": {
    "2km": 15,
    "10km": 8
  }
}
```

### Usage Examples

**Fetch all data**:
```javascript
const response = await fetch('https://pokemn.quest/data/unified.min.json');
const data = await response.json();
```

**Look up a Pokémon across all datasets**:
```javascript
const pikachu = data.pokemonIndex['pikachu'];
// → { name: 'Pikachu', dexNumber: 25, canBeShiny: true, sources: [...] }
```

**Find all 5-Star raid bosses**:
```javascript
const fiveStarIndices = data.indices.raidsByTier['5-Star Raids'];
const fiveStarBosses = fiveStarIndices.map(i => data.raids[i]);
```

**Get events by type**:
```javascript
const communityDayIds = data.indices.eventsByType['community-day'];
const communityDays = communityDayIds.map(id => data.indices.eventsById[id]);
```

---

## Conventions

### Date Format

All dates use ISO 8601 format with millisecond precision:

**Local time** (no `Z` suffix): `YYYY-MM-DDTHH:mm:ss.sss`

Example: `2026-01-27T10:00:00.000`

Used for most events. Times apply in the player's local timezone (e.g., Community Day starts at 14:00 local time everywhere).

**UTC time** (with `Z` suffix): `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2026-01-27T21:00:00.000Z`

Used for globally synchronized events like GO Battle League seasons, which start at the same moment worldwide.

Most programming languages' date parsers handle this distinction automatically.

### Image URLs

When Vercel Blob storage is enabled, image URLs follow a semantic folder structure:

**Base URL**: `https://pokemn.quest/images/`

**Path Structure**:

| Path Pattern | Content | Example |
|--------------|---------|---------|
| `pokemon/<dex>-<slug>/<filename>` | Pokémon sprites | `pokemon/001-bulbasaur/pokemon_icon_001_00.png` |
| `events/<filename>.<ext>` | Event banners | `events/into-the-depths-2026.jpg`, `events/events-default-img.jpg` |
| `types/<type>.png` | Type icons | `types/poison.png` |
| `weather/<weather>.png` | Weather icons | `weather/cloudy.png` |
| `bonuses/<bonus>.png` | Bonus icons | `bonuses/2x-stardust.png` |
| `eggs/<file>.png` | Egg icons | `eggs/12km.png` |
| `raids/<file>.png` | Raid tier/icons | `raids/legendary.png` |
| `items/<file>.png` | Item icons | `items/mysterious-component.png` |
| `stickers/<file>.png` | Stickers | `stickers/pikachu.png` |
| `misc/<hash-or-file>` | Fallback | `misc/<hash>.bin` |

Standard Pokémon icon dimensions: 256×256 pixels (PNG format)
Event banner uploads are resized to 50% dimensions before storage; `event.imageWidth` and `event.imageHeight` represent the stored banner size.

### Null Handling

**`null` vs Missing Fields**:
- Fields explicitly set to `null` indicate "not applicable" for that entry
- Missing fields mean the scraper didn't find that data
- Both should be treated as "not available"

**Arrays**: Empty arrays (`[]`) indicate no items for that category, distinct from field being absent.

**Example**:
```json
{
  "form": null,           // Not a special form
  "gender": null,         // Gender not specified
  "combatPower": {
    "min": null,          // CP unknown
    "max": null
  }
}
```

### Minified Format

All `.min.json` endpoints return minified JSON (no whitespace) for reduced bandwidth. Human-readable `.json` files are also available:

- Production: `events.min.json`
- Debugging: `events.json`

---

## Usage Examples

### Filter Current Events

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const now = new Date();
    const current = events.filter(e => 
      new Date(e.start) <= now && new Date(e.end) >= now
    );
    console.log(`${current.length} current events`);
  });
```

### Find Events by Type

```javascript
fetch('https://pokemn.quest/data/eventTypes/community-day.min.json')
  .then(r => r.json())
  .then(communityDays => {
    communityDays.forEach(cd => {
      console.log(`${cd.name} - ${cd.start}`);
    });
  });
```

### Get Events with Specific Pokémon

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const eventsWithPikachu = events.filter(e => 
      e.pokemon?.some(p => p.name === 'Pikachu')
    );
    console.log(`Found ${eventsWithPikachu.length} events featuring Pikachu`);
  });
```

### Get Raid Bosses by Tier

```javascript
fetch('https://pokemn.quest/data/raids.min.json')
  .then(r => r.json())
  .then(raids => {
    const legendary = raids.filter(r => r.tier === '5-Star Raids');
    legendary.forEach(boss => {
      console.log(`${boss.name}${boss.canBeShiny ? ' ✨' : ''}`);
      console.log(`  CP: ${boss.combatPower.normal.min}-${boss.combatPower.normal.max}`);
    });
  });
```

### Check Shiny Availability

```javascript
fetch('https://pokemn.quest/data/shinies.min.json')
  .then(r => r.json())
  .then(shinies => {
    const bulbasaur = shinies.find(s => 
      s.dexNumber === 1 && !s.region
    );
    console.log(`Bulbasaur shiny released: ${bulbasaur?.releasedDate}`);
  });
```

### Find Research Tasks with Specific Reward

```javascript
fetch('https://pokemn.quest/data/research.min.json')
  .then(r => r.json())
  .then(tasks => {
    const rareCandy = tasks.filter(t =>
      t.rewards.some(r => r.name.includes('Rare Candy'))
    );
    rareCandy.forEach(task => {
      console.log(`${task.text} → Rare Candy`);
    });
  });
```

### Get Eggs by Distance

```javascript
fetch('https://pokemn.quest/data/eggs.min.json')
  .then(r => r.json())
  .then(eggs => {
    const tenKm = eggs.filter(e => e.eggType === '10km');
    console.log(`${tenKm.length} Pokémon in 10km eggs`);
    tenKm.forEach(e => {
      console.log(`  ${e.name}${e.canBeShiny ? ' ✨' : ''} (rarity: ${e.rarity})`);
    });
  });
```

### Find Upcoming Events with Bonuses

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const now = new Date();
    const upcomingWithBonuses = events.filter(e => 
      new Date(e.start) > now && 
      e.bonuses && 
      e.bonuses.length > 0
    );
    
    upcomingWithBonuses.forEach(event => {
      console.log(`\n${event.name} (${event.start})`);
      event.bonuses.forEach(bonus => {
        console.log(`  - ${bonus.text}`);
      });
    });
  });
```

### Use Unified Data for Cross-Reference

```javascript
fetch('https://pokemn.quest/data/unified.min.json')
  .then(r => r.json())
  .then(data => {
    // Find all datasets featuring Pikachu
    const pikachu = data.pokemonIndex['pikachu'];
    console.log(`Pikachu appears in: ${pikachu.sources.join(', ')}`);
    
    // Get all 5-star raids
    const fiveStarNames = data.indices.raidsByTier['5-Star Raids'];
    console.log(`Current 5-star bosses: ${fiveStarNames.join(', ')}`);
    
    // Get all Community Days
    const cdIds = data.indices.eventsByType['community-day'];
    const communityDays = cdIds.map(id => data.indices.eventsById[id]);
    console.log(`${communityDays.length} Community Days`);
  });
```

### Filter Events by Date Range

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-02-28');
    
    const februaryEvents = events.filter(e => {
      const eventStart = new Date(e.start);
      const eventEnd = new Date(e.end);
      return eventStart <= endDate && eventEnd >= startDate;
    });
    
    console.log(`${februaryEvents.length} events in February 2026`);
  });
```

### Check Giovanni's Current Lineup

```javascript
fetch('https://pokemn.quest/data/rocketLineups.min.json')
  .then(r => r.json())
  .then(lineups => {
    const giovanni = lineups.find(l => l.name === 'Giovanni');
    if (giovanni) {
      console.log('Giovanni\'s lineup:');
      giovanni.slots.forEach((slot, i) => {
        console.log(`  Slot ${i + 1}:`);
        slot.forEach(pokemon => {
          console.log(`    - ${pokemon.name}`);
        });
      });
    }
  });
```

---

## Data Quality Notes

1. **Minified Format**: All `.min.json` endpoints return minified JSON for reduced bandwidth. Use `.json` files for debugging.

2. **Null Values**: Fields may be `null` or absent. Both indicate "not available" — handle gracefully.

3. **Empty Arrays**: Empty arrays (`[]`) indicate no items for that category, distinct from field absence.

4. **HTML Content**: Some fields (e.g., `whatsNew`) may contain HTML tags including `<img>` and `<span>`.

5. **Pokémon Naming**:
   - Regional forms: "Alolan Diglett", "Galarian Meowth"
   - Gender differences: "Indeedee (Male)", "Indeedee (Female)"
   - Forms: "Red Flower Flabébé"
   - Unown letters: "Unown O", "Unown S"

6. **canBeShiny**: Indicates if the shiny form exists in-game, not necessarily available during a specific event. Cross-reference with event `shinies`/`shinyDebuts` arrays for event-specific availability.

7. **Image Dimensions**: Currently most Pokémon images are 256×256 PNG files. Actual dimensions provided in `imageWidth`/`imageHeight` fields when available.

8. **CP Values**: Combat Power ranges may be `null` when data is unavailable or hasn't been verified yet.

9. **Regional Variants**: Separate entries in `shinies` data with their own `dexNumber` and `region` field.

10. **Periodic Event Types**: Some event types (GO Rocket Takeover, Research Breakthrough, etc.) are periodic and only appear when active. Empty result arrays are normal during inactive periods.

---

## Support & Feedback

This API is maintained as an open-source project. Data is automatically updated every 8 hours.

**GitHub Repository**: [scrapedPoGo](https://github.com/YOUR_USERNAME/scrapedPoGo)

**Update Frequency**: Every 8 hours via GitHub Actions

**Rate Limiting**: None currently enforced. Please be respectful and cache responses appropriately.

**CORS**: Fully enabled for all endpoints — direct browser requests supported from any domain.

---

*Last Updated: February 5, 2026*
