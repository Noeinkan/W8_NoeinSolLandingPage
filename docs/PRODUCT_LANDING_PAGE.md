# Product

Internal product brief for the Noein Solutions web presence and the parts of the offer this repository is responsible for presenting.

Last updated: 2026-05-26.

## Product Summary

Noein Solutions is a bilingual static website for Andrea Aita's digital delivery consulting practice.

This repository has three commercial jobs:

- Convert inbound consulting interest into booked calls or direct enquiries.
- Give recruiters and hiring managers a credibility surface they can verify quickly.
- Present Capsar.io as both a standalone product and proof of delivery-domain depth.

This repo does not contain the Capsar application itself. It contains the marketing, trust, and conversion layer around the consulting offer and the product.

## Who It Serves

- Infrastructure, aviation, and regulated AEC teams that need information management, BEP, EIR, or programme digital delivery support.
- Recruiters and hiring managers evaluating Andrea for contract roles in the UK or EU.
- Teams assessing Capsar.io for BEP and EIR workflows.
- English- and Italian-speaking visitors who should see materially equivalent journeys.

## Core Offers Represented In The Site

- Information Management & Strategy
- BEP & EIR Production
- Programme Digital Delivery
- Capsar.io
- BEP Readiness Checklist lead magnet / diagnostic

## Product Positioning

- Practitioner-led, not agency-led.
- ISO 19650-native and delivery-oriented.
- Premium but pragmatic: high-trust, low-fluff, commercially direct.
- Privacy-aware in product messaging, especially for Capsar.io.
- Built for sectors where confidentiality, governance, and adoption matter more than generic BIM marketing claims.

## Primary User Journeys

### 1. Consulting buyer journey

Visitor lands on the homepage or a service page, validates credibility via proof points and case studies, then books a call or sends a message.

### 2. Recruiter validation journey

Recruiter lands on the homepage or about page, checks sector background, scale, credentials, contract availability, and then moves to contact.

### 3. Capsar evaluation journey

Visitor lands on the Capsar page, understands the problem framing, sees the workflow and module coverage, then clicks through to the app or consulting services.

### 4. Diagnostic-to-service journey

Visitor uses the BEP checklist, gets a readiness result, and is pushed toward a relevant service or conversation.

### 5. Language-switch journey

Visitor moves between EN and IT pages without losing structure, navigation, or conversion intent.

## Product Surfaces In This Repo

| Surface | Purpose | Primary outcome |
| --- | --- | --- |
| `index.html` | Main positioning and proof page | Book a call, view services, view case studies |
| `about.html` | Founder credibility and credentials | Trust building, contact continuation |
| `services.html` | Commercial offer definition and pricing anchors | Service selection, contact |
| `case-studies.html` | Proof of delivery and outcomes | Trust building, enquiry progression |
| `capsar.html` | Product marketing for Capsar.io | Click-through to app, service cross-sell |
| `bep-checklist.html` | Interactive diagnostic and lead magnet | Self-qualification, service CTA |
| `contact.html` | Conversion endpoint | Calendly booking or form submission |
| `privacy.html` | Compliance and trust support | Risk reduction during conversion |
| `it/*.html` | Italian mirrors of the same journeys | Equivalent trust and conversion for IT visitors |

## Current Conversion Points

- Calendly booking links
- Contact form submissions
- Capsar app click-throughs to `app.noeinsolutions.com`
- BEP checklist completions and report/download actions
- Navigation flows into services, case studies, and contact pages

## What Good Looks Like

- A visitor can understand the offer in under 30 seconds.
- Proof points are visible before the user has to hunt for them.
- Each page has a clear next action.
- The Italian version preserves intent and trust, not just literal translation.
- Capsar is clearly differentiated from consulting while still reinforcing the consulting offer.

## Constraints

- Static stack only: HTML, CSS, vanilla JS. No framework, no build step, no npm.
- Bilingual updates require EN and IT parity for any user-facing page change.
- Hreflang, canonical, and JS-referenced IDs must stay valid.
- Capsar application behavior is outside this repository.
- Analytics must remain gated and privacy claims must stay accurate.

## Operational Rules

- Mirror every EN content change in the matching `it/` page unless the change is intentionally English-only.
- If a new public page is added, update hreflang links and `sitemap.xml`.
- Run `node ui-ux.test.js`, `node it-translation.test.js`, and `bash deploy.sh --check` before deployment-relevant changes ship.
- Keep pricing, product claims, and credential statements aligned with `PRICING.md`, the live pages, and Andrea's actual offer.

## Out Of Scope

- Capsar application code, auth, data model, and backend services
- CRM or pipeline tooling
- Blog, CMS, or news publishing workflow
- Ecommerce or self-serve checkout
- Detailed internal operating procedures for delivery engagements

## Source Documents

- `CLAUDE.md`
- `PRICING.md`
- `UI_UX_ANALYSIS.md`
- Public page copy in `index.html`, `services.html`, `capsar.html`, and `contact.html`