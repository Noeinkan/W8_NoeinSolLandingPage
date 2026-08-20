# Visual redesign — "Technical Light" direction

## Status (as of 2026-08-20)

| Phase | State |
|---|---|
| **0 — Clear the ground** | ✅ Done. No `#c9a55a`, canvas, particles, blobs or noise overlay remain anywhere in `css/`, `*.html` or `src/`. |
| **1 — Rebuild the token layer** | ✅ Done. Paper/ink/orange tokens and the fluid `--step-*` scale live in `css/styles.base.css`; Archivo + IBM Plex Mono are wired into both trees. |
| **2 — Rebuild the homepage** | ✅ Done. `index.html` is the only page carrying `.band--dark`. |
| **3 — Mirror to the Eleventy tree** | ⚠️ Partial. Head-level changes are mirrored, but the `{{ prefix }}` nav defect below is **still open**. |
| **4 — Remaining pages** | ⛔ Not started. `about`, `capsar`, `bep-checklist`, `eir-checklist`, `builds`, `privacy` and all IT mirrors still need their pass. **Scheduled in [ROADMAP.md](../ROADMAP.md) as M1–M4** — tick progress there, not here. |

**Open defect (Phase 3):** the wordmark is hard-coded `href="index.html"` without `{{ prefix }}` in
[src/_includes/partials/nav.njk:2](../src/_includes/partials/nav.njk#L2) and in
[it/index.html:77](../it/index.html#L77), so on IT pages the logo points at `/it/index.html`.

The Context section below describes the **pre-redesign** site, kept as the rationale for the direction. It is not a description of the current homepage.

---

## Context

The pre-redesign site was a single dark theme (`#0a0a0c`) with one warm-gold accent (`#c9a55a`), Instrument Serif headlines, hairline borders, a gold particle canvas, blurred blobs and an SVG noise overlay. It read as generic "premium consultant" — atmospheric, but it didn't signal what Andrea actually sells (rigorous, practitioner-built ISO 19650 tooling), and several things actively suppressed conversion:

- **The product was never shown.** The site sells Capsar.io plus two interactive diagnostics and contained zero screenshots of any of them.
- **Flat hierarchy.** Five identical `.value-card`s in a `repeat(3, 1fr)` grid (3 + 2 orphan row), four identical stats, four identical trust cards. Nothing directed the eye.
- **Low contrast.** `--text-secondary: #9a9898` on near-black never felt crisp.
- **The strongest credibility asset was plain text** — Foster + Partners / Turner & Townsend / Heathrow / Google set as unstyled words in `.logo-bar`.

**Chosen direction: Technical Light.** Warm off-white ground, Swiss grid with visible hairline rules like a drawing sheet, mono type for stats and metadata, oversized grotesk headlines, and full-bleed **dark bands** for product moments. Accent moves gold → **signal orange** (construction/AEC-native, and distinctive in a category where nearly every competitor is blue).

Outcome: a site that looks precise and engineered rather than luxury-generic, with real hierarchy and the product actually visible.

---

## Key structural fact — the dual tree

`.eleventy.js:7-11` passthrough-copies `css`, `js`, and `assets` from the project root. **The CSS tree is already shared** between the legacy root `*.html` (what deploys today) and the untracked `src/**/*.njk` Eleventy tree. So:

- Everything at the **token / CSS level lands in both trees automatically** — no duplication.
- Only **markup** changes need mirroring: edit `index.html`, then apply the same change to `src/en/index.njk`.

Note the two trees have already diverged (`_site/index.html` has a footer GitHub link that root `index.html` lacks, from `footerGithub: true` in `src/en/index.njk`). Reconcile that during the mirror step rather than letting it widen. Landing the Eleventy migration properly is out of scope here.

---

## Phase 0 — Clear the ground

Delete before restyling; this removes ~34% of the CSS and roughly halves the redesign surface.

1. Verify with a repo-wide grep across `*.html` and `src/**/*.njk` that these are referenced by nothing, then delete:
   - `css/services.css` (1,595 lines — services page removed in `9850c16`)
   - `css/home.css` (774 — stale duplicate; `.capsar-banner`, `.trust-band`, `.logo-bar`, `.lead-magnet`, `.about-preview` are each defined here *and* in `styles.sections.css`, where the live copies are)
   - `css/case-studies.css` (213), `css/contact.css` (210)
2. Inside the live bundle, remove rules that are provably dead:
   - `.nav-cta` block + its `!important`s ([styles.navigation.css:53-65](css/styles.navigation.css#L53-L65)) — no page renders the class
   - ~~`.hero-glow` / `.hero-glow-left`~~ — ✅ rules deleted with the canvas. The ten empty `<div class="hero-glow">` left behind in the markup were removed on 2026-08-20, once `UNSTYLED_CLASSES` in `ui-ux.test.js` made it clear they had outlived their CSS by a whole redesign.
   - `.value-card::after` radial wash ([styles.sections.css:173-183](css/styles.sections.css#L173-L183)) — `opacity: 0` with nothing ever setting it to 1
   - `--bg-card-hover` token — zero consumers
3. Update `CLAUDE.md`: it lists all four deleted files as active stylesheets ([CLAUDE.md:21-26](../CLAUDE.md#L21-L26)) and claims `styles.css` is "~2,550 lines" when it is an 11-line `@import` manifest.

Leave the ~700 lines in `styles.sections.css` serving removed pages (`.contact-*`, `.process-*`, `.offer-*`) alone for now — some classes are still used; sort during Phase 4.

---

## Phase 1 — Rebuild the token layer

All of this lands in [css/styles.base.css:7-31](css/styles.base.css#L7-L31), replacing the current `:root`. This is the highest-leverage step: today the accent is written literally as `rgba(201, 165, 90, …)` ~40 times and there are 14 distinct `border-radius` values, so the system has to exist before anything else is worth doing.

### Colour

```css
:root {
  /* Ground — warm off-white */
  --paper:        #FAF9F6;
  --paper-sunk:   #F2F0EA;   /* alternating band */
  --paper-raised: #FFFFFF;   /* cards */

  /* Ink */
  --ink:          #14161A;
  --ink-secondary:#4A5058;
  --ink-tertiary: #767C85;

  /* Rules — the drawing-sheet hairlines */
  --rule:         #DFDBD2;
  --rule-strong:  #C3BDB1;

  /* Accent — signal orange */
  --accent:       #F04E23;  /* fills, graphics, large type only */
  --accent-text:  #C0390F;  /* orange text on paper — 5.4:1, passes AA */
  --accent-wash:  rgba(240, 78, 35, 0.08);
  --accent-rgb:   240, 78, 35;   /* channel token, kills the literal rgba() sprawl */

  /* Dark band — inverted surface for product moments */
  --band:         #14161A;
  --band-raised:  #1D2026;
  --band-text:    #F5F3EE;
  --band-rule:    #2C3038;
}
```

**Contrast note (checked):** white text on `#F04E23` is only 3.68:1 and fails AA. Primary buttons must be **orange fill + near-black ink text** (5.53:1) — which is also the more distinctive look. Use `--accent-text` for any orange text on paper.

### Type

Retire Instrument Serif. New system, all Google Fonts, all variable:

- **Archivo** (500–800) — display. Grotesk with an engineered character; holds up at very large sizes with `letter-spacing: -0.03em`.
- **DM Sans** (400/500) — body. Already loaded, good at 1rem, keeps some continuity.
- **IBM Plex Mono** (500) — stat numerals, section labels, metadata, nav index numbers. This is the main "technical practitioner" signal and the cheapest way to make the page feel precise.

Because the type is tokenised (`--font-display` / `--font-body` / new `--font-mono`), swapping any of these later is a one-line change.

**Fix the three competing size systems.** `.hero h1` currently has a `clamp()`, a fixed mobile override ([styles.responsive.css:98](css/styles.responsive.css#L98), `:146`), *and* a fixed `5rem` at ≥1440px ([styles.responsive.css:200](css/styles.responsive.css#L200)) that exceeds the clamp ceiling. Replace with one fluid scale (`--step--1` … `--step-6`) and delete the per-breakpoint size overrides. Also drop the inverted copy sizing that *grows* body text as the viewport narrows ([styles.responsive.css:88-93](css/styles.responsive.css#L88-L93), `:139-144`).

### Space, radius, shadow, motion

- `--space-1` … `--space-16` on a 4px base; replace hard-coded rem literals as each component is touched.
- **Small radii are central to this direction** — `--r-sm: 2px`, `--r-md: 4px`, `--r-lg: 8px`, `--r-pill: 999px`. Most surfaces become square. This collapses the current 14 ad-hoc values.
- Light grounds need almost no shadow — use rules and tint instead. Keep one `--shadow-card: 0 1px 2px rgba(20,22,26,.04)` and one raised shadow for dark-band elements.
- Tokenise durations (`--dur-fast: .15s`, `--dur: .25s`, `--dur-slow: .4s`); keep the two existing easing curves.

### Retire the old atmosphere

Remove the `body::before` noise overlay ([styles.base.css:44-52](css/styles.base.css#L44-L52)), the three `blur(80px)` hero blobs ([styles.hero.css:31-58](css/styles.hero.css#L31-L58)), and the hero gradients. All belong to the dark-luxury mood.

**Also remove the particle canvas** — `<canvas id="heroCanvas">` at [index.html:95](index.html#L95) and its driver at [js/main.js:347-423](js/main.js#L347-L423). Beyond being off-direction it is an uncapped `requestAnimationFrame` loop redrawing ~3,300 dots forever with no visibility pause, its desktop gate is evaluated once at load so it never re-checks on resize, and it ignores `devicePixelRatio`. Delete the canvas element, the JS block, and the now-orphaned `.hero-canvas` CSS.

---

## Phase 2 — Rebuild the homepage

Work directly in [index.html](index.html) and the shared CSS, per the chosen rollout.

**Replace the fragile zebra striping first.** `main > section:nth-child(even)` ([styles.sections.css:107-120](css/styles.sections.css#L107-L120)) is driven by a mix of `<section>` and `<div>` children, so any reorder silently inverts it. Introduce explicit `.band`, `.band--sunk`, `.band--dark` classes and apply them per section.

Section by section:

1. **Nav** — the floating blurred pill becomes a flush bar on paper with a single bottom hairline. Mono for links. Keep the EN/IT switch markup and the `.lang-switch` behaviour intact.
2. **Hero** — left-aligned, not centred. Oversized Archivo headline, mono eyebrow (`01 / ISO 19650 TOOLING`), and a rule under the headline. Primary button = orange fill + ink text.
   - **Copy needs a rewrite**: "Building the tools I wished existed on every programme" is about Andrea, not the buyer's problem. Propose 2–3 buyer-framed alternatives during implementation for a decision — do not silently rewrite positioning.
3. **Stats** — drop the card treatment. Large IBM Plex Mono numerals separated by vertical hairlines, mono uppercase labels beneath. Keep the existing `data-count` counter animation ([js/main.js:42-70](js/main.js#L42-L70)) — it still works, only the styling changes.
4. **Logo bar** — keep as a typographic lockup (avoids the IP question of reproducing employer marks) but give it real structure: rules top and bottom, mono `PREVIOUSLY AT` label, names set in Archivo at consistent optical size.
5. **Value props → bento grid.** Fixes the 3 + 2 orphan row. Capsar becomes a wide feature cell containing a product panel; the two checklists get medium cells; About and Builds get small cells. Rewrite `.value-props` from `repeat(3, 1fr)` to an explicit grid-template with named areas.
6. **New: dark product band.** Full-bleed `--band` surface showing the Capsar/checklist UI — this is the single biggest conversion gap. See *Asset gap* below.
7. **About preview** — keep the two-column structure; restyle the photo with a hard 2px frame rather than the current `0 24px 64px` shadow, and set credential tags as mono chips with hairline borders.
8. **Lead magnet & Capsar banner** — restyle to the new tokens. Keep the form action, hidden fields, `#leadMagnetSuccess` and `#leadMagnetDownloadLink` IDs exactly as-is; `js/main.js` and the IT mirror both depend on them.
9. **Footer** — hairline-ruled columns, mono headings.
10. **Move the 7 inline `style=` attributes into classes** ([index.html:113](index.html#L113), `:149`, `:183`, `:191`, `:199`, `:207`, `:215`, `:345`).

### Asset gap — how the dark band gets filled

There are no product screenshots anywhere; `assets/builds/` contains only `.gitkeep`. Rather than block on that, **build the product panel as real HTML/CSS** — a scaled, non-interactive replica of the BEP checklist / EIR score UI, whose actual markup already exists in this repo (`bep-checklist.html`, `eir-checklist.html`, `css/eir-checklist.css`). This stays crisp at every resolution, needs no image pipeline, and is honest about what the tool looks like. Real screenshots can replace it later if wanted.

Two related items to flag, not fix here:
- `assets/og-image.jpg` is the headshot reused, declared `1200×630` in [index.html:13-14](index.html#L13-L14) but almost certainly the wrong aspect ratio.
- `assets/Intro + AI Wizard.mp4` is **51 MB and referenced by nothing** — and Eleventy passthrough-copies it into `_site/` on every build. Worth deleting separately.

---

## Phase 3 — Mirror to the Eleventy tree

For every markup change made in `index.html`, apply the equivalent to [src/en/index.njk](src/en/index.njk). Head-level changes (the Google Fonts link for Archivo / IBM Plex Mono, removal of the canvas) go in [src/_includes/base.njk:22-63](src/_includes/base.njk#L22-L63) — once, for all 12 pages — and in each root `*.html` head separately.

While in `nav.njk`: [src/_includes/partials/nav.njk:2](src/_includes/partials/nav.njk#L2) hard-codes `href="index.html"` without `{{ prefix }}`, so on IT pages the wordmark links to `/it/index.html`. Same defect exists in the hand-written `it/index.html:77`. Fix in both.

---

## Phase 4 — Remaining pages (after homepage sign-off)

Order: `about` → `capsar` → `bep-checklist` + `eir-checklist` (share `.bep-*` scaffolding) → `builds` → `privacy`. Then mirror all five IT pages per the bilingual workflow in `CLAUDE.md`, and re-run `it-translation.test.js`.

The page-specific stylesheets (`about.css` 476, `capsar.css` 500, `bep-checklist.css` 801, `eir-checklist.css` 520, `builds.css` 244) mostly consume the global tokens, so many will largely follow from Phase 1 — but each needs a pass for the hard-coded golds and radii.

---

## Verification

```bash
node scripts/tests/ui-ux.test.js            # structural regressions
node scripts/tests/smoke/eir-smoke.test.js  # EIR runtime (jsdom)
bash deploy.sh --check                      # link/href/canonical/title preflight
npm start                                   # dev-server.js — visual check at localhost
npx eleventy                                # confirm src/ still builds after markup mirroring
node scripts/tests/it-translation.test.js   # only once IT pages are touched (Phase 4)
```

Expect `ui-ux.test.js` to flag the bento-grid and stats restructure — review each failure and update assertions where the structure legitimately changed rather than reverting the markup.

Manual checks:
- Contrast: body text, `--accent-text` on paper, and ink-on-orange buttons all ≥4.5:1.
- `prefers-reduced-motion` still honoured ([styles.utilities.css:186-205](css/styles.utilities.css#L186-L205)).
- Keyboard focus rings visible on the new light ground — the current `2px solid var(--accent)` needs re-checking against paper.
- Mobile: confirm the bento grid collapses to a sensible single-column narrative rather than a pile of equal cards.

---

## Decisions deferred to implementation

1. **Hero copy** — buyer-framed alternatives to be proposed for sign-off before replacing current positioning.
2. **Real screenshots vs. HTML replica** in the dark band — starting with the replica; swap later if wanted.
3. Whether Instrument Serif returns as a pull-quote face for testimonials.
