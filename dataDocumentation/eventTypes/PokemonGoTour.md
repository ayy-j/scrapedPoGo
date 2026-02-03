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
  "heading": "Pokemon GO Tour",
  "image": "https://cdn.leekduck.com/assets/img/events/pogo-tour-kalos.jpg",
  "start": "2026-02-20T09:00:00.000",
  "end": "2026-02-22T17:00:00.000",
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
      "name": "Chespin",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_650_00.png",
      "canBeShiny": true,
      "source": "spawn"
    }
  ],
  "eggs": {
    "2km": [...],
    "5km": [...],
    "7km": [...],
    "10km": [...]
  },
  "exclusiveBonuses": ["Attendees will receive the following bonuses..."],
  "rewards": {
    "ticketAddOns": [...]
  },
  "shinies": [...],
  "shinyDebuts": [...],
  "whatsNew": ["For the first time in Pokémon GO, Trainers will be able to encounter Shiny Diancie!"],
  "sales": ["A limited number of Pokémon GO Tour: Kalos T-shirts will be available..."]
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Tour event
| **`name`**      | `string` | Name of the GO Tour (typically includes region/theme)
| **`eventType`** | `string` | Always `"pokemon-go-tour"`
| **`heading`**   | `string` | Always `"Pokemon GO Tour"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)

### Optional Fields

| Field               | Type     | Description
|-------------------- |--------- |---------------------
| **`eventInfo`**     | `object` | Event metadata with `name`, `location`, `dates`, `time`, `ticketPrice`, `ticketUrl`
| **`pokemon`**       | `array`  | Featured Pokémon with `name`, `image`, `canBeShiny`, `source`
| **`eggs`**          | `object` | Egg pools by distance key (`2km`, `5km`, `7km`, `10km`, `adventure5km`, `adventure10km`, `route`)
| **`exclusiveBonuses`**| `array`| Text descriptions of ticket holder bonuses
| **`rewards`**       | `object` | Reward categories (e.g., `ticketAddOns`)
| **`shinies`**       | `array`  | Pokémon available as shiny during the event
| **`shinyDebuts`**   | `array`  | New shiny Pokémon debuting at the event
| **`whatsNew`**      | `array`  | Announcement text about new features
| **`sales`**         | `array`  | Merchandise and special offers available



## Notes

- GO Tour events typically feature Pokémon from a specific generation or region
- Usually requires a ticket for full access to features
- May have both in-person and global components
- Often includes version-exclusive spawns (Gold vs. Silver tickets, etc.)
