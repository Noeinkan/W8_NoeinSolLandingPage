// The menu, used by both the header nav and the footer "Pages" list.
// Adding a page here puts it on every page of that language at once — the
// hand-copied version of this list is what left builds.html unreachable.
// Order is commercial intent, not alphabetics: the page that sells sits second,
// proof (Capsar, Builds) next, free diagnostics after, trust and contact last.
//
// The two free tools used to sit here as two entries, which spent a quarter of
// the menu on them and left the site cross-linking them to each other from
// inside each tool. They are one entry now — the ISO 19650 hub — and the hub
// routes to both. The tools keep their own URLs: they answer different searches
// at different project stages, and collapsing them would halve that surface.
module.exports = {
  en: [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Work with me' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'builds.html', label: 'Builds' },
    { href: 'iso-19650.html', label: 'ISO 19650' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
  ],
  it: [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Come lavoro' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'builds.html', label: 'Builds' },
    { href: 'iso-19650.html', label: 'ISO 19650' },
    { href: 'about.html', label: 'Chi sono' },
    { href: 'contact.html', label: 'Contatti' },
  ],
};
