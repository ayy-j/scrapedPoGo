/**
 * @fileoverview Event details combiner.
 * Merges scraped event detail data from temporary files back into
 * the main events.json file, then cleans up temp files.
 * @module scrapers/combinedetails
 */

const fs = require('fs');

/**
 * Main function that combines detailed event data with base events.
 * Reads all temporary JSON files from data/temp, matches them to events
 * by ID, merges the detailed data, and writes updated events files.
 * Finally cleans up the temporary directory.
 * 
 * Supported event types for merging:
 * - generic (meta flags)
 * - research-breakthrough, pokemon-spotlight-hour, community-day
 * - raid-battles, raid-hour, raid-day
 * - team-go-rocket, go-rocket-takeover, go-battle-league
 * - season, pokemon-go-tour, timed-research, special-research
 * - max-battles, max-mondays, go-pass, pokestop-showcase
 * - event, promo-codes
 * 
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run after detailedscrape.js completes:
 * // node src/scrapers/combinedetails.js
 * // Updates data/events.json with detailed event data
 */
function main()
{
    var events = JSON.parse(fs.readFileSync("./data/events.min.json"));

    fs.readdir("data/temp", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(f =>
        {
            var data = JSON.parse(fs.readFileSync("./data/temp/" + f));

            events.forEach(e =>
            {
                if (e.eventID == data.id)
                {
                    // add generic data fields directly to event (available for all possible events)
                    if (data.type == "generic")
                    {
                        Object.assign(e, data.data);
                    }
                    // add event specific data directly to event object
                    if (data.type == "research-breakthrough" ||
                        data.type == "pokemon-spotlight-hour" ||
                        data.type == "community-day" ||
                        data.type == "raid-battles" ||
                        data.type == "raid-hour" ||
                        data.type == "raid-day" ||
                        data.type == "team-go-rocket" ||
                        data.type == "go-rocket-takeover" ||
                        data.type == "go-battle-league" ||
                        data.type == "season" ||
                        data.type == "pokemon-go-tour" ||
                        data.type == "timed-research" ||
                        data.type == "special-research" ||
                        data.type == "max-battles" ||
                        data.type == "max-mondays" ||
                        data.type == "go-pass" ||
                        data.type == "pokestop-showcase" ||
                        data.type == "event" ||
                        data.type == "promo-codes")
                    {
                        Object.assign(e, data.data);
                    }
                }
            });
        });

        fs.writeFile('data/events.json', JSON.stringify(events, null, 4), err => {
            if (err) {
                console.error(err);
                return;
            }
        });
        fs.writeFile('data/events.min.json', JSON.stringify(events), err => {
            if (err) {
                console.error(err);
                return;
            }
        });

        fs.rm("data/temp", { recursive: true }, (err) => {
            if (err) { throw err; }
        });
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