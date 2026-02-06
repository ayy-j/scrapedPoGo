# Endpoint

`https://pokemn.quest/data/eventTypes/raid-battles.min.json`

## Description

This file contains all Raid Battle rotation events. These events announce changes to the raid boss lineup, including 5-star Legendary raids, Mega raids, and Shadow raids.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-battles"`:

```json
[
  {
    "eventID": "mega-sceptile-in-mega-raids-january-2026",
    "name": "Mega Sceptile in Mega Raids",
    "eventType": "raid-battles",
    "heading": "Raid Battles",
    ...
  },
  {
    "eventID": "thundurus-incarnate-forme-in-5-star-raid-battles-january-2026",
    "name": "Thundurus (Incarnate Forme) in 5-star Raid Battles",
    "eventType": "raid-battles",
    "heading": "Raid Battles",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "mega-ampharos-in-mega-raids-january-2026",
  "name": "Mega Ampharos in Mega Raids",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://pokemn.quest/events/mega-default.jpg",
  "start": "2026-01-25T10:00:00.000",
  "end": "2026-02-04T10:00:00.000",
  "raids": [
    {
      "name": "Mega Ampharos",
      "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_181_51.png",
      "canBeShiny": true,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "shinies": [
    {
      "name": "Ampharos",
      "image": "https://pokemn.quest/pokemon_icons/pokemon_icon_181_00_shiny.png",
      "canBeShiny": true
    }
  ]
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the raid rotation
| **`name`**      | `string` | Name indicating featured raid boss and tier
| **`eventType`** | `string` | Always `"raid-battles"`
| **`heading`**   | `string` | Always `"Raid Battles"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Rotation start date/time (ISO 8601 format)
| **`end`**       | `string` | Rotation end date/time (ISO 8601 format)

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`raids`**     | `array`  | Array of raid boss objects with `name`, `image`, `canBeShiny`, `imageWidth`, `imageHeight`, `imageType`
| **`shinies`**   | `array`  | Array of shiny-eligible Pokemon objects
| **`raidAlternation`** | `string` | Rotation pattern description (if bosses alternate)
| **`raidFeaturedAttacks`** | `array` | Featured exclusive moves available during the event



## Notes

- Raid rotations typically change weekly or bi-weekly
- May feature Legendary, Mega, or Shadow raid bosses
- Different raid tiers (1-star, 3-star, 5-star, Mega, Shadow) have separate rotations
- Overlapping raid rotations are common (e.g., both a 5-star and Mega rotation active)
