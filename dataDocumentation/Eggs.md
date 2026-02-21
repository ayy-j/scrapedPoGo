# Eggs Data

## Endpoint

`https://pokemn.quest/data/eggs.min.json`

## Example Egg Object

```json
{
    "name": "Bulbasaur",
    "eggType": "1km",
    "isAdventureSync": false,
    "image": "https://pokemn.quest/pokemon/001-bulbasaur/pm1.icon.png",
    "canBeShiny": true,
    "combatPower": {
        "min": 637,
        "max": 637
    },
    "isRegional": false,
    "isGiftExchange": false,
    "rarity": 4,
    "imageWidth": 107,
    "imageHeight": 126,
    "imageType": "png"
}
```
## Fields

| Field                 | Type      | Description
|---------------------- |---------- |---------------------
| **`name`**            | `string`  | The name of the hatched Pokemon.
| **`eggType`**         | `string`  | The type of the egg.<br />Can be `1km`, `2km`, `5km`, `7km`, `10km`, `12km`, `route`, `adventure5km`, `adventure10km`
| **`isAdventureSync`** | `boolean` | Whether or not the egg is obtained from Adventure Sync.
| **`isRegional`**      | `boolean` | Whether or not the hatched Pokemon is a regional exclusive.
| **`isGiftExchange`**  | `boolean` | Whether or not the egg is obtained from gift exchange.
| **`rarity`**          | `int`     | The rarity tier of the hatched Pokemon (0-5 scale).
| **`image`**           | `string`  | The image URL of the hatched Pokemon.
| **`canBeShiny`**      | `boolean` | Whether or not the hatched Pokemon can be shiny.
| **`combatPower.min`** | `int\|null` | The minimum combat power of the hatched Pokemon, or `null` if unknown.
| **`combatPower.max`** | `int\|null` | The maximum combat power of the hatched Pokemon, or `null` if unknown.
| **`imageWidth`**      | `int`     | The width of the image in pixels.
| **`imageHeight`**     | `int`     | The height of the image in pixels.
| **`imageType`**       | `string`  | The image format (e.g., `png`).

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://raw.githubusercontent.com/ayy-j/scrapedPoGo/main/schemas/eggs.schema.json",
  "title": "Pokemon GO Eggs Data",
  "description": "Schema for Pokemon GO egg hatch data",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "name",
      "eggType",
      "isAdventureSync",
      "image",
      "canBeShiny",
      "combatPower",
      "isRegional",
      "isGiftExchange",
      "rarity",
      "imageWidth",
      "imageHeight",
      "imageType"
    ],
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the hatched Pokemon"
      },
      "eggType": {
        "type": "string",
        "description": "The type of the egg",
        "enum": [
          "1km",
          "2km",
          "5km",
          "7km",
          "10km",
          "12km",
          "route",
          "adventure5km",
          "adventure10km"
        ]
      },
      "isAdventureSync": {
        "type": "boolean",
        "description": "Whether or not the egg is obtained from Adventure Sync"
      },
      "image": {
        "type": "string",
        "format": "uri",
        "description": "The image URL of the hatched Pokemon"
      },
      "canBeShiny": {
        "type": "boolean",
        "description": "Whether or not the hatched Pokemon can be shiny"
      },
      "combatPower": {
        "type": "object",
        "description": "The combat power range of the hatched Pokemon",
        "required": [
          "min",
          "max"
        ],
        "properties": {
          "min": {
            "type": [
              "integer",
              "null"
            ],
            "description": "The minimum combat power of the hatched Pokemon, or null if unknown"
          },
          "max": {
            "type": [
              "integer",
              "null"
            ],
            "description": "The maximum combat power of the hatched Pokemon, or null if unknown"
          }
        },
        "additionalProperties": false
      },
      "isRegional": {
        "type": "boolean",
        "description": "Whether or not the hatched Pokemon is a regional exclusive"
      },
      "isGiftExchange": {
        "type": "boolean",
        "description": "Whether or not the egg is obtained from gift exchange"
      },
      "rarity": {
        "type": "integer",
        "description": "The rarity tier of the hatched Pokemon (0-5 scale)",
        "minimum": 0,
        "maximum": 5
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
        "enum": [
          "png",
          "jpg",
          "jpeg",
          "gif",
          "webp"
        ]
      }
    },
    "additionalProperties": false
  }
}
```
