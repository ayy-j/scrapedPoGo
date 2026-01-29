# AGENTS.md

This guide is for agentic coding assistants working in this repository.
It summarizes how to build/run/validate and the code style conventions
observed in the codebase. It also includes the Copilot rules.

## Quick facts
- Repo purpose: scrape LeekDuck.com for Pokemon GO data and emit JSON files.
- Language/runtime: Node.js, CommonJS modules.
- Entry points: scripts in `src/scrapers/`.
- Outputs: JSON files in `data/` (pretty + `.min.json`).

## Commands (build/lint/test)
- Install dependencies: `npm install`
- Basic scrape (events, raids, research, eggs, rocket lineups): `npm run scrape`
- Detailed event scraping to temp: `npm run detailedscrape`
- Merge detailed data into events + generate per-eventType files: `npm run combinedetails`
- Scrape shinies: `npm run scrapeshinies`
- Full pipeline: `npm run pipeline`
- Schema validation: `npm run validate`

### Running a single "test"
There is no unit test runner or lint command in this repo.
To validate a specific change, run a targeted scraper script and validate:
- Single scraper entry point: `node src/scrapers/scrape.js`
- Single detailed scraper pass: `node src/scrapers/detailedscrape.js`
- Merge only: `node src/scrapers/combinedetails.js`
- Then run: `npm run validate`

If you add a test/lint command, update this file.

## Copilot instructions (must follow)
Source: `.github/copilot-instructions.md`.

### Architecture and data flow
- Entry points live in `src/scrapers/`: `scrape.js`, `detailedscrape.js`, `combinedetails.js`, `scrapeShinies.js`.
- Basic scraping calls page modules in `src/pages/` and writes JSON into `data/`.
- Detailed scraping loads `data/events.min.json`, fetches CDN backup, then dispatches by `eventType` to `src/pages/detailed/*` and always runs `detailed/generic.js`.
- Temp detail output goes to `data/temp/*.json` via `utils/scraperUtils.writeTempFile()` and is merged/deleted by `combinedetails.js`.

### Project conventions
- Detailed scrapers export `get(url, id, bkp)` and use `writeTempFile()` + `handleScraperError()` for CDN fallback (`extraData`).
- Event type strings in `detailedscrape.js` and `combinedetails.js` must stay in sync when adding a new detailed scraper.
- Outputs write minified JSON only to `data/` (see `scrapeShinies.js`, `combinedetails.js`).
- Shiny flags come from `data/shinies.json` via `src/utils/shinyData.js`; image URLs can infer dex numbers.
- Image metadata (width/height/type) comes from `utils/imageDimensions` inside `extractPokemonList()`; pass `{ fetchDimensions: false }` to skip.
- Debugging: set `DEBUG=1` to surface scraper fallback errors in `handleScraperError()`.
- Date handling: use `normalizeDate()`, `normalizeDatePair()`, `isGlobalEvent()` from `scraperUtils.js`.
  Local events have no "Z" suffix; global events do.

### Workflows and commands
- `npm run scrape` -> basic data in `data/*.json`.
- `npm run detailedscrape` -> temp detail files in `data/temp/`.
- `npm run combinedetails` -> merge details into `data/events.json` and delete `data/temp/`.
- `npm run scrapeshinies` -> refresh `data/shinies.json`.
- `npm run pipeline` -> full end-to-end refresh.

### Docs and contracts
- Public JSON shapes are documented in `docs/*.md`; update those when changing output fields.
- Source HTML is from LeekDuck; use JSDOM-based extraction patterns in `src/utils/scraperUtils.js`.

## Code style guidelines
These are based on existing code patterns. Match the local file style.

### Modules, imports, and exports
- Use CommonJS: `const x = require('...')`, `module.exports = { ... }`.
- Prefer top-level `const`/`let`; avoid introducing `var` in new code unless matching a legacy file.
- Keep imports grouped at the top; local utilities come from `src/utils/`.

### Formatting and structure
- Indentation is 4 spaces.
- Braces often follow Allman style (opening brace on the next line) in older files.
- Semicolons are used in most files, but not always; follow the existing file's convention.
- Keep lines readable and use early returns or guard clauses to reduce nesting when appropriate.

### Naming conventions
- Functions and variables use lowerCamelCase.
- Files and folders are lower-case, hyphen-free for the most part.
- Event type identifiers are kebab-case (e.g., `community-day`, `raid-hour`).
- JSON output keys are lowerCamelCase; keep them consistent with docs and schemas.

### Types and documentation
- JSDoc is common for modules, functions, and complex data structures.
- Use `@typedef` blocks for object shapes that are reused or complex.
- When adding fields to output JSON, also update docs in `docs/*.md` and schemas in `schemas/`.

### Error handling and logging
- Use `try/catch` around network/DOM parsing.
- Prefer `handleScraperError()` for detailed scrapers to fall back to CDN data.
- Use `src/utils/logger.js` for structured logs; honor `DEBUG=1` for extra error detail.
- Avoid throwing unhandled errors in scraper loops; log and continue when possible.

### Data handling
- Scrapers emit to `data/` and minified versions to `.min.json`.
- Detailed scrapers should write temp files using `writeTempFile()` and let `combinedetails.js` merge them.
- When extracting Pokemon lists, consider `{ fetchDimensions: false }` for performance unless needed.

### Date handling
- Use `normalizeDate()` and `normalizeDatePair()` for dates from LeekDuck feeds.
- Use `isGlobalEvent()` to distinguish UTC-global vs local events.

### Patterns to preserve
- Use `JSDOM.fromURL()` for page fetch + parse.
- Prefer shared utilities in `src/utils/scraperUtils.js` for extraction logic.
- Keep `eventType` dispatch logic in `detailedscrape.js` and `combinedetails.js` aligned.

## Files worth knowing
- `src/scrapers/` entry points for scraping workflows.
- `src/pages/` base page scrapers.
- `src/pages/detailed/` detailed event scrapers by event type.
- `src/utils/scraperUtils.js` shared extraction + date + error handling utilities.
- `docs/*.md` API contract and output formats.
- `schemas/*.schema.json` JSON schema definitions for outputs.

## When changing outputs
- Update `docs/*.md` and `schemas/*.schema.json` for any new/changed fields.
- Run `npm run validate` to ensure schemas still pass.
