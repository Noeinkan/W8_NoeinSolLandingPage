# Noein Solutions Landing Page

Static HTML/CSS/JS landing page for [noeinsolutions.com](https://noeinsolutions.com) — Andrea Aita's digital delivery consulting practice. No build step, no framework, no npm.

## File Structure

```
├── *.html              # 7 English pages (index, about, services, case-studies, capsar, contact, privacy)
├── it/*.html           # 7 Italian mirrors (same filenames)
├── css/
│   ├── styles.css      # Global styles + CSS custom properties (2,500 lines)
│   ├── about.css       # Page-specific overrides
│   ├── services.css
│   ├── capsar.css
│   └── case-studies.css
├── js/main.js          # Single IIFE bundle (all interactivity, analytics, animations)
├── assets/             # Images, lead magnet file, credential certs
├── deploy.sh           # Production deployment script
└── deploy/templates/   # Nginx + Docker Compose templates
```

## Key Conventions

- **CSS:** Vanilla CSS with custom properties. Dark theme, gold accent (`#c9a55a`). Fonts: `Instrument Serif` (headings), `DM Sans` (body) via Google Fonts.
- **JS:** Single IIFE in `js/main.js`. Vanilla ES5. Intersection Observer for scroll animations. Keyboard-accessible tabs/accordions.
- **HTML template:** Every page has: skip link, `<nav>` with language switcher, `<main id="main-content">`, consistent hero pattern (`.page-hero`), footer.
- **SEO:** Each page has canonical URL, hreflang alternates (en/it/x-default), OpenGraph tags, JSON-LD on homepage.
- **Accessibility:** ARIA labels, `aria-expanded`/`aria-selected` states, `prefers-reduced-motion` respected throughout.

## Bilingual Workflow

Every content change to an EN page must be mirrored in its `/it/` counterpart. When editing:
1. Make the change in the English file
2. Apply the equivalent change in `it/<same-file>.html`
3. Follow terminology in `LOCALIZATION_IT_GLOSSARY.md`
4. If adding a new page: add hreflang links to both versions, update `sitemap.xml`

## Deployment

Target: Hetzner VPS (`77.42.70.26`), Docker nginx at `/var/www/noeinsol/`.

```bash
bash deploy.sh           # Full deploy (preflight + sync + smoke test)
bash deploy.sh --check   # Preflight checks only (local validation)
bash deploy.sh --dry-run # Preview files to sync
bash deploy.sh --setup   # First-time setup with verbose logging
```

The script validates: all HTML files exist, every link/src/href resolves to a real file, each page has `<title>` and canonical. Post-deploy it smoke-tests HTTPS and verifies content.

## Testing

```bash
node ui-ux.test.js
```

Checks: unique IDs, ARIA semantics, form elements, accordion states, analytics ID gating, reduced-motion support.

## Analytics

- Google Analytics 4: `G-4VDKBC4ZQG`
- Microsoft Clarity: `wc4cpp95sy`
- Both gated in JS — won't load if IDs are placeholder values.

## Documentation

- `DEPLOYMENT.md` — full deployment guide and server architecture
- `LOCALIZATION_IT_GLOSSARY.md` — EN-IT terminology reference
- `LOCALIZATION_QA_CHECKLIST.md` — multilingual QA checklist
- `UI_UX_ANALYSIS.md` — design system documentation
