# Changelog

All notable repository changes should be recorded here.

This file was added on 2026-05-26. Entries before that date were backfilled from git history and grouped into readable release milestones rather than one line per commit.

## [Unreleased]

### Added

- New interactive tool: **EIR Health Check** at `eir-checklist.html`. 12 questions across 4 sections on a 0–3 clarity scale, live /100 score, top-3 gap cards, full breakdown, and a print-friendly PDF export. Runs entirely client-side (no email, no gating) to match the privacy posture of the BEP Readiness Checklist. Cross-linked from `bep-checklist.html`, the Capsar comparison table, the homepage value cards, and the privacy page. Staged assets `js/eir-checklist.js` and `css/eir-checklist.css` were already in the repo; this ships the HTML wrapper that wires them together.

### Changed

- Consolidated two duplicate EIR value cards on `index.html` (the prior "EIR clarity check" and "EIR health check" cards both pointed to the same page with different copy) into a single EIR Health Check card.
- EIR Health Check added to the top nav and footer Pages list on all 5 EN pages (Home, About, Capsar, BEP, Privacy).
- Privacy page now refers to the tool consistently as **EIR Health Check** (it previously mixed "EIR Clarity Check" and "EIR Health Check" across two mentions).
- Added `.eir-cross-link-wrap` style to `css/bep-checklist.css` (the wrapper container was used inline on both BEP and EIR pages with no rules — now it's a real class and the inline styles are gone).
- `deploy.sh` preflight `REQUIRED_FILES` now includes `eir-checklist.html` so a future breakage of the new page fails the preflight.

### Deferred

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