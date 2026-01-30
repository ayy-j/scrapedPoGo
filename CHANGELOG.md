# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-29

### Added

#### Core Features
- Web scraper for Pokémon GO event data from LeekDuck.com
- Support for multiple data types:
  - Events (with detailed event type breakdowns)
  - Raids (with boss tiers and mechanics)
  - Research (field, special, and breakthrough tasks)
  - Eggs (distance and pool tracking)
  - Rocket Lineups (Team GO Rocket encounters)
  - Shinies (availability tracking)

#### Event Type Support
- Community Day events
- GO Battle League seasons
- GO Pass events
- Max Battles
- Max Mondays
- Pokémon GO Tour
- Pokémon Spotlight Hour
- Pokéstop Showcase
- Raid Battles
- Raid Day
- Raid Hour
- Research events
- Research Day
- Seasons
- Team GO Rocket takeovers
- Timed Research
- Breakthrough Research

#### Image Management
- Vercel Blob Storage integration for image hosting
- Automatic image upload script with incremental updates
- Blob URL detection to skip already-uploaded images
- Image dimension calculation and embedding
- URL transformation from external to Blob storage
- Support for Pokémon images, reward images, and event banners
- Dry-run mode for testing uploads
- Force upload option to override existing blobs

#### Data Validation
- JSON Schema validation for all data files
  - Events schema
  - Raids schema
  - Research schema
  - Eggs schema
  - Rocket Lineups schema
  - Shinies schema
- Automated validation script with detailed reporting
- Schema documentation in `/schemas` directory

#### Documentation
- Comprehensive README with quick start guide
- Individual documentation files for each data type:
  - Events.md
  - Raids.md
  - Research.md
  - Eggs.md
  - RocketLineups.md
  - Shinies.md
  - Endpoints.md
- Event type specific documentation in `/docs/eventTypes`
- Schema references and examples

#### Automation
- GitHub Actions workflow for automated scraping
- Scheduled runs for data updates
- Complete pipeline script combining all scrapers
- DigitalOcean deployment workflow

#### Developer Tools
- Colorful CLI logger for better visibility
- Image size calculation script
- Blob URL mapping and tracking
- Schema validation tooling
- Multiple scraper modes:
  - Basic scrape
  - Detailed scrape
  - Combined details
  - Shiny Pokémon scrape

### Enhanced
- Season data extraction with bonuses and GO Pass tiers
- Date handling in event processing
- Event data handling to preserve detailed fields
- Image dimension fetching performance (fixed hanging issues)

### Fixed
- Path traversal vulnerability in temporary file writing
- Image dimension fetching hang issues
- Merge conflicts and PR review feedback
- Validation counting and schema patterns
- Invalid dependencies label in dependabot.yml
- .DS_Store tracking on macOS systems

### Changed
- Project renamed from ScrapedDuck to scrapedPoGo
- Migrated all image URLs to Vercel Blob Storage
- Standardized CLI logging with consistent colors and emojis
- Documentation structure and endpoint organization
- File locations and path references

### Developer Experience
- Copilot instructions for better AI assistance
- Agent templates for code improvement
- Documentation specialist configuration
- Consistent code formatting and structure

## Project Origins - 2026-01-24

### Initial Release
- Project initialization and basic structure
- Core scraping functionality implemented
- Initial file uploads and project setup
- Basic workflow configuration

---

## Release Notes

### Version 1.0.0
This is the first stable release of scrapedPoGo. The project provides a comprehensive solution for scraping and managing Pokémon GO event data from LeekDuck.com, with full support for multiple event types, data validation, image management, and automated workflows.

**Key Highlights:**
- 📊 Complete data coverage for all major Pokémon GO event types
- 🖼️ Integrated image management with Vercel Blob Storage
- ✅ JSON Schema validation for data integrity
- 📚 Extensive documentation for all endpoints and data structures
- 🤖 Automated GitHub Actions workflows
- 🛠️ Developer-friendly tooling and scripts

**Data Files Generated:**
- `data/events.min.json` - All events with detailed information
- `data/raids.min.json` - Current and upcoming raid bosses
- `data/research.min.json` - Field and special research tasks
- `data/eggs.min.json` - Egg pools and distances
- `data/rocketLineups.min.json` - Team GO Rocket lineups
- `data/shinies.min.json` - Shiny Pokémon availability
- `data/eventTypes/*.min.json` - Event-type specific breakdowns

**Scripts Available:**
- `npm run scrape` - Scrape basic data
- `npm run scrapeshinies` - Scrape shiny data
- `npm run detailedscrape` - Scrape detailed event info
- `npm run combinedetails` - Combine and organize data
- `npm run pipeline` - Run complete workflow
- `npm run validate` - Validate all schemas
- `npm run blob:upload` - Upload images to Vercel Blob
- `npm run blob:transform` - Transform URLs to Blob storage

---

[1.0.0]: https://github.com/ayy-j/scrapedPoGo/releases/tag/v1.0.0
