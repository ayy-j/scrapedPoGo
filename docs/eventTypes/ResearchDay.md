# Endpoint

`https://pokemn.quest/data/eventTypes/research-day.min.json`

## Description

This file contains all Research Day events. These are special events focusing on Field Research tasks, often featuring specific Pokémon encounters and rewards.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"research-day"`:

```json
[
  {
    "eventID": "research-day-example",
    "name": "Pokémon Research Day",
    "eventType": "research-day",
    "heading": "Research Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "clamperl-research-day-2026",
  "name": "Clamperl Research Day",
  "eventType": "research-day",
  "heading": "Research Day",
  "image": "https://cdn.leekduck.com/assets/img/events/research-day-clamperl.jpg",
  "start": "2026-02-22T11:00:00.000",
  "end": "2026-02-22T17:00:00.000",
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
| **`eventID`**   | `string` | Unique identifier for the Research Day
| **`name`**      | `string` | Name including featured Pokémon or theme
| **`eventType`** | `string` | Always `"research-day"`
| **`heading`**   | `string` | Always `"Research Day"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start time (ISO 8601 format)
| **`end`**       | `string` | Event end time (ISO 8601 format)
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

Research Day events typically have minimal additional data. When present, they may include:

- **`research`**: Event-specific Field Research tasks
- **`pokemon`**: Featured Pokémon with shiny availability
- **`bonuses`**: Active bonuses during the event

Note: Unlike other event types, Research Day events may not use the `details` wrapper structure consistently.



## Notes

- Research Days typically run for several hours (often 11:00-17:00)
- Features special Field Research tasks available from PokéStops
- Often focuses on one or a small group of Pokémon
- May include increased shiny rates for featured Pokémon
- Tasks are typically easy to complete
