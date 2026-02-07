# Endpoint

`https://pokemn.quest/data/eventTypes/max-mondays.min.json`

## Description

This file contains all Max Monday events. Max Mondays are weekly events featuring special Dynamax Pokémon encounters or bonuses specifically on Mondays.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"max-mondays"`:

```json
[
  {
    "eventID": "max-monday-example",
    "name": "Max Monday",
    "eventType": "max-mondays",
    "heading": "Max Mondays",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "max-mondays-2026-02-02",
  "name": "Dynamax Wailmer during Max Monday",
  "eventType": "max-mondays",
  "heading": "Max Mondays",
  "image": "https://pokemn.quest/events/max-battles-kanto.jpg",
  "start": "2026-02-02T18:00:00.000",
  "end": "2026-02-02T19:00:00.000",
  "bonus": "February 2, 2026"
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the event
| **`name`**         | `string`  | Event name
| **`eventType`**    | `string`  | Always `"max-mondays"`
| **`heading`**      | `string`  | Display heading for the event
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

## Additional Sections

Max Monday events have this additional top-level field:

- **`bonus`**: Information about the event date or special bonus



## Notes

- Max Mondays occur weekly on Mondays
- May feature increased Max Particle spawns
- Often includes special bonuses for Max Battles
