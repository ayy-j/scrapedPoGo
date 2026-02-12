# Endpoint

`https://pokemn.quest/data/eventTypes/research-breakthrough.min.json`

## Description

This file contains all Research Breakthrough events. Research Breakthroughs are recurring reward milestones awarded when trainers collect seven daily Field Research stamps. Each breakthrough period features specific Pokémon encounter rewards.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"research-breakthrough"`:

```json
[
  {
    "eventID": "research-breakthrough-jan-2026",
    "name": "Research Breakthrough: January 2026",
    "eventType": "research-breakthrough",
    "heading": "Research Breakthrough",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "research-breakthrough-jan-2026",
  "name": "Research Breakthrough: January 2026",
  "eventType": "research-breakthrough",
  "heading": "Research Breakthrough",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-01-01T13:00:00.000",
  "end": "2026-02-01T13:00:00.000",
  "name": "Furfrou",
  "canBeShiny": true,
  "image": "https://pokemn.quest/images/pokemon/pm676.png",
  "imageWidth": 128,
  "imageHeight": 128,
  "list": [
    {
      "name": "Furfrou",
      "image": "https://pokemn.quest/images/pokemon/pm676.png",
      "canBeShiny": true,
      "imageWidth": 128,
      "imageHeight": 128
    }
  ]
}
```

> **Note:** The breakthrough scraper `Object.assign`s its data directly onto the event, so fields like `name`, `image`, `canBeShiny`, and `list` appear at the top level.

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the Research Breakthrough period
| **`name`**         | `string`  | Breakthrough period name (may be overwritten by featured Pokémon name)
| **`eventType`**    | `string`  | Always `"research-breakthrough"`
| **`heading`**      | `string`  | Always `"Research Breakthrough"`
| **`image`**        | `string`  | Image URL (may be overwritten by featured Pokémon image)
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Breakthrough period start date (ISO 8601 format)
| **`end`**          | `string`  | Breakthrough period end date (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Breakthrough-Specific Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`canBeShiny`**   | `boolean` | Whether the featured breakthrough reward can be shiny
| **`imageWidth`**   | `int`     | Featured Pokémon image width in pixels
| **`imageHeight`**  | `int`     | Featured Pokémon image height in pixels
| **`list`**         | `array`   | Full list of possible breakthrough reward Pokémon

### list[] Entry

| Field            | Type      | Description
|----------------- |---------- |---------------------
| **`name`**       | `string`  | Pokémon name
| **`image`**      | `string`  | Pokémon image URL
| **`canBeShiny`** | `boolean` | Whether this Pokémon can be shiny
| **`imageWidth`** | `int`     | Image width in pixels
| **`imageHeight`**| `int`     | Image height in pixels

## Scraper

Source: `src/pages/detailed/breakthrough.js`

Extracts the featured breakthrough reward Pokémon from the `.pkmn-list-flex` container on the event page using `extractPokemonList()`.

## Notes

- Research Breakthrough periods typically last one month
- The `list` array contains all possible encounter rewards for the period
- The top-level `name` and `image` fields may be overwritten with the primary featured Pokémon's data
- Shiny availability is cross-referenced with the shinies dataset
