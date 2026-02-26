/**
 * @fileoverview Main scraper orchestrator for Pokemon GO data.
 * Entry point that coordinates scraping of all primary data sources:
 * events, raids, research, eggs, and Team GO Rocket lineups.
 * @module scrapers/scrape
 */

const fs = require('fs');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const events = require('../pages/events')
const raids = require('../pages/raids')
const research = require('../pages/research')
const eggs = require('../pages/eggs')
const rocketLineups = require('../pages/rocketLineups')
const shinies = require('../pages/shinies')
const { saveCache } = require('../utils/imageDimensions');
const { initUrlMap } = require('../utils/blobUrls');
const { setShinyData } = require('../utils/shinyData');

dotenv.config();
dotenv.config({ path: '.env.local' });

/**
 * Main function that orchestrates all primary scrapers.
 * Creates the data directory if it doesn't exist, then initiates
 * parallel scraping of all data sources.
 *
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 *
 * @example
 * // Run via npm script or directly:
 * // node src/scrapers/scrape.js
 * // Creates data/*.json files for all sources
 */
async function main()
{
    logger.start("Starting primary scrapers...");

    await initUrlMap();

    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    // Events and Shinies can be scraped in parallel first.
    // Shinies are needed for raids/research/eggs to verify shiny status.
    // Events are needed for raids to determine event status.
    const [_, shinyData] = await Promise.all([
        events.get(),
        shinies.get()
    ]);

    // Populate the in-memory shiny cache so subsequent scrapers
    // don't need to read from disk.
    if (shinyData && shinyData.length > 0) {
        setShinyData(shinyData);
        logger.info(`Primed shiny cache with ${shinyData.length} entries.`);
    }

    // Run remaining scrapers in parallel
    // These depend on the shiny data being available in memory (or on disk)
    await Promise.all([
        raids.get(),
        research.get(),
        eggs.get(),
        rocketLineups.get()
    ]);

    await saveCache();
    logger.success("All primary scrapers completed.");
}

main().catch(e => {
    logger.error(e);
    process.exit(1);
});
