# Changelog

All notable repository changes should be recorded here.

This file was added on 2026-05-26. Entries before that date were backfilled from git history and grouped into readable release milestones rather than one line per commit.

## [Unreleased]

### Added

- **Business mode — the site can be sold from again.** Practitioner mode had stripped every commercial route: no services page, no contact page, no form, no Calendly, no availability statement. A visitor had no action available beyond reading. Restored as `services` + `contact` in both languages (16 pages total), with the four archived case studies folded into `services` as a proof section rather than a page of their own.
- **Booking on every selling page.** `site.calendly` is the single booking URL. A popup CTA (`Calendly.initPopupWidget`) on index, services, about, capsar, builds and both checklists; the inline widget on `contact`. Both are gated behind a per-page `"calendly": true` flag so `privacy.html` does not pull a third-party script it has no use for. Every CTA stays a real `<a href>`, so a blocked script degrades to a plain navigation instead of a dead button — verified with JS disabled and with `assets.calendly.com` aborted.
- **`testBookingRoutes` guardrail in `ui-ux.test.js`.** Practitioner mode removed every booking route silently and nothing caught it for two months. The test now asserts that each selling page carries a booking link *and* the widget script, that the CTA is an anchor, that non-selling pages do **not** load Calendly, and that a `mailto:` route exists independently of any third party.
- Generic form-field styling (`input`/`select`/`textarea`) in `styles.ui.css`. Fields previously had focus states but no resting style, so every form on the site — including the homepage lead magnet — rendered as an unstyled browser default.
- **`src/_includes/macros/blocks.njk`** — the first macros in the repo. `sectionHead(label, title, sub, align)` replaces 51 hand-written copies of the eyebrow/h2/standfirst triplet across twelve pages; `stat(count, label, suffix)` replaces 12 counter cells. Output is unchanged apart from indentation, verified by diffing the build against a pre-refactor snapshot.
- **Source-hygiene guardrails in `ui-ux.test.js`** — seven checks that read `src/` and `css/` instead of the build output: no inline `style=`; every markup class has a CSS rule or a JS reference; every `var(--token)` is declared; every `css:`/`js:` front-matter entry resolves; every `nav.js` href is a built page; literal hex colours stay inside a per-file budget; the sitemap covers every page. Each was written against a failure the repo had already shipped, and each was verified to fail before being committed green.
- **`npm run check`** — build plus all three suites in one command.
- **Generated sitemap.** `src/sitemap.njk` + `src/_data/sitemap.js` replace the hand-written `sitemap.xml`, iterating the pages Eleventy built and reusing the same computed `selfUrl` that renders the canonical tag, so the two cannot disagree and a new page cannot ship unlisted.
- Staggered reveal extended to `.offer-grid`, `.build-grid`, `.trust-band-grid`, `.recognition-grid` and `.step-flow`. The machinery already existed in `styles.animations.css`; the selector list in `main.js` still named three grids whose pages had been deleted and none of the grids that replaced them, so the newest pages were the only ones landing flat.

### Changed

- **Positioning moved to the intersection.** The hero was *"Building the tools I wished existed on every programme"* — about Andrea rather than the buyer. It is now *"Ten years fixing delivery. Now I build the software that does it."* Titles, meta descriptions, OpenGraph tags, the JSON-LD `jobTitle` (`Information management practitioner` → `Information management consultant and software engineer`) and the footer tagline all follow. The build count in the hero reads from `builds.js` rather than being typed, so it cannot go stale.
- **The AI/automation sprint now leads the services page.** It was buried fourth in the archived commercial site, yet it is the offer the twelve-plus public repositories actually evidence; information management, BEP/EIR and programme delivery sit beneath it as the credibility base.
- Services page reuses the existing `.offer-card` / `.offer-grid` system, which was already styled for Technical Light but referenced by no markup. No new card CSS was written. `.offer-card-price-section` carries scope and timeline — **no rates are published**, and the archived `services-pricing.js` estimator stays retired.
- Nav gained two entries and is ordered by commercial intent (the page that sells sits second). The hamburger breakpoint moved 968px → 1180px, and nav labels no longer wrap mid-item, because eight entries no longer fit on one line below ~1200px.
- `testEnNavParity` became `testNavParity`, reads the expected menu from `src/_data/nav.js`, and now covers the Italian tree as well as the English one.

- **Documentation rationalised — 11 files to 7, with `CLAUDE.md` as the single source of truth.** `AGENTS.md` had become a stale verbatim fork of `CLAUDE.md` describing the pre-redesign dark/gold theme and five deleted stylesheets; it is now a pointer stub. `README.md` was a third overlapping copy of the same overview and is trimmed to how-to-run-it plus a doc index. `docs/LOCALIZATION_IT_GLOSSARY.md` and `docs/LOCALIZATION_IT_STYLE.md` merged into `docs/LOCALIZATION_IT.md` (the glossary's Voice/Tone/Credentials/Testimonials sections duplicated the style brief). `docs/LOCALIZATION_QA_CHECKLIST.md` deleted — every live item is enforced by `it-translation.test.js` or `deploy.sh --check`, and three targeted the removed contact form. `docs/PRODUCT_LANDING_PAGE.md` trimmed of the sections `CLAUDE.md` owns. `docs/UI_UX_ANALYSIS.md` and `docs/PRICING.md` removed (both predated the redesign and the practitioner strip).
- **Stale facts corrected across the docs.** Removed the documented Calendly embed (no page has contained one since the practitioner strip); replaced the dead anchor IDs `#information-management` / `#bep-eir` / `#programme-delivery` with the ones that exist (`#delivery`, `#markets`, `#tools`, `#games`, `#platform-preview`); dropped the "no build step, no npm" claim now that Eleventy is in the tree; documented the FormSubmit.co endpoint and honeypot that actually handle conversion.
- **`docs/REDESIGN_PLAN.md` now carries a status table.** Phases 0–2 complete, Phase 3 partial, Phase 4 not started — plus the still-open `{{ prefix }}` nav defect that sends the IT wordmark to `/it/index.html`. The Context section is relabelled as describing the pre-redesign site.
- **Visual redesign — "Technical Light".** Replaced the dark near-black (`#0a0a0c`) + gold (`#c9a55a`) theme with a warm paper ground (`--paper: #FAF9F6`), near-black ink, drawing-sheet hairlines, and a signal-orange accent (`--accent: #F04E23`). Type moves from `Instrument Serif` to `Archivo` for display, keeps `DM Sans` for body, and adds `IBM Plex Mono` for stats, section labels and metadata. Applied to the EN and IT homepages; all other pages inherit the new tokens through the shared bundle.
- **The token layer is now a real system.** `css/styles.base.css` gains spacing, radius, shadow, duration, a fluid type scale (`--step--2` … `--step-5`) and an `--accent-rgb` channel — replacing ~40 literal `rgba(201, 165, 90, …)` occurrences and 14 ad-hoc `border-radius` values. Pre-redesign token names are retained as aliases so untouched partials keep rendering.
- **Homepage structure.** The five value cards move from a `repeat(3, 1fr)` grid (which left a 3+2 orphan row) to an explicit 6-column bento: 3+3 then 2+2+2. A new full-bleed dark band shows the EIR Health Check output — the first time any product UI appears on the site — built as live HTML/CSS rather than a screenshot, so it stays crisp and needs no image pipeline. The IT mirror shows the BEP checklist instead, since `it/eir-checklist.html` does not exist.
- Zebra striping via `main > section:nth-child(even)` replaced by explicit `.band` / `.band--sunk` / `.band--dark` classes. The old rule was driven by a mix of `<section>` and `<div>` children and inverted silently on any reorder.
- `styles.responsive.css` is now layout-only (389 → 88 lines). It previously re-declared font sizes across four min-width tiers, so `.hero h1` had three competing size systems (a `clamp()`, fixed mobile overrides, and a fixed `5rem` above 1440px that exceeded the clamp ceiling).
- Primary buttons are orange fill with **ink** text (5.53:1). White on `#F04E23` is 3.68:1 and fails AA, so it is not used anywhere.

### Fixed

- **`privacy.html` scrolled sideways on every phone.** `.privacy-table` overflowed the viewport at both 390px and 320px, dragging the whole page with it — a pre-existing defect, found during mobile QA of this change. The table now scrolls inside its own container.
- `.contact-col` forced the page 15px wider than a 320px screen: grid items default to `min-width: auto`, so the column refused to shrink below the Calendly embed's intrinsic width. All 16 pages are now free of horizontal overflow at 320px and 390px.
- **Scroll-reveal sections could stay permanently blank.** `.fade-in` elements start hidden and depend on an `IntersectionObserver`. Its first callback is asynchronous, so a visitor who scrolled immediately — or reloaded at a restored scroll position, or landed on a `#hash` — could pass a section before the observer activated; it then never saw a threshold crossing and the section never appeared. The observer now also reveals anything already above the viewport, and `js/main.js` adds `.js-anim` to `<html>` before observing so the content stays visible if the script fails entirely.
- Stat counters rendered `0` without JavaScript; the markup now carries the real value and JS animates up from zero.
- `.product-band-inner` had no mobile collapse and stayed two columns below 968px.
- `--bg-secondary`, referenced by `css/about.css:152`, had never been defined in any commit and silently fell back to transparent.
- **Seven rules rendered white text on paper.** `--white` was the dark theme's body colour and survived the redesign as an alias to `#ffffff`. The career-timeline job titles on About, the Capsar pain-card and step headings, two credential titles and the lightbox close-button hover all still used it, against a `#FAF9F6` or `#FFFFFF` ground — 1.05:1, invisible. All now `--ink`; the one legitimate case, the dark scrim over a certificate thumbnail, is `--band-text`. The alias itself has been deleted so it cannot be reached for again.
- **The contact columns had no padding above 900px.** `.contact-col` asked for `var(--space-7)`, which is not on the scale (`…5, 6, 8, 10…`). CSS discards a declaration referencing an undeclared custom property, so the desktop padding simply never applied; the `≤900px` media query hid it by setting a valid value. Now `--space-8`, with a test that fails on any undeclared token.
- **`.section-full` had lost its rule entirely.** The redesign dropped the definition and the eight call sites survived only on an inline `padding:6rem 2rem`. Restored in `styles.sections.css`, matched to `section`'s own max-width, gutter and vertical rhythm — a full-bleed block used to indent its content 40px less than the ordinary sections above and below, so the left rail stepped in and out down the page.
- `.form-success` likewise had no rule: the markup hid it inline and `main.js` revealed it with `display:flex`, so on the one path where the lead-magnet success panel appeared it rendered as unstyled body text.
- Four inline links used `--accent` (3.7:1, fails AA for text) instead of `--accent-text`. They now share a `.link-inline` class.
- The Builds "months" stat and the `Jan–Aug 2026` range beside it were both typed by hand and went stale on the first of every month. Both derive from a single `START` constant in `builds.js` now.

### Removed

- **2,874 lines of dead CSS** (~35% of the stylesheet tree): `css/services.css`, `css/home.css`, `css/case-studies.css`, `css/contact.css` and `css/styles.faq.css` were referenced by zero pages after the practitioner-version strip in `9850c16`. `home.css` was additionally a stale duplicate of rules that also live in `styles.sections.css`. Roughly 700 further lines inside `styles.sections.css` serving deleted pages (`.testimonial-*`, `.contact-*`, `.process-*`, `.service-card`) also went.
- **The hero particle canvas.** `#heroCanvas` and its ~75-line driver in `js/main.js`: an uncapped `requestAnimationFrame` loop redrawing ~3,300 dots forever with no visibility pause, whose desktop gate was evaluated once at load so it never re-checked on resize, and which ignored `devicePixelRatio`. The blurred hero blobs, gradient washes, blueprint `.hero-glow` (already self-disabled whenever the canvas was present) and the full-page SVG noise overlay went with it.
- Dead rules in the live bundle: `.nav-cta` (no page rendered it), `.value-card::after` (declared `opacity: 0` with nothing ever setting it to 1), `.hero-availability-*`, `.cta-micro-proof*`, `.page-hero--compact`.
- **Every inline `style=` attribute in `src/`** — 41 across ten templates, including the two functional `display:none` hooks left on the homepage, now `.form-success` and `.form-honeypot`. A test fails the build if one comes back.
- `--white` from the token block (see Fixed).
- The hand-written root `sitemap.xml`, and its passthrough copy in `.eleventy.js`.


### Added

- New page: **Builds** at `builds.html` — an agentic-development portfolio surfacing the public repositories at `github.com/Noeinkan`, grouped by domain (Markets, Delivery, Games, Tools) with every build given identical treatment. Every claim on the page is written from the corresponding README rather than asserted. New `css/builds.css` extends the `.value-card` visual language; the page otherwise reuses `.page-hero`, `.stats` (including the existing `data-count` count-up), `.value-props`, `.credential-tag`, and `.capsar-banner` instead of adding global styles.
- `assets/builds/`, `scripts/optimize_screenshots.py`, and `docs/BUILDS_SCREENSHOTS.md` — the capture pipeline for the screenshots that fill each card's media slot. Slots ship in a deliberate blueprint-grid empty state with the 16:10 ratio already reserved, so images drop in later with no layout shift, and no page currently references a file that does not exist.
- GitHub is now a footer contact item on all 12 pages (EN + IT) and appears in the JSON-LD `sameAs` array on the homepage and About page in both languages. This is the first GitHub link anywhere on the site.
- `Builds` value card on the homepage grid, plus `Builds` in the top nav and footer Pages list across all 7 EN pages.

- **Builds page restructured by domain.** The two-tier layout (six "flagship" cards plus a compact "the other six" list) is gone: every build now gets the same card, the same media slot and the same amount of room, grouped into four domains — Markets, Delivery, Games and Tools — with a jump index above them. Grouping is by subject rather than by the repo-name prefix, so a W-prefixed browser game sits under Games rather than under work. The retired `.build-list*` rules were removed from `css/builds.css` and `scripts/tests/ui-ux.test.js` now fails if the markup reappears.
- **Builds coverage went from 12 repositories to 13.** Adds `H10_Voxel_CityBuilder` and `H11_Asterbloom`, both published since the page was written. `W9_ConnectingTheGrid` was added and then held back on request before publication; its card and capture are preserved and restoring it is a one-entry change. Drops `W9_MeetingMind`, which is a single `docs/PLAN.md` with one commit and no code — listing it as a shipped build overstated it.
- Card copy rewritten for all thirteen builds straight from each repo README, so the entries that were previously one line now say what the thing actually does.
- **First real screenshots.** `assets/builds/h11-asterbloom.png` (on the page) and `assets/builds/w9-connecting-the-grid.png` (held back with its card) were captured by driving each app with Playwright and running the output through `scripts/optimize_screenshots.py` (1200x750, the exact 16:10 slot). The remaining twelve cards stay in the deliberate empty state; `docs/BUILDS_SCREENSHOTS.md` records which are worth capturing, which need a real GPU, and which render client data that must not be published unredacted.

### Fixed

- **Build card headings were invisible.** `css/builds.css` was written against the pre-redesign dark theme and set `h3 { color: var(--white) }`. `--white` survived the Technical Light redesign as a literal `#ffffff` compatibility alias, so on the now-white cards the titles rendered white-on-white. Headings move to `var(--ink)`, orange text moves to `var(--accent-text)` (5.4:1) rather than the `--accent` fill (3.7:1, fails AA), and the empty-state blueprint grid moves off hardcoded `rgba(201, 165, 90, …)` gold onto `var(--accent-rgb)`.

- New interactive tool: **EIR Health Check** at `eir-checklist.html`. 12 questions across 4 sections on a 0–3 clarity scale, live /100 score, top-3 gap cards, full breakdown, and a print-friendly PDF export. Runs entirely client-side (no email, no gating) to match the privacy posture of the BEP Readiness Checklist. Cross-linked from `bep-checklist.html`, the Capsar comparison table, the homepage value cards, and the privacy page. Staged assets `js/eir-checklist.js` and `css/eir-checklist.css` were already in the repo; this ships the HTML wrapper that wires them together.

### Changed

- `deploy.sh` preflight `REQUIRED_FILES` now includes `builds.html`.
- `scripts/tests/ui-ux.test.js` gained `testBuildsPage()`, asserting the self-canonical, `hreflang=en`/`x-default` with no `hreflang=it`, the `#` lang-switcher, the `css/builds.css` link, the nav entry, at least 12 outbound repository links, `rel="noopener noreferrer"` on every one of them, and the `sitemap.xml` entry. `builds.html` was also added to the analytics-gating page list.

- Consolidated two duplicate EIR value cards on `index.html` (the prior "EIR clarity check" and "EIR health check" cards both pointed to the same page with different copy) into a single EIR Health Check card.
- EIR Health Check added to the top nav and footer Pages list on all 5 EN pages (Home, About, Capsar, BEP, Privacy).
- Privacy page now refers to the tool consistently as **EIR Health Check** (it previously mixed "EIR Clarity Check" and "EIR Health Check" across two mentions).
- Added `.eir-cross-link-wrap` style to `css/bep-checklist.css` (the wrapper container was used inline on both BEP and EIR pages with no rules — now it's a real class and the inline styles are gone).
- `deploy.sh` preflight `REQUIRED_FILES` now includes `eir-checklist.html` so a future breakage of the new page fails the preflight.

### Deferred

- Dashboard screenshots for the six flagship builds. The page is complete and publishable without them; `docs/BUILDS_SCREENSHOTS.md` documents the filename map, framing, and the two-line swap from empty slot to `<img>`.
- Italian mirror `it/builds.html`. Following the `eir-checklist.html` precedent, `builds.html` omits `hreflang="it"`, points its lang-switcher at `#`, and is deliberately absent from `scripts/tests/it-translation.test.js`. The IT nav, IT footer Pages list, and the IT homepage value grid are intentionally untouched and ship with the mirror.
- `builds.html` (root, live site) and `src/en/builds.njk` (in-progress Eleventy source) both exist and must be edited together until the Eleventy migration cuts over.

- Italian mirror `it/eir-checklist.html` — the lang-switcher on `eir-checklist.html` correctly points to `#` until the mirror exists (asserted by `scripts/tests/ui-ux.test.js`). The IT nav across the 5 IT pages, the IT value card, and the IT privacy page row for the EIR tool are intentionally not touched in this pass; they ship together with the IT mirror.

- Reorganised project root: long-form documentation moved to `docs/` (`DEPLOYMENT.md`, `PRODUCT_LANDING_PAGE.md`, `UI_UX_ANALYSIS.md`, `LOCALIZATION_IT_GLOSSARY.md`, `LOCALIZATION_IT_STYLE.md`, `LOCALIZATION_QA_CHECKLIST.md`); test runners moved to `scripts/tests/`; one-off Python build helpers (`convert_certs.py`, `optimize_headshot.py`) moved to `scripts/`. Cross-references and the CI workflow updated to match. `deploy.sh` excludes extended with `docs`, `scripts/tests`, `*.docx`, `*.py`, and `.venv` so none of the moved files reach the production server.
- `CLAUDE.md` updated to reflect the new layout and the practitioner-mode product state.

### Removed

- Deleted dead Cloudflare Pages config files (`_redirects`, `_headers`) that were never used by the Hetzner/Docker nginx runtime.
- Deleted duplicate `ISO19650_BEP_Readiness_Checklist_v2 (1).docx` from the project root (it was a working source, not a deployable asset).

### Added

- `PRICING.md` and `.venv/` now appear in `.gitignore` so the pricing rationale stays local and the Python virtualenv does not pollute the workspace.

### Added

- `PRODUCT_LANDING_PAGE.md` to document the product scope, user journeys, constraints, and operating rules for this repository.

### Changed

- Established a human-maintained changelog so future site and documentation updates have a stable release history outside raw git log output.

## [2026-05-15]

### Added

- Calendly booking widget support across Italian pages.
- A compact contact-page hero variant to reduce above-the-fold space usage.

### Fixed

- Increased Calendly widget height on contact pages for better visibility and usability.

## [2026-04-25]

### Added

- Contract-availability messaging on the Italian homepage and services pages.

### Changed

- Refined Italian copy on privacy and services pages for clarity and engagement.
- Localized location references for Italian pages.

### Fixed

- Corrected Italian about-page certificate asset paths.

## [2026-04-24]

### Fixed

- Standardized footer text across Italian pages.

## [2026-04-17]

### Added

- Interactive BEP Readiness Checklist with scoring and report-generation flow.
- Translation parity and English-leakage tests for the Italian mirror.
- Italian mirrors for the main marketing pages, including homepage, about, services, case studies, and Capsar.
- Recognition footnote updates on the about page in English and Italian.

### Changed

- Reverted an attempted broad structural refactor to preserve the working page setup.

### Fixed

- Final accent and content cleanup passes on Italian privacy and contact pages.

## [2026-04-16]

### Added

- Nginx configuration for the Noein Solutions landing page deployment.
- Initial repository documentation for the project.

### Changed

- Refined case studies and server configuration structure.

## [2026-04-15]

### Added

- Local preflight checks in `deploy.sh`.
- Lead magnet and checklist-download flow.
- Updated analytics identifiers across site pages.

### Fixed

- Privacy-policy link behavior.

## [2026-04-14]

### Added

- Multilingual support and language switcher across the site.
- Enhanced deployment script checks and homepage smoke-test coverage.
- Contact and analytics improvements across multiple pages.

### Changed

- Significant content, structure, typography, and responsive-layout refinements across the marketing pages.

## [2026-04-13]

### Added

- Major landing-page buildout for Noein Solutions, including service-card overview, service pricing sections, how-it-works content, credentials presentation, and supporting deployment/image tooling.
- About-page certificate cards and related visual treatment.

### Fixed

- Restored compatible headshot delivery after a WebP experiment.
- Added cache-busting query parameters for image assets.

## Maintenance Notes

- Add a new dated section for notable repository changes when work is ready to ship.
- Group minor commits into one user-readable summary rather than copying raw commit messages.
- Prefer `Added`, `Changed`, and `Fixed` headings unless another category is clearly useful.