// One source of truth for the Builds page cards.
// Every claim traces to the repo's own README — nothing here is inferred.
// `shots` is set only where real captures exist in assets/builds/. The first
// frame is the one that renders without JavaScript; any further frames are the
// card's rotation, loaded only once that card is scrolled into view.
// `noUi: true` marks a build with no interface to screenshot (API- or CLI-only);
// it is what the "with a working interface" stat counts against.
//
// Every number on the page is derived from this list at the bottom of the file.
// Adding or pulling a build is a single edit here — the cards, the jump index,
// the stats and the prose counts all follow. Nothing is typed twice.
const categories = [
  {
    id: 'markets',
    label: 'Markets',
    title: 'Financial data and research',
    sub: 'Public-filing pipelines and quantitative research tooling. The hard part is never the chart &mdash; it is the ingestion, the normalisation, and the parts of the data that lie.',
    builds: [
      {
        slug: 'f2-search-for-alpha', repo: 'F2_SearchForAlpha_lab',
        name: 'SearchForAlpha Lab', kicker: 'Quantitative research',
        blurb: 'An algorithmic trading research workspace: signal generation across Bollinger, RSI, MACD, CCI and VWAP with ADX/ATR/OBV regime filters, a backtesting engine covering trading, DCA and rebalancing modes, and parameter, signal-combination and indicator-weight optimisation. The Dash front end draws TradingView Lightweight Charts with signal overlays.',
        stack: ['Python', 'Dash', 'pandas', 'Plotly', 'pytest'],
        shots: [
          { file: 'f2-search-for-alpha.jpg', alt: 'A finished BB Breakout backtest: entry and exit markers on the TSLA chart, beside portfolio value, return, Sharpe and drawdown cards' },
          { file: 'f2-search-for-alpha-terminal.jpg', alt: 'The terminal: TSLA daily candles under Bollinger Bands, with volume, RSI, CCI and MACD panes below and the indicator rail to the left' },
          { file: 'f2-search-for-alpha-optimizer.jpg', alt: 'The signal-combination optimiser after a hundred-combination grid search, ranking buy and sell stacks by return, Sharpe and drawdown' },
          { file: 'f2-search-for-alpha-fundamentals.jpg', alt: 'The fundamentals workspace: a Big Five quality table across eleven fiscal years with growth charts for ROIC, equity, earnings and free cash flow' }
        ]
      },
      {
        slug: 'f8-f13-screener', repo: 'F8_F13Screener',
        name: '13F Screener', kicker: 'Regulatory filings',
        blurb: 'Monitors SEC 13F filings for a watchlist of funds matched on CIK, parses holdings from XML with an HTML fallback for the filings that ignore the schema, keeps both realtime and historical positions, and pushes position changes to Telegram. Serves a React and FastAPI dashboard.',
        stack: ['Python', 'FastAPI', 'React', 'SQLite', 'Telegram']
      },
      {
        slug: 'f9-congress-trading', repo: 'F9_CongressTrading',
        name: 'Congressional Disclosure Tracker', kicker: 'Civic data extraction',
        blurb: 'Ingests House and Senate periodic transaction reports, retains the raw filings, then normalises transactions and assets into SQLite and exports an analysis-ready dataset. Ticker mapping runs through Polygon with an OpenFIGI fallback and a local cache, and the source rate limits are respected by design rather than by accident.',
        stack: ['Python', 'SQLite', 'React', 'Polygon API']
      }
    ]
  },
  {
    id: 'delivery',
    label: 'Delivery',
    title: 'Construction and supply chain',
    sub: 'Where the software meets the day job. These sit against real standards and real vendor APIs, which is what makes them awkward &mdash; and worth building.',
    builds: [
      {
        slug: 'w4-agentic-supply-chain', repo: 'W4_AgenticSupplyChain',
        name: 'Agentic Supply-Chain Orchestrator', kicker: 'Multi-agent systems',
        blurb: 'Autonomous agents monitor tariffs, weather, strikes and geopolitical shocks, simulate over a thousand scenarios with Monte Carlo and linear-programming optimisation, then recommend reroutes. A human-approval gate stands between a recommendation and any action, which is the only reason a system like this is deployable at all.',
        stack: ['LangGraph', 'FastAPI', 'PostgreSQL', 'pgvector', 'PuLP', 'Docker']
      },
      {
        slug: 'w6-dc-wizard', repo: 'W6_DCWizard',
        name: 'Document Controller', kicker: 'ISO 19650 automation',
        blurb: 'Pulls BEP naming rules and the approved MIDP from Capsar, scans Autodesk Construction Cloud folders over two-legged OAuth, and reports naming compliance, MIDP match, suitability codes, ACC metadata and coverage gaps. It answers the question a document controller otherwise answers by hand, weekly, across thousands of files.',
        stack: ['Node.js', 'Autodesk ACC API', 'OAuth 2.0', 'Vitest']
      },
      {
        slug: 'w7-zoning-visualiser', repo: 'W7_ZoningVisualiser',
        name: 'Planning Constraint Visualiser', kicker: 'Spatial economics',
        blurb: 'Overlays twelve planning-constraint layers from planning.data.gov.uk onto MSOA-level housing costs for England and estimates a directional planning premium. Constraint weights come from an OLS regression on log price where the data supports it, falling back to calibrated defaults where it does not, and a &ldquo;what if&rdquo; calculator switches a constraint off to show the counterfactual.',
        stack: ['TypeScript', 'PMTiles', 'Python', 'OLS regression']
      },
      {
        slug: 'w8-noein-site', repo: 'W8_NoeinSolLandingPage',
        name: 'This website', kicker: 'Bilingual static site',
        blurb: 'The page you are reading. Hand-written HTML and CSS on a tokenised design system, two fully mirrored languages, and two interactive diagnostics. It earns its place here for the guardrails rather than the design: structural and accessibility tests, translation-parity checks between the English and Italian trees, and a deploy preflight that resolves every link before anything ships.',
        stack: ['HTML', 'CSS', 'Vanilla JS', 'Eleventy', 'Node test runner']
      }
    ]
  },
  {
    id: 'games',
    label: 'Games',
    title: 'Games and simulation',
    sub: 'Built to learn rendering, simulation loops and game feel &mdash; the areas where a bug is visible rather than statistical. Both run entirely in the browser, with no backend at all.',
    builds: [
      // W9_ConnectingTheGrid pulled from the page at Andrea's request (2026-08-20).
      // Its capture is still in assets/builds/ ready for when it goes back up.
      {
        slug: 'h11-asterbloom', repo: 'H11_Asterbloom',
        name: 'Asterbloom', kicker: 'Browser strategy',
        blurb: 'An original browser strategy game in the lineage of Eufloria: grow fractal trees on asteroids, raise seedlings, and expand across a dark starfield. Every asset, track and level script is original. The interesting engineering is procedural &mdash; the trees are grown rather than drawn, and each map is generated from a seed you can share.',
        stack: ['TypeScript', 'PixiJS', 'Vite', 'Vitest'],
        shots: [
          { file: 'h11-asterbloom.png', alt: 'The asteroid Lumenum with a procedurally grown fractal tree on its rim, seedlings orbiting inside its energy ring' }
        ]
      },
      {
        slug: 'h10-voxel-city', repo: 'H10_Voxel_CityBuilder',
        name: 'Voxel City Builder', kicker: 'Rendering engine',
        blurb: 'A chunked voxel renderer for an isometric city: sparse chunk storage, greedy meshing pushed into workers so the main thread stays responsive, a single palette material, and an orthographic camera. On top of the engine sits a simulation where buildings grow on their own and the economy pushes back. Covered by 181 unit and integration tests.',
        stack: ['TypeScript', 'WebGL', 'Web Workers', 'Vite'],
        shots: [
          { file: 'h10-voxel-city.jpg', alt: 'An isometric voxel city grown across a terraced island, with the resource bar reading 8,681 residents and the build dock along the bottom' },
          { file: 'h10-voxel-city-neon.jpg', alt: 'The same city under a neon night palette, swapped at runtime with no geometry regenerated, beside the theme picker' },
          { file: 'h10-voxel-city-biomes.jpg', alt: 'The island recoloured into flat biome bands, beside a panel listing the biome histogram and worker generation timings' },
          { file: 'h10-voxel-city-debug.jpg', alt: 'The city under the measurement overlay: frame budget, draw calls, triangle counts and mesher state alongside the growth statistics' }
        ]
      }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    title: 'Automation and personal tooling',
    sub: 'Built because something was annoying enough, often enough. Small in scope and honest about it &mdash; but each one runs unattended, and has done for months.',
    builds: [
      {
        slug: 'w5-job-alert-bot', repo: 'W5_JobAlertBot',
        name: 'Job Alert Bot', kicker: 'Multi-source aggregation',
        blurb: 'Queries a dozen UK job sources, filters for seniority and keyword relevance before anything is stored, deduplicates in SQLite, and posts genuinely new matches to Discord. It keeps running when an individual source fails or quietly changes its markup, which across a dozen scrapers is the whole engineering problem.',
        stack: ['Node.js', 'SQLite', 'Discord.js', 'Playwright']
      },
      {
        slug: 'w5-mindmap', repo: 'W5_Mindmap',
        name: 'Transcript Mindmap', kicker: 'Local LLM extraction',
        blurb: 'Turns a raw transcript into a typed knowledge graph using a local Ollama model, then renders it as an editable D3 force-directed layout you can drag into shape. Everything runs on the machine &mdash; no transcript leaves it, which is the point when the transcript is a client meeting.',
        stack: ['Node.js', 'Ollama', 'D3.js']
      },
      {
        slug: 'h2-timeblock-planner', repo: 'H2_TimeBlock_Planner',
        name: 'TimeBlock Planner', kicker: 'Full-stack productivity',
        blurb: 'Time-blocking on a drag-and-drop grid, modelled on a paper daily planner: variable-duration blocks, a capped list of most-important tasks, a capture inbox, a shutdown ritual, and a redraw-from-now that reflows the rest of the day when reality intervenes. Deployed with Docker Compose behind an existing reverse proxy.',
        stack: ['React', 'TypeScript', 'FastAPI', 'SQLModel', 'Docker']
      },
      {
        slug: 'h9-voice-transcriber', repo: 'H9_Voice_Transcriber',
        name: 'Voice Transcriber', kicker: 'Offline speech-to-text',
        blurb: 'Batch transcription of long M4A recordings into plain text using Whisper large-v3 on a local GPU. Drop files into one folder, collect transcripts from another, and read a per-file log when something fails. Entirely offline &mdash; chosen deliberately over an API so that recordings of real conversations never leave the machine.',
        stack: ['Python', 'Whisper', 'CUDA']
      }
    ]
  }
];

// Mark the builds that have no interface worth screenshotting.
const NO_UI = ['W4_AgenticSupplyChain', 'H9_Voice_Transcriber'];
categories.forEach((c) => c.builds.forEach((b) => {
  if (NO_UI.includes(b.repo)) b.noUi = true;
}));

const all = categories.flatMap((c) => c.builds);

// ─── Italian layer ───
// Only the strings that need translating live here. Repo, slug, stack, shots
// and `noUi` stay in `categories` above, so adding or pulling a build is still
// one edit in one place and the two languages cannot disagree about the lineup.
// Anything with no IT entry falls back to the English string rather than
// rendering blank — a half-finished translation is then visible on the page
// instead of silently eating a paragraph.
const IT_CATEGORIES = {
  markets: {
    label: 'Mercati',
    title: 'Dati finanziari e ricerca',
    sub: 'Pipeline su documenti pubblici e strumenti di ricerca quantitativa. La parte difficile non è mai il grafico: è l’ingestion, la normalizzazione e i pezzi di dato che mentono.'
  },
  delivery: {
    label: 'Delivery',
    title: 'Costruzioni e filiera',
    sub: 'Qui il software incontra il lavoro di tutti i giorni. Girano contro standard veri e API di vendor veri: è quello che li rende scomodi, ed è il motivo per cui vale la pena costruirli.'
  },
  games: {
    label: 'Giochi',
    title: 'Giochi e simulazione',
    sub: 'Costruiti per imparare rendering, loop di simulazione e game feel: le aree dove un bug si vede invece di essere statistico. Girano interamente nel browser, senza alcun backend.'
  },
  tools: {
    label: 'Strumenti',
    title: 'Automazione e strumenti personali',
    sub: 'Nati perché qualcosa dava fastidio abbastanza spesso. Piccoli di ambito, e onesti su questo. Ma ognuno gira senza supervisione, e lo fa da mesi.'
  }
};

// Keyed by slug. `name` appears only where the English name is a description
// rather than a product name — the repos keep the name they ship under.
const IT_BUILDS = {
  'f2-search-for-alpha': {
    kicker: 'Ricerca quantitativa',
    blurb: 'Un banco di lavoro per la ricerca sul trading algoritmico: generazione di segnali su Bollinger, RSI, MACD, CCI e VWAP con filtri di regime ADX/ATR/OBV, un motore di backtest che copre le modalità trading, DCA e ribilanciamento, e ottimizzazione di parametri, combinazioni di segnali e pesi degli indicatori. Il front end Dash disegna TradingView Lightweight Charts con gli overlay dei segnali.'
  },
  'f8-f13-screener': {
    kicker: 'Documenti di vigilanza',
    blurb: 'Monitora i filing SEC 13F di una watchlist di fondi agganciati per CIK, estrae le posizioni dall’XML con un fallback HTML per i documenti che ignorano lo schema, tiene sia le posizioni correnti sia lo storico e manda le variazioni su Telegram. Espone una dashboard React e FastAPI.'
  },
  'f9-congress-trading': {
    kicker: 'Estrazione di dati pubblici',
    blurb: 'Acquisisce i periodic transaction report di Camera e Senato USA, conserva i documenti grezzi, poi normalizza transazioni e asset in SQLite ed esporta un dataset pronto per l’analisi. La mappatura dei ticker passa da Polygon con fallback OpenFIGI e cache locale, e i rate limit delle fonti sono rispettati per disegno, non per fortuna.'
  },
  'w4-agentic-supply-chain': {
    kicker: 'Sistemi multi-agente',
    blurb: 'Agenti autonomi monitorano dazi, meteo, scioperi e shock geopolitici, simulano oltre mille scenari con Monte Carlo e ottimizzazione lineare, poi propongono un rerouting. Fra una raccomandazione e qualsiasi azione sta un gate di approvazione umana: è l’unico motivo per cui un sistema così è mettibile in produzione.'
  },
  'w6-dc-wizard': {
    kicker: 'Automazione ISO 19650',
    blurb: 'Prende da Capsar le regole di naming del BEP e il MIDP approvato, scansiona le cartelle di Autodesk Construction Cloud via OAuth two-legged e riporta conformità di naming, corrispondenza col MIDP, suitability code, metadati ACC e gap di copertura. Risponde alla domanda a cui un document controller risponde altrimenti a mano, ogni settimana, su migliaia di file.'
  },
  'w7-zoning-visualiser': {
    kicker: 'Economia spaziale',
    blurb: 'Sovrappone dodici layer di vincolo urbanistico presi da planning.data.gov.uk ai costi abitativi a livello MSOA in Inghilterra e stima un premio di vincolo direzionale. I pesi dei vincoli vengono da una regressione OLS sul prezzo in log dove il dato regge, con default calibrati dove non regge. Un calcolatore «e se» spegne un vincolo per mostrare il controfattuale.'
  },
  'w8-noein-site': {
    name: 'Questo sito',
    kicker: 'Sito statico bilingue',
    blurb: 'La pagina che stai leggendo. HTML e CSS scritti a mano su un design system a token, due lingue specchiate per intero e due diagnostiche interattive. Sta qui per i guardrail più che per il design: test strutturali e di accessibilità, controlli di parità fra l’albero inglese e quello italiano, e un preflight di deploy che risolve ogni link prima che parta qualcosa.'
  },
  'h11-asterbloom': {
    kicker: 'Strategico nel browser',
    blurb: 'Uno strategico originale per browser nella linea di Eufloria: fai crescere alberi frattali sugli asteroidi, alleva seedling ed espanditi in un campo stellare scuro. Ogni asset, traccia audio e script di livello è originale. La parte ingegneristica interessante è procedurale: gli alberi crescono invece di essere disegnati, e ogni mappa nasce da un seed che puoi condividere.'
  },
  'h10-voxel-city': {
    kicker: 'Motore di rendering',
    blurb: 'Un renderer voxel a chunk per una città isometrica: storage sparso dei chunk, greedy meshing spostato nei worker perché il thread principale resti reattivo, un solo materiale a palette e camera ortografica. Sopra il motore gira una simulazione dove gli edifici crescono da soli e l’economia risponde. Coperto da 181 test unitari e di integrazione.'
  },
  'w5-job-alert-bot': {
    kicker: 'Aggregazione multi-sorgente',
    blurb: 'Interroga una dozzina di fonti di annunci UK, filtra per seniority e rilevanza delle keyword prima di salvare qualsiasi cosa, deduplica in SQLite e pubblica su Discord solo le posizioni davvero nuove. Continua a girare quando una singola fonte cade o cambia il markup in silenzio: su una dozzina di scraper, è tutto il problema ingegneristico.'
  },
  'w5-mindmap': {
    kicker: 'Estrazione con LLM locale',
    blurb: 'Trasforma una trascrizione grezza in un knowledge graph tipizzato usando un modello Ollama locale, poi la disegna come layout force-directed D3 che puoi trascinare e riorganizzare. Gira tutto sulla macchina: nessuna trascrizione esce, che è il punto quando la trascrizione è una riunione con un cliente.'
  },
  'h2-timeblock-planner': {
    kicker: 'Produttività full-stack',
    blurb: 'Time-blocking su una griglia drag-and-drop, modellata su un’agenda cartacea: blocchi di durata variabile, una lista chiusa di attività prioritarie, un inbox di raccolta, un rituale di chiusura e un «ridisegna da adesso» che rimette in fila il resto della giornata quando la realtà interviene. Deploy con Docker Compose dietro un reverse proxy esistente.'
  },
  'h9-voice-transcriber': {
    kicker: 'Speech-to-text offline',
    blurb: 'Trascrizione batch di registrazioni M4A lunghe in testo semplice, con Whisper large-v3 su GPU locale. Metti i file in una cartella, raccogli le trascrizioni da un’altra e leggi un log per file quando qualcosa fallisce. Completamente offline: scelta deliberata al posto di un’API, così le registrazioni di conversazioni vere non lasciano mai la macchina.'
  }
};

// Keyed by filename, so a capture keeps one entry however many builds show it.
const IT_SHOTS = {
  'f2-search-for-alpha.jpg': 'Un backtest BB Breakout concluso: marker di ingresso e uscita sul grafico TSLA, accanto alle card di valore di portafoglio, rendimento, Sharpe e drawdown',
  'f2-search-for-alpha-terminal.jpg': 'Il terminale: candele giornaliere TSLA sotto le bande di Bollinger, con i pannelli volume, RSI, CCI e MACD sotto e la barra degli indicatori a sinistra',
  'f2-search-for-alpha-optimizer.jpg': 'L’ottimizzatore di combinazioni di segnali dopo una grid search da cento combinazioni, con gli stack di acquisto e vendita ordinati per rendimento, Sharpe e drawdown',
  'f2-search-for-alpha-fundamentals.jpg': 'Il workspace fondamentali: una tabella di qualità Big Five su undici esercizi, con i grafici di crescita di ROIC, patrimonio netto, utili e free cash flow',
  'h11-asterbloom.png': 'L’asteroide Lumenum con un albero frattale cresciuto proceduralmente sul bordo, e le seedling in orbita dentro il suo anello di energia',
  'h10-voxel-city.jpg': 'Una città voxel isometrica cresciuta su un’isola terrazzata, con la barra risorse che segna 8.681 residenti e il dock di costruzione in basso',
  'h10-voxel-city-neon.jpg': 'La stessa città con una palette notturna al neon, cambiata a runtime senza rigenerare la geometria, accanto al selettore di tema',
  'h10-voxel-city-biomes.jpg': 'L’isola ricolorata in bande di bioma piatte, accanto a un pannello con l’istogramma dei biomi e i tempi di generazione dei worker',
  'h10-voxel-city-debug.jpg': 'La città sotto l’overlay di misurazione: frame budget, draw call, conteggio triangoli e stato del mesher, accanto alle statistiche di crescita'
};

// Overlay the IT strings onto the English lineup. Nothing is copied by hand:
// the order, the ids, the stacks and the captures stay where they were defined.
const categoriesIt = categories.map((c) => Object.assign({}, c, IT_CATEGORIES[c.id], {
  builds: c.builds.map((b) => Object.assign({}, b, IT_BUILDS[b.slug], {
    shots: b.shots && b.shots.map((s) => Object.assign({}, s, { alt: IT_SHOTS[s.file] || s.alt })),
  })),
}));

// The "months" stat was typed as a literal and the range beside it as prose, so
// both went stale on the first of every month with nothing to catch it. START is
// the only thing to maintain now.
const START = new Date(2026, 0, 1); // January 2026
const now = new Date();
const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  it: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
};
const monthsElapsed = (now.getFullYear() - START.getFullYear()) * 12
  + (now.getMonth() - START.getMonth());
const span = (lang) => MONTHS[lang][START.getMonth()] + '–' + MONTHS[lang][now.getMonth()]
  + ' ' + now.getFullYear();

// Spelled-out forms for prose. Only the range this page will plausibly reach.
// The IT page gets its own list rather than falling back to a numeral: the
// headline is a sentence in both languages, and "13 progetti, 7 mesi" reads
// as a spec sheet.
const WORDS = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
    'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen', 'twenty'],
  it: ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto',
    'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
    'diciassette', 'diciotto', 'diciannove', 'venti'],
};
const word = (lang, n) => WORDS[lang][n] || String(n);
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Per-language view of everything the page says in prose. A template opens with
// `{% set b = builds.lang[lang] %}` and never branches on the language itself,
// so the IT mirror stays a translation rather than a fork.
const forLang = (lang, cats) => ({
  categories: cats,
  totalWord: word(lang, all.length),
  TotalWord: title(word(lang, all.length)),
  monthsWord: word(lang, monthsElapsed),
  spanLabel: span(lang),
});

module.exports = {
  // Language-independent: the lineup's shape, its ids, and every count derived
  // from it. `categories` stays the English one, so existing consumers and the
  // guardrail tests keep reading the source of truth rather than a view of it.
  categories,
  total: all.length,
  withUi: all.filter((b) => !b.noUi).length,
  domains: categories.length,
  months: monthsElapsed,
  withGallery: all.filter((b) => b.shots && b.shots.length > 1).length,
  // Prose, per language.
  lang: {
    en: forLang('en', categories),
    it: forLang('it', categoriesIt),
  },
};
