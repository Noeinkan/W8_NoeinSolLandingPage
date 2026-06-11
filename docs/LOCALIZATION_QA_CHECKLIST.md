# EN/IT Localization QA Checklist

## Language toggle

- [ ] Every EN page links to its matching IT page from nav (`IT`).
- [ ] Every IT page links back to its matching EN page from nav (`EN`).
- [ ] Toggle target pairs are correct for all pages.

## SEO and metadata

- [ ] Each EN page has self `canonical`.
- [ ] Each IT page has self `canonical`.
- [ ] Each EN/IT pair has reciprocal `hreflang` links.
- [ ] `x-default` points to the EN default page.
- [ ] Sitemap includes EN and IT URLs.

## Navigation and links

- [ ] Nav active state works in both languages.
- [ ] Footer links in IT pages resolve correctly.
- [ ] Service anchor links (`#information-management`, `#bep-eir`, `#programme-delivery`) work.

## Forms and contact

- [ ] Italian contact form labels and placeholders are localized.
- [ ] Italian `_next` redirects to `it/contact.html?sent=1`.
- [ ] Validation messages show in Italian on IT pages.

## Accessibility

- [ ] `html lang` is `en` on EN pages and `it` on IT pages.
- [ ] Language toggle has an accessible label.
- [ ] Accordion toggle labels switch correctly (EN and IT).

## Content quality

- [ ] Italian terminology aligns with `LOCALIZATION_IT_GLOSSARY.md`.
- [ ] Tone remains professional and consultancy-grade.
- [ ] No obvious mixed-language fragments in critical CTAs/headings.
