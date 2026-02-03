# Endpoint

**URL**: `https://pokemn.quest/data/events.min.json`

The endpoint returns a minified JSON array of event objects sorted chronologically.

## Overview

The Events endpoint provides comprehensive data about all Pokemon GO events, including Community Days, raid rotations, research events, GO Battle League seasons, Pokemon GO Tours, seasonal events, and more. Each event includes timing, featured Pokemon, bonuses, and type-specific content.

# Example Event Object

```json
{
    "eventID": "into-the-depths-2026",
    "name": "Into the Depths",
    "eventType": "event",
    "heading": "Event",
    "image": "https://cdn.leekduck.com/assets/img/events/...",
    "start": "2026-01-27T10:00:00.000",
    "end": "2026-02-01T20:00:00.000",
    "pokemon": [...],
    "bonuses": [...],
    "raids": [...]
}
```

# Core Fields

All events contain these base fields:

| Field           | Type     | Required | Description
|---------------- |--------- |--------- |---------------------
| **`eventID`**   | `string` | Yes      | Unique identifier for the event. Also the last part of the event page's URL.
| **`name`**      | `string` | Yes      | The display name of the event.
| **`eventType`** | `string` | Yes      | The type/category of the event. See [List of Event Types](#list-of-event-types)
| **`heading`**   | `string` | Yes      | The heading label for the event, typically derived from the event type.
| **`image`**     | `string` | Yes      | The header/thumbnail image URL for the event.
| **`start`**     | `string` | Yes      | The start date/time of the event in ISO 8601 format. See [Date/Time Format](#datetime-format)
| **`end`**       | `string` | Yes      | The end date/time of the event in ISO 8601 format. See [Date/Time Format](#datetime-format)

# Extended Event Data

Beyond the core fields, events contain additional data fields that vary by event type. These fields are optional and only present when relevant:

## Pokémon Data Fields

### `pokemon`
**Type:** `Array<Pokemon>`  
**Description:** Featured Pokemon in the event (spawns, debuts, featured encounters).

Each Pokémon object contains:
- `name` (string): Pokémon name
- `image` (string): Icon image URL
- `source` (string): Where the Pokemon appears. Values: `spawn`, `featured`, `incense`, `costumed`. Reserved: `debut`, `maxDebut`
- `canBeShiny` (boolean): Whether shiny form is available
- `imageWidth` (number, optional): Image width in pixels
- `imageHeight` (number, optional): Image height in pixels
- `imageType` (string, optional): Image file type (e.g., "png")

Example:
```json
"pokemon": [
    {
        "name": "Bulbasaur",
        "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_001_00.png",
        "source": "spawn",
        "canBeShiny": true
    },
    {
        "name": "Unown O",
        "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_201_25.png",
        "source": "incense",
        "canBeShiny": true
    }
]
```

### `shinies`
**Type:** `Array<Pokemon>`  
**Description:** Shiny Pokémon available during this event.

Extended Pokémon object with additional image metadata:
- `name` (string)
- `image` (string): Shiny image URL
- `canBeShiny` (boolean)
- `imageWidth` (number, optional): Image width in pixels
- `imageHeight` (number, optional): Image height in pixels
- `imageType` (string, optional): Image file type (e.g., "png")

Example:
```json
"shinies": [
    {
        "name": "Diancie",
        "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pm719.s.icon.png",
        "canBeShiny": false,
        "imageWidth": 256,
        "imageHeight": 256,
        "imageType": "png"
    }
]
```

### `shinyDebuts`
**Type:** `Array<Pokemon>`  
**Description:** Pokémon making their shiny debut in this event.  
**Structure:** Same as `shinies` array.

## Eggs

### `eggs`
**Type:** `Object`  
**Description:** Pokémon available from eggs during this event.

Structure:
```json
"eggs": {
    "1km": [ /* Array<Pokemon> */ ],
    "2km": [ /* Array<Pokemon> */ ],
    "5km": [ /* Array<Pokemon> */ ],
    "7km": [ /* Array<Pokemon> */ ],
    "10km": [ /* Array<Pokemon> */ ],
    "12km": [ /* Array<Pokemon> */ ],
    "route": [ /* Array<Pokemon> */ ],
    "adventure5km": [ /* Array<Pokemon> */ ],
    "adventure10km": [ /* Array<Pokemon> */ ]
}
```

Each distance category contains an array of Pokémon objects with `name`, `image`, and `canBeShiny` fields.

## Raids

### `raids`
**Type:** `Array<RaidBoss>`  
**Description:** Raid bosses featured in the event as a flat array.

Each RaidBoss object contains:
- `name` (string): Boss name
- `image` (string): Boss image URL
- `canBeShiny` (boolean): Whether the boss can be shiny
- `imageWidth` (number, optional): Image width in pixels
- `imageHeight` (number, optional): Image height in pixels
- `imageType` (string, optional): Image file type

Example:
```json
"raids": [
    {
        "name": "Rayquaza",
        "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_384_00.png",
        "canBeShiny": true
    }
]
```

### `raidAlternation`
**Type:** `string`  
**Description:** Alternation pattern for rotating raid bosses (e.g., "Dialga and Palkia will alternate every few hours").

### `raidFeaturedAttacks`
**Type:** `Array<string>`  
**Description:** Featured moves available during the event.

## Research

### `research`
**Type:** `Object`  
**Description:** Research tasks and encounters available during the event.

Structure:
```json
"research": {
    "field": [ /* Array<ResearchTask> */ ],
    "special": [ /* Array<ResearchStep> */ ],
    "timed": [ /* Array<ResearchStep> */ ],
    "masterwork": [ /* Array<ResearchStep> */ ],
    "breakthrough": { /* Pokemon object */ }
}
```

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

Example:
```json
"research": {
    "field": [
        {
            "task": "Catch 5 Pokémon",
            "encounter": {
                "name": "Pikachu",
                "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_025_00.png",
                "canBeShiny": true
            },
            "rewards": [
                {
                    "text": "×10",
                    "image": "https://cdn.leekduck.com/assets/img/items/Poke%20Ball.png"
                }
            ]
        }
    ],
    "breakthrough": {
        "name": "Klink",
        "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_599_00.png",
        "canBeShiny": true
    }
}
```

## Bonuses

### `bonuses`
**Type:** `Array<Bonus>`  
**Description:** Active bonuses during the event.

**Bonus Object:**
- `text` (string): Bonus description
- `image` (string): Bonus icon URL

Example:
```json
"bonuses": [
    {
        "text": "2× Catch XP",
        "image": "https://cdn.leekduck.com/assets/img/events/bonuses/xp.png"
    },
    {
        "text": "1/4 Egg Hatch Distance",
        "image": "https://cdn.leekduck.com/assets/img/events/bonuses/eggdistance.png"
    }
]
```

### `bonus`
**Type:** `string`  
**Description:** Single bonus text (alternative to `bonuses` array, used in Spotlight Hours).

Example:
```json
"bonus": "2× Transfer Candy"
```

### `lureModuleBonus`
**Type:** `string`  
**Description:** Lure module bonus description.

Example:
```json
"lureModuleBonus": "Lure Modules activated during the event will last for three hours."
```

### `bonusDisclaimers`
**Type:** `Array<string>`  
**Description:** Disclaimer text for bonuses (e.g., time restrictions).

Example:
```json
"bonusDisclaimers": [
    "* Bonuses active only during event hours.",
    "* Does not stack with other active bonuses."
]
```

### `exclusiveBonuses`
**Type:** `Array<string>`  
**Description:** Bonuses exclusive to ticket holders (for paid events).

## Battle (GO Battle League)

### `battle`
**Type:** `Object`  
**Description:** GO Battle League information.

Structure:
```json
"battle": {
    "leagues": [ /* Array<League> */ ],
    "featuredAttack": "String describing featured move"
}
```

**League Object:**
- `name` (string): League name (e.g., "Great League", "Ultra League")
- `cpLimit` (number, optional): CP limit for the league
- Other league-specific properties

Example:
```json
"battle": {
    "leagues": [
        {
            "name": "Great League",
            "cpLimit": 1500
        }
    ],
    "featuredAttack": "Trainers who haven't already learned Magical Leaf can use a Charged TM to teach it to their Pokémon."
}
```

## Rocket (Team GO Rocket)

### `rocket`
**Type:** `Object`  
**Description:** Team GO Rocket information.

Structure:
```json
"rocket": {
    "shadows": [ /* Array<Pokemon> */ ],
    "leaders": [ /* Array<Leader> */ ],
    "giovanni": { /* Giovanni details */ },
    "grunts": [ /* Array<Grunt> */ ]
}
```

Properties:
- `shadows` (Array<Pokemon>): Shadow Pokemon available
- `leaders` (Array): Leader lineup information
- `giovanni` (Object): Giovanni encounter details
- `grunts` (Array): Grunt lineup information

## Showcases

### `showcases`
**Type:** `Array<Pokemon>`  
**Description:** PokéStop Showcase Pokemon.

## Photobomb

### `photobomb`
**Type:** `Object`  
**Description:** Photobomb feature details.

Structure:
```json
"photobomb": {
    "description": "Take a GO Snapshot for a surprise!",
    "pokemon": [ /* Array<Pokemon> */ ]
}
```

## Rewards & Tickets

### `rewards`
**Type:** `Object`  
**Description:** Ticketed content and rewards.

Structure:
```json
"rewards": {
    "ticketedResearch": { /* Paid research details */ },
    "ticketBonuses": [ /* Array<string> */ ],
    "ticketPrice": 15,
    "ticketAddOns": [ /* Array of additional purchasable content */ ]
}
```

## Event Metadata

### `description`
**Type:** `string`  
**Description:** Detailed description or overview of the event.

### `isPaid`
**Type:** `boolean`  
**Description:** Whether this is a paid/ticketed event.

### `price`
**Type:** `string | number`  
**Description:** Ticket price (may be string with currency or number for USD).

### `customSections`
**Type:** `Object`  
**Description:** Additional scraped sections not matching standard fields. This is a catch-all for unique event content.

### `eventInfo`
**Type:** `Object`  
**Description:** Additional event details for large events (GO Fest, GO Tour, etc.).

Structure:
```json
"eventInfo": {
    "name": "Pokémon GO Tour: Kalos - Global 2026",
    "location": "",
    "dates": "",
    "time": "",
    "ticketPrice": null,
    "ticketUrl": ""
}
```

### `availability`
**Type:** `Object`  
**Description:** When tasks/research become available.

Structure:
```json
"availability": {
    "start": "2026-02-28T00:00:00.000",
    "end": "2026-03-02T23:59:59.000"
}
```

### `encounters`
**Type:** `Array<Pokemon>`  
**Description:** Encounter Pokemon list (alternative structure for some events).

### `tasks`
**Type:** `Array<ResearchTask>`  
**Description:** Research tasks (alternative structure for some events, similar to `research.field`).

## Season-Specific Fields

### `communityDays`
**Type:** `Array<Object>`  
**Description:** Community Days scheduled during the season.

### `features`
**Type:** `Array<string>`  
**Description:** Season feature descriptions.

### `goBattleLeague`
**Type:** `Object`  
**Description:** Seasonal GO Battle League information (alternative to `battle` field).

## GO Pass Specific

### `goPass`
**Type:** `Object`  
**Description:** GO Pass details.

### `pricing`
**Type:** `Object`  
**Description:** Pricing information for GO Pass.

### `pointTasks`
**Type:** `Array<Task>`  
**Description:** Tasks that award GO Pass points.

### `ranks`
**Type:** `Array<Rank>`  
**Description:** Rank tiers and rewards.

### `featuredPokemon`
**Type:** `Array<Pokemon>`  
**Description:** Featured Pokemon for GO Pass.

### `milestoneBonuses`
**Type:** `Object`  
**Description:** Milestone reward information.

## GO Tour Specific

### `habitats`
**Type:** `Array<Habitat>`  
**Description:** Rotating habitat information for GO Tour events.

### `sales`
**Type:** `Array<Sale>`  
**Description:** In-game sales and offers during the event.

## Max Battles

### `maxBattles`
**Type:** `Object`  
**Description:** Max Battle event details.

### `maxMondays`
**Type:** `Object`  
**Description:** Max Monday event details.

### `whatsNew`
**Type:** `Array<string>`  
**Description:** HTML-formatted strings highlighting new features or mechanics introduced in this event.

Example:
```json
"whatsNew": [
    "Trainers who participate in raids will have a chance of receiving new Special Backgrounds!",
    "<img src=\"https://cdn.leekduck.com/assets/img/events/kalos-special-backgrounds.png\">"
]
```

## Feature Flags

Boolean flags indicating what content types are present:

| Field                          | Type      | Description
|------------------------------- |---------- |--------------------------------
| **`hasSpawns`**                | `boolean` | Event includes special spawns
| **`hasFieldResearchTasks`**    | `boolean` | Event includes field research tasks
| **`hasBonuses`**               | `boolean` | Event includes active bonuses
| **`hasRaids`**                 | `boolean` | Event includes raid changes
| **`hasEggs`**                  | `boolean` | Event includes egg pool changes
| **`hasShiny`**                 | `boolean` | Event includes shiny availability

# List of Event Types

| Events/Misc.               | Research                  | Raids/Battle           | GO Rocket
|--------------------------- |-------------------------- |----------------------- |------------------------------
| `community-day`            | `research`                | `raid-day`             | `go-rocket-takeover`
| `event`                    | `timed-research`          | `raid-battles`         | `team-go-rocket`
| `live-event`               | `limited-research`        | `raid-hour`            | `giovanni-special-research`
| `pokemon-go-fest`          | `research-breakthrough`   | `raid-weekend`         |
| `global-challenge`         | `special-research`        | `go-battle-league`     |
| `safari-zone`              | `research-day`            | `elite-raids`          |
| `ticketed-event`           |                           | `max-battles`          |
| `location-specific`        |                           | `max-mondays`          |
| `bonus-hour`               |
| `pokemon-spotlight-hour`   |
| `potential-ultra-unlock`   |
| `update`                   |
| `season`                   |
| `pokemon-go-tour`          |
| `go-pass`                  |
| `ticketed`                 |
| `pokestop-showcase`        |
| `wild-area`                |
| `city-safari`              |

# Date/Time Format

The `start` and `end` fields use ISO 8601 DateTime format: `YYYY-MM-DDTHH:mm:ss.SSS`

**Timezone Handling:**
- **Local time events:** Most events occur based on the player's local timezone. These dates do NOT include a timezone indicator (no "Z" suffix).
- **Global events:** Events that occur simultaneously worldwide will have "Z" suffix, indicating UTC time.

Examples:
```json
// Local time event (occurs at 10:00 AM in each timezone)
"start": "2025-12-02T10:00:00.000"

// Global event (occurs at exactly this UTC time for everyone)
"start": "2025-12-02T10:00:00.000Z"
```

Most programming languages' date parsers (e.g., JavaScript's `Date.parse()`) handle this distinction automatically.

# Event Type Specific Structures

## Seasons (`eventType: "season"`)

Seasons are the longest-running events and typically contain:
- `eggs`: Full egg pool breakdown
- `spawns`: Wild spawn pool
- `raids`: Current raid boss rotation
- `research`: Research breakthrough Pokémon
- `shinies`: All available shinies this season

## Community Day (`eventType: "community-day"`)

Community Days typically include:
- `spawns`: Featured Pokémon (the focus of the event)
- `bonuses`: Event bonuses (XP, Stardust, etc.)
- `bonusDisclaimers`: Time restrictions for bonuses
- `shinies`: Shiny forms available
- `specialResearch`: Paid special research storyline (if available)

## Raid Events (`raid-day`, `raid-battles`, `raid-hour`)

Raid-focused events include:
- `raids`: Raid boss breakdown by tier
- `shinies`: Shiny possibilities from raids
- `bonuses`: Raid-specific bonuses (free passes, reduced timers, etc.)

## Research Events (`research-day`, `research`)

Research events include:
- `research.tasks`: Field research tasks and rewards
- `featured` or `spawns`: Pokémon tied to research encounters
- `bonuses`: Research-related bonuses

## Ticketed Events (`pokemon-go-fest`, `pokemon-go-tour`)

Large ticketed events contain extensive data:
- `isPaid`: true
- `price`: Ticket cost
- `eventInfo`: Event details and ticket URL
- `exclusiveBonuses`: Ticket-holder only bonuses
- `eggs`: Event-specific egg pool
- `spawns`: Exclusive spawns
- `raids`: Special raid bosses
- `shinies`: Available shinies
- `shinyDebuts`: New shiny releases
- `specialResearch`: Ticket-holder research
- `whatsNew`: Feature highlights

# Data Quality Notes

1. **Empty Arrays:** Many events will have empty arrays for certain fields (e.g., `"1km": []` in eggs). This indicates no changes to that category during the event.

2. **Null vs Missing:** Fields may be `null` or entirely absent. Both should be treated as "not applicable" for that event.

3. **HTML Content:** The `whatsNew` array may contain HTML tags including `<img>` and `<span>` elements.

4. **Image URLs:** Image URLs typically use the `cdn.leekduck.com` domain for scraped images.

5. **Pokémon Naming:** 
   - Regional forms: "Alolan Diglett", "Galarian Meowth"
   - Gender differences: "Indeedee (Male)", "Indeedee (Female)"
   - Forms: "Red Flower Flabébé"
   - Unown letters: "Unown O", "Unown S"

6. **canBeShiny:** This field indicates if the shiny form exists in the game, not necessarily that it's available during this specific event. Cross-reference with the `shinies` or `shinyDebuts` arrays for event-specific shiny availability.

7. **Minified Format:** The endpoint returns minified JSON (no whitespace) for reduced bandwidth.

# Integration with Other Endpoints

Event data is self-contained but can be cross-referenced with other endpoints:

- **Raids** (`https://pokemn.quest/data/raids.min.json`) - Full raid boss details including CP, types, weather boosts
- **Eggs** (`https://pokemn.quest/data/eggs.min.json`) - Complete egg pool with rarity and regional info
- **Research** (`https://pokemn.quest/data/research.min.json`) - Full field research task catalog
- **Shinies** (`https://pokemn.quest/data/shinies.min.json`) - Authoritative shiny availability data

Events provide context (when something is available), while other endpoints provide details (stats, mechanics, etc.).
