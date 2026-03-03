# Endpoints

## Base URL

```
https://pokemn.quest/data/
```

## Primary Endpoints

These are the main data endpoints, each representing a distinct game mechanic or dataset.

| Endpoint | URL | Description | Documentation |
|----------|-----|-------------|---------------|
| **Eggs** | [`eggs.min.json`](https://pokemn.quest/data/eggs.min.json) | Current egg hatch pool with Pokemon, CP ranges, rarity, and shiny availability | [Eggs.md](Eggs.md) |
| **Events** | [`events.min.json`](https://pokemn.quest/data/events.min.json) | All Pokemon GO events with timing, bonuses, featured Pokemon, and type-specific details | [Events.md](Events.md) |
| **Raids** | [`raids.min.json`](https://pokemn.quest/data/raids.min.json) | Current raid bosses with tiers, CP ranges, types, weather boosts, and shiny availability | [Raids.md](Raids.md) |
| **Research** | [`research.min.json`](https://pokemn.quest/data/research.min.json) | Active field research tasks and rewards (encounters, items, resources) | [Research.md](Research.md) |
| **Rocket Lineups** | [`rocketLineups.min.json`](https://pokemn.quest/data/rocketLineups.min.json) | Team GO Rocket leader and grunt battle lineups with types and weaknesses | [RocketLineups.md](RocketLineups.md) |
| **Shinies** | [`shinies.min.json`](https://pokemn.quest/data/shinies.min.json) | Complete shiny availability list with release dates, forms, and regional variants | [Shinies.md](Shinies.md) |

## Event Type Endpoints

These endpoints contain subsets of events data filtered by event type. Each file is an array of event objects sharing the same `eventType` value. All event type files share the [Events schema](../schemas/events.schema.json).

| Endpoint | URL | Description | Documentation |
|----------|-----|-------------|---------------|
| **Community Day** | [`eventTypes/community-day.min.json`](https://pokemn.quest/data/eventTypes/community-day.min.json) | Monthly events with increased spawns, exclusive moves, and bonuses | [CommunityDay.md](eventTypes/CommunityDay.md) |
| **Event** | [`eventTypes/event.min.json`](https://pokemn.quest/data/eventTypes/event.min.json) | General in-game events (seasonal, themed, etc.) | [Event.md](eventTypes/Event.md) |
| **Go Battle League** | [`eventTypes/go-battle-league.min.json`](https://pokemn.quest/data/eventTypes/go-battle-league.min.json) | GBL seasons, cups, and competitive play events | [GoBattleLeague.md](eventTypes/GoBattleLeague.md) |
| **Go Pass** | [`eventTypes/go-pass.min.json`](https://pokemn.quest/data/eventTypes/go-pass.min.json) | Go Pass subscription tier events | [GoPass.md](eventTypes/GoPass.md) |
| **Go Rocket Takeover** | [`eventTypes/go-rocket-takeover.min.json`](https://pokemn.quest/data/eventTypes/go-rocket-takeover.min.json) | Team GO Rocket takeover events | [GoRocketTakeover.md](eventTypes/GoRocketTakeover.md) |
| **Max Battles** | [`eventTypes/max-battles.min.json`](https://pokemn.quest/data/eventTypes/max-battles.min.json) | Max Battle events featuring Dynamax/Gigantamax encounters | [MaxBattles.md](eventTypes/MaxBattles.md) |
| **Max Mondays** | [`eventTypes/max-mondays.min.json`](https://pokemn.quest/data/eventTypes/max-mondays.min.json) | Weekly Max Monday events | [MaxMondays.md](eventTypes/MaxMondays.md) |
| **Pokemon GO Tour** | [`eventTypes/pokemon-go-tour.min.json`](https://pokemn.quest/data/eventTypes/pokemon-go-tour.min.json) | Annual Pokemon GO Tour events | [PokemonGoTour.md](eventTypes/PokemonGoTour.md) |
| **Pokemon Spotlight Hour** | [`eventTypes/pokemon-spotlight-hour.min.json`](https://pokemn.quest/data/eventTypes/pokemon-spotlight-hour.min.json) | Weekly Spotlight Hour events featuring specific Pokemon | [PokemonSpotlightHour.md](eventTypes/PokemonSpotlightHour.md) |
| **Pokestop Showcase** | [`eventTypes/pokestop-showcase.min.json`](https://pokemn.quest/data/eventTypes/pokestop-showcase.min.json) | Pokestop Showcase competition events | [PokestopShowcase.md](eventTypes/PokestopShowcase.md) |
| **Raid Battles** | [`eventTypes/raid-battles.min.json`](https://pokemn.quest/data/eventTypes/raid-battles.min.json) | Raid rotation events and special raid weekends | [RaidBattles.md](eventTypes/RaidBattles.md) |
| **Raid Day** | [`eventTypes/raid-day.min.json`](https://pokemn.quest/data/eventTypes/raid-day.min.json) | Special Raid Day events | [RaidDay.md](eventTypes/RaidDay.md) |
| **Raid Hour** | [`eventTypes/raid-hour.min.json`](https://pokemn.quest/data/eventTypes/raid-hour.min.json) | Weekly Raid Hour events | [RaidHour.md](eventTypes/RaidHour.md) |
| **Research** | [`eventTypes/research.min.json`](https://pokemn.quest/data/eventTypes/research.min.json) | Research-focused events | [Research.md](eventTypes/Research.md) |
| **Research Breakthrough** | [`eventTypes/research-breakthrough.min.json`](https://pokemn.quest/data/eventTypes/research-breakthrough.min.json) | Monthly Research Breakthrough reward rotations | [ResearchBreakthrough.md](eventTypes/ResearchBreakthrough.md) |
| **Research Day** | [`eventTypes/research-day.min.json`](https://pokemn.quest/data/eventTypes/research-day.min.json) | Special Research Day events | [ResearchDay.md](eventTypes/ResearchDay.md) |
| **Season** | [`eventTypes/season.min.json`](https://pokemn.quest/data/eventTypes/season.min.json) | Seasonal rotations (spawns, eggs, raids, research) | [Season.md](eventTypes/Season.md) |
| **Special Research** | [`eventTypes/special-research.min.json`](https://pokemn.quest/data/eventTypes/special-research.min.json) | Special Research story events | [SpecialResearch.md](eventTypes/SpecialResearch.md) |
| **Team Go Rocket** | [`eventTypes/team-go-rocket.min.json`](https://pokemn.quest/data/eventTypes/team-go-rocket.min.json) | Team GO Rocket events | [TeamGoRocket.md](eventTypes/TeamGoRocket.md) |
| **Timed Research** | [`eventTypes/timed-research.min.json`](https://pokemn.quest/data/eventTypes/timed-research.min.json) | Timed Research events with expiring tasks | [TimedResearch.md](eventTypes/TimedResearch.md) |

## Notes

- All endpoints return minified JSON arrays (`Content-Type: application/json;charset=utf-8`)
- Event type endpoints are subsets of the main Events endpoint, filtered by `eventType`
- Some event type files may not exist when no events of that type are currently tracked (e.g., `pokemon-go-tour`, `pokemon-spotlight-hour`, `research-breakthrough`, `special-research`, `team-go-rocket`, `timed-research`)
- All data is updated every 8 hours via an automated scraping pipeline
