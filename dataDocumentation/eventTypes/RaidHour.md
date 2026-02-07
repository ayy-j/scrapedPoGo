# Endpoint

`https://pokemn.quest/data/eventTypes/raid-hour.min.json`

## Description

This file contains all Raid Hour events. These are weekly one-hour events featuring a specific Legendary or powerful Pokémon in 5-star raids at most Gyms.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-hour"`:

```json
[
  {
    "eventID": "raidhour20260128",
    "name": "Tornadus (Incarnate Forme) Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    ...
  },
  {
    "eventID": "raidhour20260204",
    "name": "Landorus (Incarnate Forme) Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "raidhour20260204",
  "name": "Landorus (Incarnate Forme) Raid Hour",
  "eventType": "raid-hour",
  "heading": "Raid Hour",
  "image": "https://pokemn.quest/events/raidhour.jpg",
  "start": "2026-02-04T18:00:00.000",
  "end": "2026-02-04T19:00:00.000",
  "canBeShiny": true
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the event
| **`name`**         | `string`  | Event name
| **`eventType`**    | `string`  | Always `"raid-hour"`
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

Raid Hour events have minimal structure with the core fields and `canBeShiny` flag.



## Notes

- Raid Hour occurs weekly on Wednesdays at 6:00 PM local time
- Features the current 5-star raid boss
- Most Gyms will have the featured raid active during the hour
- Duration is always exactly 1 hour
- Great opportunity for Trainers to coordinate raid groups
