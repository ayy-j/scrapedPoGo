# Endpoint

`https://pokemn.quest/data/eventTypes/event.min.json`

## Description

This file contains all generic events. These are miscellaneous events that don't fit a specific category — including seasonal celebrations, holiday events, themed weekends, and other in-game happenings.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"event"`:

```json
[
  {
    "eventID": "winter-weekend-2026",
    "name": "Winter Weekend 2026",
    "eventType": "event",
    "heading": "Event",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "lunar-new-year-2026",
  "name": "Lunar New Year 2026",
  "eventType": "event",
  "heading": "Event",
  "image": "https://pokemn.quest/events/2026-02-17-lunar-new-year-2026.jpg",
  "imageWidth": 640,
  "imageHeight": 360,
  "imageType": "jpg",
  "start": "2026-02-17T10:00:00.000",
  "end": "2026-02-22T20:00:00.000",
  "isGlobal": false,
  "eventStatus": "ended",
  "bonuses": [
    {
      "text": "1/2 Egg Hatch Distance when Eggs are placed in an Incubator during the event period",
      "image": "https://pokemn.quest/bonuses/eggdistance.png",
      "imageWidth": 100,
      "imageHeight": 100,
      "imageType": "png",
      "multiplier": 0.5,
      "bonusType": "Egg Hatch Distance when Eggs are placed in an Incubator during the event period"
    }
  ],
  "shinies": [
    {
      "name": "Blitzle",
      "image": "https://pokemn.quest/pokemon/522-blitzle/pokemon_icon_522_00_shiny.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 522,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "pokemon": [
    {
      "name": "Ponyta",
      "image": "https://pokemn.quest/pokemon/077-ponyta/pokemon_icon_077_00.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 77,
      "source": "spawn",
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "customSections": {
    "field-research-task-rewards": {
      "paragraphs": ["Complete field research tasks to earn rewards."],
      "lists": [],
      "pokemon": [],
      "tables": []
    }
  }
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the event
| **`name`**         | `string`  | Event name
| **`eventType`**    | `string`  | Always `"event"`
| **`heading`**      | `string`  | Display heading for the event
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Event-Specific Fields

| Field                | Type     | Description
|--------------------- |--------- |---------------------
| **`bonuses`**        | `array`  | Event bonuses (see Bonus Entry below)
| **`shinies`**        | `array`  | Shiny Pokémon available during the event (see Pokémon Entry below)
| **`pokemon`**        | `array`  | Pokémon associated with the event, with a `source` field indicating spawn/debut/incense/etc. (see Pokémon Entry below)
| **`customSections`** | `object` | Dynamically named sections not matching known categories

### customSections Object

The `customSections` field captures page sections that don't match standard categories (bonuses, shinies, pokemon). Each key is the section ID from the page (e.g., `"field-research-task-rewards"`, `"collection-challenge"`), and each value has:

| Field            | Type    | Description
|----------------- |-------- |---------------------
| **`paragraphs`** | `array` | Text paragraphs from the section
| **`lists`**      | `array` | List items from the section (array of arrays)
| **`pokemon`**    | `array` | Pokémon extracted from the section
| **`tables`**     | `array` | Table data from the section (if present)

### Bonus Entry (in bonuses)

| Field            | Type              | Description
|----------------- |------------------ |---------------------
| **`text`**       | `string`          | Bonus description text
| **`image`**      | `string`          | Bonus icon image URL
| **`imageWidth`** | `int`             | Bonus icon width in pixels
| **`imageHeight`**| `int`             | Bonus icon height in pixels
| **`imageType`**  | `string`          | Bonus icon image format (e.g., `png`)
| **`multiplier`** | `number` (optional) | Numeric multiplier value (e.g., `0.5` for half, `2` for double)
| **`bonusType`**  | `string` (optional) | Bonus category description (the bonus text without the multiplier prefix)

### Pokémon Entry (in pokemon, shinies, customSections)

| Field            | Type         | Description
|----------------- |------------- |---------------------
| **`name`**       | `string`     | Pokémon name
| **`image`**      | `string`     | Pokémon image URL
| **`altText`**    | `string`     | Alt text for the image (may be empty)
| **`canBeShiny`** | `boolean`    | Whether this Pokémon can be shiny
| **`dexNumber`**  | `int\|null`  | National Pokédex number, or `null` if unavailable
| **`source`**     | `string`     | Origin of the Pokémon (e.g., `spawn`, `debut`, `incense`, `raid`); present on `pokemon` entries
| **`imageWidth`** | `int`        | Image width in pixels
| **`imageHeight`**| `int`        | Image height in pixels
| **`imageType`**  | `string`     | Image format (e.g., `png`)

## Scraper

Source: `src/pages/detailed/event.js`

Extracts bonuses via `extractBonuses(doc)`, then iterates through all page sections using `getSectionHeaders()` and `extractSection()`. Known section types (shiny, pokemon/spawns/wild) are placed in their specific fields; all other non-empty sections are stored in `customSections`.

## Notes

- The `"event"` type is the catch-all for events that don't match a more specific eventType
- `customSections` provides flexible access to event-specific content that varies widely between events
- After `combinedetails.js` processes the event, `customSections` is preserved at the top level
- The `pokemon` array is assembled by `segmentEventData()` from multiple source fields; each entry's `source` field indicates its origin (e.g., `spawn`, `debut`, `incense`)
- The generic scraper (`generic.js`) also runs for every event and may contribute additional fields
