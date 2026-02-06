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
  "image": "https://pokemn.quest/events/article-images/2025/2025-12-02-season-21-precious-paths/season-21-precious-paths.jpg",
  "start": "2025-12-02T10:00:00.000",
  "end": "2026-03-03T10:00:00.000",
  "eggs": {
    "1km": [{"name": "Bulbasaur", "image": "...", "canBeShiny": true}],
    "2km": [{"name": "Cleffa", "image": "...", "canBeShiny": true}],
    "5km": [{"name": "Munchlax", "image": "...", "canBeShiny": true}],
    "7km": [{"name": "Alolan Diglett", "image": "...", "canBeShiny": true}],
    "10km": [{"name": "Beldum", "image": "...", "canBeShiny": true}],
    "12km": [],
    "route": [{"name": "Hisuian Growlithe", "image": "...", "canBeShiny": true}],
    "adventure5km": [{"name": "Riolu", "image": "...", "canBeShiny": true}],
    "adventure10km": [{"name": "Gible", "image": "...", "canBeShiny": true}]
  },
  "bonuses": [
    {"text": "One additional Special Trade per day", "image": "https://pokemn.quest/events/bonuses/trade.png"}
  ],
  "research": {
    "breakthrough": [{"name": "Galarian Mr. Mime", "image": "...", "canBeShiny": true}],
    "masterwork": ["For US$7.99..."]
  },
  "communityDays": ["December 6\u20137 - December Community Day 2025", "January 18 - January Community Day"],
  "goBattleLeague": "The GO Battle League returns as part of Precious Paths!"
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

### Season-Specific Fields

| Field                | Type     | Description
|--------------------- |--------- |---------------------
| **`eggs`**           | `object` | Egg pools keyed by distance (`1km`, `2km`, `5km`, `7km`, `10km`, `12km`, `route`, `adventure5km`, `adventure10km`)
| **`bonuses`**        | `array`  | Season-long bonuses with `text` and `image` fields
| **`research`**       | `object` | Research with `breakthrough` (array of Pokemon) and `masterwork` (array of strings)
| **`communityDays`**  | `array`  | List of Community Days scheduled during the season
| **`goBattleLeague`** | `string` | Description of GO Battle League for the season



## Notes

- Seasons typically last approximately 3 months (one quarter)
- Define the overall theme and content for that period
- Include seasonal spawn changes, new Special Research, and themed events
- GO Battle League seasons align with these overall seasons
- May also include sub-events like "Season Event" which are special celebrations within the season
