# Events Data

**URL**: `https://pokemn.quest/data/events.min.json`

## Overview

The Events endpoint provides comprehensive data about all Pokemon GO events, including Community Days, raid rotations, research events, GO Battle League seasons, Pokemon GO Tours, seasonal events, and more. Each event includes timing, featured Pokemon, bonuses, and type-specific content.

## Response Structure

The endpoint returns a minified JSON array of event objects sorted chronologically by start date:

```json
[
  {
    "eventID": "into-the-depths-2026",
    "name": "Into the Depths",
    "eventType": "event",
    "heading": "Event",
    "image": "https://pokemn.quest/events/into-the-depths-2026.jpg",
    "start": "2026-01-27T10:00:00.000",
    "end": "2026-02-01T20:00:00.000",
    "isGlobal": false,
    "eventStatus": "active",
    "pokemon": [...],
    "bonuses": [...],
    "raids": [...]
  },
  ...
]
```

## Core Fields

All events share these required core fields:

| Field | Type | Description |
|-------|------|-------------|
| **`eventID`** | `string` | Unique identifier for the event |
| **`name`** | `string` | Display name of the event |
| **`eventType`** | `string` | Type of the event (see [Event Types](#event-types) below) |
| **`heading`** | `string` | Display heading/category for the event |
| **`image`** | `string` | Event header/banner image URL |
| **`imageWidth`** | `int` | Stored banner width in pixels when available (50% of source width when uploaded to Blob) |
| **`imageHeight`** | `int` | Stored banner height in pixels when available (50% of source height when uploaded to Blob) |
| **`imageType`** | `string` | Banner image format when available (e.g., `jpg`, `png`) |
| **`start`** | `string` | Event start date/time in ISO 8601 format (see [Date Format](#date-format)) |
| **`end`** | `string` | Event end date/time in ISO 8601 format (see [Date Format](#date-format)) |
| **`isGlobal`** | `boolean` | Whether the event uses a global start time (no local timezone offset) |
| **`eventStatus`** | `string` | Computed status: `upcoming`, `active`, or `ended` |

## Optional Fields

Depending on the event type and content, events may include any of the following optional fields:

### Pokemon

| Field | Type | Description |
|-------|------|-------------|
| **`pokemon`** | `array` | Featured Pokemon in the event (spawns, debuts, featured encounters) |
| **`pokemon[].name`** | `string` | Pokemon name |
| **`pokemon[].image`** | `string` | Pokemon image URL |
| **`pokemon[].altText`** | `string` | Accessible alt text for the image |
| **`pokemon[].source`** | `string` | Where the Pokemon appears.<br />Values: `spawn`, `featured`, `incense`, `costumed`, `debut`, `maxDebut`, `raid`, `egg`, `research`, `reward`, `encounter` |
| **`pokemon[].canBeShiny`** | `boolean` | Whether the Pokemon can be encountered as shiny |
| **`pokemon[].dexNumber`** | `int\|null` | National Pokédex number, or `null` if not determinable |
| **`pokemon[].imageWidth`** | `int` | Image width in pixels |
| **`pokemon[].imageHeight`** | `int` | Image height in pixels |
| **`pokemon[].imageType`** | `string` | Image format (e.g., `png`) |

### Bonuses

| Field | Type | Description |
|-------|------|-------------|
| **`bonuses`** | `array` | Event bonuses as objects with `text` and `image` fields |
| **`bonuses[].text`** | `string` | Bonus description text |
| **`bonuses[].image`** | `string` | Bonus icon image URL |
| **`bonuses[].imageWidth`** | `int` | Bonus icon width in pixels (when available) |
| **`bonuses[].imageHeight`** | `int` | Bonus icon height in pixels (when available) |
| **`bonuses[].imageType`** | `string` | Bonus icon format (e.g., `png`) |
| **`bonuses[].multiplier`** | `number` | Parsed numeric bonus multiplier (e.g., `2` for 2×), when parseable |
| **`bonuses[].bonusType`** | `string` | Parsed bonus category (e.g., `XP`, `Stardust`, `Candy`), when parseable |
| **`bonus`** | `string` | Single bonus text (alternative to `bonuses` array, used in Spotlight Hours and Max Mondays) |
| **`bonusDisclaimers`** | `array` | Disclaimers/restrictions for bonuses (e.g., regional, ticket-only) |
| **`lureModuleBonus`** | `string` | Lure module bonus description |
| **`exclusiveBonuses`** | `array` | Bonuses exclusive to ticketed players |

### Raids

| Field | Type | Description |
|-------|------|-------------|
| **`raids`** | `array` | Raid bosses featured in the event |
| **`raids[].name`** | `string` | Pokemon name |
| **`raids[].image`** | `string` | Pokemon image URL |
| **`raids[].altText`** | `string` | Accessible alt text for the image |
| **`raids[].canBeShiny`** | `boolean` | Whether the raid boss can be shiny |
| **`raids[].dexNumber`** | `int\|null` | National Pokédex number, or `null` if not determinable |
| **`raids[].tier`** | `string` | Raid tier (e.g., `1-Star`, `3-Star`, `5-Star`, `Mega`) |
| **`raids[].imageWidth`** | `int` | Image width in pixels |
| **`raids[].imageHeight`** | `int` | Image height in pixels |
| **`raids[].imageType`** | `string` | Image format (e.g., `png`) |
| **`raidAlternation`** | `string` | Alternation pattern for rotating raid bosses |
| **`raidFeaturedAttacks`** | `array` | Featured moves available during the event |

### Research

| Field | Type | Description |
|-------|------|-------------|
| **`research`** | `array\|object` | Research tasks available during the event |
| **`research.field`** | `array` | Field research tasks |
| **`research.special`** | `array` | Special research quest steps |
| **`research.timed`** | `array` | Timed research quest steps |
| **`research.masterwork`** | `array` | Masterwork research quest steps |
| **`research.breakthrough`** | `object` | Research Breakthrough encounter reward |

**ResearchTask Object (Field Research):**
- `task` (string): Task description
- `encounter` (Pokemon, optional): Encounter reward
- `rewards` (Array<Reward>, optional): Item/reward list

**ResearchStep Object (Special/Timed/Masterwork Research):**
- `name` (string): Step name/title
- `step` (number): Step number
- `tasks` (Array<Task>): Individual tasks in this step
- `rewards` (Array<Reward>): Rewards for completing the step

**Task Object:**
- `text` (string): Task description
- `reward` (Reward): Reward for this specific task

**Reward Object:**
- `text` (string): Reward description
- `image` (string): Reward icon URL

### Battle (GO Battle League)

| Field | Type | Description |
|-------|------|-------------|
| **`battle`** | `object` | GO Battle League information |
| **`battle.leagues`** | `array` | Active league configurations (see [Battle.League](#battleleague)) |
| **`battle.featuredAttack`** | `string` | Featured attack/move for the season |

### Rocket (Team GO Rocket)

| Field | Type | Description |
|-------|------|-------------|
| **`rocket`** | `object` | Team GO Rocket information |
| **`rocket.shadows`** | `array` | Shadow Pokemon available |
| **`rocket.leaders`** | `array` | Leader lineup information |
| **`rocket.giovanni`** | `object\|array` | Giovanni encounter details |
| **`rocket.grunts`** | `array` | Grunt lineup information |

### Eggs

| Field | Type | Description |
|-------|------|-------------|
| **`eggs`** | `array\|object` | Egg pool changes keyed by distance.<br />Keys: `1km`, `2km`, `5km`, `7km`, `10km`, `12km`, `adventure5km`, `adventure10km`, `route` |

### Shinies

| Field | Type | Description |
|-------|------|-------------|
| **`shinies`** | `array` | Shiny Pokemon available during the event |
| **`shinyDebuts`** | `array` | Pokemon with shiny debuts during the event |

### Rewards & Tickets

| Field | Type | Description |
|-------|------|-------------|
| **`rewards`** | `array\|object` | Event rewards as an array, or ticketed content as an object |
| **`rewards.ticketedResearch`** | `object` | Paid research ticket details |
| **`rewards.ticketBonuses`** | `array` | Bonuses for ticket holders |
| **`rewards.ticketPrice`** | `number\|null` | Ticket price in USD, or `null` if free |
| **`rewards.ticketAddOns`** | `array` | Additional purchasable content |

### Showcases

| Field | Type | Description |
|-------|------|-------------|
| **`showcases`** | `array` | PokéStop Showcase Pokemon |

### Photobomb

| Field | Type | Description |
|-------|------|-------------|
| **`photobomb`** | `object` | Photobomb feature details |
| **`photobomb.description`** | `string` | Description of photobomb mechanic |
| **`photobomb.pokemon`** | `array` | Pokemon that can photobomb |

### Season-Specific

| Field | Type | Description |
|-------|------|-------------|
| **`communityDays`** | `array` | Community Days scheduled during the season |
| **`features`** | `array` | Season feature descriptions |
| **`goBattleLeague`** | `string` | Seasonal GO Battle League description text |

### GO Pass Specific

| Field | Type | Description |
|-------|------|-------------|
| **`goPass`** | `object` | GO Pass details |
| **`pricing`** | `object` | Pricing information |
| **`pointTasks`** | `object` | Tasks that award points (with `daily`, `weekly`, `bonus` arrays) |
| **`ranks`** | `array` | Rank tiers and rewards |
| **`featuredPokemon`** | `array` | Featured Pokemon for GO Pass |
| **`milestoneBonuses`** | `object` | Milestone reward information |

### GO Tour Specific

| Field | Type | Description |
|-------|------|-------------|
| **`eventInfo`** | `object` | Event venue and timing details |
| **`habitats`** | `object` | Rotating habitat areas keyed by habitat name |
| **`whatsNew`** | `array` | New features for the tour |
| **`sales`** | `array` | In-game sales and offers |

**whatsNew Example:**
```json
[
  "Trainers who participate in raids will have a chance of receiving new Special Backgrounds!",
  "<img src=\"https://pokemn.quest/events/kalos-special-backgrounds.png\">"
]
```

### Max Battles

| Field | Type | Description |
|-------|------|-------------|
| **`maxBattles`** | `object` | Max Battle event details |
| **`maxMondays`** | `object` | Max Monday event details |

### Content Flags

These boolean flags indicate what content is available for an event (flat at top level, not nested):

| Field | Type | Description |
|-------|------|-------------|
| **`hasSpawns`** | `boolean` | Whether the event has wild Pokemon spawns |
| **`hasBonuses`** | `boolean` | Whether the event has bonuses |
| **`hasRaids`** | `boolean` | Whether the event has raid bosses |
| **`hasEggs`** | `boolean` | Whether the event has egg pool changes |
| **`hasShiny`** | `boolean` | Whether shiny Pokemon are available |
| **`hasFieldResearchTasks`** | `boolean` | Whether field research tasks are available |

### Other

| Field | Type | Description |
|-------|------|-------------|
| **`canBeShiny`** | `boolean` | Whether the featured Pokemon can be shiny (used in Raid Hour and Spotlight Hour events) |
| **`description`** | `string` | Event description text |
| **`customSections`** | `object` | Additional scraped sections not matching standard fields |
| **`availability`** | `object` | Event availability window with `start` and `end` fields |
| **`encounters`** | `array` | Encounter Pokemon list |
| **`isPaid`** | `boolean` | Whether the event requires payment |
| **`price`** | `number\|null` | Event ticket price, or `null` if free |
| **`tasks`** | `array` | Research tasks (alternative structure) |
| **`habitatRotation`** | `array` | GO Tour habitat rotation schedule |
| **`megaRaidSchedule`** | `array` | Mega Raid boss schedule by day |
| **`bonusCategories`** | `array` | Categorized bonus groups (e.g., GO Tour bonus categories) |
| **`branchingResearch`** | `object` | Branching Special Research paths |
| **`costumedPokemon`** | `array` | Costumed Pokemon available during the event |
| **`megaDebuts`** | `array` | New Mega Evolutions debuting during the event |
| **`specialBackgrounds`** | `array` | Special backgrounds available during the event |
| **`timedResearchRegions`** | `array` | Region-specific Timed Research details |
| **`routes`** | `array` | Route-related Pokemon/information |
| **`eventLocations`** | `array` | In-person event locations |
| **`eventTags`** | `array` | Event categorization tags |
| **`researchType`** | `string` | Type of research (special, masterwork, timed) |
| **`expires`** | `boolean` | Whether the research expires |
| **`webStoreInfo`** | `object` | Web store information/URL |
| **`promoCodes`** | `array` | Promotional codes for the event |

**eventInfo Object Structure:**
```json
{
  "name": "Pokémon GO Tour: Kalos - Global 2026",
  "location": "",
  "dates": "",
  "time": "",
  "ticketPrice": null,
  "ticketUrl": ""
}
```

**availability Object Structure:**
```json
{
  "start": "2026-02-28T00:00:00.000",
  "end": "2026-03-02T23:59:59.000"
}
```

## Other Objects

### Pokemon

Each Pokemon object in the `pokemon` array has the following structure:

```json
{
  "name": "Ponyta",
  "image": "https://pokemn.quest/pokemon/077-ponyta/pokemon_icon_077_00.png",
  "altText": "",
  "canBeShiny": true,
  "dexNumber": 77,
  "source": "spawn",
  "imageWidth": 256,
  "imageHeight": 256,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Pokemon name |
| **`image`** | `string` | Pokemon image URL |
| **`altText`** | `string` | Accessible alt text for the image |
| **`source`** | `string` | Source type: `spawn`, `featured`, `incense`, `costumed`, `debut`, `maxDebut`, `raid`, `egg`, `research`, `reward`, `encounter` |
| **`canBeShiny`** | `boolean` | Whether the Pokemon can be shiny |
| **`dexNumber`** | `int\|null` | National Pokédex number, or `null` if not determinable |
| **`imageWidth`** | `int` | Image width in pixels |
| **`imageHeight`** | `int` | Image height in pixels |
| **`imageType`** | `string` | Image format (e.g., `png`) |

### Raid

Each raid object in the `raids` array has the following structure:

```json
{
  "name": "Regigigas",
  "image": "https://pokemn.quest/pokemon/486-regigigas/pokemon_icon_486_00.png",
  "altText": "",
  "canBeShiny": true,
  "dexNumber": 486,
  "imageWidth": 256,
  "imageHeight": 256,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Pokemon name |
| **`image`** | `string` | Pokemon image URL |
| **`altText`** | `string` | Accessible alt text for the image |
| **`canBeShiny`** | `boolean` | Whether the raid boss can be shiny |
| **`dexNumber`** | `int\|null` | National Pokédex number, or `null` if not determinable |
| **`tier`** | `string` | Raid tier (e.g., `1-Star`, `3-Star`, `5-Star`, `Mega`) |
| **`imageWidth`** | `int` | Image width in pixels |
| **`imageHeight`** | `int` | Image height in pixels |
| **`imageType`** | `string` | Image format (e.g., `png`) |

### Battle.League

Each league object in the `battle.leagues` array has the following structure:

```json
{
  "name": "Great League",
  "cpCap": 1500,
  "typeRestrictions": [],
  "rules": [
    "Only Pokémon with 1500 CP or less are eligible",
    "Battles are 3v3 format"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | League name (e.g., "Great League", "Ultra League", "Love Cup") |
| **`cpCap`** | `int\|null` | Maximum CP allowed (1500, 2500, null for unlimited) |
| **`typeRestrictions`** | `array` | Required Pokemon types (empty for unrestricted) |
| **`rules`** | `array` | League-specific rules and restrictions |

## Event Types

Events are categorized by type. Each type has its own filtered endpoint. All types listed below are fully supported by the scraper pipeline — some are seasonal or periodic and may not always have active events in the data.

| Event Type | Description |
|------------|-------------|
| **`community-day`** | Monthly Community Day events |
| **`event`** | General/generic events |
| **`go-battle-league`** | GO Battle League seasons and rotations |
| **`go-pass`** | GO Pass subscription events |
| **`go-rocket-takeover`** | Team GO Rocket Takeover events (periodic) |
| **`max-battles`** | Max Battle events (Dynamax battles) |
| **`max-mondays`** | Max Monday events |
| **`pokemon-go-tour`** | Pokemon GO Tour events |
| **`pokemon-spotlight-hour`** | Weekly Spotlight Hour events |
| **`pokestop-showcase`** | PokéStop Showcase events |
| **`raid-battles`** | Raid rotation announcements |
| **`raid-day`** | Special Raid Day events |
| **`raid-hour`** | Weekly Raid Hour events |
| **`research`** | Special Research / Masterwork Research events (periodic) |
| **`research-breakthrough`** | Research Breakthrough reward rotations (periodic) |
| **`research-day`** | Research Day events |
| **`season`** | Seasonal events (3-month periods) |
| **`special-research`** | Standalone Special Research stories (periodic) |
| **`team-go-rocket`** | Team GO Rocket events (periodic) |
| **`timed-research`** | Timed Research events (periodic) |

### Other Source Category Labels

These labels appear in the source data as CSS classes but are not normalized as `eventType` values in this API. They may be mapped into the supported event types above or omitted:

- `bonus-hour`
- `city-safari`
- `giovanni-special-research`
- `global-challenge`
- `live-event`
- `location-specific`
- `pokemon-go-fest`
- `potential-ultra-unlock`
- `safari-zone`
- `ticketed`
- `ticketed-event`
- `update`
- `wild-area`

## Per-Event-Type Endpoints

Each event type has its own filtered endpoint containing only events of that type:

- Minimized: `https://pokemn.quest/data/eventTypes/<eventType>.min.json`

**Example**: `https://pokemn.quest/data/eventTypes/community-day.min.json`

**Available event type endpoints**:
- `community-day.min.json`
- `event.min.json`
- `go-battle-league.min.json`
- `go-pass.min.json`
- `go-rocket-takeover.min.json` *(when active)*
- `max-battles.min.json`
- `max-mondays.min.json`
- `pokemon-go-tour.min.json`
- `pokemon-spotlight-hour.min.json`
- `pokestop-showcase.min.json`
- `raid-battles.min.json`
- `raid-day.min.json`
- `raid-hour.min.json`
- `research.min.json` *(when active)*
- `research-breakthrough.min.json` *(when active)*
- `research-day.min.json`
- `season.min.json`
- `special-research.min.json` *(when active)*
- `team-go-rocket.min.json` *(when active)*
- `timed-research.min.json` *(when active)*

> **Note:** Per-event-type endpoint files are only generated when events of that type are present in the current data. Periodic event types (marked *when active*) may not always have a corresponding file.

## Date Format

All dates follow ISO 8601 format with millisecond precision:

- **Local time**: `YYYY-MM-DDTHH:mm:ss.sss` (e.g., `2026-01-27T10:00:00.000`)
- **UTC time**: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2026-01-27T21:00:00.000Z`)

**Local time** (no `Z` suffix): Used for most events. These times apply in the player's local timezone (e.g., Community Day starts at 14:00 local time everywhere).

**UTC time** (with `Z` suffix): Used for globally synchronized events like GO Battle League seasons, which start at the same moment worldwide.

Most programming languages' date parsers (e.g., JavaScript's `Date.parse()`) handle this distinction automatically.

## Example Events

### Generic Event

```json
{
  "eventID": "into-the-depths-2026",
  "name": "Into the Depths",
  "eventType": "event",
  "heading": "Event",
  "image": "https://pokemn.quest/images/events/into-the-depths-2026.jpg",
  "start": "2026-01-27T10:00:00.000",
  "end": "2026-02-01T20:00:00.000",
  "pokemon": [
    {
      "name": "Chinchou",
      "image": "https://pokemn.quest/images/pokemon/pm170.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 78,
      "imageHeight": 87,
      "imageType": "png"
    },
    {
      "name": "Lanturn",
      "image": "https://pokemn.quest/images/pokemon/pm171.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 91,
      "imageHeight": 87,
      "imageType": "png"
    },
    {
      "name": "Kyogre",
      "image": "https://pokemn.quest/images/pokemon/pm382.png",
      "source": "featured",
      "canBeShiny": true,
      "imageWidth": 150,
      "imageHeight": 112,
      "imageType": "png"
    }
  ],
  "bonuses": [
    {
      "text": "2× Catch Stardust",
      "image": "https://pokemn.quest/events/bonuses/stardust.png"
    },
    {
      "text": "2× Catch XP",
      "image": "https://pokemn.quest/events/bonuses/xp.png"
    }
  ]
}
```

### Raid Battles Event

```json
{
  "eventID": "tornadus-incarnate-forme-in-5-star-raid-battles-january-2026",
  "name": "Tornadus (Incarnate Forme) in 5-star Raid Battles",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://pokemn.quest/images/events/default.jpg",
  "start": "2026-01-25T10:00:00.000",
  "end": "2026-02-04T10:00:00.000",
  "raids": [
    {
      "name": "Tornadus (Incarnate)",
      "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_641_11.png",
      "canBeShiny": true,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    },
    {
      "name": "Mega Ampharos",
      "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_181_51.png",
      "canBeShiny": true,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ]
}
```

### GO Battle League Event

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
    "leagues": [
      {
        "name": "Great League",
        "cpCap": 1500,
        "typeRestrictions": [],
        "rules": [
          "Only Pokémon with 1500 CP or less are eligible"
        ]
      },
      {
        "name": "Ultra League",
        "cpCap": 2500,
        "typeRestrictions": [],
        "rules": [
          "Only Pokémon with 2500 CP or less are eligible"
        ]
      },
      {
        "name": "Master League",
        "cpCap": null,
        "typeRestrictions": [],
        "rules": [
          "No CP limit"
        ]
      }
    ]
  }
}
```

### Community Day Event

```json
{
  "eventID": "february-communityday2026",
  "name": "Vulpix Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://pokemn.quest/images/events/vulpix-community-day.jpg",
  "start": "2026-02-01T14:00:00.000",
  "end": "2026-02-01T17:00:00.000",
  "pokemon": [
    {
      "name": "Vulpix",
      "image": "https://pokemn.quest/images/pokemon/pm37.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 76,
      "imageHeight": 85,
      "imageType": "png"
    }
  ],
  "bonuses": [
    {
      "text": "3× Catch XP",
      "image": "https://pokemn.quest/events/bonuses/xp.png"
    },
    {
      "text": "2× Catch Candy",
      "image": "https://pokemn.quest/events/bonuses/candy.png"
    },
    {
      "text": "2× chance for Candy XL from catching",
      "image": "https://pokemn.quest/events/bonuses/xl-candy.png"
    }
  ],
  "shinies": [
    {
      "name": "Vulpix",
      "image": "https://pokemn.quest/images/pokemon/pm37.png",
      "canBeShiny": true
    }
  ]
}
```

## Example Usage

### Get all current and upcoming events

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const now = new Date();
    const current = events.filter(e => 
      new Date(e.start) <= now && new Date(e.end) >= now
    );
    const upcoming = events.filter(e => 
      new Date(e.start) > now
    );
    
    console.log(`${current.length} current events`);
    console.log(`${upcoming.length} upcoming events`);
  });
```

### Find events by type

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const communityDays = events.filter(e => 
      e.eventType === 'community-day'
    );
    
    communityDays.forEach(cd => {
      console.log(`${cd.name} - ${cd.start}`);
    });
  });
```

### Get events with specific Pokemon

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

### Get events with raids

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const raidEvents = events.filter(e => 
      e.raids && e.raids.length > 0
    );
    
    raidEvents.forEach(event => {
      console.log(`${event.name}:`);
      event.raids.forEach(raid => {
        console.log(`  - ${raid.name}${raid.canBeShiny ? ' ✨' : ''}`);
      });
    });
  });
```

### Get events with bonuses

```javascript
fetch('https://pokemn.quest/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const bonusEvents = events.filter(e => 
      e.bonuses && e.bonuses.length > 0
    );
    
    bonusEvents.forEach(event => {
      console.log(`${event.name}:`);
      event.bonuses.forEach(bonus => {
        console.log(`  - ${bonus.text}`);
      });
    });
  });
```

### Filter by date range

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

### Use event type-specific endpoint

```javascript
// Get only Community Day events
fetch('https://pokemn.quest/data/eventTypes/community-day.min.json')
  .then(r => r.json())
  .then(communityDays => {
    const nextCD = communityDays.find(cd => 
      new Date(cd.start) > new Date()
    );
    
    if (nextCD) {
      console.log(`Next Community Day: ${nextCD.name}`);
      console.log(`Date: ${nextCD.start}`);
    }
  });
```

## Data Collection

The API provides comprehensive event data including:
1. **Basic metadata** (name, image, type)
2. **Accurate dates and times** (start/end times in ISO 8601 format)
3. **Detailed content** (Pokemon, raids, bonuses, and event-specific features)

## 📦 Vercel Blob Image Paths (`pokemn.quest`)

**Public**: `https://pokemn.quest/images/<path>`  

---

### 🔧 Canonical path scheme (blobNaming.js)
| Prefix                        | Stored content                                      | Example URL (public) |
|------------------------------|-----------------------------------------------------|----------------------|
| `pokemon/<dex>-<slug>/...`   | Pokémon icons/sprites                               | `.../pokemon/001-bulbasaur/pokemon_icon_001_00.png` |
| `events/<filename>.<ext>`    | Event banners                                      | `.../events/into-the-depths-2026.jpg`, `.../events/events-default-img.jpg` |
| `types/<type>.png`           | Type icons                                         | `.../types/poison.png` |
| `weather/<weather>.png`      | Weather icons                                      | `.../weather/cloudy.png` |
| `bonuses/<bonus>.png`        | Bonus icons                                        | `.../bonuses/2x-stardust.png` |
| `eggs/<file>.png`            | Egg icons                                          | `.../eggs/12km.png` |
| `raids/<file>.png`           | Raid tier/icons                                    | `.../raids/legendary.png` |
| `items/<file>.png`           | Items                                              | `.../items/mysterious-component.png` |
| `stickers/<file>.png`        | Stickers                                           | `.../stickers/pikachu.png` |
| `misc/<hash-or-file>`        | Fallback                                           | `.../misc/<hash>.bin` |

> Publicly served by prefixing with `https://pokemn.quest/images/`  
> Event banner uploads are resized to 50% dimensions before storage; `event.imageWidth` and `event.imageHeight` represent the stored banner size.

---

## Integration with Other Endpoints

Event data is self-contained but can be cross-referenced with other endpoints:

- **Raids** (`https://pokemn.quest/data/raids.min.json`) - Full raid boss details including CP, types, weather boosts
- **Eggs** (`https://pokemn.quest/data/eggs.min.json`) - Complete egg pool with rarity and regional info
- **Research** (`https://pokemn.quest/data/research.min.json`) - Full field research task catalog
- **Shinies** (`https://pokemn.quest/data/shinies.min.json`) - Authoritative shiny availability data

Events provide context (when something is available), while other endpoints provide details (stats, mechanics, etc.).

## Data Quality Notes

1. **Empty Arrays:** Many events will have empty arrays for certain fields (e.g., `"1km": []` in eggs). This indicates no changes to that category during the event.

2. **Null vs Missing:** Fields may be `null` or entirely absent. Both should be treated as "not applicable" for that event.

3. **HTML Content:** The `whatsNew` array may contain HTML tags including `<img>` and `<span>` elements.

4. **Image URLs:** Image URLs typically use the `pokemn.quest` domain for hosted images.

5. **Pokémon Naming:**
   - Regional forms: "Alolan Diglett", "Galarian Meowth"
   - Gender differences: "Indeedee (Male)", "Indeedee (Female)"
   - Forms: "Red Flower Flabébé"
   - Unown letters: "Unown O", "Unown S"

6. **canBeShiny:** This field indicates if the shiny form exists in the game, not necessarily that it's available during this specific event. Cross-reference with the `shinies` or `shinyDebuts` arrays for event-specific shiny availability.

7. **Minified Format:** The endpoint returns minified JSON (no whitespace) for reduced bandwidth.

## Event Type Specific Structures

### Seasons (`eventType: "season"`)

Seasons are the longest-running events and typically contain:
- `eggs`: Full egg pool breakdown
- `pokemon`: Wild spawn pool
- `raids`: Current raid boss rotation
- `research`: Research breakthrough Pokémon
- `shinies`: All available shinies this season

### Community Day (`eventType: "community-day"`)

Community Days typically include:
- `pokemon`: Featured Pokémon (the focus of the event)
- `bonuses`: Event bonuses (XP, Stardust, etc.)
- `bonusDisclaimers`: Time restrictions for bonuses
- `shinies`: Shiny forms available
- `research`: Paid special research storyline (if available)

### Raid Events (`raid-day`, `raid-battles`, `raid-hour`)

Raid-focused events include:
- `raids`: Raid boss breakdown
- `shinies`: Shiny possibilities from raids
- `bonuses`: Raid-specific bonuses (free passes, reduced timers, etc.)

### Research Events (`research-day`)

Research events include:
- `research`: Field research tasks and rewards
- `pokemon`: Pokémon tied to research encounters
- `bonuses`: Research-related bonuses

### Ticketed Events (`pokemon-go-tour`)

Large ticketed events contain extensive data:
- `isPaid`: true
- `price`: Ticket cost
- `eventInfo`: Event details and ticket URL
- `exclusiveBonuses`: Ticket-holder only bonuses
- `eggs`: Event-specific egg pool
- `pokemon`: Exclusive spawns
- `raids`: Special raid bosses
- `shinies`: Available shinies
- `shinyDebuts`: New shiny releases
- `research`: Ticket-holder research
- `whatsNew`: Feature highlights

## JSON Schema

The canonical schema is maintained at [`schemas/events.schema.json`](../schemas/events.schema.json). A summary is shown below:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://raw.githubusercontent.com/ayy-j/scrapedPoGo/main/schemas/events.schema.json",
  "title": "Pokemon GO Events Data",
  "description": "Schema for Pokemon GO event data. Note: additionalProperties is set to true as events can have many type-specific fields added by detailed scrapers.",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["eventID", "name", "eventType", "heading", "image", "start", "end"],
    "properties": {
      "eventID": {
        "type": "string",
        "description": "Unique identifier for the event"
      },
      "name": {
        "type": "string",
        "description": "Name of the event"
      },
      "eventType": {
        "type": "string",
        "description": "Type of the event",
        "enum": [
          "community-day",
          "event",
          "go-battle-league",
          "go-pass",
          "go-rocket-takeover",
          "max-battles",
          "max-mondays",
          "pokemon-go-tour",
          "pokemon-spotlight-hour",
          "pokestop-showcase",
          "raid-battles",
          "raid-day",
          "raid-hour",
          "research",
          "research-breakthrough",
          "research-day",
          "season",
          "special-research",
          "team-go-rocket",
          "timed-research"
        ]
      },
      "heading": {
        "type": "string",
        "description": "Display heading for the event"
      },
      "image": {
        "type": "string",
        "format": "uri",
        "description": "Event header/thumbnail image URL"
      },
      "imageWidth": {
        "type": "integer",
        "description": "Stored event banner width in pixels"
      },
      "imageHeight": {
        "type": "integer",
        "description": "Stored event banner height in pixels"
      },
      "imageType": {
        "type": "string",
        "description": "Stored event banner format",
        "enum": ["png", "jpg", "jpeg", "gif", "webp"]
      },
      "start": {
        "type": "string",
        "description": "Event start date/time (ISO 8601 format)",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}(Z)?$"
      },
      "end": {
        "type": "string",
        "description": "Event end date/time (ISO 8601 format)",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}(Z)?$"
      },
      "isGlobal": {
        "type": "boolean",
        "description": "Whether the event uses a global start time (no local timezone offset)"
      },
      "eventStatus": {
        "type": "string",
        "description": "The computed status of the event based on current time",
        "enum": ["upcoming", "active", "ended"]
      },
      "hasSpawns": {
        "type": "boolean",
        "description": "Whether the event has wild Pokemon spawns"
      },
      "hasFieldResearchTasks": {
        "type": "boolean",
        "description": "Whether the event has field research tasks"
      },
      "hasBonuses": {
        "type": "boolean",
        "description": "Whether the event has bonuses"
      },
      "hasRaids": {
        "type": "boolean",
        "description": "Whether the event has raids"
      },
      "hasEggs": {
        "type": "boolean",
        "description": "Whether the event has egg hatches"
      },
      "hasShiny": {
        "type": "boolean",
        "description": "Whether the event has shiny Pokemon available"
      },
      "pokemon": {
        "type": "array",
        "description": "Featured Pokemon in the event",
        "items": {
          "type": "object",
          "required": ["name", "image", "source"],
          "properties": {
            "name": {
              "type": "string",
              "description": "Pokemon name"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "Pokemon image URL"
            },
            "source": {
              "type": "string",
              "description": "Where the Pokemon appears",
              "enum": ["spawn", "featured", "incense", "costumed", "debut", "maxDebut", "raid", "egg", "research", "reward", "encounter"]
            },
            "canBeShiny": {
              "type": "boolean",
              "description": "Whether the Pokemon can be shiny"
            },
            "dexNumber": {
              "type": ["integer", "null"],
              "description": "National Pokedex number"
            },
            "imageWidth": {
              "type": "integer",
              "description": "Image width in pixels"
            },
            "imageHeight": {
              "type": "integer",
              "description": "Image height in pixels"
            },
            "imageType": {
              "type": "string",
              "description": "Image format",
              "enum": ["png", "jpg", "jpeg", "gif", "webp"]
            },
            "altText": {
              "type": "string",
              "description": "Accessible alt text for the image"
            }
          },
          "additionalProperties": false
        }
      },
      "bonuses": {
        "type": "array",
        "description": "Event bonuses (e.g., 2× XP, 2× Stardust)",
        "items": {
          "oneOf": [
            { "type": "string" },
            {
              "type": "object",
              "properties": {
                "text": { "type": "string" },
                "image": { "type": "string", "format": "uri" },
                "imageWidth": { "type": "integer", "description": "Bonus icon width in pixels" },
                "imageHeight": { "type": "integer", "description": "Bonus icon height in pixels" },
                "imageType": { "type": "string", "description": "Bonus icon format", "enum": ["png", "jpg", "jpeg", "gif", "webp"] },
                "multiplier": { "type": "number", "description": "Parsed numeric multiplier (e.g., 2 for 2×)" },
                "bonusType": { "type": "string", "description": "Parsed bonus category (e.g., XP, Stardust, Candy)" }
              },
              "required": ["text"],
              "additionalProperties": false
            }
          ]
        }
      },
      "raids": {
        "type": "array",
        "description": "Raid bosses featured in the event",
        "items": {
          "type": "object",
          "required": ["name", "image"],
          "properties": {
            "name": {
              "type": "string",
              "description": "Pokemon name"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "Pokemon image URL"
            },
            "tier": {
              "type": "string",
              "description": "Raid tier"
            },
            "canBeShiny": {
              "type": "boolean",
              "description": "Whether the Pokemon can be shiny"
            },
            "dexNumber": {
              "type": ["integer", "null"],
              "description": "National Pokedex number"
            },
            "imageWidth": {
              "type": "integer",
              "description": "Image width in pixels"
            },
            "imageHeight": {
              "type": "integer",
              "description": "Image height in pixels"
            },
            "imageType": {
              "type": "string",
              "description": "Image format"
            },
            "altText": {
              "type": "string",
              "description": "Accessible alt text for the image"
            }
          },
          "additionalProperties": false
        }
      },
      "eggs": {
        "oneOf": [
          {
            "type": "array",
            "description": "Egg hatches as array",
            "items": {
              "type": "object",
              "additionalProperties": true
            }
          },
          {
            "type": "object",
            "description": "Egg hatches keyed by distance (1km, 2km, etc.)",
            "additionalProperties": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": true
              }
            }
          }
        ]
      },
      "research": {
        "oneOf": [
          {
            "type": "array",
            "description": "Research tasks as array",
            "items": {
              "type": "object",
              "additionalProperties": true
            }
          },
          {
            "type": "object",
            "description": "Research tasks as object (keyed by category)",
            "additionalProperties": true
          }
        ]
      },
      "shinies": {
        "type": "array",
        "description": "Shiny Pokemon available",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Pokemon name"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "Pokemon image URL"
            },
            "canBeShiny": {
              "type": "boolean"
            },
            "dexNumber": {
              "type": ["integer", "null"],
              "description": "National Pokedex number"
            },
            "imageWidth": {
              "type": "integer"
            },
            "imageHeight": {
              "type": "integer"
            },
            "imageType": {
              "type": "string"
            },
            "altText": {
              "type": "string",
              "description": "Accessible alt text for the image"
            }
          },
          "additionalProperties": false
        }
      },
      "battle": {
        "type": "object",
        "description": "GO Battle League battle information",
        "properties": {
          "leagues": {
            "type": "array",
            "description": "Available battle leagues",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "League name"
                },
                "cpCap": {
                  "type": ["integer", "null"],
                  "description": "CP limit for the league"
                },
                "typeRestrictions": {
                  "type": "array",
                  "description": "Type restrictions for the league",
                  "items": { "type": "string" }
                },
                "rules": {
                  "type": "array",
                  "description": "League-specific rules",
                  "items": { "type": "string" }
                }
              },
              "required": ["name"],
              "additionalProperties": false
            }
          },
          "featuredAttack": {
            "type": "string",
            "description": "Featured attack for the battle period"
          }
        },
        "additionalProperties": false
      },
      "rocket": {
        "type": "object",
        "description": "Team GO Rocket takeover information",
        "properties": {
          "shadows": {
            "type": "array",
            "description": "Shadow Pokemon available",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "image": { "type": "string", "format": "uri" },
                "altText": { "type": "string" },
                "canBeShiny": { "type": "boolean" },
                "dexNumber": { "type": ["integer", "null"] },
                "imageWidth": { "type": "integer" },
                "imageHeight": { "type": "integer" },
                "imageType": { "type": "string" }
              },
              "additionalProperties": false
            }
          },
          "leaders": {
            "type": "array",
            "description": "Team GO Rocket Leaders and their lineups",
            "items": { "type": "object", "additionalProperties": true }
          },
          "giovanni": {
            "description": "Giovanni's lineup",
            "oneOf": [
              { "type": "object", "additionalProperties": true },
              { "type": "array", "items": { "type": "object", "additionalProperties": true } }
            ]
          },
          "grunts": {
            "type": "array",
            "description": "Team GO Rocket Grunt types",
            "items": { "type": "object", "additionalProperties": true }
          }
        },
        "additionalProperties": false
      },
      "rewards": {
        "description": "Event rewards or ticketed research rewards",
        "oneOf": [
          {
            "type": "array",
            "items": { "type": "object", "additionalProperties": true }
          },
          {
            "type": "object",
            "properties": {
              "ticketedResearch": {
                "type": "object",
                "properties": {
                  "price": { "type": "number" },
                  "description": { "type": "string" }
                },
                "additionalProperties": false
              },
              "ticketBonuses": {
                "type": "array",
                "items": { "type": "string" }
              },
              "ticketPrice": {
                "type": ["number", "null"]
              },
              "ticketAddOns": {
                "type": "array",
                "items": { "type": "string" }
              }
            },
            "additionalProperties": false
          }
        ]
      },
      "bonus": {
        "type": "string",
        "description": "Bonus description (e.g., date string for Spotlight Hour)"
      },
      "bonusDisclaimers": {
        "type": "array",
        "description": "Disclaimer text for event bonuses",
        "items": { "type": "string" }
      },
      "lureModuleBonus": {
        "type": "string",
        "description": "Lure module bonus description"
      },
      "exclusiveBonuses": {
        "type": "array",
        "description": "Exclusive bonuses for ticket holders or attendees",
        "items": { "type": "string" }
      },
      "canBeShiny": {
        "type": "boolean",
        "description": "Whether the featured Pokemon can be shiny"
      },
      "description": {
        "type": "string",
        "description": "Event description text"
      },
      "isPaid": {
        "type": "boolean",
        "description": "Whether the event requires a ticket or payment"
      },
      "price": {
        "type": ["number", "null"],
        "description": "Price of the event ticket, or null if free"
      },
      "raidAlternation": {
        "type": "string",
        "description": "Raid alternation pattern description"
      },
      "raidFeaturedAttacks": {
        "type": "array",
        "description": "Featured attacks available during raid events",
        "items": { "type": "string" }
      },
      "shinyDebuts": {
        "type": "array",
        "description": "New shiny Pokemon debuting in this event",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "image": { "type": "string", "format": "uri" },
            "altText": { "type": "string" },
            "canBeShiny": { "type": "boolean" },
            "dexNumber": { "type": ["integer", "null"] },
            "imageWidth": { "type": "integer" },
            "imageHeight": { "type": "integer" },
            "imageType": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "showcases": {
        "type": "array",
        "description": "PokeStop Showcase Pokemon",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "image": { "type": "string", "format": "uri" },
            "altText": { "type": "string" },
            "canBeShiny": { "type": "boolean" },
            "dexNumber": { "type": ["integer", "null"] },
            "imageWidth": { "type": "integer" },
            "imageHeight": { "type": "integer" },
            "imageType": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "photobomb": {
        "type": "object",
        "description": "Photobomb encounter information",
        "properties": {
          "description": {
            "type": "string",
            "description": "Photobomb description"
          },
          "pokemon": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "image": { "type": "string", "format": "uri" },
                "altText": { "type": "string" },
                "canBeShiny": { "type": "boolean" },
                "dexNumber": { "type": ["integer", "null"] },
                "imageWidth": { "type": "integer" },
                "imageHeight": { "type": "integer" },
                "imageType": { "type": "string" }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      },
      "customSections": {
        "type": "object",
        "description": "Dynamically extracted sections not matching standard fields",
        "additionalProperties": {
          "type": "object",
          "properties": {
            "paragraphs": {
              "type": "array",
              "items": { "type": "string" }
            },
            "lists": {
              "type": "array",
              "items": {
                "type": "array",
                "items": { "type": "string" }
              }
            },
            "pokemon": {
              "type": "array",
              "items": { "type": "object", "additionalProperties": true }
            },
            "tables": { "type": "array" }
          },
          "additionalProperties": true
        }
      },
      "tasks": {
        "type": "array",
        "description": "Research tasks with steps and rewards",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Research step name"
            },
            "step": {
              "type": "integer",
              "description": "Step number"
            },
            "tasks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "text": { "type": "string" },
                  "reward": {
                    "type": "object",
                    "properties": {
                      "text": { "type": "string" },
                      "image": { "type": "string", "format": "uri" },
                      "imageWidth": { "type": "integer" },
                      "imageHeight": { "type": "integer" },
                      "imageType": { "type": "string" }
                    },
                    "additionalProperties": false
                  }
                },
                "additionalProperties": false
              }
            },
            "rewards": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "text": { "type": "string" },
                  "image": { "type": "string", "format": "uri" },
                  "imageWidth": { "type": "integer" },
                  "imageHeight": { "type": "integer" },
                  "imageType": { "type": "string" }
                },
                "additionalProperties": false
              }
            }
          },
          "additionalProperties": false
        }
      },
      "encounters": {
        "type": "array",
        "description": "Encounter Pokemon available in the research",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "image": { "type": "string", "format": "uri" },
            "altText": { "type": "string" },
            "canBeShiny": { "type": "boolean" },
            "dexNumber": { "type": ["integer", "null"] },
            "imageWidth": { "type": "integer" },
            "imageHeight": { "type": "integer" },
            "imageType": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "researchType": {
        "type": "string",
        "description": "Type of research",
        "enum": ["special", "masterwork", "timed"]
      },
      "expires": {
        "type": "boolean",
        "description": "Whether the research expires"
      },
      "availability": {
        "type": "object",
        "description": "Availability window for the research",
        "properties": {
          "start": { "type": "string" },
          "end": { "type": "string" }
        },
        "additionalProperties": false
      },
      "webStoreInfo": {
        "type": "string",
        "description": "Web store information or URL"
      },
      "promoCodes": {
        "type": "array",
        "description": "Promotional codes associated with the event",
        "items": { "type": "string" }
      },
      "pricing": {
        "type": "object",
        "description": "GO Pass pricing information",
        "properties": {
          "deluxe": {
            "type": ["number", "null"],
            "description": "Deluxe tier price"
          },
          "deluxePlus": {
            "type": ["number", "null"],
            "description": "Deluxe Plus tier price"
          }
        },
        "additionalProperties": false
      },
      "pointTasks": {
        "type": "object",
        "description": "GO Pass point-earning tasks",
        "properties": {
          "daily": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "task": { "type": "string" },
                "points": { "type": "integer" }
              },
              "additionalProperties": false
            }
          },
          "weekly": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "task": { "type": "string" },
                "points": { "type": "integer" }
              },
              "additionalProperties": false
            }
          },
          "bonus": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "task": { "type": "string" },
                "points": { "type": "integer" }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      },
      "ranks": {
        "type": "array",
        "description": "GO Pass ranks and rewards",
        "items": { "type": "object", "additionalProperties": true }
      },
      "featuredPokemon": {
        "type": "array",
        "description": "Featured Pokemon for GO Pass",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "image": { "type": "string", "format": "uri" },
            "altText": { "type": "string" },
            "canBeShiny": { "type": "boolean" },
            "dexNumber": { "type": ["integer", "null"] },
            "imageWidth": { "type": "integer" },
            "imageHeight": { "type": "integer" },
            "imageType": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "milestoneBonuses": {
        "type": "object",
        "description": "GO Pass milestone bonuses by tier",
        "properties": {
          "free": {
            "type": "array",
            "items": { "type": "object", "additionalProperties": true }
          },
          "deluxe": {
            "type": "array",
            "items": { "type": "object", "additionalProperties": true }
          }
        },
        "additionalProperties": false
      },
      "goPass": {
        "type": "object",
        "description": "GO Pass information",
        "additionalProperties": true
      },
      "eventInfo": {
        "type": "object",
        "description": "In-person event logistical information",
        "properties": {
          "name": {
            "type": "string",
            "description": "Event name"
          },
          "location": {
            "type": "string",
            "description": "Event location"
          },
          "dates": {
            "type": "string",
            "description": "Event dates"
          },
          "time": {
            "type": "string",
            "description": "Event hours"
          },
          "ticketPrice": {
            "type": ["number", "null"],
            "description": "Ticket price"
          },
          "ticketUrl": {
            "type": "string",
            "description": "Ticket purchase URL"
          }
        },
        "additionalProperties": false
      },
      "habitats": {
        "type": "object",
        "description": "Habitat areas with spawning Pokemon, keyed by habitat name",
        "additionalProperties": {
          "type": "object",
          "properties": {
            "timeInfo": { "type": "string" },
            "spawns": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "image": { "type": "string", "format": "uri" },
                  "altText": { "type": "string" },
                  "canBeShiny": { "type": "boolean" },
                  "dexNumber": { "type": ["integer", "null"] },
                  "imageWidth": { "type": "integer" },
                  "imageHeight": { "type": "integer" },
                  "imageType": { "type": "string" }
                },
                "additionalProperties": false
              }
            },
            "rareSpawns": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "image": { "type": "string", "format": "uri" },
                  "altText": { "type": "string" },
                  "canBeShiny": { "type": "boolean" },
                  "dexNumber": { "type": ["integer", "null"] },
                  "imageWidth": { "type": "integer" },
                  "imageHeight": { "type": "integer" },
                  "imageType": { "type": "string" }
                },
                "additionalProperties": false
              }
            }
          },
          "additionalProperties": false
        }
      },
      "habitatRotation": {
        "type": "array",
        "description": "Habitat rotation schedule",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Habitat name"
            },
            "timeSlots": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "start": { "type": "string" },
                  "end": { "type": "string" }
                },
                "additionalProperties": false
              }
            }
          },
          "additionalProperties": false
        }
      },
      "megaRaidSchedule": {
        "type": "object",
        "description": "Mega Raid boss schedule by day",
        "additionalProperties": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "start": { "type": "string" },
              "end": { "type": "string" },
              "items": {
                "type": "array",
                "items": { "type": "string" }
              }
            },
            "additionalProperties": false
          }
        }
      },
      "bonusCategories": {
        "type": "array",
        "description": "Categorized bonus groups",
        "items": {
          "type": "object",
          "properties": {
            "category": {
              "type": "string",
              "description": "Bonus category name"
            },
            "timeframe": {
              "type": "string",
              "description": "When the bonuses are active"
            },
            "bonuses": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "text": { "type": "string" },
                  "image": { "type": "string", "format": "uri" },
                  "imageWidth": { "type": "integer" },
                  "imageHeight": { "type": "integer" },
                  "imageType": { "type": "string" },
                  "multiplier": { "type": "number" },
                  "bonusType": { "type": "string" }
                },
                "additionalProperties": false
              }
            }
          },
          "required": ["category"],
          "additionalProperties": false
        }
      },
      "branchingResearch": {
        "type": "object",
        "description": "Branching Special Research paths",
        "properties": {
          "description": {
            "type": "array",
            "items": { "type": "string" }
          },
          "paths": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "details": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      },
      "timedResearchRegions": {
        "type": "array",
        "description": "Region-specific Timed Research encounters",
        "items": {
          "type": "object",
          "properties": {
            "region": {
              "type": "string",
              "description": "Region description"
            },
            "pokemon": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "image": { "type": "string", "format": "uri" },
                  "altText": { "type": "string" },
                  "canBeShiny": { "type": "boolean" },
                  "imageWidth": { "type": "integer" },
                  "imageHeight": { "type": "integer" },
                  "imageType": { "type": "string" }
                },
                "additionalProperties": false
              }
            }
          },
          "additionalProperties": false
        }
      },
      "routes": {
        "type": "object",
        "description": "Route-related Pokemon and information",
        "properties": {
          "description": {
            "type": "array",
            "items": { "type": "string" }
          },
          "pokemon": {
            "type": "array",
            "items": { "type": "object", "additionalProperties": true }
          },
          "regionalAppearances": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "pokemon": { "type": "string" },
                "region": { "type": "string" }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      },
      "whatsNew": {
        "type": "array",
        "description": "What's new highlights for the event",
        "items": { "type": "string" }
      },
      "sales": {
        "type": "array",
        "description": "Event-related sales information",
        "items": { "type": "string" }
      },
      "eventLocations": {
        "type": "array",
        "description": "In-person event locations",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Location name"
            },
            "url": {
              "type": "string",
              "description": "Location event URL"
            }
          },
          "additionalProperties": false
        }
      },
      "eventTags": {
        "type": "array",
        "description": "Tags categorizing the event",
        "items": { "type": "string" }
      },
      "costumedPokemon": {
        "type": "array",
        "description": "Costumed Pokemon appearing in the event",
        "items": {
          "type": "object",
          "properties": {
            "description": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "megaDebuts": {
        "type": "array",
        "description": "New Mega Evolutions debuting in this event",
        "items": { "type": "string" }
      },
      "specialBackgrounds": {
        "type": "array",
        "description": "Special backgrounds available during the event",
        "items": { "type": "string" }
      },
      "communityDays": {
        "type": "array",
        "description": "Community Day dates in the season",
        "items": { "type": "string" }
      },
      "features": {
        "type": "array",
        "description": "Season features and highlights",
        "items": { "type": "string" }
      },
      "goBattleLeague": {
        "type": "string",
        "description": "GO Battle League season information"
      },
      "maxBattles": {
        "type": "object",
        "description": "Max Battles event information",
        "additionalProperties": true
      },
      "maxMondays": {
        "type": "object",
        "description": "Max Mondays event information",
        "additionalProperties": true
      }
    },
    "additionalProperties": true
  }
}
```

> **Note:** This is the full canonical schema. The source of truth is [`schemas/events.schema.json`](../schemas/events.schema.json).
