// URL rules, derived once from lang + slug so canonical, og:url and the hreflang
// set can never drift apart. The EN homepage is the one special case: it lives at
// the bare domain, not at /index.html.
const BASE = 'https://noeinsolutions.com';

const enUrl = (slug) => (slug === 'index' ? `${BASE}/` : `${BASE}/${slug}.html`);
const itUrl = (slug) => `${BASE}/it/${slug}.html`;

module.exports = {
  // Chrome copy for this page's language, reachable from every template and partial.
  t: (data) => require('./strings.js')[data.lang],
  // Canonical + og:url for this page.
  selfUrl: (data) => (data.lang === 'it' ? itUrl(data.slug) : enUrl(data.slug)),
  // hreflang targets. x-default always points at the English page.
  enUrl: (data) => enUrl(data.slug),
  itUrl: (data) => itUrl(data.slug),
  // IT pages sit one directory down, so every asset href needs ../ in front.
  prefix: (data) => (data.lang === 'it' ? '../' : ''),
  // Where the language toggle goes. EN pages with no IT mirror keep a dead link.
  langHref: (data) => {
    if (data.lang === 'it') return `../${data.slug}.html`;
    return data.hasMirror ? `it/${data.slug}.html` : '#';
  },
};
