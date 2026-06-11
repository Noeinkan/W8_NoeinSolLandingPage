# Noein Solutions — Landing Page

Static, multi-page marketing site for [noeinsolutions.com](https://noeinsolutions.com) — Andrea Aita's digital delivery consulting practice for the AEC industry, and the home of the **Capsar.io** SaaS product.

**Stack:** Plain HTML5 + vanilla CSS (custom properties) + a single vanilla ES5 IIFE for interactivity. No build step, no framework, no bundler. Google Fonts (`DM Sans`, `Instrument Serif`). Hosted on Hetzner behind Docker nginx.

> Looking for the deep dive? Start with [`CLAUDE.md`](./CLAUDE.md) — it's the canonical project brief (tech stack, file tree, conventions, deploy, tests, analytics).

---

## Quick start

Run the site locally with **one command**:

```bash
npm start
```

Then open <http://localhost:8000/> in your browser. The server auto-opens the page on first run.

The site is bilingual (English at `/`, Italian under `/it/`):

- <http://localhost:8000/> — home
- <http://localhost:8000/it/> — home (IT)
- <http://localhost:8000/bep-checklist.html> — BEP readiness diagnostic
- <http://localhost:8000/eir-checklist.html> — EIR clarity health check
- <http://localhost:8000/privacy.html> — privacy policy

### Options

```bash
npm start                # http://localhost:8000 (auto-opens browser)
node dev-server.js 3000  # custom port
node dev-server.js --no-open   # don't open the browser
```

The dev server:

- Serves the project root with zero dependencies (Node built-ins only).
- Disables HTTP caching, so every reload picks up your latest HTML/CSS/JS edits.
- Auto-resolves `/foo` → `/foo/index.html` and `/foo` (no extension) → `/foo.html`.
- Logs every request with status and method in the terminal.
- Opens the default browser on first start (suppress with `--no-open`).

> **No `npm install` needed.** The project has no runtime dependencies. `package.json` exists solely to expose `npm start` and the test scripts.

### Prefer auto-reload?

If you want the browser to refresh on every save, swap in a third-party watcher — no project changes required:

```bash
npx --yes live-server --port=8000
# or
npx --yes serve -l 8000
```

Both work out-of-the-box against the existing file layout.

---

## Project structure

```
W8_NoeinSolLandingPage/
├── index.html              # Home (EN)
├── about.html              # About + credentials
├── capsar.html             # Capsar.io product page
├── bep-checklist.html      # BEP readiness diagnostic
├── eir-checklist.html      # EIR clarity health check
├── privacy.html            # Privacy policy
│
├── it/                     # Italian mirrors (5 pages, EN↔IT parity)
│   ├── index.html
│   ├── about.html
│   ├── capsar.html
│   ├── bep-checklist.html
│   └── privacy.html
│
├── css/                    # Global + per-page stylesheets
├── js/
│   ├── main.js             # Single IIFE: nav, tabs, accordion, observers
│   ├── bep-checklist.js    # BEP readiness diagnostic engine
│   └── eir-checklist.js    # EIR clarity health check (0–3 scale, /100)
│
├── assets/                 # Images, lead magnets, certificates
├── docs/                   # Project documentation (see below)
├── scripts/                # Build helpers, test runners
├── deploy.sh               # Production deploy to Hetzner
└── dev-server.js           # Local dev server (used by `npm start`)
```

---

## Documentation

| File | What it covers |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | **Start here.** Tech stack, file tree, conventions, deploy, tests, analytics. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Notable site and documentation changes (backfilled from git history). |
| [`docs/PRODUCT_LANDING_PAGE.md`](./docs/PRODUCT_LANDING_PAGE.md) | Product definition, user journeys, repo scope. |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Full deployment guide and server architecture. |
| [`docs/UI_UX_ANALYSIS.md`](./docs/UI_UX_ANALYSIS.md) | Design system documentation. |
| [`docs/LOCALIZATION_IT_GLOSSARY.md`](./docs/LOCALIZATION_IT_GLOSSARY.md) | EN↔IT terminology (the *what*). |
| [`docs/LOCALIZATION_IT_STYLE.md`](./docs/LOCALIZATION_IT_STYLE.md) | IT voice and style brief (the *how*). |
| [`docs/LOCALIZATION_IT_QA_CHECKLIST.md`](./docs/LOCALIZATION_IT_QA_CHECKLIST.md) | Multilingual QA checklist. |

Internal-only documents (gitignored, never for the deployed site or public repo):

- `PRICING.md` — pricing rationale and recruiter/CV alignment notes.
- `PRE_LEAVE_LONG_TERM_PLAN.md` — local planning notes.

---

## Bilingual workflow

Every content change to an EN page must be mirrored in its `/it/` counterpart. When editing:

1. Make the change in the English file.
2. Apply the equivalent change in `it/<same-file>.html`.
3. Follow `docs/LOCALIZATION_IT_GLOSSARY.md` and the voice/style brief in `docs/LOCALIZATION_IT_STYLE.md`.
4. If adding a new page: add `hreflang` links to both versions, update `sitemap.xml`.
5. Run `npm run test:it` — guardrail for EN leakage, find/replace scars, accent misses, and structural drift.

IT copy conventions:

- **Voice:** `io` (first-person singular) + `tu` (informal second-person). No `Lei`/`Vi`/`voi` as reader address. No `noi` as speaker (Andrea is solo).
- Keep English-native terms in IT: `BEP`, `EIR`, `CDE`, `OIR`, `AIR`, `ISO 19650`, `TIDP`, `MIDP`, `digital delivery`, `onboarding`, `governance`, `Information Manager`, `BIM Manager`, `AEC`.
- Anchor IDs stay in English (`#information-management`, `#bep-eir`, `#programme-delivery`) — CSS/JS reference them.
- JS-referenced IDs (`exitOverlayClose`, `stickyCtaClose`, `leadMagnetSuccess`, `heroCanvas`, …) must stay identical to EN — do **not** translate them.
- Testimonial quotes are translated into Italian (same message, localized for IT buyers), not kept in the original EN.

---

## Testing

```bash
npm test                  # scripts/tests/ui-ux.test.js (structural regressions)
npm run test:it           # scripts/tests/it-translation.test.js (IT mirror completeness)
npm run test:eir          # scripts/tests/smoke/eir-smoke.test.js (EIR runtime, jsdom)
npm run test:all          # UI-UX + IT translation
bash deploy.sh --check    # link/href/canonical/title preflight
```

- **`ui-ux.test.js`** — unique IDs, ARIA semantics, form elements, accordion states, analytics ID gating, reduced-motion support.
- **`it-translation.test.js`** — per EN/IT pair: `<html lang="it">`, self-canonical, reciprocal hreflang, JS-referenced IDs preserved, no find/replace scars, no untranslated EN phrases, no missing accents, loose section count parity.
- **`eir-smoke.test.js`** — jsdom-based runtime test for the EIR Health Check. Self-installs `jsdom` into `scripts/tests/smoke/node_modules/` on first run; the directory is gitignored.

---

## Deployment

Target: Hetzner VPS (`77.42.70.26`), Docker nginx at `/var/www/noeinsol/`.

```bash
bash deploy.sh            # Full deploy (preflight + sync + smoke test)
bash deploy.sh --check    # Preflight checks only (local validation)
bash deploy.sh --dry-run  # Preview files to sync
bash deploy.sh --setup    # First-time setup with verbose logging
```

The script validates: all HTML files exist, every link/src/href resolves to a real file, each page has `<title>` and canonical. Post-deploy it smoke-tests HTTPS and verifies content. See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full guide.

---

## Conventions (cheat sheet)

- **CSS:** vanilla + custom properties. Dark theme, gold accent (`#c9a55a`). Fonts: `Instrument Serif` (headings), `DM Sans` (body).
- **JS:** single IIFE in `js/main.js`. Vanilla ES5 (`var`/`function`). `IntersectionObserver` for scroll animations. Keyboard-accessible tabs/accordions.
- **HTML template:** every page has a skip link, `<nav>` with language switcher, `<main id="main-content">`, consistent hero pattern (`.page-hero`), footer.
- **SEO:** every page has a canonical URL, `hreflang` alternates (en/it/x-default), OpenGraph tags. JSON-LD on the homepage.
- **Accessibility:** `aria-label` / `aria-expanded` / `aria-selected` everywhere it matters; `prefers-reduced-motion` respected throughout.
- **Booking:** Calendly inline widget embedded on `index`, `bep-checklist`, `privacy` (EN + IT mirrors). Loaded via `assets.calendly.com` — keep the embed markup identical across EN/IT.
- **Forms:** FormSubmit.co endpoint with a honeypot `_honey` field.
- **External links:** `target="_blank" rel="noopener"`.
- **Images:** `loading="lazy"` for below-fold images.
- **Required form fields:** include `aria-required="true"`.

---

## Analytics

- **Google Analytics 4:** `G-4VDKBC4ZQG`
- **Microsoft Clarity:** `wc4cpp95sy`

Both gated in JS — they won't load if the IDs are placeholder values, so local development is analytics-free by default.

---

## License

Proprietary. © Andrea Aita / Noein Solutions.
