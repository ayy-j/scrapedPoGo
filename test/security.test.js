const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUrl } = require('../src/utils/security');

test('validateUrl blocks non-http protocols', () => {
    assert.equal(validateUrl('ftp://example.com'), false);
    assert.equal(validateUrl('file:///etc/passwd'), false);
    assert.equal(validateUrl('javascript:alert(1)'), false);
});

test('validateUrl blocks localhost', () => {
    assert.equal(validateUrl('http://localhost'), false);
    assert.equal(validateUrl('http://localhost:8080'), false);
    assert.equal(validateUrl('http://127.0.0.1'), false);
    assert.equal(validateUrl('http://0.0.0.0'), false);
    assert.equal(validateUrl('http://[::1]'), false);
});

test('validateUrl blocks private IPs', () => {
    assert.equal(validateUrl('http://192.168.1.1'), false);
    assert.equal(validateUrl('http://10.0.0.1'), false);
    assert.equal(validateUrl('http://172.16.0.1'), false);
    assert.equal(validateUrl('http://169.254.169.254'), false); // Metadata service
});

test('validateUrl allows public URLs', () => {
    assert.equal(validateUrl('https://example.com'), true);
    assert.equal(validateUrl('http://google.com'), true);
    assert.equal(validateUrl('https://pokemn.quest/data/events.json'), true);
});
