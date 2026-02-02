const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
const jsContent = fs.readFileSync(path.resolve(__dirname, '../web/app.js'), 'utf8');

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

    const searchInput = window.document.getElementById('searchInput');
    const apiInput = window.document.getElementById('apiInput'); // Another input to test focus protection

    // 1. Test Global Shortcut
    console.log("Testing global '/' shortcut...");

    // Ensure search input is NOT focused initially
    searchInput.blur();
    if (window.document.activeElement === searchInput) {
        console.error("FAILURE: searchInput should not be focused initially.");
        success = false;
    }

    // Trigger '/' keydown on document body
    const event = new window.KeyboardEvent('keydown', {
        key: '/',
        code: 'Slash',
        bubbles: true,
        cancelable: true
    });
    window.document.body.dispatchEvent(event);

    if (window.document.activeElement === searchInput) {
        console.log("SUCCESS: '/' focused the search input.");
    } else {
        console.error("FAILURE: '/' did NOT focus the search input.");
        success = false;
    }

    // 2. Test Input Protection
    console.log("Testing input protection...");

    // Focus another input
    apiInput.focus();
    if (window.document.activeElement !== apiInput) {
        console.error("FAILURE: Could not focus apiInput for testing.");
        success = false;
    } else {
        // Trigger '/' keydown again
        const event2 = new window.KeyboardEvent('keydown', {
            key: '/',
            code: 'Slash',
            bubbles: true,
            cancelable: true
        });
        apiInput.dispatchEvent(event2); // Event happens on the focused element

        if (window.document.activeElement === apiInput) {
            console.log("SUCCESS: '/' did not steal focus when typing in another input.");
        } else {
            console.error("FAILURE: '/' stole focus from another input.");
            success = false;
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
