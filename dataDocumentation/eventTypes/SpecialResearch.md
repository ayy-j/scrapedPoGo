# Endpoint

`https://pokemn.quest/data/eventTypes/special-research.min.json`

## Description

This file contains all Special Research events. Special Research features story-driven research task lines often tied to in-game events, Mythical Pokémon encounters, or ticketed experiences. Unlike Timed Research, Special Research typically does not expire once claimed.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"special-research"`:

```json
[
  {
    "eventID": "special-research-example",
    "name": "A Mythical Discovery",
    "eventType": "special-research",
    "heading": "Special Research",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "special-research-spring-2026",
  "name": "Special Research: Spring 2026",
  "eventType": "special-research",
  "heading": "Special Research",
  "image": "https://pokemn.quest/events/events-default-img.jpg",
  "start": "2026-03-01T10:00:00.000",
  "end": "2026-03-31T20:00:00.000",
  "description": "Complete special research tasks for exclusive rewards.",
  "isPaid": true,
  "price": 1.99,
  "tasks": [],
  "rewards": ["Exclusive Pokémon encounter"],
  "encounters": [],
  "availability": {
    "start": "",
    "end": ""
  }
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Special Research event
| **`name`**      | `string` | Research story/event name
| **`eventType`** | `string` | Always `"special-research"`
| **`heading`**   | `string` | Always `"Special Research"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start time (ISO 8601 format)
| **`end`**       | `string` | Event end time (ISO 8601 format)

### Special Research-Specific Fields

| Field              | Type          | Description
|------------------- |-------------- |---------------------
| **`description`**  | `string`      | Research story/event description
| **`isPaid`**       | `boolean`     | Whether this research requires a ticket purchase
| **`price`**        | `number\|null`| Ticket price in USD if paid, `null` otherwise
| **`tasks`**        | `array`       | Research task steps (may be individual tasks or step-grouped)
| **`rewards`**      | `array`       | List of reward descriptions
| **`encounters`**   | `array`       | Pokémon encounter rewards with `name`, `image`, `canBeShiny`
| **`availability`** | `object`      | Human-readable availability window with `start` and `end`

## Scraper

Source: `src/pages/detailed/timedresearch.js` (shared with Timed Research)

Special Research events are scraped using the same scraper as Timed Research but write with type `"special-research"`. The scraper extracts tasks via `extractResearchTasks()`, pricing via `extractPrice()`, and encounter Pokémon from page sections.

## Notes

- Special Research shares a scraper with Timed Research — the output format is identical
- Special Research is often story-driven and tied to Mythical or Legendary Pokémon
- Unlike Timed Research, Special Research typically does not expire once the research line is started
- Ticketed Special Research is common during major events (GO Fest, GO Tour)
- The `tasks` array may be empty when tasks cannot be parsed from the event page
