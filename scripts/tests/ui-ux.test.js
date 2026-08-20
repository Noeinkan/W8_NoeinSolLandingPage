const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '_site');
// Tests run against the Eleventy output, not the templates. Build first.
if (!fs.existsSync(root)) {
  console.error("No _site/ found. Run \"npx @11ty/eleventy\" (or npm run build) first.");
  process.exit(1);
}

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

function testEirChecklistPage() {
  const html = read('eir-checklist.html');
  assertUniqueIds('eir-checklist.html');
  assert(html.includes('id="eirForm"'), 'eir checklist form missing');
  assert(html.includes('id="eirSections"'), 'eir sections host missing');
  assert(html.includes('id="eirReportGaps"'), 'eir report gaps host missing');
  assert(html.includes('id="eirReportBreakdown"'), 'eir report breakdown host missing');
  assert(!html.includes('calendly.com'), 'eir-checklist still references Calendly');
  assert(!html.includes('formsubmit.co'), 'eir-checklist should not use FormSubmit (value-first, no gate)');
  // EN-only this pass; the IT lang-switcher must point to # until the IT mirror exists
  const langMatch = html.match(/href="([^"]*)"\s+class="lang-switch"/);
  assert(langMatch && langMatch[1] === '#', 'eir-checklist lang-switcher must point to # until IT mirror exists');
  // Self-canonical + hreflang en + x-default, no hreflang=it
  assert(html.includes('rel="canonical" href="https://noeinsolutions.com/eir-checklist.html"'), 'eir-checklist missing self-canonical');
  assert(html.includes('hreflang="en" href="https://noeinsolutions.com/eir-checklist.html"'), 'eir-checklist missing hreflang=en');
  assert(html.includes('hreflang="x-default"'), 'eir-checklist missing x-default');
  assert(!/hreflang="it"\s+href="[^"]*eir-checklist/.test(html), 'eir-checklist should not advertise hreflang=it until IT mirror exists');
  // Two script tags (main + eir)
  assert(html.includes('src="js/main.js"'), 'eir-checklist missing main.js script');
  assert(html.includes('src="js/eir-checklist.js"'), 'eir-checklist missing eir-checklist.js script');
  // Sitemap must include the page
  const sitemap = read('sitemap.xml');
  assert(sitemap.includes('https://noeinsolutions.com/eir-checklist.html'), 'sitemap.xml missing eir-checklist.html');
}

function testAnalyticsGating() {
  [
    'index.html',
    'about.html',
    'capsar.html',
    'bep-checklist.html',
    'eir-checklist.html',
    'builds.html',
    'privacy.html'
  ].forEach((relativePath) => {
    const html = read(relativePath);
    assert(html.includes("clarityId.indexOf('YOUR_') !== 0"), relativePath + ' is missing Clarity gating');
    assert(html.includes("ga4Id.indexOf('YOUR_') !== 0"), relativePath + ' is missing GA4 gating');
    assert(!html.includes('googletagmanager.com/gtag/js?id=YOUR_GA4_MEASUREMENT_ID'), relativePath + ' still has placeholder GA script tag');
  });
}

// Nav and footer are copy-pasted per page, so a new page is only reachable once
// every other page has been updated by hand. This catches the one that got missed.
function testEnNavParity() {
  const pages = [
    'index.html',
    'about.html',
    'capsar.html',
    'bep-checklist.html',
    'eir-checklist.html',
    'builds.html',
    'privacy.html'
  ];
  const entries = [
    '<li><a href="index.html">Home</a></li>',
    '<li><a href="about.html">About</a></li>',
    '<li><a href="capsar.html">Capsar.io</a></li>',
    '<li><a href="bep-checklist.html">BEP Checklist</a></li>',
    '<li><a href="eir-checklist.html">EIR Health Check</a></li>',
    '<li><a href="builds.html">Builds</a></li>'
  ];

  pages.forEach((relativePath) => {
    const html = read(relativePath);
    entries.forEach((entry) => {
      const count = html.split(entry).length - 1;
      assert(count === 2, relativePath + ' should carry ' + entry + ' twice (nav + footer), found ' + count);
    });
  });
}

function testBuildsPage() {
  // Expectations come from the same module the page is generated from, so the
  // lineup and the test can never disagree about how many builds there are.
  const builds = require('../../src/_data/builds.js');
  const html = read('builds.html');
  assertUniqueIds('builds.html');
  assert(html.includes('rel="canonical" href="https://noeinsolutions.com/builds.html"'), 'builds.html missing self-canonical');
  assert(html.includes('href="css/builds.css"'), 'builds.html missing builds.css');

  // Every repo link must open safely in a new tab.
  const externalLinks = html.match(/<a href="https:\/\/github\.com\/[^"]+"[^>]*>/g) || [];
  assert(externalLinks.length >= builds.total, 'builds.html should link every build in src/_data/builds.js (' + builds.total + '), found ' + externalLinks.length);
  externalLinks.forEach((tag) => {
    assert(tag.includes('rel="noopener noreferrer"'), 'builds.html GitHub link missing rel="noopener noreferrer": ' + tag);
  });

  // Builds are grouped by domain and every group gets identical treatment:
  // one <section>, one .build-grid, and cards -- never a demoted list.
  builds.categories.map((c) => c.id).forEach((id) => {
    assert(html.includes('id="' + id + '"'), 'builds.html missing category section #' + id);
    assert(html.includes('href="#' + id + '"'), 'builds.html missing index link to #' + id);
  });
  assert(!html.includes('build-list'), 'builds.html still uses the retired two-tier build-list markup');
  const cards = (html.match(/<article class="build-card">/g) || []).length;
  assert(cards === builds.total, 'builds.html renders ' + cards + ' cards but src/_data/builds.js defines ' + builds.total);
  // The stats are derived too; catch a template that stops reading the data.
  assert(html.includes('data-count="' + builds.total + '"'), 'builds.html stat should show ' + builds.total + ' repositories');
  assert(html.includes('data-count="' + builds.withUi + '"'), 'builds.html stat should show ' + builds.withUi + ' with a working interface');

  // A screenshot slot either points at a file that exists or stays in the
  // deliberate empty state. A broken <img> would also fail deploy preflight.
  const shots = html.match(/src="(assets\/builds\/[^"]+)"/g) || [];
  shots.forEach((m) => {
    const rel = m.slice(5, -1);
    assert(fs.existsSync(path.join(root, rel)), 'builds.html references a missing screenshot: ' + rel);
  });

  const sitemap = read('sitemap.xml');
  assert(sitemap.includes('https://noeinsolutions.com/builds.html'), 'sitemap.xml missing builds.html');
}


function testMainJs() {
  const js = read(path.join('js', 'main.js'));
  assert(js.includes("var scrollBehavior = reducedMotion ? 'auto' : 'smooth';"), 'reduced-motion scroll behavior missing');
}

function run() {
  testCapsarPage();
  testIndexPage();
  testBepChecklistPage();
  testEirChecklistPage();
  testBuildsPage();
  testEnNavParity();
  testAnalyticsGating();
  testMainJs();
  console.log('UI/UX regression checks passed.');
}

run();
