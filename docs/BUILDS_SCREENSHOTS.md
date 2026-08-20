# Builds page — screenshot capture guide

`builds.html` ships most cards in their **empty media state**: a
blueprint-grid panel with the primary stack name. That state is deliberate, not
a placeholder bug — the page is complete and publishable without a single
screenshot. This guide covers turning those panels into real dashboard images.

> **Never reference an image that does not exist yet.** `deploy.sh --check`
> hard-errors on any unresolvable local `src`, and `scripts/tests/ui-ux.test.js`
> asserts the same. Add the `<img>` only after the file is on disk.

## Filename map

Drop captures into `assets/builds/` using these exact slugs:

| Repository | Filename | Status | What actually sells this build |
|---|---|---|---|
| `W9_ConnectingTheGrid` | `w9-connecting-the-grid.png` | **Held back** | Captured and optimised, but pulled from the page on request (2026-08-20). The file stays in `assets/builds/` so restoring the card is a data-table edit, not a re-capture |
| `H11_Asterbloom` | `h11-asterbloom.png` | **Done** | A seeded asteroid with a grown fractal tree and seedlings in orbit. Cropped to ~50% of the captured frame: at full extent the starfield is mostly empty and the tile reads as a black rectangle |
| `H10_Voxel_CityBuilder` | `h10-voxel-city.png` | Todo | The isometric city at mid-growth. Needs a real GPU — headless Chromium stalls at "Preparing the city…" |
| `F2_SearchForAlpha_lab` | `f2-search-for-alpha.png` | Todo | The Dash terminal with an equity curve and signal overlays, ideally the optimiser panel in frame |
| `F8_F13Screener` | `f8-f13-screener.png` | Todo | The React holdings view showing a position change that triggered an alert |
| `F9_CongressTrading` | `f9-congress-trading.png` | Todo | The KPI row plus the monthly activity timeline — the "unreadable PDFs became queryable" payoff |
| `W4_AgenticSupplyChain` | `w4-agentic-supply-chain.png` | Todo | The human-approval gate — a proposed reroute awaiting sign-off, Monte Carlo spread visible |
| `W5_JobAlertBot` | `w5-job-alert-bot.png` | Todo | The source-quality funnel or relevance scatter — the analytics, not the job table |
| `W5_Mindmap` | `w5-mindmap.png` | Todo | The D3 force layout mid-drag, with typed nodes legible |
| `W6_DCWizard` | `w6-dc-wizard.png` | Todo | The compliance report — naming pass/fail against the MIDP coverage summary |
| `W7_ZoningVisualiser` | `w7-zoning-visualiser.png` | Todo | The choropleth at England scale with constraint layers on; probably the most striking of the thirteen |
| `H2_TimeBlock_Planner` | `h2-timeblock-planner.png` | Todo | A full day laid out on the grid, MITs and capture inbox visible |
| `W8_NoeinSolLandingPage` | — | Skip | The site is already the thing you are looking at |
| `H9_Voice_Transcriber` | — | Skip | CLI only; no interface worth showing |
Every build has a media slot &mdash; there is no second tier. Two captures exist;
one is on the page, and `w9-connecting-the-grid.png` is held back with its card.

## Capture settings

- **Aspect ratio 16:10.** Cards crop with `object-fit: cover` anchored to the
  top, so anything critical belongs in the upper two-thirds.
- **Capture at 2400×1500** (or any 16:10 at ≥1200px wide) — the optimiser
  downsamples to 1200px.
- **Dark UI preferred** where the app supports it; the page is a dark theme and
  a bright white dashboard will glare against it.
- **Keep PNG** for anything with UI text. The optimiser only re-encodes
  `.jpg`/`.jpeg` as progressive JPEG.
- Hide OS chrome, browser tabs, bookmark bars, and notification toasts.

## After capturing

```bash
python scripts/optimize_screenshots.py   # resize + compress in place
```

Then swap the empty panel for the real image in **both** `builds.html` and
`src/en/builds.njk` — the root file is the live site, the `.njk` is the
Eleventy source, and they must not drift.

Replace:

```html
<div class="build-card-media build-card-media--empty" aria-hidden="true">
  <span class="build-card-glyph">Python</span>
</div>
```

with:

```html
<div class="build-card-media">
  <img src="assets/builds/w4-agentic-supply-chain.png"
       alt="Agentic Supply-Chain Orchestrator — approval queue showing a proposed supplier reroute"
       loading="lazy" width="1200" height="750">
</div>
```

The `alt` text should describe what the dashboard *shows*, not that it is a
screenshot. Width/height must match the optimised file so no layout shift
occurs — the slot already reserves the 16:10 box, so a correct pair is
invisible to the reader and a wrong pair is not.

## Verify

```bash
node scripts/tests/ui-ux.test.js
bash deploy.sh --check
```

## Automated capture

Use the shared runner rather than writing a one-off Playwright script:
`C:\Personal_utilities\screenshot-kit\` — its `SKILL.md` is the brief to hand
an agent working inside the build's own repo. Drop a `shotkit.config.mjs` in
that repo, run `node C:/Personal_utilities/screenshot-kit/shotkit.mjs --serve`,
and pick the best frame out of `.shots/`. It captures at 1440x900 (16:10) at 2x,
blocks every external request by default, and can mask elements that carry real
data &mdash; which is what makes it usable on the two repos flagged below.

The two completed shots were taken by driving the real app with Playwright
(Chromium is already cached under `~/AppData/Local/ms-playwright`). The pattern:
launch, load the local dev server, drive the UI into a state worth showing, then
screenshot at 1440x900 with `deviceScaleFactor: 2` and run the result through
`scripts/optimize_screenshots.py`, which resizes to the 1200x750 slot.

What worked and what did not:

- **Static/DOM apps capture cleanly.** `W9_ConnectingTheGrid` needed no server at
  all and was driven to a finished game by clicking its chevron buttons.
- **Canvas/WebGL is harder.** Asterbloom rendered under SwiftShader but slowly;
  the voxel engine never got past "Preparing the city…" headless, and a headed
  browser was closed by the sandbox. Capture that one manually.
- **Anything needing credentials or client data was deliberately not run.** See
  the note below.

## Before publishing any dashboard capture

Several of these render real data. `W5_JobAlertBot` shows live job searches and
CV-matching output; `W6_DCWizard` shows client project files from ACC. Screenshots
of those are not covered by "the repos are all mine to publish" — the code is
yours, the data in frame may not be. Seed them with synthetic data, or crop and
redact, before anything goes on a public page.
