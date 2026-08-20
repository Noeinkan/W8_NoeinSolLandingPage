# Roadmap — technical consolidation

Ordered, checkable plan for closing the design and structural debt left by the "Technical Light"
redesign. Every action below is a checkbox: tick it when it is done and the milestone's
**Done when** command is green.

- **Scope:** technical consolidation only. Conversion, SEO and content work are out of this cycle.
- **Unit of work:** one milestone = one session of 2–3 hours, self-contained. Nothing here leaves
  the repo half-refactored between sessions.
- **Companion docs:** `REDESIGN_PLAN.md` is the *how* of the design (direction, tokens, decisions).
  This file is the *what, in which order, and is it done yet*.

Last updated: 2026-08-20.

---

## Why this exists

The site is functionally complete and green — 16 pages, business mode live, all three suites
passing, sitemap generated from the build. What is missing is **consistency**: Phase 4 of the
redesign was never closed, and the debt it left is now measurable.

| Evidence | Measured |
|---|---|
| Pages using the band system | **1 of 9** — only the EN homepage carries `.band--dark` |
| Pre-redesign alias tokens still in use | `bep-checklist.css` 61, `capsar.css` 39, `eir-checklist.css` 33, `about.css` 19, `builds.css` 13, `styles.utilities.css` 9 |
| Literal hex colours | 49 in `bep-checklist.css`, 49 in `eir-checklist.css` (whole rest of the repo: 25) |
| Ad-hoc border radii | 13× `12px`, 9× `8px`, 6× `10px`, 4× `14px` … against four `--r-*` tokens |
| CSS living in front matter | `privacy.njk` EN **and** IT carry ~60 lines in `inlineStyle`, on legacy tokens |
| Missing IT mirrors | Builds and EIR Health Check (7 IT pages against 9 EN) |
| Dead weight | `assets/Intro + AI Wizard.mp4` — 49 MB, referenced by nothing, copied into `_site/` on every build |
| Visual proof | 1 screenshot across 13 builds; `assets/builds/w9-connecting-the-grid.png` is an orphan |

None of this is a user-visible bug today: the alias block at `css/styles.base.css:99-106` keeps
everything rendering. The risk is drift. That is exactly how `--white` ended up painting white
text on a paper ground, and how the `.section-full` rule was deleted without anything noticing.

**Target state:** every page on one visual system, zero legacy aliases, zero CSS in front matter,
full EN/IT parity — and a guardrail behind each closed item so it cannot quietly reopen.

## Working rules

- **Guardrail-first.** The repo already works this way: `HEX_BUDGET` only goes down,
  `UNSTYLED_CLASSES` only gets shorter. A milestone is not closed until it tightens a budget or
  adds a check.
- **Merged passes.** Legacy tokens, radii and hex literals live in the same files as the design
  pass. They are fixed in **one pass per page**, not in three sweeps across the repo.
- **Bilingual.** Every EN content change is mirrored in IT — see the Bilingual Workflow section of
  `CLAUDE.md`.
- **Derived numbers stay derived.** Counts come from `src/_data/builds.js`. Never type one.

---

## M0 — Hygiene and weight

**1 session, ~1 h.** The cheapest win in the list, and zero risk.

- [ ] Delete `assets/Intro + AI Wizard.mp4` (49 MB; zero references in `src/`, `css/`, `js/` —
      verified). `.eleventy.js` passthrough-copies the whole `assets` folder, so it enters `_site/`
      on every build and `rsync` on every deploy.
- [ ] Resolve the orphan `assets/builds/w9-connecting-the-grid.png` — either add the W9 build to
      `src/_data/builds.js` with its `shot`, or delete the file. Do not leave it half-present.
- [ ] Verify `assets/og-image.jpg` really is 1200×630 as the head declares; re-crop if not.
- [ ] Fix the stale header comment in `.eleventy.js` — it says "12 static pages", there are 16.

**Done when:** `npm run check` green, and `bash deploy.sh --dry-run` no longer lists the video.

---

## M1 — Get `privacy` out of the front matter

**1 session, ~2 h.**

The privacy pages, EN and IT, carry a CSS blob in `inlineStyle`, rendered by `base.njk:31-35`. It
is the last pocket of stylesheet-shaped content written into the markup, and it runs on
pre-redesign tokens (`--text-primary`, `--bg-elevated`, `--border-subtle`) — which makes privacy
the one page still entirely on the old visual system.

- [ ] Extract the blob into `css/privacy.css`, declared as `"css": ["privacy.css"]` in the front
      matter of both pages.
- [ ] While moving it, port the rules onto current tokens (`--ink`, `--paper-sunk`, `--rule`).
- [ ] Drop `privacy-meta`, `privacy-table`, `privacy-table-wrap` from `UNSTYLED_CLASSES` in
      `scripts/tests/ui-ux.test.js` — the test fails on its own if they stay listed once they have
      rules, so the list updates under pressure.
- [ ] Add the guardrail: a check in `ui-ux.test.js` that fails if any front matter declares
      `inlineStyle`.
- [ ] Remove the now-unused `inlineStyle` branch from `src/_includes/base.njk`.

**Done when:** no occurrence of `inlineStyle` anywhere in `src/`, `npm run check` green.

---

## M2 — Per-page passes: design + tokens + radii + hex

**5 sessions, ~2–3 h each.** The body of the work. **One page per session**, and each session does
all four jobs on that page rather than deferring any of them:

1. Technical Light design pass — explicit bands (`.band`, `.band--sunk`, `.band--dark`), hairlines,
   mono labels, real hierarchy. Direction is already written in `REDESIGN_PLAN.md`.
2. Replace legacy aliases with direct tokens (`--text-primary` → `--ink`, and so on).
3. Collapse ad-hoc radii onto the four `--r-*` tokens.
4. Cut literal hex colours and lower that file's entry in `HEX_BUDGET`.

Reuse `sectionHead` and `stat` from `src/_includes/macros/blocks.njk`. If a block reaches its third
hand-written copy, it becomes a macro — that is the repo's rule.

Order runs lightest to heaviest, so the first sessions calibrate the pace.

### M2.1 — Builds · `builds.css` (218 lines, 13 aliases, 2 hex)
- [ ] Design pass
- [ ] Legacy aliases → direct tokens
- [ ] Radii → `--r-*`
- [ ] `HEX_BUDGET['builds.css']` lowered

### M2.2 — About · `about.css` (485 lines, 19 aliases, 0 hex)
- [ ] Design pass
- [ ] Legacy aliases → direct tokens
- [ ] Radii → `--r-*`
- [ ] Clean `styles.utilities.css` (9 aliases) in whichever session touches it first

### M2.3 — Capsar · `capsar.css` (530 lines, 39 aliases, 5 hex)
- [ ] Design pass
- [ ] Legacy aliases → direct tokens
- [ ] Radii → `--r-*`
- [ ] `HEX_BUDGET['capsar.css']` lowered

### M2.4 — BEP checklist · `bep-checklist.css` (807 lines, 61 aliases, 49 hex)
- [ ] Design pass
- [ ] Legacy aliases → direct tokens
- [ ] Radii → `--r-*`
- [ ] `HEX_BUDGET['bep-checklist.css']` lowered

### M2.5 — EIR Health Check · `eir-checklist.css` (520 lines, 33 aliases, 49 hex)
Shares the `.bep-*` scaffolding with M2.4 — run it straight after, and most of the work is
inherited.
- [ ] Design pass
- [ ] Legacy aliases → direct tokens
- [ ] Radii → `--r-*`
- [ ] `HEX_BUDGET['eir-checklist.css']` lowered

**Done when, per page:** zero legacy aliases in its stylesheet, `HEX_BUDGET` entry lowered,
`npm run check` green, and a visual check via `npm start` at desktop and mobile widths. For the two
checklists, `node scripts/tests/smoke/eir-smoke.test.js` as well.

---

## M3 — Delete the aliases and close the door

**1 session, ~1 h.** Only after M2 is complete.

- [ ] Delete the alias block at `css/styles.base.css:99-106`.
- [ ] Add `LEGACY_TOKEN_BUDGET` to `ui-ux.test.js`, modelled on `HEX_BUDGET` — starts at zero and
      can only go down. A reintroduced `var(--text-primary)` fails the build.

**Done when:** `grep -rn "var(--text-primary\|--bg-elevated\|--border-subtle" css/` returns nothing,
`npm run check` green.

---

## M4 — IT parity

**2 sessions, ~3 h each.** After M2, so no markup is translated that is about to change.

### M4.1 — Italian Builds mirror
- [ ] Translate the page, voice `io` + `tu`, terminology per `docs/LOCALIZATION_IT.md`
- [ ] Prose counts read from `src/_data/builds.js` (`total`, `totalWord`, `shots`) — never typed.
      If `totalWord` only produces English number words, extend it rather than working around it
- [ ] Anchor IDs and JS-referenced IDs left identical to EN
- [ ] Set `hasMirror: true` on the EN Builds page

### M4.2 — Italian EIR Health Check mirror
- [ ] Translate the page
- [ ] Handle the diagnostic strings in `js/eir-checklist.js` — check how the BEP checklist solved
      the same problem and follow that route
- [ ] Set `hasMirror: true` on the EN EIR page
- [ ] `node scripts/tests/smoke/eir-smoke.test.js` still green

**Done when:** `node scripts/tests/it-translation.test.js` green across 9 pairs instead of 7, plus a
self-check against the pre-commit checklist in `LOCALIZATION_IT.md` — the test does not catch voice.

---

## M5 — Visual proof

**2 sessions, ~2 h each.** The conversion gap the redesign already identified: 11 builds have an
interface, 1 has a screenshot.

- [ ] Capture the missing screenshots per `docs/BUILDS_SCREENSHOTS.md`. The repos are already
      checked out locally under `Downloads/` and can be driven with Playwright
- [ ] Add each `shot` to `src/_data/builds.js` — the derived stats follow on their own
- [ ] Confirm every remaining empty slot is a genuine `noUi: true` build (currently
      `W4_AgenticSupplyChain`, `H9_Voice_Transcriber`), not an unfilled one

**Done when:** `builds.shots` has risen, every remaining empty slot is `noUi`, `npm run check`
green.

---

## Watch list — not scheduled here

- **Dead CSS rules.** `styles.sections.css` is at 820 lines and the test suite covers markup→CSS,
  not CSS→markup: no guardrail catches a rule nothing uses any more. A sweep is warranted but needs
  manual page-by-page verification, so it is not planned as a timed milestone.
- **Conversion events.** `track()` exists at `js/main.js:388` and is barely used, so which page
  produces a booking is not measurable. That is conversion work, not consolidation — next cycle.

---

## Verification, every milestone

```bash
npm run check                               # build + ui-ux + it-translation + eir smoke
bash deploy.sh --check                      # link/href/canonical/title preflight
npm start                                   # visual check on localhost, desktop and mobile
```

Before the first deploy after M2: contrast ≥4.5:1 on text and buttons, focus rings visible against
the paper ground, `prefers-reduced-motion` still honoured.
