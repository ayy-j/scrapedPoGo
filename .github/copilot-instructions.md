# Copilot Instructions for scrapedPoGo

This project scrapes Pokémon GO event data from [LeekDuck.com](https://leekduck.com) and serves it as a JSON API at `https://pokemn.quest/data/`.

## Architecture Overview

**Three-stage scraping pipeline:**
1. `npm run scrape` → Basic event metadata (name, dates, images) → `data/events.min.json`
2. `npm run detailedscrape` → Event-specific content (Pokemon, bonuses, raids) → `data/temp/*.json`
3. `npm run combinedetails` → Merges temp files + generates per-eventType files → `data/eventTypes/*.json`

**Key directories:**
- `src/pages/` - Basic scrapers for each data type (events, raids, eggs, research, shinies)
- `src/pages/detailed/` - Type-specific detailed scrapers (one per eventType)
- `src/utils/scraperUtils.js` - **Core utility library** with 1200+ lines of shared extraction functions
- `schemas/` - JSON schemas for validation (`npm run validate`)
- `data/` - Output JSON files (both `.json` formatted and `.min.json` minified)

## Scraper Patterns

**Adding a new eventType scraper:**
1. Create `src/pages/detailed/{eventtype}.js` following existing patterns (see `communityday.js`)
2. Register in `src/scrapers/detailedscrape.js` switch statement
3. Add event type to `schemas/events.schema.json` enum
4. Document in `docs/eventTypes/{EventType}.md`

**Standard scraper structure:**
```javascript
const { writeTempFile, handleScraperError, extractPokemonList, extractBonuses } = require('../../utils/scraperUtils');

async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url);
        const doc = dom.window.document;
        // Extract data using scraperUtils helpers
        writeTempFile(id, 'event-type', data);
    } catch (err) {
        handleScraperError(err, id, 'event-type', bkp, 'scraperKey');
    }
}
```

**Key extraction utilities in `scraperUtils.js`:**
- `extractPokemonList(container)` - Parses `.pkmn-list-flex` containers
- `extractBonuses(container)` - Parses bonus sections
- `extractResearchTasks(container)` - Parses research task lists
- `extractSection(doc, sectionId)` - Gets content from event sections
- `writeTempFile(id, type, data)` - Writes to `data/temp/` for later combination

## Data Conventions

**Event data structure:** All fields flattened to top level (no nested `details` wrapper):
```javascript
{ eventID, name, eventType, heading, image, start, end, pokemon: [], raids: [], bonuses: [] }
```

**Pokemon objects** always include `source` field: `'spawn'`, `'featured'`, `'incense'`, `'costumed'`, `'debut'`, `'maxDebut'`

**Date format:** ISO 8601 with milliseconds: `2026-01-29T10:00:00.000`

## Commands Reference

```bash
npm run pipeline          # Full scrape (all stages)
npm run validate          # Validate data against JSON schemas
npm run blob:upload       # Upload images to Vercel Blob (requires BLOB_READ_WRITE_TOKEN)
npm run blob:transform    # Replace CDN URLs with Blob URLs in data files
```

## CI/CD

GitHub Actions runs the full pipeline every 8 hours (see `scraper.yml`). Individual scrape steps use `continue-on-error: true` for resilience.

## External Dependencies

- **jsdom** - DOM parsing for scraping
- **moment** - Date handling
- **@vercel/blob** - Image storage (optional, controlled by `USE_BLOB_URLS` env var)
- Data source: `https://leekduck.com/events/` and `/feeds/events.json`
