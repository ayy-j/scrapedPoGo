#!/usr/bin/env node
/**
 * Transform all data files to replace CDN URLs with blob storage URLs.
 * Run with: USE_BLOB_URLS=true node src/scripts/transform-blob-urls.js
 */
const fs = require('fs');
const path = require('path');
const { transformUrls, clearCache, isEnabled, initUrlMap } = require('../utils/blobUrls');

if (!isEnabled()) {
    console.error('USE_BLOB_URLS must be set to true');
    process.exit(1);
}

async function main() {
    clearCache();
    await initUrlMap();

    // Transform main data files
    const mainFiles = ['events', 'raids', 'research', 'eggs', 'rocketLineups', 'shinies'];
    for (const f of mainFiles) {
        const fp = path.join('data', f + '.min.json');
        if (!fs.existsSync(fp)) continue;
        const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const transformed = transformUrls(data);
        fs.writeFileSync(fp, JSON.stringify(transformed));
        fs.writeFileSync(path.join('data', f + '.json'), JSON.stringify(transformed, null, 2));

        let cdn = 0;
        JSON.stringify(transformed, (k, v) => {
            if (typeof v === 'string' && v.includes('cdn.leekduck.com')) cdn++;
            return v;
        });
        console.log(`${f}: ${cdn} CDN URLs remaining`);
    }

    // Transform eventTypes files
    const etDir = path.join('data', 'eventTypes');
    if (fs.existsSync(etDir)) {
        const files = fs.readdirSync(etDir).filter(f => f.endsWith('.min.json'));
        for (const f of files) {
            const fp = path.join(etDir, f);
            const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
            const transformed = transformUrls(data);
            fs.writeFileSync(fp, JSON.stringify(transformed));
            fs.writeFileSync(fp.replace('.min.json', '.json'), JSON.stringify(transformed, null, 2));
        }
        console.log(`Transformed ${files.length} eventTypes files`);
    }

    console.log('Done!');
}

main().catch(console.error);
