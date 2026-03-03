# API Overview

## Base URL

```
https://pokemn.quest/data/
```

## About

The Pokémon GO Scraper API provides structured JSON data about Pokémon GO game mechanics, scraped and updated automatically from [LeekDuck](https://leekduck.com). All endpoints return minified JSON arrays served as static files with CORS enabled.

## Authentication

No authentication is required. All endpoints are publicly accessible.

## Rate Limiting

There is no rate limiting. However, data is served as static files through Vercel with CDN caching, so responses may be cached:

- **Browser cache**: 1 hour (`max-age=3600`)
- **CDN cache**: 2 hours (`s-maxage=7200`)
- **Stale-while-revalidate**: 1 hour

## Response Format

All endpoints return `application/json` with UTF-8 encoding. Responses are minified (no whitespace) for reduced bandwidth. Each endpoint returns a JSON array of objects.

## CORS

All `/data/*` endpoints include the `Access-Control-Allow-Origin: *` header, allowing requests from any origin.

## Update Frequency

Data is scraped and updated every 8 hours via an automated pipeline. The pipeline runs three stages:

1. **Scrape** — Fetches top-level data (events, raids, eggs, research, rockets, shinies)
2. **Detailed scrape** — Iterates each event and extracts type-specific detail pages
3. **Combine details** — Merges detailed data back into events and generates per-event-type files

## Endpoints

See [Endpoints.md](Endpoints.md) for a complete list of all available data endpoints with descriptions.

## Data Conventions

- **Null for unknown values**: Fields use `null` (not `0`, `""`, or missing key) when a value is unknown
- **ISO 8601 dates**: All date fields use ISO 8601 format; `null` when unknown
- **`canBeShiny`**: Boolean cross-referenced from the authoritative shinies dataset
- **`dexNumber`**: National Pokédex number extracted from the image URL pattern
- **`eventStatus`**: Computed field (`"upcoming"`, `"active"`, `"ended"`) based on current time vs start/end dates
- **Image fields**: `image` (URL), `imageWidth` (pixels), `imageHeight` (pixels), `imageType` (format)

## Error Handling

Since all data is served as static JSON files, HTTP errors are limited to standard Vercel responses:

| Status | Meaning |
|--------|---------|
| `200`  | Success |
| `304`  | Not modified (cached) |
| `404`  | Endpoint not found |

## Image URLs

All image URLs in the data use the `https://pokemn.quest/` domain. Images are stored in Vercel Blob Storage and served via URL rewrites:

| Path Prefix | Content |
|-------------|---------|
| `/pokemon/` | Pokémon icons and sprites |
| `/events/`  | Event banner images |
| `/types/`   | Type icons |
| `/weather/` | Weather icons |
| `/bonuses/` | Bonus icons |
| `/items/`   | Item icons |
| `/misc/`    | Miscellaneous assets |

## JSON Schemas

All endpoints have corresponding JSON Schema (Draft-07) definitions in the [`schemas/`](../schemas/) directory. These schemas are the source of truth for data types and validation.
