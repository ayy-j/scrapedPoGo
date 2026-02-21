# Endpoint

`https://pokemn.quest/data/eventTypes/go-pass.min.json`

## Description

This file contains all GO Pass events. GO Pass is a recurring system where Trainers collect GO Points by completing tasks and rank up to earn rewards. Each GO Pass period has a free track and optional paid Deluxe/Deluxe+ tiers with additional rewards.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"go-pass"`:

```json
[
  {
    "eventID": "go-fest-example",
    "name": "Pokémon GO Fest Example",
    "eventType": "go-pass",
    "heading": "GO Pass Event",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "go-pass-february-2026",
  "name": "GO Pass: February",
  "eventType": "go-pass",
  "heading": "Go Pass",
  "image": "https://pokemn.quest/events/2026-02-03-go-pass-february-2026.jpg",
  "imageWidth": 640,
  "imageHeight": 360,
  "imageType": "jpg",
  "start": "2026-02-03T10:00:00.000",
  "end": "2026-03-03T10:00:00.000",
  "isGlobal": false,
  "eventStatus": "active",
  "pricing": {
    "deluxe": 7.99,
    "deluxePlus": 9.99
  },
  "pointTasks": {
    "daily": [],
    "weekly": [
      {
        "task": "Catch 75 Pokémon",
        "points": 200
      },
      {
        "task": "Win a raid",
        "points": 150
      },
      {
        "task": "Make 20 Great Throws",
        "points": 150
      }
    ],
    "bonus": []
  },
  "milestoneBonuses": {
    "free": [],
    "deluxe": []
  },
  "description": "Trainers will automatically receive GO Pass: February on Tuesday, February 3, at 10:00 a.m. local time. You can collect GO Points and rank up to get additional rewards through Tuesday, March 3, at 10:00 a.m. local time."
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the GO Pass event
| **`name`**         | `string`  | Name of the ticketed event
| **`eventType`**    | `string`  | Always `"go-pass"`
| **`heading`**      | `string`  | Always `"Go Pass"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Optional Fields

| Field               | Type     | Description
|-------------------- |--------- |---------------------
| **`pricing`**       | `object` | Pricing per tier. Keys are tier names (`deluxe`, `deluxePlus`), values are numeric USD prices (e.g., `{"deluxe": 7.99, "deluxePlus": 9.99}`)
| **`pointTasks`**    | `object` | Tasks to earn GO Points, grouped by cadence. Keys: `daily`, `weekly`, `bonus` — each an array of `{task, points}` objects
| **`milestoneBonuses`**| `object`| Rewards earned at point thresholds, grouped by tier. Keys: `free`, `deluxe` — each an array of milestone reward objects
| **`description`**   | `string` | Description of the GO Pass period and how to participate

## Additional Sections

GO Pass events may include detailed task and reward structures when scraped from event pages.



## Notes

- Every GO Pass has a free track; Deluxe and Deluxe+ tiers unlock additional milestone rewards
- `pointTasks` categories (`daily`, `weekly`, `bonus`) may be empty arrays when tasks have not yet been announced
- `milestoneBonuses` tiers (`free`, `deluxe`) may be empty arrays when rewards have not yet been announced
- Pricing values are numeric USD amounts (e.g., `7.99`), not formatted currency strings
