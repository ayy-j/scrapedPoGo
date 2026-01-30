#!/usr/bin/env node

/**
 * @fileoverview Upload scraped images to Vercel Blob Storage.
 * Reads image URLs from JSON data files, downloads, and uploads to Blob.
 * @usage node scripts/upload-images-to-blob.js [--dry-run] [--force]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const PARALLEL_UPLOADS = 5;
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// URL Mapping storage
const URL_MAP_FILE = path.join(__dirname, '../data/blob-url-map.json');

/**
 * Extract all image URLs from a nested object
 * @param {any} obj - Object to search
 * @param {string[]} urls - Accumulator array
 * @returns {string[]} Array of URLs found
 */
function extractImageUrls(obj, urls = []) {
    if (!obj) return urls;

    if (typeof obj === 'string') {
        if (obj.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
            urls.push(obj);
        }
        return urls;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item) => extractImageUrls(item, urls));
        return urls;
    }

    if (typeof obj === 'object') {
        Object.values(obj).forEach((value) => extractImageUrls(value, urls));
    }

    return urls;
}

/**
 * Download image from URL
 * @param {string} url - URL to download from
 * @returns {Promise<Buffer>} Image data buffer
 */
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.get(url, { timeout: 30000 }, (response) => {
            // Follow redirects
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                resolve(downloadImage(response.headers.location));
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

/**
 * Generate blob pathname from URL
 * Preserves directory structure based on original URL
 * @param {string} url - Original image URL
 * @returns {string} Pathname for blob storage
 */
function urlToPathname(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/\./g, '-');
    // Remove leading slash and decode URI components
    const pathname = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
    return `images/${hostname}/${pathname}`;
}

/**
 * Get content type from URL or default to octet-stream
 * @param {string} url - Image URL
 * @returns {string} MIME type
 */
function getContentType(url) {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    };
    return types[ext] || 'application/octet-stream';
}

/**
 * Read all JSON files from data directory recursively
 * @param {string} dir - Directory to read
 * @param {Object[]} files - Accumulator array
 * @returns {Object[]} Array of {file, data} objects
 */
function readJsonFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            readJsonFiles(fullPath, files);
        } else if (
            entry.name.endsWith('.json') &&
            !entry.name.includes('blob-url-map')
        ) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                files.push({ file: fullPath, data });
            } catch (err) {
                console.warn(`  ⚠ Skipping ${entry.name}: ${err.message}`);
            }
        }
    }

    return files;
}

/**
 * Main upload process
 */
async function main() {
    console.log('🚀 Vercel Blob Upload Script');
    console.log(`   Mode: ${DRY_RUN ? '🧪 DRY RUN' : '📤 LIVE UPLOAD'}`);
    console.log(`   Force overwrite: ${FORCE ? 'YES' : 'NO'}\n`);

    // Check for @vercel/blob module
    let put, head, list;
    try {
        const blob = require('@vercel/blob');
        put = blob.put;
        head = blob.head;
        list = blob.list;
    } catch (err) {
        if (!DRY_RUN) {
            console.error('❌ @vercel/blob package not found.');
            console.error('   Install with: npm install @vercel/blob');
            process.exit(1);
        }
        console.log('ℹ️  @vercel/blob not installed, continuing in dry-run mode\n');
    }

    // Check for token (only in live mode)
    if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY_RUN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN environment variable not set.');
        console.error('   Run: vercel env pull');
        console.error('   Or set manually: export BLOB_READ_WRITE_TOKEN=...');
        process.exit(1);
    }

    // Read all JSON files
    console.log('📁 Reading JSON files from data directory...');
    const jsonFiles = readJsonFiles(DATA_DIR);
    console.log(`   Found ${jsonFiles.length} JSON files\n`);

    // Extract all image URLs
    const allUrls = [];
    jsonFiles.forEach(({ data }) => {
        allUrls.push(...extractImageUrls(data));
    });

    const uniqueUrls = [...new Set(allUrls)].filter(
        (url) => !url.includes('example.com') // Skip placeholder URLs
    );

    console.log(`🖼️  Found ${allUrls.length} total image references`);
    console.log(`   Unique URLs: ${uniqueUrls.length}\n`);

    // Load existing URL map
    let urlMap = {};
    if (fs.existsSync(URL_MAP_FILE)) {
        try {
            urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
            console.log(`📋 Loaded ${Object.keys(urlMap).length} existing URL mappings\n`);
        } catch (err) {
            console.warn(`⚠ Could not load URL map: ${err.message}\n`);
        }
    }

    // Process URLs in batches
    const results = { success: 0, skipped: 0, failed: 0 };
    const errors = [];

    console.log('📤 Uploading images...\n');

    for (let i = 0; i < uniqueUrls.length; i += PARALLEL_UPLOADS) {
        const batch = uniqueUrls.slice(i, i + PARALLEL_UPLOADS);

        await Promise.all(
            batch.map(async (url) => {
                const pathname = urlToPathname(url);

                // Skip if already mapped and not forcing
                if (urlMap[url] && !FORCE) {
                    if (VERBOSE) {
                        console.log(`  ⏭ Skipped (exists): ${pathname}`);
                    }
                    results.skipped++;
                    return;
                }

                // Dry run mode
                if (DRY_RUN) {
                    console.log(`  [DRY] Would upload: ${pathname}`);
                    results.success++;
                    return;
                }

                try {
                    // Check if blob already exists (optional, for efficiency)
                    if (!FORCE) {
                        try {
                            await head(pathname);
                            if (VERBOSE) {
                                console.log(`  ⏭ Skipped (exists): ${pathname}`);
                            }
                            results.skipped++;
                            return;
                        } catch (err) {
                            // Blob doesn't exist, continue with upload
                        }
                    }

                    // Download image
                    const imageBuffer = await downloadImage(url);
                    const contentType = getContentType(url);

                    // Upload to blob
                    // Note: addRandomSuffix defaults to false in put()
                    // allowOverwrite is needed when FORCE is true to overwrite existing blobs
                    const blob = await put(pathname, imageBuffer, {
                        access: 'public',
                        addRandomSuffix: false,
                        allowOverwrite: FORCE,
                        contentType: contentType,
                    });

                    urlMap[url] = blob.url;
                    results.success++;

                    if (VERBOSE) {
                        console.log(`  ✓ ${pathname} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
                    }
                } catch (err) {
                    errors.push({ url, error: err.message });
                    results.failed++;

                    if (VERBOSE) {
                        console.error(`  ✗ ${url}: ${err.message}`);
                    }
                }
            })
        );

        // Progress indicator
        const progress = Math.min(i + PARALLEL_UPLOADS, uniqueUrls.length);
        const percent = ((progress / uniqueUrls.length) * 100).toFixed(0);
        process.stdout.write(`\r   Progress: ${progress}/${uniqueUrls.length} (${percent}%)`);
    }

    console.log('\n');

    // Save URL map (only in live mode with successful uploads)
    if (!DRY_RUN && results.success > 0) {
        fs.writeFileSync(URL_MAP_FILE, JSON.stringify(urlMap, null, 2));
        console.log(`📋 Saved URL mappings to ${path.relative(process.cwd(), URL_MAP_FILE)}\n`);
    }

    // Print summary
    console.log('━'.repeat(50));
    console.log('📊 Summary');
    console.log('━'.repeat(50));
    console.log(`   ✓ Uploaded: ${results.success}`);
    console.log(`   ⏭ Skipped:  ${results.skipped}`);
    console.log(`   ✗ Failed:   ${results.failed}`);

    if (errors.length > 0 && errors.length <= 10) {
        console.log('\n❌ Failed uploads:');
        errors.forEach(({ url, error }) => {
            console.log(`   • ${url}`);
            console.log(`     ${error}`);
        });
    } else if (errors.length > 10) {
        console.log(`\n❌ ${errors.length} uploads failed. Run with --verbose for details.`);
    }

    // Exit with error code if any failures
    if (results.failed > 0) {
        process.exit(1);
    }
}

// Run main function
main().catch((err) => {
    console.error('\n❌ Fatal error:', err.message);
    if (VERBOSE) {
        console.error(err.stack);
    }
    process.exit(1);
});
