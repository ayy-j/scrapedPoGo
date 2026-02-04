const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '../utils/blob-url-map.json');
const eventsPath = path.join(__dirname, '../../data/events.min.json');

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
const str = JSON.stringify(events);

// Find cdn.leekduck URLs
const leekduckMatches = str.match(/https:\/\/cdn\.leekduck\.com[^"]+/g) || [];
const unique = [...new Set(leekduckMatches)];
const missing = unique.filter(u => !map[u]);

console.log('Total URLs in map:', Object.keys(map).length);
console.log('Leekduck URLs in events:', unique.length);
console.log('Missing from map:', missing.length);

if (missing.length > 0) {
    console.log('\nFirst 10 missing URLs:');
    missing.slice(0, 10).forEach(u => console.log(' ', u));
}
