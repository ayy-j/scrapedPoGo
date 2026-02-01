# Endpoint

`https://pokemn.quest/data/eventTypes/go-battle-league.min.json`

## Description

This file contains all GO Battle League season and cup rotation events. These events detail the competitive PvP seasons, cup schedules, and league rotations.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"go-battle-league"`:

```json
[
  {
    "eventID": "go-battle-league-season-example",
    "name": "GO Battle League Season Example",
    "eventType": "go-battle-league",
    "heading": "GO Battle League",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "go-battle-league-season-21",
  "name": "GO Battle League Season 21",
  "eventType": "go-battle-league",
  "heading": "GO Battle League",
  "image": "https://cdn.leekduck.com/assets/img/events/go-battle-league.jpg",
  "start": "2025-12-02T13:00:00.000",
  "end": "2026-03-03T13:00:00.000",
  "flags": {
    "hasSpawns": false,
    "hasFieldResearchTasks": false,
    "hasBonuses": false,
    "hasRaids": false,
    "hasEggs": false,
    "hasShiny": false
  }
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Battle League season or cup
| **`name`**      | `string` | Name of the season or cup rotation
| **`eventType`** | `string` | Always `"go-battle-league"`
| **`heading`**   | `string` | Always `"GO Battle League"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Season/cup start date/time (ISO 8601 format)
| **`end`**       | `string` | Season/cup end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see below)

### Flags Object

| Field                     | Type      | Description
|-------------------------- |---------- |---------------------
| **`hasSpawns`**           | `boolean` | Whether the event has wild spawns data
| **`hasFieldResearchTasks`** | `boolean` | Whether the event has field research tasks
| **`hasBonuses`**          | `boolean` | Whether the event has gameplay bonuses
| **`hasRaids`**            | `boolean` | Whether the event has raid data
| **`hasEggs`**             | `boolean` | Whether the event has egg pool changes
| **`hasShiny`**            | `boolean` | Whether the event has shiny debuts

## Additional Sections

GO Battle League events include a `details` object containing:

- **`battle`**: League and cup rotation details with CP restrictions and rules
- **`bonuses`**: Season rewards and rank-up bonuses



## Notes

- GO Battle League seasons typically align with in-game seasons (3 months)
- Each season features rotating cups with different CP limits and restrictions
- Great League, Ultra League, and Master League are standard rotations
