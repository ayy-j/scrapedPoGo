# Raids Data

## Endpoint

`https://pokemn.quest/data/raids.min.json`

## Example Raid Object

```json
{
    "name": "Ekans",
    "originalName": "Ekans",
    "form": null,
    "gender": null,
    "tier": "1-Star Raids",
    "isShadowRaid": false,
    "eventStatus": "unknown",
    "canBeShiny": true,
    "types": [
        {
            "name": "poison",
            "image": "https://pokemn.quest/images/types/poison.png"
        }
    ],
    "combatPower": {
        "normal": {
            "min": 487,
            "max": 529
        },
        "boosted": {
            "min": 609,
            "max": 662
        }
    },
    "boostedWeather": [
        {
            "name": "cloudy",
            "image": "https://pokemn.quest/images/weather/cloudy.png"
        }
    ],
    "image": "https://pokemn.quest/images/pokemon/pm23.png",
    "imageWidth": 256,
    "imageHeight": 256,
    "imageType": "png"
}
```
## Fields

| Field                | Type          | Description
|--------------------- |-------------- |---------------------
| **`name`**           | `string`      | The cleaned name of the Pokemon (form and gender removed).
| **`originalName`**   | `string`      | The original name as displayed on the site (includes form/gender).
| **`form`**           | `string\|null` | The form of the Pokemon (e.g., `Incarnate`, `Origin`, `Alola`), or `null` if none.
| **`gender`**         | `string\|null` | The gender of the Pokemon (`male`, `female`), or `null` if not specified.
| **`tier`**           | `string`      | The raid tier of the Pokemon.<br />Can be `1-Star Raids`, `3-Star Raids`, `5-Star Raids`, `Mega Raids`
| **`isShadowRaid`**   | `boolean`     | Whether this is a Shadow Raid boss.
| **`eventStatus`**    | `string`      | The status of the raid event.<br />Can be `ongoing`, `upcoming`, `inactive`, `unknown`
| **`canBeShiny`**     | `boolean`     | Whether or not the Pokemon can be shiny.
| **`types`**          | `Type[]`      | The type(s) of the Pokemon. See [Type](#Type).
| **`combatPower`**    | `CombatPower` | The combat power range the Pokemon can be caught with. See [CombatPower](#CombatPower).
| **`boostedWeather`** | `Weather[]`   | The type(s) of weather that boost the Pokemon's combat power. See [Weather](#Weather).
| **`image`**          | `string`      | The image URL of the Pokemon.
| **`imageWidth`**     | `int`         | The width of the image in pixels.
| **`imageHeight`**    | `int`         | The height of the image in pixels.
| **`imageType`**      | `string`      | The image format (e.g., `png`).

## Other Objects

### Type

#### Example Object

```json
{
    "name": "fire",
    "image": "https://pokemn.quest/images/types/fire.png"
}
```

#### Fields

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The name of the type
| **`image`** | `string` | The image of the type. 

### CombatPower

#### Example Object

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

#### Fields

| Field             | Type  | Description
|------------------ |------ |---------------------
| **`normal.min`**  | `int` | The minimum normal combat power of the Pokemon.
| **`normal.max`**  | `int` | The maximum normal combat power of the Pokemon.
| **`boosted.min`** | `int` | The minimum boosted combat power of the Pokemon.
| **`boosted.max`** | `int` | The maximum boosted combat power of the Pokemon.

### Weather

#### Example Object

```json
{
    "name": "foggy",
    "image": "https://pokemn.quest/images/weather/foggy.png"
}
```

#### Fields

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The name of the weather type.<br />Can be `sunny`, `rainy`, `partly cloudy`, `cloudy`, `windy`, `snow`, `fog`
| **`image`** | `string` | The image of the weather type.

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Pokemon GO Raids Data",
  "description": "Schema for Pokemon GO raid boss data from LeekDuck",
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
                "type": "integer",
                "description": "The minimum normal combat power of the Pokemon"
              },
              "max": {
                "type": "integer",
                "description": "The maximum normal combat power of the Pokemon"
              }
            },
            "additionalProperties": false
          },
          "boosted": {
            "type": "object",
            "required": ["min", "max"],
            "properties": {
              "min": {
                "type": "integer",
                "description": "The minimum boosted combat power of the Pokemon"
              },
              "max": {
                "type": "integer",
                "description": "The maximum boosted combat power of the Pokemon"
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
