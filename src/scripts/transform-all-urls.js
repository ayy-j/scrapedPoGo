#!/usr/bin/env node
/**
 * Transform all image URLs in data JSON files to use Vercel Blob URLs
 * This ensures all data files (events, raids, eggs, etc.) use pokemn.quest URLs
 */

const fs = require('fs');
const path = require('path');
const { transformUrls } = require('../utils/blobUrls');

const DATA_DIR = path.join(__dirname, '../../data');

// Files to transform (both formatted and minified versions)
const dataFiles = [
    'events',
    'raids',
    'eggs',
    'research',
    'shinies',
    'rocketLineups'
];

// Get all files from eventTypes directory
function getEventTypeFiles() {
    const eventTypesDir = path.join(DATA_DIR, 'eventTypes');
    if (!fs.existsSync(eventTypesDir)) return [];
    
    return fs.readdirSync(eventTypesDir)
        .filter(f => f.endsWith('.min.json'))
        .map(f => path.join('eventTypes', f.replace('.min.json', '')));
}

async function main() {
    console.log('🔄 Transforming all data file URLs to pokemn.quest...\n');

    const allFiles = [
        ...dataFiles,
        ...getEventTypeFiles()
    ];

    let transformedCount = 0;
    let skippedCount = 0;

    for (const baseName of allFiles) {
        // Process minified version
        const minPath = path.join(DATA_DIR, `${baseName}.min.json`);
        
        if (fs.existsSync(minPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(minPath, 'utf8'));
                const transformed = transformUrls(data);
                fs.writeFileSync(minPath, JSON.stringify(transformed));
                console.log(`  ✅ ${baseName}.min.json`);
                transformedCount++;
            } catch (err) {
                console.error(`  ❌ ${baseName}.min.json: ${err.message}`);
            }
        } else {
            skippedCount++;
        }

        // Also process formatted version if it exists
        const formattedPath = path.join(DATA_DIR, `${baseName}.json`);
        if (fs.existsSync(formattedPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(formattedPath, 'utf8'));
                const transformed = transformUrls(data);
                fs.writeFileSync(formattedPath, JSON.stringify(transformed, null, 2));
                console.log(`  ✅ ${baseName}.json`);
                transformedCount++;
            } catch (err) {
                console.error(`  ❌ ${baseName}.json: ${err.message}`);
            }
        }
    }

    console.log(`\n📊 Summary: ${transformedCount} files transformed, ${skippedCount} skipped`);
    console.log('✅ All data files now use pokemn.quest URLs');
}

main().catch(console.error);
