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
  "eventID": "winter-weekend-2026",
  "name": "Winter Weekend 2026",
  "eventType": "event",
  "heading": "Event",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-12-19T10:00:00.000",
  "end": "2026-12-22T20:00:00.000",
  "bonuses": [
    { "text": "2× XP for catching Pokémon", "image": "https://..." }
  ],
  "bonusDisclaimers": [],
  "features": ["Ice-type Pokémon appearing more frequently in the wild"],
  "shinies": [
    {
      "name": "Snom",
      "image": "https://pokemn.quest/images/pokemon/pm872.png",
      "canBeShiny": true
    }
  ],
  "spawns": [
    {
      "name": "Snover",
      "image": "https://pokemn.quest/images/pokemon/pm459.png",
      "canBeShiny": true
    }
  ],
  "customSections": {
    "featured-pokemon": {
      "paragraphs": ["These Pokémon will appear more frequently in the wild."],
      "lists": [],
      "pokemon": [...]
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
| **`bonuses`**        | `array`  | Event bonuses as objects with `text` and `image` fields
| **`bonusDisclaimers`** | `array`| Bonus disclaimers/restrictions (strings)
| **`features`**       | `array`  | Event feature descriptions (strings)
| **`shinies`**        | `array`  | Shiny Pokémon available during the event
| **`spawns`**         | `array`  | Wild Pokémon spawns
| **`customSections`** | `object` | Dynamically named sections not matching known categories

### customSections Object

The `customSections` field captures page sections that don't match standard categories (bonuses, shinies, spawns, features). Each key is the section ID from the page (e.g., `"featured-pokemon"`, `"7km-eggs"`), and each value has:

| Field            | Type    | Description
|----------------- |-------- |---------------------
| **`paragraphs`** | `array` | Text paragraphs from the section
| **`lists`**      | `array` | List items from the section (array of arrays)
| **`pokemon`**    | `array` | Pokémon extracted from the section
| **`tables`**     | `array` | Table data from the section (if present)

### Pokémon Entry (in shinies, spawns, customSections)

| Field            | Type      | Description
|----------------- |---------- |---------------------
| **`name`**       | `string`  | Pokémon name
| **`image`**      | `string`  | Pokémon image URL
| **`canBeShiny`** | `boolean` | Whether this Pokémon can be shiny

## Scraper

Source: `src/pages/detailed/event.js`

Extracts bonuses via `extractBonuses(doc)`, then iterates through all page sections using `getSectionHeaders()` and `extractSection()`. Known section types (shiny, features, spawns/wild) are placed in their specific fields; all other non-empty sections are stored in `customSections`.

## Notes

- The `"event"` type is the catch-all for events that don't match a more specific eventType
- `customSections` provides flexible access to event-specific content that varies widely between events
- After `combinedetails.js` processes the event, `customSections` is preserved at the top level
- The `spawns` field here is separate from the `pokemon` array — spawns come from sections matching "spawns" or "wild", while `pokemon` is assembled by `segmentEventData()` from multiple source fields
- The generic scraper (`generic.js`) also runs for every event and may contribute additional fields
