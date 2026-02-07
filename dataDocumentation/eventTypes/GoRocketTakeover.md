# Endpoint

`https://pokemn.quest/data/eventTypes/go-rocket-takeover.min.json`

## Description

This file contains all GO Rocket Takeover events. These are large-scale Team GO Rocket events where Rocket activity increases globally, featuring new Shadow Pokémon, updated leader lineups, Giovanni encounters, and event-specific bonuses.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"go-rocket-takeover"`:

```json
[
  {
    "eventID": "team-go-rocket-takeover-jan-2026",
    "name": "Team GO Rocket Takeover",
    "eventType": "go-rocket-takeover",
    "heading": "GO Rocket Takeover",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "team-go-rocket-takeover-jan-2026",
  "name": "Team GO Rocket Takeover",
  "eventType": "go-rocket-takeover",
  "heading": "GO Rocket Takeover",
  "image": "https://pokemn.quest/events/rocket-default.jpg",
  "start": "2026-01-25T00:00:00.000",
  "end": "2026-01-29T20:00:00.000",
  "shadowPokemon": [
    {
      "name": "Shadow Beldum",
      "image": "https://pokemn.quest/images/pokemon/pm374.png",
      "canBeShiny": true
    }
  ],
  "leaders": {
    "arlo": [],
    "cliff": [],
    "sierra": []
  },
  "giovanni": [
    {
      "name": "Shadow Lugia",
      "image": "https://pokemn.quest/images/pokemon/pm249.png",
      "canBeShiny": false
    }
  ],
  "grunts": [],
  "bonuses": ["2× Stardust from Rocket battles"],
  "specialResearch": ["Defeat 5 Team GO Rocket Grunts"]
}
```

> **Note:** The takeover scraper `Object.assign`s its data directly onto the event, so Rocket-specific fields appear at the top level alongside core event fields.

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the Takeover event
| **`name`**         | `string`  | Event name
| **`eventType`**    | `string`  | Always `"go-rocket-takeover"`
| **`heading`**      | `string`  | Always `"GO Rocket Takeover"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Rocket Takeover-Specific Fields

| Field                | Type     | Description
|--------------------- |--------- |---------------------
| **`shadowPokemon`**  | `array`  | Shadow Pokémon available during the takeover
| **`leaders`**        | `object` | Leader-specific lineups with `arlo`, `cliff`, `sierra` arrays
| **`giovanni`**       | `array`  | Giovanni's lineup and info (Pokémon objects or `{ info: string }`)
| **`grunts`**         | `array`  | Grunt Pokémon available
| **`bonuses`**        | `array`  | Event bonus descriptions (strings)
| **`specialResearch`**| `array`  | Special research task descriptions (strings)

### leaders Object

| Field        | Type    | Description
|------------- |-------- |---------------------
| **`arlo`**   | `array` | Arlo's Pokémon lineup
| **`cliff`**  | `array` | Cliff's Pokémon lineup
| **`sierra`** | `array` | Sierra's Pokémon lineup

### Pokémon Entry (in shadowPokemon, leaders, giovanni, grunts)

| Field            | Type      | Description
|----------------- |---------- |---------------------
| **`name`**       | `string`  | Pokémon name
| **`image`**      | `string`  | Pokémon image URL
| **`canBeShiny`** | `boolean` | Whether this Pokémon can be shiny

## Scraper

Source: `src/pages/detailed/teamgorocket.js`

Iterates through page sections using `getSectionHeaders()` and `extractSection()`, matching section IDs containing keywords like `shadow`, `arlo`, `cliff`, `sierra`, `giovanni`, `grunt`, `bonus`, and `research`. Also checks for `.lineup-pokemon` and `.shadow-pokemon-list` containers.

## Notes

- GO Rocket Takeover events are distinct from the regular `team-go-rocket` eventType, which covers ongoing Rocket rotations
- Giovanni's array may contain both Pokémon objects and `{ info: string }` descriptive entries
- The `bonuses` field here contains string descriptions, not the structured `{ text, image }` bonus objects used in other event types
- After `combinedetails.js` processes the event, `segmentEventData()` may reorganize some fields under a `rocket` object (`rocket.shadows`, `rocket.leaders`, `rocket.giovanni`, `rocket.grunts`)
