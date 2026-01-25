/**
 * @fileoverview Generic event metadata scraper.
 * Extracts presence indicators for various event sections, used to
 * flag which content types are available for an event.
 * @module pages/detailed/generic
 */

const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError } = require('../../utils/scraperUtils');

/**
 * @typedef {Object} GenericEventMeta
 * @property {boolean} hasSpawns - Whether event has wild Pokemon spawns section
 * @property {boolean} hasFieldResearchTasks - Whether event has field research tasks
 * @property {boolean} hasBonuses - Whether event has active bonuses
 * @property {boolean} hasRaids - Whether event has raid-specific content
 * @property {boolean} hasEggs - Whether event has egg pool changes
 * @property {boolean} hasShiny - Whether event has shiny Pokemon info
 */

/**
 * Scrapes generic event metadata from LeekDuck.
 * Creates a lightweight data file indicating which sections are present
 * on the event page. This metadata is used to determine what detailed
 * scrapers should be run and for contextual data aggregation.
 * 
 * @async
 * @function get
 * @param {string} url - Full URL to the event page
 * @param {string} id - Event ID (URL slug)
 * @param {Object[]} bkp - Backup data array for fallback on scraping failure
 * @returns {Promise<void>} Writes temp file with '_generic' suffix on success
 * @throws {Error} Falls back to backup data on failure
 * 
 * @example
 * // Check what content an event has
 * await get('https://leekduck.com/events/some-event/', 'some-event', backupData);
 * // Creates temp file: data/temp/some-event_generic.json
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const generic = {
            hasSpawns: doc.getElementById('spawns') !== null,
            hasFieldResearchTasks: doc.getElementById('field-research-tasks') !== null,
            hasBonuses: doc.getElementById('bonuses') !== null,
            hasRaids: doc.getElementById('raids') !== null,
            hasEggs: doc.getElementById('eggs') !== null,
            hasShiny: doc.getElementById('shiny') !== null
        };

        writeTempFile(id, 'generic', generic, '_generic');
    } catch (err) {
        handleScraperError(err, id, 'generic', bkp, 'generic');
    }
}

module.exports = { get };
