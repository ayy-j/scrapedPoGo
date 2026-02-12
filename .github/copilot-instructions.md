# scrapedPoGo Copilot Instructions

scrapedPoGo is a Node.js (CommonJS) scraper pipeline for Pokémon GO data. It scrapes upstream sources, normalizes data, and serves static JSON from `data/` (plus a simple UI in `public/`).

## Start Here (High-Signal Anchors)
- `package.json`: canonical scripts and runtime dependencies
- `src/scrapers/scrape.js`: stage 1 orchestration (events first, then parallel scrapers)
- `src/scrapers/detailedscrape.js`: stage 2 detailed dispatch + concurrency control
- `src/scrapers/combinedetails.js`: stage 3 merge/flatten + eventType file generation
- `src/scrapers/combineAll.js`: unified dataset + indices/statistics
- `src/utils/scraperUtils.js`: shared fetch/extraction/error-handling contract
- `src/scripts/lib/schema-manifest.js`: canonical schema/data/doc triplets
- `.github/workflows/scraper.yaml`: CI source of truth (Node 20, scheduled every 8 hours)

## Project Type and Stack
- Single-package Node.js repository (not a monorepo)
- CommonJS modules (`require` / `module.exports`), not ESM
- Scraping/parsing: `jsdom`
- Validation: `ajv` + `ajv-formats`
- Optional image hosting rewrite: `@vercel/blob` + URL mapping utilities
- Tests: built-in `node:test` (see `test/compare-docs-data-schemas.test.js`)
- Deployment target: Vercel (see `vercel.json` and `.vercel/`)

## Exact Commands
Use `npm` in this repo (CI and lockfile are npm-based).

- Install deps: `npm install`
- Run stage 1 scrape: `npm run scrape`
- Run stage 2 detailed scrape: `npm run detailedscrape`
- Run stage 3 merge/flatten: `npm run combinedetails`
- Build unified file: `npm run combineall`
- Full pipeline: `npm run pipeline`
- Validate data vs schemas: `npm run validate`
- Compare schema/data/docs (report mode): `npm run compare:schemas`
- Compare schema/data/docs (strict mode): `npm run compare:schemas:strict`
- Upload new images to Blob: `npm run blob:upload -- --dry-run` then `npm run blob:upload`
- Run local visualizer: `npm run serve` (default `http://localhost:3000`)
- Prepare static `public/data` for static hosting: `npm run build`
- Run tests: `npm test`
- Deploy to Vercel (uses `vercel.json` rewrites): `npx vercel --prod` (run `npm run build` first so `public/data` is populated)

## Pipeline Architecture (How Data Flows)
1. Stage 1 (`src/scrapers/scrape.js`)
- Scrapes base datasets into `data/*.min.json`
- `events.get()` runs before raids/research/eggs/rocket/shinies because raids depend on event data

2. Stage 2 (`src/scrapers/detailedscrape.js`)
- Reads `data/events.min.json`
- For each event, always runs `generic.get(...)` plus a type-specific scraper
- Uses concurrency limit 5 via `runWithConcurrency`
- Writes temporary files to `data/temp/*.json`

3. Stage 3 (`src/scrapers/combinedetails.js`)
- Merges temp files into events
- Flattens event objects through `segmentEventData(...)`
- Computes `isGlobal` and `eventStatus`
- Writes `data/events.min.json` and `data/eventTypes/*.min.json`
- Deletes `data/temp/`

4. Unified stage (`src/scrapers/combineAll.js`)
- Reads base datasets + `data/eventTypes/*.min.json`
- Builds `pokemonIndex`, `indices`, and `stats`
- Writes `data/unified.min.json`

## Core Conventions to Follow

### Scraper module contracts
- Top-level scrapers export `get()` (see `src/pages/events.js`, `src/pages/raids.js`)
- Detailed scrapers export `get(url, id, bkp)` (see `src/pages/detailed/communityday.js`)
- Detailed scrapers write temp payloads with `writeTempFile(...)` from `src/utils/scraperUtils.js`
- On failures, use `handleScraperError(...)` fallback path from `src/utils/scraperUtils.js`

### Shared extraction/utilities
- Prefer existing helpers in `src/utils/scraperUtils.js` before adding custom parsing
- Use `getJSDOM(...)` instead of ad-hoc fetch/parsing; it includes request coalescing and timeout behavior
- Use selector null-checks defensively; upstream HTML shape changes frequently
- Use `textContent`-based extraction patterns used across existing scrapers

### Data outputs and schemas
- Scraper pipeline source-of-truth outputs are minified files in `data/*.min.json`
- Canonical schema/data/doc mapping lives in `src/scripts/lib/schema-manifest.js`
- Schema files are in `schemas/*.schema.json`

## Adding a New `eventType` Scraper
When adding a new detailed event type, update all of these:
- Add scraper file: `src/pages/detailed/<type>.js` (follow `communityday.js` pattern)
- Register dispatch in `src/scrapers/detailedscrape.js`
- Add merge allowlist handling in `src/scrapers/combinedetails.js`
- Ensure flattened field mapping is covered in `segmentEventData(...)` if needed
- Add `eventType` enum value in `schemas/events.schema.json`
- Add/refresh docs in `dataDocumentation/eventTypes/`

## Blob/Image URL Workflow
- Blob URL rewrites are controlled by `USE_BLOB_URLS` (`src/utils/blobUrls.js`)
- URL mapping file: `src/utils/blob-url-map.json`
- Path generation/canonicalization logic: `src/utils/blobNaming.js`
- Upload script: `src/scripts/upload-images-to-blob.js`
- CI sets `USE_BLOB_URLS=true` and runs upload only when `BLOB_READ_WRITE_TOKEN` exists (`.github/workflows/scraper.yaml`)

## Deployment (Vercel)
- Hosting lives on Vercel; production config is `vercel.json` (public output served from `public/`, data under `/data/*` with cache headers and blob rewrites)
- Build assets/data locally with `npm run build` before `npx vercel --prod`
- Use the Vercel MCP tools (`vercel/*`) for inspecting deployments, logs, and project metadata when automation is needed

## Testing and Validation Expectations
- Always run `npm test` after touching scraper/utility/script logic
- Run `npm run validate` after pipeline/schema changes
- If changing docs or schemas, run `npm run compare:schemas`
- Strict compare currently surfaces many canonical mismatches in this repo; use strict mode when intentionally reconciling schema/data/doc parity

## Known Gotchas
- `detailedscrape` assumes `data/events.min.json` already exists from stage 1
- `combineall` depends on `data/eventTypes/*.min.json` from stage 3
- There is no lint script in `package.json`; do not reference `npm run lint` unless you add it
- `npm run build` only copies `data/` into `public/data/`; it is not a transpile/bundle build
