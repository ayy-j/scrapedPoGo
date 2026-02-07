#!/usr/bin/env node
/**
 * Simple HTTP server to serve the visualization front-end
 * Run with: node serve.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const zlib = require('zlib');

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath;

    // Route handling
    if (req.url === '/') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
    } else if (req.url.startsWith('/data/')) {
        // Serve data files
        filePath = path.join(__dirname, req.url);
    } else {
        // Serve static files from public directory
        filePath = path.join(PUBLIC_DIR, req.url);
    }

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(__dirname);
    if (!resolvedPath.startsWith(rootPath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Check if file exists
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Get file extension and content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Prepare headers
        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Vary': 'Accept-Encoding',
            // Disable caching for development
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        };

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const raw = fs.createReadStream(filePath);

        // Handle error during read
        raw.on('error', (err) => {
            console.error('File read error:', err);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        });

        // Compression logic
        if (acceptEncoding.match(/\bgzip\b/)) {
            headers['Content-Encoding'] = 'gzip';
            res.writeHead(200, headers);
            const gzip = zlib.createGzip();
            raw.pipe(gzip).pipe(res);

            gzip.on('error', (err) => {
                console.error('Compression error:', err);
                if (!res.headersSent) {
                    res.end();
                }
            });
        } else {
            res.writeHead(200, headers);
            raw.pipe(res);
        }
    });
});

server.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   Pokémon GO Data Visualization Server                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🚀 Server running at: http://localhost:${PORT}`);
    console.log(`  📁 Serving files from: ${PUBLIC_DIR}`);
    console.log(`  📊 Data directory: ${DATA_DIR}`);
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error('Try using a different port: PORT=3001 node serve.js');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
