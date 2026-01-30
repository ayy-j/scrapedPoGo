#!/usr/bin/env node

/**
 * @fileoverview Transform image URLs in JSON data files to use Vercel Blob URLs.
 * Reads the blob-url-map.json and updates all JSON files in data/ directory.
 * @usage node scripts/transform-urls-to-blob.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const URL_MAP_FILE = path.join(__dirname, '../data/blob-url-map.json');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Recursively transform URLs in an object
 * @param {any} obj - Object to transform
 * @param {Object<string, string>} urlMap - URL mapping
 * @param {Object} stats - Statistics tracker
 * @returns {any} Transformed object
 */
function transformUrls(obj, urlMap, stats) {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        // Check if it's an image URL that we have a mapping for
        if (urlMap[obj]) {
            stats.transformed++;
            return urlMap[obj];
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => transformUrls(item, urlMap, stats));
    }

    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = transformUrls(value, urlMap, stats);
        }
        return result;
    }

    return obj;
}

/**
 * Process a single JSON file
 * @param {string} filePath - Path to JSON file
 * @param {Object<string, string>} urlMap - URL mapping
 * @returns {Object} Stats for this file
 */
function processFile(filePath, urlMap) {
    const stats = { transformed: 0 };
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        const transformed = transformUrls(data, urlMap, stats);
        
        if (stats.transformed > 0 && !DRY_RUN) {
            // Determine if minified based on filename
            const isMinified = filePath.includes('.min.json');
            const output = isMinified 
                ? JSON.stringify(transformed) 
                : JSON.stringify(transformed, null, 2);
            
            fs.writeFileSync(filePath, output);
        }
        
        return stats;
    } catch (err) {
        console.error(`  ✗ Error processing ${path.basename(filePath)}: ${err.message}`);
        return { transformed: 0, error: err.message };
    }
}

/**
 * Recursively find all JSON files
 * @param {string} dir - Directory to search
 * @param {string[]} files - Accumulator
 * @returns {string[]} List of file paths
 */
function findJsonFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // Skip temp directories
            if (entry.name !== 'temp') {
                findJsonFiles(fullPath, files);
            }
        } else if (entry.name.endsWith('.json') && !entry.name.includes('blob-url-map')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Main function
 */
function main() {
    console.log('🔄 URL Transformation Script');
    console.log(`   Mode: ${DRY_RUN ? '🧪 DRY RUN' : '📝 LIVE'}\n`);

    // Load URL map
    if (!fs.existsSync(URL_MAP_FILE)) {
        console.error('❌ URL map file not found. Run blob:upload first.');
        console.error(`   Expected: ${URL_MAP_FILE}`);
        process.exit(1);
    }

    const urlMap = JSON.parse(fs.readFileSync(URL_MAP_FILE, 'utf8'));
    const mappingCount = Object.keys(urlMap).length;
    
    console.log(`📋 Loaded ${mappingCount} URL mappings\n`);

    if (mappingCount === 0) {
        console.log('⚠️  No URL mappings found. Nothing to transform.');
        process.exit(0);
    }

    // Find all JSON files
    const jsonFiles = findJsonFiles(DATA_DIR);
    console.log(`📁 Found ${jsonFiles.length} JSON files to process\n`);

    // Process files
    let totalTransformed = 0;
    const results = [];

    for (const filePath of jsonFiles) {
        const relativePath = path.relative(DATA_DIR, filePath);
        const stats = processFile(filePath, urlMap);
        
        if (stats.transformed > 0) {
            results.push({ file: relativePath, ...stats });
            totalTransformed += stats.transformed;
            console.log(`  ✓ ${relativePath}: ${stats.transformed} URLs transformed`);
        }
    }

    // Summary
    console.log('\n━'.repeat(50));
    console.log('📊 Summary');
    console.log('━'.repeat(50));
    console.log(`   Files processed: ${jsonFiles.length}`);
    console.log(`   Files modified: ${results.length}`);
    console.log(`   URLs transformed: ${totalTransformed}`);
    
    if (DRY_RUN) {
        console.log('\n⚠️  DRY RUN - no files were modified');
    } else {
        console.log('\n✅ Transformation complete!');
    }
}

main();
