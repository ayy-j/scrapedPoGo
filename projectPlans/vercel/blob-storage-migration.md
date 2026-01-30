# Vercel Blob Storage Migration Plan

> **Project**: scrapedPoGo  
> **Domain**: pokemn.quest  
> **Vercel Project**: scraped-po-go (prj_p5j0DI0yYLaGGYWQwTWQioaSgVOo)  
> **Team**: ayyjs-projects (team_RsWTY8oclvZLmFiGIgtt5ufL)  
> **Created**: January 29, 2026

---

## Overview

This plan covers migrating Pokemon GO scraped image assets from external CDNs (LeekDuck, jsdelivr) to Vercel Blob Storage, enabling:
- Self-hosted image storage with 99.999999999% durability
- Reduced external CDN dependencies
- Consistent URL structure for API consumers
- GitHub → Vercel deployment integration

### Current State
- **1,459 unique image URLs** referenced in JSON data files
- **~31 MB total image size** across all assets
- Images hosted on:
  - `cdn.jsdelivr.net` (1,060 images, 20.47 MB, 66.4%)
  - `cdn.leekduck.com` (372 images, 10.36 MB, 33.6%)
  - `leekduck.com` (22 images, 13.74 KB)

---

## Phase 1: Setup Vercel Blob Store

### 1.1 Create Blob Store via Dashboard
1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard) → Project "scraped-po-go"
2. Select **Storage** tab → **Connect Database** → **Blob**
3. Name the store: `scrapedpogo-images`
4. Select region: `iad1` (US East - default, closest to LeekDuck CDN)
5. Enable for **Production** and **Preview** environments

### 1.2 Configure Environment Variable
The `BLOB_READ_WRITE_TOKEN` environment variable is automatically created when you connect a Blob store.

To use locally:
```bash
# Pull environment variables to local project
vercel env pull
```

This creates a `.env.local` file with:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx...
```

### 1.3 Install SDK
```bash
npm install @vercel/blob
```

Add to `package.json` dependencies:
```json
{
  "dependencies": {
    "@vercel/blob": "^1.0.0"
  }
}
```

---

## Phase 2: Create Upload Script

### 2.1 Script: `scripts/upload-images-to-blob.js`

```javascript
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
const { put, list, head } = require('@vercel/blob');

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const PARALLEL_UPLOADS = 5;
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// URL Mapping storage
const URL_MAP_FILE = path.join(__dirname, '../data/blob-url-map.json');

/**
 * Extract all image URLs from JSON data files
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
        obj.forEach(item => extractImageUrls(item, urls));
        return urls;
    }
    
    if (typeof obj === 'object') {
        Object.values(obj).forEach(value => extractImageUrls(value, urls));
    }
    
    return urls;
}

/**
 * Download image from URL
 */
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, { timeout: 30000 }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(downloadImage(response.headers.location));
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Generate blob pathname from URL
 */
function urlToPathname(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/\./g, '-');
    const pathname = urlObj.pathname.replace(/^\//, '');
    return `images/${hostname}/${pathname}`;
}

/**
 * Upload image to Vercel Blob
 */
async function uploadToBlob(url, imageBuffer, pathname) {
    const blob = await put(pathname, imageBuffer, {
        access: 'public',
        addRandomSuffix: false, // Keep predictable URLs
        allowOverwrite: FORCE,
    });
    
    return blob;
}

/**
 * Check if blob already exists
 */
async function blobExists(pathname) {
    try {
        await head(pathname);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Main upload process
 */
async function main() {
    console.log('🚀 Vercel Blob Upload Script');
    console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`   Force overwrite: ${FORCE ? 'YES' : 'NO'}\n`);
    
    // Check for token
    if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY_RUN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN not set. Run: vercel env pull');
        process.exit(1);
    }
    
    // Read all JSON files
    const jsonFiles = [];
    function readDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                readDir(fullPath);
            } else if (entry.name.endsWith('.json') && !entry.name.includes('blob-url-map')) {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                jsonFiles.push({ file: fullPath, data });
            }
        }
    }
    readDir(DATA_DIR);
    
    console.log(`📁 Found ${jsonFiles.length} JSON files`);
    
    // Extract URLs
    const allUrls = [];
    jsonFiles.forEach(({ data }) => {
        allUrls.push(...extractImageUrls(data));
    });
    
    const uniqueUrls = [...new Set(allUrls)].filter(url => 
        !url.includes('example.com') // Skip placeholder URLs
    );
    
    console.log(`🖼️  Found ${uniqueUrls.length} unique image URLs\n`);
    
    // Load existing URL map
    let urlMap = {};
    if (fs.existsSync(URL_MAP_FILE)) {
        urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
        console.log(`📋 Loaded ${Object.keys(urlMap).length} existing mappings`);
    }
    
    // Process URLs
    const results = { success: 0, skipped: 0, failed: 0 };
    
    for (let i = 0; i < uniqueUrls.length; i += PARALLEL_UPLOADS) {
        const batch = uniqueUrls.slice(i, i + PARALLEL_UPLOADS);
        
        await Promise.all(batch.map(async (url) => {
            const pathname = urlToPathname(url);
            
            // Skip if already mapped and not forcing
            if (urlMap[url] && !FORCE) {
                results.skipped++;
                return;
            }
            
            if (DRY_RUN) {
                console.log(`  [DRY] Would upload: ${pathname}`);
                results.success++;
                return;
            }
            
            try {
                // Check if exists
                if (!FORCE && await blobExists(pathname)) {
                    results.skipped++;
                    return;
                }
                
                // Download and upload
                const imageBuffer = await downloadImage(url);
                const blob = await uploadToBlob(url, imageBuffer, pathname);
                
                urlMap[url] = blob.url;
                results.success++;
                
                console.log(`  ✓ ${pathname}`);
            } catch (err) {
                console.error(`  ✗ ${url}: ${err.message}`);
                results.failed++;
            }
        }));
        
        // Progress
        const progress = Math.min(i + PARALLEL_UPLOADS, uniqueUrls.length);
        process.stdout.write(`\rProgress: ${progress}/${uniqueUrls.length}`);
    }
    
    console.log('\n');
    
    // Save URL map
    if (!DRY_RUN) {
        fs.writeFileSync(URL_MAP_FILE, JSON.stringify(urlMap, null, 2));
        console.log(`📋 Saved URL map to ${URL_MAP_FILE}`);
    }
    
    // Summary
    console.log('\n📊 Results:');
    console.log(`   Success: ${results.success}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Failed: ${results.failed}`);
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
```

### 2.2 Add npm script

```json
{
  "scripts": {
    "blob:upload": "node scripts/upload-images-to-blob.js",
    "blob:upload:dry": "node scripts/upload-images-to-blob.js --dry-run",
    "blob:upload:force": "node scripts/upload-images-to-blob.js --force"
  }
}
```

---

## Phase 3: Refactor Scrapers for Blob URLs

### 3.1 Create URL Mapping Utility

**File: `src/utils/blobUrls.js`**

```javascript
/**
 * @fileoverview Utility for mapping external image URLs to Vercel Blob URLs.
 * @module utils/blobUrls
 */

const fs = require('fs');
const path = require('path');

const URL_MAP_FILE = path.join(__dirname, '../../data/blob-url-map.json');

/** @type {Object<string, string>} */
let urlMap = null;

/**
 * Load URL mapping from file
 */
function loadUrlMap() {
    if (urlMap !== null) return urlMap;
    
    if (fs.existsSync(URL_MAP_FILE)) {
        urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
    } else {
        urlMap = {};
    }
    
    return urlMap;
}

/**
 * Get Blob URL for an external image URL
 * @param {string} externalUrl - Original external URL
 * @returns {string} Blob URL if available, otherwise original URL
 */
function getBlobUrl(externalUrl) {
    if (!process.env.USE_BLOB_URLS) {
        return externalUrl;
    }
    
    const map = loadUrlMap();
    return map[externalUrl] || externalUrl;
}

/**
 * Transform all image URLs in an object to Blob URLs
 * @param {any} obj - Object to transform
 * @returns {any} Transformed object
 */
function transformUrls(obj) {
    if (!process.env.USE_BLOB_URLS) {
        return obj;
    }
    
    if (typeof obj === 'string') {
        if (obj.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
            return getBlobUrl(obj);
        }
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(transformUrls);
    }
    
    if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = transformUrls(value);
        }
        return result;
    }
    
    return obj;
}

module.exports = {
    loadUrlMap,
    getBlobUrl,
    transformUrls
};
```

### 3.2 Update combinedetails.js

Add URL transformation before writing final JSON:

```javascript
const { transformUrls } = require('../utils/blobUrls');

// Before fs.writeFile:
const outputData = process.env.USE_BLOB_URLS 
    ? transformUrls(events) 
    : events;

fs.writeFileSync('data/events.min.json', JSON.stringify(outputData));
```

---

## Phase 4: GitHub Actions Integration

### 4.1 Update Workflow: `workflows/scraper.yml`

```yaml
name: Run Scraper Pipeline

on:
  schedule:
    - cron: '0 */8 * * *'
  workflow_dispatch:

permissions:
  contents: write

env:
  BLOB_READ_WRITE_TOKEN: ${{ secrets.BLOB_READ_WRITE_TOKEN }}

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run scrape
        run: npm run scrape
        continue-on-error: true
      
      - name: Run shiny scrape
        run: npm run scrapeshinies
        continue-on-error: true
      
      - name: Run detailed scrape
        run: npm run detailedscrape
        continue-on-error: true
      
      - name: Combine details
        run: npm run combinedetails
        continue-on-error: true
      
      - name: Upload images to Blob Storage
        if: env.BLOB_READ_WRITE_TOKEN != ''
        run: npm run blob:upload
        continue-on-error: true
      
      - name: Commit and push changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "chore: update scraped data"
            git push
          fi
```

### 4.2 Add GitHub Secret

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: (copy from Vercel Dashboard → Storage → scrapedpogo-images → Settings)

---

## Phase 5: Vercel Deployment Integration

### 5.1 Connect GitHub to Vercel

The project `scraped-po-go` is already connected. Verify settings:

1. Vercel Dashboard → Project → Settings → Git
2. Confirm **Production Branch**: `main`
3. Confirm **Automatic Deployments**: Enabled

### 5.2 Create vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run combinedetails",
  "outputDirectory": "data",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

### 5.3 Environment Variables in Vercel

Add these environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `USE_BLOB_URLS` | `true` | Production |
| `BLOB_READ_WRITE_TOKEN` | (auto-created by Blob store) | All |

---

## Phase 6: API Endpoints (Optional)

If you want to serve data via Vercel Functions instead of static files:

### 6.1 Create API Route: `api/events.js`

```javascript
const fs = require('fs');
const path = require('path');
const { transformUrls } = require('../src/utils/blobUrls');

export default function handler(req, res) {
    const dataPath = path.join(process.cwd(), 'data', 'events.min.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const output = process.env.USE_BLOB_URLS 
        ? transformUrls(data) 
        : data;
    
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(output);
}
```

---

## Blob SDK Quick Reference

### Upload (put)
```javascript
import { put } from '@vercel/blob';

const blob = await put('pokemon/pikachu.png', imageBuffer, {
    access: 'public',
    addRandomSuffix: false,     // Default is false - keeps predictable URLs
    allowOverwrite: true,       // Required to update existing blobs
    contentType: 'image/png',   // Auto-detected if not set
    cacheControlMaxAge: 2592000 // 30 days (default is 1 month)
});

// Returns: { pathname, url, downloadUrl, contentType, contentDisposition }
```

**Important notes:**
- `addRandomSuffix` defaults to `false` - no random suffix added by default
- Without `allowOverwrite: true`, uploading to an existing pathname throws an error
- Blobs are cached for up to 1 month by default (minimum configurable is 60 seconds)
- Changes may take up to 60 seconds to propagate through Vercel's cache

### List blobs
```javascript
import { list } from '@vercel/blob';

const { blobs, hasMore, cursor } = await list({
    prefix: 'pokemon/',
    limit: 1000
});
```

### Delete blob
```javascript
import { del } from '@vercel/blob';

await del('https://xxx.blob.vercel-storage.com/pokemon/pikachu.png');
// Or delete multiple:
await del([url1, url2, url3]);
```

### Get metadata
```javascript
import { head } from '@vercel/blob';

const metadata = await head(urlOrPathname);
// Returns: { size, uploadedAt, pathname, contentType, url, downloadUrl, cacheControl }
```

### Copy blob
```javascript
import { copy } from '@vercel/blob';

const copied = await copy(fromUrl, 'new/path.png', { access: 'public' });
```

---

## CLI Commands

```bash
# List all blobs
vercel blob list

# Upload a file
vercel blob put image.jpg --pathname pokemon/image.jpg

# Delete a blob
vercel blob del pokemon/image.jpg

# Copy a blob
vercel blob copy pokemon/old.jpg pokemon/new.jpg

# Create a new store
vercel blob store add my-store --region iad1
```

---

## Rollback Plan

If issues arise with Blob Storage:

1. **Disable Blob URLs**: Set `USE_BLOB_URLS=false` in Vercel environment variables
2. **Redeploy**: Push any commit to trigger redeployment with original URLs
3. **Remove from workflow**: Comment out `blob:upload` step in GitHub Actions

The original external CDN URLs remain in the scraped data and will be used automatically when `USE_BLOB_URLS` is not set.

---

## Success Criteria

- [ ] Blob store created and connected to project
- [ ] `BLOB_READ_WRITE_TOKEN` available in GitHub Actions
- [ ] Upload script successfully uploads all 1,459 images
- [ ] URL mapping file (`blob-url-map.json`) generated
- [ ] JSON output correctly transforms URLs when `USE_BLOB_URLS=true`
- [ ] GitHub Actions workflow completes without errors
- [ ] API consumers receive Blob URLs in production

---

## References

- [Vercel Blob Documentation](https://vercel.com/docs/vercel-blob)
- [Vercel Blob SDK](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
- [Vercel CLI Blob Commands](https://vercel.com/docs/cli/blob)
- [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
- [Environment Variables](https://vercel.com/docs/environment-variables)
