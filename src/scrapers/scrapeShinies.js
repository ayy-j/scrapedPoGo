/**
 * @fileoverview Shiny Pokemon scraper entry point.
 * Orchestrates the scraping of shiny Pokemon data from LeekDuck/PogoAssets
 * and writes the results to data files.
 * @module scrapers/scrapeShinies
 */

const fs = require('fs');
const shinies = require('../pages/shinies');

/**
 * Main function that runs the shiny Pokemon scraper.
 * Creates the data directory if needed, calls the shinies scraper,
 * and writes both formatted and minified JSON output files.
 * 
 * @async
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run via npm script or directly:
 * // node src/scrapers/scrapeShinies.js
 * // Creates data/shinies.json and data/shinies.min.json
 */
function main()
{
    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    console.log('Scraping shiny Pokemon data from PogoAssets...');
    
    shinies().then(data => {
        fs.writeFile('data/shinies.json', JSON.stringify(data, null, 4), err => {
            if (err) {
                console.error('Error writing shinies.json:', err);
                return;
            }
            console.log(`Successfully saved ${data.length} shinies to data/shinies.json`);
        });
        
        fs.writeFile('data/shinies.min.json', JSON.stringify(data), err => {
            if (err) {
                console.error('Error writing shinies.min.json:', err);
                return;
            }
        });
    }).catch(error => {
        console.error('Failed to scrape shinies:', error);
        process.exit(1);
    });
}

try
{
    main();
}
catch (e)
{
    console.error("ERROR: " + e);
    process.exit(1);
}
