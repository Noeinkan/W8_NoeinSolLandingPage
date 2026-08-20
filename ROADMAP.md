# Roadmap — technical consolidation

Ordered, checkable plan for closing the design and structural debt left by the "Technical Light"
redesign. Every action below is a checkbox: tick it when it is done and the milestone's
**Done when** command is green.

- **Scope:** technical consolidation only. Conversion, SEO and content work are out of this cycle.
- **Unit of work:** one milestone = one session of 2–3 hours, self-contained. Nothing here leaves
  the repo half-refactored between sessions.
- **Companion docs:** none — the design direction now lives in this file, under *Design direction*
  below, and the token and convention reference is the Key Conventions section of `CLAUDE.md`.

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

## Already landed

Baseline, so this file records what the repo has *achieved* and not only what it owes. Each line
is verifiable in `CHANGELOG.md` or by a command; none of it is scheduled work.

**Build and structure**
- [x] Eleventy migration — `src/` is the single source of truth, the vestigial root `*.html`
      copies are gone, `_site/` is what deploys
- [x] Generated sitemap — `src/sitemap.njk` iterates the pages Eleventy built, so a page cannot
      be live and unlisted
- [x] `npm run check` — build plus all three suites in one command
- [x] Shared chrome single-sourced: `base.njk`, `partials/`, `_data/nav.js`
- [x] `macros/blocks.njk` — `sectionHead` replaced 51 hand-written copies, `stat` replaced 12
- [x] Page numbers derived from `src/_data/builds.js`, never typed

**Design system**
- [x] Redesign Phase 0 — ground cleared: particle canvas, blobs, noise overlay, gold accent gone
- [x] Redesign Phase 1 — paper/ink/orange tokens and the fluid `--step-*` scale
- [x] Redesign Phase 2 — homepage rebuilt, the one page carrying `.band--dark`
- [x] 2,874 lines of dead CSS removed
- [x] Every inline `style=` attribute removed from `src/`
- [x] `--white` deleted and the seven rules painting white text on paper fixed

**Guardrails** — each written against a failure the repo had already shipped
- [x] Seven source-hygiene checks in `ui-ux.test.js` (inline styles, unstyled classes, undeclared
      tokens, front-matter assets, nav hrefs, hex budget, sitemap coverage)
- [x] `testBookingRoutes` — booking routes cannot vanish silently again
- [x] `it-translation.test.js` — EN leakage, find/replace scars, accents, structural parity
- [x] `eir-smoke.test.js` — EIR Health Check runtime under jsdom

**Content and commercial**
- [x] Business mode restored — 16 pages, services and contact back in both languages
- [x] Booking on every selling page, gated per page, degrading to a plain link when blocked
- [x] Positioning moved to the intersection
- [x] IT localisation — 7 mirrors plus terminology and voice brief
- [x] Documentation rationalised, 11 files to 7, `CLAUDE.md` as source of truth

### Site mode — the commercial relaunch is done

The site ran in **practitioner mode** between 2026-06-11 and the relaunch: `services`, `case-studies`
and `contact` stripped in both languages, Calendly and the brief form removed, `_redirects` sending
the dead slugs to `index` / `about`. That phase is closed — `main` is commercial again, services and
contact are live EN + IT, booking is back on every selling page, `_redirects` is deleted, and the
sitemap is generated from the build rather than hand-listed. Nothing on the practitioner branch is
scheduled to return.

What the strip left behind, and why it stays: the pre-strip commercial state is frozen at `94612c0`
on `pre-leave/commercial-snapshot` and tag `production-commercial-2026-06-11`; the practitioner state
in production is `9850c16`, tag `production-practitioner-2026-06-11`. Those are the only two points a
`deploy.sh` rollback can aim at — see the watch-list item below, since the script has no undo of its
own. `revamp-site` and `pre-leave/strip-to-practitioner` are superseded copies of the same two
commits.

One item outlives the relaunch: **no "Ltd" anywhere in `src/`** until the company is actually
incorporated. It is absent today and `grep -rn "\bLtd\b" src/` is the check. When incorporation
happens, the company name and number belong in the footer and in both privacy pages — content work,
not consolidation, so it is on the watch list rather than in a milestone.

---

## M0 — Hygiene and weight

**1 session, ~1 h.** The cheapest win in the list, and zero risk.

- [x] Delete `assets/Intro + AI Wizard.mp4` (50 MB; zero references in `src/`, `css/`, `js/`).
      `.eleventy.js` passthrough-copies the whole `assets` folder, so it entered `_site/` on every
      build and `rsync` on every deploy. Still in git history if it is ever wanted back.
- [x] Delete `nginx.conf` — three overlapping nginx configs existed. `deploy/templates/noeinsol.conf`
      is the one `deploy.sh` installs and `landing-block.conf` is the human-readable mirror
      `DEPLOYMENT.md` points at; the root copy was last touched in April, predates the current
      pipeline, and was referenced only by the stale Cursor index.
- [x] `.cursor/rules/project.mdc` and `project-index.mdc` reduced to pointer stubs. Both carried
      `alwaysApply: true` while describing HTML pages at the repo root, a single ~2,400-line
      stylesheet and "no build step" — so every Cursor session started from a description of a
      repo that stopped existing at the Eleventy migration.
- [ ] Verify `assets/og-image.jpg` really is 1200×630 as the head declares; re-crop if not.
- [ ] Fix the stale header comment in `.eleventy.js` — it says "12 static pages", there are 16.
- [x] Delete `docs/PRE_LEAVE_LONG_TERM_PLAN.md` — the practitioner/commercial plan it carried is
      finished (see *Site mode* above), and it described a repo that no longer exists: `_redirects`,
      root-level `ui-ux.test.js` / `it-translation.test.js`, `.cursor/plans/`. Its two facts that
      still matter — the rollback tags and the Ltd rule — moved into this file. It was gitignored, so
      it is **not** recoverable from git history.
- [ ] Prune the superseded branches once the archive refs are confirmed on `origin`:
      `revamp-site` and `pre-leave/strip-to-practitioner` are duplicates of commits that two tags
      already pin. Keep `pre-leave/commercial-snapshot` and both `production-*` tags.

`assets/builds/w9-connecting-the-grid.png` looks orphaned and **is not**. `BUILDS_SCREENSHOTS.md`
records it as held back on purpose: the W9 card was pulled from the page on request, and the
capture stays so restoring it is a data-table edit rather than a re-capture. Leave it alone.

Cross-document links broke when this roadmap moved from `docs/` to the repo root, and nothing
caught it — the preflight validates hrefs in built HTML, not links between markdown files:

- [x] Point `CLAUDE.md` at `ROADMAP.md` instead of `docs/ROADMAP.md` — two places, the file tree
      and the Documentation list.
- [x] Fix the two dead links in `docs/REDESIGN_PLAN.md`: both resolved relative to `docs/` and
      needed `../`. The link to `CLAUDE.md` had been broken since before the move. (That file has
      since been deleted — see below — but the fix is what proved the class of failure was real.)
- [x] Delete `docs/REDESIGN_PLAN.md`. Phases 0–2 were done, and everything it still had to say was
      either already true in the code (the token block it specified *is* `css/styles.base.css`), or
      duplicated by this file (its Phase 4 order vs. M2), or describing a repo that no longer exists
      — root `index.html`, a hand-written `it/index.html`, a "dual tree", `assets/builds/` holding
      only `.gitkeep`, line references into files rewritten since. Its direction moved to
      *Design direction* below; the three deferred decisions are resolved and recorded there.
- [x] Close the "open Phase 3 defect" it carried — **it was not a defect.** The plan flagged the
      wordmark at [src/_includes/partials/nav.njk:2](src/_includes/partials/nav.njk#L2) as broken
      for lacking `{{ prefix }}`, because on IT pages it resolves to `/it/index.html`. That is the
      Italian homepage, and it is the correct target: every one of the six nav links beside it is
      relative in exactly the same way and stays inside `/it/`. Adding `{{ prefix }}` would send an
      Italian reader to the *English* homepage from a click on the logo — which is what
      `.lang-switch` is for, and it is the only link in that nav that correctly uses `../`.
- [ ] Add the guardrail: a check that every markdown link to a `.md` file resolves, relative to
      the linking file. A dozen lines, and it makes this class of failure impossible. It must skip
      links inside backticks, or the examples in this very section fail it.

**Done when:** `npm run check` green, `bash deploy.sh --dry-run` no longer lists the video, and
the new markdown-link check passes across `*.md` and `docs/*.md`.

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

## Design direction — "Technical Light"

What M2 is actually applying. The token layer already exists (`css/styles.base.css`) and the
homepage is the built reference — read it before restyling anything. This section is the intent
behind those tokens, which the code cannot state on its own.

**The direction.** Warm paper ground, Swiss grid with visible hairline rules like a drawing sheet,
mono type for stats and metadata, oversized grotesk headlines, and full-bleed **dark bands** for
product moments. It replaced a dark "premium consultant" theme with a gold accent, Instrument Serif
headlines, a particle canvas and a noise overlay — atmospheric, but it signalled luxury where the
thing being sold is rigorous ISO 19650 tooling. Signal orange is AEC-native and distinctive in a
category where nearly every competitor is blue. The goal is *precise and engineered*, not premium.

**What a page pass changes, concretely:**

- **Bands, not zebra striping.** Each section opts in with `.band` / `.band--sunk` / `.band--dark`.
  The old `main > section:nth-child(even)` rule was driven by a mix of `<section>` and `<div>`
  children, so any reorder silently inverted the stripe. Only the homepage carries `.band--dark`
  today — a page with no product moment does not need one, but a page with one should use it.
- **Rules and tint carry the structure, not shadows.** A light ground needs almost no shadow.
- **Small radii are the point.** Most surfaces are square (`--r-sm: 2px`, `--r-md: 4px`); anything
  rounder is a leftover from the old theme, which is why job 3 below exists.
- **Mono for the technical register** — section eyebrows, stat numerals, metadata, nav index
  numbers. This is the cheapest signal that the page was made by a practitioner.
- **Hierarchy has to be built, not implied.** The failure being corrected was rows of identical
  cards with nothing directing the eye: five equal `.value-card`s in a `repeat(3, 1fr)` grid, four
  equal stats, four equal trust cards. Give one element the weight.
- **Buttons are orange fill + near-black ink text** (5.53:1). White on `--accent` is 3.68:1 and
  fails AA. Orange *text* on paper is `--accent-text`.
- **Show the product.** The single biggest conversion gap was that a site selling Capsar and two
  diagnostics contained zero pictures of any of them. The homepage dark band fills this with a
  scaled HTML/CSS replica of the checklist UI; M5 adds real screenshots.

**The three decisions the plan deferred are now settled:** hero copy was rewritten buyer-framed
("Ten years fixing delivery. Now I build the software that does it."); the dark band shipped as an
HTML replica rather than a screenshot, with real captures scheduled as M5; and Instrument Serif does
**not** return as a pull-quote face — no rule references it anywhere in `css/`.

---

## M2 — Per-page passes: design + tokens + radii + hex

**5 sessions, ~2–3 h each.** The body of the work. **One page per session**, and each session does
all four jobs on that page rather than deferring any of them:

1. Technical Light design pass — explicit bands (`.band`, `.band--sunk`, `.band--dark`), hairlines,
   mono labels, real hierarchy. Direction is in *Design direction* above.
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
- **No undo on deploy.** `deploy.sh` overwrites the server with `rsync` and there is no automatic
  rollback: recovering means checking out an older commit and redeploying, which needs git to be
  available and the right tag to exist. Today exactly two tags qualify —
  `production-commercial-2026-06-11` (`94612c0`) and `production-practitioner-2026-06-11` (`9850c16`)
  — and neither is a recent state any more, so in practice a bad deploy has nothing close to roll
  back to. Two fixes, both cheap: tag the commit before every deploy, and take a server-side tarball
  of `/var/www/noeinsol/` before the sync. Not scheduled because it touches production, not the repo.
- **Ltd incorporation.** Nothing in `src/` may claim "Ltd" before the company exists. When it does,
  the name and company number go in the footer partial and in `privacy.njk` EN + IT, and the rule
  above can be retired. Content work, next cycle.

---

## Verification, every milestone

```bash
npm run check                               # build + ui-ux + it-translation + eir smoke
bash deploy.sh --check                      # link/href/canonical/title preflight
npm start                                   # visual check on localhost, desktop and mobile
```

Before the first deploy after M2, by hand — none of these is covered by a suite:

- Contrast ≥4.5:1 on body text, on `--accent-text` over paper, and on ink-over-orange buttons.
- Focus rings visible against the paper ground. The ring is `2px solid var(--accent)`, which was
  chosen against a near-black background and has never been re-checked against `--paper`.
- `prefers-reduced-motion` still honoured (`css/styles.utilities.css`).
- Mobile: multi-column grids collapse into a sensible single-column narrative, not a pile of equal
  cards — the hierarchy built at desktop width is the thing most easily lost at 375px.
- Expect `ui-ux.test.js` to flag markup that legitimately changed shape. Update the assertion to
  match the new structure; do not revert the markup to satisfy an old assertion.
