# Rocket Lineups Data

## Endpoint

`https://pokemn.quest/data/rocketLineups.min.json`

## Example Rocket Lineup Object

```json
{
    "name": "Cliff",
    "title": "Team GO Rocket Leader",
    "type": "",
    "firstPokemon": [
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
    "secondPokemon": [
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
    "thirdPokemon": [
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
}
```

## Fields

| Field               | Type              | Description
|-------------------- |------------------ |---------------------
| **`name`**          | `string`          | The name of the Rocket member (e.g., `Giovanni`, `Cliff`, `Fire-type Female Grunt`).
| **`title`**         | `string`          | The title of the Rocket member.<br />Can be `Team GO Rocket Boss`, `Team GO Rocket Leader`, `Team GO Rocket Grunt`
| **`type`**          | `string`          | The type specialization of the grunt (empty for Leaders/Giovanni).
| **`firstPokemon`**  | `ShadowPokemon[]` | The possible Pokemon in the first slot. See [ShadowPokemon](#ShadowPokemon).
| **`secondPokemon`** | `ShadowPokemon[]` | The possible Pokemon in the second slot. See [ShadowPokemon](#ShadowPokemon).
| **`thirdPokemon`**  | `ShadowPokemon[]` | The possible Pokemon in the third slot. See [ShadowPokemon](#ShadowPokemon).

## Other Objects

### ShadowPokemon

#### Example Object

```json
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
```

#### Fields

| Field                    | Type       | Description
|------------------------- |----------- |---------------------
| **`name`**               | `string`   | The name of the Shadow Pokemon.
| **`image`**              | `string`   | The image of the Shadow Pokemon.
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
  "title": "Pokemon GO Team Rocket Lineups Data",
  "description": "Schema for Pokemon GO Team GO Rocket lineup data from LeekDuck",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["name", "title", "type", "firstPokemon", "secondPokemon", "thirdPokemon"],
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the Rocket member (e.g., Giovanni, Cliff, Fire-type Female Grunt)"
      },
      "title": {
        "type": "string",
        "description": "The title of the Rocket member",
        "enum": ["Team GO Rocket Boss", "Team GO Rocket Leader", "Team GO Rocket Grunt"]
      },
      "type": {
        "type": "string",
        "description": "The type specialization of the grunt (empty for Leaders/Giovanni)"
      },
      "firstPokemon": {
        "type": "array",
        "description": "The possible Pokemon in the first slot",
        "items": { "$ref": "#/definitions/shadowPokemon" },
        "minItems": 1
      },
      "secondPokemon": {
        "type": "array",
        "description": "The possible Pokemon in the second slot",
        "items": { "$ref": "#/definitions/shadowPokemon" },
        "minItems": 1
      },
      "thirdPokemon": {
        "type": "array",
        "description": "The possible Pokemon in the third slot",
        "items": { "$ref": "#/definitions/shadowPokemon" },
        "minItems": 1
      }
    },
    "additionalProperties": false
  },
  "definitions": {
    "shadowPokemon": {
      "type": "object",
      "required": ["name", "image", "types", "weaknesses", "isEncounter", "canBeShiny"],
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
        "types": {
          "type": "array",
          "description": "The type(s) of the Pokemon (lowercase)",
          "items": { "type": "string" },
          "minItems": 1,
          "maxItems": 2
        },
        "weaknesses": {
          "type": "object",
          "description": "The weaknesses of the Pokemon",
          "required": ["double", "single"],
          "properties": {
            "double": {
              "type": "array",
              "description": "Types that deal 4× (double) super-effective damage",
              "items": { "type": "string" }
            },
            "single": {
              "type": "array",
              "description": "Types that deal 2× (single) super-effective damage",
              "items": { "type": "string" }
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
