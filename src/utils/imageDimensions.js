/**
 * @fileoverview Image Dimensions Utility for Pokemon GO scrapers.
 * Fetches actual image dimensions from remote URLs by reading image headers.
 * Supports PNG, JPEG/JPG, GIF, WebP, SVG, BMP, ICO, and more formats.
 * Uses the image-size package which parses headers without downloading full images.
 * @module utils/imageDimensions
 */

const https = require('https');
const http = require('http');
const { imageSize } = require('image-size');

/**
 * @typedef {Object} ImageDimensions
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {string} type - Image format type (e.g., "png", "jpg", "webp")
 */

/** @type {Map<string, ImageDimensions>} Cache to avoid redundant fetches */
const dimensionCache = new Map();

/** @type {Map<string, Promise<ImageDimensions|null>>} Map of in-flight requests */
const pendingRequests = new Map();

/**
 * Validates a URL to prevent SSRF attacks.
 * Rejects non-HTTP/HTTPS protocols and private IP addresses/localhost.
 *
 * @param {string} urlString - The URL to validate
 * @returns {boolean} True if the URL is valid, false otherwise
 */
function validateUrl(urlString) {
    try {
        const url = new URL(urlString);

        // Protocol check
        if (!['http:', 'https:'].includes(url.protocol)) {
            if (process.env.DEBUG) console.error(`Invalid protocol: ${url.protocol}`);
            return false;
        }

        // Hostname check
        const hostname = url.hostname;

        // Block localhost
        if (hostname === 'localhost' || hostname === '::1' || hostname === '0.0.0.0') {
            if (process.env.DEBUG) console.error(`Blocked local hostname: ${hostname}`);
            return false;
        }

        // Block private IP ranges (IPv4)
        // 10.0.0.0/8      -> ^10\.
        // 172.16.0.0/12   -> ^172\.(1[6-9]|2[0-9]|3[0-1])\.
        // 192.168.0.0/16  -> ^192\.168\.
        // 169.254.0.0/16  -> ^169\.254\.
        // 127.0.0.0/8     -> ^127\.
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|127\.)/;
        if (privateIpRegex.test(hostname)) {
            if (process.env.DEBUG) console.error(`Blocked private IP: ${hostname}`);
            return false;
        }

        // Block IPv6 Unique Local Addresses (fc00::/7) and Link-local (fe80::/10)
        if (/^[fF][cCdD]/.test(hostname) || /^[fF][eE]80:/.test(hostname)) {
             if (process.env.DEBUG) console.error(`Blocked private IPv6: ${hostname}`);
             return false;
        }

        // NOTE: This check is vulnerable to DNS rebinding and bypasses via alternative IP formats (e.g. hex/octal).
        // A more robust solution would involve resolving DNS and validating the IP address, but this requires
        // more complex network logic or external libraries. This regex provides basic protection against common
        // localhost/private IP usage.

        return true;
    } catch (e) {
        if (process.env.DEBUG) console.error(`Invalid URL format: ${urlString}`);
        return false;
    }
}

/**
 * Fetches image dimensions from a URL by reading image headers.
 * Results are cached to avoid redundant network requests.
 * 
 * @async
 * @param {string} url - The image URL to fetch dimensions for
 * @param {number} [timeout=5000] - Request timeout in milliseconds
 * @returns {Promise<ImageDimensions|null>} Dimensions object or null on failure
 * 
 * @example
 * const dims = await getImageDimensions('https://example.com/image.png');
 * if (dims) {
 *   console.log(`${dims.width}x${dims.height} ${dims.type}`);
 * }
 */
async function getImageDimensions(url, timeout = 5000) {
    if (!url) return null;
    
    // Check cache first
    if (dimensionCache.has(url)) {
        return dimensionCache.get(url);
    }

    // Check pending requests
    if (pendingRequests.has(url)) {
        return pendingRequests.get(url);
    }
    
    const promise = (async () => {
        try {
            const buffer = await fetchImageBuffer(url, timeout);
            if (!buffer || buffer.length === 0) {
                return null;
            }
            
            const dimensions = imageSize(buffer);
            if (dimensions && dimensions.width && dimensions.height) {
                const result = {
                    width: dimensions.width,
                    height: dimensions.height,
                    type: dimensions.type || 'unknown'
                };

                // Cache the result
                dimensionCache.set(url, result);
                return result;
            }

            return null;
        } catch (err) {
            // Log in debug mode only
            if (process.env.DEBUG) {
                console.error(`Error getting dimensions for ${url}:`, err.message);
            }
            return null;
        } finally {
            pendingRequests.delete(url);
        }
    })();

    pendingRequests.set(url, promise);
    return promise;
}

/**
 * Fetches image data buffer from URL.
 * Only fetches enough bytes to determine dimensions (up to 128KB for safety).
 * Handles HTTP redirects automatically.
 * 
 * @param {string} url - The image URL to fetch
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Buffer|null>} Image data buffer or null on failure
 */
function fetchImageBuffer(url, timeout) {
    return new Promise((resolve) => {
        if (!validateUrl(url)) {
            resolve(null);
            return;
        }

        const protocol = url.startsWith('https') ? https : http;
        const maxBytes = 128 * 1024; // 128KB max (plenty for headers, SVGs may need more)
        
        const req = protocol.get(url, { timeout }, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(fetchImageBuffer(response.headers.location, timeout));
                return;
            }
            
            if (response.statusCode !== 200) {
                resolve(null);
                return;
            }
            
            const chunks = [];
            let totalBytes = 0;
            
            response.on('data', (chunk) => {
                chunks.push(chunk);
                totalBytes += chunk.length;
                
                // Stop reading once we have enough bytes
                if (totalBytes >= maxBytes) {
                    response.destroy();
                    resolve(Buffer.concat(chunks));
                }
            });
            
            response.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            // Fallback for when destroy() is called and 'end' is not emitted
            response.on('close', () => {
                resolve(Buffer.concat(chunks));
            });
            
            response.on('error', () => {
                resolve(null);
            });
        });
        
        req.on('error', () => {
            resolve(null);
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
    });
}

/**
 * Gets dimensions for multiple image URLs in parallel with batching.
 * Processes in batches to avoid overwhelming the network.
 * Deduplicates URLs and caches results.
 * 
 * @async
 * @param {string[]} urls - Array of image URLs to process
 * @param {number} [batchSize=10] - Number of concurrent requests per batch
 * @returns {Promise<Map<string, ImageDimensions>>} Map of URL to dimensions
 * 
 * @example
 * const urls = ['https://example.com/img1.png', 'https://example.com/img2.png'];
 * const dimsMap = await getMultipleImageDimensions(urls);
 * dimsMap.forEach((dims, url) => {
 *   console.log(`${url}: ${dims.width}x${dims.height}`);
 * });
 */
async function getMultipleImageDimensions(urls, batchSize = 10) {
    const results = new Map();
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    
    // Process in batches
    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        const batch = uniqueUrls.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (url) => {
                const dims = await getImageDimensions(url);
                return { url, dims };
            })
        );
        
        batchResults.forEach(({ url, dims }) => {
            if (dims) {
                results.set(url, dims);
            }
        });
    }
    
    return results;
}

/**
 * Recursively traverses an object/array and fills missing image dimension fields
 * for objects that contain an image URL in the `image` property.
 *
 * Mutates the input object in-place.
 *
 * @async
 * @param {any} root - Object/array tree to enrich
 * @param {Object} [options] - Enrichment options
 * @param {string} [options.imageKey='image'] - Property name containing image URL
 * @param {string} [options.widthKey='imageWidth'] - Width property name
 * @param {string} [options.heightKey='imageHeight'] - Height property name
 * @param {string} [options.typeKey='imageType'] - Image type property name
 * @param {boolean} [options.onlyMissing=true] - Only fill when width/height are missing
 * @returns {Promise<{candidates:number,enriched:number,missing:number}>} Enrichment stats
 */
async function enrichMissingImageDimensions(root, options = {}) {
    const {
        imageKey = 'image',
        widthKey = 'imageWidth',
        heightKey = 'imageHeight',
        typeKey = 'imageType',
        onlyMissing = true
    } = options;

    /** @type {{node:Object,url:string}[]} */
    const targets = [];

    function walk(node) {
        if (!node) return;

        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }

        if (typeof node !== 'object') return;

        const imageUrl = node[imageKey];
        if (typeof imageUrl === 'string' && imageUrl.length > 0) {
            const hasWidth = Number.isFinite(node[widthKey]);
            const hasHeight = Number.isFinite(node[heightKey]);

            if (!onlyMissing || !(hasWidth && hasHeight)) {
                targets.push({ node, url: imageUrl });
            }
        }

        Object.values(node).forEach(walk);
    }

    walk(root);

    if (targets.length === 0) {
        return { candidates: 0, enriched: 0, missing: 0 };
    }

    const uniqueUrls = [...new Set(targets.map(t => t.url))];
    const dimensionsMap = await getMultipleImageDimensions(uniqueUrls);

    let enriched = 0;
    targets.forEach(({ node, url }) => {
        if (!dimensionsMap.has(url)) return;

        const dims = dimensionsMap.get(url);
        node[widthKey] = dims.width;
        node[heightKey] = dims.height;
        node[typeKey] = dims.type;
        enriched++;
    });

    return {
        candidates: targets.length,
        enriched,
        missing: targets.length - enriched
    };
}

/**
 * Clears the image dimension cache.
 * Useful between scrapes to free memory or force fresh fetches.
 * 
 * @returns {void}
 */
function clearCache() {
    dimensionCache.clear();
}

/**
 * Gets the current number of cached dimension entries.
 * 
 * @returns {number} Number of cached URLs
 */
function getCacheSize() {
    return dimensionCache.size;
}

module.exports = {
    getImageDimensions,
    getMultipleImageDimensions,
    enrichMissingImageDimensions,
    clearCache,
    getCacheSize
};
