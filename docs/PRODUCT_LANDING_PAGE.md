# Product

Internal product brief for the Noein Solutions web presence: **who it serves, what it is trying to achieve, and what is out of scope.**

For *how* the repo works — file tree, conventions, bilingual workflow, tests, deploy — see `CLAUDE.md`. This document deliberately does not repeat it.

Last updated: 2026-08-20.

## Product Summary

Noein Solutions is a bilingual static website. The current production state is **business mode**: the site actively sells consulting engagements. Practitioner mode — which ran from `9850c16` and carried no services page, contact page, form or booking route — ended on 2026-08-20.

The positioning is **the intersection**: ten years of AEC delivery *and* the ability to ship working software. That combination is the scarce thing being sold; the public repositories on `builds.html` are the evidence for its second half, and Capsar.io is the proof the two halves combine.

This repository's jobs:

- Convert a qualified visitor into a booked 30-minute call.
- Explain what can actually be bought, and in what shape.
- Present Capsar.io as a standalone product.
- Provide the BEP and EIR diagnostics as genuinely useful self-assessments that qualify their own users.

The Capsar application itself lives in a separate repository and is deployed independently at `app.noeinsolutions.com`.

## Who It Serves

- Client-side and contractor teams buying information management, BEP/EIR production, or an AI/automation sprint.
- Programmes needing embedded or retained delivery leadership.
- Teams assessing Capsar.io for BEP and EIR workflows.
- Practitioners looking for a credible BEP or EIR readiness diagnostic.
- Recruiters and hiring managers, still served by `about` and `builds` as a secondary audience.
- English- and Italian-speaking visitors who should see materially equivalent journeys.

## Product Positioning

- Practitioner-led, not agency-led — one pair of hands, no bench to feed.
- The intersection: domain expertise **and** the ability to build. Neither half alone is the offer.
- ISO 19650-native and delivery-oriented.
- Premium but pragmatic: high-trust, low-fluff, commercially direct.
- Privacy-aware in product messaging, especially for Capsar.io.
- Built for sectors where confidentiality, governance, and adoption matter more than generic BIM marketing claims.

## Primary User Journeys

1. **Buyer journey** — lands on the homepage, reads the intersection claim, goes to `services.html` to see what can be bought, and books a call or sends a brief from `contact.html`.
2. **Recruiter validation** — lands on the homepage or about page, checks sector background, scale, credentials, and availability. `builds.html` extends this with verifiable code.
3. **Capsar evaluation** — lands on the Capsar page, understands the problem framing, sees the workflow and module coverage, then clicks through to the app.
4. **Diagnostic-led** — uses the BEP or EIR checklist, gets a scored result, and is offered a call at the moment of highest intent.
5. **Language switch** — moves between EN and IT pages without losing structure, navigation, or conversion intent.

## Conversion Points

- **Booked calls via Calendly** — the primary conversion, reachable from every selling page
- **Briefs submitted from `contact.html`** (FormSubmit.co)
- Capsar app click-throughs to `app.noeinsolutions.com`
- BEP / EIR checklist completions and their Capsar CTAs
- Lead-magnet form submissions (FormSubmit.co)
- Outbound GitHub clicks from `builds.html` (technical credibility for recruiters and peers)

## What Good Looks Like

- A visitor can understand Andrea's background and Capsar's value in under 30 seconds.
- Proof points (credentials, scale, ISO 19650 specialism) are visible before the user has to hunt for them.
- Every page offers a way to start a conversation, and that route survives a blocked third-party script.
- The Italian version preserves intent and trust, not just literal translation.
- Capsar is the active product surface; the services page is the active commercial surface.

## Constraints

- The deployed artefact is static HTML/CSS/vanilla JS, built from `src/` by Eleventy. Nothing client-side may depend on a framework.
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
- Published pricing — rates are scoped on enquiry, never listed on the site
