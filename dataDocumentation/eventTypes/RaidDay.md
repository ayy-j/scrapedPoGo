# Endpoint

`https://pokemn.quest/data/eventTypes/raid-day.min.json`

## Description

This file contains all Raid Day events. These are special events featuring a specific Pokémon in raids throughout the day, often with increased rewards and shiny chances.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-day"`:

```json
[
  {
    "eventID": "raid-day-example",
    "name": "Pokémon Raid Day",
    "eventType": "raid-day",
    "heading": "Raid Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "raid-day-february-2026",
  "name": "Raid Day",
  "eventType": "raid-day",
  "heading": "Raid Day",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-02-14T14:00:00.000",
  "end": "2026-02-14T17:00:00.000"
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Raid Day
| **`name`**      | `string` | Name including featured Pokémon
| **`eventType`** | `string` | Always `"raid-day"`
| **`heading`**   | `string` | Always `"Raid Day"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start time (ISO 8601 format)
| **`end`**       | `string` | Event end time (ISO 8601 format)

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | Featured Pokémon with `name`, `image`, `source`, `canBeShiny`
| **`bonuses`**   | `array`  | Active bonuses (extra Rare Candy, XP, etc.)
| **`raids`**     | `array`  | Featured raid boss details



## Notes

- Raid Days typically run for 3-6 hours
- Features one specific Pokémon in most or all raids
- Often includes increased shiny rates
- May offer additional rewards like Rare Candy XL
- Usually includes free Raid Passes from spinning Gyms
