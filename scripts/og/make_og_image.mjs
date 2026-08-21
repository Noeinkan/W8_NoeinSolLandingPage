/**
 * Regenerate assets/og-image.jpg — the 1200x630 social card.
 *
 * One-shot generator, deliberately NOT part of the build: run it by hand and
 * commit the JPEG it writes. Nothing in `npm run check` or deploy.sh calls it.
 *
 *   node scripts/og/make_og_image.mjs
 *
 * Why Playwright and not PIL, like the other asset scripts here: the card is
 * typeset in Archivo and IBM Plex Mono, neither of which is a system font on a
 * normal machine. PIL would silently fall back to Arial and produce a card that
 * looks fine until you hold it next to the site. A headless Chromium pulls the
 * same Google Fonts stylesheet base.njk does and reads the palette straight out
 * of css/styles.base.css, so the card cannot drift away from the design tokens.
 *
 * It lives in its own directory with its own node_modules for the same reason
 * scripts/tests/smoke/ does: playwright is a heavy dependency that only this
 * one hand-run script needs, so it is bootstrapped here instead of landing in
 * the project's package.json. Both directories are gitignored.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(HERE, '..', '..');
const OUT = path.join(repoRoot, 'assets', 'og-image.jpg');
const WIDTH = 1200;
const HEIGHT = 630;

// ─── Self-bootstrap: install playwright on first run ───
if (!fs.existsSync(path.join(HERE, 'node_modules', 'playwright'))) {
  console.log('[og] first run — installing playwright into ' + HERE);
  fs.writeFileSync(path.join(HERE, 'package.json'),
    JSON.stringify({ name: 'noein-og-image', private: true, version: '0.0.0' }, null, 2) + '\n');
  try {
    execSync('npm install --no-audit --no-fund --silent --no-save playwright', { cwd: HERE, stdio: 'inherit' });
  } catch (e) {
    console.error('[og] npm install failed; rerun manually: cd ' + HERE + ' && npm install playwright');
    process.exit(2);
  }
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (e) {
  console.error('[og] playwright still not loadable: ' + e.message);
  process.exit(2);
}

// Absolute file:// URLs: the page renders from a temp directory outside the
// repo, so nothing relative would resolve.
const asUrl = (p) => pathToFileURL(path.join(repoRoot, p)).href;
const tokens = asUrl('css/styles.base.css');
const headshot = asUrl('assets/headshot.jpg');

// Palette, type families and radii all come from the linked stylesheet. Only
// layout lives here — no hex values, the same rule the site follows.
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500..800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<link rel="stylesheet" href="${tokens}">
<style>
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-body);
    display: grid;
    grid-template-columns: 1fr 330px;
    gap: 56px;
    padding: 62px 72px 74px;
    position: relative;
  }

  /* Full-bleed signal rule along the bottom — the card's one graphic device. */
  body::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 10px;
    background: var(--accent);
  }

  .copy { display: flex; flex-direction: column; justify-content: space-between; }

  .wordmark {
    font-family: var(--font-mono);
    font-size: 21px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .wordmark::after {
    content: '';
    display: block;
    width: 190px;
    height: 1px;
    background: var(--rule-strong);
    margin-top: 20px;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 72px;
    font-weight: 800;
    line-height: 1.04;
    letter-spacing: -0.025em;
    margin: 0;
  }
  h1 em { font-style: italic; color: var(--accent-text); }
  /* Line breaks are explicit, not left to the wrap: at 72px the column fits
     roughly sixteen characters, and an edited headline that re-wraps on its own
     produces an orphan nobody sees until the card is already on LinkedIn. */

  .meta {
    font-family: var(--font-mono);
    font-size: 19px;
    letter-spacing: 0.05em;
    color: var(--ink-tertiary);
  }
  .meta strong { color: var(--ink); font-weight: 500; }

  /* 680x1018 source into a 330x420 slot — a downscale, never an upscale.
     Framed from near the top so the crop keeps the face, not the jacket. */
  .portrait {
    align-self: center;
    width: 330px;
    height: 420px;
    border: 1px solid var(--rule);
    border-radius: var(--r-sm);
    object-fit: cover;
    object-position: 50% 12%;
  }
</style>
</head>
<body>
  <div class="copy">
    <div class="wordmark">Noein Solutions</div>
    <h1>Ten years<br>fixing delivery.<br><em>Now I build<br>the software.</em></h1>
    <div class="meta"><strong>Andrea Aita</strong> &nbsp;&middot;&nbsp; ISO 19650 &nbsp;&middot;&nbsp; BIM &nbsp;&middot;&nbsp; Capsar</div>
  </div>
  <img class="portrait" src="${headshot}" alt="">
</body>
</html>`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-card-'));
const tmpHtml = path.join(tmpDir, 'card.html');
fs.writeFileSync(tmpHtml, html, 'utf8');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // A shot taken before the webfonts land renders in Helvetica and looks almost
  // right, which is the worst kind of wrong. Prove Archivo actually arrived.
  const branded = await page.evaluate(() =>
    document.fonts.check('800 72px Archivo') && document.fonts.check('500 21px "IBM Plex Mono"'));
  if (!branded) {
    throw new Error('Archivo / IBM Plex Mono did not load — check the network. Refusing to write a fallback-font card.');
  }

  await page.screenshot({ path: OUT, type: 'jpeg', quality: 88 });
} finally {
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// Read the dimensions back out of the file just written rather than trusting
// the viewport — this is the number ui-ux.test.js checks base.njk against.
const buf = fs.readFileSync(OUT);
let i = 2;
let dims = null;
while (i < buf.length - 9 && !dims) {
  if (buf[i] !== 0xff) { i += 1; continue; }
  const marker = buf[i + 1];
  const isSof = marker >= 0xc0 && marker <= 0xcf
    && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
  if (isSof) dims = { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
  else i += 2 + buf.readUInt16BE(i + 2);
}
console.log(`og-image.jpg written: ${dims.w}x${dims.h}  ${Math.round(buf.length / 1024)} KB`);
if (dims.w !== WIDTH || dims.h !== HEIGHT) {
  throw new Error(`expected ${WIDTH}x${HEIGHT}`);
}
