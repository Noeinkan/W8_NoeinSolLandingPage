# Product

Internal product brief for the Noein Solutions web presence and the parts of the offer this repository is responsible for presenting.

Last updated: 2026-06-11 (practitioner-mode update).

## Product Summary

Noein Solutions is a bilingual static website. The current production state is **practitioner mode**: the site surfaces Andrea Aita's credentials, tools, and resources without actively selling consulting engagements. The commercial site lives archived in git and is restored on demand — see `PRE_LEAVE_LONG_TERM_PLAN.md` (gitignored, local only) and the deploy tag `production-commercial-2026-06-11`.

This repository's jobs in practitioner mode:

- Give recruiters and hiring managers a credibility surface they can verify quickly.
- Present Capsar.io as a standalone product.
- Provide the BEP Readiness Checklist as a useful self-diagnostic, funnelling qualified users to the app.

The Capsar application itself lives in a separate repository and is deployed independently at `app.noeinsolutions.com`.

## Who It Serves

- Recruiters and hiring managers evaluating Andrea for contract roles in the UK or EU.
- Teams assessing Capsar.io for BEP and EIR workflows.
- Practitioners looking for a credible BEP readiness diagnostic.
- English- and Italian-speaking visitors who should see materially equivalent journeys.

## Core Surfaces In The Site (practitioner mode)

- Capsar.io (product page)
- BEP Readiness Checklist (interactive diagnostic)
- About + privacy (trust surface)

## Product Positioning

- Practitioner-led, not agency-led.
- ISO 19650-native and delivery-oriented.
- Premium but pragmatic: high-trust, low-fluff, commercially direct.
- Privacy-aware in product messaging, especially for Capsar.io.
- Built for sectors where confidentiality, governance, and adoption matter more than generic BIM marketing claims.

## Primary User Journeys

### 1. Recruiter validation journey

Recruiter lands on the homepage or about page, checks sector background, scale, credentials, and contract availability.

### 2. Capsar evaluation journey

Visitor lands on the Capsar page, understands the problem framing, sees the workflow and module coverage, then clicks through to the app.

### 3. Diagnostic-led journey

Visitor uses the BEP checklist, gets a readiness result, and is pushed toward the Capsar app.

### 4. Language-switch journey

Visitor moves between EN and IT pages without losing structure, navigation, or conversion intent.

## Product Surfaces In This Repo

| Surface | Purpose | Primary outcome |
| --- | --- | --- |
| `index.html` | Main positioning and proof page | Capsar evaluation, BEP checklist, BEP/DD credibility |
| `about.html` | Founder credibility and credentials | Trust building, contact continuation |
| `capsar.html` | Product marketing for Capsar.io | Click-through to app, service cross-sell |
| `bep-checklist.html` | Interactive diagnostic and lead magnet | Self-qualification, Capsar / contact CTA |
| `privacy.html` | Compliance and trust support | Risk reduction during conversion |
| `it/*.html` | Italian mirrors of the same journeys | Equivalent trust and conversion for IT visitors |

## Current Conversion Points

- Capsar app click-throughs to `app.noeinsolutions.com`
- BEP checklist completions and Capsar CTAs
- Privacy link (compliance / trust)

## What Good Looks Like

- A visitor can understand Andrea's background and Capsar's value in under 30 seconds.
- Proof points (credentials, scale, ISO 19650 specialism) are visible before the user has to hunt for them.
- Each page has a clear next action into the Capsar app.
- The Italian version preserves intent and trust, not just literal translation.
- Capsar is the active product surface; everything else is supporting trust.

## Constraints

- Static stack only: HTML, CSS, vanilla JS. No framework, no build step, no npm.
- Bilingual updates require EN and IT parity for any user-facing page change.
- Hreflang, canonical, and JS-referenced IDs must stay valid.
- Capsar application behavior is outside this repository.
- Analytics must remain gated and privacy claims must stay accurate.

## Operational Rules

- Mirror every EN content change in the matching `it/` page unless the change is intentionally English-only.
- If a new public page is added, update hreflang links and `sitemap.xml`.
- Run `node scripts/tests/ui-ux.test.js`, `node scripts/tests/it-translation.test.js`, and `bash deploy.sh --check` before deployment-relevant changes ship.
- Keep pricing, product claims, and credential statements aligned with `PRICING.md`, the live pages, and Andrea's actual offer.

## Out Of Scope

- Capsar application code, auth, data model, and backend services
- CRM or pipeline tooling
- Blog, CMS, or news publishing workflow
- Ecommerce or self-serve checkout
- Detailed internal operating procedures for delivery engagements

## Source Documents

- `CLAUDE.md`
- `PRICING.md` (gitignored — internal only)
- `docs/UI_UX_ANALYSIS.md`
- Public page copy in `index.html`, `capsar.html`, and `bep-checklist.html`