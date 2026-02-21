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
  "eventID": "mega-sableye-in-mega-raids-february-2026",
  "name": "Mega Sableye in Mega Raids",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://pokemn.quest/events/mega-default.jpg",
  "imageWidth": 524,
  "imageHeight": 256,
  "imageType": "jpg",
  "start": "2026-02-16T10:00:00.000",
  "end": "2026-02-21T10:00:00.000",
  "isGlobal": false,
  "eventStatus": "active",
  "raids": [
    {
      "name": "Mega Sableye",
      "image": "https://pokemn.quest/pokemon/302-sableye/pokemon_icon_302_51.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 302,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "shinies": [
    {
      "name": "Sableye",
      "image": "https://pokemn.quest/pokemon/302-sableye/pokemon_icon_302_00_shiny.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 302,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ]
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the raid rotation
| **`name`**         | `string`  | Name indicating featured raid boss and tier
| **`eventType`**    | `string`  | Always `"raid-battles"`
| **`heading`**      | `string`  | Always `"Raid Battles"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Rotation start date/time (ISO 8601 format)
| **`end`**          | `string`  | Rotation end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `upcoming`, `active`, or `ended`

### Optional Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`raids`**     | `array`  | Array of raid boss objects with `name`, `image`, `altText`, `canBeShiny`, `dexNumber`, `imageWidth`, `imageHeight`, `imageType`
| **`shinies`**   | `array`  | Array of shiny-eligible Pokemon objects with `name`, `image`, `altText`, `canBeShiny`, `dexNumber`, `imageWidth`, `imageHeight`, `imageType`
| **`raidAlternation`** | `string` | Rotation pattern description (if bosses alternate)
| **`raidFeaturedAttacks`** | `array` | Featured exclusive moves available during the event



## Notes

- Raid rotations typically change weekly or bi-weekly
- May feature Legendary, Mega, or Shadow raid bosses
- Different raid tiers (1-star, 3-star, 5-star, Mega, Shadow) have separate rotations
- Overlapping raid rotations are common (e.g., both a 5-star and Mega rotation active)
