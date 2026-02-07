/**
 * @fileoverview Main scraper orchestrator for Pokemon GO data.
 * Entry point that coordinates scraping of all primary data sources:
 * events, raids, research, eggs, and Team GO Rocket lineups.
 * @module scrapers/scrape
 */

const fs = require('fs');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const dbSync = require('../utils/dbSync');
const events = require('../pages/events')
const raids = require('../pages/raids')
const research = require('../pages/research')
const eggs = require('../pages/eggs')
const rocketLineups = require('../pages/rocketLineups')
const shinies = require('../pages/shinies')

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

    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    // Create a scrape_run record (returns null if DB is unavailable)
    const runId = await dbSync.startRun('scrape');

    try {
        // Events must be scraped first as Raids scraper depends on events data
        await events.get(runId);

        // Run remaining scrapers in parallel
        await Promise.all([
            raids.get(runId),
            research.get(runId),
            eggs.get(runId),
            rocketLineups.get(runId),
            shinies.get(runId)
        ]);

        logger.success("All primary scrapers completed.");
        await dbSync.completeRun(runId, { step: 'scrape' });
    } catch (e) {
        await dbSync.failRun(runId, e.message || String(e));
        throw e;
    }
}

main().catch(e => {
    logger.error(e);
    process.exit(1);
});
