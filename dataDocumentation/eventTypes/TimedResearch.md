# Endpoint

`https://pokemn.quest/data/eventTypes/timed-research.min.json`

## Description

This file contains all Timed Research events. Timed Research features time-limited research tasks that must be completed within a specific window, often with exclusive encounter rewards and sometimes requiring a ticket purchase.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"timed-research"`:

```json
[
  {
    "eventID": "timed-research-furfrou",
    "name": "Timed Research: Furfrou",
    "eventType": "timed-research",
    "heading": "Timed Research",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "timed-research-furfrou",
  "name": "Timed Research: Furfrou",
  "eventType": "timed-research",
  "heading": "Timed Research",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-01-15T10:00:00.000",
  "end": "2026-01-22T20:00:00.000",
  "description": "Complete timed research tasks to earn encounters with Furfrou.",
  "isPaid": false,
  "price": null,
  "tasks": [
    {
      "step": 1,
      "tasks": [
        { "task": "Catch 10 Pokémon", "reward": "Furfrou encounter" }
      ]
    }
  ],
  "rewards": ["Furfrou encounter", "5000 Stardust"],
  "encounters": [
    {
      "name": "Furfrou",
      "image": "https://pokemn.quest/pokemon/676-furfrou/pm676.icon.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 676,
      "imageWidth": 128,
      "imageHeight": 128,
      "imageType": "png"
    }
  ],
  "availability": {
    "start": "Friday, January 15, 10:00 a.m. local time",
    "end": "Thursday, January 22, 8:00 p.m. local time"
  }
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the Timed Research event
| **`name`**         | `string`  | Research event name (typically includes featured Pokémon)
| **`eventType`**    | `string`  | Always `"timed-research"`
| **`heading`**      | `string`  | Always `"Timed Research"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start time (ISO 8601 format)
| **`end`**          | `string`  | Event end time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Timed Research-Specific Fields

| Field              | Type          | Description
|------------------- |-------------- |---------------------
| **`description`**  | `string`      | Event description text
| **`isPaid`**       | `boolean`     | Whether this research requires a ticket purchase
| **`price`**        | `number\|null`| Ticket price in USD if paid, `null` otherwise
| **`tasks`**        | `array`       | Research task steps (may be individual tasks or step-grouped)
| **`rewards`**      | `array`       | List of reward descriptions
| **`encounters`**   | `array`       | Pokémon encounter rewards (see encounters[] Entry below)
| **`availability`** | `object`      | Human-readable availability window

### encounters[] Entry

| Field            | Type         | Description
|----------------- |------------- |---------------------
| **`name`**       | `string`     | Pokémon name
| **`image`**      | `string`     | Pokémon image URL (e.g., `https://pokemn.quest/pokemon/676-furfrou/pm676.icon.png`)
| **`altText`**    | `string`     | Accessible alt text for the image
| **`canBeShiny`** | `boolean`    | Whether this Pokémon can be shiny
| **`dexNumber`**  | `int\|null`  | National Pokédex number, or `null` if unavailable
| **`imageWidth`** | `int`        | Pokémon image width in pixels
| **`imageHeight`**| `int`        | Pokémon image height in pixels
| **`imageType`**  | `string`     | Image format (e.g., `"png"`)

### availability Object

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`start`** | `string` | Human-readable start date/time description
| **`end`**   | `string` | Human-readable end date/time description

## Scraper

Source: `src/pages/detailed/timedresearch.js`

Extracts research tasks via `extractResearchTasks(doc, 'timed')`, then iterates through page sections using `getSectionHeaders()` and `extractSection()` to find pricing info (via `extractPrice()`), date descriptions, encounter Pokémon, and list-based rewards.

## Notes

- Timed Research has a deadline — tasks must be completed before the event ends
- Some Timed Research events are free, others require a ticket purchase
- The `tasks` array may contain step-grouped tasks (with `step` and `tasks` sub-array) or flat task objects
- The `availability` field contains human-readable date descriptions parsed from the event page, separate from the ISO 8601 `start`/`end` fields
- This scraper is also used for `special-research` events which have the same data structure
