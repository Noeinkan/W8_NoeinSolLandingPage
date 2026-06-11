# Noein Solutions Landing Page

Static HTML/CSS/JS landing page for [noeinsolutions.com](https://noeinsolutions.com) — Andrea Aita's digital delivery consulting practice. No build step, no framework, no npm.

## File Structure

```
├── *.html              # 6 English pages (index, about, capsar, bep-checklist, eir-checklist, privacy)
├── it/*.html           # 5 Italian mirrors (eir-checklist mirror not yet shipped)
├── css/                # Styles split into per-concern partials
│   ├── styles.css      # Global styles + CSS custom properties (~2,550 lines)
│   ├── styles.base.css
│   ├── styles.utilities.css
│   ├── styles.animations.css
│   ├── styles.ui.css
│   ├── styles.hero.css
│   ├── styles.navigation.css
│   ├── styles.sections.css
│   ├── styles.faq.css
│   ├── styles.responsive.css
│   ├── home.css        # Page-specific overrides
│   ├── about.css
│   ├── services.css
│   ├── capsar.css
│   ├── case-studies.css
│   ├── contact.css
│   ├── bep-checklist.css
│   └── eir-checklist.css  # EIR Health Check: reuses .bep-* scaffolding, adds .eir-q + .eir-gap-card
├── js/
│   ├── main.js              # Single IIFE bundle (all interactivity, analytics, animations)
│   ├── bep-checklist.js     # Interactive BEP readiness diagnostic
│   └── eir-checklist.js     # Interactive EIR clarity health check (0–3 scale, /100 score)
├── assets/             # Images, lead magnet file, credential certs
├── deploy.sh           # Production deployment script
├── deploy/templates/   # Nginx + Docker Compose templates
├── docs/               # Project documentation
│   ├── DEPLOYMENT.md
│   ├── PRODUCT_LANDING_PAGE.md
│   ├── UI_UX_ANALYSIS.md
│   ├── LOCALIZATION_IT_GLOSSARY.md
│   ├── LOCALIZATION_IT_STYLE.md
│   └── LOCALIZATION_QA_CHECKLIST.md
├── scripts/            # Build helpers, test runners
│   ├── smoke-check.js
│   ├── convert_certs.py
│   ├── optimize_headshot.py
│   └── tests/
│       ├── ui-ux.test.js
│       ├── it-translation.test.js
│       └── smoke/
│           └── eir-smoke.test.js  # EIR Health Check: jsdom-based runtime test (self-installs jsdom)
├── CHANGELOG.md
├── CLAUDE.md
├── PRICING.md          # gitignored — internal only
└── PRE_LEAVE_LONG_TERM_PLAN.md  # gitignored — local planning
```

## Key Conventions

- **CSS:** Vanilla CSS with custom properties. Dark theme, gold accent (`#c9a55a`). Fonts: `Instrument Serif` (headings), `DM Sans` (body) via Google Fonts.
- **JS:** Single IIFE in `js/main.js`. Vanilla ES5. Intersection Observer for scroll animations. Keyboard-accessible tabs/accordions.
- **HTML template:** Every page has: skip link, `<nav>` with language switcher, `<main id="main-content">`, consistent hero pattern (`.page-hero`), footer.
- **SEO:** Each page has canonical URL, hreflang alternates (en/it/x-default), OpenGraph tags, JSON-LD on homepage.
- **Accessibility:** ARIA labels, `aria-expanded`/`aria-selected` states, `prefers-reduced-motion` respected throughout.
- **Booking:** Calendly inline widget embedded on `index`, `contact`, `case-studies`, `bep-checklist`, `privacy` (EN + IT mirrors). Loaded via `assets.calendly.com` script — keep the embed markup identical across EN/IT.

## Bilingual Workflow

Every content change to an EN page must be mirrored in its `/it/` counterpart. When editing:
1. Make the change in the English file
2. Apply the equivalent change in `it/<same-file>.html`
3. Follow terminology in `docs/LOCALIZATION_IT_GLOSSARY.md` and the voice/style brief in `docs/LOCALIZATION_IT_STYLE.md`
4. If adding a new page: add hreflang links to both versions, update `sitemap.xml`
5. Run `node scripts/tests/it-translation.test.js` — guardrail for EN-leakage, find/replace scars, accent misses, and structural drift vs. EN. **Note:** the test does not catch voice or AI-tells; that's what `docs/LOCALIZATION_IT_STYLE.md` is for — self-check against its pre-commit checklist.

Conventions for IT copy:
- **Voice: `io` (first-person singular) + `tu` (informal second-person).** No `Lei`/`Vi`/`voi` as reader address. No `noi` as speaker (Andrea is solo). Specific exceptions (hero on index, career timeline on about, testimonials, footer brand) are documented in `docs/LOCALIZATION_IT_STYLE.md`.
- Keep English-native terms in IT: `BEP`, `EIR`, `CDE`, `OIR`, `AIR`, `ISO 19650`, `TIDP`, `MIDP`, `digital delivery` (in titles), `onboarding`, `governance`, `Information Manager`, `BIM Manager`, `AEC`.
- Keep anchor IDs in English (`#information-management`, `#bep-eir`, `#programme-delivery`) — CSS/JS reference them; only translate visible link text.
- JS-referenced IDs (`exitOverlayClose`, `exitOverlayDismiss`, `stickyCtaClose`, `leadMagnetSuccess`, `heroCanvas`) must stay identical to EN — do NOT translate them.
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
node scripts/tests/ui-ux.test.js            # structural regressions
node scripts/tests/it-translation.test.js   # IT mirror completeness
node scripts/tests/smoke/eir-smoke.test.js  # EIR Health Check runtime (jsdom; auto-installs on first run)
bash deploy.sh --check        # link/href/canonical/title preflight
```

- **`scripts/tests/ui-ux.test.js`** — unique IDs, ARIA semantics, form elements, accordion states, analytics ID gating, reduced-motion support.
- **`scripts/tests/it-translation.test.js`** — per EN/IT pair: `<html lang="it">`, self-canonical, reciprocal hreflang, JS-referenced IDs preserved, no find/replace scars (`con`/`per un` + EN word), no untranslated EN phrases, no missing accents (`perché`, `più`, `conformità`, ...), loose `<section>`/`<details>`/`<blockquote>` count parity with EN.
- **`scripts/tests/smoke/eir-smoke.test.js`** — jsdom-based runtime test for the EIR Health Check. Loads `eir-checklist.html` + `js/eir-checklist.js` into a headless DOM, simulates user ratings, and asserts: DOM render, scoring engine (0–3 scale → /100), band classes, persistence round-trip, report generation, gap-card selection, export-view HTML output, empty-state guard, and href/src resolution. Self-installs `jsdom` into `scripts/tests/smoke/node_modules/` on first run; the directory is gitignored.

## Analytics

- Google Analytics 4: `G-4VDKBC4ZQG`
- Microsoft Clarity: `wc4cpp95sy`
- Both gated in JS — won't load if IDs are placeholder values.

## Documentation

- `docs/DEPLOYMENT.md` — full deployment guide and server architecture
- `docs/PRODUCT_LANDING_PAGE.md` — product definition for the site, its user journeys, and repo scope
- `CHANGELOG.md` — notable site and documentation changes, backfilled from git history
- `docs/LOCALIZATION_IT_GLOSSARY.md` — EN-IT terminology reference (the **what**)
- `docs/LOCALIZATION_IT_STYLE.md` — IT voice and style brief (the **how**: anti-patterns, sentence rhythm, pre-commit checklist)
- `docs/LOCALIZATION_QA_CHECKLIST.md` — multilingual QA checklist
- `docs/UI_UX_ANALYSIS.md` — design system documentation
- `PRICING.md` (gitignored) — internal pricing rationale and recruiter/CV alignment notes (not for publication)
