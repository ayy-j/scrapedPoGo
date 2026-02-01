# Endpoint

`https://pokemn.quest/data/eventTypes/season.min.json`

## Description

This file contains all Season events. Seasons are the longest-running events in Pokémon GO, typically lasting 3 months and defining the overall theme and content for that period.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"season"`:

```json
[
  {
    "eventID": "season-21-precious-paths",
    "name": "Precious Paths",
    "eventType": "season",
    "heading": "Season",
    ...
  },
  {
    "eventID": "season-event-march-2026",
    "name": "Season Event",
    "eventType": "season",
    "heading": "Season",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "season-21-precious-paths",
  "name": "Precious Paths",
  "eventType": "season",
  "heading": "Season",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2025/2025-12-02-season-21-precious-paths/season-21-precious-paths.jpg",
  "start": "2025-12-02T10:00:00.000",
  "end": "2026-03-03T10:00:00.000",
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
| **`eventID`**   | `string` | Unique identifier for the season
| **`name`**      | `string` | Name of the season
| **`eventType`** | `string` | Always `"season"`
| **`heading`**   | `string` | Always `"Season"`
| **`image`**     | `string` | Season header/thumbnail image URL
| **`start`**     | `string` | Season start date/time (ISO 8601 format)
| **`end`**       | `string` | Season end date/time (ISO 8601 format)
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

Season events include a `details` object containing:

- **`pokemon`**: Array of featured Pokémon objects with `imageWidth`, `imageHeight`, `imageType`, and `canBeShiny` fields
- **`bonuses`**: Season-long active bonuses
- **`research`**: Season of Special Research
- **`raids`**: Featured raid rotations
- **`eggs`**: Seasonal egg pool changes organized by egg type
- **`customSections`**: Additional season-specific content



## Notes

- Seasons typically last approximately 3 months (one quarter)
- Define the overall theme and content for that period
- Include seasonal spawn changes, new Special Research, and themed events
- GO Battle League seasons align with these overall seasons
- May also include sub-events like "Season Event" which are special celebrations within the season
