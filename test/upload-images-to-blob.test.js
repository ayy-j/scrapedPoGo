const test = require('node:test');
const assert = require('node:assert/strict');

const { getUrlsToProcess } = require('../src/scripts/upload-images-to-blob');

test('getUrlsToProcess skips already mapped URLs unless force is enabled', () => {
    const uniqueUrls = [
        'https://example.com/events/banner.jpg',
        'https://example.com/pokemon/a.png',
    ];
    const urlMap = {
        'https://example.com/events/banner.jpg': 'https://pokemn.quest/events/banner.jpg',
    };

    assert.deepEqual(getUrlsToProcess(uniqueUrls, urlMap, false), [
        'https://example.com/pokemon/a.png',
    ]);
    assert.deepEqual(getUrlsToProcess(uniqueUrls, urlMap, true), uniqueUrls);
});
