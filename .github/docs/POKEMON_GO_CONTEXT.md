# Pokémon GO Game Context

> Reference document for understanding the Pokémon GO game mechanics and features that this project scrapes and serves as API data. Intended for developers and AI agents working on this codebase.

---

## Table of Contents

- [Pokémon GO Game Context](#pokémon-go-game-context)
  - [Table of Contents](#table-of-contents)
  - [Core Game Concepts](#core-game-concepts)
    - [Combat Power (CP)](#combat-power-cp)
    - [Individual Values (IVs)](#individual-values-ivs)
    - [Pokémon Types](#pokémon-types)
    - [Weather System](#weather-system)
    - [Resources](#resources)
    - [National Pokédex](#national-pokédex)
  - [Pokémon Variants and Forms](#pokémon-variants-and-forms)
    - [Regional Forms](#regional-forms)
    - [Shadow and Purified Pokémon](#shadow-and-purified-pokémon)
    - [Mega Evolution](#mega-evolution)
    - [Dynamax and Gigantamax](#dynamax-and-gigantamax)
    - [Costume Pokémon](#costume-pokémon)
  - [Data Types We Scrape](#data-types-we-scrape)
    - [Events](#events)
    - [Raids](#raids)
    - [Eggs](#eggs)
    - [Field Research](#field-research)
    - [Team GO Rocket Lineups](#team-go-rocket-lineups)
    - [Shiny Pokémon](#shiny-pokémon)
  - [Event Types](#event-types)
    - [Community Day](#community-day)
    - [Pokémon Spotlight Hour](#pokémon-spotlight-hour)
    - [Raid Hour](#raid-hour)
    - [Raid Day](#raid-day)
    - [Raid Battles](#raid-battles)
    - [GO Battle League](#go-battle-league)
    - [Season](#season)
    - [Pokémon GO Tour](#pokémon-go-tour)
    - [GO Pass](#go-pass)
    - [Research Day](#research-day)
    - [Research (Timed \& Special)](#research-timed--special)
    - [Research Breakthrough](#research-breakthrough)
    - [Team GO Rocket Takeover](#team-go-rocket-takeover)
    - [PokéStop Showcase](#pokéstop-showcase)
    - [Max Battles](#max-battles)
    - [Max Mondays](#max-mondays)
  - [Wild Spawns and Encounter Sources](#wild-spawns-and-encounter-sources)
  - [Promo Codes](#promo-codes)

---

## Core Game Concepts

### Combat Power (CP)

**Combat Power (CP)** is the primary numeric indicator of a Pokémon's overall battle strength. It is calculated from a Pokémon's base stats (Attack, Defense, Stamina), its Individual Values (IVs), and its level. The formula is approximately:

```
CP ≈ (Attack × √Defense × √Stamina) × level_multiplier / 10
```

Higher CP means better performance in Gyms and Raids. CP is displayed on every Pokémon's summary screen.

**Normal vs Boosted CP**: Wild Pokémon are caught at the player's Trainer level or below (capped at level 30 for wild catches). Weather-boosted spawns appear at roughly 5 levels higher than normal (e.g., a level 30 spawn becomes level 35), giving them higher CP. In raids, the boss has a fixed CP during battle, but the catch encounter afterward has a set CP range — **normal** (no weather boost) or **boosted** (matching weather active), which raises the catch level by about 5. Our raids data tracks both `normal` and `boosted` CP ranges per raid boss.

### Individual Values (IVs)

Every Pokémon has three hidden stats called **Individual Values (IVs)**, each ranging from **0 to 15**:

- **Attack** — contributes to damage output
- **Defense** — reduces damage taken
- **Stamina (HP)** — determines hit points

IVs slightly modify a Pokémon's base stats. A Pokémon with 15/15/15 IVs (a "hundo" or 100% IV Pokémon) will have roughly 10–15% more effective power than one with 0/0/0 at the same level. IVs are randomly assigned when a Pokémon is encountered and cannot be changed. Certain sources (raids, eggs, research encounters) have higher minimum IV floors.

### Pokémon Types

There are **18 types** in Pokémon GO:

| | | | |
|---|---|---|---|
| Normal | Fighting | Flying | Poison |
| Ground | Rock | Bug | Ghost |
| Steel | Fire | Water | Grass |
| Electric | Psychic | Ice | Dragon |
| Dark | Fairy | | |

**Type effectiveness** governs battle damage:

- **Super effective** (1.6× damage): Attacking type has advantage (e.g., Water → Fire)
- **Not very effective** (0.625× damage): Attacking type is resisted (e.g., Fire → Water)
- **Double resistance / Immunity** (0.391× damage): Target type would be immune in the main series (e.g., Normal → Ghost)
- **Same Type Attack Bonus (STAB)**: A Pokémon using a move that matches its own type deals 1.2× extra damage

Dual-type Pokémon compound effectiveness — a double-super-effective hit (e.g., Ice → Dragon/Flying Rayquaza) deals 2.56× damage.

Our raids data includes Pokémon types and their weaknesses to help players choose counters.

### Weather System

Pokémon GO uses a real-time weather system that affects gameplay. The game's weather reflects actual local weather conditions pulled from a weather service. There are **7 weather conditions**, each boosting specific Pokémon types:

| Weather | Boosted Types |
|---------|--------------|
| **Sunny / Clear** | Grass, Ground, Fire |
| **Rainy** | Water, Electric, Bug |
| **Partly Cloudy** | Normal, Rock |
| **Cloudy** | Fighting, Poison, Fairy |
| **Windy** | Dragon, Flying, Psychic |
| **Snow** | Ice, Steel |
| **Fog** | Dark, Ghost |

When weather is active:

- Boosted-type Pokémon spawn more frequently in the wild
- Wild catches of boosted types appear at ~5 levels higher (higher CP)
- Raid boss catch encounters of boosted types have higher CP ranges
- Boosted moves deal slightly more damage

Our raids schema tracks `boostedWeather` per raid boss (the weather conditions that boost that boss's type), and both `normal` and `boosted` combat power ranges.

### Resources

Pokémon GO has several resource currencies:

| Resource | Purpose |
|----------|---------|
| **Stardust** | Universal resource for powering up Pokémon, trading, unlocking second charge moves, and purifying Shadow Pokémon |
| **Candy** | Species-specific resource for evolving and powering up. Earned by catching, transferring, walking with a buddy, or using Rare Candy |
| **Candy XL** | Rarer version of Candy, required to power up Pokémon beyond level 40 (up to level 50). Obtained from high-level catches, raids, and walking |
| **Rare Candy** | Converts into Candy for any Pokémon species. Earned from raids, GBL, and research |
| **Mega Energy** | Species-specific resource that fuels Mega Evolution. Earned from Mega Raids and certain research tasks |
| **Max Particles** | Resource that fuels Dynamax battles at Power Spots. Consumed per battle |

Our research data tracks item and resource rewards (Stardust, Rare Candy, Poké Balls, Berries, etc.) as reward types.

### National Pokédex

Pokémon are numbered by their **National Pokédex** number, organized by generation:

| Generation | Region | Dex Range | Count |
|-----------|--------|-----------|-------|
| Gen 1 | Kanto | #1–151 | 151 |
| Gen 2 | Johto | #152–251 | 100 |
| Gen 3 | Hoenn | #252–386 | 135 |
| Gen 4 | Sinnoh | #387–493 | 107 |
| Gen 5 | Unova | #494–649 | 156 |
| Gen 6 | Kalos | #650–721 | 72 |
| Gen 7 | Alola | #722–809 | 88 |
| Gen 8 | Galar | #810–905 | 96 |
| Gen 9 | Paldea | #906–1025 | 120 |

As of early 2026, approximately **800–900 Pokémon** are available in Pokémon GO, spanning most of Generations 1–9 with new species being added regularly through events and seasons.

Our shinies data includes `dexNumber` for each Pokémon, which corresponds to this numbering system.

---

## Pokémon Variants and Forms

### Regional Forms

Some Pokémon have alternate forms from different regions with different types, stats, and appearances:

| Form | Origin Region | Example | Type Code |
|------|--------------|---------|-----------|
| **Alolan** | Alola (Gen 7) | Alolan Vulpix (Ice) | `_61` |
| **Galarian** | Galar (Gen 8) | Galarian Zigzagoon (Dark/Normal) | `_31` |
| **Hisuian** | Hisui (Legends: Arceus) | Hisuian Growlithe (Fire/Rock) | `_51` |
| **Paldean** | Paldea (Gen 9) | Paldean Tauros (Fighting) | `_52` |

These type codes (e.g., `_61`, `_31`) are internal identifiers used in sprite image URLs. In our shinies data, the `region` field provides a human-readable label (e.g., `"alolan"`, `"galarian"`) rather than the raw type code.

Other form variants include:

- **Form differences** (e.g., Deoxys Attack/Defense/Speed, Giratina Origin/Altered) — tracked in our raids data via the `form` field
- **Gender differences** (e.g., gendered appearances) — tracked via the `gender` field in raids data

### Shadow and Purified Pokémon

**Shadow Pokémon** are obtained by defeating Team GO Rocket members. They have:
- A purple aura visual effect
- **20% attack bonus** in battles (higher damage output)
- **20% defense penalty** (take more damage)
- A Charged Move called "Frustration" that must be removed during special events

**Purified Pokémon** are created by spending Stardust and Candy to purify a Shadow Pokémon. They receive:
- Reduced power-up and evolution costs
- A Charged Move called "Return"
- Their IVs are boosted by +2 to each stat (capped at 15)

Our Rocket Lineups data tracks which Shadow Pokémon can be encountered after defeating each Rocket member. Our raids data includes an `isShadowRaid` flag for Shadow Raid bosses.

### Mega Evolution

**Mega Evolution** is a temporary transformation that significantly boosts a Pokémon's stats and sometimes changes its type. Key mechanics:

- Requires **Mega Energy** (species-specific), earned primarily from Mega Raids
- First Mega Evolution costs more energy (200–400); subsequent activations cost less
- Evolution is **temporary** (8 hours at base level, longer at higher Mega Levels)
- The Pokémon reverts but retains accumulated Mega Level progress

**Mega Levels** (Base → High → Max) are earned by Mega Evolving repeatedly:
- Higher levels reduce energy costs, extend duration, and provide passive bonuses
- At Max level, Pokémon provide type-matching catch candy bonuses even when not Mega Evolved

**Raid bonus**: Having a Mega Evolved Pokémon in a raid grants a damage bonus to all trainers' Pokémon that share the Mega's type.

Our raids schema includes `"Mega Raids"` as a raid tier.

### Dynamax and Gigantamax

**Dynamax** is a feature introduced to Pokémon GO that allows Pokémon to grow to enormous size for special battles. Key mechanics:

- Battles occur at **Power Spots** — special locations on the map (similar to Gyms)
- Requires **Max Particles** to activate (consumed per battle)
- Dynamaxed Pokémon use **Max Moves** — upgraded versions of their Fast and Charged Attacks with bonus effects like stat boosts or team healing
- Players cooperate to battle wild Dynamax/Gigantamax bosses at Power Spots

**Gigantamax** is a rarer variant available to specific Pokémon species, giving them unique appearances and exclusive Max Moves.

Our event types include `max-battles` and `max-mondays` to track these features.

### Costume Pokémon

**Costume Pokémon** are event-limited variants that wear special outfits or accessories (e.g., Pikachu in a party hat, holiday-themed costumes). They:

- Are only available during specific events
- Cannot typically be evolved (with some exceptions)
- Have separate shiny availability from their base forms
- Are tracked as costume form variants in our shinies data (e.g., type codes like `_11`, `_14` for different costumes)

---

## Data Types We Scrape

### Events

The central data type. Every event in Pokémon GO has:

- **eventID**: A URL slug identifier (e.g., `"community-day-january-2026"`)
- **name**: Display name of the event
- **eventType**: Categorization (see [Event Types](#event-types) below for all types)
- **heading**: Auto-generated display heading from the event type
- **image**: Event banner/thumbnail URL
- **start / end**: ISO 8601 timestamps with milliseconds (e.g., `"2026-01-29T10:00:00.000"`)

Events may also include **detailed data** added by the second scraping stage:

- `pokemon` — featured Pokémon with their encounter source
- `bonuses` — event bonuses (e.g., "2× Catch XP", "3× Stardust")
- `bonusDisclaimers` — qualifying notes (e.g., "\*Regional only")
- `raids` — featured raid bosses
- `eggs` — modified egg pools
- `research` — event-specific research tasks (field, special, timed)
- `shinies` — newly available or featured shinies
- `rewards` — ticketed research rewards and prices
- `battle` — GO Battle League information
- `rocket` — Team Rocket lineup changes
- `showcases` — PokéStop Showcase details
- `habitats` — GO Tour habitat rotations
- `goPass` — GO Pass tier structure
- `customSections` — any other extracted sections

Boolean flags (`hasSpawns`, `hasFieldResearchTasks`, `hasBonuses`, `hasRaids`, `hasEggs`, `hasShiny`) indicate which content types are present.

### Raids

The current **raid boss rotation**, listing every Pokémon available in raids. Each entry includes:

- **name / originalName**: Cleaned name vs. display name (includes form/gender)
- **form**: Variant form (e.g., "Origin", "Alola", "Incarnate") or null
- **gender**: If gendered appearance matters (male/female) or null
- **tier**: Raid difficulty — `"1-Star Raids"`, `"3-Star Raids"`, `"5-Star Raids"`, or `"Mega Raids"`
- **isShadowRaid**: Whether this is a Shadow Raid boss
- **eventStatus**: `"ongoing"` (currently available), `"upcoming"` (announced but not yet live), `"inactive"`, or `"unknown"`
- **canBeShiny**: Whether the catch encounter can be shiny
- **types**: The Pokémon's type(s) with icon images
- **combatPower**: Both `normal` and `boosted` CP ranges (`min`/`max` for each)
- **boostedWeather**: Which weather conditions boost this Pokémon's CP

### Eggs

The current **egg hatch pool** — all Pokémon that can hatch from eggs. Each entry includes:

- **name**: The Pokémon that hatches
- **eggType**: Distance tier — `"1km"`, `"2km"`, `"5km"`, `"7km"`, `"10km"`, `"12km"`, `"route"`, or `"adventure5km"`/`"adventure10km"`
- **isAdventureSync**: Whether gained from Adventure Sync weekly rewards (vs. PokéStop spins)
- **isGiftExchange**: Whether from opening friend gifts (primarily 7 km eggs)
- **isRegional**: Whether the Pokémon is a regional exclusive
- **canBeShiny**: Shiny availability from eggs
- **combatPower**: Hatch CP range (`min`/`max`)
- **rarity**: 1–5 tier (1 = common, 5 = ultra-rare)

**Egg distance tiers explained:**
| Tier | Obtain From | Contents |
|------|-------------|----------|
| 1 km | Rare, event-only | Basic/common Pokémon |
| 2 km | PokéStops, Gyms | Early-game, starter Pokémon |
| 5 km | PokéStops, Gyms, Adventure Sync | Mid-tier Pokémon |
| 7 km | Friend Gifts | Regional variants, event Pokémon |
| 10 km | PokéStops, Gyms, Adventure Sync | Rare/powerful Pokémon |
| 12 km | Team GO Rocket Leaders | Shadow-associated, pseudo-legendaries |

### Field Research

**Field Research** tasks obtained by spinning PokéStops. Each task has:

- **text**: The task description (e.g., "Catch 5 Pokémon", "Make 3 Great Throws")
- **type**: Task category:
  - `event` — tied to a current event
  - `catch` — catch X Pokémon (optionally of a type)
  - `throw` — make X Nice/Great/Excellent/Curveball throws
  - `battle` — win gym/raid/trainer battles
  - `explore` — spin PokéStops, walk distance, hatch eggs
  - `training` — earn candy, power up, evolve
  - `rocket` — defeat Team GO Rocket
  - `buddy` — walk with or earn hearts with buddy
  - `ar` — take AR snapshots
  - `sponsored` — brand-partnered tasks
- **rewards**: Array of possible rewards, each with:
  - `type`: `"encounter"` (Pokémon), `"item"` (Poké Ball, Berry, etc.), or `"resource"` (Stardust, XP)
  - `name`, `image`, `canBeShiny`, `combatPower` (for encounters)
  - `quantity` (for items/resources)

**Research Breakthrough**: After collecting 7 daily Field Research stamps (one per day), players claim a breakthrough reward — typically a Pokémon encounter (often a Legendary or rare species) plus bonus items.

### Team GO Rocket Lineups

The current battle lineups for all **Team GO Rocket** members:

- **Giovanni** (Team GO Rocket Boss) — the final boss, encountered via Super Rocket Radar. Always has a Legendary Shadow Pokémon as his third slot
- **Leaders** (Cliff, Sierra, Arlo) — mid-tier bosses found via Rocket Radar (assembled from 6 Mysterious Components)
- **Grunts** — foot soldiers at invaded PokéStops and in balloons, each specializing in a Pokémon type

Each lineup has **3 battle slots**, where each slot contains an array of possible Pokémon. The first slot is typically fixed, while slots 2 and 3 have multiple possibilities. Key data per Pokémon:

- **name / image**: The Shadow Pokémon
- **types**: Pokémon type(s) for building counters
- **weaknesses**: Split into `double` (double super effective) and `single` (single super effective) weaknesses
- **isEncounter**: Whether defeating this member rewards a catch encounter for the first-slot Pokémon (always the Shadow version)
- **canBeShiny**: Whether the encounter can be shiny

### Shiny Pokémon

A complete catalog of **shiny availability** in Pokémon GO. Shiny Pokémon are rare alternate-color variants (e.g., a red Gyarados instead of blue). They are cosmetic only and don't affect stats.

Each entry tracks:

- **dexNumber**: National Pokédex number
- **name**: Pokémon name (includes regional prefix if applicable)
- **releasedDate**: When the shiny variant was first made available (format: `YYYY-MM-DD`), or null if not yet released
- **family**: Evolution family identifier for grouping related Pokémon
- **region**: Human-readable form/variant label (e.g., `"alolan"`, `"galarian"`, `"hisuian"`, `"paldean"`, or costume identifiers), or null for base form
- **forms**: Array of alternative forms/costumes, each with sprite image data
- **image**: Base shiny sprite URL

Shiny odds vary by encounter method:
- Wild encounters: ~1/500 (base rate)
- Community Day featured Pokémon: ~1/25
- Legendary raids: ~1/20
- Raid Day events: ~1/10
- Certain research encounters: guaranteed or boosted

---

## Event Types

These are all the event categories in our `eventType` enum, corresponding to scrapers in `src/pages/detailed/`.

### Community Day

**Event type slug**: `community-day`

A monthly event (typically 3–6 hours on a Saturday or Sunday) featuring a single Pokémon species with:

- **Massively increased wild spawns** of the featured Pokémon
- **Boosted shiny odds** (~1/25) for the featured species
- **Exclusive move**: Evolving the featured Pokémon during the event (or shortly after) teaches a special move not normally available
- **Event bonuses**: Typically 2–3 bonuses like 3× Catch Stardust, 2× Catch XP, ¼ Egg Hatch Distance, extended Lure/Incense duration
- **Event-specific Field Research** tasks awarding the featured Pokémon

Our scraper extracts: featured Pokémon lists, bonuses, research tasks, and bonus disclaimers.

### Pokémon Spotlight Hour

**Event type slug**: `pokemon-spotlight-hour`

A weekly 1-hour event every **Tuesday from 6:00–7:00 PM local time**:

- Features one Pokémon species with 25× increased wild spawn rates
- Includes a rotating weekly bonus (e.g., 2× Transfer Candy, 2× Catch XP, 2× Catch Stardust, 2× Evolution XP)
- Simple format — spawns and one bonus, no special research
- Does not typically feature boosted shiny rates

### Raid Hour

**Event type slug**: `raid-hour`

A weekly 1-hour event every **Wednesday from 6:00–7:00 PM local time**:

- All Gyms spawn the current 5-Star or Mega Raid boss simultaneously
- Dramatically increases the number of concurrent raids
- Players receive additional free Raid Passes from Gym spins
- Features whatever raid boss is in the current rotation
- Great opportunity for groups to chain raids rapidly

### Raid Day

**Event type slug**: `raid-day`

A longer raid-focused event (typically 6–12 hours) featuring:

- A single raid boss (often 5-Star, Mega, or Shadow) appearing at high frequency
- Extra free Raid Passes (often 5–10 during the event)
- Boosted or guaranteed shiny rates for the featured boss
- Special bonuses like increased XP from raids or extra Rare Candy
- Different from Raid Hour by spanning an entire day rather than one hour

### Raid Battles

**Event type slug**: `raid-battles`

General raid rotation events and themed raid periods. These cover:

- Announced changes to the raid boss pool (new Legendary in 5-Star, new Mega, etc.)
- Themed raid events (e.g., "Electric-type Raid Event" with all-Electric bosses)
- Multi-week raid rotations with scheduled boss changes

### GO Battle League

**Event type slug**: `go-battle-league`

Pokémon GO's competitive **Player vs Player (PvP)** system. Organized into seasons with sub-seasons:

**Three main leagues by CP limit:**

| League | CP Limit | Strategy |
|--------|----------|----------|
| **Great League** | 1,500 CP | Low-stat Pokémon excel; bulk is key |
| **Ultra League** | 2,500 CP | Mix of bulk and power |
| **Master League** | No limit | Legendaries and maxed Pokémon dominate |

**Special Cups** rotate alongside main leagues with additional restrictions (e.g., type restrictions, Little Cup with 500 CP limit, specific allowed Pokémon).

Players battle in **sets of 5 matches**, earning rewards based on wins (Stardust, encounter rewards, Rare Candy, TMs). Ratings/rankings determine leaderboard position. **GO Battle Days** periodically boost rewards.

Our scraper extracts league schedules, cup information, and CP limits.

### Season

**Event type slug**: `season`

A 3-month themed period that resets and reshapes the entire game:

- **Wild spawns** change — different Pokémon appear in various biomes
- **Egg pools** rotate with new hatchable species per distance tier
- **Raid boss rotations** are themed to the season
- **Field Research** tasks refresh with new rewards
- **Hemisphere-specific spawns** differ between Northern and Southern hemispheres
- **Seasonal bonuses** may apply (e.g., increased Incense effectiveness)
- **Story/narrative** threads tie events together

Seasons typically run from the first of a month (March, June, September, December) through three months. Each season has a name and theme (e.g., "Season of Precious Paths").

### Pokémon GO Tour

**Event type slug**: `pokemon-go-tour`

The annual premium celebration event, typically focusing on a specific generation/region:

- **Ticketed** ($14.99 or similar) with substantial free content for non-ticket holders
- **Habitats**: Rotating themed biomes (usually 4) that cycle throughout the event, each spawning different Pokémon
- **6+ hour play window** with rotating habitats (each ~45–60 minutes)
- **Exclusive debuts**: New shiny releases, new Pokémon, or special forms
- **Timed Research & Special Research** with unique storylines
- **Increased shiny rates** across the board
- **Collection Challenges** to catch specific sets of Pokémon

Our scraper extracts: habitats (with Pokémon per habitat), bonuses, research tasks, shinies, featured Pokémon, and ticketed rewards.

### GO Pass

**Event type slug**: `go-pass`

A premium ticket/subscription system for events:

- **Ticket-based**: Purchased from the in-game shop for specific events ($4.99–$9.99)
- **Tiered rewards**: Multiple tiers offering escalating bonuses
- **Exclusive perks**: Extra Raid Passes, exclusive Timed Research, avatar items, resource bundles, Incense/Lure bonuses
- **Event-specific**: Each GO Pass is tied to a particular event or time window

Our scraper extracts GO Pass tier structures including tier names, bonuses per tier, and pricing information.

### Research Day

**Event type slug**: `research-day`

A limited-time event (typically 4–6 hours) centered on Field Research:

- **PokéStops** give special event research tasks when spun
- Featured Pokémon available as research encounter rewards
- Often features newly released Pokémon or boosted shiny odds
- Bonuses may include double XP, halved egg distances, or extra Stardust
- Tasks reset when a PokéStop is spun (unique tasks per Stop)

### Research (Timed & Special)

**Event type slugs**: `research`, `timed-research`, `special-research`

Two distinct research types beyond standard Field Research:

**Timed Research:**
- Event-specific questlines with a **deadline** — tasks expire if not completed in time
- Linear chains of tasks with progressive rewards
- Often tied to specific events (free or ticketed)
- Rewards include encounters, items, Stardust, and stickers

**Special Research:**
- **Story-driven** questlines with narrative dialogue from Professors/characters
- **No expiration** once started (but may require an event to unlock)
- Multi-step chains, often 4–8 stages
- Rewards include Legendary/Mythical encounters, avatar items, and exclusive Pokémon
- Examples: Team GO Rocket storylines, Mythical discovery quests

### Research Breakthrough

**Event type slug**: `research-breakthrough`

The reward system for consistent daily play:

- Players earn **1 Field Research stamp per day** by completing any research task
- After collecting **7 stamps**, they claim a **Research Breakthrough**
- Breakthrough rewards include:
  - A special Pokémon encounter (rotates monthly, often Legendary or rare)
  - Bonus items (Rare Candy, Star Pieces, etc.)
  - Stardust
- The featured breakthrough encounter Pokémon is announced by Niantic in advance and rotates on a regular schedule

### Team GO Rocket Takeover

**Event type slug**: `go-rocket-takeover`, `team-go-rocket`

Periodic invasion events where Team GO Rocket activity surges:

- **Increased Rocket activity**: More Grunts at PokéStops and in balloons
- **New Shadow Pokémon** may be introduced or rotated
- **Leader lineup changes**: Cliff, Sierra, and Arlo may get new Pokémon
- **Giovanni returns**: Often introduces a new Legendary Shadow Pokémon
- **TM events**: Players can use Charged TMs to remove "Frustration" from Shadow Pokémon (normally blocked)
- **Boosted rewards**: Extra Mysterious Components, special research for Super Rocket Radar

The `go-rocket-takeover` type represents the limited-time surge events, while `team-go-rocket` covers general Rocket-themed content.

### PokéStop Showcase

**Event type slug**: `pokestop-showcase`

A competitive feature at PokéStops where players submit Pokémon for display:

- **Themed criteria**: Each Showcase has specific entry requirements (e.g., largest Magikarp, specific species)
- Players submit one Pokémon per Showcase from eligible species
- **Judged by stats**: Size (XL/XXL), IVs, or other criteria depending on the theme
- **Leaderboard**: Players can see rankings at the PokéStop
- **Rewards**: Top performers earn items, Stardust, and other bonuses
- Showcases rotate regularly and are tied to events

### Max Battles

**Event type slug**: `max-battles`

Events centered on the **Dynamax** feature:

- Special themed periods featuring specific Dynamax or Gigantamax Pokémon at **Power Spots**
- Power Spots are special map locations where Dynamax battles occur
- Players spend **Max Particles** to Dynamax their own Pokémon and battle
- **Dynamaxed Pokémon** use Max Moves — upgraded attacks with bonus effects
- Cooperative battles where multiple trainers work together
- Featured Pokémon may include debut Dynamax species
- Rewards include Candy, Candy XL, and special items

### Max Mondays

**Event type slug**: `max-mondays`

A weekly recurring event every **Monday**:

- Increased **Max Particle** generation and bonuses at Power Spots
- Up to 8× refresh rate for Power Spots
- Boosted Max Particle earning (up to 1,600)
- Featured Dynamax/Gigantamax battles rotate weekly
- Encourages weekly Dynamax engagement with accessible rewards
- Often features a specific Dynamax Pokémon each week

---

## Wild Spawns and Encounter Sources

Pokémon appear in the game through various **encounter sources**, tracked in our event data's `pokemon[].source` field:

| Source | Description |
|--------|-------------|
| `spawn` | Standard wild spawn — appears on the map near the player |
| `featured` | Highlighted/boosted spawn for the event (higher frequency) |
| `incense` | Exclusive to Incense — only appears when using an Incense item, not in standard wild spawns |
| `costumed` | Wearing a special event costume (hat, outfit, accessory) |
| `debut` | Newly released Pokémon appearing for the first time in the game |
| `maxDebut` | Pokémon receiving its Dynamax form for the first time |
| `raid` | Available in raid battles |
| `egg` | Hatchable from eggs |
| `research` | Available as a research task encounter reward |
| `reward` | Available as an event reward or completion reward |
| `encounter` | Generic encounter (catch opportunity from battle, special, etc.) |

**Spawn points** are server-controlled locations on the map that generate Pokémon at set intervals (typically hourly). The species that appear depend on the local biome, current season, active events, and weather.

**Incense** is a consumable item that attracts Pokémon to the player for 30–60 minutes. During certain events, Incense-exclusive spawns feature Pokémon not available in standard wild encounters.

---

## Promo Codes

Pokémon GO periodically releases **promo codes** — alphanumeric strings that can be redeemed for free in-game items:

- Redeemed via the in-game Shop → "Redeem Code" button (Android) or through the Niantic website (iOS)
- Codes are case-sensitive and single-use per account
- Typical rewards: Poké Balls, Berries, Incense, Lucky Eggs, Star Pieces, Stardust
- Distributed through: official blog posts, social media, partner promotions, live events, and content creators
- Our scraper extracts promo code links found on event pages

---

*This document was generated from game data research and reflects Pokémon GO mechanics as of early 2026. Game mechanics may change with Niantic updates.*
