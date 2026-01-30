#!/usr/bin/env node

/**
 * @fileoverview Calculate total size of images referenced in scraped JSON data.
 * Analyzes image URLs from data files and reports what disk space they would consume.
 * @usage node scripts/calculate-image-size.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = path.join(__dirname, '../data');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const PARALLEL_REQUESTS = 10; // Number of concurrent HEAD requests

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format bytes to human-readable string.
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get file size from URL using HEAD request.
 * @param {string} url - Image URL
 * @returns {Promise<number|null>} Size in bytes or null if unavailable
 */
function getUrlSize(url) {
    return new Promise((resolve) => {
        if (!url) {
            resolve(null);
            return;
        }

        const protocol = url.startsWith('https') ? https : http;
        const urlObj = new URL(url);
        
        const options = {
            method: 'HEAD',
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            timeout: 5000
        };

        const req = protocol.request(options, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(getUrlSize(res.headers.location));
                return;
            }

            const contentLength = res.headers['content-length'];
            resolve(contentLength ? parseInt(contentLength, 10) : null);
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });

        req.end();
    });
}

/**
 * Process URLs in batches with parallel requests.
 * @param {string[]} urls - Array of URLs to process
 * @param {number} batchSize - Number of concurrent requests
 * @returns {Promise<Map<string, number>>} Map of URL to size
 */
async function getUrlSizes(urls, batchSize = PARALLEL_REQUESTS) {
    const results = new Map();
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    
    console.log(`\nFetching size information for ${uniqueUrls.length} unique images...`);
    
    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        const batch = uniqueUrls.slice(i, i + batchSize);
        const progress = Math.min(i + batchSize, uniqueUrls.length);
        process.stdout.write(`\rProgress: ${progress}/${uniqueUrls.length} (${Math.round(progress / uniqueUrls.length * 100)}%)`);
        
        const batchResults = await Promise.all(
            batch.map(async (url) => {
                const size = await getUrlSize(url);
                return { url, size };
            })
        );
        
        batchResults.forEach(({ url, size }) => {
            if (size !== null) {
                results.set(url, size);
            }
        });
    }
    
    process.stdout.write('\n');
    return results;
}

/**
 * Recursively extract all image URLs from an object or array.
 * @param {any} obj - Object to traverse
 * @param {string[]} urls - Accumulator array
 * @returns {string[]} Array of found URLs
 */
function extractImageUrls(obj, urls = []) {
    if (!obj) return urls;
    
    if (typeof obj === 'string') {
        // Check if it looks like an image URL
        if (obj.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i) ||
            obj.includes('cdn.leekduck.com') ||
            obj.includes('cdn.jsdelivr.net')) {
            urls.push(obj);
        }
        return urls;
    }
    
    if (Array.isArray(obj)) {
        obj.forEach(item => extractImageUrls(item, urls));
        return urls;
    }
    
    if (typeof obj === 'object') {
        // Common image field names
        const imageFields = ['image', 'imageUrl', 'icon', 'logo', 'avatar', 'picture', 'photo'];
        
        Object.entries(obj).forEach(([key, value]) => {
            // Prioritize known image fields
            if (imageFields.some(field => key.toLowerCase().includes(field))) {
                extractImageUrls(value, urls);
            } else if (typeof value === 'object' || Array.isArray(value)) {
                extractImageUrls(value, urls);
            } else if (typeof value === 'string') {
                extractImageUrls(value, urls);
            }
        });
    }
    
    return urls;
}

/**
 * Read and parse all JSON files in a directory recursively.
 * @param {string} dir - Directory path
 * @param {Object[]} results - Accumulator array
 * @returns {Object[]} Array of parsed JSON objects
 */
function readJsonFiles(dir, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            readJsonFiles(fullPath, results);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const data = JSON.parse(content);
                results.push({ file: path.relative(DATA_DIR, fullPath), data });
            } catch (err) {
                console.error(`Error reading ${fullPath}: ${err.message}`);
            }
        }
    }
    
    return results;
}

/**
 * Group URLs by domain for analysis.
 * @param {string[]} urls - Array of URLs
 * @returns {Map<string, string[]>} Map of domain to URLs
 */
function groupByDomain(urls) {
    const groups = new Map();
    
    urls.forEach(url => {
        try {
            const domain = new URL(url).hostname;
            if (!groups.has(domain)) {
                groups.set(domain, []);
            }
            groups.get(domain).push(url);
        } catch (err) {
            // Invalid URL, skip
        }
    });
    
    return groups;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    console.log('🔍 Analyzing image URLs in scraped data...\n');
    
    // Read all JSON files
    const jsonFiles = readJsonFiles(DATA_DIR);
    console.log(`📁 Found ${jsonFiles.length} JSON files in ${DATA_DIR}`);
    
    // Extract all image URLs
    const allUrls = [];
    jsonFiles.forEach(({ file, data }) => {
        const urls = extractImageUrls(data);
        if (VERBOSE && urls.length > 0) {
            console.log(`  ${file}: ${urls.length} image references`);
        }
        allUrls.push(...urls);
    });
    
    const uniqueUrls = [...new Set(allUrls)];
    console.log(`\n📊 Statistics:`);
    console.log(`   Total image references: ${allUrls.length}`);
    console.log(`   Unique image URLs: ${uniqueUrls.length}`);
    
    // Group by domain
    const byDomain = groupByDomain(uniqueUrls);
    console.log(`\n🌐 Images by domain:`);
    Array.from(byDomain.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .forEach(([domain, urls]) => {
            console.log(`   ${domain}: ${urls.length} images`);
        });
    
    // Fetch sizes
    const sizes = await getUrlSizes(uniqueUrls);
    
    // Calculate totals
    let totalSize = 0;
    let successCount = 0;
    const sizesByDomain = new Map();
    
    sizes.forEach((size, url) => {
        totalSize += size;
        successCount++;
        
        try {
            const domain = new URL(url).hostname;
            sizesByDomain.set(domain, (sizesByDomain.get(domain) || 0) + size);
        } catch (err) {
            // Invalid URL
        }
    });
    
    // Report results
    console.log(`\n💾 Size Analysis:`);
    console.log(`   Successfully fetched: ${successCount}/${uniqueUrls.length} images`);
    console.log(`   Failed/unavailable: ${uniqueUrls.length - successCount} images`);
    console.log(`\n📦 Total size breakdown by domain:`);
    
    Array.from(sizesByDomain.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([domain, size]) => {
            const percentage = (size / totalSize * 100).toFixed(1);
            console.log(`   ${domain}: ${formatBytes(size)} (${percentage}%)`);
        });
    
    console.log(`\n✨ TOTAL SIZE: ${formatBytes(totalSize)}`);
    console.log(`   (If all ${successCount} images were stored locally)`);
    
    // Additional stats
    if (successCount > 0) {
        const avgSize = totalSize / successCount;
        const minSize = Math.min(...Array.from(sizes.values()));
        const maxSize = Math.max(...Array.from(sizes.values()));
        
        console.log(`\n📈 Size statistics:`);
        console.log(`   Average: ${formatBytes(avgSize)}`);
        console.log(`   Smallest: ${formatBytes(minSize)}`);
        console.log(`   Largest: ${formatBytes(maxSize)}`);
    }
    
    // Verbose output: list all URLs with sizes
    if (VERBOSE) {
        console.log(`\n📋 Detailed listing:`);
        const sortedUrls = Array.from(sizes.entries()).sort((a, b) => b[1] - a[1]);
        sortedUrls.forEach(([url, size]) => {
            console.log(`   ${formatBytes(size).padEnd(12)} - ${url}`);
        });
    }
}

// Run the script
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
