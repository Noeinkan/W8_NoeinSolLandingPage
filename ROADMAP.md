# Roadmap — technical consolidation

Ordered, checkable plan for closing the design and structural debt left by the "Technical Light"
redesign. Every action below is a checkbox: tick it when it is done and the milestone's
**Done when** command is green.

- **Scope:** technical consolidation (M0–M5), plus the homepage narrative and the motion system
  (M6–M7), added after the end-to-end homepage review of 2026-08-21. SEO, pricing and offer design
  stay out of this cycle.
- **Unit of work:** one milestone = one session of 2–3 hours, self-contained. Nothing here leaves
  the repo half-refactored between sessions.
- **Companion docs:** none — the design direction now lives in this file, under *Design direction*
  below, and the token and convention reference is the Key Conventions section of `CLAUDE.md`.
- **Format:** repo-radar convention — `##` is a milestone, `###` a group inside it, every checkbox
  a task carrying `<!-- size: S|M|L|XL -->`. Verify with
  `node C:/Personal_utilities/roadmap-format/roadmap-lint.mjs`.

Last updated: 2026-08-21.

---

### Why this exists

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

### Working rules

- **Guardrail-first.** The repo already works this way: `HEX_BUDGET` only goes down,
  `UNSTYLED_CLASSES` only gets shorter. A milestone is not closed until it tightens a budget or
  adds a check.
- **Merged passes.** Legacy tokens, radii and hex literals live in the same files as the design
  pass. They are fixed in **one pass per page**, not in three sweeps across the repo.
- **Bilingual.** Every EN content change is mirrored in IT — see the Bilingual Workflow section of
  `CLAUDE.md`.
- **Derived numbers stay derived.** Counts come from `src/_data/builds.js`. Never type one.

### Verification, every milestone

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

---

## Already landed

Baseline, so this file records what the repo has *achieved* and not only what it owes. Each line
is verifiable in `CHANGELOG.md` or by a command; none of it is scheduled work.

### Build and structure

- [x] Eleventy migration — `src/` is the single source of truth <!-- size: XL -->
      The vestigial root `*.html` copies are gone, `_site/` is what deploys.
- [x] Generated sitemap — `src/sitemap.njk` iterates the pages Eleventy built <!-- size: M -->
      so a page cannot be live and unlisted.
- [x] `npm run check` — build plus all three suites in one command <!-- size: S -->
- [x] Shared chrome single-sourced: `base.njk`, `partials/`, `_data/nav.js` <!-- size: L -->
- [x] `macros/blocks.njk` — `sectionHead` replaced 51 hand-written copies, `stat` replaced 12 <!-- size: M -->
- [x] Page numbers derived from `src/_data/builds.js`, never typed <!-- size: M -->

### Design system

- [x] Redesign Phase 0 — ground cleared: particle canvas, blobs, noise overlay, gold accent gone <!-- size: L -->
- [x] Redesign Phase 1 — paper/ink/orange tokens and the fluid `--step-*` scale <!-- size: L -->
- [x] Redesign Phase 2 — homepage rebuilt, the one page carrying `.band--dark` <!-- size: XL -->
- [x] 2,874 lines of dead CSS removed <!-- size: L -->
- [x] Every inline `style=` attribute removed from `src/` <!-- size: M -->
- [x] `--white` deleted and the seven rules painting white text on paper fixed <!-- size: M -->

### Guardrails — each written against a failure the repo had already shipped

- [x] Seven source-hygiene checks in `ui-ux.test.js` <!-- size: L -->
      Inline styles, unstyled classes, undeclared tokens, front-matter assets, nav hrefs, hex
      budget, sitemap coverage.
- [x] `testBookingRoutes` — booking routes cannot vanish silently again <!-- size: S -->
- [x] `it-translation.test.js` — EN leakage, find/replace scars, accents, structural parity <!-- size: L -->
- [x] `eir-smoke.test.js` — EIR Health Check runtime under jsdom <!-- size: L -->

### Content and commercial

- [x] Business mode restored — 16 pages, services and contact back in both languages <!-- size: XL -->
- [x] Booking on every selling page, gated per page, degrading to a plain link when blocked <!-- size: M -->
- [x] Positioning moved to the intersection <!-- size: M -->
- [x] IT localisation — 7 mirrors plus terminology and voice brief <!-- size: XL -->
- [x] Documentation rationalised, 11 files to 7, `CLAUDE.md` as source of truth <!-- size: L -->

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

## M0 — Hygiene and weight <!-- due: 2026-08-21 -->

**1 session, ~1 h.** The cheapest win in the list, and zero risk.

- [x] Delete `assets/Intro + AI Wizard.mp4` (50 MB; zero references in `src/`, `css/`, `js/`) <!-- size: S; done: 2026-08-21 -->
      `.eleventy.js` passthrough-copies the whole `assets` folder, so it entered `_site/` on every
      build and `rsync` on every deploy. Still in git history if it is ever wanted back.
- [x] Delete `nginx.conf` — the root copy of three overlapping nginx configs <!-- size: S; done: 2026-08-21 -->
      `deploy/templates/noeinsol.conf` is the one `deploy.sh` installs and `landing-block.conf` is
      the human-readable mirror `DEPLOYMENT.md` points at; the root copy was last touched in April,
      predates the current pipeline, and was referenced only by the stale Cursor index.
- [x] Reduce `.cursor/rules/project.mdc` and `project-index.mdc` to pointer stubs <!-- size: S; done: 2026-08-21 -->
      Both carried `alwaysApply: true` while describing HTML pages at the repo root, a single
      ~2,400-line stylesheet and "no build step" — so every Cursor session started from a
      description of a repo that stopped existing at the Eleventy migration.
- [x] Generate `assets/og-image.jpg` at a true 1200×630 with `scripts/og/make_og_image.mjs` <!-- size: L; done: 2026-08-21 -->
      The file was **not** 1200×630 — it was a byte-identical copy of `assets/headshot.jpg`,
      680×1018 portrait, against a `1200`/`630` hardcoded in `base.njk` and shipped on all sixteen
      pages. Re-cropping was impossible (a 680px-wide portrait has no landscape strip that keeps the
      head), so the card is now generated: the script renders an HTML template through headless
      Chromium at exactly 1200×630, reading the palette from `css/styles.base.css` and the brand
      faces from the same Google Fonts stylesheet the site loads. The declaration became true rather
      than being lowered. Playwright is bootstrapped into `scripts/og/node_modules/` on first run,
      following the `eir-smoke.test.js` precedent, and is gitignored — it stays out of
      `package.json` because only this hand-run script needs it.
- [x] Fix the stale header comment in `.eleventy.js` — it said "12 static pages", there are 16 <!-- size: S; done: 2026-08-21 -->
- [x] Delete `docs/PRE_LEAVE_LONG_TERM_PLAN.md` <!-- size: S; done: 2026-08-21 -->
      The practitioner/commercial plan it carried is finished (see *Site mode* above), and it
      described a repo that no longer exists: `_redirects`, root-level `ui-ux.test.js` /
      `it-translation.test.js`, `.cursor/plans/`. Its two facts that still matter — the rollback
      tags and the Ltd rule — moved into this file. It was gitignored, so it is **not** recoverable
      from git history.
- [x] Prune the superseded branches <!-- size: S; done: 2026-08-21 -->
      Confirmed first: `revamp-site`, `pre-leave/commercial-snapshot` and tag
      `production-commercial-2026-06-11` all point at `94612c0`; `pre-leave/strip-to-practitioner`
      and tag `production-practitioner-2026-06-11` both point at `9850c16`; both tags are on
      `origin`. `git rev-list --left-right --count main...revamp-site` returned `15  0`, so
      `revamp-site` held nothing of its own. Both deleted with the safe lowercase `-d`.
      **Local only** — `origin` still carries three heads including
      `pre-leave/strip-to-practitioner`, so a `git fetch` restores either one. Kept
      `pre-leave/commercial-snapshot` and both `production-*` tags.

`assets/builds/w9-connecting-the-grid.png` looks orphaned and **is not**. `BUILDS_SCREENSHOTS.md`
records it as held back on purpose: the W9 card was pulled from the page on request, and the
capture stays so restoring it is a data-table edit rather than a re-capture. Leave it alone.

Cross-document links broke when this roadmap moved from `docs/` to the repo root, and nothing
caught it — the preflight validates hrefs in built HTML, not links between markdown files:

- [x] Point `CLAUDE.md` at `ROADMAP.md` instead of `docs/ROADMAP.md` <!-- size: S; done: 2026-08-21 -->
      Two places, the file tree and the Documentation list.
- [x] Fix the two dead links in `docs/REDESIGN_PLAN.md` <!-- size: S; done: 2026-08-21 -->
      Both resolved relative to `docs/` and needed `../`. The link to `CLAUDE.md` had been broken
      since before the move. (That file has since been deleted — see below — but the fix is what
      proved the class of failure was real.)
- [x] Delete `docs/REDESIGN_PLAN.md` <!-- size: M; done: 2026-08-21 -->
      Phases 0–2 were done, and everything it still had to say was either already true in the code
      (the token block it specified *is* `css/styles.base.css`), or duplicated by this file (its
      Phase 4 order vs. M2), or describing a repo that no longer exists — root `index.html`, a
      hand-written `it/index.html`, a "dual tree", `assets/builds/` holding only `.gitkeep`, line
      references into files rewritten since. Its direction moved to *Design direction* below; the
      three deferred decisions are resolved and recorded there.
- [x] Close the "open Phase 3 defect" the redesign plan carried — it was not a defect <!-- size: S; done: 2026-08-21 -->
      The plan flagged the wordmark at
      [src/_includes/partials/nav.njk:2](src/_includes/partials/nav.njk#L2) as broken for lacking
      `{{ prefix }}`, because on IT pages it resolves to `/it/index.html`. That is the Italian
      homepage, and it is the correct target: every one of the six nav links beside it is relative
      in exactly the same way and stays inside `/it/`. Adding `{{ prefix }}` would send an Italian
      reader to the *English* homepage from a click on the logo — which is what `.lang-switch` is
      for, and it is the only link in that nav that correctly uses `../`.
- [x] Add the guardrail `testMarkdownLinksResolve` in `scripts/tests/ui-ux.test.js` <!-- size: M; done: 2026-08-21 -->
      It walks root `*.md`, `docs/*.md`, `.cursor/rules/*.mdc` and `.github/*.md` and resolves every
      link target relative to the linking file. It checks *any* local target, not only `.md`, which
      is what covers the `.njk` link three items above. Fenced blocks and inline `code` spans are
      stripped before matching — this section names `docs/REDESIGN_PLAN.md` and the old
      `docs/ROADMAP.md` on purpose, and both are backticked. The file set is an explicit list rather
      than a recursive walk, which would otherwise descend into the gitignored
      `scripts/tests/smoke/node_modules/`.
- [x] Add a second guardrail while the OG defect was fresh: `testOgImageMatchesDeclaration` <!-- size: S; done: 2026-08-21 -->
      It reads the JPEG's SOF marker and asserts the file agrees with the `og:image:width`/`height`
      in `base.njk`. Twenty lines, no dependency, and it is the check whose absence let a portrait
      headshot masquerade as a 1200×630 social card for the life of the site.

**Done when:** `npm run check` green, `bash deploy.sh --dry-run` no longer lists the video, and
the new markdown-link check passes across `*.md` and `docs/*.md`.

**Closed 2026-08-21.** All three green: `npm run check` passes, `bash deploy.sh --check` validates
16 pages, and `_site/` is down to 1.8 MB with no `.mp4` anywhere in the tree. Both new checks were
verified to actually fail when broken — a `1201` in `base.njk` and a `[dead](docs/NOPE.md)` in
`README.md` each tripped the suite, and a backticked copy of the same dead link correctly did not.

---

## M1 — Get `privacy` out of the front matter

**1 session, ~2 h.**

The privacy pages, EN and IT, carry a CSS blob in `inlineStyle`, rendered by `base.njk:31-35`. It
is the last pocket of stylesheet-shaped content written into the markup, and it runs on
pre-redesign tokens (`--text-primary`, `--bg-elevated`, `--border-subtle`) — which makes privacy
the one page still entirely on the old visual system.

- [ ] Extract the blob into `css/privacy.css` <!-- size: M -->
      Declared as `"css": ["privacy.css"]` in the front matter of both pages.
- [ ] While moving it, port the rules onto current tokens (`--ink`, `--paper-sunk`, `--rule`) <!-- size: M -->
- [ ] Drop `privacy-meta`, `privacy-table`, `privacy-table-wrap` from `UNSTYLED_CLASSES` <!-- size: S -->
      In `scripts/tests/ui-ux.test.js` — the test fails on its own if they stay listed once they
      have rules, so the list updates under pressure.
- [ ] Add the guardrail: a check in `ui-ux.test.js` that fails if any front matter declares `inlineStyle` <!-- size: S -->
- [ ] Remove the now-unused `inlineStyle` branch from `src/_includes/base.njk` <!-- size: S -->

**Done when:** no occurrence of `inlineStyle` anywhere in `src/`, `npm run check` green.

---

## M2 — Per-page passes: design + tokens + radii + hex

**5 sessions, ~2–3 h each.** The body of the work. **One page per session**, and each session does
all four jobs on that page rather than deferring any of them:

1. Technical Light design pass — explicit bands (`.band`, `.band--sunk`, `.band--dark`), hairlines,
   mono labels, real hierarchy. Direction is in *Design direction* below.
2. Replace legacy aliases with direct tokens (`--text-primary` → `--ink`, and so on).
3. Collapse ad-hoc radii onto the four `--r-*` tokens.
4. Cut literal hex colours and lower that file's entry in `HEX_BUDGET`.

Reuse `sectionHead` and `stat` from `src/_includes/macros/blocks.njk`. If a block reaches its third
hand-written copy, it becomes a macro — that is the repo's rule.

Order runs lightest to heaviest, so the first sessions calibrate the pace.

### Design direction — "Technical Light"

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
  rounder is a leftover from the old theme, which is why job 3 above exists.
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

### M2.1 — Builds · `builds.css` (218 lines, 13 aliases, 2 hex)

- [ ] Design pass — Builds <!-- size: M -->
- [ ] Legacy aliases → direct tokens — `builds.css` <!-- size: S -->
- [ ] Radii → `--r-*` — `builds.css` <!-- size: S -->
- [ ] `HEX_BUDGET['builds.css']` lowered <!-- size: S -->

### M2.2 — About · `about.css` (485 lines, 19 aliases, 0 hex)

- [ ] Design pass — About <!-- size: L -->
- [ ] Legacy aliases → direct tokens — `about.css` <!-- size: M -->
- [ ] Radii → `--r-*` — `about.css` <!-- size: S -->
- [ ] Clean `styles.utilities.css` (9 aliases) in whichever session touches it first <!-- size: S -->

### M2.3 — Capsar · `capsar.css` (530 lines, 39 aliases, 5 hex)

- [ ] Design pass — Capsar <!-- size: L -->
- [ ] Legacy aliases → direct tokens — `capsar.css` <!-- size: M -->
- [ ] Radii → `--r-*` — `capsar.css` <!-- size: S -->
- [ ] `HEX_BUDGET['capsar.css']` lowered <!-- size: S -->

### M2.4 — BEP checklist · `bep-checklist.css` (807 lines, 61 aliases, 49 hex)

- [ ] Design pass — BEP checklist <!-- size: L -->
- [ ] Legacy aliases → direct tokens — `bep-checklist.css` <!-- size: L -->
- [ ] Radii → `--r-*` — `bep-checklist.css` <!-- size: M -->
- [ ] `HEX_BUDGET['bep-checklist.css']` lowered <!-- size: M -->

### M2.5 — EIR Health Check · `eir-checklist.css` (520 lines, 33 aliases, 49 hex)

Shares the `.bep-*` scaffolding with M2.4 — run it straight after, and most of the work is
inherited.

- [ ] Design pass — EIR Health Check <!-- size: M -->
- [ ] Legacy aliases → direct tokens — `eir-checklist.css` <!-- size: M -->
- [ ] Radii → `--r-*` — `eir-checklist.css` <!-- size: S -->
- [ ] `HEX_BUDGET['eir-checklist.css']` lowered <!-- size: M -->

**Done when, per page:** zero legacy aliases in its stylesheet, `HEX_BUDGET` entry lowered,
`npm run check` green, and a visual check via `npm start` at desktop and mobile widths. For the two
checklists, `node scripts/tests/smoke/eir-smoke.test.js` as well.

---

## M3 — Delete the aliases and close the door

**1 session, ~1 h.** Only after M2 is complete.

- [ ] Delete the alias block at `css/styles.base.css:99-106` <!-- size: M -->
- [ ] Add `LEGACY_TOKEN_BUDGET` to `ui-ux.test.js`, modelled on `HEX_BUDGET` <!-- size: M -->
      It starts at zero and can only go down. A reintroduced `var(--text-primary)` fails the build.

**Done when:** `grep -rn "var(--text-primary\|--bg-elevated\|--border-subtle" css/` returns nothing,
`npm run check` green.

---

## M4 — IT parity

**2 sessions, ~3 h each.** After M2, so no markup is translated that is about to change.

### M4.1 — Italian Builds mirror

- [ ] Translate the page, voice `io` + `tu`, terminology per `docs/LOCALIZATION_IT.md` <!-- size: L -->
- [ ] Prose counts read from `src/_data/builds.js` (`total`, `totalWord`, `shots`) — never typed <!-- size: M -->
      If `totalWord` only produces English number words, extend it rather than working around it.
- [ ] Anchor IDs and JS-referenced IDs left identical to EN <!-- size: S -->
- [ ] Set `hasMirror: true` on the EN Builds page <!-- size: S -->

### M4.2 — Italian EIR Health Check mirror

- [ ] Translate the page <!-- size: L -->
- [ ] Handle the diagnostic strings in `js/eir-checklist.js` <!-- size: M -->
      Check how the BEP checklist solved the same problem and follow that route.
- [ ] Set `hasMirror: true` on the EN EIR page <!-- size: S -->
- [ ] `node scripts/tests/smoke/eir-smoke.test.js` still green <!-- size: S -->

**Done when:** `node scripts/tests/it-translation.test.js` green across 9 pairs instead of 7, plus a
self-check against the pre-commit checklist in `LOCALIZATION_IT.md` — the test does not catch voice.

---

## M5 — Visual proof

**2 sessions, ~2 h each.** The conversion gap the redesign already identified: 11 builds have an
interface, 1 has a screenshot.

- [ ] Capture the missing screenshots per `docs/BUILDS_SCREENSHOTS.md` <!-- size: L -->
      The repos are already checked out locally under `Downloads/` and can be driven with
      Playwright.
- [ ] Add each `shot` to `src/_data/builds.js` — the derived stats follow on their own <!-- size: M -->
- [ ] Confirm every remaining empty slot is a genuine `noUi: true` build <!-- size: S -->
      Currently `W4_AgenticSupplyChain` and `H9_Voice_Transcriber` — not an unfilled one.

**Done when:** `builds.shots` has risen, every remaining empty slot is `noUi`, `npm run check`
green.

---

## M6 — Homepage: cut the duplication, make it one argument

**2 sessions, ~3 h each** — one EN, one IT. Independent of M2 (the homepage was rebuilt in Redesign
Phase 2 and is not in the M2 page list), so it can run in parallel or first.

The homepage was rebuilt block by block and never read end to end afterwards. Measured on the build
of 2026-08-21:

| Evidence | Measured |
|---|---|
| Page height | **4,976 px** desktop at 1440; **8,250 px** mobile at 390 — roughly ten phone screens |
| Blocks inside `<main>` | 9 |
| Blocks that are a second telling of a card in block 5 | **4 of 9** — dark band ← EIR card, about preview ← Background card, lead magnet ← BEP card, Capsar banner ← Capsar card |
| Internal destinations linked 3× or more | `bep-checklist.html` 5×, `eir-checklist.html` 4×, `capsar.html` 4×, `about.html` 4× |
| Tonal contrast events in 4,976 px | **1** — the single `.band--dark` |
| Distinct block shapes | 3 grids of near-identical hairline cells (`.stats`, `.trust-band-grid`, `.value-props`) |

The structure is the problem, not the copy: **block 5 is a directory of five cards, and blocks 6–9
are four of those same five cards expanded one per section.** The page says the same four things
twice, which is where the bloat reads from. It is also why the page feels flat — nine blocks all
built from `sectionHead` + a hairline grid, with one tonal change between the hero and the footer.

Defects, each verifiable:

- [ ] **The standfirst contradicts the grid it introduces.** `src/en/index.njk:79` reads "Two things
      you can use today — a platform in beta and a free self-diagnostic" and then renders five
      cards, two of which are self-diagnostics and two of which (Background, Builds) are not
      products at all.
- [ ] **Cut the value grid from five cards to three:** Capsar (feature span), EIR Health Check, BEP
      Checklist. Background and Builds are navigation, not offers — both already have a nav entry,
      and they belong on one ruled line under the grid. This also retires the awkward 6-column
      `3+3 / 2+2+2` bento in `styles.sections.css:214-216`.
- [ ] **Merge `.stats` and `.logo-bar` into one proof strip, and fix the numbers.** `35 BEP
      readiness checks` and `9 checklist sections` measure the same free checklist twice, in the
      highest-attention position on the page. The numbers the page already contains but does not use
      here: 500+ trained at Heathrow, `builds.total` public builds, 10+ years, 4 certifications.
      Counts stay derived from `src/_data/builds.js` — never typed.
- [ ] **"Previously at … Google" does not match the About page.** The career timeline at
      `src/en/about.njk:121-139` lists three employers — Turner & Townsend / Heathrow, HA
      Associates, Foster + Partners. Google appears only at `src/en/about.njk:191`, as a *client
      engagement*: "authoring ISO 19650 information requirements for Google's real estate
      portfolio." The homepage logo bar promotes that client to an employer. It is the single
      claim on the site most likely to be checked, and the two pages disagree. Reframe the strip
      as *Delivered for* / *Worked across*, or drop Google from it.
- [ ] **The Focus band is keywords, not claims.** `ISO 19650 / BEP & EIR / Infrastructure /
      Privacy-first` are four nouns that restate the hero subhead one screen above them. Either
      absorb them into the dark band as the setup for the diagnostic, or delete the block.
- [ ] **Resolve the lead-magnet form.** It asks for a work email plus a consent checkbox, and
      `src/en/index.njk:222` — directly below the submit button — says "Or skip the form — open the
      interactive checklist directly." The gate is optional and the page says so, so the form
      collects nothing and costs a block. Either gate the checklist or drop the form and keep the
      link.
- [ ] **Close on the call, not on a `mailto:`.** The last block is the Capsar banner, whose primary
      action is `mailto:…?subject=Capsar%20access%20request`. The arc runs *hero: book a call* → … →
      *email me about a beta*. The most engaged reader on the page — the one who reached the bottom
      — is handed the weakest action available. Close on the booking CTA and demote the beta request
      to a secondary link inside that block.
- [ ] **Fix the mobile hero alignment.** `css/styles.responsive.css:17` centres `.hero-label` and
      `.hero-actions` at ≤968px for *every* hero. It was written for `.hero-inner--split` pages
      (About, Capsar). On the homepage's left-aligned hero the eyebrow and buttons centre while the
      `h1` and subhead stay left — visible in any capture at 390px. Scope both rules to
      `.hero-inner--split`.
- [ ] **Mirror all of it in `src/it/index.njk`**, per the Bilingual Workflow section of `CLAUDE.md`,
      then `node scripts/tests/it-translation.test.js`. The structural-parity check compares
      `<section>` counts between EN and IT, so a half-applied cut fails the suite rather than
      shipping.
- [ ] **Guardrail:** `HOMEPAGE_BLOCK_BUDGET` in `scripts/tests/ui-ux.test.js`, modelled on
      `HEX_BUDGET` — the count of direct element children of `<main>` in `_site/index.html` and
      `_site/it/index.html`, starting at whatever the pass lands on and only ever allowed to go
      down. Plus a repetition ceiling: no internal `.html` destination linked more than twice from
      one page's `<main>`. Both are the checks whose absence let the directory-then-directory-again
      structure accumulate one block at a time.

**Target:** 6 blocks, each subject appearing once, roughly −35% page height, and every block ending
in a different action rather than four blocks ending in the same two.

**Done when:** `npm run check` green, `node scripts/tests/it-translation.test.js` green across the
EN/IT homepage pair, `bash deploy.sh --check` green, and a scroll of `npm start` at 1440 and 390
where no subject is introduced twice.

---

## M7 — Motion: a system, not decoration

**2 sessions, ~2–3 h each.** Best run after M6 (no point animating blocks that are about to be cut)
and before the M2 page passes, so each page pass applies the primitives rather than inventing them.

### What exists today

One load-time sequence and one scroll behaviour, and that is the whole motion layer:

| Mechanism | Where | Reach |
|---|---|---|
| Hero `fadeUp`, 5 stepped delays | `css/styles.hero.css:56-123` | hero only, on load |
| `.fade-in` — one 400ms `translateY(24px)` | `css/styles.animations.css:22-28` | 28 elements across 6 of 9 EN pages |
| `.stagger-child`, 60 ms per index | `css/styles.animations.css:30-35` | 9 named grids, set from `js/main.js:36-46` |
| Stat counters, 1.6 s cubic ease-out | `js/main.js:62-90` | `.stats` only, one-shot per page load |
| Nav shrink on scroll | `js/main.js:97-104` | global |

Everything below the fold therefore arrives the same way: one fade, one 24px rise. That is "the page
loaded", not behaviour — which is the static feeling, and it is accurate rather than imagined.
Two pages (`bep-checklist`, `eir-checklist`) and `privacy` carry **zero** `.fade-in` and get no
scroll motion at all.

Also dead and worth removing in the same pass: `.slide-in-left` has rules in
`styles.animations.css:39-45`, a reduced-motion reset, and an observer entry in `js/main.js:26` —
and **zero references in `src/`**. Same for `.band--sunk`, declared in `styles.base.css:175-178` and
used nowhere.

### What the research says (checked 2026-08-21)

- **Scroll-driven CSS has replaced JS scroll listeners.** `animation-timeline: view()` / `scroll()`
  with `animation-range` runs off the compositor. Measured comparison: JS scroll handlers dropped to
  30 fps with 20 animated elements on a 2019 Android; the CSS equivalent held 60 fps with 50.
- **Support is good but not Baseline.** Chrome/Edge 115+, Safari 26 (Sept 2025; threaded in 26.4,
  accuracy fixes in 26.5), Firefox behind a flag with Nightly 152 defaulting it on and Interop 2026
  listing it — ~84–85% global. So it is a **progressive enhancement**, never a dependency: gate on
  `@supports (animation-timeline: view())` and leave the existing IntersectionObserver as the floor.
  That is exactly the pattern the repo already uses for `.js-anim`.
- **The rules:** transforms and opacity only — never `width`/`height`/`margin`; micro-interactions
  under 300 ms; every scroll-driven rule wrapped in
  `@media (prefers-reduced-motion: no-preference)`; parallax flagged as the specific vestibular risk.
- Sources: [WebKit — scroll-driven animations with just CSS](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/),
  [Josh Comeau — Scroll-Driven Animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/),
  [MDN — `animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline),
  [web-features explorer — scroll-driven animations](https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/).

### M7.1 — Primitives

Motion this brand can carry has to read as *instrumentation*, not as portfolio flourish. The
redesign deliberately deleted a particle canvas, blurred blobs and a noise overlay because the thing
being sold is rigour; anything reintroducing that register undoes it.

- [ ] **Scroll-progress rule in the nav.** 1 px `--accent` line, `transform: scaleX()` driven by
      `animation-timeline: scroll(root)`. Six lines of CSS, no JS, and it is the cheapest possible
      "this page is an instrument" signal.
- [ ] **Hairlines that draw in.** The 20 px dash on `.section-label::before` and the 1 px grid gaps
      on `.value-props` / `.trust-band-grid` arriving by `scaleX` on entry. This is the drawing-sheet
      metaphor in *Design direction* made active rather than merely stated, and it is the single
      most on-brand effect available.
- [ ] **Replace `.fade-in` with a `view()` version behind `@supports`**, keeping the observer path
      as the fallback. Same visual result, no scroll listener, and it fixes the class of bug the
      observer was patched for at `js/main.js:19` (an element scrolled past before the first async
      delivery).
- [ ] **Reduced-motion and dead-class hygiene in the same pass:** every new animated class added to
      the reset at `css/styles.utilities.css:187-205`, and `.slide-in-left` + `.band--sunk` deleted.
- [ ] **Guardrail:** a check in `ui-ux.test.js` that every `animation-timeline` declaration in
      `css/` sits inside a `@media (prefers-reduced-motion: no-preference)` block, and that every
      class carrying an `animation` or `transition` in `styles.animations.css` appears in the
      reduced-motion reset. The reset is currently maintained by hand, which is how
      `.hero-contact-note` came to need the comment at `css/styles.hero.css:113-115`.

### M7.2 — The product moment

The one block that demonstrates the product is the block that is completely frozen.

- [ ] **Make the panel live.** `72`, `/100` and `.product-meter-fill` in the dark band are static
      markup (`src/en/index.njk:140-149`). Count the score and fill the meter on entry, reusing the
      easing already in `animateCounters` at `js/main.js:62-90` rather than writing a second one.
- [ ] **Pin the panel while the copy scrolls past it** — `position: sticky` plus `view-timeline` on
      `.product-band-inner`. Highest-value single effect on the page, because it holds the only
      picture of the product on screen for the length of the argument instead of one third of it.
- [ ] **Card hover with intent.** `.value-card` and `.trust-band-card` currently transition
      `background-color` and nothing else (`styles.sections.css:211`, `:178`). Add a 2 px rise and
      an accent hairline, under 200 ms.
- [ ] **Re-arm the counters.** `statsAnimated` at `js/main.js:49` is a one-shot module-level flag,
      so a back-navigation from a bfcache restore shows the numbers already landed.
- [ ] **Give the two checklist pages and `privacy` a reveal at all** — they carry zero `.fade-in`
      today, so `_site/bep-checklist.html` is the only long page on the site with no motion
      whatsoever.

**Explicitly not in scope, and not a deferred decision:** parallax on the headshot, magnetic
cursors, letter-by-letter or blur-in text, 3D card tilt, cursor followers, scroll-jacking. Each
reads as portfolio-site rather than instrument, and the vestibular risk on parallax is called out
in the sources above.

**Done when:** `npm run check` green; every `animation-timeline` rule inside both an `@supports` and
a `prefers-reduced-motion: no-preference` guard; the page identical with JS disabled and identical
again with reduced motion on; and a Lighthouse pass at desktop and mobile showing no CLS regression
against the pre-M7 number.

---

## Watch list — not scheduled here

No `due:` on this milestone on purpose: it is the backlog, sized so it can be planned, but not
committed to a session in this cycle.

- [ ] Sweep the dead CSS rules <!-- size: L -->
      `styles.sections.css` is at 820 lines and the test suite covers markup→CSS, not CSS→markup: no
      guardrail catches a rule nothing uses any more. A sweep is warranted but needs manual
      page-by-page verification, so it is not planned as a timed milestone.
- [ ] Instrument the conversion events <!-- size: M -->
      `track()` exists at `js/main.js:388` and is barely used, so which page produces a booking is
      not measurable. That is conversion work, not consolidation — next cycle.
- [ ] Give `deploy.sh` an undo <!-- size: M -->
      It overwrites the server with `rsync` and there is no automatic rollback: recovering means
      checking out an older commit and redeploying, which needs git to be available and the right
      tag to exist. Today exactly two tags qualify — `production-commercial-2026-06-11` (`94612c0`)
      and `production-practitioner-2026-06-11` (`9850c16`) — and neither is a recent state any more,
      so in practice a bad deploy has nothing close to roll back to. Two fixes, both cheap: tag the
      commit before every deploy, and take a server-side tarball of `/var/www/noeinsol/` before the
      sync. Not scheduled because it touches production, not the repo.
- [ ] Put the Ltd name and company number in the footer and both privacy pages, once incorporated <!-- size: S -->
      Nothing in `src/` may claim "Ltd" before the company exists. When it does, the name and
      company number go in the footer partial and in `privacy.njk` EN + IT, and the rule above can
      be retired. Content work, next cycle.

<!--
  Format reminders (repo-radar convention — C:/Personal_utilities/roadmap-format):
  - ## = milestone, ### = group inside it, checkbox = task
  - size mandatory on every task: S=1 M=3 L=8 XL=20
  - metadata in an HTML comment on the FIRST line of the task; the following
    lines are prose the parser ignores, so keep the first line a complete label
  - dates always YYYY-MM-DD
  - a task's first-line text is its identity in git history: do not reword it
  - check with:
      node C:/Personal_utilities/roadmap-format/roadmap-lint.mjs
-->
