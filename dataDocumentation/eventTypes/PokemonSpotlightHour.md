# Endpoint

`https://pokemn.quest/data/eventTypes/pokemon-spotlight-hour.min.json`

## Description

This file contains all Pokémon Spotlight Hour events. These are weekly one-hour events featuring increased spawns of a specific Pokémon along with a gameplay bonus.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokemon-spotlight-hour"`:

```json
[
  {
    "eventID": "pokemonspotlighthour2026-01-27",
    "name": "Foongus Spotlight Hour",
    "eventType": "pokemon-spotlight-hour",
    "heading": "Pokemon Spotlight Hour",
    ...
  },
  {
    "eventID": "pokemonspotlighthour2026-02-03",
    "name": "Whismur Spotlight Hour",
    "eventType": "pokemon-spotlight-hour",
    "heading": "Pokemon Spotlight Hour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokemonspotlighthour2026-02-03",
  "name": "Whismur Spotlight Hour",
  "eventType": "pokemon-spotlight-hour",
  "heading": "Pokemon Spotlight Hour",
  "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_293_00.png",
  "start": "2026-02-03T18:00:00.000",
  "end": "2026-02-03T19:00:00.000",
  "canBeShiny": true,
  "bonus": "2× Catch Stardust"
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier (typically includes date: YYYY-MM-DD)
| **`name`**         | `string`  | Name of the featured Pokémon (e.g., "Foongus")
| **`eventType`**    | `string`  | Always `"pokemon-spotlight-hour"`
| **`heading`**      | `string`  | Always `"Pokemon Spotlight Hour"`
| **`image`**        | `string`  | Image URL of the featured Pokémon
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start time (ISO 8601 format, typically 18:00 local time)
| **`end`**          | `string`  | Event end time (ISO 8601 format, typically 19:00 local time)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

## Additional Sections

Spotlight Hour events have minimal structure with the core fields plus `canBeShiny` and `bonus` at the top level.



## Notes

- Spotlight Hour occurs weekly on Tuesdays at 6:00 PM local time
- Each event features one Pokémon with massively increased spawns
- Always includes one gameplay bonus (varies by week)
- Duration is always exactly 1 hour
