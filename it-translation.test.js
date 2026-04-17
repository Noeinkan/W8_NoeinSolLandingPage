#!/usr/bin/env node
// Bilingual parity + IT completeness checks.
// Pairs every EN *.html with its it/ counterpart and flags:
//   - missing files, wrong <html lang>, wrong canonical, missing hreflang
//   - JS-referenced IDs that would break main.js if renamed
//   - find/replace scars ("con"/"per un"/"per il" + EN word)
//   - untranslated EN phrases that never make sense in IT visible text
//   - common Italian words with missing accents
//   - per-page section/details/blockquote count drift vs. EN
// Run: node it-translation.test.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'case-studies.html',
  'capsar.html',
  'contact.html',
  'privacy.html',
  'bep-checklist.html',
];

const failures = [];
const fail = (msg) => failures.push(msg);

const read = (p) => {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
};

const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ');

const countTag = (html, tag) => (html.match(new RegExp('<' + tag + '[\\s>]', 'g')) || []).length;

// ---- 1. File-pair parity ----
PAGES.forEach((p) => {
  const en = read(path.join(ROOT, p));
  if (en === null) return;
  const it = read(path.join(ROOT, 'it', p));
  if (it === null) fail(`[parity] missing it/${p}`);
});

// ---- 2. lang attr + self-canonical ----
PAGES.forEach((p) => {
  const it = read(path.join(ROOT, 'it', p));
  if (!it) return;
  if (!/<html[^>]*\blang="it"/.test(it)) {
    fail(`[lang] it/${p}: expected <html lang="it">`);
  }
  const canonRe = new RegExp('<link[^>]*rel="canonical"[^>]*href="https://noeinsolutions\\.com/it/' + p.replace(/\./g, '\\.') + '"');
  if (!canonRe.test(it)) {
    fail(`[canonical] it/${p}: missing or wrong self-canonical`);
  }
});

// ---- 3. Reciprocal hreflang ----
PAGES.forEach((p) => {
  const en = read(path.join(ROOT, p));
  const it = read(path.join(ROOT, 'it', p));
  if (!en || !it) return;
  if (!/hreflang="it"/.test(en)) fail(`[hreflang] ${p}: missing hreflang=it`);
  if (!/hreflang="en"/.test(it)) fail(`[hreflang] it/${p}: missing hreflang=en`);
});

// ---- 4. JS-referenced IDs preserved ----
const JS_IDS = ['exitOverlayClose', 'exitOverlayDismiss', 'stickyCtaClose', 'leadMagnetSuccess', 'heroCanvas'];
const itIndex = read(path.join(ROOT, 'it/index.html'));
if (itIndex) {
  JS_IDS.forEach((id) => {
    if (!new RegExp('id="' + id + '"').test(itIndex)) {
      fail(`[js-ids] it/index.html: missing id="${id}" (js/main.js depends on it)`);
    }
  });
}

// ---- 5. Find/replace scars from the prior bad pass ----
const SCARS = [
  { re: / con (with|your|the|a|an|one|our|my|their|clear|regular|dozens|for)\b/gi, label: '"con" before EN word' },
  { re: / per un (quote|fully|year|month|day|programme|full|compliant)\b/gi, label: '"per un" before EN word' },
  { re: / per il (duration|tuo programme|month|year|day)\b/gi, label: '"per il" before EN word' },
  { re: / per la (duration)\b/gi, label: '"per la" before EN word' },
  { re: /YOUR_CALENDLY_USERNAME con /g, label: 'stray "con" replacing "with" inside code comment' },
];

PAGES.forEach((p) => {
  const it = read(path.join(ROOT, 'it', p));
  if (!it) return;
  SCARS.forEach(({ re, label }) => {
    const seen = new Set();
    let m;
    while ((m = re.exec(it)) !== null) {
      const snippet = m[0].trim();
      if (!seen.has(snippet)) {
        seen.add(snippet);
        fail(`[scar] it/${p}: ${label} — "${snippet}"`);
      }
    }
  });
});

// ---- 6. Residual EN phrases in visible text ----
const FORBIDDEN = [
  'Experience across', 'Delivery credibility', 'Delivery expertise', 'Programme background',
  'Years in AEC', 'Programme value managed', 'Professionals trained',
  'Reduction in delivery errors',
  'Frequently asked questions', 'Common questions',
  "Who's Behind This", 'Full background',
  'Learn more', 'Free Checklist', 'Free Interactive Tool',
  'Not sure which service fits', 'How It Works', 'How I Work',
  'Send a message', 'Book a free', 'View case studies',
  'What Clients Say', 'Ready to get your digital delivery right',
  'Do you work with', 'How quickly can you',
  "What's the difference", 'How does an engagement',
  'Strategy to execution', 'Technology-enabled', 'Programme-proven',
  'Your CDE adopted', 'Submission-ready in days',
];

PAGES.forEach((p) => {
  const it = read(path.join(ROOT, 'it', p));
  if (!it) return;
  const text = stripTags(it);
  FORBIDDEN.forEach((phrase) => {
    if (text.includes(phrase)) fail(`[english] it/${p}: untranslated phrase "${phrase}"`);
  });
});

// ---- 7. Accent sweep ----
const ACCENT_ERRORS = [
  [/\bPerche\b/g, 'Perché'],
  [/\bperche\b/g, 'perché'],
  [/\bpiu\b/g, 'più'],
  [/\bresponsabilita\b/g, 'responsabilità'],
  [/\bcitta\b/g, 'città'],
  [/\bpuo\b/g, 'può'],
  [/\bgia\b/g, 'già'],
  [/\bcosi\b/g, 'così'],
  [/\bfinche\b/g, 'finché'],
  [/\bconformita\b/g, 'conformità'],
  [/\bcomplessita\b/g, 'complessità'],
  [/\bcapacita\b/g, 'capacità'],
];

PAGES.forEach((p) => {
  const it = read(path.join(ROOT, 'it', p));
  if (!it) return;
  const text = stripTags(it);
  ACCENT_ERRORS.forEach(([re, good]) => {
    if (re.test(text)) fail(`[accent] it/${p}: use "${good}" (missing accent)`);
  });
});

// ---- 8. Loose structural parity ----
PAGES.forEach((p) => {
  const en = read(path.join(ROOT, p));
  const it = read(path.join(ROOT, 'it', p));
  if (!en || !it) return;
  ['section', 'details', 'blockquote'].forEach((t) => {
    const enN = countTag(en, t);
    const itN = countTag(it, t);
    if (enN !== itN) fail(`[structure] it/${p}: <${t}> count ${itN} vs EN ${enN}`);
  });
});

// ---- Report ----
if (failures.length === 0) {
  console.log('IT translation checks passed.');
  process.exit(0);
}

console.error(`IT translation checks FAILED (${failures.length} issues):\n`);
const byFile = new Map();
failures.forEach((f) => {
  const key = (f.match(/it\/([^:\]]+)/) || [, 'other'])[1];
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(f);
});
[...byFile.entries()].sort().forEach(([file, msgs]) => {
  console.error(`  ${file}  (${msgs.length})`);
  msgs.forEach((m) => console.error('    - ' + m));
  console.error('');
});
process.exit(1);
