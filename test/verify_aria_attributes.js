const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
const jsContent = fs.readFileSync(path.resolve(__dirname, '../web/app.js'), 'utf8');

// Mock data
const mockEvents = [
    {
        name: "Test Event 1",
        start: "2023-10-01T10:00:00",
        end: "2023-10-01T18:00:00",
        eventType: "community-day",
        image: "test1.png"
    }
];

const dom = new JSDOM(htmlContent, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
});

const { window } = dom;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: () => null,
        setItem: () => {},
        clear: () => {}
    }
});

// Mock fetch
window.fetch = (url) => {
    if (url.includes('/events')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockEvents)
        });
    }
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
    });
};

const scriptElement = window.document.createElement('script');
scriptElement.textContent = jsContent;
window.document.body.appendChild(scriptElement);

console.log("Waiting for app to initialize...");

setTimeout(() => {
    let success = true;

    // 1. Check Filter Chips
    // Filter chips are rendered after data load.
    // 'community-day' should be a filter chip.
    const filters = window.document.getElementById('filters');
    const chips = filters.querySelectorAll('.filter-chip');

    if (chips.length === 0) {
         console.error("FAILURE: No filter chips found.");
         success = false;
    } else {
        const chip = chips[0];
        if (!chip.hasAttribute('aria-pressed')) {
             console.error("FAILURE: Filter chip missing aria-pressed attribute.");
             success = false;
        } else {
             console.log("SUCCESS: Filter chip has aria-pressed.");
             // Click it and check if it toggles
             chip.click();

             // Re-query because render() replaces the elements
             const newChips = filters.querySelectorAll('.filter-chip');
             const newChip = newChips[0];

             if (newChip.getAttribute('aria-pressed') !== 'true') {
                  console.error("FAILURE: Filter chip aria-pressed did not toggle to true.");
                  success = false;
             } else {
                 console.log("SUCCESS: Filter chip toggled correctly.");
             }
        }
    }

    // 2. Check View Toggle
    const viewToggle = window.document.getElementById('viewToggle');
    const listBtn = viewToggle.querySelector('button[data-view="list"]');
    const calendarBtn = viewToggle.querySelector('button[data-view="calendar"]');

    if (!listBtn.hasAttribute('aria-pressed') || !calendarBtn.hasAttribute('aria-pressed')) {
        console.error("FAILURE: View toggle buttons missing aria-pressed.");
        success = false;
    } else {
        console.log("SUCCESS: View toggle buttons have aria-pressed.");
        if (listBtn.getAttribute('aria-pressed') !== 'true' || calendarBtn.getAttribute('aria-pressed') !== 'false') {
             console.error("FAILURE: View toggle initial state incorrect.");
             success = false;
        } else {
             console.log("SUCCESS: View toggle initial state correct.");
        }
    }

    if (success) {
        console.log("ALL CHECKS PASSED");
        process.exit(0);
    } else {
        console.log("SOME CHECKS FAILED");
        process.exit(1);
    }

}, 1000);
