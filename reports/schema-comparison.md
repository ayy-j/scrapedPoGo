# Schema/Data/Docs Comparison Report

- Generated: 2026-02-07T03:24:46.665Z
- Mode: report
- Canonical datasets: 6
- Errors: 60
- Warnings: 75

## Dataset Status

| Dataset | Status | Errors | Warnings |
|---|---|---:|---:|
| eggs | fail | 1 | 0 |
| events | fail | 55 | 17 |
| raids | fail | 1 | 0 |
| research | fail | 1 | 0 |
| rocketLineups | fail | 1 | 0 |
| shinies | fail | 1 | 13 |

## Findings

### Error (60)

- [doc-field-table] Field "bonus" does not resolve in canonical schema (Field "bonus" not found while resolving "bonus".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "bonusDisclaimers" does not resolve in canonical schema (Field "bonusDisclaimers" not found while resolving "bonusDisclaimers".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "lureModuleBonus" does not resolve in canonical schema (Field "lureModuleBonus" not found while resolving "lureModuleBonus".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "exclusiveBonuses" does not resolve in canonical schema (Field "exclusiveBonuses" not found while resolving "exclusiveBonuses".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "raidAlternation" does not resolve in canonical schema (Field "raidAlternation" not found while resolving "raidAlternation".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "raidFeaturedAttacks" does not resolve in canonical schema (Field "raidFeaturedAttacks" not found while resolving "raidFeaturedAttacks".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "research.field" does not resolve in canonical schema (Field "field" not found while resolving "research.field".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "research.special" does not resolve in canonical schema (Field "special" not found while resolving "research.special".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "research.timed" does not resolve in canonical schema (Field "timed" not found while resolving "research.timed".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "research.masterwork" does not resolve in canonical schema (Field "masterwork" not found while resolving "research.masterwork".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "research.breakthrough" does not resolve in canonical schema (Field "breakthrough" not found while resolving "research.breakthrough".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "battle" does not resolve in canonical schema (Field "battle" not found while resolving "battle".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "battle.leagues" does not resolve in canonical schema (Field "battle" not found while resolving "battle.leagues".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "battle.featuredAttack" does not resolve in canonical schema (Field "battle" not found while resolving "battle.featuredAttack".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rocket" does not resolve in canonical schema (Field "rocket" not found while resolving "rocket".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rocket.shadows" does not resolve in canonical schema (Field "rocket" not found while resolving "rocket.shadows".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rocket.leaders" does not resolve in canonical schema (Field "rocket" not found while resolving "rocket.leaders".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rocket.giovanni" does not resolve in canonical schema (Field "rocket" not found while resolving "rocket.giovanni".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rocket.grunts" does not resolve in canonical schema (Field "rocket" not found while resolving "rocket.grunts".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "shinyDebuts" does not resolve in canonical schema (Field "shinyDebuts" not found while resolving "shinyDebuts".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rewards" does not resolve in canonical schema (Field "rewards" not found while resolving "rewards".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rewards.ticketedResearch" does not resolve in canonical schema (Field "rewards" not found while resolving "rewards.ticketedResearch".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rewards.ticketBonuses" does not resolve in canonical schema (Field "rewards" not found while resolving "rewards.ticketBonuses".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rewards.ticketPrice" does not resolve in canonical schema (Field "rewards" not found while resolving "rewards.ticketPrice".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "rewards.ticketAddOns" does not resolve in canonical schema (Field "rewards" not found while resolving "rewards.ticketAddOns".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "showcases" does not resolve in canonical schema (Field "showcases" not found while resolving "showcases".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "photobomb" does not resolve in canonical schema (Field "photobomb" not found while resolving "photobomb".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "photobomb.description" does not resolve in canonical schema (Field "photobomb" not found while resolving "photobomb.description".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "photobomb.pokemon" does not resolve in canonical schema (Field "photobomb" not found while resolving "photobomb.pokemon".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "communityDays" does not resolve in canonical schema (Field "communityDays" not found while resolving "communityDays".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "features" does not resolve in canonical schema (Field "features" not found while resolving "features".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "goBattleLeague" does not resolve in canonical schema (Field "goBattleLeague" not found while resolving "goBattleLeague".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "goPass" does not resolve in canonical schema (Field "goPass" not found while resolving "goPass".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "pricing" does not resolve in canonical schema (Field "pricing" not found while resolving "pricing".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "pointTasks" does not resolve in canonical schema (Field "pointTasks" not found while resolving "pointTasks".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "ranks" does not resolve in canonical schema (Field "ranks" not found while resolving "ranks".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "featuredPokemon" does not resolve in canonical schema (Field "featuredPokemon" not found while resolving "featuredPokemon".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "milestoneBonuses" does not resolve in canonical schema (Field "milestoneBonuses" not found while resolving "milestoneBonuses".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "eventInfo" does not resolve in canonical schema (Field "eventInfo" not found while resolving "eventInfo".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "habitats" does not resolve in canonical schema (Field "habitats" not found while resolving "habitats".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "whatsNew" does not resolve in canonical schema (Field "whatsNew" not found while resolving "whatsNew".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "sales" does not resolve in canonical schema (Field "sales" not found while resolving "sales".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "maxBattles" does not resolve in canonical schema (Field "maxBattles" not found while resolving "maxBattles".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "maxMondays" does not resolve in canonical schema (Field "maxMondays" not found while resolving "maxMondays".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "canBeShiny" does not resolve in canonical schema (Field "canBeShiny" not found while resolving "canBeShiny".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "description" does not resolve in canonical schema (Field "description" not found while resolving "description".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "customSections" does not resolve in canonical schema (Field "customSections" not found while resolving "customSections".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "availability" does not resolve in canonical schema (Field "availability" not found while resolving "availability".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "encounters" does not resolve in canonical schema (Field "encounters" not found while resolving "encounters".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "isPaid" does not resolve in canonical schema (Field "isPaid" not found while resolving "isPaid".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "price" does not resolve in canonical schema (Field "price" not found while resolving "price".). (events | dataDocumentation/Events.md)
- [doc-field-table] Field "tasks" does not resolve in canonical schema (Field "tasks" not found while resolving "tasks".). (events | dataDocumentation/Events.md)
- [doc-field-table] Type mismatch for field "eggs" at line 153: doc=object schema=array|object. (events | dataDocumentation/Events.md | /items/properties/eggs)
- [doc-field-table] Type mismatch for field "research" at line 105: doc=object schema=array|object. (events | dataDocumentation/Events.md | /items/properties/research)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (1 difference(s)). (eggs | dataDocumentation/Eggs.md | /$id)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (48 difference(s)). (events | dataDocumentation/Events.md | /$id)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (1 difference(s)). (raids | dataDocumentation/Raids.md | /$id)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (2 difference(s)). (research | dataDocumentation/Research.md | /$id)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (3 difference(s)). (rocketLineups | dataDocumentation/RocketLineups.md | /$id)
- [doc-schema-block] Embedded doc JSON schema differs from canonical schema (6 difference(s)). (shinies | dataDocumentation/Shinies.md | /$id)

### Warning (75)

- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eggs.json (data/eggs.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/events.json (data/events.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/community-day.min.json (data/eventTypes/community-day.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/event.min.json (data/eventTypes/event.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/go-battle-league.min.json (data/eventTypes/go-battle-league.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/go-pass.min.json (data/eventTypes/go-pass.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/max-battles.min.json (data/eventTypes/max-battles.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/max-mondays.min.json (data/eventTypes/max-mondays.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/pokemon-go-tour.min.json (data/eventTypes/pokemon-go-tour.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/pokemon-spotlight-hour.min.json (data/eventTypes/pokemon-spotlight-hour.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/pokestop-showcase.min.json (data/eventTypes/pokestop-showcase.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/raid-battles.min.json (data/eventTypes/raid-battles.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/raid-day.min.json (data/eventTypes/raid-day.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/raid-hour.min.json (data/eventTypes/raid-hour.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/research-day.min.json (data/eventTypes/research-day.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/eventTypes/season.min.json (data/eventTypes/season.min.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/raids.json (data/raids.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/research.json (data/research.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/rocketLineups.json (data/rocketLineups.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/shinies.json (data/shinies.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/unified.json (data/unified.json)
- [coverage-data] Data file is not mapped to a canonical schema/data/doc triplet: data/unified.min.json (data/unified.min.json)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/API.md (dataDocumentation/API.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/Endpoints.md (dataDocumentation/Endpoints.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/CommunityDay.md (dataDocumentation/eventTypes/CommunityDay.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/Event.md (dataDocumentation/eventTypes/Event.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/GoBattleLeague.md (dataDocumentation/eventTypes/GoBattleLeague.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/GoPass.md (dataDocumentation/eventTypes/GoPass.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/GoRocketTakeover.md (dataDocumentation/eventTypes/GoRocketTakeover.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/MaxBattles.md (dataDocumentation/eventTypes/MaxBattles.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/MaxMondays.md (dataDocumentation/eventTypes/MaxMondays.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/PokemonGoTour.md (dataDocumentation/eventTypes/PokemonGoTour.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/PokemonSpotlightHour.md (dataDocumentation/eventTypes/PokemonSpotlightHour.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/PokestopShowcase.md (dataDocumentation/eventTypes/PokestopShowcase.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/RaidBattles.md (dataDocumentation/eventTypes/RaidBattles.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/RaidDay.md (dataDocumentation/eventTypes/RaidDay.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/RaidHour.md (dataDocumentation/eventTypes/RaidHour.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/Research.md (dataDocumentation/eventTypes/Research.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/ResearchBreakthrough.md (dataDocumentation/eventTypes/ResearchBreakthrough.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/ResearchDay.md (dataDocumentation/eventTypes/ResearchDay.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/Season.md (dataDocumentation/eventTypes/Season.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/SpecialResearch.md (dataDocumentation/eventTypes/SpecialResearch.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/TeamGoRocket.md (dataDocumentation/eventTypes/TeamGoRocket.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/eventTypes/TimedResearch.md (dataDocumentation/eventTypes/TimedResearch.md)
- [coverage-doc] Documentation file is not mapped to a canonical schema/data/doc triplet: dataDocumentation/UnifiedData.md (dataDocumentation/UnifiedData.md)
- [doc-field-table] Skipping ambiguous field token "name" at line 295 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "image" at line 296 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "source" at line 297 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "canBeShiny" at line 298 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageWidth" at line 299 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageHeight" at line 300 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageType" at line 301 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "name" at line 320 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "image" at line 321 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "canBeShiny" at line 322 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageWidth" at line 323 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageHeight" at line 324 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "imageType" at line 325 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "name" at line 345 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "cpCap" at line 346 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "typeRestrictions" at line 347 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "rules" at line 348 outside a top-level fields section. (events | dataDocumentation/Events.md)
- [doc-field-table] Skipping ambiguous field token "dexNumber" at line 71 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "name" at line 72 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "releasedDate" at line 73 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "family" at line 74 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "region" at line 75 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "forms" at line 76 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "image" at line 77 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "imageWidth" at line 78 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "imageHeight" at line 79 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "name" at line 87 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "image" at line 88 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "imageWidth" at line 89 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)
- [doc-field-table] Skipping ambiguous field token "imageHeight" at line 90 outside a top-level fields section. (shinies | dataDocumentation/Shinies.md)

### Info (0)

- None

## Coverage Gaps

- Unmatched data files: 22
- data: data/eggs.json
- data: data/eventTypes/community-day.min.json
- data: data/eventTypes/event.min.json
- data: data/eventTypes/go-battle-league.min.json
- data: data/eventTypes/go-pass.min.json
- data: data/eventTypes/max-battles.min.json
- data: data/eventTypes/max-mondays.min.json
- data: data/eventTypes/pokemon-go-tour.min.json
- data: data/eventTypes/pokemon-spotlight-hour.min.json
- data: data/eventTypes/pokestop-showcase.min.json
- data: data/eventTypes/raid-battles.min.json
- data: data/eventTypes/raid-day.min.json
- data: data/eventTypes/raid-hour.min.json
- data: data/eventTypes/research-day.min.json
- data: data/eventTypes/season.min.json
- data: data/events.json
- data: data/raids.json
- data: data/research.json
- data: data/rocketLineups.json
- data: data/shinies.json
- data: data/unified.json
- data: data/unified.min.json
- Unmatched documentation files: 23
- docs: dataDocumentation/API.md
- docs: dataDocumentation/Endpoints.md
- docs: dataDocumentation/UnifiedData.md
- docs: dataDocumentation/eventTypes/CommunityDay.md
- docs: dataDocumentation/eventTypes/Event.md
- docs: dataDocumentation/eventTypes/GoBattleLeague.md
- docs: dataDocumentation/eventTypes/GoPass.md
- docs: dataDocumentation/eventTypes/GoRocketTakeover.md
- docs: dataDocumentation/eventTypes/MaxBattles.md
- docs: dataDocumentation/eventTypes/MaxMondays.md
- docs: dataDocumentation/eventTypes/PokemonGoTour.md
- docs: dataDocumentation/eventTypes/PokemonSpotlightHour.md
- docs: dataDocumentation/eventTypes/PokestopShowcase.md
- docs: dataDocumentation/eventTypes/RaidBattles.md
- docs: dataDocumentation/eventTypes/RaidDay.md
- docs: dataDocumentation/eventTypes/RaidHour.md
- docs: dataDocumentation/eventTypes/Research.md
- docs: dataDocumentation/eventTypes/ResearchBreakthrough.md
- docs: dataDocumentation/eventTypes/ResearchDay.md
- docs: dataDocumentation/eventTypes/Season.md
- docs: dataDocumentation/eventTypes/SpecialResearch.md
- docs: dataDocumentation/eventTypes/TeamGoRocket.md
- docs: dataDocumentation/eventTypes/TimedResearch.md

