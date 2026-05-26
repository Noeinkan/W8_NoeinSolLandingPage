# Changelog

All notable repository changes should be recorded here.

This file was added on 2026-05-26. Entries before that date were backfilled from git history and grouped into readable release milestones rather than one line per commit.

## [Unreleased]

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