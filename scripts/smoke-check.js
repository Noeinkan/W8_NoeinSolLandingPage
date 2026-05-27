#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 5;

function parseArgs(argv) {
  const options = {
    landingUrl: process.env.LANDING_URL || 'https://noeinsolutions.com/',
    italianUrl: process.env.ITALIAN_URL || 'https://noeinsolutions.com/it/index.html',
    appUrl: process.env.APP_URL || 'https://app.noeinsolutions.com/',
    timeoutMs: Number(process.env.SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--landing-url' && next) {
      options.landingUrl = next;
      index += 1;
      continue;
    }
    if (arg === '--italian-url' && next) {
      options.italianUrl = next;
      index += 1;
      continue;
    }
    if (arg === '--app-url' && next) {
      options.appUrl = next;
      index += 1;
      continue;
    }
    if (arg === '--timeout-ms' && next) {
      options.timeoutMs = Number(next);
      index += 1;
      continue;
    }
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error('Expected a positive integer for timeout.');
  }

  return options;
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractMatch(content, regex, label) {
  const match = content.match(regex);
  if (!match) {
    throw new Error('Missing ' + label + ' in local source.');
  }
  return match[1].trim();
}

function getLandingMarkers() {
  const indexHtml = readFile('index.html');
  const italianHtml = readFile(path.join('it', 'index.html'));

  return {
    title: extractMatch(indexHtml, /<title>([\s\S]*?)<\/title>/i, 'homepage title'),
    canonical: extractMatch(indexHtml, /<link rel="canonical" href="([^"]+)">/i, 'homepage canonical'),
    italianCanonical: extractMatch(italianHtml, /<link rel="canonical" href="([^"]+)">/i, 'Italian homepage canonical'),
  };
}

function requestText(targetUrl, timeoutMs, redirectCount) {
  return new Promise((resolve, reject) => {
    const urlObject = new URL(targetUrl);
    const client = urlObject.protocol === 'http:' ? http : https;
    const request = client.request(
      urlObject,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'noeinsol-smoke-check/1.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
      },
      (response) => {
        const statusCode = response.statusCode || 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
          response.resume();
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error('Too many redirects for ' + targetUrl));
            return;
          }
          resolve(requestText(new URL(location, targetUrl).toString(), timeoutMs, redirectCount + 1));
          return;
        }

        if (statusCode < 200 || statusCode >= 400) {
          response.resume();
          reject(new Error('Unexpected HTTP ' + statusCode + ' for ' + targetUrl));
          return;
        }

        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          resolve({ statusCode, body, finalUrl: targetUrl });
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Timed out fetching ' + targetUrl));
    });
    request.on('error', reject);
    request.end();
  });
}

function assertIncludes(content, snippet, label) {
  if (!content.includes(snippet)) {
    throw new Error('Expected ' + label + '.');
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function checkLanding(options, markers) {
  const homepage = await requestText(options.landingUrl, options.timeoutMs, 0);
  assertIncludes(homepage.body, '<title>' + markers.title + '</title>', 'homepage title marker');
  assertIncludes(homepage.body, '<link rel="canonical" href="' + markers.canonical + '">', 'homepage canonical marker');
  assert(
    !homepage.body.includes('<link rel="canonical" href="https://noeinsolutions.com/capsar.html">'),
    'Homepage is serving the Capsar landing page instead of the homepage.'
  );

  const italianHomepage = await requestText(options.italianUrl, options.timeoutMs, 0);
  assertIncludes(italianHomepage.body, '<html lang="it">', 'Italian lang marker');
  assertIncludes(
    italianHomepage.body,
    '<link rel="canonical" href="' + markers.italianCanonical + '">',
    'Italian canonical marker'
  );
}

async function checkApp(options) {
  const app = await requestText(options.appUrl, options.timeoutMs, 0);
  assertIncludes(app.body, 'Capsar.io', 'Capsar app title marker');
  assertIncludes(app.body, '<div id="root"></div>', 'Capsar SPA root marker');
  assert(
    !app.body.includes('Submission-ready BEPs and Digital Delivery Consulting | Noein Solutions'),
    'Capsar app URL is serving the Noein Solutions landing page.'
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markers = getLandingMarkers();

  await checkLanding(options, markers);
  await checkApp(options);

  console.log('Smoke checks passed for landing and app endpoints.');
}

main().catch((error) => {
  console.error('Smoke checks failed.');
  console.error(error.message);
  process.exit(1);
});