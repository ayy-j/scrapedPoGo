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
  "image": "https://pokemn.quest/events/pokestop-showcases-default.jpg",
  "start": "2026-02-02T10:00:00.000",
  "end": "2026-02-04T20:00:00.000",
  "isGlobal": false,
  "eventStatus": "ended",
  "pokemon": [
    {
      "name": "Ludicolo",
      "image": "https://pokemn.quest/pokemon/272-ludicolo/pokemon_icon_272_00.png",
      "altText": "",
      "canBeShiny": false,
      "dexNumber": 272,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png",
      "source": "featured"
    }
  ],
  "description": "There will be PokéStop Showcases featuring Toucannon, Ludicolo, and Quaquaval."
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the showcase event
| **`name`**         | `string`  | Name including featured Pokémon
| **`eventType`**    | `string`  | Always `"pokestop-showcase"`
| **`heading`**      | `string`  | Display heading for the event
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | Featured Pokémon eligible for showcase (see Pokémon Item Fields below)
| **`description`**| `string`| Competition rules and details

### Pokémon Item Fields

Each object in the `pokemon` array has:

| Field              | Type          | Description
|------------------- |-------------- |---------------------
| **`name`**         | `string`      | Pokémon name (e.g., `"Ludicolo"`)
| **`image`**        | `string`      | Image URL for the Pokémon
| **`altText`**      | `string`      | Alt text for the image (may be empty)
| **`canBeShiny`**   | `boolean`     | Whether this Pokémon can be encountered as shiny
| **`dexNumber`**    | `int \| null` | National Pokédex number, or `null` if unavailable
| **`imageWidth`**   | `int`         | Image width in pixels
| **`imageHeight`**  | `int`         | Image height in pixels
| **`imageType`**    | `string`      | Image format (e.g., `"png"`)
| **`source`**       | `string`      | Source context (e.g., `"featured"`)



## Notes

- Showcases typically run for several days
- Trainers compete by entering their best Pokémon at participating PokéStops
- Winners are often determined by size (XS or XL)
- Rewards are given to winners and participants
