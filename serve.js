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

        // Read and serve file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        });
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
