const fs = require('fs');
const path = require('path');
const { generateIcs } = require('../utils/icsUtils');
const logger = require('../utils/logger');

const eventsFile = path.join(__dirname, '../../data/events.min.json');
const outputFile = path.join(__dirname, '../../data/events.ics');

function main() {
    try {
        logger.info('Generating ICS calendar feed...');

        if (!fs.existsSync(eventsFile)) {
            logger.error(`Events file not found: ${eventsFile}`);
            process.exit(1);
        }

        const eventsData = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));

        let events = [];
        if (Array.isArray(eventsData)) {
            events = eventsData;
        } else if (typeof eventsData === 'object') {
             // Handle object format (e.g. keyed by eventType) if encountered
             // Flatten all values if they are arrays
             Object.values(eventsData).forEach(val => {
                 if (Array.isArray(val)) {
                     events = events.concat(val);
                 }
             });
        }

        if (events.length === 0) {
            logger.warn('No events found to generate ICS feed.');
        }

        const icsContent = generateIcs(events);

        fs.writeFileSync(outputFile, icsContent);
        logger.success(`ICS feed generated at ${outputFile}`);

    } catch (err) {
        logger.error(`Failed to generate ICS feed: ${err.message}`);
        process.exit(1);
    }
}

main();
