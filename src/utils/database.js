/**
 * @fileoverview Database connection utility using Neon serverless PostgreSQL.
 * Provides a reusable SQL client and connection helpers.
 * Gracefully degrades when DATABASE_URL is not set, allowing the
 * scraper pipeline to continue operating in file-only mode.
 * @module utils/database
 */

const { neon } = require('@neondatabase/serverless');
const logger = require('./logger');

let _sql = null;
let _enabled = false;

/**
 * Initializes the Neon SQL client from DATABASE_URL.
 * Safe to call multiple times; returns the cached client.
 *
 * @returns {Function|null} Tagged-template SQL function, or null if DB is unavailable.
 */
function getClient() {
    if (_sql) return _sql;

    const url = process.env.DATABASE_URL;
    if (!url) {
        if (!_enabled) {
            logger.warn('DATABASE_URL not set — database sync disabled. Pipeline will write JSON files only.');
        }
        return null;
    }

    try {
        _sql = neon(url);
        _enabled = true;
        return _sql;
    } catch (err) {
        logger.error('Failed to initialize Neon client: ' + err.message);
        return null;
    }
}

/**
 * Returns true when a working database connection is available.
 * @returns {boolean}
 */
function isEnabled() {
    return getClient() !== null;
}

module.exports = { getClient, isEnabled };
