#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * dev-server.js
 *
 * Zero-dependency static file server for the Noein Solutions landing page.
 * - Serves the current directory on http://localhost:8000
 * - Auto-resolves directory paths to their index.html
 * - Disables caching so edits in HTML/CSS/JS are visible on reload
 * - Optionally opens the browser on first start
 *
 * Usage:
 *   node dev-server.js           # http://localhost:8000
 *   node dev-server.js 3000      # custom port
 *   node dev-server.js --no-open # don't auto-open browser
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8000', 10);
const AUTO_OPEN = !process.argv.includes('--no-open');
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
};

const COLORS = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
};

function colorize(method, status) {
  if (status >= 500) return COLORS.red + method + COLORS.reset;
  if (status >= 400) return COLORS.yellow + method + COLORS.reset;
  if (status >= 300) return COLORS.cyan + method + COLORS.reset;
  return COLORS.green + method + COLORS.reset;
}

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }, headers || {}));
  res.end(body);
}

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, '404 Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
      log(req, 404);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 500, '500 Internal Server Error', { 'Content-Type': 'text/plain; charset=utf-8' });
        log(req, 500);
        return;
      }
      send(res, 200, data, {
        'Content-Type': type,
        'Content-Length': data.length,
        'Last-Modified': stat.mtime.toUTCString(),
      });
      log(req, 200);
    });
  });
}

function log(req, status) {
  const ts = new Date().toISOString().split('T')[1].replace('Z', '');
  const m = colorize(req.method.padEnd(6), status);
  console.log(`${COLORS.dim}${ts}${COLORS.reset}  ${m}  ${status}  ${req.url}`);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname || '/');

  // Security: prevent path traversal
  const safePath = path.normalize(pathname).replace(/^([/\\.]+)/, '/');
  let filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, '403 Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    log(req, 403);
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      // Redirect /foo -> /foo/ (so relative links work)
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { 'Location': pathname + '/' });
        res.end();
        log(req, 301);
        return;
      }
      filePath = path.join(filePath, 'index.html');
      serveFile(req, res, filePath);
      return;
    }
    if (err) {
      // Try adding .html
      if (!path.extname(filePath)) {
        const htmlPath = filePath + '.html';
        if (fs.existsSync(htmlPath)) {
          serveFile(req, res, htmlPath);
          return;
        }
      }
      send(res, 404, '404 Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
      log(req, 404);
      return;
    }
    serveFile(req, res, filePath);
  });
});

server.listen(PORT, () => {
  const banner = `
${COLORS.green}╭─────────────────────────────────────────────────────────────╮${COLORS.reset}
${COLORS.green}│${COLORS.reset}  ${COLORS.cyan}Noein Solutions — local dev server${COLORS.reset}                       ${COLORS.green}│${COLORS.reset}
${COLORS.green}│${COLORS.reset}  ${COLORS.dim}http://localhost:${PORT}/${COLORS.reset}                                        ${COLORS.green}│${COLORS.reset}
${COLORS.green}│${COLORS.reset}  ${COLORS.dim}http://localhost:${PORT}/it/${COLORS.reset}                                      ${COLORS.green}│${COLORS.reset}
${COLORS.green}╰─────────────────────────────────────────────────────────────╯${COLORS.reset}
  Press ${COLORS.yellow}Ctrl+C${COLORS.reset} to stop.
`;
  console.log(banner);

  if (AUTO_OPEN) {
    const { exec } = require('child_process');
    const openCmd = process.platform === 'win32' ? `start "" "http://localhost:${PORT}/"`
               : process.platform === 'darwin' ? `open "http://localhost:${PORT}/"`
               : `xdg-open "http://localhost:${PORT}/"`;
    exec(openCmd, () => { /* ignore errors */ });
  }
});
