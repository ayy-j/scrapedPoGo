# Endpoint

`https://pokemn.quest/data/eventTypes/go-battle-league.min.json`

## Description

This file contains all GO Battle League season and cup rotation events. These events detail the competitive PvP seasons, cup schedules, and league rotations.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"go-battle-league"`:

```json
[
  {
    "eventID": "go-battle-league-season-example",
    "name": "GO Battle League Season Example",
    "eventType": "go-battle-league",
    "heading": "GO Battle League",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "gbl-precious-paths_great-league_ultra-league_master-league-split-3",
  "name": "Great League, Ultra League, and Master League | Precious Paths",
  "eventType": "go-battle-league",
  "heading": "Go Battle League",
  "image": "https://cdn.leekduck.com/assets/img/events/go-battle-league-season-25-precious-paths.jpg",
  "start": "2026-01-27T21:00:00.000Z",
  "end": "2026-02-03T21:00:00.000Z",
  "battle": {
    "leagues": [
      {
        "name": "Great League",
        "cpCap": 1500,
        "typeRestrictions": [],
        "rules": ["Pokémon must be at or below 1,500 CP to enter."]
      },
      {
        "name": "Ultra League",
        "cpCap": 2500,
        "typeRestrictions": [],
        "rules": ["Pokémon must be at or below 2,500 CP to enter."]
      },
      {
        "name": "Master League",
        "cpCap": null,
        "typeRestrictions": [],
        "rules": ["All Pokémon are eligible."]
      }
    ]
  }
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Battle League rotation
| **`name`**      | `string` | Name of the rotation (includes active leagues)
| **`eventType`** | `string` | Always `"go-battle-league"`
| **`heading`**   | `string` | Always `"Go Battle League"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Rotation start date/time (ISO 8601 format with Z suffix for UTC)
| **`end`**       | `string` | Rotation end date/time (ISO 8601 format with Z suffix for UTC)

### Battle Object

| Field                       | Type     | Description
|---------------------------- |--------- |---------------------
| **`battle.leagues`**        | `array`  | Array of active league objects
| **`battle.leagues[].name`** | `string` | League name (e.g., "Great League", "Ultra League", "Love Cup")
| **`battle.leagues[].cpCap`**| `int\|null` | Maximum CP allowed (1500, 2500, or null for unlimited)
| **`battle.leagues[].typeRestrictions`** | `array` | Required Pokémon types (empty for unrestricted)
| **`battle.leagues[].rules`**| `array`  | League-specific rules and restrictions



## Notes

- GO Battle League seasons typically align with in-game seasons (3 months)
- Each season features rotating cups with different CP limits and restrictions
- Great League, Ultra League, and Master League are standard rotations
