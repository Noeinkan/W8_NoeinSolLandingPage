// One source of truth for the Capsar.io product captures.
//
// These are real screenshots of the app, taken with its own shot kit
// (W3_capsar_io/shotkit.config.mjs) against a throwaway database seeded with the
// invented "Riverside Civic Centre" project — no client data has ever been in
// frame. Every capture is 2880x1800, downscaled to 1200x750 (16:10) by
// scripts/optimize_screenshots.py and written to assets/capsar/.
//
// `proof` is the panel beside the product-proof copy near the top of the page;
// `shots` is the preview band lower down. Each entry carries the URL its chrome
// shows, the mono caption under it, and the alt text — so a capture is described
// once and the two templates stay identical apart from the language.
//
// Captions and alt text must describe what is actually in the frame. The three
// panels that stood here before were CSS placeholders, and one of them was
// captioned "EIR Responsiveness Matrix" — a real feature, but one no capture
// exists for yet. It is not in this list for that reason: add it here when the
// shot kit captures the modal.

const proof = {
  file: 'bep-manager.jpg',
  url: 'app.noeinsolutions.com/bep-generator',
  alt: 'The BEP wizard on step 4 of 14, BIM Goals &amp; Uses, with the ISO 19650 progress sidebar on the left and Smart Help offered on every field.',
};

const shots = [
  {
    file: 'bep-preview.jpg',
    url: 'app.noeinsolutions.com/bep-generator/preview',
    label: 'BEP export &mdash; PDF, DOCX, HTML or Excel',
    alt: 'The assembled BIM Execution Plan rendered for export, with the format picker and company template beside it.',
  },
  {
    file: 'tidp-dashboard.jpg',
    url: 'app.noeinsolutions.com/tidp-midp',
    label: 'Information Delivery Planning &mdash; five task-team TIDPs',
    alt: 'TIDP dashboard listing the Architecture, Civils, MEP, Structures and Sustainability delivery plans with their team leaders, deliverable counts and status.',
  },
  {
    file: 'midp-charts.jpg',
    url: 'app.noeinsolutions.com/tidp-midp/dashboard',
    label: 'MIDP roll-up &mdash; deliverables by status and discipline',
    alt: 'MIDP dashboard charts breaking deliverables down by status and by discipline, with team load by milestone and a delivery burndown.',
  },
  {
    file: 'midp-dependency-matrix.jpg',
    url: 'app.noeinsolutions.com/tidp-midp/dependency-matrix',
    label: 'Dependency matrix &mdash; which team is waiting on which',
    alt: 'Cross-team dependency grid plotting each task team against the information it depends on, with the critical path and the number of teams blocked called out above it.',
  },
  {
    file: 'loin-tables.jpg',
    url: 'app.noeinsolutions.com/loin-tables',
    label: 'LOIN tables &mdash; information need per element, IDS export',
    alt: 'Level of Information Need table defining geometry, properties and documentation per element and stage, with IFC properties attached and an export to IDS.',
  },
  {
    file: 'dc-manager.jpg',
    url: 'app.noeinsolutions.com/dc-manager',
    label: 'DC Manager &mdash; naming-convention validation',
    alt: 'Document control validating a stage issue: twelve files uploaded, eight valid filenames and twenty MIDP containers still missing, with the per-file result underneath.',
  },
];

// Italian carries only what needs translating — caption and alt. The file, the
// URL and the order exist once, so the two pages cannot drift into showing
// different screenshots.
const IT_PROOF = {
  alt: 'Il wizard BEP allo step 4 di 14, BIM Goals &amp; Uses, con la barra di avanzamento ISO 19650 a sinistra e lo Smart Help disponibile su ogni campo.',
};

const IT_SHOTS = {
  'bep-preview.jpg': {
    label: 'Export del BEP &mdash; PDF, DOCX, HTML o Excel',
    alt: 'Il BIM Execution Plan assemblato e pronto per l&rsquo;export, con il selettore di formato e il template aziendale accanto.',
  },
  'tidp-dashboard.jpg': {
    label: 'Information Delivery Planning &mdash; cinque TIDP dei task team',
    alt: 'Dashboard TIDP con i piani di consegna di Architettura, Civils, MEP, Strutture e Sostenibilit&agrave;, con team leader, numero di deliverable e stato.',
  },
  'midp-charts.jpg': {
    label: 'Riepilogo MIDP &mdash; deliverable per stato e disciplina',
    alt: 'Grafici della dashboard MIDP: deliverable per stato e per disciplina, carico dei team per milestone e burndown della consegna.',
  },
  'midp-dependency-matrix.jpg': {
    label: 'Matrice delle dipendenze &mdash; chi sta aspettando chi',
    alt: 'Griglia delle dipendenze fra task team: ogni team incrociato con le informazioni da cui dipende, con il percorso critico e il numero di team bloccati in evidenza.',
  },
  'loin-tables.jpg': {
    label: 'Tabelle LOIN &mdash; fabbisogno informativo per elemento, export IDS',
    alt: 'Tabella LOIN che definisce geometria, propriet&agrave; e documentazione per elemento e per stage, con le propriet&agrave; IFC associate e l&rsquo;export in IDS.',
  },
  'dc-manager.jpg': {
    label: 'DC Manager &mdash; validazione della convenzione di denominazione',
    alt: 'Il document control valida un&rsquo;emissione di stage: dodici file caricati, otto nomi validi e venti container MIDP ancora mancanti, con l&rsquo;esito file per file.',
  },
};

// A build with no IT copy renders the English string rather than a blank
// caption — the same rule the Builds lineup follows.
const forLang = (overlayProof, overlayShots) => ({
  proof: Object.assign({}, proof, overlayProof),
  shots: shots.map((s) => Object.assign({}, s, overlayShots[s.file] || {})),
});

module.exports = {
  proof,
  shots,
  lang: {
    en: forLang({}, {}),
    it: forLang(IT_PROOF, IT_SHOTS),
  },
};
