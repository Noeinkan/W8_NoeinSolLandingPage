const fs = require('fs');
const path = require('path');

const root = __dirname;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getIds(html) {
  const ids = [];
  const regex = /\sid="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    ids.push(match[1]);
  }
  return ids;
}

function assertUniqueIds(relativePath) {
  const html = read(relativePath);
  const ids = getIds(html);
  const seen = new Set();
  const duplicates = [];

  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.push(id);
      return;
    }
    seen.add(id);
  });

  assert(duplicates.length === 0, relativePath + ' has duplicate ids: ' + duplicates.join(', '));
}

function testCapsarPage() {
  const html = read('capsar.html');
  assert(html.includes('href="#platform-preview" class="btn btn-outline"'), 'Capsar preview jump CTA missing');
  assert(/<section class="fade-in" id="platform-preview">[\s\S]*?<div class="section-label">Platform Preview<\/div>/.test(html), 'platform preview anchor is not attached to the preview section');
  assert(html.includes('class="capsar-proof-card"'), 'Capsar proof card missing');
}

function testIndexPage() {
  const html = read('index.html');
  assertUniqueIds('index.html');
  assert(html.includes('class="trust-band fade-in"'), 'trust band missing');
  assert(html.includes('href="capsar.html"'), 'index Capsar CTA missing');
  assert(html.includes('href="bep-checklist.html"'), 'index checklist CTA missing');
  assert(!html.includes('calendly.com'), 'index still references Calendly');
  assert(!html.includes('services.html'), 'index still links to services');
}

function testBepChecklistPage() {
  const html = read('bep-checklist.html');
  assertUniqueIds('bep-checklist.html');
  assert(html.includes('id="bepForm"'), 'bep checklist form missing');
  assert(html.includes('id="bepSections"'), 'bep sections host missing');
  assert(!html.includes('calendly.com'), 'bep-checklist still references Calendly');
}

function testAnalyticsGating() {
  [
    'index.html',
    'about.html',
    'capsar.html',
    'bep-checklist.html',
    'privacy.html'
  ].forEach((relativePath) => {
    const html = read(relativePath);
    assert(html.includes("clarityId.indexOf('YOUR_') !== 0"), relativePath + ' is missing Clarity gating');
    assert(html.includes("ga4Id.indexOf('YOUR_') !== 0"), relativePath + ' is missing GA4 gating');
    assert(!html.includes('googletagmanager.com/gtag/js?id=YOUR_GA4_MEASUREMENT_ID'), relativePath + ' still has placeholder GA script tag');
  });
}

function testMainJs() {
  const js = read(path.join('js', 'main.js'));
  assert(js.includes("var scrollBehavior = reducedMotion ? 'auto' : 'smooth';"), 'reduced-motion scroll behavior missing');
}

function run() {
  testCapsarPage();
  testIndexPage();
  testBepChecklistPage();
  testAnalyticsGating();
  testMainJs();
  console.log('UI/UX regression checks passed.');
}

run();
