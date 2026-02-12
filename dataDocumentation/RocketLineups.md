# Rocket Lineups Data

## Endpoint

`https://pokemn.quest/data/rocketLineups.min.json`

## Example Rocket Lineup Object

```json
{
    "name": "Cliff",
    "title": "Team GO Rocket Leader",
    "type": "",
    "slots": [
        [
            {
                "name": "Magikarp",
                "image": "https://pokemn.quest/images/pokemon/pm129.png",
                "types": [
                    "water"
                ],
                "weaknesses": {
                    "double": [],
                    "single": [
                        "grass",
                        "electric"
                    ]
                },
                "isEncounter": true,
                "canBeShiny": true
            }
        ],
        [
            {
                "name": "Cradily",
                "image": "https://pokemn.quest/images/pokemon/pm346.png",
                "types": [
                    "rock",
                    "grass"
                ],
                "weaknesses": {
                    "double": [],
                    "single": [
                        "ice",
                        "fighting",
                        "bug",
                        "steel"
                    ]
                },
                "isEncounter": false,
                "canBeShiny": false
            }
        ],
        [
            {
                "name": "Tyranitar",
                "image": "https://pokemn.quest/images/pokemon/pm248.png",
                "types": [
                    "rock",
                    "dark"
                ],
                "weaknesses": {
                    "double": [
                        "fighting"
                    ],
                    "single": [
                        "ground",
                        "bug",
                        "steel",
                        "water",
                        "grass",
                        "fairy"
                    ]
                },
                "isEncounter": false,
                "canBeShiny": false
            }
        ]
    ]
}
```

## Fields

| Field               | Type              | Description
|-------------------- |------------------ |---------------------
| **`name`**          | `string`          | The name of the Rocket member (e.g., `Giovanni`, `Cliff`, `Fire-type Female Grunt`).
| **`title`**         | `string`          | The title of the Rocket member.<br />Can be `Team GO Rocket Boss`, `Team GO Rocket Leader`, `Team GO Rocket Grunt`
| **`type`**          | `string`          | The type specialization of the grunt (empty for Leaders/Giovanni).
| **`slots`**         | `ShadowPokemon[][]` | Array of 3 battle slots, each containing an array of possible Pokemon. See [ShadowPokemon](#ShadowPokemon).

## Other Objects

### ShadowPokemon

#### Example Object

```json
{
    "name": "Magikarp",
    "image": "https://pokemn.quest/images/pokemon/pm129.png",
    "imageWidth": 256,
    "imageHeight": 256,
    "imageType": "png",
    "types": [
        "water"
    ],
    "weaknesses": {
        "double": [],
        "single": [
            "grass",
            "electric"
        ]
    },
    "isEncounter": true,
    "canBeShiny": true
}
```

#### Fields

| Field                    | Type       | Description
|------------------------- |----------- |---------------------
| **`name`**               | `string`   | The name of the Shadow Pokemon.
| **`image`**              | `string`   | The image of the Shadow Pokemon.
| **`imageWidth`**         | `int`      | The image width in pixels (when available).
| **`imageHeight`**        | `int`      | The image height in pixels (when available).
| **`imageType`**          | `string`   | The image format (e.g., `png`) when available.
| **`types`**              | `string[]` | The type(s) of the Pokemon (lowercase).
| **`weaknesses`**         | `Weaknesses` | The weaknesses of the Pokemon. See [Weaknesses](#Weaknesses).
| **`isEncounter`**        | `boolean`  | Whether this Pokemon can be caught after winning the battle.
| **`canBeShiny`**         | `boolean`  | Whether or not the Pokemon can be shiny when encountered.

### Weaknesses

#### Example Object

```json
{
    "double": [
        "fighting"
    ],
    "single": [
        "ground",
        "bug",
        "steel",
        "water",
        "grass",
        "fairy"
    ]
}
```

#### Fields

| Field        | Type       | Description
|------------- |----------- |---------------------
| **`double`** | `string[]` | Types that deal 4× (double) super-effective damage to this Pokemon.
| **`single`** | `string[]` | Types that deal 2× (single) super-effective damage to this Pokemon.

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://raw.githubusercontent.com/ayy-j/scrapedPoGo/main/schemas/rocketLineups.schema.json",
  "title": "Pokemon GO Team Rocket Lineups Data",
  "description": "Schema for Pokemon GO Team GO Rocket lineup data",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "name",
      "title",
      "type",
      "slots"
    ],
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the Rocket member (e.g., Giovanni, Cliff, Fire-type Female Grunt)"
      },
      "title": {
        "type": "string",
        "description": "The title of the Rocket member",
        "enum": [
          "Team GO Rocket Boss",
          "Team GO Rocket Leader",
          "Team GO Rocket Grunt"
        ]
      },
      "type": {
        "type": "string",
        "description": "The type specialization of the grunt (empty for Leaders/Giovanni)"
      },
      "slots": {
        "type": "array",
        "description": "Three battle slots, each containing an array of possible Shadow Pokemon",
        "items": {
          "type": "array",
          "description": "Possible Pokemon in this battle slot",
          "items": {
            "$ref": "#/definitions/shadowPokemon"
          },
          "minItems": 1
        },
        "minItems": 3,
        "maxItems": 3
      }
    },
    "additionalProperties": false
  },
  "definitions": {
    "shadowPokemon": {
      "type": "object",
      "required": [
        "name",
        "image",
        "types",
        "weaknesses",
        "isEncounter",
        "canBeShiny"
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the Shadow Pokemon"
        },
        "image": {
          "type": "string",
          "format": "uri",
          "description": "The image of the Shadow Pokemon"
        },
        "imageWidth": {
          "type": "integer",
          "description": "The image width in pixels"
        },
        "imageHeight": {
          "type": "integer",
          "description": "The image height in pixels"
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
        },
        "types": {
          "type": "array",
          "description": "The type(s) of the Pokemon (lowercase)",
          "items": {
            "type": "string"
          },
          "minItems": 1,
          "maxItems": 2
        },
        "weaknesses": {
          "type": "object",
          "description": "The weaknesses of the Pokemon",
          "required": [
            "double",
            "single"
          ],
          "properties": {
            "double": {
              "type": "array",
              "description": "Types that deal 4× (double) super-effective damage to this Pokemon",
              "items": {
                "type": "string"
              }
            },
            "single": {
              "type": "array",
              "description": "Types that deal 2× (single) super-effective damage to this Pokemon",
              "items": {
                "type": "string"
              }
            }
          },
          "additionalProperties": false
        },
        "isEncounter": {
          "type": "boolean",
          "description": "Whether this Pokemon can be caught after winning the battle"
        },
        "canBeShiny": {
          "type": "boolean",
          "description": "Whether or not the Pokemon can be shiny when encountered"
        }
      },
      "additionalProperties": false
    }
  }
}
```
