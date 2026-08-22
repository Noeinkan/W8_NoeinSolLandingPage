// The menu, used by both the header nav and the footer "Pages" list.
// Adding a page here puts it on every page of that language at once — the
// hand-copied version of this list is what left builds.html unreachable.
// Order is commercial intent, not alphabetics: the page that sells sits second,
// proof (Capsar, Builds) next, free diagnostics after, trust and contact last.
module.exports = {
  en: [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Work with me' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'builds.html', label: 'Builds' },
    { href: 'bep-checklist.html', label: 'BEP Checklist' },
    { href: 'eir-checklist.html', label: 'EIR Health Check' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
  ],
  it: [
    { href: 'index.html', label: 'Home' },
    { href: 'services.html', label: 'Come lavoro' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'builds.html', label: 'Builds' },
    { href: 'bep-checklist.html', label: 'Checklist BEP' },
    { href: 'eir-checklist.html', label: 'Health Check EIR' },
    { href: 'about.html', label: 'Chi sono' },
    { href: 'contact.html', label: 'Contatti' },
  ],
};
