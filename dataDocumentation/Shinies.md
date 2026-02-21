# Shinies Data

**URL**: `https://pokemn.quest/data/shinies.min.json`  

## Overview

The Shinies endpoint provides comprehensive data about which Pokémon have shiny variants available in Pokémon GO, including Pokemon names, release dates, regional variants, and form information.

This data is used internally by other endpoints (Raids, Eggs, Research) to augment their `canBeShiny` fields with authoritative information.

## Update Frequency

This endpoint is updated with the same frequency as other endpoints.

## Response Structure

The endpoint returns a JSON array of shiny Pokémon entries:

```json
[
  {
    "dexNumber": 1,
    "name": "Bulbasaur",
    "releasedDate": "2018-03-25",
    "family": "Bulbasaur",
    "region": null,
    "forms": [...],
    "image": "...",
    "imageWidth": 256,
    "imageHeight": 256
  },
  ...
]
```

## Shiny Entry Fields

Each entry in the `shinies` array represents a Pokémon (or regional variant) with shiny availability:

```json
{
  "dexNumber": 1,
  "name": "Bulbasaur",
  "releasedDate": "2018-03-25",
  "family": "Bulbasaur",
  "region": null,
  "forms": [
    {
      "name": "f19",
      "image": "https://pokemn.quest/pokemon/001-bulbasaur/pm1.fFALL_2019.s.icon.png",
      "imageWidth": 256,
      "imageHeight": 256
    },
    {
      "name": "11",
      "image": "https://pokemn.quest/pokemon/001-bulbasaur/pokemon_icon_001_00_shiny.png",
      "imageWidth": 256,
      "imageHeight": 256
    }
  ],
  "image": "https://pokemn.quest/pokemon/001-bulbasaur/pokemon_icon_001_00_shiny.png",
  "imageWidth": 256,
  "imageHeight": 256
}
```

### Shiny Fields

| Field | Type | Description |
|-------|------|-------------|
| `dexNumber` | integer | National Pokédex number |
| `name` | string | English name of the Pokémon (includes regional prefix if applicable) |
| `releasedDate` | string\|null | Date when the shiny was first released (YYYY-MM-DD format) |
| `family` | string\|null | Evolution family identifier |
| `region` | string\|null | Regional variant label (e.g., `alolan`, `galarian`, `hisuian`, `paldean`), or `null` for base form |
| `forms` | array | Array of alternative forms/costumes for this Pokémon |
| `image` | string | URL to the base shiny sprite image. *Optional* — absent for Pokémon that only have form variants. |
| `imageWidth` | integer | Image width in pixels (always 256). *Optional* — absent when `image` is absent. |
| `imageHeight` | integer | Image height in pixels (always 256). *Optional* — absent when `image` is absent. |

## Form Entry Fields

Each form in the `forms` array represents a costume or variant:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Form identifier (e.g., "f19" for Fall 2019, "11" for costume variant) |
| `image` | string | URL to the form's shiny sprite image |
| `imageWidth` | integer | Image width in pixels (always 256) |
| `imageHeight` | integer | Image height in pixels (always 256) |

## Regional Variants

Regional variants are represented as separate entries with their own `dexNumber` and `region`:

**Example - Alolan Vulpix**:
```json
{
  "dexNumber": 37,
  "name": "Alolan Vulpix",
  "releasedDate": "2019-06-04",
  "family": "Vulpix_61",
  "region": "alolan",
  "forms": [],
  "image": "https://pokemn.quest/pokemon/037-vulpix/pm37.f61.s.icon.png",
  "imageWidth": 256,
  "imageHeight": 256
}
```

**Region Values**:
- `alolan`: Alolan form
- `galarian`: Galarian form
- `hisuian`: Hisuian form
- `paldean`: Paldean form

## Integration with Other Endpoints

The shiny data is automatically integrated into these endpoints:

- **Raids** (`/raids.json`) - Each boss has `canBeShiny` cross-referenced
- **Eggs** (`/eggs.json`) - Each Pokémon has `canBeShiny` cross-referenced  
- **Research** (`/research.json`) - Each encounter reward has `canBeShiny` cross-referenced

The `canBeShiny` field in these endpoints is cross-referenced with this authoritative shiny data to ensure accuracy.

## Example Usage

### Check if a specific Pokémon has shiny
```javascript
fetch('https://pokemn.quest/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const bulbasaur = data.find(p => 
      p.dexNumber === 1 && !p.region
    );
    console.log(`Bulbasaur shiny released: ${bulbasaur?.releasedDate}`);
  });
```

### Get all Pokémon with costume variants
```javascript
fetch('https://pokemn.quest/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const withCostumes = data.filter(p => 
      p.forms && p.forms.length > 0
    );
    console.log(`${withCostumes.length} Pokémon have costume shiny variants`);
  });
```

### Find all Alolan shinies
```javascript
fetch('https://pokemn.quest/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const alolan = data.filter(p => p.region === 'alolan');
    console.log(`${alolan.length} Alolan Pokémon have shinies`);
    alolan.forEach(p => console.log(p.name));
  });
```

### Get shinies released in a specific year
```javascript
fetch('https://pokemn.quest/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const year2018 = data.filter(p => 
      p.releasedDate?.startsWith('2018-')
    );
    console.log(`${year2018.length} shinies released in 2018`);
  });
```

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://raw.githubusercontent.com/ayy-j/scrapedPoGo/main/schemas/shinies.schema.json",
  "title": "Pokemon GO Shinies Data",
  "description": "Schema for Pokemon GO shiny availability data",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "dexNumber",
      "name",
      "releasedDate",
      "family",
      "region",
      "forms"
    ],
    "properties": {
      "dexNumber": {
        "type": "integer",
        "description": "National Pokedex number",
        "minimum": 1
      },
      "name": {
        "type": "string",
        "description": "English name of the Pokemon (includes regional prefix if applicable)"
      },
      "releasedDate": {
        "type": [
          "string",
          "null"
        ],
        "description": "Date when the shiny was first released (YYYY-MM-DD format), or null if not yet released",
        "anyOf": [
          {
            "type": "null"
          },
          {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
          }
        ]
      },
      "family": {
        "type": [
          "string",
          "null"
        ],
        "description": "Evolution family identifier"
      },
      "region": {
        "type": [
          "string",
          "null"
        ],
        "description": "Regional variant or form label (e.g., alolan, galarian, hisuian, paldean), or null for base form"
      },
      "forms": {
        "type": "array",
        "description": "Array of alternative forms/costumes for this Pokemon",
        "items": {
          "type": "object",
          "required": [
            "name",
            "image",
            "imageWidth",
            "imageHeight"
          ],
          "properties": {
            "name": {
              "type": "string",
              "description": "Form identifier (e.g., f19 for Fall 2019, 11 for costume variant)"
            },
            "image": {
              "type": "string",
              "format": "uri",
              "description": "URL to the form's shiny sprite image"
            },
            "imageWidth": {
              "type": "integer",
              "description": "Image width in pixels",
              "const": 256
            },
            "imageHeight": {
              "type": "integer",
              "description": "Image height in pixels",
              "const": 256
            }
          },
          "additionalProperties": false
        }
      },
      "image": {
        "type": "string",
        "format": "uri",
        "description": "URL to the base shiny sprite image (optional, not present for Pokemon with only forms)"
      },
      "imageWidth": {
        "type": "integer",
        "description": "Image width in pixels (optional, not present for Pokemon with only forms)",
        "const": 256
      },
      "imageHeight": {
        "type": "integer",
        "description": "Image height in pixels (optional, not present for Pokemon with only forms)",
        "const": 256
      }
    },
    "additionalProperties": false
  }
}
```
