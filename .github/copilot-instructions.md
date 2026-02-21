# Copilot Instructions — scrapedPoGo

## Project Overview

A Node.js web scraper that extracts Pokémon GO game data from [LeekDuck](https://leekduck.com), transforms it into structured JSON, and serves it as a public REST API at `https://pokemn.quest/data/`. Deployed on Vercel as a static site with image rewrites to Vercel Blob Storage.

## Architecture

### Four-Stage Pipeline

The scraper runs as an ordered pipeline (`npm run pipeline`). Each stage depends on the previous:

1. **`scrape`** — Primary scrapers (`src/pages/*.js`) fetch top-level data (events, raids, eggs, research, rockets, shinies). Events must run first since raids depends on event data. Output: `data/*.min.json`.
2. **`detailedscrape`** — Detailed scrapers (`src/pages/detailed/*.js`) iterate each event, dispatching to a type-specific scraper (e.g., `communityday.js`, `raidhour.js`) plus the `generic.js` metadata scraper. Output: `data/temp/*.json`.
3. **`combinedetails`** — Merges temp files back into events, generates per-eventType files (`data/eventTypes/*.min.json`), computes `eventStatus`, flattens nested `details` wrappers, then deletes `data/temp/`.
4. **`combineall`** — Builds `data/unified.min.json` with a cross-referenced Pokémon index from all datasets.

### Key Directories

| Path | Purpose |
|------|---------|
| `src/pages/` | Primary scrapers (one per dataset), each export `{ get }` |
| `src/pages/detailed/` | Event-type scrapers (18 types), each export `{ get }` |
| `src/utils/scraperUtils.js` | ~1700-line shared utility module — DOM extraction, file I/O, error handling |
| `src/scripts/` | Validation, schema comparison, blob upload tooling |
| `schemas/` | JSON Schema Draft-07 definitions for all datasets |
| `dataDocumentation/` | Markdown docs with field tables + embedded JSON Schema blocks |
| `data/` | Canonical scraped output (committed to git, auto-updated by CI) |
| `public/data/` | Build output served by Vercel |

## Commands

```bash
npm run pipeline          # Full scrape (stages 1–4, sets USE_BLOB_URLS=true)
npm run scrape            # Stage 1 only
npm run detailedscrape    # Stage 2 only
npm run combinedetails    # Stage 3 only
npm run combineall        # Stage 4 only
npm run validate          # Validate data/*.min.json against schemas/*.schema.json (ajv)
npm run compare:schemas   # Check alignment of schemas ↔ data ↔ docs (report mode)
npm run test              # node --test (runs test/*.test.js)
npm run serve             # Local dev server on port 3000
npm run build             # Copy data/ → public/data/
npm run blob:upload       # Upload new images to Vercel Blob Storage
```

## Data Contract: The Schema ↔ Data ↔ Docs Triangle

Every dataset has three linked artifacts defined in `src/scripts/lib/schema-manifest.js`:

1. **Schema** (`schemas/<name>.schema.json`) — JSON Schema Draft-07, source of truth for types
2. **Data** (`data/<name>.min.json`) — Actual scraped output
3. **Docs** (`dataDocumentation/<Name>.md`) — Markdown with a Fields table and an embedded `## JSON Schema` code block

The test `npm run test` enforces zero misalignment between all three via `compare-docs-data-schemas.js`. When changing any field:
- Update the scraper output
- Update the schema
- Update the doc's field table AND embedded JSON Schema block

Event types share `schemas/events.schema.json` but each has its own doc in `dataDocumentation/eventTypes/`.

## Conventions

### DOM Extraction

- **Always use `textContent`**, never `innerHTML` for text extraction (XSS prevention).
- For multi-line text with `<br>` delimiters, iterate `childNodes` and join text nodes separated by BR elements — never split `innerHTML` on `<br>`.
- Use `getJSDOM(url)` from `scraperUtils.js` instead of `JSDOM.fromURL()`. It adds request coalescing, timeouts, and user-agent headers.
- All outbound URLs pass through `validateUrl()` in `src/utils/security.js` (blocks private IPs, non-HTTP protocols, localhost).

### Scraper Pattern

Every scraper follows the same structure:

```js
const { writeTempFile, handleScraperError, getJSDOM, extractPokemonList } = require('../../utils/scraperUtils');

async function get(url, id, bkp) {
    try {
        const dom = await getJSDOM(url);
        const doc = dom.window.document;
        // Extract data using doc.querySelector / doc.querySelectorAll
        // Use shared extractors: extractPokemonList, extractBonuses, extractResearchTasks, etc.
        await writeTempFile(id, 'event-type', data);
    } catch (err) {
        await handleScraperError(err, id, 'event-type', bkp, 'scraperKey');
    }
}
module.exports = { get };
```

### Image Handling

- Images are uploaded to Vercel Blob and mapped via `src/utils/blob-url-map.json`.
- `transformUrls(data)` rewrites external CDN URLs to blob URLs when `USE_BLOB_URLS=true`.
- Image dimensions are fetched via header-only reads (`image-size` lib), cached at `.cache/imageDimensions.json`.
- Event banners are stored at 50% dimensions — the scraper calls `halfSize()` before persisting.

### Data Conventions

- **Null for unknown values**: Use `null` (not `0`, `""`, or missing key) when a value is unknown (e.g., CP not available).
- **ISO 8601 dates**: All date fields use ISO 8601 format. `null` when unknown.
- **`eventStatus`**: Computed field (`"upcoming"`, `"active"`, `"ended"`) based on current time vs start/end dates.
- **`canBeShiny`**: Boolean on Pokémon objects, cross-referenced from shiny data via `src/utils/shinyData.js`.
- **`dexNumber`**: National Pokédex number, extracted from image URL pattern `pm<number>`.

### Module Style

- CommonJS (`require`/`module.exports`) throughout — no ESM.
- Use `src/utils/logger.js` for logging (`logger.info`, `logger.success`, `logger.warn`, `logger.error`, `logger.start`).
- JSDoc `@fileoverview` and `@typedef` blocks on every module.

## CI/CD

GitHub Actions (`.github/workflows/scraper.yaml`) runs the full pipeline every 8 hours, uploads new images to blob storage, and auto-commits updated `data/` files. Each pipeline stage uses `continue-on-error: true` for resilience.

## External Dependencies

- **Source**: [LeekDuck](https://leekduck.com) — events page + JSON feed at `/feeds/events.json`
- **Hosting**: Vercel (static `public/` dir) with image rewrites to Vercel Blob Storage
- **Key packages**: `jsdom` (DOM parsing), `image-size` (header-only dimension reads), `moment` (date parsing), `@vercel/blob` (image uploads), `ajv` + `ajv-formats` (schema validation, devDep)
