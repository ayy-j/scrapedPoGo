# Endpoint

`https://pokemn.quest/data/eventTypes/pokemon-go-tour.min.json`

## Description

This file contains all Pokémon GO Tour events. These are major annual events featuring a specific region or theme, typically requiring tickets for full access.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokemon-go-tour"`:

```json
[
  {
    "eventID": "pokemon-go-tour-example",
    "name": "Pokémon GO Tour: Region",
    "eventType": "pokemon-go-tour",
    "heading": "Pokémon GO Tour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokemon-go-tour-kalos-tainan-2026",
  "name": "Pokémon GO Tour: Kalos - Tainan 2026",
  "eventType": "pokemon-go-tour",
  "heading": "Pokemon Go Tour",
  "image": "https://pokemn.quest/events/2026-02-20-pokemon-go-tour-kalos-tainan-2026.jpg",
  "imageWidth": 640,
  "imageHeight": 360,
  "imageType": "jpg",
  "start": "2026-02-20T01:00:00.000Z",
  "end": "2026-02-22T09:00:00.000Z",
  "isGlobal": true,
  "eventStatus": "active",
  "eventInfo": {
    "name": "Pokémon GO Tour: Kalos - Tainan 2026",
    "location": "<strong></strong> Tainan Metropolitan Park, Tainan, Taiwan",
    "dates": "<strong></strong> February 20–22, 2026",
    "time": "<strong></strong> 9:00 a.m. – 5:00 p.m. GMT+8",
    "ticketPrice": 733,
    "ticketUrl": ""
  },
  "pokemon": [
    {
      "name": "Unown A",
      "image": "https://pokemn.quest/pokemon/201-unown/pokemon_icon_201_11.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 201,
      "source": "incense",
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "raids": [
    {
      "name": "Honedge",
      "image": "https://pokemn.quest/pokemon/679-honedge/pokemon_icon_679_00.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 679,
      "tier": "1-Star",
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "eggs": {
    "1km": [],
    "2km": [
      {
        "name": "Larvitar",
        "image": "https://pokemn.quest/pokemon/246-larvitar/pokemon_icon_246_00.png",
        "altText": "",
        "canBeShiny": true,
        "dexNumber": 246,
        "imageWidth": 256,
        "imageHeight": 256,
        "imageType": "png"
      }
    ],
    "5km": [...],
    "7km": [],
    "10km": [...],
    "12km": [],
    "route": [],
    "adventure5km": [],
    "adventure10km": []
  },
  "exclusiveBonuses": ["Attendees will receive the following bonuses..."],
  "shinies": [
    {
      "name": "Honedge",
      "image": "https://pokemn.quest/pokemon/679-honedge/pokemon_icon_679_00_shiny.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 679,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "shinyDebuts": [...],
  "branchingResearch": {
    "description": ["During Pokémon GO Tour: Kalos – Global, ticket-holding Trainers will be able to pick between two Special Research paths..."],
    "paths": [
      {
        "name": "X Version",
        "details": ["Receive Xerneas-themed Special Research rewards..."]
      }
    ]
  },
  "eventLocations": [
    {
      "name": "Los Angeles",
      "url": "/events/pokemon-go-tour-kalos-los-angeles-2026/"
    }
  ],
  "eventTags": ["Pokémon GO Tour", "Ticketed Event"],
  "costumedPokemon": [
    {
      "description": "Pikachu wearing Calem's hat"
    }
  ],
  "megaDebuts": ["Mega Victreebel", "Mega Malamar"],
  "specialBackgrounds": ["Trainers who participate in raids during Pokémon GO Tour: Kalos – Global will have a chance of receiving new Special Backgrounds..."],
  "furfrou": [
    {
      "region": "In the United States:",
      "pokemon": [
        {
          "name": "Furfrou (Star)",
          "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pm676.fSTAR.icon.png",
          "altText": "",
          "canBeShiny": false,
          "imageWidth": 256,
          "imageHeight": 256,
          "imageType": "png"
        }
      ]
    }
  ]
}
```

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the GO Tour event
| **`name`**         | `string`  | Name of the GO Tour (typically includes region/theme)
| **`eventType`**    | `string`  | Always `"pokemon-go-tour"`
| **`heading`**      | `string`  | Always `"Pokemon GO Tour"`
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
| **`eventInfo`**     | `object` | Event metadata with `name`, `location`, `dates`, `time`, `ticketPrice`, `ticketUrl`
| **`pokemon`**       | `array`  | Featured Pokémon (see Pokemon Item fields below)
| **`raids`**         | `array`  | Raid bosses available during the event (see Raid Item fields below)
| **`eggs`**          | `object` | Egg pools by distance key (`1km`, `2km`, `5km`, `7km`, `10km`, `12km`, `adventure5km`, `adventure10km`, `route`). Each value is an array of Pokémon items (see Pokemon Item fields below, without `source`)
| **`exclusiveBonuses`**| `array`| Text descriptions of ticket holder bonuses
| **`rewards`**       | `object` | Reward categories (e.g., `ticketAddOns`)
| **`shinies`**       | `array`  | Pokémon available as shiny during the event (same fields as Pokemon Items without `source`)
| **`shinyDebuts`**   | `array`  | New shiny Pokémon debuting at the event (same fields as Pokemon Items without `source`)
| **`whatsNew`**      | `array`  | Announcement text about new features
| **`sales`**         | `array`  | Merchandise and special offers available
| **`branchingResearch`** | `object` | Branching Special Research with `description` (array of strings) and `paths` (array of `{ name, details }` objects)
| **`eventLocations`** | `array` | Related event locations with `name` and `url`
| **`eventTags`**     | `array`  | Tags categorizing the event (e.g., `"Pokémon GO Tour"`, `"Ticketed Event"`)
| **`costumedPokemon`** | `array` | Costumed Pokémon with `description` string
| **`megaDebuts`**    | `array`  | Names of Mega Evolutions debuting at the event
| **`specialBackgrounds`** | `array` | Descriptions of special backgrounds available during the event
| **`furfrou`**       | `array`  | Regional Furfrou trim availability. Each item has `region` (string) and `pokemon` (array of Pokémon items without `source`)

### Pokemon Item Fields

| Field              | Type          | Description
|------------------- |-------------- |---------------------
| **`name`**         | `string`      | Pokémon name
| **`image`**        | `string`      | Image URL (e.g., `https://pokemn.quest/pokemon/201-unown/pokemon_icon_201_11.png`)
| **`altText`**      | `string`      | Alt text for the image
| **`canBeShiny`**   | `boolean`     | Whether the Pokémon can be shiny
| **`dexNumber`**    | `int\|null`   | National Pokédex number, or `null` if not determinable
| **`source`**       | `string`      | How the Pokémon is encountered (e.g., `"incense"`, `"spawn"`, `"raid"`)
| **`imageWidth`**   | `int`         | Image width in pixels
| **`imageHeight`**  | `int`         | Image height in pixels
| **`imageType`**    | `string`      | Image format (e.g., `"png"`)

### Raid Item Fields

| Field              | Type          | Description
|------------------- |-------------- |---------------------
| **`name`**         | `string`      | Raid boss name
| **`image`**        | `string`      | Image URL (e.g., `https://pokemn.quest/pokemon/679-honedge/pokemon_icon_679_00.png`)
| **`altText`**      | `string`      | Alt text for the image
| **`canBeShiny`**   | `boolean`     | Whether the raid boss can be shiny
| **`dexNumber`**    | `int\|null`   | National Pokédex number, or `null` if not determinable
| **`tier`**         | `string`      | Raid tier (e.g., `"1-Star"`, `"3-Star"`, `"5-Star"`, `"Mega"`)
| **`imageWidth`**   | `int`         | Image width in pixels
| **`imageHeight`**  | `int`         | Image height in pixels
| **`imageType`**    | `string`      | Image format (e.g., `"png"`)



## Notes

- GO Tour events typically feature Pokémon from a specific generation or region
- Usually requires a ticket for full access to features
- May have both in-person and global components
- Often includes version-exclusive spawns (Gold vs. Silver tickets, etc.)
