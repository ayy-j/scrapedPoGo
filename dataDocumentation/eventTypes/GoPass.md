# Endpoint

`https://pokemn.quest/data/eventTypes/go-pass.min.json`

## Description

This file contains all GO Pass events, which are special paid events requiring tickets for participation. These typically include GO Fest, Safari Zone, and other premium events.

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
  "eventID": "party-play-pass-paid-timed-research-february-2026",
  "name": "Party Play Pass",
  "eventType": "go-pass",
  "heading": "Go Pass",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-02-01T10:00:00.000",
  "end": "2026-02-03T20:00:00.000",
  "pricing": {
    "usd": "$2.99"
  },
  "pointTasks": [
    {
      "task": "Walk 1 km",
      "points": 5
    },
    {
      "task": "Catch 3 Pokémon with Party Play",
      "points": 15
    }
  ],
  "milestoneBonuses": [
    {
      "bonus": "3 Poké Balls",
      "points": 0
    },
    {
      "bonus": "500 Stardust",
      "points": 10
    }
  ],
  "description": "Party Play Pass holders will have access to special tasks and rewards."
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Pass event
| **`name`**      | `string` | Name of the ticketed event
| **`eventType`** | `string` | Always `"go-pass"`
| **`heading`**   | `string` | Always `"Go Pass"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)

### Optional Fields

| Field               | Type     | Description
|-------------------- |--------- |---------------------
| **`pricing`**       | `object` | Price in different currencies (e.g., `{"usd": "$2.99"}`)
| **`pointTasks`**    | `array`  | Tasks to earn points, each with `task` (string) and `points` (number)
| **`milestoneBonuses`**| `array`| Rewards at point thresholds, each with `bonus` (string) and `points` (number)
| **`description`**   | `string` | Full description of pass benefits

## Additional Sections

GO Pass events may include detailed task and reward structures when scraped from event pages.



## Notes

- GO Pass events require a purchased ticket to access exclusive features
- These are typically the largest events in Pokémon GO
- May include both in-person and global variants
- Often feature exclusive Special Research storylines
