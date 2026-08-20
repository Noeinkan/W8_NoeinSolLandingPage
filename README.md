# Noein Solutions — Landing Page

Static, multi-page marketing site for [noeinsolutions.com](https://noeinsolutions.com) — Andrea Aita's digital delivery consulting practice for the AEC industry, and the home of the **Capsar.io** SaaS product.

**Stack:** Plain HTML5 + vanilla CSS (custom properties) + vanilla ES5 IIFEs for interactivity. Google Fonts (`Archivo`, `DM Sans`, `IBM Plex Mono`). Hosted on Hetzner behind Docker nginx.

The deployed site is the hand-written `*.html` / `it/*.html` at the project root — no build step required to work on it. An Eleventy tree under `src/**/*.njk` builds the same pages into `_site/` and is being migrated toward; see the mid-migration note in [`CLAUDE.md`](./CLAUDE.md).

> **Looking for the deep dive?** [`CLAUDE.md`](./CLAUDE.md) is the canonical project brief — file tree, conventions, bilingual workflow, deploy, tests, analytics. This README covers only how to run the thing.

---

## Quick start

```bash
npm install    # once, for Eleventy (the root HTML site needs no dependencies)
npm start
```

Then open <http://localhost:8000/>. The server auto-opens the page on first run.

The site is bilingual (English at `/`, Italian under `/it/`):

- <http://localhost:8000/> — home
- <http://localhost:8000/it/> — home (IT)
- <http://localhost:8000/builds.html> — agentic-development portfolio
- <http://localhost:8000/bep-checklist.html> — BEP readiness diagnostic
- <http://localhost:8000/eir-checklist.html> — EIR clarity health check

### Options

```bash
npm start                      # http://localhost:8000 (auto-opens browser)
node dev-server.js 3000        # custom port
node dev-server.js --no-open   # don't open the browser
npm run build                  # Eleventy build of src/ → _site/
npm run build:serve            # Eleventy dev server against src/
```

The dev server serves the project root with Node built-ins only, disables HTTP caching so every reload picks up your latest edits, resolves `/foo` → `/foo.html` or `/foo/index.html`, and logs every request.

### Prefer auto-reload?

Swap in a third-party watcher — no project changes required:

```bash
npx --yes live-server --port=8000
```

---

## Pages

| EN | IT mirror |
|---|---|
| `index.html` — home | `it/index.html` |
| `about.html` — background and credentials | `it/about.html` |
| `capsar.html` — Capsar.io product page | `it/capsar.html` |
| `bep-checklist.html` — BEP readiness diagnostic | `it/bep-checklist.html` |
| `eir-checklist.html` — EIR clarity health check | *not yet shipped* |
| `builds.html` — agentic-development portfolio | *English-only by design* |
| `privacy.html` — privacy policy | `it/privacy.html` |

---

## Testing

```bash
npm test                  # structural regressions (ui-ux.test.js)
npm run test:it           # IT mirror completeness (it-translation.test.js)
npm run test:eir          # EIR Health Check runtime, jsdom (eir-smoke.test.js)
npm run test:all          # UI-UX + IT translation
bash deploy.sh --check    # link/href/canonical/title preflight
```

`eir-smoke.test.js` self-installs `jsdom` into `scripts/tests/smoke/node_modules/` on first run; that directory is gitignored.

---

## Deployment

Target: Hetzner VPS, Docker nginx at `/var/www/noeinsol/`.

```bash
bash deploy.sh            # Full deploy (preflight + sync + smoke test)
bash deploy.sh --check    # Preflight checks only (local validation)
bash deploy.sh --dry-run  # Preview files to sync
bash deploy.sh --setup    # First-time setup with verbose logging
```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full guide, server architecture, and rollback procedure.

---

## Documentation

| File | What it covers |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | **Start here.** File tree, conventions, bilingual workflow, deploy, tests, analytics. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Notable site and documentation changes. |
| [`docs/PRODUCT_LANDING_PAGE.md`](./docs/PRODUCT_LANDING_PAGE.md) | Product definition, audiences, user journeys, repo scope. |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Deployment guide and server architecture. |
| [`docs/LOCALIZATION_IT.md`](./docs/LOCALIZATION_IT.md) | EN↔IT terminology and the IT voice/style brief. |
| [`docs/REDESIGN_PLAN.md`](./docs/REDESIGN_PLAN.md) | "Technical Light" visual redesign — phases and current status. |
| [`docs/BUILDS_SCREENSHOTS.md`](./docs/BUILDS_SCREENSHOTS.md) | Capture guide for the Builds page dashboard screenshots. |

Internal-only documents are gitignored and never reach the deployed site or the public repo.

---

## License

Proprietary. © Andrea Aita / Noein Solutions.
