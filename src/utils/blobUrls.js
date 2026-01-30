/**
 * @fileoverview Utility for mapping external image URLs to Vercel Blob URLs.
 * When USE_BLOB_URLS environment variable is set, transforms all image URLs
 * in scraped data to use Blob storage URLs instead of external CDNs.
 * @module utils/blobUrls
 */

const fs = require('fs');
const path = require('path');

const URL_MAP_FILE = path.join(__dirname, '../../data/blob-url-map.json');

/** @type {Object<string, string>|null} Cached URL mapping */
let urlMap = null;

/**
 * Load URL mapping from file (cached)
 * @returns {Object<string, string>} Map of original URL to Blob URL
 */
function loadUrlMap() {
    if (urlMap !== null) return urlMap;

    if (fs.existsSync(URL_MAP_FILE)) {
        try {
            urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
        } catch (err) {
            console.warn(`[blobUrls] Failed to load URL map: ${err.message}`);
            urlMap = {};
        }
    } else {
        urlMap = {};
    }

    return urlMap;
}

/**
 * Clear cached URL map (useful for testing or refreshing)
 */
function clearCache() {
    urlMap = null;
}

/**
 * Check if blob URL transformation is enabled
 * @returns {boolean} True if USE_BLOB_URLS is set
 */
function isEnabled() {
    return process.env.USE_BLOB_URLS === 'true' || process.env.USE_BLOB_URLS === '1';
}

/**
 * Check if a string is an image URL
 * @param {string} str - String to check
 * @returns {boolean} True if string is an image URL
 */
function isImageUrl(str) {
    if (typeof str !== 'string') return false;
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(str);
}

/**
 * Get Blob URL for an external image URL
 * @param {string} externalUrl - Original external URL
 * @returns {string} Blob URL if available and enabled, otherwise original URL
 */
function getBlobUrl(externalUrl) {
    if (!isEnabled()) {
        return externalUrl;
    }

    const map = loadUrlMap();
    return map[externalUrl] || externalUrl;
}

/**
 * Transform all image URLs in an object to Blob URLs (deep transformation)
 * @param {any} obj - Object to transform
 * @returns {any} Transformed object with Blob URLs
 */
function transformUrls(obj) {
    if (!isEnabled()) {
        return obj;
    }

    return transformUrlsRecursive(obj);
}

/**
 * Internal recursive URL transformer
 * @param {any} obj - Object to transform
 * @returns {any} Transformed object
 */
function transformUrlsRecursive(obj) {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle strings - check if image URL
    if (typeof obj === 'string') {
        if (isImageUrl(obj)) {
            return getBlobUrl(obj);
        }
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(transformUrlsRecursive);
    }

    // Handle objects
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = transformUrlsRecursive(value);
        }
        return result;
    }

    // Return primitives as-is
    return obj;
}

/**
 * Get statistics about the URL mapping
 * @returns {Object} Statistics object
 */
function getStats() {
    const map = loadUrlMap();
    const urls = Object.values(map);

    return {
        enabled: isEnabled(),
        totalMappings: Object.keys(map).length,
        blobDomains: [...new Set(urls.map((url) => {
            try {
                return new URL(url).hostname;
            } catch {
                return 'invalid';
            }
        }))],
    };
}

module.exports = {
    loadUrlMap,
    clearCache,
    isEnabled,
    isImageUrl,
    getBlobUrl,
    transformUrls,
    getStats,
};
