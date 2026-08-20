// Chrome copy per language. A single template forces one value per string, so
// the copy-paste drift that had accumulated across pages is resolved here:
//   navToggle    IT was "Apri menu" (4 pages) / "Apri o chiudi il menu" (index)
//   langSwitch   IT was "Passa alla lingua inglese" (4) / "Passa all'inglese" (index)
//   location     IT was "Londra, Regno Unito" (3) / "Londra, UK" (index)
// Flags are literal emoji everywhere; three IT pages used HTML entities instead.
module.exports = {
  en: {
    skip: 'Skip to content',
    navToggle: 'Toggle menu',
    langSwitch: 'Switch language to Italian',
    langSwitchPending: 'Italian version coming soon',
    footerTagline: 'ISO 19650 information management on complex programmes — and the software to deliver it.',
    footerPages: 'Pages',
    footerContact: 'Contact',
    location: 'London, UK',
    rights: 'All rights reserved.',
    privacyLabel: 'Privacy Policy',
    privacyHref: 'privacy.html',
    certViewer: 'Certificate viewer',
    certClose: 'Close certificate viewer',
  },
  it: {
    skip: 'Vai al contenuto',
    navToggle: 'Apri o chiudi il menu',
    langSwitch: 'Passa alla lingua inglese',
    langSwitchPending: 'Versione italiana in arrivo',
    footerTagline: 'Information management ISO 19650 su programmi complessi — e il software per realizzarlo.',
    footerPages: 'Pagine',
    footerContact: 'Contatti',
    location: 'Londra, Regno Unito',
    rights: 'Tutti i diritti riservati.',
    privacyLabel: 'Informativa Privacy',
    privacyHref: 'privacy.html',
    certViewer: 'Visualizzatore certificati',
    certClose: 'Chiudi visualizzatore certificati',
  },
};
