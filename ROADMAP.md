# Roadmap — technical consolidation

Ordered, checkable plan for closing the design and structural debt left by the "Technical Light"
redesign. Every action below is a checkbox: tick it when it is done and the milestone's
**Done when** command is green.

- **Scope:** technical consolidation (M0–M5), plus the homepage narrative and the motion system
  (M6–M7), added after the end-to-end homepage review of 2026-08-21. SEO, pricing and offer design
  stay out of this cycle.
- **Unit of work:** one milestone, self-contained. Nothing here leaves the repo half-refactored
  between milestones.
- **Companion docs:** none — the design direction now lives in this file, under *Design direction*
  below, and the token and convention reference is the Key Conventions section of `CLAUDE.md`.
- **Format:** repo-radar convention — `##` is a milestone, `###` a group inside it, every checkbox
  a task carrying `<!-- size: S|M|L|XL -->`. Verify with
  `node C:/Personal_utilities/roadmap-format/roadmap-lint.mjs`.

Last updated: 2026-08-22.

---

### Why this exists

The site is functionally complete and green — 18 pages, business mode live, all three suites
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

The table is the baseline measured when this file was written, not a live reading — a closed
milestone records what it changed in its own section rather than editing these rows.

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

The cheapest win in the list, and zero risk.

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

## M1 — Get `privacy` out of the front matter <!-- due: 2026-08-21 -->

The privacy pages, EN and IT, carry a CSS blob in `inlineStyle`, rendered by `base.njk:31-35`. It
is the last pocket of stylesheet-shaped content written into the markup, and it runs on
pre-redesign tokens (`--text-primary`, `--bg-elevated`, `--border-subtle`) — which makes privacy
the one page still entirely on the old visual system.

- [x] Extract the blob into `css/privacy.css` <!-- size: M; done: 2026-08-21 -->
      Declared as `"css": ["privacy.css"]` in the front matter of both pages. One file serves both
      languages: the two blobs were byte-identical, so there was never a second thing to move.
- [x] While moving it, port the rules onto current tokens (`--ink`, `--paper-sunk`, `--rule`) <!-- size: M; done: 2026-08-21 -->
      `--border` needed `--rule-strong`, not `--rule` — it is the one alias in the blob whose
      target is not the obvious one. Privacy is not in the M2 page list, so this was its only
      scheduled pass and it took the full Technical Light treatment rather than a token swap:
      hardcoded rem onto the `--step-*` / `--space-*` scales, mono for the metadata line and the
      table headers, hairline table with one heavier rule under the header row.
- [x] Drop `privacy-meta`, `privacy-table`, `privacy-table-wrap` from `UNSTYLED_CLASSES` <!-- size: S; done: 2026-08-21 -->
      In `scripts/tests/ui-ux.test.js` — the test fails on its own if they stay listed once they
      have rules, so the list updates under pressure. Four entries, not three: `privacy-content`
      was on the list too.
- [x] Add the guardrail: a check in `ui-ux.test.js` that fails if any front matter declares `inlineStyle` <!-- size: S; done: 2026-08-21 -->
      `testNoStylesheetsInMarkup` also scans the raw templates, the layout and the partials for a
      `<style>` tag, so the branch removed below cannot come back into `base.njk` unnoticed — the
      front-matter key was only one of the two ways in.
- [x] Remove the now-unused `inlineStyle` branch from `src/_includes/base.njk` <!-- size: S; done: 2026-08-21 -->

**Done when:** no occurrence of `inlineStyle` anywhere in `src/`, `npm run check` green.

**Closed 2026-08-21.** `grep -rn "inlineStyle" src/` returns nothing, all three suites pass,
`bash deploy.sh --check` validates 16 pages, and no built page contains a `<style>` tag any more.
The new check was verified to fail on all three of its branches before being committed green — an
`inlineStyle` key restored to a page, a `<style>` block added to `partials/nav.njk`, and (for
`testPrivacyPage`) the `css` key deleted while `css/privacy.css` stayed in place, which is the one
way to render the page unstyled without tripping anything else.

Three defects surfaced by reading the blob rather than by the milestone's own scope, all fixed
here: the links used `--accent` (3.7:1 on paper, fails AA) where `--accent-text` exists; the
headings asked for Archivo 400, which the loaded 500–800 range does not contain, so every browser
synthesised it; and the 8rem top padding was clearing a **fixed** nav — the nav has been
`position: sticky` and in flow since the redesign, so privacy alone opened with ~128px of dead
space. The table's vertical margin also moved onto `.privacy-table-wrap`: `overflow-x` makes that
wrapper a block formatting context, so the margin could not collapse out through it and the gap
before the next heading came out half again too big.

Half of one M6 item landed here as well — see the note on it below.

---

## M2 — Per-page passes: design + tokens + radii + hex

The body of the work. **One page at a time**, and each pass does all four jobs on that page rather
than deferring any of them:

1. Technical Light design pass — explicit bands (`.band`, `.band--sunk`, `.band--dark`), hairlines,
   mono labels, real hierarchy. Direction is in *Design direction* below.
2. Replace legacy aliases with direct tokens (`--text-primary` → `--ink`, and so on).
3. Collapse ad-hoc radii onto the four `--r-*` tokens.
4. Cut literal hex colours and lower that file's entry in `HEX_BUDGET`.

Reuse `sectionHead` and `stat` from `src/_includes/macros/blocks.njk`. If a block reaches its third
hand-written copy, it becomes a macro — that is the repo's rule.

Order runs lightest to heaviest, so the first passes calibrate the pace.

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

- [x] Design pass — Builds <!-- size: M; done: 2026-08-21 -->
      The grid moved onto the hairline-grid idiom the rest of the site uses, which retired
      the `12px` radius, the card border and the gradient sweep whose own comment still
      called it a "Gold top-edge sweep". The 16:10 media slot sits on `--band` now, so a
      capture reads as a screen and the rotation dots stop straddling bright dashboards and
      near-black terminals; the no-screenshot state became a dark drawing sheet. Kicker and
      jump-index count went mono — the count had been `--font-display` under a comment
      reading "Monospaced so the counts line up down the row". Cards stay equal: no build is
      featured, which keeps the rule the page was built on.
- [x] Legacy aliases → direct tokens — `builds.css` <!-- size: S; done: 2026-08-21 -->
      18 references, not the 13 in the heading above — the screenshot-rotation work added
      five after this file was written. Now zero.
- [x] Radii → `--r-*` — `builds.css` <!-- size: S; done: 2026-08-21 -->
      Three `999px` → `--r-pill`; the card's `12px` went with the card border.
- [x] `HEX_BUDGET['builds.css']` lowered <!-- size: S; done: 2026-08-21 -->
      To zero, so the key is gone rather than set to 0 — `HEX_BUDGET[file] || 0` already
      means a missing key is a budget of nothing. Both literals were `#000` mask stops,
      which are alpha stencils rather than colour choices, so they became the `black`
      keyword.

**Closed 2026-08-21.** The file measured **338 lines, 18 aliases, 2 hex** when the pass
started, against the 218/13/2 in the heading; the heading keeps the original reading, per the
note under *Why this exists*. Builds had **zero** `.band*` across nine blocks, so the four
category sections now alternate paper and sunk — driven by the `{% for %}` loop rather than
hand-written classes, so adding a domain in `src/_data/builds.js` keeps the alternation. That
needed `section.band` in `styles.base.css`: a bare `<section>` is width-capped and
gutter-padded by `styles.sections.css`, and Builds keeps its four category landmarks as
`<section aria-label>` rather than sidestepping it with a `<div>` the way index and Capsar did.

Four defects surfaced by the pass rather than by its scope, all fixed here:

- `.build-toolbar` was a bare `<div>` child of `<main>` with no `max-width` and no
  `padding-inline`, and there is no global `main` rule — every other block on the page sets
  its own. The jump-index pills ran flush to the viewport edge at every width. It is a
  `.band--sunk .band--tight` control strip now, which supplies both.
- The Method row's three `.value-card`s carried no bento span modifier inside `.value-props`,
  which is `repeat(6, 1fr)` — each took **one column of six**, about 199px, with three
  columns empty beside them.
- `.build-card-body h3` asked for Archivo 400 against a loaded 500..800 range, and two spans
  inherited the same synthesised weight. Same defect M1 fixed on the privacy headings.
- `.page-hero-note` had no rule on any stylesheet Builds loads — its only ones were
  duplicated in `bep-checklist.css` and `eir-checklist.css`. Promoted into `styles.hero.css`
  and deleted from both, which took a `--text-tertiary` alias off each: a small pre-payment
  on M2.4 and M2.5.

Guardrail: `testPageScopedClassesResolve` resolves each page's classes against only the
stylesheets that page actually links, read from the built HTML, instead of against all of
`css/` concatenated the way `testEveryClassHasARule` does. It is the check whose absence let
the `.page-hero-note` defect ship. Both its branches were verified to fail before being
committed green. Its `PAGE_SCOPED_EXCEPTIONS` list starts at four entries, all on the
homepage and all owned by M6: `.form-group` and `.form-note` in the lead-magnet form have no
rule index loads either.

`--ink-rgb` was added to `styles.base.css` alongside `--accent-rgb`: `.build-card-dot`
carried `rgba(20, 22, 26, 0.4)`, a raw literal of `--ink` that the colour budget cannot see
because it counts hex and that is `rgba()`.

One coordination note for M7, which lists `.band--sunk` for deletion as dead CSS: it has
consumers now — this pass and M2.3 — so that half of the item is resolved in the other
direction. `.band-inner` likewise.

### M2.2 — About · `about.css` (485 lines, 19 aliases, 0 hex)

- [x] Design pass — About <!-- size: L; done: 2026-08-21 -->
      Two bands where there were none: Recognition on `.band--dark`, Academic on `.band--sunk`.
      Hairline grids in the `.trust-band-grid` idiom replace the gapped card rows; the Autodesk
      40 Under 40 takes a feature cell against three certificates stacked beside it, because
      four equal cards left the page's strongest proof block with nothing to read first. Mono
      on the metadata registers (`.timeline-org`, `.cert-img-card-sub`, `.credential-card p`,
      lightbox caption) — the page had none outside the hero eyebrow. Timeline rail flattened
      from a three-stop gradient to a 1px rule with square ticks, and the `•` list bullets are
      now the same accent dash as `.section-label::before`.
- [x] Legacy aliases → direct tokens — `about.css` <!-- size: M; done: 2026-08-21 -->
      **25 sites across 10 alias names, not the 19 recorded above.** The undercount is not
      drift: `git show 9ca4f24:css/about.css`, the commit that wrote the figure, also has 25.
      Every other M2 page is understated the same way — builds 18 not 13, capsar 50 not 39,
      bep 65 not 61, eir 40 not 33; `styles.utilities.css` at 9 is the only exact row.
- [x] Radii → `--r-*` — `about.css` <!-- size: S; done: 2026-08-21 -->
      `12px` ×3, `10px`, `20px` and `8px` onto `--r-sm` / `--r-md` / `--r-lg`. The two `50%`
      circles went as well: the timeline node is a square tick on a rule, and the lightbox
      close button is `--r-sm` like every other control.
- [x] Clean `styles.utilities.css` (9 aliases) in whichever pass touches it first <!-- size: S; done: 2026-08-21 -->
      All nine were text colours. Took its two colour literals and two radii in the same pass,
      so the file pins at zero in both budgets.
- [x] Guardrail: `RGB_BUDGET` — the colour budget could not see `rgba()` <!-- size: M; done: 2026-08-21 -->
      `about.css` is recorded above as **0 hex**, which was true and misleading: it carried ten
      `rgb()`/`rgba()` literals, six of them `rgba(201, 165, 90, …)` — the *pre-redesign gold*,
      still sitting in the file a whole visual redesign later. `HEX_BUDGET` matches
      `/#[0-9a-fA-F]{3,8}\b/` and a colour written as `rgba()` simply is not a hex literal.
      New `RGB_BUDGET` alongside it rather than merged into it: merging would have forced every
      existing number *up*, and four other M2 tasks name `HEX_BUDGET` directly.
      `rgba(var(--accent-rgb), …)` is deliberately not matched, so the token route stays open.

**Closed 2026-08-21.** Also landed, none of it in the milestone's own scope:

- **Two dead blocks deleted** — `.credentials-grid--image` and `.cert-btn`, zero references in
  `src/`, `js/` or `scripts/`. `testEveryClassHasARule` checks markup→CSS only, so nothing in
  the suite has ever been able to see a rule with no markup. That direction is still uncovered;
  it is the *Sweep the dead CSS rules* item on the watch list.
- **The cert-card hover label was unreadable.** Orange on a 55% scrim over a white certificate
  computes to about **1.1:1**. The overlay now uses `--scrim-strong` with the label in
  `--band-text` (~12:1), accent left on the icon.
- **`.band-inner` and `.band--sunk` had no consumer before this page.** The homepage duplicates
  `.band-inner` as `.product-band-inner` instead of using it. **M7 must drop the `.band--sunk`
  half of its dead-class item** — `.slide-in-left` is still genuinely dead, `.band--sunk` is not.
- **`section.band` added to `styles.base.css`.** A `<section>` is self-centring
  (`styles.sections.css:12-18`), so banding one full-bleed means undoing that or the
  `.band-inner` gutter doubles. Three lines, and it is why Recognition and Academic are real
  `<section>` elements rather than the `<div>` the homepage had to use. Academic was a `<div
  class="section-full">` only because `.section-full` was the sole full-bleed mechanism at the
  time; it is a genuine document section and now says so.
- **Three tokens added** — `--scrim`, `--scrim-strong`, `--shadow-lift`. Named in
  `styles.base.css`, which is exempt from both colour budgets, which is the point.
- `UNSTYLED_CLASSES` 6 → 5 (`credentials-grid` has a rule now). Per-breakpoint `font-size`
  gone: the file re-declared sizes across all three tiers against the "one system" note at
  `styles.base.css:43`, and `@media (min-width: 1440px)` existed for nothing else, so it is
  deleted outright.

### M2.3 — Capsar · `capsar.css` (530 lines, 39 aliases, 5 hex)

- [x] Design pass — Capsar <!-- size: L; done: 2026-08-21 -->
      Nine blocks on one paper ground became paper → sunk → paper → sunk → paper →
      **dark** → paper. Platform Preview is the `.band--dark` product moment; `.band-inner`,
      `.band--sunk` and `.band--tight` had been defined since the redesign with zero call
      sites, and Capsar is their first consumer. The pain and module grids moved onto the
      hairline-grid idiom the homepage already uses four times, which took the file's only
      `box-shadow` and both `translateY` hover lifts with it, and pain card 03 (privacy —
      the thing Capsar actually differentiates on) now carries the accent weight instead of
      four identical cells. The step flow's 56px circles became squared mono numerals on a
      hairline connector; the comparison table lost its radius for a heavier rule under the
      header, as on privacy.
- [x] Legacy aliases → direct tokens — `capsar.css` <!-- size: M; done: 2026-08-21 -->
      50 uses, not the 39 this heading estimated: `--border-subtle` 14, `--bg-card` 7,
      `--text-tertiary` 7, `--bg-primary` 6, `--text-secondary` 4, `--text-primary` 3,
      `--border` 3, `--accent-glow` 3, `--accent-dim` 2, `--bg-card-hover` 1. Now zero.
      Four `rgba(201, 165, 90, …)` borders — the retired gold theme, invisible to the hex
      check because they are not hex — went with them, and the 11 `font-size` declarations
      sitting inside `@media` blocks moved onto the fluid `--step-*` scale. The
      `min-width: 1440px` and `2560px` blocks existed only to set sizes and are gone.
- [x] Radii → `--r-*` — `capsar.css` <!-- size: S; done: 2026-08-21 -->
      22 hardcoded values (14px, 12px×4, 10px×3, 8px×3, 6px×2, 4px×5, 3px×2) against four
      tokens. Most surfaces are square now; the panels take `--r-md`, the chips `--r-sm`,
      and the only circle left is the 7px chrome dot.
- [x] `HEX_BUDGET['capsar.css']` lowered <!-- size: S; done: 2026-08-21 -->
      Removed from the table entirely — `testColourBudget` falls back to `|| 0`, so the
      file's budget is now zero and any new literal fails. Note the check does **not** strip
      comments: naming the old values in a comment counted against the budget until they
      were reworded out.

**Closed 2026-08-21.** `npm run check` green, `bash deploy.sh --check` validates 16 pages, and
`grep` finds no alias token and no hex literal left in `capsar.css`. Verified by eye at 1440 and
390: no horizontal overflow (`document.body.scrollWidth` is exactly the viewport), the comparison
table still scrolls inside its own container, and the 5-column step and module grids collapse to one.

Three things surfaced by reading the file rather than by the milestone's own scope:

- **`.eir-cross-link` was defined where two of its three consumers could never see it.** Used on
  `capsar`, `bep-checklist` and `eir-checklist`; its only rule was in `capsar.css`, which neither
  checklist page loads, under a comment claiming it lived in `bep-checklist.css` — that file
  defines `.eir-cross-link-wrap`, a different class. `testEveryClassHasARule` cannot catch this:
  it unions every rule in `css/` regardless of which page loads which file, so "defined but
  unreachable" reads to it as defined. The block rule moved to `styles.sections.css`; Capsar's own
  top margin is `.capsar-cross-link`. **The two checklist pages consequently render that block
  styled for the first time** — that is a visible change on two pages outside M2.3, and it is the
  defect being fixed rather than a side effect of it.
- **The comparison table's "With Capsar" header was `--accent` text** — 3.7:1 on paper, an AA
  failure, in the one column the table exists to sell.
- **The module standfirst borrowed `.page-hero-sub`**, which carries a load-time `fadeUp`. ~2,500px
  down the page that entrance always finished before anyone scrolled to it, and it overlapped the
  `.fade-in` reveal on the section around it.

Two smaller notes for the milestones that follow. `.section-full-inner--narrow` is deleted — Capsar
was its only consumer, and the beta CTA now uses `.band-inner` plus a Capsar-owned
`.capsar-cta-inner`; `.section-full` and `.section-full-inner` stay, since `about.njk` still uses
them. And the two mockup families were rendering differently from the same markup: `.mockup-screen`
declared no `background`, so it inherited a near-black inside `.capsar-proof-visual` and white
inside `.screenshot-mockup`. They share one panel definition now — panel `--band-raised`,
everything inset `--band`, every hairline `--band-rule` — matching `.product-panel` on the
homepage, with the three macOS traffic-light dots replaced by the house single `--accent` dot.

### M2.4 — BEP checklist · `bep-checklist.css` (807 lines, 61 aliases, 49 hex)

- [x] Design pass — BEP checklist <!-- size: L; done: 2026-08-21 -->
      Zero `.band*` across the whole page before this. The tool is a full-bleed `.band--sunk`
      work surface now, so the cards read as sheets on a bench rather than boxes on the same
      ground they sit on, and the report moved out of `.bep-tool` into its own paper `.band`
      below it — the output, on clean stock. The sticky score card became the page's one
      tonal contrast event: a `--band` panel with mono numerals. Mono took every numeral and
      metadata register (section index, progress counts, breakdown, report meta, verdict chip,
      footer), the 60px pill progress bars flattened to 3px hairline tracks, and the
      section-by-section list became a ruled register instead of nine bordered boxes.
      The diagnosis cards carry a 2px status edge rather than being a fourth equal hairline box.
- [x] Legacy aliases → direct tokens — `bep-checklist.css` <!-- size: L; done: 2026-08-21 -->
      65 references across 12 alias names, not the 61 in the heading — the same undercount
      every other M2 page has. Now zero. The field and label rules went too rather than being
      ported: `.bep-project input[type="text"]` and friends were a duplicate of the global
      rules in `styles.ui.css`, written before those existed.
- [x] Radii → `--r-*` — `bep-checklist.css` <!-- size: M; done: 2026-08-21 -->
      14px ×3, 16px, 12px ×3, 10px, 8px ×3, 5px and 99px ×5 against four tokens. Most surfaces
      are square now; the panels take `--r-md`, the chips and the checkbox `--r-sm`, and the
      progress tracks lost their radius entirely — a 3px hairline does not need one.
- [x] `HEX_BUDGET['bep-checklist.css']` lowered <!-- size: M; done: 2026-08-21 -->
      Removed from the table, so the budget is zero and any new literal fails. `RGB_BUDGET`
      went with it: the file was carrying 17 `rgba()` colours the hex check cannot see, four
      of them `rgba(201, 165, 90, …)` — the retired gold — and two white-on-dark hover tints
      that were invisible on paper.

**Closed 2026-08-21.** `npm run check` green, `bash deploy.sh --check` validates 16 pages, and
`grep` finds no alias, no hex and no `rgba()` literal left in `bep-checklist.css`. Verified by eye
at 1440 and 390, EN and IT: `document.documentElement.scrollWidth` equals the viewport on both
checklist pages at both widths.

The milestone's own scope was the smaller half of what the file was hiding.

- **The three band colours were painted on the wrong surface.** `#a6d69c`, `#e8c27d` and `#e89c8c`
  were mixed for the pre-redesign near-black ground and compute to **1.57:1, 1.60:1 and 2.09:1** on
  paper. The readiness verdict — the one sentence a diagnostic exists to deliver — was the least
  readable text on the page, and the same three values were doing the same thing on the EIR page.
  This is the `--white` failure again, one theme later. The fix ran in two directions: the shared
  status ramp in `styles.base.css` (added by the M2.5 session; `--ok-text` / `--warn-text` /
  `--risk-text` plus wash and line tones, every pairing AA-verified) carries the report and print,
  and an `*-on-band` trio added beside it keeps the original three values on the dark score panel
  they were designed for.
- **The print stylesheet was a second theme.** ~120 lines converting a dark site to paper, every
  rule `!important`, on a colour set of its own. The site *is* paper now and the ramp is
  print-safe, so it collapsed to page furniture — what to drop, where to break, and a token
  override putting true-white stock under it. Colour is inherited rather than restated.
- **`<legend>` is laid out in the fieldset's border notch**, so the project-card title straddled
  the top rule and ignored the card's padding on both checklists. A legend leaves that layout only
  if it is floated or absolutely positioned — and floating it alone is worse: the next block is a
  grid or flex container, establishes its own formatting context, sits *beside* the full-width
  float in the 0px left over and spills its columns out of the card. Float plus a `clear` on
  everything after it.
- **The report's secondary CTA was invisible.** `.bep-report-cta` became a dark panel without
  being `.band--dark`, so the global `.band--dark .btn-outline` rule never applied and "Learn about
  Capsar.io" rendered near-black on near-black. Caught in a screenshot, fixed with the
  `.btn-outline--on-dark` modifier that already existed for exactly this.
- **`.form-group` and `.form-note` had no global rule at all** — their only definitions in the repo
  were descendant selectors inside the two checklist stylesheets, which is why the homepage
  lead-magnet form rendered an unstyled label and a body-copy caption. Promoted to
  `styles.ui.css`, which empties `PAGE_SCOPED_EXCEPTIONS` and pays off an M6 line item early, the
  way M2.1 pre-paid this milestone with `.page-hero-note`.

Guardrail: `testStylesheetsParse` walks every file in `css/` and fails on a `}` arriving at depth 0
or a block left open at EOF. A stray brace is not a parse *error* — the browser silently discards
rules until it resynchronises — and this pass left exactly one behind a deleted block, which
swallowed `.bep-report-header` while the file still looked fine and the suite still passed. Brace
*counting* would not have caught it either, since a missing open and a stray close cancel out; the
depth walk is what does. Both branches were verified to fail before being committed green.

`--ok-on-band`, `--warn-on-band` and `--risk-on-band` were added to `styles.base.css` alongside the
M2.5 ramp rather than as a second set — see the note under M2.5.

### M2.5 — EIR Health Check · `eir-checklist.css` (520 lines, 33 aliases, 49 hex)

Shares the `.bep-*` scaffolding with M2.4 — run it straight after, and most of the work is
inherited.

- [x] Design pass — EIR Health Check <!-- size: M; done: 2026-08-21 -->
      The page carried **zero** `.band*` blocks. It now takes the structure M2.4 gave the BEP
      checklist: the tool is a `band band--sunk` working surface and the report a `band` sheet
      below it, so the two read as worksheet then output. The 0–3 scale stopped being four
      floating pills and became one hairline-divided control — it is a single axis from 0 to 3
      and now looks like one — and the gap cards lost the gold gradient wash they were still
      wearing a whole redesign later.
- [x] Legacy aliases → direct tokens — `eir-checklist.css` <!-- size: M; done: 2026-08-21 -->
      39 uses, not the 33 in the heading above — every M2 page is understated the same way, per
      the note under M2.2. Now zero. 515 → 415 lines: `.eir-tool`, the `.eir-project` field and
      label rules and an `@media` block restating the `.bep-layout` breakpoint were all
      redeclaring what `bep-checklist.css` or `styles.ui.css` already set on a page that loads
      both.
- [x] Radii → `--r-*` — `eir-checklist.css` <!-- size: S; done: 2026-08-21 -->
      12px, 10px, 8px and the `50%` rank circle onto `--r-sm` / `--r-md` / `--r-pill`.
- [x] `HEX_BUDGET['eir-checklist.css']` lowered <!-- size: M; done: 2026-08-21 -->
      Removed from the table entirely, and from `RGB_BUDGET` with it — 49 hex and 7 `rgba()`
      to zero, so any new literal fails.

**Closed 2026-08-21.** `npm run check` green, `bash deploy.sh --check` validates 16 pages, and the
page was driven end to end in a headless browser at 1440 and 390: no horizontal overflow
(`document.body.scrollWidth` is exactly the viewport at both), no console errors, the 4-column
scale collapsing to 2 and the gap grid to 1.

Five defects surfaced by the pass rather than by its scope, all fixed here:

- **The report CTA was invisible.** The markup carries `bep-report-cta eir-cta-block`, M2.4 made
  `.bep-report-cta` a dark panel, and `eir-checklist.css` loads second — so `.eir-cta-block` won
  the *background* with a light `--paper-sunk` while `.bep-report-cta` kept the *colour* at
  `--band-text`. Measured at **1.02:1**, with the "Need help closing the gaps?" heading unreadable
  on the one block the page converts through. The surface belongs to `.bep-report-cta` now.
- **"Email me the report" was invisible too**, and separately: `.btn-outline` is `--ink` on a
  transparent ground, and on the dark panel that is ink-on-`--band` — the same colour, **1.00:1**.
  `styles.ui.css` has carried a `.btn-outline--on-dark` modifier all along; the descendant rule
  beside it only matches inside `.band--dark`, which a dark *panel* is not.
- **The top-3 gap cards never gridded.** `.eir-gap-grid` had `repeat(3, 1fr)` and no call site —
  `#eirReportGaps` carried an id and no class — so the three cards the report exists to deliver
  stacked full-width, while the PDF export gridded them 3-up through its own wrapper. Same for
  `.eir-breakdown`. `testEveryClassHasARule` checks markup→CSS and cannot see a rule with no
  markup; that direction is still the *Sweep the dead CSS rules* watch-list item.
- **Focus was invisible on every rating control.** The checked and focus states were a 16%-alpha
  orange `box-shadow` picked against the old near-black ground. The inputs are `opacity: 0`, so on
  paper a keyboard user had no indicator at all. Now a real `2px solid var(--accent)` outline.
- **The exported PDF was still the pre-redesign brand, and half of it was unstyled.**
  `buildExportStyles()` in `js/eir-checklist.js` is a standalone document — it loads none of
  `css/`, which is exactly why both colour budgets are blind to it and how gold `#b68a33`,
  `#c9a55a` buttons and **Instrument Serif** survived in the one artefact a client actually
  receives. Worse, fourteen of its rules named `.eir-export-gap*` / `.eir-export-row*`, which are
  generated nowhere: `buildReport()` emits `.eir-gap-*` and `.eir-breakdown-*`, so the gap cards
  and the twelve-question breakdown printed as bare text. Rebuilt on Technical Light against the
  class names the markup actually uses. **`js/bep-checklist.js` has the same defect and is not
  fixed** — see the watch list.

`--ink-tertiary` (`#767C85`) is the one thing this pass deliberately did **not** fix: it computes
to **4.0:1 on `--paper` and 3.69:1 on `--paper-sunk`**, so it fails AA for normal text everywhere
it is used. An audit of the finished page counted 122 failing text nodes before this pass and 22
after; the 22 left are all `--ink-tertiary` outside M2.5 — the global footer headings and
copyright, `.page-hero-note`, `.form-note`, and `.bep-*` metadata. Changing one token repaints all
16 pages, so it is on the watch list rather than smuggled in here.

**Done when, per page:** zero legacy aliases in its stylesheet, `HEX_BUDGET` entry lowered,
`npm run check` green, and a visual check via `npm start` at desktop and mobile widths. For the two
checklists, `node scripts/tests/smoke/eir-smoke.test.js` as well.

---

## M3 — Delete the aliases and close the door

Only after M2 is complete.

- [x] Delete the alias block at `css/styles.base.css:99-106` <!-- size: M; done: 2026-08-22 -->
      Thirteen names, at `styles.base.css:142-164` by the time it was deleted — the line
      numbers in the label above are from the day this file was written. Zero consumers left
      in `css/`: M2 took the last one off them, so the deletion changed no rendering
      anywhere. In their place is a note saying why there is nothing there.
- [x] Add `LEGACY_TOKEN_BUDGET` to `ui-ux.test.js`, modelled on `HEX_BUDGET` <!-- size: M; done: 2026-08-22 -->
      It starts at zero and can only go down. A reintroduced `var(--text-primary)` fails the build.
      `testLegacyTokenBudget` counts **declarations as well as uses**, which is the half that
      matters: a stray `var(--text-primary)` was already caught by `testEveryTokenIsDefined`,
      and the obvious way to make that failure go away is to put the alias block back — which
      restores exactly the drift the deletion ends, and reads to every other check in the file
      as well-formed CSS with every token declared. `styles.base.css` is therefore **included**
      rather than exempt, unlike in the two colour budgets. Comments are stripped first, also
      unlike `testColourBudget`, because the note left where the block used to be names the
      tokens on purpose. Both branches — a use in `about.css`, a re-declaration in
      `styles.base.css` — were verified to fail before being committed green.

**Closed 2026-08-22.** `npm run check` green, `bash deploy.sh --check` validates 16 pages, and the
**Done when** grep returns nothing. `--white` is on the list too, though it was deleted before this
milestone: it is the reason the milestone exists, and a list that closes the door on thirteen names
while leaving the fourteenth spellable is not closed.

The one place a retired name still lives is `buildExportStyles()` in `js/bep-checklist.js`, which
declares its own `--border` inside a standalone export document with none of `css/` behind it. Same
spelling, unrelated token, and deliberately out of the check's reach — the budgets read `css/`, and
that file is the *Port the BEP export view onto Technical Light* watch-list item.

**Done when:** `grep -rn "var(--text-primary\|--bg-elevated\|--border-subtle" css/` returns nothing,
`npm run check` green.

---

## M4 — IT parity

After M2, so no markup is translated that is about to change.

### M4.1 — Italian Builds mirror

- [x] Translate the page, voice `io` + `tu`, terminology per `docs/LOCALIZATION_IT.md` <!-- size: L; done: 2026-08-22 -->
      The page's own prose lives in `src/it/builds.njk`; the cards live in the data. `IT_CATEGORIES`,
      `IT_BUILDS` and `IT_SHOTS` in `src/_data/builds.js` carry only the translatable fields and are
      overlaid onto the English lineup, so repo, slug, stack, captures and `noUi` still exist once.
      A build with no IT entry falls back to its English string rather than rendering a blank card.
- [x] Prose counts read from `src/_data/builds.js` (`total`, `totalWord`, `shots`) — never typed <!-- size: M; done: 2026-08-22 -->
      `totalWord` did only produce English, so it was extended rather than worked around: `WORDS`
      and `MONTHS` are now keyed by language and `builds.lang[lang]` is the per-language view a
      template opens with. The EN page had one typed count of its own — `seven months`, beside a
      `builds.months` that was already derived — and it is now `monthsWord` on both pages.
- [x] Anchor IDs and JS-referenced IDs left identical to EN <!-- size: S; done: 2026-08-22 -->
      `#markets`, `#delivery`, `#games`, `#tools` come from the shared data, so they cannot diverge.
      `testBuildsPage` now runs over both languages against that one module.
- [x] Set `hasMirror: true` on the EN Builds page <!-- size: S; done: 2026-08-22 -->

### M4.2 — Italian EIR Health Check mirror

- [x] Translate the page <!-- size: L; done: 2026-08-22 -->
- [x] Handle the diagnostic strings in `js/eir-checklist.js` <!-- size: M; done: 2026-08-22 -->
      The BEP route — `document.documentElement.lang === 'it'` picking one of two literal tables —
      was already stubbed in here and the questionnaire was already translated. What was missing was
      the last three literals written straight into the DOM: `Top gap` on every gap card, the
      `Your Clarity Report` label heading the export document, and a `(noein terms)` scar where
      `(no proprietary lock-in)` had been find/replaced. All three are `I` keys now.
- [x] Set `hasMirror: true` on the EN EIR page <!-- size: S; done: 2026-08-22 -->
- [x] `node scripts/tests/smoke/eir-smoke.test.js` still green <!-- size: S; done: 2026-08-22 -->
      It also grew a fourteenth block that runs the IT page through the same JS. That branch had
      never executed anywhere: the questions, bands, gap cards and the entire export document are
      written by JS, so `it-translation.test.js` cannot see them — it reads static markup. 61 checks.

**Closed 2026-08-22.** `node scripts/tests/it-translation.test.js` green across 9 pairs, `npm run
check` green, `bash deploy.sh --check` validates 18 pages. The IT copy was self-checked against the
pre-commit checklist in `LOCALIZATION_IT.md`: no `Lei`/`Vi`/`voi` as reader address, no `noi` as
speaker, no em-dash as a sentence-internal pause (the ones that remain are title separators and the
`&mdash;` placeholder in an empty score band), and the English-stay terms left untranslated.

Two things found while wiring the pages in, both fixed here because they are the same failure the
mirrors were meant to end. `it/capsar.njk` pointed its two EIR cross-links at `{{ prefix }}eir-checklist.html`
— the English page — with the Italian BEP link sitting right beside them; and `it/index.njk` and
`it/services.njk` sent their "public builds" links to GitHub, because there was no IT Builds page to
send them to. The IT homepage also regained the two offer cards it never had and `it/bep-checklist.njk`
the EIR cross-link its English twin carries. `builds.TotalWord` moved to `builds.lang[lang].TotalWord`
at its three EN call sites on `index` and `services` in the same pass.

Left deliberately different: the IT homepage's dark product band previews the BEP checklist where EN
previews the EIR check. That is a positioning choice for the Italian market, not a translation gap.

One thing found and not fixed here, because it is EN copy rather than a translation: the BEP
checklist's own front-matter description says **7 sections** where the tool renders 9, and the EIR
page's cross-link to it says 35 checks across 9 — which is the true number. On the watch list.

**Done when:** `node scripts/tests/it-translation.test.js` green across 9 pairs instead of 7, plus a
self-check against the pre-commit checklist in `LOCALIZATION_IT.md` — the test does not catch voice.

---

## M5 — Visual proof

The conversion gap the redesign identified: twelve builds have an interface, three had a
screenshot. Nine do now, carrying 23 frames between them.

- [x] Capture the missing screenshots per `docs/BUILDS_SCREENSHOTS.md` <!-- size: L; done: 2026-08-22 -->
      Six repos captured in one pass with the shared runner
      (`C:\Personal_utilities\screenshot-kit\`) rather than one-off Playwright scripts:
      `W4_AgenticSupplyChain`, `F8_F13Screener`, `F9_CongressTrading`, `W7_ZoningVisualiser`,
      `W5_Mindmap`, `H2_TimeBlock_Planner`. Each keeps its own `shotkit.config.mjs`, so the
      next capture is one command in that repo instead of relearning how the app boots; the
      header comment in each records what broke the first time. Two repos needed something
      written into them first — a seeder for the planner's empty database
      (`scripts/seed-demo-day.mjs`) and an invented meeting transcript for the mind map
      (`samples/client-kickoff.txt`) — because both apps screenshot as an empty shell
      otherwise, and the alternative was putting real data on a public page.
- [x] Add each `shot` to `src/_data/builds.js` — the derived stats follow on their own <!-- size: M; done: 2026-08-22 -->
      Fourteen new frames, EN alt text plus the IT overlay in `IT_SHOTS`. `withUi` went from
      11 to 12 on its own once `W4` left `NO_UI`; nothing else was typed.
- [x] Confirm every remaining empty slot is a genuine `noUi: true` build <!-- size: S; done: 2026-08-22 -->
      It was not. `W4_AgenticSupplyChain` was flagged `noUi` while its own repo shipped a
      React dashboard, an SSE pipeline view and a working screenshot config — the flag
      recorded that nobody had looked, not that there was nothing to see. It now carries four
      frames, and `H9_Voice_Transcriber` is the only genuine `noUi` build left.

**Closed 2026-08-22.** `npm run check` green, `node scripts/tests/it-translation.test.js`
green across 9 pairs, `bash deploy.sh --check` validates 18 pages.

**Addendum, same day — the Capsar page.** M5 was scoped to the Builds cards, and closing it made
the remaining gap obvious: the page that sells the product was still illustrating it with CSS
skeletons, grey bars in a browser frame. Seven captures from Capsar's own `shotkit.config.mjs`
replace them — the BEP wizard, the assembled BEP at export, the TIDP dashboard, the MIDP charts,
the dependency matrix, the LOIN tables and DC Manager — carried in `src/_data/capsar.js` on the
`builds.js` pattern, with an `IT_SHOTS` overlay so the mirrors cannot show different screenshots.
The grid went from three columns to two, because at a third of the band a real dashboard reads as
noise. Still open: no capture exists of the **EIR Responsiveness Matrix**, which is a modal the
shot kit does not reach — it was the caption on one of the placeholders, and rather than illustrate
it with another screen, that panel left the page. Capturing it is the one thing that would finish
this section.

Four slots stay empty, none of them for want of trying, and the reasons are worth keeping
separate:

- `H9_Voice_Transcriber` — genuinely `noUi`. CLI only.
- `W8_NoeinSolLandingPage` — this site. The page is the screenshot.
- `W6_DCWizard` — **blocked.** Needs two-legged ACC OAuth credentials, and everything it
  would render is client project files. Unblocking it means seeding a synthetic ACC project,
  not finding the credentials.
- `W5_JobAlertBot` — **held, deliberately.** It runs and it would screenshot well. But
  `data/jobs.db` is a live job search and `data/profile.json` is a real CV, and a capture of
  it publishes Andrea's own job hunt on his consulting site. That is a positioning decision,
  not a technical one. If it ships, it ships as the aggregate views only.

One capture is honest but partial. `W7_ZoningVisualiser` ships the what-if calculator over
inner London rather than the England-scale choropleth, because without
`NEXT_PUBLIC_PMTILES_URL` the app falls back to a bundled twenty-MSOA sample and there is no
carpet of data to colour. The frame shows the mechanism — constraints switched off, premium
falling from 13.8–32.1% to 4.7–11% — and is worth re-capturing once the pipeline has run and
the tiles are on R2.

---

## M6 — Homepage: cut the duplication, make it one argument

One pass EN, one IT. Independent of M2 (the homepage was rebuilt in Redesign Phase 2 and is not in
the M2 page list), so it can run in parallel or first.

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
- [ ] **Fix the mobile hero alignment — `.hero-actions` half only; the eyebrow was done in M1.**
      `css/styles.responsive.css` centred `.hero-label` and `.hero-actions` at ≤968px for *every*
      hero, though it was written for `.hero-inner--split` (About; Capsar uses `--centered`, which
      no breakpoint touches). The `.hero-label` rules are now scoped to `.hero-inner--split`,
      verified at 390px across all nine EN pages: the seven left-aligned heroes have the eyebrow
      flush with the `h1`, About and Capsar stay centred. `.hero-actions` is still unscoped —
      invisible on the homepage, where the buttons are full-width at that size, so it needs a pass
      over the pages whose CTAs are not.
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

Best run after M6 (no point animating blocks that are about to be cut) and before the M2 page
passes, so each page pass applies the primitives rather than inventing them.

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
committed to this cycle.

- [ ] Sweep the dead CSS rules <!-- size: L -->
      `styles.sections.css` is at 820 lines and the test suite covers markup→CSS, not CSS→markup: no
      guardrail catches a rule nothing uses any more. A sweep is warranted but needs manual
      page-by-page verification, so it is not planned as a timed milestone.
- [ ] Port the BEP export view onto Technical Light <!-- size: M -->
      `buildExportStyles()` in `js/bep-checklist.js` is still the pre-redesign brand: `--accent:
      #b68a33` gold, `#c9a55a` toolbar buttons, and **Instrument Serif** on every heading. The
      *Design direction* section says that face does not return and that "no rule references it
      anywhere in `css/`" — both true, and both miss it, because the export view is a standalone
      document written from `js/`. Neither `HEX_BUDGET` nor `RGB_BUDGET` can see it: they read
      `css/` only. This is the PDF a client actually receives. M2.5 did the EIR half
      (`js/eir-checklist.js`) because that was its page; the BEP half is the same edit against
      the same class names and was left rather than silently widening M2.4.
- [x] Fix `--ink-tertiary` — it fails AA everywhere it is used <!-- size: M; done: 2026-08-21 -->
      `#767C85` computed to **4.00:1 on `--paper`**, **3.69:1 on `--paper-sunk`** and **4.21:1 on
      `--paper-raised`** — under 4.5:1 on every ground it is used on. Not a checklist problem: the
      global footer headings and copyright line put it on all 16 pages, alongside
      `.page-hero-note`, `.form-note`, the language switcher and the checklist metadata. Fixed by
      darkening the token 14 points along the same hue to `#686E77` (**4.51 / 4.88 / 5.14**)
      rather than by moving call sites onto `--ink-secondary`, which would have collapsed the
      three-step ink scale into two and left the footer failing anyway. Verified by re-running the
      browser sweep across all 16 pages, EN and IT, with hidden report panels revealed and every
      `<details>` opened: **0 failing text nodes**, down from 122 before the M2.4/M2.5 passes.
      **Follow-up for M2.5:** the `.eir-*` blocks moved onto `--ink-secondary` as a workaround can
      go back to `--ink-tertiary` now, so the two checklists read the same.

      Guardrail: `testInkOnPaperClearsAA` pairs each of `--ink` / `--ink-secondary` /
      `--ink-tertiary` with each of `--paper` / `--paper-sunk` / `--paper-raised` and does the
      WCAG sum on the declared hex. Pure arithmetic, no browser. Deliberately narrow — it checks
      the tokens against the grounds they are designed for, not every pairing a component might
      make — but it is exactly the check whose absence let a text token ship at 3.69:1. Verified
      to fail on the value that actually shipped.
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
