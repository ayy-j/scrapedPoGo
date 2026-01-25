const https = require('https');
const http = require('http');
const { imageSize } = require('image-size');

/**
 * Image Dimensions Utility
 * 
 * Fetches actual image dimensions from remote URLs by reading image headers.
 * Supports PNG, JPEG/JPG, GIF, WebP, SVG, BMP, ICO, and more formats.
 * Uses the image-size package which parses headers without downloading full images.
 */

// Cache to avoid redundant fetches for the same URL
const dimensionCache = new Map();

/**
 * Fetch image dimensions from a URL.
 * @param {string} url - The image URL
 * @param {number} [timeout=5000] - Request timeout in milliseconds
 * @returns {Promise<{width: number, height: number, type: string}|null>}
 */
async function getImageDimensions(url, timeout = 5000) {
    if (!url) return null;
    
    // Check cache first
    if (dimensionCache.has(url)) {
        return dimensionCache.get(url);
    }
    
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
    }
}

/**
 * Fetch image buffer from URL.
 * Only fetches enough bytes to determine dimensions (up to 128KB for safety).
 * @param {string} url - The image URL
 * @param {number} timeout - Request timeout
 * @returns {Promise<Buffer|null>}
 */
function fetchImageBuffer(url, timeout) {
    return new Promise((resolve) => {
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
                }
            });
            
            response.on('end', () => {
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
 * Get dimensions for multiple image URLs in parallel.
 * Processes in batches to avoid overwhelming the network.
 * @param {string[]} urls - Array of image URLs
 * @param {number} [batchSize=10] - Number of concurrent requests
 * @returns {Promise<Map<string, {width: number, height: number, type: string}>>}
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
 * Clear the dimension cache.
 * Useful between scrapes to free memory.
 */
function clearCache() {
    dimensionCache.clear();
}

/**
 * Get current cache size.
 * @returns {number}
 */
function getCacheSize() {
    return dimensionCache.size;
}

module.exports = {
    getImageDimensions,
    getMultipleImageDimensions,
    clearCache,
    getCacheSize
};
