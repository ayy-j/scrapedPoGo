# Endpoint

`https://pokemn.quest/data/eventTypes/research.min.json`

> **⚠️ Note:** This event type (`eventType: "research"`) is not currently active in the data. Research-related events use `research-day` instead.
>
> **Looking for Field Research Tasks?** See the separate [Research Tasks endpoint](/docs/Research.md) at `https://pokemn.quest/data/research.min.json` which contains current field research tasks and rewards.

## Description

This file would contain Research events with `eventType: "research"`, which could refer to Special Research, Timed Research, or Research Breakthrough changes. Currently, these are not scraped as separate events.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"research"`:

```json
[
  {
    "eventID": "research-example",
    "name": "Special Research Name",
    "eventType": "research",
    "heading": "Research",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "a-mythical-discovery-2026",
  "name": "A Mythical Discovery",
  "eventType": "research",
  "heading": "Research",
  "image": "https://cdn.leekduck.com/assets/img/events/research-mew.jpg",
  "start": "2026-01-01T00:00:00.000",
  "end": null,
  "flags": {
    "hasSpawns": false,
    "hasFieldResearchTasks": false,
    "hasBonuses": false,
    "hasRaids": false,
    "hasEggs": false,
    "hasShiny": false
  }
}
```

## Fields

### Core Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the research
| **`name`**      | `string` | Name of the Special or Timed Research
| **`eventType`** | `string` | Always `"research"`
| **`heading`**   | `string` | Always `"Research"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Research availability start (ISO 8601 format, may be null)
| **`end`**       | `string` | Research availability end (ISO 8601 format, may be null)
| **`flags`**     | `object` | Content availability flags (see below)

### Flags Object

| Field                     | Type      | Description
|-------------------------- |---------- |---------------------
| **`hasSpawns`**           | `boolean` | Whether the event has wild spawns data
| **`hasFieldResearchTasks`** | `boolean` | Whether the event has field research tasks
| **`hasBonuses`**          | `boolean` | Whether the event has gameplay bonuses
| **`hasRaids`**            | `boolean` | Whether the event has raid data
| **`hasEggs`**             | `boolean` | Whether the event has egg pool changes
| **`hasShiny`**            | `boolean` | Whether the event has shiny debuts

## Additional Sections

Research events include a `details` object containing:

- **`research`**: Research task details, steps, and rewards
- **`pokemon`**: Array of featured Pokémon reward objects with `imageWidth`, `imageHeight`, `imageType`, and `canBeShiny` fields



## Notes

- Special Research has no time limit (end date is null)
- Timed Research has a specific deadline
- Research Breakthrough changes affect monthly Field Research rewards
- Some research is automatically granted, others require purchase or event participation
