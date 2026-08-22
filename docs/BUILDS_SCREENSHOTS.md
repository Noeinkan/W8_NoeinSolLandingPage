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
Every build has a media slot &mdash; there is no second tier. Ten captures exist
across four builds; nine are on the page, and `w9-connecting-the-grid.png` is
held back with its card.

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

The two completed shots were taken by driving the real app with Playwright
(Chromium is already cached under `~/AppData/Local/ms-playwright`). The pattern:
launch, load the local dev server, drive the UI into a state worth showing, then
screenshot at 1440x900 with `deviceScaleFactor: 2` and run the result through
`scripts/optimize_screenshots.py`, which resizes to the 1200x750 slot.

What worked and what did not:

- **Static/DOM apps capture cleanly.** `W9_ConnectingTheGrid` needed no server at
  all and was driven to a finished game by clicking its chevron buttons.
- **Canvas/WebGL is slow, not impossible.** Asterbloom and the voxel engine both
  render headless under SwiftShader. The voxel engine was the one written off as
  needing a real GPU; it did not &mdash; it needed a seeder that drives the
  onboarding and then lets the simulation run ~60s before the frame is worth
  taking. `--headed` remains the escape hatch if a canvas genuinely refuses.
- **Anything needing credentials or client data was deliberately not run.** See
  the note below.

## Before publishing any dashboard capture

Several of these render real data. `W5_JobAlertBot` shows live job searches and
CV-matching output; `W6_DCWizard` shows client project files from ACC. Screenshots
of those are not covered by "the repos are all mine to publish" — the code is
yours, the data in frame may not be. Seed them with synthetic data, or crop and
redact, before anything goes on a public page.
