// The menu, used by both the header nav and the footer "Pages" list.
// Adding a page here puts it on every page of that language at once — the
// hand-copied version of this list is what left builds.html unreachable.
// IT lists fewer entries because eir-checklist and builds have no IT mirror yet.
module.exports = {
  en: [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'bep-checklist.html', label: 'BEP Checklist' },
    { href: 'eir-checklist.html', label: 'EIR Health Check' },
    { href: 'builds.html', label: 'Builds' },
  ],
  it: [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'Chi sono' },
    { href: 'capsar.html', label: 'Capsar.io' },
    { href: 'bep-checklist.html', label: 'Checklist BEP' },
  ],
};
