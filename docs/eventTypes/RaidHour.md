# Endpoint

`https://pokemn.quest/data/eventTypes/raid-hour.min.json`

## Description

This file contains all Raid Hour events. These are weekly one-hour events featuring a specific Legendary or powerful Pokémon in 5-star raids at most Gyms.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-hour"`:

```json
[
  {
    "eventID": "raidhour20260128",
    "name": "Tornadus (Incarnate Forme) Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    ...
  },
  {
    "eventID": "raidhour20260204",
    "name": "Landorus (Incarnate Forme) Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "raidhour20260128",
  "name": "Tornadus (Incarnate Forme) Raid Hour",
  "eventType": "raid-hour",
  "heading": "Raid Hour",
  "image": "https://cdn.leekduck.com/assets/img/events/raidhour.jpg",
  "start": "2026-01-28T18:00:00.000",
  "end": "2026-01-28T19:00:00.000",
  "flags": {
    "hasSpawns": false,
    "hasFieldResearchTasks": false,
    "hasBonuses": false,
    "hasRaids": false,
    "hasEggs": false,
    "hasShiny": false,
    "hasShowcases": false,
    "hasRocket": false,
    "hasBattle": false,
    "hasResearch": false,
    "hasRewards": false
  },
  "canBeShiny": false
}
```

## Fields

### Core Fields

| Field           | Type      | Description
|---------------- |---------- |---------------------
| **`eventID`**   | `string`  | Unique identifier (typically "raidhour" + YYYYMMDD)
| **`name`**      | `string`  | Name including featured Pokémon
| **`eventType`** | `string`  | Always `"raid-hour"`
| **`heading`**   | `string`  | Always `"Raid Hour"`
| **`image`**     | `string`  | Event header/thumbnail image URL
| **`start`**     | `string`  | Event start time (ISO 8601 format, typically 18:00 local time)
| **`end`**       | `string`  | Event end time (ISO 8601 format, typically 19:00 local time)
| **`flags`**     | `object`  | Content availability flags (see below)
| **`canBeShiny`**| `boolean` | Whether the featured raid boss can be shiny

### Flags Object

| Field                     | Type      | Description
|-------------------------- |---------- |---------------------
| **`hasSpawns`**           | `boolean` | Whether the event has wild spawns data
| **`hasFieldResearchTasks`** | `boolean` | Whether the event has field research tasks
| **`hasBonuses`**          | `boolean` | Whether the event has gameplay bonuses
| **`hasRaids`**            | `boolean` | Whether the event has raid data
| **`hasEggs`**             | `boolean` | Whether the event has egg pool changes
| **`hasShiny`**            | `boolean` | Whether the event has shiny debuts
| **`hasShowcases`**        | `boolean` | Whether the event has showcase data
| **`hasRocket`**           | `boolean` | Whether the event has Team GO Rocket data
| **`hasBattle`**           | `boolean` | Whether the event has GO Battle League data
| **`hasResearch`**         | `boolean` | Whether the event has research data
| **`hasRewards`**          | `boolean` | Whether the event has rewards data

## Additional Sections

Raid Hour events have this additional top-level field:

- **`canBeShiny`**: Whether the featured raid boss can be encountered as shiny



## Notes

- Raid Hour occurs weekly on Wednesdays at 6:00 PM local time
- Features the current 5-star raid boss
- Most Gyms will have the featured raid active during the hour
- Duration is always exactly 1 hour
- Great opportunity for Trainers to coordinate raid groups
