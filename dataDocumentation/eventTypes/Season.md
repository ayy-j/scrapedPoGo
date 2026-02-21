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
  "image": "https://pokemn.quest/events/2025-12-02-season-21-precious-paths.jpg",
  "start": "2025-12-02T10:00:00.000",
  "end": "2026-03-03T10:00:00.000",
  "eggs": {
    "1km": [{"name": "Bulbasaur", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 1, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "2km": [{"name": "Cleffa", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 173, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "5km": [{"name": "Munchlax", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 446, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "7km": [{"name": "Alolan Diglett", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 50, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "10km": [{"name": "Beldum", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 374, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "12km": [],
    "route": [{"name": "Hisuian Growlithe", "image": "...", "altText": "", "canBeShiny": true, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "adventure5km": [{"name": "Riolu", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 447, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "adventure10km": [{"name": "Gible", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 443, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}]
  },
  "bonuses": [
    {"text": "One additional Special Trade per day", "image": "https://pokemn.quest/bonuses/trade.png", "imageWidth": 100, "imageHeight": 100, "imageType": "png"}
  ],
  "research": {
    "breakthrough": [{"name": "Galarian Mr. Mime", "image": "...", "altText": "", "canBeShiny": true, "dexNumber": 122, "imageWidth": 256, "imageHeight": 256, "imageType": "png"}],
    "masterwork": ["For US$7.99..."]
  },
  "communityDays": ["December 6\u20137 - December Community Day 2025", "January 18 - January Community Day"],
  "goBattleLeague": "The GO Battle League returns as part of Precious Paths!"
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the season
| **`name`**         | `string`  | Name of the season
| **`eventType`**    | `string`  | Always `"season"`
| **`heading`**      | `string`  | Display heading for the event
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Season-Specific Fields

| Field                | Type     | Description
|--------------------- |--------- |---------------------
| **`eggs`**           | `object` | Egg pools keyed by distance (`1km`, `2km`, `5km`, `7km`, `10km`, `12km`, `route`, `adventure5km`, `adventure10km`). Each pool is an array of Pokemon objects with `name`, `image`, `altText`, `canBeShiny`, `dexNumber`, `imageWidth`, `imageHeight`, `imageType`
| **`bonuses`**        | `array`  | Season-long bonuses with `text`, `image`, `imageWidth`, `imageHeight`, `imageType` fields
| **`research`**       | `object` | Research with `breakthrough` (array of Pokemon) and `masterwork` (array of strings)
| **`communityDays`**  | `array`  | List of Community Days scheduled during the season
| **`goBattleLeague`** | `string` | Description of GO Battle League for the season



## Notes

- Seasons typically last approximately 3 months (one quarter)
- Define the overall theme and content for that period
- Include seasonal spawn changes, new Special Research, and themed events
- GO Battle League seasons align with these overall seasons
- May also include sub-events like "Season Event" which are special celebrations within the season
