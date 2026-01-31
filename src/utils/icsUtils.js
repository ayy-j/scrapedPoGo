const moment = require('moment');

/**
 * Formats a date string for iCalendar (ICS) format.
 * Handles both UTC (Z-suffixed) and local (floating) times.
 *
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string} ICS formatted date string (YYYYMMDDTHHmmss[Z])
 */
function formatDateForIcs(dateStr) {
    if (!dateStr) return '';
    // If it ends with Z, it's UTC
    if (dateStr.endsWith('Z')) {
        return moment(dateStr).utc().format('YYYYMMDDTHHmmss') + 'Z';
    }
    // Otherwise assume local time (floating)
    return moment(dateStr).format('YYYYMMDDTHHmmss');
}

/**
 * Generates an iCalendar (ICS) string from an array of events.
 *
 * @param {Array} events - List of event objects
 * @returns {string} Complete ICS file content
 */
function generateIcs(events) {
    const timestamp = moment().utc().format('YYYYMMDDTHHmmss') + 'Z';

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PokemonGO Data Explorer//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Pokémon GO Events',
    ];

    events.forEach(event => {
        if (!event.start || !event.end) return;

        const start = formatDateForIcs(event.start);
        const end = formatDateForIcs(event.end);

        ics.push('BEGIN:VEVENT');
        ics.push(`UID:${event.eventID}@pokemn.quest`);
        ics.push(`DTSTAMP:${timestamp}`);
        ics.push(`DTSTART:${start}`);
        ics.push(`DTEND:${end}`);

        let summary = event.name;
        if (event.heading) {
            summary = `${event.heading}: ${event.name}`;
        }
        ics.push(`SUMMARY:${summary}`);

        let description = `Type: ${event.eventType}\\n`;
        if (event.bonuses && event.bonuses.length > 0) {
             const bonusText = event.bonuses.map(b => typeof b === 'string' ? b : b.text).join(', ');
             description += `Bonuses: ${bonusText}\\n`;
        }
        description += `\\nMore info: https://leekduck.com/events/${event.eventID}/`;

        ics.push(`DESCRIPTION:${description}`);
        ics.push(`URL:https://leekduck.com/events/${event.eventID}/`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
}

module.exports = {
    formatDateForIcs,
    generateIcs
};
