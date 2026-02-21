#!/usr/bin/env node

/**
 * @fileoverview Upload scraped images to Vercel Blob Storage.
 * Reads image URLs from JSON data files, downloads, and uploads to Blob.
 * Event banner images are resized to 50% dimensions prior to upload.
 * @usage node scripts/upload-images-to-blob.js [--dry-run] [--force]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
const dotenv = require('dotenv');
const { canonicalizeExternalImageUrl, externalUrlToBlobPathname } = require('../utils/blobNaming');

dotenv.config();
dotenv.config({ path: '.env.local' });

// Configuration
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const PARALLEL_UPLOADS = 5;
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const REPAIR = process.argv.includes('--repair');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Custom domain for blob storage (replaces raw vercel-storage.com URLs)
const BLOB_CUSTOM_DOMAIN = 'https://pokemn.quest';

// URL Mapping storage
const URL_MAP_FILE = path.join(__dirname, '..', 'utils', 'blob-url-map.json');

/**
 * Extract all image URLs from a nested object
 * Only extracts external URLs (not already blob URLs)
 * @param {any} obj - Object to search
 * @param {string[]} urls - Accumulator array
 * @returns {string[]} Array of URLs found
 */
function extractImageUrls(obj, urls = []) {
    if (!obj) return urls;

    if (typeof obj === 'string') {
        // Match image URLs but exclude blob storage URLs and pokemn.quest URLs (already uploaded)
        if (obj.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i) &&
            !obj.includes('.blob.vercel-storage.com') &&
            !obj.includes('pokemn.quest')) {
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
 * Generate blob pathname from URL.
 * Uses a readable, deterministic scheme that canonicalizes common upstream hosts.
 *
 * @param {string} url - Original image URL
 * @returns {string} Pathname for blob storage
 */
function urlToPathname(url) {
    const canonical = canonicalizeExternalImageUrl(url);
    return externalUrlToBlobPathname(canonical);
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
 * Check whether a blob pathname is an event banner path.
 * @param {string} pathname - Blob pathname
 * @returns {boolean}
 */
function isEventBannerPath(pathname) {
    return typeof pathname === 'string' && pathname.startsWith('events/');
}

/**
 * Resize event banners to 50% before upload.
 * Keeps original format and aspect ratio.
 *
 * @param {Buffer} imageBuffer - Original image data
 * @param {string} pathname - Blob pathname
 * @param {string} contentType - MIME content type
 * @returns {Promise<{buffer: Buffer, resized: boolean}>}
 */
async function maybeResizeEventBanner(imageBuffer, pathname, contentType) {
    if (!isEventBannerPath(pathname)) {
        return { buffer: imageBuffer, resized: false };
    }

    // Skip formats we do not want to transform.
    if (contentType === 'image/svg+xml' || contentType === 'image/gif') {
        return { buffer: imageBuffer, resized: false };
    }

    const image = sharp(imageBuffer, { failOnError: false });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
        return { buffer: imageBuffer, resized: false };
    }

    const targetWidth = Math.max(1, Math.round(metadata.width * 0.5));
    const targetHeight = Math.max(1, Math.round(metadata.height * 0.5));

    if (targetWidth === metadata.width && targetHeight === metadata.height) {
        return { buffer: imageBuffer, resized: false };
    }

    const resizedBuffer = await image
        .resize({
            width: targetWidth,
            height: targetHeight,
            fit: 'inside',
            withoutEnlargement: true
        })
        .toBuffer();

    return { buffer: resizedBuffer, resized: true };
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
 * Determine which URLs need upload.
 * @param {string[]} uniqueUrls - Candidate image URLs
 * @param {Record<string, string>} urlMap - Existing URL mappings
 * @param {boolean} force - Whether to re-upload all URLs
 * @returns {string[]} URLs to process
 */
function getUrlsToProcess(uniqueUrls, urlMap, force) {
    if (force) return uniqueUrls;
    return uniqueUrls.filter((url) => !urlMap[url]);
}

/**
 * Check whether a URL is accessible (returns 200).
 * Used by repair mode to detect missing blobs.
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if URL returns 200
 */
function isBlobAccessible(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
}

/**
 * Repair mode: find blobs in blob-url-map.json that are inaccessible (403/404)
 * and re-upload them from their original source URLs.
 *
 * @param {Function} put - @vercel/blob put function
 * @param {Record<string, string>} urlMap - Existing URL→blobUrl mappings
 * @returns {Promise<void>}
 */
async function runRepair(put, urlMap) {
    const entries = Object.entries(urlMap);
    console.log(`🔍 Repair mode: checking ${entries.length} existing blob mappings...\n`);

    // De-duplicate by target blob URL (multiple source keys may map to the same blob)
    const blobToSource = new Map();
    for (const [sourceUrl, blobUrl] of entries) {
        if (!blobToSource.has(blobUrl)) {
            blobToSource.set(blobUrl, sourceUrl);
        }
    }

    const uniqueBlobs = [...blobToSource.entries()];
    console.log(`   Unique blob targets: ${uniqueBlobs.length}`);

    // Sample a small batch first to detect systemic failures
    const sampleSize = Math.min(10, uniqueBlobs.length);
    const sample = uniqueBlobs.slice(0, sampleSize);
    let sampleFails = 0;
    for (const [blobUrl] of sample) {
        const ok = await isBlobAccessible(blobUrl);
        if (!ok) sampleFails++;
    }

    const systemic = sampleFails === sampleSize;
    console.log(`   Sample check (${sampleSize}): ${sampleFails} unreachable`);
    if (systemic) {
        console.log('   ⚠ All sampled blobs unreachable — treating as systemic failure, re-uploading all.\n');
    } else {
        console.log(`   Checking remaining blobs individually...\n`);
    }

    // Identify which blobs need repair
    let toRepair;
    if (systemic) {
        toRepair = uniqueBlobs;
    } else {
        toRepair = [];
        for (let i = 0; i < uniqueBlobs.length; i += PARALLEL_UPLOADS) {
            const batch = uniqueBlobs.slice(i, i + PARALLEL_UPLOADS);
            const results = await Promise.all(batch.map(async ([blobUrl, sourceUrl]) => {
                const ok = await isBlobAccessible(blobUrl);
                return ok ? null : [blobUrl, sourceUrl];
            }));
            toRepair.push(...results.filter(Boolean));
        }
    }

    console.log(`   🔧 Blobs to repair: ${toRepair.length}\n`);

    if (toRepair.length === 0) {
        console.log('✅ All blobs are accessible. Nothing to repair.\n');
        return;
    }

    if (DRY_RUN) {
        toRepair.forEach(([blobUrl, sourceUrl]) => {
            // Extract pathname from pokemn.quest URL
            const pathname = blobUrl.replace(/^https:\/\/pokemn\.quest\//, '');
            console.log(`  [DRY REPAIR] Would re-upload: ${pathname}`);
            console.log(`    from: ${sourceUrl}`);
        });
        console.log(`\n   Would repair ${toRepair.length} blobs.`);
        return;
    }

    const results = { success: 0, failed: 0 };
    const errors = [];

    for (let i = 0; i < toRepair.length; i += PARALLEL_UPLOADS) {
        const batch = toRepair.slice(i, i + PARALLEL_UPLOADS);

        await Promise.all(batch.map(async ([blobUrl, sourceUrl]) => {
            const pathname = blobUrl.replace(/^https:\/\/pokemn\.quest\//, '');
            try {
                const imageBuffer = await downloadImage(sourceUrl);
                const contentType = getContentType(sourceUrl);
                const { buffer: uploadBuffer, resized } = await maybeResizeEventBanner(
                    imageBuffer,
                    pathname,
                    contentType
                );

                await put(pathname, uploadBuffer, {
                    access: 'public',
                    addRandomSuffix: false,
                    allowOverwrite: true,
                    contentType,
                });

                results.success++;
                if (VERBOSE) {
                    const sizeText = `${(uploadBuffer.length / 1024).toFixed(1)} KB`;
                    const resizeNote = resized ? ' [resized 50%]' : '';
                    console.log(`  ✓ ${pathname} (${sizeText})${resizeNote}`);
                }
            } catch (err) {
                errors.push({ url: sourceUrl, error: err.message });
                results.failed++;
                if (VERBOSE) {
                    console.error(`  ✗ ${sourceUrl}: ${err.message}`);
                }
            }
        }));

        const progress = Math.min(i + PARALLEL_UPLOADS, toRepair.length);
        const percent = ((progress / toRepair.length) * 100).toFixed(0);
        process.stdout.write(`\r   Progress: ${progress}/${toRepair.length} (${percent}%)`);
    }

    console.log('\n');
    console.log('━'.repeat(50));
    console.log('📊 Repair Summary');
    console.log('━'.repeat(50));
    console.log(`   🔧 Repaired:  ${results.success}`);
    console.log(`   ✗ Failed:    ${results.failed}`);

    if (errors.length > 0 && errors.length <= 10) {
        console.log('\n⚠ Failed repairs (source images may be unavailable):');
        errors.forEach(({ url, error }) => {
            console.log(`   • ${url}`);
            console.log(`     ${error}`);
        });
    } else if (errors.length > 10) {
        console.log(`\n⚠ ${errors.length} repairs failed. Run with --verbose for details.`);
    }

    console.log('\n✅ Repair complete!');
}

/**
 * Main upload process
 */
async function main() {
    console.log('🚀 Vercel Blob Upload Script');
    console.log(`   Mode: ${DRY_RUN ? '🧪 DRY RUN' : '📤 LIVE UPLOAD'}`);
    console.log(`   Repair mode: ${REPAIR ? 'YES' : 'NO'}`);
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

    // Load existing URL map (needed for both repair and normal upload)
    let urlMap = {};
    if (fs.existsSync(URL_MAP_FILE)) {
        try {
            urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
            console.log(`📋 Loaded ${Object.keys(urlMap).length} existing URL mappings`);
        } catch (err) {
            console.warn(`⚠ Could not load URL map: ${err.message}`);
        }
    }

    // Repair mode: re-upload any blobs that are inaccessible
    if (REPAIR) {
        await runRepair(put, urlMap);
        return;
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

    // Filter out URLs that are already mapped (unless forcing).
    // Event banners are always reprocessed so they are consistently stored at 50% size.
    const urlsToProcess = getUrlsToProcess(uniqueUrls, urlMap, FORCE);
    
    const alreadyMapped = uniqueUrls.length - urlsToProcess.length;
    if (alreadyMapped > 0) {
        console.log(`   ⏭ ${alreadyMapped} URLs already in blob storage (skipping)`);
    }
    console.log(`   📤 ${urlsToProcess.length} URLs to upload\n`);

    // Early exit if nothing to upload
    if (urlsToProcess.length === 0 && !DRY_RUN) {
        console.log('✅ All images already uploaded! Nothing to do.\n');
        return;
    }

    // Process URLs in batches
    const results = { success: 0, skipped: 0, failed: 0 };
    const errors = [];

    console.log('📤 Uploading images...\n');

    for (let i = 0; i < urlsToProcess.length; i += PARALLEL_UPLOADS) {
        const batch = urlsToProcess.slice(i, i + PARALLEL_UPLOADS);

        await Promise.all(
            batch.map(async (url) => {
                const canonicalUrl = canonicalizeExternalImageUrl(url);
                const pathname = urlToPathname(url);

                // Dry run mode
                if (DRY_RUN) {
                    console.log(`  [DRY] Would upload: ${pathname}`);
                    results.success++;
                    return;
                }

                try {
                    // Download image
                    const imageBuffer = await downloadImage(url);
                    const contentType = getContentType(url);
                    const { buffer: uploadBuffer, resized } = await maybeResizeEventBanner(
                        imageBuffer,
                        pathname,
                        contentType
                    );

                    // Upload to blob
                    // Note: addRandomSuffix defaults to false in put()
                    // allowOverwrite is used for --force and for event banner refreshes.
                    const blob = await put(pathname, uploadBuffer, {
                        access: 'public',
                        addRandomSuffix: false,
                        allowOverwrite: FORCE || isEventBannerPath(pathname),
                        contentType: contentType,
                    });

                    // Transform blob.url to use custom domain
                    // e.g., https://xyz.public.blob.vercel-storage.com/images/foo.png
                    //    -> https://pokemn.quest/images/foo.png
                    const blobUrl = blob.url.replace(
                        /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com/,
                        BLOB_CUSTOM_DOMAIN
                    );

                    // Store mapping for the exact URL found in data...
                    urlMap[url] = blobUrl;
                    // ...and also for a canonicalized equivalent (helps if upstream host changes).
                    if (canonicalUrl && canonicalUrl !== url) {
                        urlMap[canonicalUrl] = blobUrl;
                    }
                    results.success++;

                    if (VERBOSE) {
                        const sizeText = `${(uploadBuffer.length / 1024).toFixed(1)} KB`;
                        const resizeNote = resized ? ' [resized 50%]' : '';
                        console.log(`  ✓ ${pathname} (${sizeText})${resizeNote}`);
                    }
                } catch (err) {
                    // If blob already exists, generate the mapping from the pathname
                    if (err.message && err.message.includes('already exists')) {
                        const blobUrl = `${BLOB_CUSTOM_DOMAIN}/${pathname}`;
                        urlMap[url] = blobUrl;
                        if (canonicalUrl && canonicalUrl !== url) {
                            urlMap[canonicalUrl] = blobUrl;
                        }
                        results.success++;

                        if (VERBOSE) {
                            console.log(`  ≡ ${pathname} (already in blob, mapped)`);
                        }
                    } else {
                        errors.push({ url, error: err.message });
                        results.failed++;

                        if (VERBOSE) {
                            console.error(`  ✗ ${url}: ${err.message}`);
                        }
                    }
                }
            })
        );

        // Progress indicator
        const progress = Math.min(i + PARALLEL_UPLOADS, urlsToProcess.length);
        const percent = ((progress / urlsToProcess.length) * 100).toFixed(0);
        process.stdout.write(`\r   Progress: ${progress}/${urlsToProcess.length} (${percent}%)`);
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
    console.log(`   📦 Total unique URLs: ${uniqueUrls.length}`);
    console.log(`   ⏭ Already mapped:    ${alreadyMapped}`);
    console.log(`   ✓ Newly uploaded:    ${results.success}`);
    console.log(`   ✗ Failed:            ${results.failed}`);

    if (errors.length > 0 && errors.length <= 10) {
        console.log('\n⚠ Failed uploads (source images unavailable):');
        errors.forEach(({ url, error }) => {
            console.log(`   • ${url}`);
            console.log(`     ${error}`);
        });
    } else if (errors.length > 10) {
        console.log(`\n⚠ ${errors.length} uploads failed (source images unavailable). Run with --verbose for details.`);
    }

    // Only exit with error if we had real failures (not just source unavailability)
    // Success = we uploaded what we could, failures are expected for dead source links
    console.log('\n✅ Upload complete!');
}

if (require.main === module) {
    // Run main function
    main().catch((err) => {
        console.error('\n❌ Fatal error:', err.message);
        if (VERBOSE) {
            console.error(err.stack);
        }
        process.exit(1);
    });
}

module.exports = { getUrlsToProcess };
