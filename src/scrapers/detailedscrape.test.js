
const fs = require('fs');
const https = require('https');

// Mock fs and https
jest.mock('fs');
jest.mock('https');

// Mock all scraper modules
jest.mock('../pages/detailed/breakthrough', () => ({ get: jest.fn().mockResolvedValue('breakthrough') }));
jest.mock('../pages/detailed/spotlight', () => ({ get: jest.fn().mockResolvedValue('spotlight') }));
jest.mock('../pages/detailed/communityday', () => ({ get: jest.fn().mockResolvedValue('communityday') }));
jest.mock('../pages/detailed/raidbattles', () => ({ get: jest.fn().mockResolvedValue('raidbattles') }));
jest.mock('../pages/detailed/research', () => ({ get: jest.fn().mockResolvedValue('research') }));
jest.mock('../pages/detailed/generic', () => ({ get: jest.fn().mockResolvedValue('generic') }));
jest.mock('../pages/detailed/raidhour', () => ({ get: jest.fn().mockResolvedValue('raidhour') }));
jest.mock('../pages/detailed/raidday', () => ({ get: jest.fn().mockResolvedValue('raidday') }));
jest.mock('../pages/detailed/teamgorocket', () => ({ get: jest.fn().mockResolvedValue('teamgorocket') }));
jest.mock('../pages/detailed/gobattleleague', () => ({ get: jest.fn().mockResolvedValue('gobattleleague') }));
jest.mock('../pages/detailed/season', () => ({ get: jest.fn().mockResolvedValue('season') }));
jest.mock('../pages/detailed/gotour', () => ({ get: jest.fn().mockResolvedValue('gotour') }));
jest.mock('../pages/detailed/timedresearch', () => ({ get: jest.fn().mockResolvedValue('timedresearch') }));
jest.mock('../pages/detailed/maxbattles', () => ({ get: jest.fn().mockResolvedValue('maxbattles') }));
jest.mock('../pages/detailed/maxmondays', () => ({ get: jest.fn().mockResolvedValue('maxmondays') }));
jest.mock('../pages/detailed/gopass', () => ({ get: jest.fn().mockResolvedValue('gopass') }));
jest.mock('../pages/detailed/pokestopshowcase', () => ({ get: jest.fn().mockResolvedValue('pokestopshowcase') }));
jest.mock('../pages/detailed/event', () => ({ get: jest.fn().mockResolvedValue('event') }));

// Import the modules to assert on them
const breakthrough = require('../pages/detailed/breakthrough');
const spotlight = require('../pages/detailed/spotlight');
const communityday = require('../pages/detailed/communityday');
const raidbattles = require('../pages/detailed/raidbattles');
const research = require('../pages/detailed/research');
const generic = require('../pages/detailed/generic');
const raidhour = require('../pages/detailed/raidhour');
const raidday = require('../pages/detailed/raidday');
const teamgorocket = require('../pages/detailed/teamgorocket');
const gobattleleague = require('../pages/detailed/gobattleleague');
const season = require('../pages/detailed/season');
const gotour = require('../pages/detailed/gotour');
const timedresearch = require('../pages/detailed/timedresearch');
const maxbattles = require('../pages/detailed/maxbattles');
const maxmondays = require('../pages/detailed/maxmondays');
const gopass = require('../pages/detailed/gopass');
const pokestopshowcase = require('../pages/detailed/pokestopshowcase');
const event = require('../pages/detailed/event');

describe('detailedscrape', () => {
    let detailedscrape;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should dispatch to correct scrapers based on event type', () => {
        // Mock fs.existsSync to return true
        fs.existsSync.mockReturnValue(true);

        // Mock events data
        const events = [
            { eventID: 'ev1', eventType: 'research-breakthrough' },
            { eventID: 'ev2', eventType: 'pokemon-spotlight-hour' },
            { eventID: 'ev3', eventType: 'community-day' },
            { eventID: 'ev4', eventType: 'raid-battles' },
            { eventID: 'ev5', eventType: 'raid-hour' },
            { eventID: 'ev6', eventType: 'raid-day' },
            { eventID: 'ev7', eventType: 'team-go-rocket' },
            { eventID: 'ev8', eventType: 'go-rocket-takeover' }, // Alias
            { eventID: 'ev9', eventType: 'go-battle-league' },
            { eventID: 'ev10', eventType: 'season' },
            { eventID: 'ev11', eventType: 'pokemon-go-tour' },
            { eventID: 'ev12', eventType: 'timed-research' },
            { eventID: 'ev13', eventType: 'special-research' }, // Alias
            { eventID: 'ev14', eventType: 'max-battles' },
            { eventID: 'ev15', eventType: 'max-mondays' },
            { eventID: 'ev16', eventType: 'go-pass' },
            { eventID: 'ev17', eventType: 'pokestop-showcase' },
            { eventID: 'ev18', eventType: 'research' },
            { eventID: 'ev19', eventType: 'event' },
            { eventID: 'ev20', eventType: 'unknown-type' } // Should only call generic
        ];

        fs.readFileSync.mockReturnValue(JSON.stringify(events));

        // Mock https.get
        const mockRes = {
            on: jest.fn((event, callback) => {
                if (event === 'data') {
                    callback('[]'); // Return empty array JSON
                }
                if (event === 'end') {
                    callback();
                }
                return mockRes;
            })
        };
        https.get.mockImplementation((url, callback) => {
            callback(mockRes);
            return { on: jest.fn() };
        });

        const { main } = require('./detailedscrape');

        main();

        // Check generic is called for all events (20 events)
        expect(generic.get).toHaveBeenCalledTimes(20);

        // Check specific scrapers
        expect(breakthrough.get).toHaveBeenCalledWith(expect.stringContaining('ev1'), 'ev1', expect.any(Array));
        expect(spotlight.get).toHaveBeenCalledWith(expect.stringContaining('ev2'), 'ev2', expect.any(Array));
        expect(communityday.get).toHaveBeenCalledWith(expect.stringContaining('ev3'), 'ev3', expect.any(Array));
        expect(raidbattles.get).toHaveBeenCalledWith(expect.stringContaining('ev4'), 'ev4', expect.any(Array));
        expect(raidhour.get).toHaveBeenCalledWith(expect.stringContaining('ev5'), 'ev5', expect.any(Array));
        expect(raidday.get).toHaveBeenCalledWith(expect.stringContaining('ev6'), 'ev6', expect.any(Array));

        // team-go-rocket alias
        expect(teamgorocket.get).toHaveBeenCalledWith(expect.stringContaining('ev7'), 'ev7', expect.any(Array));
        expect(teamgorocket.get).toHaveBeenCalledWith(expect.stringContaining('ev8'), 'ev8', expect.any(Array));

        expect(gobattleleague.get).toHaveBeenCalledWith(expect.stringContaining('ev9'), 'ev9', expect.any(Array));
        expect(season.get).toHaveBeenCalledWith(expect.stringContaining('ev10'), 'ev10', expect.any(Array));
        expect(gotour.get).toHaveBeenCalledWith(expect.stringContaining('ev11'), 'ev11', expect.any(Array));

        // timed-research alias
        expect(timedresearch.get).toHaveBeenCalledWith(expect.stringContaining('ev12'), 'ev12', expect.any(Array));
        expect(timedresearch.get).toHaveBeenCalledWith(expect.stringContaining('ev13'), 'ev13', expect.any(Array));

        expect(maxbattles.get).toHaveBeenCalledWith(expect.stringContaining('ev14'), 'ev14', expect.any(Array));
        expect(maxmondays.get).toHaveBeenCalledWith(expect.stringContaining('ev15'), 'ev15', expect.any(Array));
        expect(gopass.get).toHaveBeenCalledWith(expect.stringContaining('ev16'), 'ev16', expect.any(Array));
        expect(pokestopshowcase.get).toHaveBeenCalledWith(expect.stringContaining('ev17'), 'ev17', expect.any(Array));
        expect(research.get).toHaveBeenCalledWith(expect.stringContaining('ev18'), 'ev18', expect.any(Array));
        expect(event.get).toHaveBeenCalledWith(expect.stringContaining('ev19'), 'ev19', expect.any(Array));

        // Total calls check to verify no double calls
        expect(breakthrough.get).toHaveBeenCalledTimes(1);
        expect(spotlight.get).toHaveBeenCalledTimes(1);
        expect(communityday.get).toHaveBeenCalledTimes(1);
        expect(raidbattles.get).toHaveBeenCalledTimes(1);
        expect(raidhour.get).toHaveBeenCalledTimes(1);
        expect(raidday.get).toHaveBeenCalledTimes(1);
        expect(teamgorocket.get).toHaveBeenCalledTimes(2);
        expect(gobattleleague.get).toHaveBeenCalledTimes(1);
        expect(season.get).toHaveBeenCalledTimes(1);
        expect(gotour.get).toHaveBeenCalledTimes(1);
        expect(timedresearch.get).toHaveBeenCalledTimes(2);
        expect(maxbattles.get).toHaveBeenCalledTimes(1);
        expect(maxmondays.get).toHaveBeenCalledTimes(1);
        expect(gopass.get).toHaveBeenCalledTimes(1);
        expect(pokestopshowcase.get).toHaveBeenCalledTimes(1);
        expect(research.get).toHaveBeenCalledTimes(1);
        expect(event.get).toHaveBeenCalledTimes(1);
    });
});
