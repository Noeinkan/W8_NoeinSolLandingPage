# Noein Solutions Landing Page

Static site for [noeinsolutions.com](https://noeinsolutions.com) — Andrea Aita's digital delivery consulting practice. Built with Eleventy; no client-side framework.

**Single source of truth: `src/`.** `npx @11ty/eleventy` builds the 20 pages into `_site/`, and `_site/` is what ships — `deploy.sh` runs the build then `rsync`s `_site/`, the preflight validates `_site/`, and both test suites read `_site/`. There are **no hand-written root `*.html` files any more**; the vestigial copies were removed once it was confirmed nothing consumed them. Never author HTML at the repo root — edit `src/**/*.njk` and rebuild.

`css/`, `js/`, `assets/` and `robots.txt` are passthrough-copied from the project root (`.eleventy.js:7-10`), so those are still edited in place. `_site/css/` is a *copy*: a CSS edit is invisible to the browser until the build runs again.

**Shared chrome is single-sourced.** `src/_includes/base.njk` holds head, analytics and body scaffolding; `src/_includes/partials/` holds nav and footer; `src/_data/nav.js` is the menu. Adding a nav entry is one edit, not twelve. The flip side: a change to `base.njk` reaches all 20 pages at once — a Calendly `<script>` added there once put a third-party script on every page including `privacy.html`, which is why it is now behind a per-page `calendly` flag.

**Recurring blocks are macros, not markup.** `src/_includes/macros/blocks.njk` holds the blocks that repeat across pages — `sectionHead(label, title, sub, align)` for the eyebrow/h2/standfirst triplet, `stat(count, label, suffix)` for a counter cell. Import what a page needs at the top (`{% from "macros/blocks.njk" import sectionHead %}`) and call it. The section heading was hand-written 51 times before this; three of those copies had drifted onto an inline `style="justify-content:center"` instead of the `.section-label--center` modifier that already existed. Add a macro whenever a block reaches its third hand-written copy.

**Styling never goes in the markup.** There are no `style=` attributes in `src/`, and `ui-ux.test.js` fails the build if one appears. An inline style is invisible to anyone reading the stylesheet: the eight `.section-full` call sites carried `padding:6rem 2rem` inline, which is the only reason nobody noticed that the `.section-full` rule itself had been deleted in the redesign. Add a modifier class instead — the design system already has more of them than the markup uses. Custom properties set from JS (`--i` for the stagger index) are the one exception, and they are set with `style.setProperty`, not in the template.

**Page numbers are derived, never typed.** `src/_data/builds.js` is the sole definition of the Builds lineup: cards, jump index, `data-count` stats, prose counts on both the Builds page and the homepage teaser, and the assertions in `ui-ux.test.js` all read from it. Adding or pulling a build is one edit there. Counts are deliberately kept out of JSON front matter, which cannot be templated and would go stale silently.

The same module holds the Italian strings. `IT_CATEGORIES`, `IT_BUILDS` and `IT_SHOTS` carry only what needs translating — label, title, standfirst, kicker, blurb, alt — and are overlaid onto the English lineup, so repo, slug, stack, captures and `noUi` exist once. `builds.lang.en` and `builds.lang.it` are the per-language views a template takes with `{% set lineup = builds.lang[lang] %}`; neither page branches on the language itself. The two pages therefore cannot list different builds, and a build added with no IT copy renders the English string rather than a blank card. Spelled-out numbers and the month range have a list per language for the same reason: "13 progetti, 7 mesi" reads as a spec sheet where the headline is meant to read as a sentence.

**The Capsar screenshots are data too.** `src/_data/capsar.js` holds the product captures the way `builds.js` holds the lineup: filename, the URL its browser chrome shows, the mono caption, the alt text — plus an `IT_SHOTS` overlay carrying only caption and alt, so file and order exist once. Both `capsar.njk` pages open with `{% set preview = capsar.lang[lang] %}` and loop, and therefore cannot show different screenshots. The panels held hand-written CSS skeletons before this — grey bars standing in for a UI — and one of them was captioned *EIR Responsiveness Matrix*: a real feature, but one no capture existed for. A caption describes what is in the frame, so a feature with no shot is simply not in the list. Captures come from the app's own shot kit (`W3_capsar_io/shotkit.config.mjs`) run against a throwaway database seeded with an invented project — never client data — and land in `assets/capsar/` at 1200×750 via `scripts/optimize_screenshots.py`, which walks `assets/builds/` and `assets/capsar/` in one pass.

**The two free tools hang off a hub, and are still two pages.** `iso-19650.njk` is the pillar: what the EIR asks, what the BEP answers, where the handover between them breaks, and the routing to both diagnostics. It is the single nav entry — `nav.js` used to spend two of its eight slots on the tools, and each tool then re-did the routing itself with a cross-link box under its own hero pointing at its sibling. Those boxes are gone; each tool now carries one line back to the hub instead, and `.eir-cross-link` survives only for Capsar's contextual pointer. What did *not* happen is a merge: `bep-checklist` and `eir-checklist` keep their own URLs, titles and canonicals because they answer different searches for different people at different stages — the EIR is client-side and pre-appointment, the BEP is the supplier's response — and one URL would be one keyword target instead of two, on the site's two top-of-funnel lead magnets. They are also 1,938 lines of JS between them with separate scoring models, so a merged page would load both to serve one.

## File Structure

```
├── src/                # Page sources — the only place to author markup
│   ├── _data/          # builds.js (Builds lineup, derived counts, IT strings),
│   │                   # capsar.js (Capsar captures + IT captions), nav.js, site.js,
│   │                   # strings.js, sitemap.js (crawl hints),
│   │                   # eleventyComputed.js (canonical/hreflang/prefix)
│   ├── _includes/      # base.njk + partials/ (nav, footer, cert lightbox)
│   │   └── macros/     # blocks.njk — sectionHead, stat
│   ├── sitemap.njk     # generates _site/sitemap.xml from the built pages
│   ├── en/*.njk        # 10 English pages
│   └── it/*.njk        # 10 Italian mirrors — every EN page now has one
├── _site/              # Build output — gitignored, and what deploy.sh ships. Never edit.
├── css/                # Styles split into per-concern partials
│   ├── styles.css      # 8-line @import manifest for the global bundle
│   ├── styles.base.css
│   ├── styles.utilities.css
│   ├── styles.animations.css
│   ├── styles.ui.css
│   ├── styles.hero.css
│   ├── styles.navigation.css
│   ├── styles.sections.css
│   ├── styles.responsive.css
│   ├── about.css
│   ├── capsar.css         # Capsar page: hairline pain/module grids, ruled step flow,
│   │                      # and one dark-panel definition shared by both capture
│   │                      # families (proof card on paper, preview on .band--dark) —
│   │                      # chrome + a 16:10 .mockup-shot + a mono caption
│   ├── iso-19650.css      # ISO 19650 hub: the EIR/BEP handshake block. Everything
│   │                      # else on that page is a shared block
│   ├── bep-checklist.css
│   ├── eir-checklist.css  # EIR Health Check: reuses .bep-* scaffolding, adds .eir-q + .eir-gap-card
│   ├── builds.css         # Builds page: .build-card grid by domain, 16:10 media slots (cross-fading
│   │                      # frame stack where a build has several captures), empty-state panel
│   └── contact.css        # Contact page: two-column booking/brief grid + Calendly slot
├── js/
│   ├── main.js              # Single IIFE bundle (all interactivity, analytics, animations)
│   ├── bep-checklist.js     # Interactive BEP readiness diagnostic
│   └── eir-checklist.js     # Interactive EIR clarity health check (0–3 scale, /100 score)
├── assets/             # Images, lead magnet file, credential certs, builds/ and capsar/ screenshots
├── deploy.sh           # Production deployment script
├── deploy/templates/   # Nginx + Docker Compose templates
├── docs/               # Project documentation
│   ├── DEPLOYMENT.md
│   ├── PRODUCT_LANDING_PAGE.md
│   ├── BUILDS_SCREENSHOTS.md
│   └── LOCALIZATION_IT.md
├── scripts/            # Build helpers, test runners
│   ├── smoke-check.js
│   ├── convert_certs.py
│   ├── optimize_headshot.py
│   ├── optimize_screenshots.py
│   ├── og/
│   │   └── make_og_image.mjs   # regenerates assets/og-image.jpg at 1200×630 (hand-run, not in the build)
│   └── tests/
│       ├── ui-ux.test.js
│       ├── it-translation.test.js
│       └── smoke/
│           └── eir-smoke.test.js  # EIR Health Check: jsdom-based runtime test (self-installs jsdom)
├── dev-server.js       # Zero-dependency static server for _site/ on :8000 (`npm start`)
├── ROADMAP.md          # Technical-consolidation milestones — lives at the root, not in docs/
├── CHANGELOG.md
├── README.md           # How to run it locally; points here for everything else
├── AGENTS.md           # Pointer stub → CLAUDE.md (do not duplicate content into it)
└── CLAUDE.md
```

## Key Conventions

- **CSS:** Vanilla CSS on a tokenised design system ("Technical Light"). Warm paper ground (`--paper: #FAF9F6`), near-black ink (`--ink: #14161A`), drawing-sheet hairlines, signal-orange accent (`--accent: #F04E23`; use `--accent-text: #C0390F` for orange TEXT on paper — the fill colour is only 3.7:1 and fails AA). Full-bleed dark surfaces opt in via `.band--dark`. Tokens for colour, fluid type scale (`--step--2` … `--step-5`), space, radius, shadow and duration live in `css/styles.base.css`; the pre-redesign token names (`--text-primary`, `--bg-card`, `--border-subtle` and ten more) were kept aliased onto this palette until M2 took the last consumer off them, and the alias block is now **deleted** — `testLegacyTokenBudget` fails the build if one reappears, as a use or as a re-declaration. There is no old name to fall back on: write the palette token. `--white` went first and for the sharpest reason — it had no honest mapping onto paper, so the seven rules still using it rendered white text on a `#FAF9F6` ground. Light text on a dark surface is `--band-text`. Note the space scale skips: `1 2 3 4 5 6 8 10 12 16`, no `--space-7`. Fonts: `Archivo` (display), `DM Sans` (body), `IBM Plex Mono` (labels, stats, metadata) via Google Fonts.
- **Type sizing lives only in the fluid `--step-*` scale.** `styles.responsive.css` is layout-only and must not set `font-size` — the previous version re-declared sizes across four min-width tiers, giving `.hero h1` three competing systems.
- **Scroll reveal is progressive.** `.fade-in` is visible by default; `js/main.js` adds `.js-anim` to `<html>` before observing, so a JS failure leaves content visible rather than blank. The observer also reveals elements already scrolled past (`boundingClientRect.top < 0`) — otherwise a visitor who scrolls before its first async delivery leaves a section permanently hidden.
- **JS:** Single IIFE in `js/main.js`. Vanilla ES5. Intersection Observer for scroll animations. Keyboard-accessible tabs/accordions.
- **HTML template:** Every page has: skip link, `<nav>` with language switcher, `<main id="main-content">`, consistent hero pattern (`.page-hero`), footer.
- **SEO:** Each page has canonical URL, hreflang alternates (en/it/x-default), OpenGraph tags, JSON-LD on homepage.
- **Accessibility:** ARIA labels, `aria-expanded`/`aria-selected` states, `prefers-reduced-motion` respected throughout.
- **Forms:** lead-magnet / contact forms post to FormSubmit.co (`https://formsubmit.co/andrea.aita@noeinsolutions.com`) with a honeypot `_honey` field. Present on `index`, `contact`, `bep-checklist`, `eir-checklist` and IT mirrors. Required fields carry `aria-required="true"`. Field styling (input/select/textarea) is global, in `styles.ui.css`.
- **Booking:** `site.calendly` in `src/_data/site.js` is the one booking URL. Two mechanisms: a **popup** CTA (`Calendly.initPopupWidget`) on every selling page, and the **inline** widget on `contact` only. Both need `"calendly": true` in that page's front matter, which is what loads the widget script — `base.njk` reaches all 20 pages, so loading it globally would put a third-party script on `privacy.html` for nothing. Keep the popup CTA a real `<a href>`: when the script is blocked the `onclick` throws, the default is never prevented, and the link just navigates to Calendly. `testBookingRoutes` in `ui-ux.test.js` enforces all of this. Calendly's `background_color`/`text_color`/`primary_color` params are sent but ignored on the free plan.
- **Conversion target:** business mode. Every page routes to a booking CTA (`contact.html` / the Calendly popup), with the Capsar app at `app.noeinsolutions.com` and GitHub as secondary destinations. External links use `target="_blank" rel="noopener"`; below-fold images use `loading="lazy"`.
- **No published rates.** Pricing is scoped on enquiry; the archived `js/services-pricing.js` estimator stays retired. `services.njk` uses `.offer-card-price-section` for scope/timeline, not money.

## Bilingual Workflow

Every content change to an EN page must be mirrored in its `/it/` counterpart. When editing:
1. Make the change in `src/en/<page>.njk`
2. Apply the equivalent change in `src/it/<page>.njk`
3. Follow the terminology and voice/style brief in `docs/LOCALIZATION_IT.md`
4. If adding a new page: set `"hasMirror": true` in the front matter of **both** versions — `src/_data/eleventyComputed.js` derives the hreflang set and the language-toggle target from it, so an EN page whose mirror does not exist yet keeps `"hasMirror": false` and its toggle points at `#` rather than at a 404. Every page currently has a mirror, so nothing is on `false` — a new EN page starts there until its IT counterpart lands. The sitemap needs nothing — `src/sitemap.njk` generates it from the pages Eleventy built, reusing the same computed `selfUrl` as the canonical tag, so a page cannot be live and unlisted (which is how `services.html` and `contact.html` first shipped). Give the slug a priority in `src/_data/sitemap.js` only if the default is wrong.
5. Run `node scripts/tests/it-translation.test.js` — guardrail for EN-leakage, find/replace scars, accent misses, and structural drift vs. EN. **Note:** the test does not catch voice or AI-tells; that's what the style half of `docs/LOCALIZATION_IT.md` is for — self-check against its pre-commit checklist.

Conventions for IT copy:
- **Voice: `io` (first-person singular) + `tu` (informal second-person).** No `Lei`/`Vi`/`voi` as reader address. No `noi` as speaker (Andrea is solo). Specific exceptions (hero on index, career timeline on about, testimonials, footer brand) are documented in `docs/LOCALIZATION_IT.md`.
- Keep English-native terms in IT: `BEP`, `EIR`, `CDE`, `OIR`, `AIR`, `ISO 19650`, `TIDP`, `MIDP`, `digital delivery` (in titles), `onboarding`, `governance`, `Information Manager`, `BIM Manager`, `AEC`.
- Keep anchor IDs in English (`#delivery`, `#markets`, `#tools`, `#games`, `#platform-preview`, `#main-content`) — CSS/JS reference them; only translate visible link text.
- JS-referenced IDs (`exitOverlayClose`, `exitOverlayDismiss`, `stickyCtaClose`, `leadMagnetSuccess`) must stay identical to EN — do NOT translate them.
- Translate testimonial quotes into Italian (same message, localized for IT buyers), not kept in the original EN.
- Credentials rendered descriptively with EN designation in parens where useful (e.g. `"Ingegnere civile abilitato"`; for UK-specific `"RICS Certified BIM Professional"` keep English).

## Deployment

Target: Hetzner VPS (`77.42.70.26`), Docker nginx at `/var/www/noeinsol/`.

```bash
bash deploy.sh           # Full deploy (preflight + sync + smoke test)
bash deploy.sh --check   # Preflight checks only (local validation)
bash deploy.sh --dry-run # Preview files to sync
bash deploy.sh --setup   # First-time setup with verbose logging
```

The script validates: all HTML files exist, every link/src/href resolves to a real file, each page has `<title>` and canonical. Post-deploy it smoke-tests HTTPS and verifies content.

## Testing

```bash
npm run check                               # build + all three suites, in one command
node scripts/tests/ui-ux.test.js            # structural regressions + source hygiene
node scripts/tests/it-translation.test.js   # IT mirror completeness
node scripts/tests/smoke/eir-smoke.test.js  # EIR Health Check runtime (jsdom; auto-installs on first run)
bash deploy.sh --check        # link/href/canonical/title preflight
```

- **`scripts/tests/ui-ux.test.js`** — unique IDs, ARIA semantics, form elements, accordion states, analytics ID gating, reduced-motion support. Plus a **source hygiene** block that reads `src/` and `css/` rather than the build output, each check standing in for a failure the repo had already shipped silently:
  - no `style=` attribute in any template;
  - every class in the markup has a rule in `css/` or is attached by JS — `UNSTYLED_CLASSES` lists the known exceptions and is only ever allowed to shrink;
  - every `var(--token)` is declared somewhere (`--space-7` was not, so the contact columns rendered with no padding);
  - every `css:`/`js:` entry in front matter resolves to a real file;
  - every `nav.js` href resolves to a built page;
  - literal hex colours per file stay within `HEX_BUDGET`, which only goes down;
  - no file in `css/` names a retired pre-redesign token (`LEGACY_TOKEN_BUDGET`, zero everywhere,
    and it counts re-declaring one as well as using it — `styles.base.css` included);
  - the sitemap lists exactly as many URLs as the build produced pages;
  - `assets/og-image.jpg`'s real dimensions (read from its JPEG SOF marker) match the
    `og:image:width`/`height` hardcoded in `base.njk` — the file used to be a 680×1018 copy of the
    headshot while every page declared 1200×630;
  - every markdown link resolves relative to its own file, across root `*.md`, `docs/*.md`,
    `.cursor/rules/*.mdc` and `.github/*.md`. Fenced blocks and inline `code` are stripped first,
    because the docs name deleted paths on purpose and always inside backticks.
- **`scripts/tests/it-translation.test.js`** — per EN/IT pair: `<html lang="it">`, self-canonical, reciprocal hreflang, JS-referenced IDs preserved, no find/replace scars (`con`/`per un` + EN word), no untranslated EN phrases, no missing accents (`perché`, `più`, `conformità`, ...), loose `<section>`/`<details>`/`<blockquote>` count parity with EN.
- **`scripts/tests/smoke/eir-smoke.test.js`** — jsdom-based runtime test for the EIR Health Check. Loads `eir-checklist.html` + `js/eir-checklist.js` into a headless DOM, simulates user ratings, and asserts: DOM render, scoring engine (0–3 scale → /100), band classes, persistence round-trip, report generation, gap-card selection, export-view HTML output, empty-state guard, and href/src resolution. A final block runs `it/eir-checklist.html` through the same file to exercise the Italian branch, which nothing else reaches: the questions, bands, gap cards and the whole export document are written by JS, so an English literal left inline there is invisible to `it-translation.test.js`, which only ever sees the static markup. Self-installs `jsdom` into `scripts/tests/smoke/node_modules/` on first run; the directory is gitignored.

## Analytics

- Google Analytics 4: `G-4VDKBC4ZQG`
- Microsoft Clarity: `wc4cpp95sy`
- Both gated in JS — won't load if IDs are placeholder values.

## Documentation

This file is the source of truth for how the repo works. `README.md` covers only how to run it locally; `AGENTS.md` is a pointer stub. Do not duplicate this file's content into either — a previous full copy in `AGENTS.md` drifted an entire visual redesign out of date without anything catching it.

- `ROADMAP.md` (repo root, next to `CHANGELOG.md`) — technical-consolidation roadmap: milestones M0–M5 with tick-off checkboxes and a "done when" command each. The **what, in which order, and is it done yet** — and, since the separate redesign plan was folded into it, the **how** as well: its *Design direction* section is the intent behind the "Technical Light" tokens, which M2 applies page by page. Tick items as they land, and read it before starting a design or CSS session — it is where the outstanding debt is measured
- `docs/DEPLOYMENT.md` — full deployment guide and server architecture
- `docs/PRODUCT_LANDING_PAGE.md` — product definition for the site, its audiences, and repo scope
- `docs/LOCALIZATION_IT.md` — EN-IT terminology (the **what**) and the IT voice/style brief (the **how**: anti-patterns, sentence rhythm, pre-commit checklist)
- `docs/BUILDS_SCREENSHOTS.md` — capture guide for the Builds page dashboard screenshots (filename map, framing, empty-slot swap)
- `CHANGELOG.md` — notable site and documentation changes, backfilled from git history
