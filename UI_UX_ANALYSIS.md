# Noein Solutions — UI & UX Analysis

> **Site:** [noeinsolutions.com](https://noeinsolutions.com)
> **Audit date:** 3 April 2026
> **Stack:** Static HTML/CSS/JS (no framework, no build step)

---

## 1. Site Structure & Architecture

### 1.1 File Tree

```
W8_NoeinSolLandingPage/
├── index.html              # Home / landing page
├── about.html              # About Andrea Aita
├── services.html           # Service offerings (3 anchored sections)
├── case-studies.html        # Portfolio — expandable case cards
├── capsar.html             # Capsar.io product/marketing page
├── contact.html            # Contact — Calendly booking + message form (tabbed)
├── css/
│   └── styles.css          # Single global stylesheet (~2 400 lines)
├── js/
│   └── main.js             # Single JS file (~190 lines, IIFE)
├── assets/
│   └── headshot.jpg        # Headshot photo (used on index + about)
├── deploy.sh               # Rsync/tar deploy to server
├── nginx.conf              # Standalone nginx config
├── landing-block.conf      # Docker nginx server block
├── DEPLOYMENT.md           # Deployment docs
└── Andrea_Aita_CV_EN.pdf   # CV (not linked from any page)
```

### 1.2 Page Map & Navigation Flow

```
                ┌──────────────┐
                │   index.html │  (Home)
                └──────┬───────┘
       ┌───────┬───────┼───────┬──────────┐
       ▼       ▼       ▼       ▼          ▼
    about    services  case   capsar    contact
    .html    .html    studies  .html     .html
                       .html
```

Every page shares an identical `<nav>` and `<footer>`. Navigation is a fixed top bar with 6 links:

| Link | Target | Notes |
|------|--------|-------|
| Home | `index.html` | — |
| About | `about.html` | — |
| Services | `services.html` | — |
| Case Studies | `case-studies.html` | — |
| Capsar.io | `capsar.html` | — |
| **Get in Touch** | `contact.html` | Styled as CTA button (`nav-cta`) |

The active page is highlighted via JS-based `nav-active` class matching the current pathname.

---

## 2. Visual Design System

### 2.1 Colour Palette

| Token | Hex | Role |
|-------|-----|------|
| `--bg-primary` | `#0a0a0c` | Page background — near-black |
| `--bg-elevated` | `#111114` | Elevated sections (stats bar, Capsar banner, testimonials) |
| `--bg-card` | `#16161a` | Card backgrounds |
| `--bg-card-hover` | `#1c1c21` | Card hover state |
| `--border` | `#2a2a30` | Primary border |
| `--border-subtle` | `#1e1e24` | Subtle dividers |
| `--text-primary` | `#e8e6e3` | Headings, body |
| `--text-secondary` | `#9a9898` | Paragraphs, descriptions |
| `--text-tertiary` | `#6a6868` | Labels, captions |
| `--accent` | `#c9a55a` | Gold accent — CTA buttons, highlights, labels |
| `--accent-dim` | `#a8873f` | Dimmed accent (timeline, icons) |
| `--accent-glow` | `rgba(201,165,90,0.12)` | Soft glow backgrounds |
| `--white` | `#ffffff` | Hover states, hero headings |

**Overall vibe:** Dark, premium, editorial. Black background with warm gold accent creates a luxury/professional feel. Very low colour diversity — almost monochromatic with gold as the sole brand colour.

### 2.2 Typography

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display / Headings | **Instrument Serif** (Google Fonts) | 400, italic | h1, h2, h3, stat numbers, logo, card titles |
| Body / UI | **DM Sans** (Google Fonts) | 300, 400, 500, 600 | Paragraphs, labels, buttons, nav links |

- Headings use `clamp()` for fluid sizing: e.g. `clamp(2.8rem, 5vw, 4.2rem)` for the home hero h1.
- Italic serif is used as a stylistic emphasis for key phrases inside headings (wrapped in `<em>` tags, coloured with `--accent`).
- Body text is set at 0.88rem–1.1rem with generous line-height (1.6–1.8).
- Letter-spacing is micro-tuned: labels at 0.12em, body at 0.02em.

### 2.3 Iconography

- All icons are **inline SVGs** — no icon library, no external sprite sheet.
- Consistent style: stroke-based, 1.5px stroke width, no fill.
- Icons appear inside 40–56px rounded-square containers with `accent-glow` background.
- Favicon is a data-URI SVG: dark rounded square with gold letter "N" in Georgia serif.

### 2.4 Imagery

- **Single photo** in the entire site: `assets/headshot.jpg` (Andrea Aita portrait).
- Used in two places: home "Who's Behind This" section and about page hero.
- Displayed with `object-fit: cover`, slight grayscale filter (20%) that clears on hover.
- Photo container has a decorative offset gold border accent behind it.
- **No other images** — the site is entirely text + SVG-driven.
- Capsar.io page has **placeholder boxes** for screenshots (dashed-border boxes with description text — no actual product screenshots).

### 2.5 Spacing & Layout

- Max content width: **1200px** (scales to 1400px at 1440px+, 1600px at 1800px+).
- Section padding: `6rem 2rem` base, increasing to `8rem 3rem` → `10rem 4rem` on larger screens.
- Grid system: CSS Grid throughout, no framework. Common patterns:
  - 3-column grids for cards (value props, services, testimonials, screenshots)
  - 2-column grids for case studies, pain points, service blocks, contact layout
  - 4-column grid for stats and credentials
  - 5-column grid for Capsar modules and step flow
- Gap values: typically 1.5rem for card grids, 3–4rem for content columns.

---

## 3. Component Library

### 3.1 Navigation Bar

- **Fixed** to top, `z-index: 100`.
- Semi-transparent background (`rgba(10,10,12,0.85)`) with `backdrop-filter: blur(20px)`.
- Shrinks on scroll via `nav-scrolled` class (padding reduces, opacity increases).
- Logo: text-based "Noein." with gold period.
- CTA button: gold background, dark text, transitions to white on hover.
- Mobile: hamburger toggle (3-line → X animation), full-width dropdown menu.
- Active link styling: gold colour for current page.

### 3.2 Buttons

Two variants:

| Variant | Style | Hover |
|---------|-------|-------|
| `.btn-primary` | Gold background, dark text | White background, lift shadow |
| `.btn-outline` | Transparent, border, white text | Gold border + text, lift |

- Padding: `0.85rem 1.75rem`, border-radius: `8px`.
- Hover adds `translateY(-2px)` lift.
- Focus-visible states with `2px solid accent` outline on all interactive elements.

### 3.3 Section Labels

- Uppercase, small (0.75rem), gold colour, letter-spacing 0.14em.
- Preceded by a 20px gold horizontal line (`::before` pseudo-element).
- Pattern: `[label] → [h2 title] → [subtitle paragraph] → [content]`.

### 3.4 Cards

Multiple card types, all sharing similar DNA:

| Card Type | Used On | Columns | Features |
|-----------|---------|---------|----------|
| Value cards | Home (Why Noein) | 3 | Icon, h3, paragraph, gold top-line on hover |
| Service cards | Home (Services preview) | 3 | Icon, h3, paragraph, arrow link, clickable |
| Testimonial cards | Home | 3 | Stars, blockquote, avatar circle + name |
| Pain-point cards | Capsar.io | 2 | Numbered (01–04), h3, paragraph |
| Module items | Capsar.io | 5 | Small icon, h4, short description |
| Credential cards | About | 4 | Icon, h4, subtitle |
| Case study cards | Case Studies | 2 | Accordion — click to expand |

Common card traits:
- Background: `--bg-card` → `--bg-card-hover` on hover.
- Border: `1px solid --border-subtle`, transitions to `--border` on hover.
- Border-radius: `12px`.
- Hover: `translateY(-4px)` lift + gold top-border reveal via `::before`.

### 3.5 Hero Sections

Two hero patterns:

1. **Full-width centred** (home, Capsar.io): label → h1 → subtitle → CTA buttons, all centred. Uses animated grid-line glow effect in background.
2. **Split layout** (about): 2-column grid — text left, photo right. Photo wrapper has decorative corner accents.
3. **Page hero** (services, case studies, contact): compact top hero with label → h1 → subtitle, left-aligned.

Hero glow: SVG-based grid pattern with radial mask, floating animation (`@keyframes float` — 14s cycle).

### 3.6 Stats Bar

- Full-width `--bg-elevated` background.
- 4-column grid showing animated counter numbers.
- Numbers animate on scroll intersection (eased cubic, 1600ms duration).
- Uses `data-count`, `data-prefix`, `data-suffix` attributes for counter config.

### 3.7 "Previously At" Logo Bar

- Full-width strip below stats on home page.
- Text-based brand names (Foster + Partners, AECOM, Turner & Townsend, National Grid, Heathrow Airport, Google).
- Instrument Serif font, tertiary colour at 60% opacity, full opacity on hover.
- No actual logos — all typographic.

### 3.8 Timeline (About Page)

- Vertical left-border line with gradient (gold → dim → transparent).
- Dot markers at each entry (`::before` circles with gold border).
- 3 entries: AECOM/National Grid, Turner & Townsend/Heathrow, Foster + Partners.

### 3.9 Comparison Table (Capsar.io)

- Full-width table with `border-collapse: separate`.
- Rounded corners via `overflow: hidden`.
- Three columns: category, "Without Capsar", "With Capsar".
- "With Capsar" column header is gold; its cells are primary text colour (brighter).

### 3.10 Contact Page Tabs

- Two tabs: "Book a call" and "Send a message", controlled via `data-tab` attributes.
- Tab buttons styled as pill-like links; active tab gets gold background.
- Tab content shows/hides via `contact-tab--active` class.
- Hash-based deep linking (`#booking`, `#message`) supported.

### 3.11 Contact Form

- Formsubmit.co for backend processing (no server-side code).
- Fields: Name, Email, Company, Service (dropdown), Message (textarea).
- Hidden fields: subject, captcha bypass, redirect URL, honeypot.
- Client-side validation: required checks + email regex.
- Invalid fields get red border (`#c0392b`).

### 3.12 Calendly Embed

- Inline widget via `calendly-inline-widget` div.
- Themed to match site: dark background (`0a0a0c`), light text (`e8e6e3`), gold primary (`c9a55a`).
- Wrapped in rounded card container.

### 3.13 Footer

- 3-column grid: brand + tagline, page links, contact details (email, LinkedIn, location).
- Copyright line below a subtle border.
- Consistent with nav in link structure.

---

## 4. Animations & Interactions

### 4.1 Scroll-triggered Fade-in

- Any element with `.fade-in` starts at `opacity: 0` + `translateY(20px)`.
- `IntersectionObserver` (threshold 0.1, rootMargin `-40px`) adds `.visible` class.
- Transition: `0.7s` with custom `ease-out` bezier.

### 4.2 Hero Entrance

- Staggered `@keyframes fadeUp` animations with increasing delays:
  - Label: 0.2s delay
  - h1: 0.35s delay
  - Subtitle: 0.5s delay
  - CTA buttons: 0.65s delay
- Creates a cascading reveal from top to bottom.

### 4.3 Counter Animation

- Stats bar numbers count from 0 to target on first intersection.
- Cubic ease-out (`1 - (1-t)^3`), 1600ms duration.
- Fires only once (`statsAnimated` flag).

### 4.4 Hover Effects

- Cards: lift (`translateY(-4px)`) + border colour change + background darken + gold top-line reveal.
- Buttons: lift (`translateY(-2px)`) + colour/background change + shadow.
- Service card arrows: `translateX(4px)` on hover.
- Photos: grayscale filter clears on hover.
- Logo bar items: opacity 0.6 → 1.0 on hover.

### 4.5 Background Effects

- **Noise overlay:** `body::before` with SVG fractalNoise filter at 4% opacity, fixed position, covers entire viewport. Creates subtle texture.
- **Hero glow:** Decorative grid patterns with gradient masking and floating animation.
- **Capsar badge pulse:** Animated dot (`@keyframes pulse` — 2s opacity cycle).

### 4.6 Smooth Scroll

- `html { scroll-behavior: smooth }` globally.
- JS-based smooth scroll for anchor links.
- Tab switches include `scrollIntoView` with smooth behaviour.

### 4.7 Case Study Accordion

- Click header to expand/collapse card body.
- Only one card open at a time (others close automatically).
- Body uses `max-height` transition (0 → 800px).
- Toggle button rotates chevron 180deg when open.

---

## 5. Page-by-Page Content Analysis

### 5.1 Home (`index.html`)

**Sections in order:**
1. Hero — tagline + 2 CTAs (Book a call, View services)
2. Stats bar — 4 metrics (10+ years, £9bn value, 500+ trained, 50% error reduction)
3. Previously At — 6 brand names
4. Why Noein — 3 value prop cards
5. Services preview — 3 linked service cards
6. Capsar.io banner — product promotion with 2 CTAs
7. Testimonials — 3 client quotes in card grid
8. Who's Behind This — photo + bio + credentials + links
9. Contact CTA — centred call-to-action with 3 buttons
10. Footer

**UX observations:**
- Strong information hierarchy: clear progression from problem → differentiation → services → product → social proof → personal credibility → CTA.
- Multiple CTAs distributed throughout, all funnelling to `contact.html`.
- "Previously At" builds trust early before diving into value propositions.
- The page is long (10 sections) but each section is distinct and visually separated.

### 5.2 About (`about.html`)

**Sections in order:**
1. Hero — split layout with photo + bio + CTAs
2. Career timeline — 3 entries
3. Credentials — 4 qualification/award cards
4. How I Work — text-heavy philosophy statement + CTA
5. Footer

**UX observations:**
- Personal, narrative-driven — builds trust through career history.
- Split hero puts the face front-and-centre.
- No redundant "about the company" — it's clearly about a solo consultant.

### 5.3 Services (`services.html`)

**Sections in order:**
1. Page hero with 3 jump-nav links
2. Information Management & Strategy (problem/solution/deliverables/outcome/pricing)
3. BEP & EIR Production (problem/solution/BEP deliverables/EIR deliverables/outcome/pricing)
4. Programme Digital Delivery (problem/solution/deliverables/outcome/pricing)
5. Footer

**UX observations:**
- Jump navigation at the top enables direct access to any service.
- Each service follows a consistent problem → solution → deliverables → outcome → pricing → CTA pattern.
- Pricing is transparent: £650/day or scoped, £2,500–£3,500 for BEPs, £1,500 for EIR advisory.
- "Enquire" CTA at the end of each section links to contact page.

### 5.4 Case Studies (`case-studies.html`)

**Sections in order:**
1. Page hero
2. 4 accordion case study cards in 2-column grid
3. Contact CTA section
4. Footer

**Case studies:**
| # | Tag | Title | Metrics |
|---|-----|-------|---------|
| 1 | Programme Delivery | Digital Delivery Framework for National Infrastructure | 40+ partners, 100% compliance, 6mo adoption |
| 2 | BEP Production | BEP Production for Tier 1 Contractor Bid | 5 days, 100% coverage, Won bid |
| 3 | Information Requirements | EIR Review & Supply Chain Readiness | 30+ requirements, 85% quality improvement, 3 weeks |
| 4 | IM Strategy | CDE Governance & Reporting for Regional Contractor | 15 projects, 90% adoption, 60% fewer queries |

**UX observations:**
- Accordion pattern works well for dense case study content.
- Metrics provide quick scanning; quotes add credibility (though currently marked as "placeholder").
- Client names are anonymised — appropriate for B2B consulting.

### 5.5 Capsar.io (`capsar.html`)

**Sections in order:**
1. Hero with 2 CTAs (Try Capsar.io, BEP consulting services)
2. Pain points — 4 problem cards
3. How It Works — 5-step visual flow
4. Platform — 10 module grid
5. Comparison table — Without vs. With Capsar
6. Privacy callout — data sovereignty message
7. Platform preview — 3 screenshot placeholders
8. Beta CTA — early access call-to-action
9. Footer

**UX observations:**
- Classic SaaS landing page structure: problem → solution → features → comparison → trust → CTA.
- Screenshot section has only **placeholders** — no real product imagery.
- Privacy callout is well-positioned for the target audience (infrastructure/defence).
- Strong value proposition: "the only BEP tool that reads your EIR and writes your response."

### 5.6 Contact (`contact.html`)

**Sections in order:**
1. Page hero with tab navigation (Book a call / Send a message)
2. Booking tab — info panel + Calendly embed
3. Message tab — info panel + contact form
4. Footer

**UX observations:**
- Tabbed interface reduces cognitive load — user picks their preferred channel.
- Both tabs show alternative contact methods (email, LinkedIn, location).
- Each tab has a cross-link to the other tab ("Or book a call instead" / "Or send a message instead").
- Hash-based deep linking allows direct links: `contact.html#booking` or `contact.html#message`.

---

## 6. Responsive Behaviour

### 6.1 Breakpoints

| Breakpoint | Target |
|------------|--------|
| ≤ 640px | Mobile phones |
| ≤ 968px | Tablets, small laptops |
| ≥ 1440px | Large desktops |
| ≥ 1800px | Ultra-wide monitors |

### 6.2 Mobile Adaptations (≤ 640px)

- Navigation collapses to hamburger menu with full-width dropdown.
- All multi-column grids collapse to single column.
- Hero padding reduces; font sizes scale down.
- Stats grid goes to 2×2.
- Contact tabs stack vertically.
- Calendly embed min-height reduces to 580px.
- Footer goes to single column.

### 6.3 Tablet Adaptations (≤ 968px)

- Split hero becomes single column (photo moves above text).
- Services, value props, case studies → single column.
- Stats grid becomes 2×2.
- Module grid becomes 3-column.
- Step flow becomes 3-column (connecting line hidden).
- About preview stacks with centred photo.
- "Previously At" bar stacks vertically.

### 6.4 Large Screen Enhancements (1440px+, 1800px+)

- Max content width increases to 1400px / 1600px.
- All font sizes scale up proportionally.
- Padding increases for more breathing room.
- Cards get more internal padding.
- Hero photo increases to 380×470px / 420×520px.
- Nav padding and font sizes increase.

---

## 7. Technical Implementation

### 7.1 Performance Considerations

| Aspect | Implementation | Assessment |
|--------|---------------|------------|
| CSS | Single file, ~2400 lines | No minification, no critical CSS extraction |
| JS | Single file, ~190 lines, IIFE pattern | Lightweight, no dependencies |
| Fonts | Google Fonts (DM Sans + Instrument Serif) | Preconnect + preload used; still render-blocking |
| Images | Single JPG, lazy-loaded | Minimal image weight |
| Icons | Inline SVGs | No external requests, but duplicated across pages |
| External deps | Calendly widget JS (contact page only) | Loaded async |
| Build step | None | No bundling, minification, or optimisation pipeline |

### 7.2 SEO & Meta

- Every page has unique `<title>`, `<meta description>`, OG tags.
- Canonical URLs set on all pages.
- Semantic HTML: `<nav>`, `<section>`, `<footer>`, `<blockquote>`.
- No `<main>` element on any page.
- No structured data (JSON-LD) for business or person schema.
- No sitemap.xml or robots.txt found.

### 7.3 Accessibility

| Feature | Status |
|---------|--------|
| `aria-label` on toggle buttons | Yes |
| `aria-expanded` on hamburger | Yes |
| `aria-required` on form fields | Yes |
| Focus-visible styles | Yes (gold outline on all interactive elements) |
| Keyboard navigation | Supported via native HTML + focus styles |
| Skip-to-content link | Not present |
| Alt text on images | Present on headshot |
| Colour contrast | Dark bg + light text generally good; `--text-tertiary` (#6a6868) on `--bg-primary` (#0a0a0c) may fail WCAG AA for small text |
| Reduced motion support | Not implemented |
| Screen reader semantics | No `<main>` landmark; sections lack `aria-label`s |

### 7.4 Form Handling

- Backend: [Formsubmit.co](https://formsubmit.co) — free third-party form endpoint.
- Anti-spam: honeypot field (`_honey`), CAPTCHA disabled.
- Redirect: returns user to `contact.html` after submission.
- Client-side validation runs on submit; server-side validation handled by Formsubmit.

---

## 8. UX Strengths

1. **Clear value proposition** — the home page hero immediately communicates what Noein does and for whom.
2. **Trust-building flow** — stats → brand names → differentiation → services → social proof → personal credibility creates a compelling narrative.
3. **Transparent pricing** — rare for consulting; builds trust and pre-qualifies leads.
4. **Multiple CTAs without being pushy** — "Book a call", "Send a message", "Email directly" distributed naturally through content.
5. **Consistent visual language** — every page feels like part of the same brand.
6. **Tabbed contact page** — reduces decision paralysis by separating booking and messaging.
7. **Deep linking** — contact page supports hash-based tab selection for precise linking.
8. **Fast load** — minimal assets, no framework overhead, single CSS/JS files.
9. **Responsive design** — comprehensive breakpoints from mobile to ultra-wide.
10. **Animated counters and fade-ins** — add polish without being distracting.

---

## 9. UX Weaknesses & Improvement Opportunities

1. **No product screenshots** — Capsar.io page has placeholder boxes; real UI imagery would dramatically increase conversion.
2. **Placeholder testimonial citations** — case study quotes cite "(placeholder)" — undermines credibility.
3. **No `<main>` landmark** — screen readers can't identify the primary content region.
4. **No skip-to-content link** — keyboard-only users must tab through the entire nav on every page.
5. **No `prefers-reduced-motion` support** — animations play regardless of user system preferences.
6. **Noise overlay on `z-index: 9999`** — the `body::before` texture overlay sits above everything; may interfere with some interactions or devtools.
7. **Testimonial names may be fabricated** — "James Hartley — Laing O'Rourke", "Sarah Pemberton — Mace Group" etc. appear on the home page with avatar initials only. If real, photos would add credibility. If fictional, this is a trust risk.
8. **No 404 page** — missing pages will show the server's default error.
9. **No sitemap.xml or robots.txt** — minor SEO gap.
10. **CV PDF not linked** — `Andrea_Aita_CV_EN.pdf` exists in the repo but is not accessible from any page.
11. **Single-page CSS file** — at ~2400 lines, this will become difficult to maintain as the site grows.
12. **No analytics** — no Google Analytics, Plausible, or similar tracking visible in the HTML.
13. **No cookie consent** — Calendly and Google Fonts may set cookies; GDPR compliance is unclear.
14. **Capsar.io branding separation** — Capsar.io lives as a subpage of noeinsolutions.com rather than having its own domain/site, which may dilute its identity as a standalone product.
15. **No blog or content marketing** — for a consulting site in a niche industry, thought leadership content would strengthen SEO and authority.
16. **Logo bar uses text, not actual logos** — real client logos would be more visually impactful.

---

## 10. Design Pattern Summary

| Pattern | Implementation |
|---------|---------------|
| **Layout** | CSS Grid (no framework) |
| **Colour scheme** | Dark mode only (no light mode) |
| **Typography scale** | Fluid (`clamp()`) with 4 breakpoint overrides |
| **Component approach** | Flat CSS classes, no BEM or utility-class methodology |
| **State management** | CSS classes toggled via vanilla JS |
| **Animation strategy** | CSS transitions + IntersectionObserver triggers |
| **Form handling** | Third-party (Formsubmit.co) |
| **Booking** | Third-party embed (Calendly) |
| **Hosting** | Nginx on VPS (77.42.70.26), Docker container |
| **SSL** | Certbot / Let's Encrypt |
| **Deployment** | Manual rsync via `deploy.sh` |

---

## 11. Content Tone & Voice

- **Tone:** Confident, direct, slightly irreverent. Not corporate-speak.
- **Voice:** First person where Andrea speaks, third person for company descriptions.
- **Key phrases:** "actually works", "not just advice — actual delivery", "done properly", "not a theorist, not a tool vendor".
- **Audience:** Mid-to-senior AEC professionals (BIM managers, information managers, programme directors, bid managers).
- **Language level:** Technical but accessible — assumes familiarity with ISO 19650, BEP, EIR, CDE but explains value in plain English.

---

## 12. Competitive Positioning Signals

The site positions Noein Solutions through several deliberate differentiators:

1. **Solo practitioner vs. consultancy** — "Practitioner first. Consultant second." positions against larger firms.
2. **Technology + consulting hybrid** — Capsar.io is presented as a competitive moat (proprietary tooling).
3. **Named client brands** — Foster + Partners, AECOM, Google, National Grid, Heathrow signal tier.
4. **Transparent pricing** — unusual in consulting; signals confidence and anti-hidden-fee positioning.
5. **Programme scale** — "£9bn programme" is repeated as proof of scale capability.
6. **Autodesk 40 Under 40** — used as a third-party credibility marker.
7. **Privacy-first AI** — Capsar.io's "your data stays yours" differentiates from generic AI tools.
