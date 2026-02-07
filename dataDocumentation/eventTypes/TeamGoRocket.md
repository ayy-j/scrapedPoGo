# Endpoint

`https://pokemn.quest/data/eventTypes/team-go-rocket.min.json`

## Description

This file contains Team GO Rocket Takeover events. These are limited-time events featuring increased Team GO Rocket activity, new Shadow Pokémon, and special encounters.

> **Note:** This event type may be empty when no Rocket Takeover events are active. For current Team GO Rocket battle lineups (Grunts, Leaders, Giovanni), use `https://pokemn.quest/data/rocketLineups.min.json` instead.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"team-go-rocket"`:

```json
[
  {
    "eventID": "team-go-rocket-takeover-february-2026",
    "name": "Team GO Rocket Takeover",
    "eventType": "team-go-rocket",
    "heading": "Team GO Rocket",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "team-go-rocket-takeover-february-2026",
  "name": "Team GO Rocket Takeover",
  "eventType": "team-go-rocket",
  "heading": "Team GO Rocket",
  "image": "https://pokemn.quest/events/team-go-rocket-takeover.jpg",
  "start": "2026-02-15T00:00:00.000",
  "end": "2026-02-18T23:59:00.000"
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Rocket event
| **`name`**      | `string` | Name of the event (e.g., "Team GO Rocket Takeover")
| **`eventType`** | `string` | Always `"team-go-rocket"`
| **`heading`**   | `string` | Always `"Team GO Rocket"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`pokemon`**   | `array`  | New Shadow Pokémon available during the event
| **`bonuses`**   | `array`  | Active bonuses (e.g., increased Rocket spawns, TM effects)
| **`description`**| `string`| Event description text

## Notes

- Rocket Takeover events typically run for 3-5 days
- During these events, Team GO Rocket appears more frequently at PokéStops
- New Shadow Pokémon may debut during Takeover events
- Special Research featuring Giovanni often accompanies these events
