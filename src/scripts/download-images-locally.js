#!/usr/bin/env node

/**
 * @fileoverview Download scraped image assets to the local filesystem using the
 * same pathname scheme as our Vercel Blob storage layout.
 *
 * This is useful for:
 * - inspecting what the blob store *would* look like
 * - building a fully local mirror of all referenced assets
 *
 * Usage:
 *   node src/scripts/download-images-locally.js [--dry-run] [--force] [--verbose]
 *     [--output <dir>] [--parallel <n>]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const dotenv = require('dotenv');
const { canonicalizeExternalImageUrl, externalUrlToBlobPathname } = require('../utils/blobNaming');

dotenv.config();
dotenv.config({ path: '.env.local' });

// Defaults
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', '..', 'data', 'blob-images');

// Args
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const FORCE = argv.includes('--force');
const VERBOSE = argv.includes('--verbose') || argv.includes('-v');

function readArgValue(flag, fallback) {
    const idx = argv.indexOf(flag);
    if (idx === -1) return fallback;
    const v = argv[idx + 1];
    return v && !v.startsWith('--') ? v : fallback;
}

const OUTPUT_DIR = path.resolve(readArgValue('--output', DEFAULT_OUTPUT_DIR));
const PARALLEL = Math.max(1, parseInt(readArgValue('--parallel', '8'), 10) || 8);

/**
 * Extract all image URLs from a nested object.
 * Only extracts external URLs (not already blob URLs).
 *
 * @param {any} obj
 * @param {string[]} urls
 * @returns {string[]}
 */
function extractImageUrls(obj, urls = []) {
    if (!obj) return urls;

    if (typeof obj === 'string') {
        if (
            obj.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i) &&
            !obj.includes('.blob.vercel-storage.com')
        ) {
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
 * Read all JSON files from data directory recursively.
 *
 * @param {string} dir
 * @param {{file: string, data: any}[]} files
 * @returns {{file: string, data: any}[]}
 */
function readJsonFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            readJsonFiles(fullPath, files);
        } else if (
            entry.name.endsWith('.json') &&
            !entry.name.includes('blob-url-map') &&
            !entry.name.includes('local-image-map')
        ) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                files.push({ file: fullPath, data });
            } catch (err) {
                if (VERBOSE) {
                    console.warn(`  ⚠ Skipping ${entry.name}: ${err.message}`);
                }
            }
        }
    }

    return files;
}

/**
 * Download a URL into a buffer.
 * Follows redirects.
 *
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function download(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.get(url, { timeout: 30000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(download(res.headers.location));
                return;
            }

            if (res.statusCode !== 200) {
                const err = new Error(`HTTP ${res.statusCode}`);
                err.statusCode = res.statusCode;
                reject(err);
                return;
            }

            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

/**
 * Derive fallback URLs for known hosts when CDN is blocked.
 * @param {string} url
 * @returns {string[]}
 */
function getFallbackUrls(url) {
    try {
        const u = new URL(url);
        if (u.hostname === 'cdn.jsdelivr.net' && u.pathname.startsWith('/gh/')) {
            const parts = u.pathname.split('/').filter(Boolean); // ['gh', owner, repo, ...path]
            if (parts.length >= 4) {
                const [, owner, repo, ...rest] = parts;
                return [
                    `https://raw.githubusercontent.com/${owner}/${repo}/master/${rest.join('/')}`,
                ];
            }
        }
    } catch {
        return [];
    }
    return [];
}

/**
 * Download a URL with fallbacks for known CDN limitations.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function downloadWithFallback(url) {
    try {
        return await download(url);
    } catch (err) {
        const fallbackUrls = getFallbackUrls(url);
        if (err && err.statusCode === 403 && fallbackUrls.length > 0) {
            for (const fallbackUrl of fallbackUrls) {
                try {
                    return await download(fallbackUrl);
                } catch {
                    // try next fallback
                }
            }
        }
        throw err;
    }
}

/**
 * Minimal async pool.
 * @template T,R
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<R>} worker
 * @returns {Promise<R[]>}
 */
async function pool(items, concurrency, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runOne() {
        while (true) {
            const i = nextIndex++;
            if (i >= items.length) return;
            results[i] = await worker(items[i], i);
        }
    }

    const runners = [];
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
        runners.push(runOne());
    }
    await Promise.all(runners);
    return results;
}

async function main() {
    console.log('🧲 Local Image Download');
    console.log(`   Mode: ${DRY_RUN ? '🧪 DRY RUN' : '⬇️  DOWNLOAD'}`);
    console.log(`   Output: ${OUTPUT_DIR}`);
    console.log(`   Force overwrite: ${FORCE ? 'YES' : 'NO'}`);
    console.log(`   Parallel: ${PARALLEL}\n`);

    console.log('📁 Reading JSON files from data directory...');
    const jsonFiles = readJsonFiles(DATA_DIR);
    console.log(`   Found ${jsonFiles.length} JSON files\n`);

    const foundUrls = [];
    jsonFiles.forEach(({ data }) => {
        foundUrls.push(...extractImageUrls(data));
    });

    const uniqueUrls = [...new Set(foundUrls)].filter((u) => !u.includes('example.com'));

    // Canonicalize and dedupe by canonical URL to avoid downloading the same image twice.
    const canonicalByOriginal = new Map();
    const canonicalSet = new Set();
    uniqueUrls.forEach((u) => {
        const c = canonicalizeExternalImageUrl(u);
        canonicalByOriginal.set(u, c);
        canonicalSet.add(c);
    });

    const canonicalUrls = [...canonicalSet];

    console.log(`🖼️  Found ${foundUrls.length} total image references`);
    console.log(`   Unique raw URLs: ${uniqueUrls.length}`);
    console.log(`   Unique canonical URLs: ${canonicalUrls.length}\n`);

    // Build download plan (canonical URL -> local path).
    const plan = canonicalUrls
        .map((c) => {
            const blobPath = externalUrlToBlobPathname(c);
            const localPath = path.join(OUTPUT_DIR, blobPath);
            return { canonicalUrl: c, blobPath, localPath };
        })
        .sort((a, b) => a.localPath.localeCompare(b.localPath));

    const stats = { downloaded: 0, skipped: 0, failed: 0 };
    const errors = [];

    if (DRY_RUN) {
        console.log('Preview (first 40):');
        plan.slice(0, 40).forEach((p) => {
            console.log(`  [DRY] ${p.blobPath}`);
        });
        if (plan.length > 40) console.log(`  ... and ${plan.length - 40} more`);
        console.log('\n✅ Dry run complete.');
        return;
    }

    console.log('⬇️  Downloading images...\n');

    await pool(plan, PARALLEL, async (p, idx) => {
        try {
            if (!FORCE && fs.existsSync(p.localPath)) {
                stats.skipped++;
                return;
            }

            const buf = await downloadWithFallback(p.canonicalUrl);
            fs.mkdirSync(path.dirname(p.localPath), { recursive: true });
            fs.writeFileSync(p.localPath, buf);
            stats.downloaded++;

            if (VERBOSE) {
                console.log(`  ✓ ${p.blobPath} (${(buf.length / 1024).toFixed(1)} KB)`);
            }

            if ((idx + 1) % 50 === 0 && !VERBOSE) {
                process.stdout.write(`\r   Progress: ${idx + 1}/${plan.length}`);
            }
        } catch (err) {
            stats.failed++;
            errors.push({ url: p.canonicalUrl, error: err.message });
            if (VERBOSE) {
                console.error(`  ✗ ${p.canonicalUrl}: ${err.message}`);
            }
        }
    });

    if (!VERBOSE) process.stdout.write('\n');

    console.log('━'.repeat(50));
    console.log('📊 Summary');
    console.log('━'.repeat(50));
    console.log(`   Canonical URLs:   ${plan.length}`);
    console.log(`   ✓ Downloaded:     ${stats.downloaded}`);
    console.log(`   ⏭ Skipped:        ${stats.skipped}`);
    console.log(`   ✗ Failed:         ${stats.failed}`);

    if (errors.length > 0 && errors.length <= 10) {
        console.log('\n⚠ Failed downloads:');
        errors.forEach((e) => {
            console.log(`   • ${e.url}`);
            console.log(`     ${e.error}`);
        });
    } else if (errors.length > 10) {
        console.log(`\n⚠ ${errors.length} downloads failed. Run with --verbose for details.`);
    }

    console.log(`\n✅ Done. Files written under: ${OUTPUT_DIR}`);
}

main().catch((err) => {
    console.error('\n❌ Fatal error:', err.message);
    if (VERBOSE) console.error(err.stack);
    process.exit(1);
});
