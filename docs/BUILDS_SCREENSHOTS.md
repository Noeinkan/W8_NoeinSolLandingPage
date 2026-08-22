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
| `H10_Voxel_CityBuilder` | `h10-voxel-city.jpg` **+3** | **Done** | Four frames: the grown city on its island, then the neon theme, the biome map and the debug overlay &mdash; the set shows the engine, not just the game. Captured headless after all &mdash; SwiftShader renders it, it just needs ~60s of simulated growth first |
| `F2_SearchForAlpha_lab` | `f2-search-for-alpha.jpg` **+3** | **Done** | Four frames: a finished BB Breakout backtest, the terminal with its indicator panes, the optimiser leaderboard and the fundamentals table. Three more good frames are still in that repo's `.shots/` |
| `F8_F13Screener` | `f8-f13-screener.jpg` **+3** | **Done** | Four frames: the database status view, an NVDA holdings search across every tracked fund, the cross-fund consensus chart and one fund's workspace. The sidebar prints the absolute path of the local DuckDB &mdash; the config strips those two lines before every shot |
| `F9_CongressTrading` | `f9-congress-trading.jpg` **+2** | **Done** | Three frames: the active slice KPI row, committee relevance per member, and a ticker's trade history with return since disclosure. `/executive` renders an empty state on this data build &mdash; do not shoot it without checking |
| `W4_AgenticSupplyChain` | `w4-agentic-supply-chain.jpg` **+3** | **Done** | Four frames: the supplier network and disruption feed, the human-approval gate mid-pipeline, the governance audit trail and the ESG leaderboard. This repo was on the `noUi` list until the capture run found the dashboard |
| `W5_JobAlertBot` | `w5-job-alert-bot.png` | **Held** | Runnable, deliberately not shipped: `data/jobs.db` holds 553 live listings and `data/profile.json` is a real CV, and a capture of it publishes Andrea's own job search on his consulting site. If it goes on the page, capture the aggregate views only |
| `W5_Mindmap` | `w5-mindmap.jpg` | **Done** | The D3 force layout over a graph extracted from `samples/client-kickoff.txt`, an invented meeting written for this. Needs a local Ollama model &mdash; see that repo's `shotkit.config.mjs` for which of the installed ones actually returns a usable graph |
| `W6_DCWizard` | `w6-dc-wizard.png` | **Blocked** | Needs two-legged ACC OAuth credentials, and everything it would show is client project files. Seed it against a synthetic ACC project before capturing |
| `W7_ZoningVisualiser` | `w7-zoning-visualiser.jpg` | **Done, partial** | The what-if calculator over inner London: constraints switched off, premium falling from 13.8&ndash;32.1% to 4.7&ndash;11%. **Not** the England-scale choropleth &mdash; that needs the pipeline run and PMTiles on R2 (`NEXT_PUBLIC_PMTILES_URL`); without it the app falls back to a twenty-MSOA sample. Worth re-capturing once the tiles exist |
| `H2_TimeBlock_Planner` | `h2-timeblock-planner.jpg` | **Done** | A seeded day on the grid with MITs, capture inbox and notes. The database starts empty; run `node scripts/seed-demo-day.mjs` in that repo first &mdash; it writes an invented day so no real planning is in frame |
| `W8_NoeinSolLandingPage` | — | Skip | The site is already the thing you are looking at |
| `H9_Voice_Transcriber` | — | Skip | CLI only; no interface worth showing |
Every build has a media slot &mdash; there is no second tier. Twenty-four
captures exist across ten builds; twenty-three are on the page, and
`w9-connecting-the-grid.png` is held back with its card. Four slots are still
empty: two by decision (`W5_JobAlertBot`, `W8_NoeinSolLandingPage`), one blocked
on credentials (`W6_DCWizard`), and one genuinely `noUi` (`H9_Voice_Transcriber`).

Each **Done** repo now carries its own `shotkit.config.mjs`, so a re-capture is
`node C:/Personal_utilities/screenshot-kit/shotkit.mjs` in that repo rather than
a fresh reconstruction of how the app boots. The header comment in each one
records what broke the first time &mdash; the ports, the waits, the hosts that
have to be allowed, and what has to be seeded first.

A build can carry more than one frame. Where it does, the card cross-fades
through them &mdash; see *Rotating frames* below. Four frames is the working
maximum: past that the later ones are never seen, and each one is weight.

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

Then add a `shots` array to that build's entry in `src/_data/builds.js` and
rebuild. There is no markup to edit: `src/en/builds.njk` branches on `b.shots`,
so a build with frames gets the `<img>` stack and one without keeps the empty
panel.

```js
{
  slug: 'w7-zoning-visualiser', repo: 'W7_ZoningVisualiser',
  // ...
  stack: ['TypeScript', 'PMTiles', 'Python', 'OLS regression'],
  shots: [
    { file: 'w7-zoning-visualiser.jpg', alt: 'Planning-constraint choropleth over England with green belt and conservation layers on' },
    { file: 'w7-zoning-visualiser-counterfactual.jpg', alt: 'The what-if calculator with a constraint switched off, showing the estimated planning premium' }
  ]
}
```

Each `alt` should describe what that frame *shows*, not that it is a screenshot.
`width`/`height` are hardcoded to 1200x750 in the template, which is what
`optimize_screenshots.py` produces — so a capture that is not 16:10 will
letterbox or stretch. That is the one thing the tests cannot catch for you.

## Rotating frames

A build with more than one frame cross-fades through them, about every four
seconds. The behaviour is in `js/main.js` and the styling in `css/builds.css`;
what matters when you are *adding* frames:

- **The first frame is the one that ships without JavaScript.** It is the only
  one with a `src` in the markup — the rest carry `data-src` and are fetched
  when the card first scrolls into view. So put the strongest frame first, and
  do not assume anyone will see frame four.
- **Order them as a sequence, not a pile.** The set reads as an argument about
  what the build does; the neon/biome/debug run on the voxel card says "this is
  an engine, not a game" in a way one frame could not.
- **Frames must be visually distinct.** Two views of the same screen with a
  different filter applied read as a rendering glitch, not as a rotation.
- Auto-rotating content is a real accessibility hazard, so the page does what
  the research asks: nothing rotates under `prefers-reduced-motion`, a card
  stops while hovered and stops for good once it has held keyboard focus, and
  one control above the grid stops every card (WCAG 2.2.2). If you touch this,
  keep all four — the [WAI-ARIA APG carousel pattern][apg] is the reference.

[apg]: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/

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

The shots were taken by driving the real app with Playwright (Chromium is
already cached under `~/AppData/Local/ms-playwright`). The pattern: launch, load
the local dev server, drive the UI into a state worth showing, then screenshot at
1440x900 with `deviceScaleFactor: 2` and run the result through
`scripts/optimize_screenshots.py`, which resizes to the 1200x750 slot. The dense
dashboards ship as JPEG rather than PNG: at 1200px wide a dark dashboard PNG runs
past 500KB, and a card rotating four of them would carry 2MB.

What worked and what did not:

- **Static/DOM apps capture cleanly.** `W9_ConnectingTheGrid` needed no server at
  all and was driven to a finished game by clicking its chevron buttons.
- **Canvas/WebGL is slow, not impossible.** Asterbloom and the voxel engine both
  render headless under SwiftShader. The voxel engine was the one written off as
  needing a real GPU; it did not &mdash; it needed a seeder that drives the
  onboarding and then lets the simulation run ~60s before the frame is worth
  taking. `--headed` remains the escape hatch if a canvas genuinely refuses.
- **`noUi` needs checking against the repo, not against memory.**
  `W4_AgenticSupplyChain` sat on the no-interface list while its own repo held a
  React dashboard and a working `shotkit.config.mjs`.
- **An empty database screenshots perfectly happily.** `H2_TimeBlock_Planner`
  starts with no blocks at all, so the first capture was a blank grid. Write the
  seeder into the app's own repo (`scripts/seed-demo-day.mjs`), invent the
  content, and the shot is repeatable rather than a one-off state.
- **Blocked hosts fail silently as blank areas.** The planning visualiser's
  basemap comes from `tiles-a` through `tiles-d.basemaps.cartocdn.com`, not from
  the style host: allowing the style alone gives a black rectangle that still
  screenshots without an error.
- **Skeleton rows outlast any timeout you would guess.** The 13F screener's
  cross-fund views take tens of seconds over a million rows; wait on the
  skeletons disappearing, not on a fixed `settleMs`.
- **Anything needing credentials or client data was deliberately not run.** See
  the note below.

## Before publishing any dashboard capture

Several of these render real data. `W5_JobAlertBot` shows live job searches and
CV-matching output; `W6_DCWizard` shows client project files from ACC. Screenshots
of those are not covered by "the repos are all mine to publish" — the code is
yours, the data in frame may not be. Seed them with synthetic data, or crop and
redact, before anything goes on a public page.

Both are still empty on the page for that reason. `W5_JobAlertBot` runs fine and
would screenshot well, but its database is a real job search and its
`profile.json` is a real CV: publishing that on a consulting site says something
about the consultant that the card's blurb does not. If it ever ships, capture
the aggregate views — source funnel, relevance distribution — not the job table.

Three kinds of thing turned out to need this treatment, and only one of them was
obvious. Client data, yes. But also **local filesystem paths** — the 13F screener
prints `C:\Users\<name>\…` in its sidebar on every page, which is why that repo's
config strips those two lines before each shot — and **the fact of the search
itself**, which is what holds `W5_JobAlertBot` back rather than anything visible
in a single frame.
