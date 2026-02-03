# Endpoint

`https://pokemn.quest/data/eventTypes/pokestop-showcase.min.json`

## Description

This file contains all PokéStop Showcase events. These are competitive events where Trainers can enter their Pokémon at PokéStops to compete based on size or other criteria.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokestop-showcase"`:

```json
[
  {
    "eventID": "pokestop-showcase-example",
    "name": "PokéStop Showcase: Pokémon Name",
    "eventType": "pokestop-showcase",
    "heading": "PokéStop Showcase",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "toucannon-ludicolo-quaquaval-showcase-february-2026",
  "name": "Toucannon, Ludicolo, and Quaquaval PokéStop Showcase",
  "eventType": "pokestop-showcase",
  "heading": "Pokestop Showcase",
  "image": "https://cdn.leekduck.com/assets/img/events/pokestop-showcases-default.jpg",
  "start": "2026-02-02T10:00:00.000",
  "end": "2026-02-04T20:00:00.000",
  "pokemon": [
    {
      "name": "Ludicolo",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_272_00.png",
      "canBeShiny": false,
      "source": "featured"
    }
  ],
  "description": "There will be PokéStop Showcases featuring Toucannon, Ludicolo, and Quaquaval."
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the showcase event
| **`name`**      | `string` | Name including featured Pokémon
| **`eventType`** | `string` | Always `"pokestop-showcase"`
| **`heading`**   | `string` | Always `"Pokestop Showcase"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | Featured Pokémon eligible for showcase with `name`, `image`, `canBeShiny`, `source`
| **`description`**| `string`| Competition rules and details



## Notes

- Showcases typically run for several days
- Trainers compete by entering their best Pokémon at participating PokéStops
- Winners are often determined by size (XS or XL)
- Rewards are given to winners and participants
