# Endpoint

`https://pokemn.quest/data/eventTypes/max-battles.min.json`

## Description

This file contains all Max Battle events. Max Battles feature specific Dynamax Pokémon available for a limited time in Max Battle encounters.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"max-battles"`:

```json
[
  {
    "eventID": "max-battles-example",
    "name": "Dynamax Pokémon in Max Battles",
    "eventType": "max-battles",
    "heading": "Max Battles",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "max-battle-day-february-2026",
  "name": "Max Battle Day",
  "eventType": "max-battles",
  "heading": "Max Battles",
  "image": "https://cdn.leekduck.com/assets/img/events/events-default-img.jpg",
  "start": "2026-02-15T14:00:00.000",
  "end": "2026-02-15T17:00:00.000"
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Max Battle rotation
| **`name`**      | `string` | Name indicating featured Dynamax Pokémon
| **`eventType`** | `string` | Always `"max-battles"`
| **`heading`**   | `string` | Always `"Max Battles"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Rotation start date/time (ISO 8601 format)
| **`end`**       | `string` | Rotation end date/time (ISO 8601 format)

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | Featured Dynamax Pokémon objects
| **`bonuses`**   | `array`  | Active bonuses during the rotation



## Notes

- Max Battles rotate featured Dynamax Pokémon weekly or bi-weekly
- Different difficulty tiers may be available
- Requires Max Particles to participate
