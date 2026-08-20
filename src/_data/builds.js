// One source of truth for the Builds page cards.
// Every claim traces to the repo's own README — nothing here is inferred.
// `shot` is set only where a real capture exists in assets/builds/.
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
        stack: ['Python', 'Dash', 'pandas', 'Plotly', 'pytest']
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
        shot: 'h11-asterbloom.png',
        alt: 'Asterbloom: the asteroid Lumenum with a procedurally grown fractal tree on its rim, seedlings orbiting inside its energy ring'
      },
      {
        slug: 'h10-voxel-city', repo: 'H10_Voxel_CityBuilder',
        name: 'Voxel City Builder', kicker: 'Rendering engine',
        blurb: 'A chunked voxel renderer for an isometric city: sparse chunk storage, greedy meshing pushed into workers so the main thread stays responsive, a single palette material, and an orthographic camera. On top of the engine sits a simulation where buildings grow on their own and the economy pushes back. Covered by 181 unit and integration tests.',
        stack: ['TypeScript', 'WebGL', 'Web Workers', 'Vite']
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

// Spelled-out forms for prose. Only the range this page will plausibly reach.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty'];
const word = (n) => WORDS[n] || String(n);
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

module.exports = {
  categories,
  total: all.length,
  totalWord: word(all.length),
  TotalWord: title(word(all.length)),
  withUi: all.filter((b) => !b.noUi).length,
  domains: categories.length,
  shots: all.filter((b) => b.shot).length,
};
