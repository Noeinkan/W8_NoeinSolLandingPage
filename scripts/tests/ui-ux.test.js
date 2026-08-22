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
  // The jump CTA needs a target that is still the preview block. Which tag carries
  // the id is not the point — that the anchor and the Platform Preview heading sit
  // on the same element is.
  assert(html.includes('href="#platform-preview" class="btn btn-outline"'), 'Capsar preview jump CTA missing');
  assert(/<div class="band band--dark fade-in" id="platform-preview">[\s\S]*?<div class="section-label">Platform Preview<\/div>/.test(html), 'platform preview anchor is not attached to the preview band');
  assert(html.includes('class="capsar-proof-card"'), 'Capsar proof card missing');
}

function testIndexPage() {
  const html = read('index.html');
  assertUniqueIds('index.html');
  assert(html.includes('class="trust-band fade-in"'), 'trust band missing');
  assert(html.includes('href="capsar.html"'), 'index Capsar CTA missing');
  assert(html.includes('href="bep-checklist.html"'), 'index checklist CTA missing');
  assert(html.includes('href="services.html"'), 'index must link to the services page');
}

function testBepChecklistPage() {
  const html = read('bep-checklist.html');
  assertUniqueIds('bep-checklist.html');
  assert(html.includes('id="bepForm"'), 'bep checklist form missing');
  assert(html.includes('id="bepSections"'), 'bep sections host missing');
}

function testEirChecklistPage() {
  // Both languages render the same hosts. The IDs are what js/eir-checklist.js
  // writes into, so a translated id is a page that scores nothing and says
  // nothing about why -- which is why they are asserted per language, not once.
  const sitemap = read('sitemap.xml');
  [
    { page: 'eir-checklist.html', prefix: '', url: 'https://noeinsolutions.com/eir-checklist.html' },
    { page: 'it/eir-checklist.html', prefix: '../', url: 'https://noeinsolutions.com/it/eir-checklist.html' },
  ].forEach(({ page, prefix, url }) => {
    const html = read(page);
    assertUniqueIds(page);
    assert(html.includes('id="eirForm"'), page + ': eir checklist form missing');
    assert(html.includes('id="eirSections"'), page + ': eir sections host missing');
    assert(html.includes('id="eirReportGaps"'), page + ': eir report gaps host missing');
    assert(html.includes('id="eirReportBreakdown"'), page + ': eir report breakdown host missing');
    assert(!html.includes('formsubmit.co'), page + ' should not use FormSubmit (value-first, no gate)');
    // Self-canonical + a reciprocal hreflang pair + x-default
    assert(html.includes('rel="canonical" href="' + url + '"'), page + ' missing self-canonical');
    assert(html.includes('hreflang="en" href="https://noeinsolutions.com/eir-checklist.html"'), page + ' missing hreflang=en');
    assert(html.includes('hreflang="it" href="https://noeinsolutions.com/it/eir-checklist.html"'), page + ' missing hreflang=it');
    assert(html.includes('hreflang="x-default"'), page + ' missing x-default');
    // The language toggle must reach the mirror, not the dead link it carried
    // while the page was EN-only.
    const langMatch = html.match(/href="([^"]*)"\s+class="lang-switch"/);
    assert(langMatch && langMatch[1] !== '#', page + ' lang-switcher still points at # -- the IT mirror exists');
    // Two script tags (main + eir)
    assert(html.includes('src="' + prefix + 'js/main.js"'), page + ' missing main.js script');
    assert(html.includes('src="' + prefix + 'js/eir-checklist.js"'), page + ' missing eir-checklist.js script');
    assert(sitemap.includes(url), 'sitemap.xml missing ' + page);
  });
}

function testAnalyticsGating() {
  [
    'index.html',
    'services.html',
    'contact.html',
    'about.html',
    'capsar.html',
    'bep-checklist.html',
    'eir-checklist.html',
    'builds.html',
    'privacy.html',
    'it/builds.html',
    'it/eir-checklist.html'
  ].forEach((relativePath) => {
    const html = read(relativePath);
    assert(html.includes("clarityId.indexOf('YOUR_') !== 0"), relativePath + ' is missing Clarity gating');
    assert(html.includes("ga4Id.indexOf('YOUR_') !== 0"), relativePath + ' is missing GA4 gating');
    assert(!html.includes('googletagmanager.com/gtag/js?id=YOUR_GA4_MEASUREMENT_ID'), relativePath + ' still has placeholder GA script tag');
  });
}

// Nav and footer both render from src/_data/nav.js, so the expectation is read
// from that same module — a menu entry added there must reach every page of
// that language, in both the header and the footer list.
function testNavParity() {
  const nav = require('../../src/_data/nav.js');
  const pages = {
    en: ['index.html', 'services.html', 'contact.html', 'about.html', 'capsar.html',
         'bep-checklist.html', 'eir-checklist.html', 'builds.html', 'privacy.html'],
    it: ['it/index.html', 'it/services.html', 'it/contact.html', 'it/about.html',
         'it/capsar.html', 'it/bep-checklist.html', 'it/eir-checklist.html',
         'it/builds.html', 'it/privacy.html'],
  };

  Object.keys(pages).forEach((lang) => {
    const entries = nav[lang].map((item) => '<li><a href="' + item.href + '">' + item.label + '</a></li>');
    pages[lang].forEach((relativePath) => {
      const html = read(relativePath);
      entries.forEach((entry) => {
        const count = html.split(entry).length - 1;
        assert(count === 2, relativePath + ' should carry ' + entry + ' twice (nav + footer), found ' + count);
      });
    });
  });
}

// Practitioner mode stripped every booking route and nothing caught it for two
// months. A page that offers a CTA must load the widget that powers it, and a
// page that offers none must not pull a third-party script for nothing.
function testBookingRoutes() {
  const withBooking = [
    'index.html', 'services.html', 'contact.html', 'about.html', 'capsar.html',
    'bep-checklist.html', 'eir-checklist.html', 'builds.html',
    'it/index.html', 'it/services.html', 'it/contact.html', 'it/about.html',
    'it/capsar.html', 'it/bep-checklist.html', 'it/eir-checklist.html',
    'it/builds.html',
  ];
  const withoutBooking = ['privacy.html', 'it/privacy.html'];

  withBooking.forEach((relativePath) => {
    const html = read(relativePath);
    assert(html.includes('calendly.com/andrea-aita91/30min'), relativePath + ' has no booking link');
    assert(html.includes('assets.calendly.com/assets/external/widget.js'),
      relativePath + ' offers a booking CTA but never loads the Calendly widget — set "calendly": true in its front matter');
    // The CTA must stay a real href so it still works when the script is blocked.
    assert(/<a href="https:\/\/calendly\.com\/[^"]+"/.test(html),
      relativePath + ' booking CTA must be an <a href>, so it degrades to a plain navigation');
  });

  withoutBooking.forEach((relativePath) => {
    const html = read(relativePath);
    assert(!html.includes('assets.calendly.com'),
      relativePath + ' loads the Calendly script but offers no booking widget');
  });

  // Email must be reachable everywhere, independent of any third-party script.
  ['index.html', 'services.html', 'contact.html', 'it/index.html', 'it/services.html', 'it/contact.html']
    .forEach((relativePath) => {
      const html = read(relativePath);
      assert(html.includes('mailto:andrea.aita@noeinsolutions.com'), relativePath + ' has no direct email route');
    });
}

function testBuildsPage() {
  // Expectations come from the same module the page is generated from, so the
  // lineup and the test can never disagree about how many builds there are.
  // Both languages are checked against that one module: the IT mirror is a
  // translation of the strings, never a second copy of the lineup, so a build
  // added in src/_data/builds.js has to appear on both pages or fail here.
  const builds = require('../../src/_data/builds.js');
  const sitemap = read('sitemap.xml');
  [
    { page: 'builds.html', prefix: '', url: 'https://noeinsolutions.com/builds.html' },
    { page: 'it/builds.html', prefix: '../', url: 'https://noeinsolutions.com/it/builds.html' },
  ].forEach(({ page, prefix, url }) => {
    const html = read(page);
    assertUniqueIds(page);
    assert(html.includes('rel="canonical" href="' + url + '"'), page + ' missing self-canonical');
    assert(html.includes('href="' + prefix + 'css/builds.css"'), page + ' missing builds.css');

    // Every repo link must open safely in a new tab.
    const externalLinks = html.match(/<a href="https:\/\/github\.com\/[^"]+"[^>]*>/g) || [];
    assert(externalLinks.length >= builds.total, page + ' should link every build in src/_data/builds.js (' + builds.total + '), found ' + externalLinks.length);
    externalLinks.forEach((tag) => {
      assert(tag.includes('rel="noopener noreferrer"'), page + ' GitHub link missing rel="noopener noreferrer": ' + tag);
    });

    // Builds are grouped by domain and every group gets identical treatment:
    // one <section>, one .build-grid, and cards -- never a demoted list.
    // The ids stay English in both languages; CSS and the jump index use them.
    builds.categories.map((c) => c.id).forEach((id) => {
      assert(html.includes('id="' + id + '"'), page + ' missing category section #' + id);
      assert(html.includes('href="#' + id + '"'), page + ' missing index link to #' + id);
    });
    assert(!html.includes('build-list'), page + ' still uses the retired two-tier build-list markup');
    const cards = (html.match(/<article class="build-card">/g) || []).length;
    assert(cards === builds.total, page + ' renders ' + cards + ' cards but src/_data/builds.js defines ' + builds.total);
    // The stats are derived too; catch a template that stops reading the data.
    assert(html.includes('data-count="' + builds.total + '"'), page + ' stat should show ' + builds.total + ' repositories');
    assert(html.includes('data-count="' + builds.withUi + '"'), page + ' stat should show ' + builds.withUi + ' with a working interface');

    // A screenshot slot either points at a file that exists or stays in the
    // deliberate empty state. A broken <img> would also fail deploy preflight.
    const shots = html.match(/src="(?:\.\.\/)?assets\/builds\/[^"]+"/g) || [];
    shots.forEach((m) => {
      const rel = m.slice(5, -1).replace(/^\.\.\//, '');
      assert(fs.existsSync(path.join(root, rel)), page + ' references a missing screenshot: ' + rel);
    });

    assert(sitemap.includes(url), 'sitemap.xml missing ' + page);
  });

  // Every card carries translated prose in the IT mirror. The alt text is the
  // half a mirror pass forgets: it is invisible unless the image fails, so an
  // English alt can sit on the Italian page for a year without being seen.
  const it = read('it/builds.html');
  builds.lang.it.categories.forEach((c) => {
    assert(it.includes('>' + c.label + '<'), 'it/builds.html missing translated category label "' + c.label + '"');
    c.builds.forEach((b) => {
      assert(it.includes(b.kicker), 'it/builds.html missing translated kicker "' + b.kicker + '"');
      (b.shots || []).forEach((shot) => {
        assert(it.includes('alt="' + shot.alt + '"'), 'it/builds.html missing translated alt for ' + shot.file);
      });
    });
  });
}

// The one gap the source-hygiene checks leave: drop the "css" key and leave the
// file, and the page renders unstyled while every check stays green — the rules
// still exist in css/, so the classes are not orphans. Only the built page can
// say whether it actually loads its stylesheet.
function testPrivacyPage() {
  [['privacy.html', 'css/privacy.css'], ['it/privacy.html', '../css/privacy.css']].forEach(([page, href]) => {
    assertUniqueIds(page);
    assert(read(page).includes('href="' + href + '"'), page + ' missing ' + href);
  });
}


// ═══ Source hygiene ═════════════════════════════════════════════════════
// These read src/ and css/ rather than the build output. Each one describes a
// rule the codebase had already broken silently: styling written inline instead
// of in the stylesheet, a class whose rule had been deleted from under it, a
// page asset that no longer existed, a menu entry pointing nowhere.

const srcRoot = path.resolve(__dirname, '..', '..', 'src');
const cssRoot = path.resolve(__dirname, '..', '..', 'css');
// Note the naming: `root` above is _site/. This one is the repository itself,
// which the markdown and asset checks below need.
const repoRoot = path.resolve(__dirname, '..', '..');

function templateFiles() {
  return ['en', 'it'].flatMap((lang) =>
    fs.readdirSync(path.join(srcRoot, lang))
      .filter((f) => f.endsWith('.njk'))
      .map((f) => path.join(lang, f))
  );
}

// The shared chrome: layout, partials and macros. A change here reaches all
// sixteen pages at once, so it is held to the same rules as a page template.
function includeFiles() {
  return ['_includes', '_includes/partials', '_includes/macros'].flatMap((dir) => {
    const abs = path.join(srcRoot, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs)
      .filter((f) => f.endsWith('.njk'))
      .map((f) => path.join(dir, f));
  });
}

function frontMatter(relativePath) {
  const raw = fs.readFileSync(path.join(srcRoot, relativePath), 'utf8');
  const match = raw.match(/^---json\n([\s\S]*?)\n---\n/);
  assert(match, relativePath + ' has no ---json front matter');
  return JSON.parse(match[1]);
}

// Styling belongs in a stylesheet, where it can be found, reviewed and reused.
// The site carried 41 inline style attributes: three re-implemented a modifier
// class that already existed, four used --accent for text (3.7:1, fails AA)
// where --accent-text exists for exactly that, and eight were the only thing
// holding up a block whose CSS rule had been deleted.
function testNoInlineStyles() {
  const offenders = [];
  templateFiles().forEach((relativePath) => {
    fs.readFileSync(path.join(srcRoot, relativePath), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('style="')) offenders.push(relativePath + ':' + (i + 1));
      });
  });
  assert(offenders.length === 0,
    'inline style attributes belong in css/ as a class:\n  ' + offenders.join('\n  '));
}

// The same failure as the check above, one level up. privacy.njk carried a
// 65-line stylesheet as a JSON string in an `inlineStyle` front-matter field,
// duplicated byte-for-byte between EN and IT, which base.njk poured into a
// <style> in the head. It ran entirely on pre-redesign aliases and no guardrail
// could see it: the class check and the token check read css/, and the inline
// check above matches `style="`, which a JSON key never contains. The layout
// and the partials are scanned too, so the deleted <style> branch cannot come
// back into base.njk unnoticed.
function testNoStylesheetsInMarkup() {
  const offenders = [];
  templateFiles().forEach((relativePath) => {
    if (frontMatter(relativePath).inlineStyle) {
      offenders.push(relativePath + ' — front matter declares inlineStyle');
    }
  });
  includeFiles().concat(templateFiles()).forEach((relativePath) => {
    fs.readFileSync(path.join(srcRoot, relativePath), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('<style')) offenders.push(relativePath + ':' + (i + 1) + ' — <style> block');
      });
  });
  assert(offenders.length === 0,
    'a stylesheet belongs in css/, linked by the "css" front-matter key:\n  ' + offenders.join('\n  '));
}

// A class in the markup with no rule anywhere is either dead weight or a
// stylesheet that lost its definition. .section-full was the second kind — its
// rule went with the redesign and the eight call sites survived only because
// each carried an inline padding. Shrink this list; never grow it.
const UNSTYLED_CLASSES = [
  // Structural wrappers with no styling of their own.
  'about-preview-content', 'bep-report-sections', 'lead-magnet-content',
  'lead-magnet-form', 'product-band-copy',
];

function testEveryClassHasARule() {
  const css = fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(cssRoot, f), 'utf8'))
    .join('\n')
    // Comments name classes in prose. Left in, a comment explaining why a rule
    // was deleted would itself keep this check quiet about the deletion.
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
  const js = fs.readdirSync(path.join(root, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => read(path.join('js', f)))
    .join('\n');

  const defined = new Set((css.match(/\.[A-Za-z][A-Za-z0-9_-]*/g) || []).map((s) => s.slice(1)));
  const used = new Set();
  ['', 'it'].forEach((dir) => {
    fs.readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith('.html'))
      .forEach((f) => {
        (read(path.join(dir, f)).match(/class="([^"]*)"/g) || []).forEach((m) => {
          m.slice(7, -1).split(/\s+/).forEach((c) => { if (c) used.add(c); });
        });
      });
  });

  // A class the JS attaches behaviour to is not orphaned.
  const inJs = (c) => js.includes("'" + c + "'") || js.includes('"' + c + '"');
  const orphans = [...used].filter((c) => !defined.has(c) && !inJs(c)).sort();

  const unexpected = orphans.filter((c) => !UNSTYLED_CLASSES.includes(c));
  assert(unexpected.length === 0,
    'these classes appear in the markup with no CSS rule behind them: ' + unexpected.join(', '));

  const resolved = UNSTYLED_CLASSES.filter((c) => !orphans.includes(c));
  assert(resolved.length === 0,
    'UNSTYLED_CLASSES is stale — these have rules now and should come off the list: ' + resolved.join(', '));
}

// The same question one step closer to the browser. testEveryClassHasARule
// concatenates every file in css/, so a class only needs a rule *somewhere* to
// satisfy it — but a page loads css/styles.css plus whatever its `css` front
// matter names, and nothing else. .page-hero-note was declared identically in
// bep-checklist.css and eir-checklist.css while builds.njk used it and loaded
// neither, so the Builds hero note rendered as unstyled body copy for the life
// of the page with the suite green. This resolves each page's classes against
// only the stylesheets that page actually links, read out of the built HTML so
// it is checking what ships rather than what the front matter intended.

// A page carrying a class whose only rule lives in a stylesheet it does not
// load. Every entry is a real defect; the milestone that owns the fix is named
// beside it. Shrink this list; never grow it.
const PAGE_SCOPED_EXCEPTIONS = [
  // Empty. The four entries this list opened with were the homepage lead-magnet
  // form's .form-group and .form-note, whose only rules in the repo were
  // descendant selectors inside the two checklist stylesheets that index does
  // not link. M2.4 promoted both to styles.ui.css, so they resolve everywhere
  // and M6 no longer has to carry the fix.
];

// styles.css is an @import manifest, not a stylesheet — follow it one level.
function withImports(file) {
  const abs = path.join(cssRoot, file);
  if (!fs.existsSync(abs)) return [file];
  const imports = (fs.readFileSync(abs, 'utf8').match(/@import\s+url\(\s*["']?\.\/([^"')]+)/g) || [])
    .map((s) => s.slice(s.indexOf('./') + 2));
  return [file].concat(imports);
}

function classesDefinedIn(files) {
  const defined = new Set();
  files.forEach((file) => {
    const abs = path.join(cssRoot, file);
    if (!fs.existsSync(abs)) return;
    // Comments name classes in prose — same reason as the check above.
    const css = fs.readFileSync(abs, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
    (css.match(/\.[A-Za-z][A-Za-z0-9_-]*/g) || []).forEach((s) => defined.add(s.slice(1)));
  });
  return defined;
}

function testPageScopedClassesResolve() {
  const js = fs.readdirSync(path.join(root, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => read(path.join('js', f)))
    .join('\n');
  const inJs = (c) => js.includes("'" + c + "'") || js.includes('"' + c + '"');

  const offenders = [];
  ['', 'it'].forEach((dir) => {
    fs.readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith('.html'))
      .forEach((f) => {
        const page = dir ? dir + '/' + f : f;
        const html = read(path.join(dir, f));
        const linked = (html.match(/<link[^>]+rel="stylesheet"[^>]*>/g) || [])
          .map((tag) => (tag.match(/href="([^"]+)"/) || [])[1])
          .filter((href) => href && !/^https?:/.test(href))
          .map((href) => href.replace(/^(\.\.\/)?css\//, ''));
        assert(linked.length > 0, page + ' links no local stylesheet');

        const defined = classesDefinedIn([...new Set(linked.flatMap(withImports))]);
        (html.match(/class="([^"]*)"/g) || []).forEach((m) => {
          m.slice(7, -1).split(/\s+/).forEach((c) => {
            if (!c || defined.has(c) || inJs(c) || UNSTYLED_CLASSES.includes(c)) return;
            offenders.push(page + ' -> .' + c);
          });
        });
      });
  });

  const found = [...new Set(offenders)].sort();
  const unexpected = found.filter((entry) => !PAGE_SCOPED_EXCEPTIONS.includes(entry));
  assert(unexpected.length === 0,
    'these classes are used on a page that does not load the stylesheet defining them:\n  ' +
    unexpected.join('\n  '));

  const resolved = PAGE_SCOPED_EXCEPTIONS.filter((entry) => !found.includes(entry));
  assert(resolved.length === 0,
    'PAGE_SCOPED_EXCEPTIONS is stale — these resolve now and should come off the list:\n  ' +
    resolved.join('\n  '));
}

// A page names its extra stylesheets and scripts in front matter and base.njk
// renders whatever it is handed, so a typo or a renamed file is a silent 404.
function testPageAssetsResolve() {
  templateFiles().forEach((relativePath) => {
    const data = frontMatter(relativePath);
    (data.css || []).forEach((file) => {
      assert(fs.existsSync(path.join(root, 'css', file)),
        relativePath + ' declares css/' + file + ', which does not exist');
    });
    (data.js || []).forEach((file) => {
      assert(fs.existsSync(path.join(root, 'js', file)),
        relativePath + ' declares js/' + file + ', which does not exist');
    });
  });
}

// testNavParity proves the menu renders on every page. This proves it goes
// somewhere: a renamed slug otherwise leaves a dead entry in the header and
// footer of all sixteen pages at once.
function testNavTargetsResolve() {
  const nav = require('../../src/_data/nav.js');
  Object.keys(nav).forEach((lang) => {
    nav[lang].forEach((item) => {
      const target = lang === 'it' ? path.join('it', item.href) : item.href;
      assert(fs.existsSync(path.join(root, target)),
        'nav.js[' + lang + '] points at ' + item.href + ', which is not a built page');
    });
  });
}

// Colour belongs in the token block at the top of styles.base.css. These are the
// literals that predate it — mostly the checklist result bands, which want their
// own semantic ramp. The budget stops new ones arriving; it only goes down.
const HEX_BUDGET = {
  'styles.ui.css': 1,
};

// --ink-tertiary shipped at 4.00:1 on --paper and 3.69:1 on --paper-sunk, under
// the 4.5:1 AA floor on every ground it is used on. One token, and it put the
// footer headings and copyright on all 16 pages, .page-hero-note, .form-note,
// the language switcher and every checklist metadata register below AA at once.
// Nothing could see it: the colour budgets count literals, they do not read
// them. This pairs each ink token with each paper ground and does the sum.
//
// It is deliberately narrow — it checks the tokens against the grounds they are
// designed for, not every pairing a component might actually make. A rule that
// puts --ink-tertiary on --band is still out of its reach, which is why the
// M2.4 pass also swept the built pages in a real browser.
const AA_INKS = ['--ink', '--ink-secondary', '--ink-tertiary'];
const AA_GROUNDS = ['--paper', '--paper-sunk', '--paper-raised'];

function srgbLuminance(hex) {
  const h = hex.length === 4
    ? hex.slice(1).split('').map((c) => c + c).join('')
    : hex.slice(1);
  const chan = [0, 2, 4].map((i) => {
    const v = parseInt(h.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}

function contrastRatio(a, b) {
  const l1 = srgbLuminance(a);
  const l2 = srgbLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function testInkOnPaperClearsAA() {
  const base = fs.readFileSync(path.join(cssRoot, 'styles.base.css'), 'utf8');
  // Read the declaration line by line rather than with a built regex — the token
  // names are hyphen-prefixed and one is a prefix of the next (--ink,
  // --ink-secondary), so the match has to be anchored on the colon.
  const value = (name) => {
    const line = base.split('\n')
      .map((l) => l.trim())
      .find((l) => l.startsWith(name + ':'));
    assert(line, name + ' is not declared in styles.base.css');
    const m = line.match(/(#[0-9a-fA-F]{3,6})\b/);
    assert(m, name + ' is not declared as a hex literal in styles.base.css');
    return m[1];
  };

  AA_INKS.forEach((ink) => {
    AA_GROUNDS.forEach((ground) => {
      const ratio = contrastRatio(value(ink), value(ground));
      assert(ratio >= 4.5,
        'var(' + ink + ') on var(' + ground + ') is ' + ratio.toFixed(2) + ':1, under ' +
        'the 4.5:1 AA floor for normal text — darken the ink token rather than moving ' +
        'its call sites onto the next one up, which collapses the three-step scale');
    });
  });
}

// A CSS block that never closes, or one stray `}`, is not a parse *error* — the
// browser silently discards rules until it resynchronises and everything else
// on the page keeps working. M2.4 left exactly one extra `}` behind a deleted
// block; it swallowed the whole .bep-report-header rule, and the file still
// looked fine, the suite still passed, and the only symptom was a missing
// hairline under the report title. Counting braces is not enough on its own —
// a missing open and a stray close cancel out — so this also walks the file and
// fails on any `}` that arrives at depth 0, which is what actually happened.
function testStylesheetsParse() {
  fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css'))
    .forEach((file) => {
      // Comments and quoted strings may contain braces on purpose.
      const css = fs.readFileSync(path.join(cssRoot, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/"[^"\n]*"|'[^'\n]*'/g, '""');
      let depth = 0;
      let line = 1;
      for (let i = 0; i < css.length; i += 1) {
        const c = css[i];
        if (c === '\n') line += 1;
        else if (c === '{') depth += 1;
        else if (c === '}') {
          assert(depth > 0,
            'css/' + file + ':' + line + ' has a stray } — the rules after it are ' +
            'discarded by the browser without any error');
          depth -= 1;
        }
      }
      assert(depth === 0,
        'css/' + file + ' ends with ' + depth + ' unclosed block(s) — everything ' +
        'after the missing } is swallowed into the last rule');
    });
}

function testColourBudget() {
  fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css') && f !== 'styles.base.css')
    .forEach((file) => {
      const count = (fs.readFileSync(path.join(cssRoot, file), 'utf8')
        .match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;
      const budget = HEX_BUDGET[file] || 0;
      assert(count <= budget,
        'css/' + file + ' has ' + count + ' literal colours against a budget of ' + budget +
        ' — use a token from styles.base.css, or lower the budget if you removed some');
    });
}

// The same rule for colour written as rgb()/rgba(), which the hex regex above
// cannot see. about.css was recorded in ROADMAP.md as "0 hex" — true, and
// misleading: it carried ten of these, six of them rgba(201, 165, 90, …), the
// pre-redesign GOLD, still in the file a whole visual redesign after the theme
// it belonged to was deleted. Kept separate from HEX_BUDGET rather than folded
// into it: merging would have raised every number in that map, and a budget
// that goes up is not a budget.
//
// rgba(var(--accent-rgb), …) is deliberately not matched — the digit has to
// follow the paren — so composing a wash from a token stays open.
const RGB_BUDGET = {
  'capsar.css': 6,
  'styles.navigation.css': 2,
};

function testRgbLiteralBudget() {
  fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css') && f !== 'styles.base.css')
    .forEach((file) => {
      const count = (fs.readFileSync(path.join(cssRoot, file), 'utf8')
        .match(/rgba?\(\s*[0-9]/g) || []).length;
      const budget = RGB_BUDGET[file] || 0;
      assert(count <= budget,
        'css/' + file + ' has ' + count + ' literal rgb()/rgba() colours against a budget of ' +
        budget + ' — use a token from styles.base.css (--scrim, --shadow-*, --accent-wash), ' +
        'or lower the budget if you removed some');
    });
}

// The pre-redesign token names. styles.base.css kept them aliased onto the new
// palette so the partials that still referenced them would render while M2
// reworked those files page by page; M2.5 took the last consumer off them and
// the alias block is gone. Same shape as the two budgets above — a per-file
// allowance that only ever goes down — except this one starts empty, so the
// budget is zero for every file and any reappearance fails.
//
// It counts declarations as well as uses, and that is the point. A stray
// var(--text-primary) is already caught by testEveryTokenIsDefined below, which
// sees an undeclared name. What nothing else can see is the obvious way to
// "fix" that failure: re-adding the alias block. That restores exactly the
// drift the deletion exists to end — two names for one colour, only one of them
// maintained — and reads to every other check in this file as well-formed CSS
// with every token declared.
//
// css/ only, like the other two budgets, and styles.base.css included rather
// than exempt, since re-declaring is the failure being guarded. Comments are
// stripped first, unlike testColourBudget: the note left where the alias block
// used to be names the tokens on purpose. js/bep-checklist.js declares its own
// --border inside buildExportStyles(), a standalone export document with none
// of css/ behind it — same spelling, unrelated token, out of reach here.
const LEGACY_TOKENS = [
  '--bg-primary', '--bg-elevated', '--bg-card', '--bg-card-hover', '--bg-secondary',
  '--border', '--border-subtle',
  '--text-primary', '--text-secondary', '--text-tertiary',
  '--accent-dim', '--accent-glow', '--accent-glow-strong',
  '--white',
];
const LEGACY_TOKEN_BUDGET = {};

function testLegacyTokenBudget() {
  const pattern = new RegExp('(' + LEGACY_TOKENS.join('|') + ')(?![A-Za-z0-9-])', 'g');
  fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css'))
    .forEach((file) => {
      const hits = fs.readFileSync(path.join(cssRoot, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .match(pattern) || [];
      const budget = LEGACY_TOKEN_BUDGET[file] || 0;
      const names = [...new Set(hits)].sort().join(', ');
      assert(hits.length <= budget,
        'css/' + file + ' has ' + hits.length + ' reference(s) to retired token names (' + names +
        ') against a budget of ' + budget + ' — these were the pre-redesign aliases and they are ' +
        'deleted, not deprecated. Use the palette token directly (--ink, --paper, --rule, ' +
        '--band-text …); do not re-declare the alias.');
    });
}

// var(--token) against a name that was never declared is not an error in CSS —
// the whole declaration is simply discarded. contact.css asked for --space-7,
// which is not on the scale (…5, 6, 8, 10…), and the contact columns rendered
// with no padding above 900px until this check went in.
const RUNTIME_PROPERTIES = [
  '--i', // stagger index, set per grid child by js/main.js
];

function testEveryTokenIsDefined() {
  const css = fs.readdirSync(cssRoot)
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(cssRoot, f), 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');

  const declared = new Set(
    (css.match(/(?:^|[;{\s])(--[A-Za-z0-9-]+)\s*:/g) || []).map((s) => s.match(/--[A-Za-z0-9-]+/)[0])
  );
  const used = new Set(
    (css.match(/var\(\s*(--[A-Za-z0-9-]+)/g) || []).map((s) => s.match(/--[A-Za-z0-9-]+/)[0])
  );

  const missing = [...used]
    .filter((token) => !declared.has(token) && !RUNTIME_PROPERTIES.includes(token))
    .sort();
  assert(missing.length === 0,
    'these custom properties are used but never declared, so every rule using them is discarded: ' + missing.join(', '));
}

// The sitemap is generated from the same page list Eleventy builds, so this is
// a contract check rather than a drift check: if it ever fails, generation has
// been replaced with something hand-maintained again.
function testSitemapCoversEveryPage() {
  const sitemap = read('sitemap.xml');
  const listed = (sitemap.match(/<loc>/g) || []).length;
  const built = ['', 'it'].reduce((n, dir) =>
    n + fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.html')).length, 0);
  assert(listed === built,
    'sitemap.xml lists ' + listed + ' URLs but the build produced ' + built + ' pages');
}

// og:image:width and :height are hardcoded in base.njk and reach all sixteen
// pages. They said 1200x630 while assets/og-image.jpg was a byte-identical copy
// of headshot.jpg — 680x1018, portrait — so every share on every page declared
// an image size wrong in both axes, and LinkedIn rendered a thumbnail instead of
// a card. Nothing pointed at it because no check had ever opened the file.
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    // SOF0-SOF15 carry the frame dimensions; DHT/JPG/DAC share the range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function testOgImageMatchesDeclaration() {
  const head = fs.readFileSync(path.join(srcRoot, '_includes', 'base.njk'), 'utf8');
  const declared = [/og:image:width" content="([0-9]+)"/, /og:image:height" content="([0-9]+)"/]
    .map((pattern) => {
      const match = head.match(pattern);
      assert(match, 'base.njk no longer declares ' + pattern.source);
      return Number(match[1]);
    });

  const file = path.join(repoRoot, 'assets', 'og-image.jpg');
  assert(fs.existsSync(file), 'assets/og-image.jpg is missing — regenerate it with scripts/og/make_og_image.mjs');
  const actual = jpegSize(file);
  assert(actual, 'could not read the dimensions of assets/og-image.jpg');
  assert(actual.width === declared[0] && actual.height === declared[1],
    'base.njk declares og:image as ' + declared[0] + 'x' + declared[1] + ' but assets/og-image.jpg is ' +
    actual.width + 'x' + actual.height + ' — regenerate it with scripts/og/make_og_image.mjs');
}

// The preflight validates hrefs in built HTML; nothing has ever read a link
// between two markdown files. Moving the roadmap out of docs/ broke every
// relative link pointing at it and none of the three suites noticed, because
// none of them opens a .md file at all.
function markdownFiles() {
  const dirs = ['.', 'docs', '.cursor/rules', '.github'];
  return dirs.flatMap((dir) => {
    const abs = path.join(repoRoot, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs)
      .filter((f) => f.endsWith('.md') || f.endsWith('.mdc'))
      .map((f) => dir === '.' ? f : dir + '/' + f);
  });
}

function testMarkdownLinksResolve() {
  const offenders = [];
  markdownFiles().forEach((relativePath) => {
    const lines = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8').split('\n');
    let inFence = false;
    lines.forEach((raw, i) => {
      if (raw.trimStart().startsWith('```')) { inFence = !inFence; return; }
      if (inFence) return;
      // Prose names dead and never-existing paths on purpose — the deleted
      // REDESIGN_PLAN, the old docs/ROADMAP — and always inside backticks.
      // Strip inline code before looking for links, or the roadmap section
      // describing this very check fails it.
      const line = raw.replace(/`[^`]*`/g, '');
      (line.match(/\]\(([^)\s]+)/g) || []).forEach((match) => {
        const target = match.slice(2);
        if (/^(https?:|mailto:|#)/.test(target)) return;
        const file = decodeURIComponent(target.split('#')[0]);
        if (!file) return;
        const resolved = path.resolve(repoRoot, path.dirname(relativePath), file);
        if (!fs.existsSync(resolved)) offenders.push(relativePath + ':' + (i + 1) + ' -> ' + target);
      });
    });
  });
  assert(offenders.length === 0,
    'these markdown links point at files that do not exist:\n  ' + offenders.join('\n  '));
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
  testPrivacyPage();
  testNavParity();
  testBookingRoutes();
  testAnalyticsGating();
  testMainJs();
  testNoInlineStyles();
  testNoStylesheetsInMarkup();
  testEveryClassHasARule();
  testPageScopedClassesResolve();
  testPageAssetsResolve();
  testNavTargetsResolve();
  testInkOnPaperClearsAA();
  testStylesheetsParse();
  testColourBudget();
  testRgbLiteralBudget();
  testLegacyTokenBudget();
  testEveryTokenIsDefined();
  testSitemapCoversEveryPage();
  testOgImageMatchesDeclaration();
  testMarkdownLinksResolve();
  console.log('UI/UX regression checks passed.');
}

run();
