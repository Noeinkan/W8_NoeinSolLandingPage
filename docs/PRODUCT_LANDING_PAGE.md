# Product

Internal product brief for the Noein Solutions web presence: **who it serves, what it is trying to achieve, and what is out of scope.**

For *how* the repo works — file tree, conventions, bilingual workflow, tests, deploy — see `CLAUDE.md`. This document deliberately does not repeat it.

Last updated: 2026-08-20.

## Product Summary

Noein Solutions is a bilingual static website. The current production state is **practitioner mode**: the site surfaces Andrea Aita's credentials, tools, and resources without actively selling consulting engagements. The commercial site lives archived in git and is restored on demand — see `docs/PRE_LEAVE_LONG_TERM_PLAN.md` (gitignored, local only) and the deploy tag `production-commercial-2026-06-11`.

This repository's jobs in practitioner mode:

- Give recruiters and hiring managers a credibility surface they can verify quickly.
- Present Capsar.io as a standalone product.
- Provide the BEP and EIR diagnostics as genuinely useful self-assessments, funnelling qualified users to the app.

The Capsar application itself lives in a separate repository and is deployed independently at `app.noeinsolutions.com`.

## Who It Serves

- Recruiters and hiring managers evaluating Andrea for contract roles in the UK or EU.
- Teams assessing Capsar.io for BEP and EIR workflows.
- Practitioners looking for a credible BEP or EIR readiness diagnostic.
- English- and Italian-speaking visitors who should see materially equivalent journeys.

## Product Positioning

- Practitioner-led, not agency-led.
- ISO 19650-native and delivery-oriented.
- Premium but pragmatic: high-trust, low-fluff, commercially direct.
- Privacy-aware in product messaging, especially for Capsar.io.
- Built for sectors where confidentiality, governance, and adoption matter more than generic BIM marketing claims.

## Primary User Journeys

1. **Recruiter validation** — lands on the homepage or about page, checks sector background, scale, credentials, and contract availability. `builds.html` extends this with verifiable code.
2. **Capsar evaluation** — lands on the Capsar page, understands the problem framing, sees the workflow and module coverage, then clicks through to the app.
3. **Diagnostic-led** — uses the BEP or EIR checklist, gets a scored result, and is pushed toward the Capsar app.
4. **Language switch** — moves between EN and IT pages without losing structure, navigation, or conversion intent.

## Conversion Points

- Capsar app click-throughs to `app.noeinsolutions.com`
- BEP / EIR checklist completions and their Capsar CTAs
- Lead-magnet form submissions (FormSubmit.co)
- Outbound GitHub clicks from `builds.html` (technical credibility for recruiters and peers)

## What Good Looks Like

- A visitor can understand Andrea's background and Capsar's value in under 30 seconds.
- Proof points (credentials, scale, ISO 19650 specialism) are visible before the user has to hunt for them.
- Each page has a clear next action into the Capsar app.
- The Italian version preserves intent and trust, not just literal translation.
- Capsar is the active product surface; everything else is supporting trust.

## Constraints

- The deployed artefact is static HTML/CSS/vanilla JS. Eleventy exists in `src/` as a build path for the same pages, but nothing client-side may depend on a build step or a framework.
- Bilingual updates require EN and IT parity for any user-facing page change.
- Hreflang, canonical, and JS-referenced IDs must stay valid.
- Capsar application behaviour is outside this repository.
- Analytics must remain gated, and privacy claims must stay accurate.

## Out Of Scope

- Capsar application code, auth, data model, and backend services
- CRM or pipeline tooling
- Blog, CMS, or news publishing workflow
- Ecommerce or self-serve checkout
- Detailed internal operating procedures for delivery engagements
- Published pricing — practitioner mode does not quote rates on the site
