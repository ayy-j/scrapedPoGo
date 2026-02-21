# Endpoint

`https://pokemn.quest/data/eventTypes/community-day.min.json`

## Description

This file contains all Community Day events. Community Days are monthly events featuring specific Pokémon with increased spawns, exclusive moves, and special bonuses.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"community-day"`:

```json
[
  {
    "eventID": "february-communityday2026",
    "name": "Vulpix Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  },
  {
    "eventID": "march-communityday2026",
    "name": "March Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "march-communityday2026",
  "name": "Scorbunny Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://pokemn.quest/events/2026-03-14-march-communityday2026.jpg",
  "imageWidth": 640,
  "imageHeight": 360,
  "imageType": "jpg",
  "start": "2026-03-14T14:00:00.000",
  "end": "2026-03-14T17:00:00.000",
  "isGlobal": false,
  "eventStatus": "upcoming",
  "pokemon": [
    {
      "name": "Scorbunny",
      "image": "https://pokemn.quest/pokemon/813-scorbunny/pm813.icon.png",
      "altText": "",
      "canBeShiny": true,
      "dexNumber": 813,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png",
      "source": "spawn"
    }
  ],
  "bonuses": [
    {
      "text": "2x Catch Candy",
      "image": "https://pokemn.quest/bonuses/candy.png",
      "imageWidth": 100,
      "imageHeight": 100,
      "imageType": "png",
      "multiplier": 2,
      "bonusType": "Catch Candy"
    }
  ],
  "bonusDisclaimers": [
    "* While most bonuses are only active during the three hours of the event..."
  ],
  "shinies": [
    {
      "name": "Scorbunny",
      "image": "https://pokemn.quest/pokemon/813-scorbunny/pm813.s.icon.png",
      "altText": "",
      "canBeShiny": false,
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ],
  "rewards": {
    "ticketedResearch": {
      "price": 2,
      "description": ""
    }
  },
  "research": { }
}
```

> **Note:** Detailed Community Day data (pokemon, bonuses, shinies, research, rewards) is populated by the detailed scraper when available.

## Fields

### Core Fields

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`eventID`**      | `string`  | Unique identifier for the Community Day event
| **`name`**         | `string`  | Name of the Community Day (typically includes featured Pokémon)
| **`eventType`**    | `string`  | Always `"community-day"`
| **`heading`**      | `string`  | Always `"Community Day"`
| **`image`**        | `string`  | Event header/thumbnail image URL
| **`imageWidth`**   | `int`     | Event banner image width in pixels
| **`imageHeight`**  | `int`     | Event banner image height in pixels
| **`imageType`**    | `string`  | Event banner image format (e.g., `jpg`, `png`)
| **`start`**        | `string`  | Event start date/time (ISO 8601 format)
| **`end`**          | `string`  | Event end date/time (ISO 8601 format)
| **`isGlobal`**     | `boolean` | Whether the event uses a global start time (no local timezone offset)
| **`eventStatus`**  | `string`  | Computed status: `"upcoming"`, `"active"`, or `"ended"`

### Optional Fields (from detailed scraper)

| Field                  | Type     | Description
|----------------------- |--------- |---------------------
| **`pokemon`**          | `array`  | Featured Pokémon (see [Pokemon Item Fields](#pokemon-item-fields) below)
| **`bonuses`**          | `array`  | Bonus objects (see [Bonus Item Fields](#bonus-item-fields) below)
| **`bonusDisclaimers`** | `array`  | Array of disclaimer strings for event bonuses (e.g., asterisk footnotes explaining bonus durations)
| **`shinies`**          | `array`  | Shiny Pokémon available during the event (see [Shinies Item Fields](#shinies-item-fields) below)
| **`rewards`**          | `object` | Event rewards / ticketed research info (see [Rewards Fields](#rewards-fields) below)
| **`research`**         | `object` | Research tasks available during the event

### Pokemon Item Fields

Each item in the `pokemon` array has:

| Field              | Type         | Description
|------------------- |------------- |---------------------
| **`name`**         | `string`     | Pokémon name
| **`image`**        | `string`     | Pokémon image URL (e.g., `https://pokemn.quest/pokemon/813-scorbunny/pm813.icon.png`)
| **`altText`**      | `string`     | Accessible alt text for the image
| **`source`**       | `string`     | Where the Pokémon appears (e.g., `"spawn"`, `"featured"`, `"raid"`, `"egg"`, `"research"`)
| **`canBeShiny`**   | `boolean`    | Whether the Pokémon can be shiny during this event
| **`dexNumber`**    | `int\|null`  | National Pokédex number, or `null` if unavailable
| **`imageWidth`**   | `int`        | Pokémon image width in pixels
| **`imageHeight`**  | `int`        | Pokémon image height in pixels
| **`imageType`**    | `string`     | Image format (e.g., `"png"`)

### Bonus Item Fields

Each item in the `bonuses` array has:

| Field              | Type              | Description
|------------------- |------------------ |---------------------
| **`text`**         | `string`          | Bonus description text (e.g., `"2x Catch Candy"`)
| **`image`**        | `string`          | Bonus icon image URL (e.g., `https://pokemn.quest/bonuses/candy.png`)
| **`imageWidth`**   | `int`             | Bonus icon width in pixels
| **`imageHeight`**  | `int`             | Bonus icon height in pixels
| **`imageType`**    | `string`          | Bonus icon format (e.g., `"png"`)
| **`multiplier`**   | `number` optional | Parsed numeric multiplier (e.g., `2` for "2x"). Only present when the bonus text contains a multiplier.
| **`bonusType`**    | `string` optional | Parsed bonus category (e.g., `"Catch Candy"`, `"XP"`, `"Stardust"`). Only present when a multiplier is detected.

### Shinies Item Fields

Each item in the `shinies` array has:

| Field              | Type      | Description
|------------------- |---------- |---------------------
| **`name`**         | `string`  | Pokémon name
| **`image`**        | `string`  | Shiny Pokémon image URL (e.g., `https://pokemn.quest/pokemon/813-scorbunny/pm813.s.icon.png`)
| **`altText`**      | `string`  | Accessible alt text for the image
| **`canBeShiny`**   | `boolean` | Whether this Pokémon can currently be shiny in the game
| **`imageWidth`**   | `int`     | Image width in pixels
| **`imageHeight`**  | `int`     | Image height in pixels
| **`imageType`**    | `string`  | Image format (e.g., `"png"`)

### Rewards Fields

The `rewards` object can contain:

| Field                              | Type              | Description
|----------------------------------- |------------------ |---------------------
| **`ticketedResearch`**             | `object` optional | Ticketed research info
| **`ticketedResearch.price`**       | `number`          | Ticket price in USD
| **`ticketedResearch.description`** | `string`          | Description of the ticketed research

## Notes

- Community Days typically run for 3 hours (14:00-17:00 local time)
- Events often feature exclusive moves for evolved Pokémon
- Community Day Classic events may also appear with this eventType
