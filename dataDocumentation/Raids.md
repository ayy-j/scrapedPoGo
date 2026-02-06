# Raids Data

## Endpoint

**URL**: `https://pokemn.quest/data/raids.min.json`

The endpoint returns a minified JSON array of current raid boss data.

## Overview

The Raids endpoint provides comprehensive data about all active raid bosses in Pokemon GO, including tier information, CP ranges, type effectiveness, weather boosts, and shiny availability. The data is automatically updated as raid rotations change.

## Response Structure

The endpoint returns a JSON array of raid boss objects:

```json
[
  {
    "name": "Ekans",
    "originalName": "Ekans",
    "form": null,
    "gender": null,
    "tier": "1-Star Raids",
    "isShadowRaid": false,
    "eventStatus": "unknown",
    "canBeShiny": true,
    "types": [...],
    "combatPower": {...},
    "boostedWeather": [...],
    "image": "https://pokemn.quest/images/pokemon/...",
    "imageWidth": 256,
    "imageHeight": 256,
    "imageType": "png"
  },
  ...
]
```

## Core Fields

All raid boss objects contain these fields:

| Field                | Type          | Required | Description
|--------------------- |-------------- |--------- |---------------------
| **`name`**           | `string`      | Yes      | The cleaned name of the Pokemon (form and gender removed).
| **`originalName`**   | `string`      | Yes      | The original name as displayed on the source (includes form/gender).
| **`form`**           | `string\|null` | Yes      | The form of the Pokemon (e.g., `Incarnate`, `Origin`, `Alola`), or `null` if none.
| **`gender`**         | `string\|null` | Yes      | The gender of the Pokemon (`male`, `female`), or `null` if not specified.
| **`tier`**           | `string`      | Yes      | The raid tier. Values: `1-Star Raids`, `3-Star Raids`, `5-Star Raids`, `Mega Raids`
| **`isShadowRaid`**   | `boolean`     | Yes      | Whether this is a Shadow Raid boss.
| **`eventStatus`**    | `string`      | Yes      | The status of the raid event. Values: `ongoing`, `upcoming`, `inactive`, `unknown`
| **`canBeShiny`**     | `boolean`     | Yes      | Whether or not the Pokemon can be encountered as shiny.
| **`types`**          | `Type[]`      | Yes      | The type(s) of the Pokemon. See [Type](#type).
| **`combatPower`**    | `CombatPower` | Yes      | The CP range for catches. See [CombatPower](#combatpower).
| **`boostedWeather`** | `Weather[]`   | Yes      | Weather conditions that boost the Pokemon's CP. See [Weather](#weather).
| **`image`**          | `string`      | Yes      | The image URL of the Pokemon.
| **`imageWidth`**     | `int`         | Yes      | The width of the image in pixels.
| **`imageHeight`**    | `int`         | Yes      | The height of the image in pixels.
| **`imageType`**      | `string`      | Yes      | The image format (e.g., `png`).

## Nested Objects

### Type

Represents a Pokemon type with its icon.

**Example:**
```json
{
    "name": "fire",
    "image": "https://pokemn.quest/images/types/fire.png",
    "imageWidth": 32,
    "imageHeight": 32,
    "imageType": "png"
}
```

**Fields:**

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The name of the type (e.g., `fire`, `water`, `grass`, `electric`, `psychic`, `fighting`, `dark`, `steel`, `fairy`, `dragon`, `ghost`, `bug`, `rock`, `ground`, `ice`, `poison`, `normal`, `flying`)
| **`image`** | `string` | The image URL of the type icon. Format: `https://pokemn.quest/images/types/<type>.png`
| **`imageWidth`** | `int` | The width of the type icon in pixels (when available).
| **`imageHeight`** | `int` | The height of the type icon in pixels (when available).
| **`imageType`** | `string` | The type icon format (e.g., `png`) when available.

### CombatPower

Defines the CP (Combat Power) range for catching the raid boss.

**Example:**
```json
{
    "normal": {
        "min": 988,
        "max": 1048
    },
    "boosted": {
        "min": 1235,
        "max": 1311
    }
}
```

**Fields:**

| Field             | Type  | Description
|------------------ |------ |---------------------
| **`normal.min`**  | `int\|null` | The minimum CP when not weather boosted, or `null` if unknown.
| **`normal.max`**  | `int\|null` | The maximum CP when not weather boosted, or `null` if unknown.
| **`boosted.min`** | `int\|null` | The minimum CP when weather boosted, or `null` if unknown.
| **`boosted.max`** | `int\|null` | The maximum CP when weather boosted, or `null` if unknown.

Weather boosting increases CP by approximately 25% and indicates better IVs (minimum 4/4/4 instead of 0/0/0).

### Weather

Represents weather conditions that boost the raid boss.

**Example:**
```json
{
    "name": "foggy",
    "image": "https://pokemn.quest/images/weather/foggy.png",
    "imageWidth": 32,
    "imageHeight": 32,
    "imageType": "png"
}
```

**Fields:**

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The weather type. Values: `sunny`, `rainy`, `partly cloudy`, `cloudy`, `windy`, `snow`, `fog`
| **`image`** | `string` | The image URL of the weather icon. Format: `https://pokemn.quest/images/weather/<weather>.png`
| **`imageWidth`** | `int` | The width of the weather icon in pixels (when available).
| **`imageHeight`** | `int` | The height of the weather icon in pixels (when available).
| **`imageType`** | `string` | The weather icon format (e.g., `png`) when available.

## Field Details

### Name Processing

- **`name`**: Standardized name without form/gender qualifiers (e.g., "Tornadus")
- **`originalName`**: Full display name (e.g., "Tornadus (Incarnate)")

This allows for easier grouping and filtering while preserving the complete information.

### Forms and Variants

The `form` field captures Pokemon forms and variants:
- Regional forms: `Alola`, `Galarian`, `Hisuian`
- Legendary forms: `Incarnate`, `Therian`, `Origin`
- Mega/Primal: Typically included in `name` (e.g., "Mega Ampharos")
- Other forms: `Curly`, `Droopy`, `Stretchy` (Tatsugiri)

### Raid Tiers

Raid difficulty is indicated by the `tier` field:
- **1-Star Raids**: Solo-able, beginner-friendly
- **3-Star Raids**: Require 1-3 players depending on level and counters
- **5-Star Raids**: Legendary/Mythical, typically require 3-5+ players
- **Mega Raids**: Mega Evolutions, difficulty varies by species

### Shadow Raids

Shadow Raids (`isShadowRaid: true`) are a special raid type featuring Shadow Pokemon. These raids have unique mechanics and typically require more players than standard raids of the same tier.

### Event Status

The `eventStatus` field indicates when the boss is available:
- **`ongoing`**: Currently in raids
- **`upcoming`**: Announced but not yet active
- **`inactive`**: No longer available
- **`unknown`**: Status not confirmed

## Image Paths (`pokemn.quest`)

**Public**: `https://pokemn.quest/images/<path>`

### Canonical Path Scheme (blobNaming.js)

| Prefix                        | Stored Content                                      | Example URL (public) |
|------------------------------|-----------------------------------------------------|----------------------|
| `pokemon/<dex>-<slug>/...`   | Pokémon icons/sprites                               | `.../pokemon/001-bulbasaur/pokemon_icon_001_00.png` |
| `events/<filename>.<ext>`    | Event banners                                      | `.../events/into-the-depths-2026.jpg`, `.../events/events-default-img.jpg` |
| `types/<type>.png`           | Type icons                                         | `.../types/poison.png` |
| `weather/<weather>.png`      | Weather icons                                      | `.../weather/cloudy.png` |
| `bonuses/<bonus>.png`        | Bonus icons                                        | `.../bonuses/2x-stardust.png` |
| `eggs/<file>.png`            | Egg icons                                          | `.../eggs/12km.png` |
| `raids/<file>.png`           | Raid tier/icons                                    | `.../raids/legendary.png` |
| `items/<file>.png`           | Items                                              | `.../items/mysterious-component.png` |
| `stickers/<file>.png`        | Stickers                                           | `.../stickers/pikachu.png` |
| `misc/<hash-or-file>`        | Fallback                                           | `.../misc/<hash>.bin` |

> Publicly served by prefixing with `https://pokemn.quest/images/`

## Data Quality Notes

1. **Minified Format**: The endpoint returns minified JSON (no whitespace) for reduced bandwidth.

2. **Null Values**: The `form` and `gender` fields will be `null` when not applicable (most Pokemon).

3. **Type Ordering**: Pokemon with two types will have both types in the `types` array. Order may vary.

4. **Weather Arrays**: `boostedWeather` can contain 1-2 weather types depending on the Pokemon's types.

5. **Image Dimensions**: Raid boss images are currently 256x256 PNG files. Nested type/weather icons include `imageWidth`/`imageHeight`/`imageType` when available.

6. **Event Status**: The `unknown` status is used when raid availability timing isn't clearly defined or is part of the regular rotation.

7. **Shadow vs Regular**: Shadow versions are separate entries with `isShadowRaid: true` and typically have "Shadow" prefixed in the name.

## Integration with Other Endpoints

Raid data can be cross-referenced with:

- **Events** (`https://pokemn.quest/data/events.min.json`) - Event-specific raid rotations and bonuses
- **Pokemon** - Full Pokemon stats and movesets for raid preparation
- **Types** - Type effectiveness charts for building counter teams

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Pokemon GO Raids Data",
  "description": "Schema for Pokemon GO raid boss data",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "name",
      "originalName",
      "form",
      "gender",
      "tier",
      "isShadowRaid",
      "eventStatus",
      "canBeShiny",
      "types",
      "combatPower",
      "boostedWeather",
      "image",
      "imageWidth",
      "imageHeight",
      "imageType"
    ],
    "properties": {
      "name": {
        "type": "string",
        "description": "The cleaned name of the Pokemon (form and gender removed)"
      },
      "originalName": {
        "type": "string",
        "description": "The original name as displayed on the site (includes form/gender)"
      },
      "form": {
        "type": ["string", "null"],
        "description": "The form of the Pokemon (e.g., Incarnate, Origin, Alola), or null if none"
      },
      "gender": {
        "type": ["string", "null"],
        "description": "The gender of the Pokemon (male, female), or null if not specified",
        "enum": ["male", "female", null]
      },
      "tier": {
        "type": "string",
        "description": "The raid tier of the Pokemon",
        "enum": ["1-Star Raids", "3-Star Raids", "5-Star Raids", "Mega Raids"]
      },
      "isShadowRaid": {
        "type": "boolean",
        "description": "Whether this is a Shadow Raid boss"
      },
      "eventStatus": {
        "type": "string",
        "description": "The status of the raid event",
        "enum": ["ongoing", "upcoming", "inactive", "unknown"]
      },
      "canBeShiny": {
        "type": "boolean",
        "description": "Whether or not the Pokemon can be shiny"
      },
      "types": {
        "type": "array",
        "description": "The type(s) of the Pokemon",
        "items": {
          "type": "object",
          "required": ["name", "image"],
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the type"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "The image of the type"
            },
            "imageWidth": {
              "type": "integer",
              "description": "The width of the type icon in pixels"
            },
            "imageHeight": {
              "type": "integer",
              "description": "The height of the type icon in pixels"
            },
            "imageType": {
              "type": "string",
              "description": "The type icon format",
              "enum": ["png", "jpg", "jpeg", "gif", "webp"]
            }
          },
          "additionalProperties": false
        },
        "minItems": 1,
        "maxItems": 2
      },
      "combatPower": {
        "type": "object",
        "description": "The combat power range the Pokemon can be caught with",
        "required": ["normal", "boosted"],
        "properties": {
          "normal": {
            "type": "object",
            "required": ["min", "max"],
            "properties": {
              "min": {
                "type": ["integer", "null"],
                "description": "The minimum normal combat power of the Pokemon, or null if unknown"
              },
              "max": {
                "type": ["integer", "null"],
                "description": "The maximum normal combat power of the Pokemon, or null if unknown"
              }
            },
            "additionalProperties": false
          },
          "boosted": {
            "type": "object",
            "required": ["min", "max"],
            "properties": {
              "min": {
                "type": ["integer", "null"],
                "description": "The minimum boosted combat power of the Pokemon, or null if unknown"
              },
              "max": {
                "type": ["integer", "null"],
                "description": "The maximum boosted combat power of the Pokemon, or null if unknown"
              }
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      },
      "boostedWeather": {
        "type": "array",
        "description": "The type(s) of weather that boost the Pokemon's combat power",
        "items": {
          "type": "object",
          "required": ["name", "image"],
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the weather type",
              "enum": ["sunny", "rainy", "partly cloudy", "cloudy", "windy", "snow", "fog"]
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "The image of the weather type"
            },
            "imageWidth": {
              "type": "integer",
              "description": "The width of the weather icon in pixels"
            },
            "imageHeight": {
              "type": "integer",
              "description": "The height of the weather icon in pixels"
            },
            "imageType": {
              "type": "string",
              "description": "The weather icon format",
              "enum": ["png", "jpg", "jpeg", "gif", "webp"]
            }
          },
          "additionalProperties": false
        }
      },
      "image": {
        "type": "string",
        "format": "uri",
        "description": "The image URL of the Pokemon"
      },
      "imageWidth": {
        "type": "integer",
        "description": "The width of the image in pixels"
      },
      "imageHeight": {
        "type": "integer",
        "description": "The height of the image in pixels"
      },
      "imageType": {
        "type": "string",
        "description": "The image format",
        "enum": ["png", "jpg", "jpeg", "gif", "webp"]
      }
    },
    "additionalProperties": false
  }
}
```
