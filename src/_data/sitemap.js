// Crawl hints for src/sitemap.njk.
//
// The sitemap used to be a hand-written XML file at the repo root, which meant a
// new page was live and unlisted until someone remembered it: services.html and
// contact.html shipped that way. It also drifted — the IT mirrors of those two
// carried the English priority while the other four IT pages sat 0.1 lower.
//
// Now the file is generated from the same page list Eleventy builds, using the
// same `selfUrl` the canonical tag uses, so a page cannot exist without being
// listed and the two URLs cannot disagree. This module holds the only judgement
// left: how much each page matters.
//
// Priority is a hint, not a ranking factor. Keep the shape — the pages that
// convert at the top, the legal page at the bottom — rather than tuning digits.

const DEFAULT = { priority: 0.8, changefreq: 'monthly' };

// English priorities. Italian mirrors derive from these (see `for`), so a slug
// only ever needs one entry.
const BY_SLUG = {
  index:            { priority: 1.0 },
  services:         { priority: 0.9 },
  contact:          { priority: 0.9 },
  about:            { priority: 0.9 },
  'iso-19650':      { priority: 0.9 },
  capsar:           { priority: 0.8 },
  'bep-checklist':  { priority: 0.8 },
  'eir-checklist':  { priority: 0.8 },
  builds:           { priority: 0.8 },
  privacy:          { priority: 0.3, changefreq: 'yearly' },
};

// A translated page is a secondary entry point for a smaller audience: one step
// down, except for the legal page, which is already at the floor.
const IT_STEP = 0.1;
const FLOOR = 0.3;

module.exports = {
  for(slug, lang) {
    const base = Object.assign({}, DEFAULT, BY_SLUG[slug]);
    const priority = lang === 'it'
      ? Math.max(FLOOR, Math.round((base.priority - IT_STEP) * 10) / 10)
      : base.priority;
    return { priority: priority.toFixed(1), changefreq: base.changefreq };
  },
};
