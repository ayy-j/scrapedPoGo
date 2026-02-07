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
  "eventID": "march-communityday2026",
  "name": "March Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://pokemn.quest/events/cd-default.jpg",
  "start": "2026-03-14T14:00:00.000",
  "end": "2026-03-14T17:00:00.000"
}
```

> **Note:** Detailed Community Day data (pokemon, bonuses, shinies) is populated by the detailed scraper when available.

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the Community Day event
| **`name`**         | `string`  | Name of the Community Day (typically includes featured Pokémon)
| **`eventType`**    | `string`  | Always `"community-day"`
| **`heading`**      | `string`  | Always `"Community Day"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Optional Fields (from detailed scraper)

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | Featured Pokémon with `name`, `image`, `source`, `canBeShiny`
| **`bonuses`**   | `array`  | Bonus objects with `text` and `image` fields
| **`shinies`**   | `array`  | Shiny Pokémon available during the event
| **`research`**  | `object` | Research tasks available during the event

## Notes

- Community Days typically run for 3 hours (14:00-17:00 local time)
- Events often feature exclusive moves for evolved Pokémon
- Community Day Classic events may also appear with this eventType
