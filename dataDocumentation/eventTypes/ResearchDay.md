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
  "eventID": "research-day-march-2026",
  "name": "Research Day",
  "eventType": "research-day",
  "heading": "Research Day",
  "image": "https://cdn.leekduck.com/assets/img/events/events-default-img.jpg",
  "start": "2026-03-21T14:00:00.000",
  "end": "2026-03-21T17:00:00.000",
  "description": "",
  "isPaid": false,
  "price": null,
  "tasks": [],
  "rewards": [],
  "encounters": [],
  "availability": {
    "start": "",
    "end": ""
  },
  "hasSpawns": false,
  "hasFieldResearchTasks": false,
  "hasBonuses": false,
  "hasRaids": false,
  "hasEggs": false,
  "hasShiny": false
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

### Optional Fields

| Field           | Type      | Description
|---------------- |---------- |---------------------
| **`description`**| `string` | Event description text
| **`isPaid`**    | `boolean` | Whether the event requires payment
| **`price`**     | `string\|null` | Ticket price if paid event
| **`tasks`**     | `array`   | Research tasks available
| **`rewards`**   | `array`   | Event rewards
| **`encounters`**| `array`   | Encounter Pokémon
| **`availability`** | `object` | Availability window with `start` and `end`

### Content Flags (flat at top level)

| Field                     | Type      | Description
|-------------------------- |---------- |---------------------
| **`hasSpawns`**           | `boolean` | Whether the event has wild spawns data
| **`hasFieldResearchTasks`** | `boolean` | Whether the event has field research tasks
| **`hasBonuses`**          | `boolean` | Whether the event has gameplay bonuses
| **`hasRaids`**            | `boolean` | Whether the event has raid data
| **`hasEggs`**             | `boolean` | Whether the event has egg pool changes
| **`hasShiny`**            | `boolean` | Whether the event has shiny debuts

Note: Unlike other event types, Research Day events may not use the `details` wrapper structure consistently.



## Notes

- Research Days typically run for several hours (often 11:00-17:00)
- Features special Field Research tasks available from PokéStops
- Often focuses on one or a small group of Pokémon
- May include increased shiny rates for featured Pokémon
- Tasks are typically easy to complete
