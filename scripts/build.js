#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const dataDir = path.join(root, 'data');
const indexSrc = path.join(root, 'index.html');
const indexDst = path.join(publicDir, 'index.html');

fs.mkdirSync(publicDir, { recursive: true });
fs.cpSync(dataDir, path.join(publicDir, 'data'), { recursive: true });
fs.copyFileSync(indexSrc, indexDst);

console.log('Build complete: public/ populated with data/ and index.html');
