# Endpoint

`https://pokemn.quest/data/eventTypes/community-day.min.json`

## Description

This file contains all Community Day events. Community Days are monthly events featuring specific Pokémon with increased spawns, exclusive moves, and special bonuses.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"community-day"`:

```json
[
  {
    "eventID": "february-communityday2026",
    "name": "Vulpix Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  },
  {
    "eventID": "march-communityday2026",
    "name": "March Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "february-communityday2026",
  "name": "Vulpix Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2026/2026-02-01-february-communityday2026/vulpix-community-day-temp.jpg",
  "start": "2026-02-01T14:00:00.000",
  "end": "2026-02-01T17:00:00.000",
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
| **`eventID`**   | `string` | Unique identifier for the Community Day event
| **`name`**      | `string` | Name of the Community Day (typically includes featured Pokémon)
| **`eventType`** | `string` | Always `"community-day"`
| **`heading`**   | `string` | Always `"Community Day"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
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

Community Day events include a `details` object containing:

- **`pokemon`**: Array of featured Pokémon objects with `imageWidth`, `imageHeight`, `imageType`, `source`, and `canBeShiny` fields
- **`bonuses`**: Array of XP, Stardust, or other gameplay bonuses
- **`research`**: Special research tasks available during the event
- **`shinies`**: Array of shiny Pokémon available
- **`rewards`**: Event rewards and ticket information

## Notes

- Community Days typically run for 3 hours (14:00-17:00 local time)
- Events often feature exclusive moves for evolved Pokémon
- Community Day Classic events may also appear with this eventType
