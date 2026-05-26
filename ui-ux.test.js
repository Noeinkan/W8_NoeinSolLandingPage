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

function testContactPage() {
  const html = read('contact.html');
  assertUniqueIds('contact.html');
  assert(html.includes('role="tablist" aria-label="Contact options"'), 'contact tablist missing');
  assert(html.includes('id="message-panel" class="contact-tab"'), 'message panel id missing');
  assert(html.includes('id="messageField" name="message"'), 'message field id missing');
  assert(!html.includes('id="message"'), 'legacy duplicate message id still present');
  assert(html.includes('id="formErrorSummary"'), 'form error summary missing');
  assert(html.includes('role="tabpanel" aria-labelledby="tab-booking"'), 'booking panel semantics missing');
  assert(html.includes('role="tabpanel" aria-labelledby="tab-message"'), 'message panel semantics missing');
}

function testCaseStudiesPage() {
  const html = read('case-studies.html');
  assertUniqueIds('case-studies.html');
  const controls = [...html.matchAll(/aria-controls="(case-study-\d+)"/g)].map((match) => match[1]);
  assert(controls.length === 4, 'expected four case study accordion controls');
  controls.forEach((id) => {
    assert(html.includes('id="' + id + '"'), 'missing accordion body for ' + id);
  });
  assert((html.match(/aria-expanded="false"/g) || []).length >= 4, 'accordion aria-expanded defaults missing');
}

function testServicesPage() {
  const html = read('services.html');
  assert(html.includes('class="service-jump-nav"'), 'service jump nav missing');
  ['#information-management', '#bep-eir', '#programme-delivery'].forEach((href) => {
    assert(html.includes('href="' + href + '" class="service-jump-link"'), 'jump nav link missing for ' + href);
  });
}

function testCapsarPage() {
  const html = read('capsar.html');
  assert(html.includes('href="#platform-preview" class="btn btn-outline"'), 'Capsar preview jump CTA missing');
  assert(/<section class="fade-in" id="platform-preview">[\s\S]*?<div class="section-label">Platform Preview<\/div>/.test(html), 'platform preview anchor is not attached to the preview section');
  assert(html.includes('class="capsar-proof-card"'), 'Capsar proof card missing');
}

function testIndexPage() {
  const html = read('index.html');
  assert(html.includes('class="trust-band fade-in"'), 'trust band missing');
  assert(html.includes('mailto:andrea.aita@noeinsolutions.com'), 'index direct email CTA missing');
}

function testAnalyticsGating() {
  [
    'index.html',
    'about.html',
    'services.html',
    'case-studies.html',
    'capsar.html',
    'contact.html',
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
  assert(js.includes("switchTab('message-panel');"), 'contact success state does not reuse tab switcher');
  assert(js.includes("!sessionStorage.getItem('exit_shown') && !reducedMotion && window.innerWidth > 1024"), 'exit intent gating is missing');
  assert(js.includes("var tabLinks = document.querySelectorAll('.contact-option-link[data-tab]');"), 'contact tab keyboard target selector missing');
}

function run() {
  testContactPage();
  testCaseStudiesPage();
  testServicesPage();
  testCapsarPage();
  testIndexPage();
  testAnalyticsGating();
  testMainJs();
  console.log('UI/UX regression checks passed.');
}

run();
