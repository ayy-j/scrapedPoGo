# Research Data

## Endpoint

`https://pokemn.quest/data/research.min.json`

## Example Research Object

```json
{
    "text": "Defeat a Team GO Rocket Grunt",
    "type": "rocket",
    "rewards": [
        {
            "type": "item",
            "name": "Mysterious Component",
            "quantity": 1,
            "image": "https://pokemn.quest/images/items/mysterious-component.png",
            "imageWidth": 512,
            "imageHeight": 512,
            "imageType": "png"
        }
    ]
}
```

## Example Research Object with Encounter Reward

```json
{
    "text": "Earn a Candy exploring with your buddy",
    "type": "buddy",
    "rewards": [
        {
            "type": "encounter",
            "name": "Fidough",
            "image": "https://pokemn.quest/images/pokemon/pm926.png",
            "canBeShiny": true,
            "combatPower": {
                "min": 389,
                "max": 422
            },
            "imageWidth": 91,
            "imageHeight": 79,
            "imageType": "png"
        }
    ]
}
```
## Fields

| Field         | Type            | Description
|-------------- |---------------- |---------------------
| **`text`**    | `string`        | The research task text.
| **`type`**    | `string\|null`  | The type of research (optional).<br />Can be `event`, `catch`, `throw`, `battle`, `explore`, `training`, `rocket`, `buddy`, `ar`, `sponsored`, or `null` if not specified
| **`rewards`** | `Reward[]`      | The rewards for completing the research task. See [Reward](#Reward)

## Other Objects

### Reward

Rewards can be one of three types: `encounter`, `item`, or `resource`. The fields available depend on the reward type.

#### Encounter Reward Example

```json
{
    "type": "encounter",
    "name": "Fidough",
    "image": "https://pokemn.quest/images/pokemon/pm926.png",
    "canBeShiny": true,
    "combatPower": {
        "min": 389,
        "max": 422
    },
    "imageWidth": 91,
    "imageHeight": 79,
    "imageType": "png"
}
```

#### Item/Resource Reward Example

```json
{
    "type": "item",
    "name": "Mysterious Component",
    "quantity": 1,
    "image": "https://pokemn.quest/images/items/mysterious-component.png",
    "imageWidth": 512,
    "imageHeight": 512,
    "imageType": "png"
}
```

#### Common Fields (All Reward Types)

| Field            | Type     | Description
|----------------- |--------- |---------------------
| **`type`**       | `string` | The type of reward.<br />Can be `encounter`, `item`, `resource`
| **`name`**       | `string` | The name of the reward (Pokemon name or item name).
| **`image`**      | `string` | The image URL of the reward.
| **`imageWidth`** | `int`    | The width of the image in pixels.
| **`imageHeight`**| `int`    | The height of the image in pixels.
| **`imageType`**  | `string` | The image format (e.g., `png`).

### Encounter-Only Fields

| Field                 | Type      | Description
|---------------------- |---------- |---------------------
| **`canBeShiny`**      | `boolean` | Whether or not the reward Pokemon can be shiny.
| **`combatPower.min`** | `int\|null` | The minimum combat power of the reward Pokemon, or `null` if unknown.
| **`combatPower.max`** | `int\|null` | The maximum combat power of the reward Pokemon, or `null` if unknown.

#### Item/Resource-Only Fields

| Field          | Type  | Description
|--------------- |------ |---------------------
| **`quantity`** | `int` | The quantity of the item/resource rewarded.

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Pokemon GO Research Data",
  "description": "Schema for Pokemon GO field research tasks and rewards",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["text", "type", "rewards"],
    "properties": {
      "text": {
        "type": "string",
        "description": "The research task text"
      },
      "type": {
        "type": ["string", "null"],
        "description": "The type of research",
        "enum": ["event", "catch", "throw", "battle", "explore", "training", "rocket", "buddy", "ar", "sponsored", null]
      },
      "rewards": {
        "type": "array",
        "description": "The rewards for completing the research task",
        "items": {
          "type": "object",
          "required": ["type", "name", "image", "imageWidth", "imageHeight", "imageType"],
          "properties": {
            "type": {
              "type": "string",
              "description": "The type of reward",
              "enum": ["encounter", "item", "resource"]
            },
            "name": {
              "type": "string",
              "description": "The name of the reward (Pokemon name or item name)"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "The image URL of the reward"
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
            },
            "canBeShiny": {
              "type": "boolean",
              "description": "Whether or not the reward Pokemon can be shiny (encounter type only)"
            },
            "combatPower": {
              "type": "object",
              "description": "The combat power range of the reward Pokemon (encounter type only)",
              "required": ["min", "max"],
              "properties": {
                "min": {
                  "type": ["integer", "null"],
                  "description": "The minimum combat power of the reward Pokemon, or null if unknown"
                },
                "max": {
                  "type": ["integer", "null"],
                  "description": "The maximum combat power of the reward Pokemon, or null if unknown"
                }
              },
              "additionalProperties": false
            },
            "quantity": {
              "type": "integer",
              "description": "The quantity of the item/resource rewarded (item/resource type only)"
            }
          },
          "additionalProperties": false
        },
        "minItems": 1
      }
    },
    "additionalProperties": false
  }
}
```
