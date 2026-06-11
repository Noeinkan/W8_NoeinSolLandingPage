/* ═══════════════════════════════════════════════════════════
   BEP Readiness Checklist — interactive tool
   Renders 35 checkpoints across 9 sections, computes a live
   readiness score, and builds a printable PDF report with
   section-by-section diagnostics.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var isItalian = document.documentElement.lang === 'it';

  // ─── i18n strings ───
  var I = isItalian ? {
    sectionsLegend: 'Spunta solo le voci per cui hai evidenze oggettive',
    progress: 'completati',
    bandWaiting: 'Inizia a rispondere per vedere la tua fascia',
    bandHigh: 'Alta prontezza: pronto alla submission',
    bandMed: 'Media: chiudi i gap prima della submission',
    bandLow: 'Bassa: rischio significativo di delivery',
    interpHigh: 'La tua risposta BEP è solida. Assicurati che ogni dichiarazione sia supportata da evidenze rintracciabili e rivedi le aree sotto: anche un singolo punto scoperto può compromettere il punteggio tecnico.',
    interpMed: 'Hai una base buona, ma restano dei gap. Lavora sulle aree deboli qui sotto prima di sottomettere: di solito sono proprio quelle su cui i reviewer chiedono chiarimenti.',
    interpLow: 'Il BEP non è ancora pronto per la submission. Copri le lacune fondamentali prima di impegnarti: sottomettere così significa rischio contrattuale e di credibilità.',
    noScoreYet: 'Compila almeno una voce per generare il report.',
    contextLabel: 'Stadio BEP',
    contextPre: 'Pre-appointment',
    contextDel: 'Delivery team',
    reportTitleGeneric: 'Report prontezza BEP',
    reportTitleNamed: 'Report prontezza BEP — {project}',
    metaProject: 'Progetto',
    metaAuthor: 'Preparato da',
    metaDate: 'Data',
    metaStage: 'Stadio',
    exportViewNote: 'Vista pulita ottimizzata per il PDF. Nella finestra di stampa scegli «Salva come PDF»; se il browser aggiunge intestazioni o piè di pagina, disattivali in Altre impostazioni.',
    exportPrintAction: 'Stampa / Salva PDF',
    exportCloseAction: 'Chiudi anteprima',
    exportKicker: 'Diagnostica BEP ISO 19650',
    exportScoreLabel: 'Quadro punteggio',
    sectionBreakdownTitle: 'Dettaglio per sezione',
    diagnosisTitle: 'Le tue aree più deboli, e come migliorarle',
    diagBadgeWeak: 'Area debole',
    diagFix: 'Come agire: ',
    allStrong: 'Nessuna area debole rilevata 👏',
    allStrongBody: 'Tutte le sezioni sono al 50% o più. Assicurati che le evidenze siano rintracciabili in un bid/clarification workshop: i reviewer vorranno vedere il «come» dietro ogni risposta.',
    unresolvedLead: 'Voci ancora da evidenziare:',
    resetConfirm: 'Azzerare tutte le risposte?'
  } : {
    sectionsLegend: 'Tick each item only when objective evidence is available',
    progress: 'complete',
    bandWaiting: 'Start ticking items to see your band',
    bandHigh: 'High readiness — ready to submit',
    bandMed: 'Medium — close gaps before submission',
    bandLow: 'Low — significant delivery risk',
    interpHigh: 'Your BEP response is in solid shape. Make sure every claim is backed by traceable evidence and review the areas below — even one uncovered point can hurt your technical score.',
    interpMed: 'You\u2019ve got a strong foundation but gaps remain. Prioritise the weak areas below before you submit: these are typically what reviewers ask clarifications on.',
    interpLow: 'This BEP is not ready to submit. Close the fundamental gaps below before you commit — submitting now carries contractual and credibility risk.',
    noScoreYet: 'Tick at least one item to generate your report.',
    contextLabel: 'BEP stage',
    contextPre: 'Pre-appointment',
    contextDel: 'Delivery team',
    reportTitleGeneric: 'Your BEP readiness report',
    reportTitleNamed: 'BEP readiness report — {project}',
    metaProject: 'Project',
    metaAuthor: 'Prepared by',
    metaDate: 'Date',
    metaStage: 'Stage',
    exportViewNote: 'Clean PDF view. Choose "Save as PDF" in the print dialog; if your browser adds headers and footers, switch them off in More settings for the cleanest export.',
    exportPrintAction: 'Print / Save PDF',
    exportCloseAction: 'Close preview',
    exportKicker: 'ISO 19650 BEP diagnostic',
    exportScoreLabel: 'Score overview',
    sectionBreakdownTitle: 'Section-by-section breakdown',
    diagnosisTitle: 'Your weakest areas & how to close them',
    diagBadgeWeak: 'Weak area',
    diagFix: 'How to close it: ',
    allStrong: 'No weak areas detected \ud83d\udc4f',
    allStrongBody: 'Every section is at 50% or above. Make sure every tick is defensible in a bid/clarification workshop — reviewers will want to see the "how" behind each claim.',
    unresolvedLead: 'Items still to evidence:',
    resetConfirm: 'Reset all answers?'
  };

  // ─── Checklist data ───
  // 9 sections, 35 scorable items total.
  // `fix` is the remediation sentence surfaced when a section is weak.
  // `cta` points to the most relevant service page.
  var SECTIONS = isItalian ? [
    {
      id: 's1', num: '1', title: 'Completezza della risposta all\u2019EIR',
      items: [
        'Ogni requisito EIR è mappato a una sezione specifica del BEP.',
        'Ogni requisito "non applicabile" è giustificato esplicitamente.',
        'Finalità informative e milestone di consegna sono chiaramente affrontate.',
        'Requisiti di naming, metadati e formato di scambio sono riflessi.'
      ],
      fix: 'Costruisci una matrice di tracciabilità EIR→BEP. Ogni riga dell’EIR deve puntare a una sezione, un deliverable o una motivazione di non applicabilità: niente buchi.',
      cta: { label: 'Scopri Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's2', num: '2', title: 'Strategia di consegna delle informazioni',
      items: [
        'L\u2019approccio per soddisfare l\u2019EIR è spiegato ed è realistico.',
        'Gli obiettivi di collaborazione informativa sono dichiarati.',
        'Struttura del delivery team e ruoli di information management sono definiti.',
        'La strategia di federazione è documentata e operativa.'
      ],
      fix: 'Passa dalla narrativa al concreto: chi federa, con quale cadenza, su quale piattaforma e con quali regole di coordinamento. I reviewer cercano specificità.',
      cta: { label: 'Scopri Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's3', num: '3', title: 'Controlli di responsabilità e pianificazione',
      items: [
        'Matrice di responsabilità di alto livello inclusa e completa.',
        'Matrice di responsabilità dettagliata disponibile (dove richiesta).',
        'MIDP presente e allineato alle milestone di progetto.',
        'TIDP presenti/definiti per i task team rilevanti.'
      ],
      fix: 'Un BEP senza MIDP credibile è un BEP a rischio. Costruisci il MIDP partendo dalle milestone contrattuali e risali ai TIDP per ogni task team.',
      cta: { label: 'Scopri Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's4', num: '4', title: 'CDE, workflow e setup tecnico',
      items: [
        'Stati di workflow CDE definiti (WIP, Shared, Published, Archived).',
        'Permessi, gate di approvazione e regole di stato/revisione sono chiari.',
        'Piattaforma e sistema definiti, ipotesi di tooling confermate.',
        'Frequenza di scambio informativo e turnaround di review definiti.'
      ],
      fix: 'Documenta il CDE come un flusso concreto, non come un diagramma. Includi tempi di turnaround, responsabili di ogni gate, e cosa succede se un gate fallisce.',
      cta: { label: 'Capsar.io: il CDE di nuova generazione', href: 'capsar.html' }
    },
    {
      id: 's5', num: '5', title: 'Qualità, accettazione e audit trail',
      items: [
        'Controlli qualità pre-issue definiti per tipo di deliverable.',
        'Criteri di accettazione oggettivi e testabili.',
        'Processo di autorizzazione/accettazione esplicito (chi approva cosa e quando).',
        'Audit trail dimostrabile (versioning, approvazioni, record, log).'
      ],
      fix: 'Se domani un reviewer volesse verificare i tuoi approvals, potresti mostrarli? Rendi visibili versioning e log, e lega ogni tipo di deliverable a criteri testabili.',
      cta: { label: 'Richiedi accesso Capsar', href: 'capsar.html' }
    },
    {
      id: 's6', num: '6', title: 'Capability, mobilitazione e rischio',
      items: [
        'Evidenze di capability/capacity disponibili per i ruoli chiave.',
        'Piano di mobilitazione copre training, accesso ai sistemi e readiness check.',
        'Rischi di consegna identificati con owner e mitigazioni.',
        'Assunzioni critiche e dipendenze sono visibili e controllate.'
      ],
      fix: 'Dichiarazioni di capability generiche non bastano. Lega i nomi ai ruoli, i ruoli alle attività, e le attività a training o readiness check dimostrabili.',
      cta: { label: 'Scopri Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's7', num: '7', title: 'Sicurezza, contratto e allineamento handover',
      items: [
        'Requisiti di information security/privacy sono affrontati.',
        'Gli impegni del BEP sono allineati agli obblighi di appointment/contratto.',
        'Deliverable PIM/AIM e aspettative di handover sono chiare.',
        'I deliverable si allineano a scope, programma e milestone commerciali.'
      ],
      fix: 'Incrocia il BEP con il contratto e con i deliverable di handover: ogni impegno nel BEP deve avere un corrispettivo contrattuale e di handover.',
      cta: { label: 'Apri la checklist BEP', href: 'bep-checklist.html' }
    },
    {
      id: 's8', num: '!', title: 'ISO-critical: controlli ad alta confidenza',
      special: true,
      items: [
        'Requisiti pre-appointment vs delivery BEP non sono mescolati o mancanti.',
        'Documenti di supporto richiesti sono inclusi nella submission.',
        'Deliverable informativi pianificati sono tracciabili da EIR a MIDP/TIDP.',
        'Il team sa dimostrare l\u2019approccio di compliance in un bid/clarification workshop.'
      ],
      fix: 'Questi sono i check che separano un BEP "passa" da un BEP "vince". Se uno solo è debole, è un rischio critico.',
      cta: { label: 'Apri la checklist BEP', href: 'bep-checklist.html' }
    },
    {
      id: 's9', num: '\u2713', title: 'Go / No-Go finale',
      special: true,
      items: [
        'Sappiamo supportare con evidenze ogni claim critico in questo BEP.',
        'Possiamo eseguire questo piano con persone, sistemi e tempi attuali.',
        'Siamo a nostro agio a sottomettere senza chiarimenti sostanziali.'
      ],
      fix: 'Se anche una di queste tre risposte è "no", non sottomettere senza una review. Il costo di una submission debole supera di gran lunga il costo di 1–2 giorni extra.',
      cta: { label: 'Richiedi accesso Capsar', href: 'capsar.html' }
    }
  ] : [
    {
      id: 's1', num: '1', title: 'EIR response completeness',
      items: [
        'Every EIR requirement is mapped to a specific BEP section.',
        'Any "not applicable" requirement is explicitly justified.',
        'Information purposes and delivery milestones are clearly addressed.',
        'Naming, metadata, and exchange format requirements are reflected.'
      ],
      fix: 'Build an EIR\u2192BEP traceability matrix. Every EIR row must point to a section, a deliverable, or a reasoned "not applicable" — no gaps.',
      cta: { label: 'Explore Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's2', num: '2', title: 'Information delivery strategy',
      items: [
        'Approach to meeting EIR is explained and realistic.',
        'Information collaboration objectives are stated.',
        'Delivery team structure and information management roles are defined.',
        'Federation strategy is documented and actionable.'
      ],
      fix: 'Shift from narrative to operational: who federates, at what cadence, on what platform, and under what coordination rules. Reviewers look for specifics.',
      cta: { label: 'Explore Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's3', num: '3', title: 'Responsibility and planning controls',
      items: [
        'High-level responsibility matrix is included and complete.',
        'Detailed responsibility matrix is available (where required).',
        'MIDP is present and aligned with project delivery milestones.',
        'TIDPs are present/defined for relevant task teams.'
      ],
      fix: 'A BEP without a credible MIDP is a BEP at risk. Build the MIDP from contractual milestones down, then roll TIDPs up from each task team.',
      cta: { label: 'Explore Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's4', num: '4', title: 'CDE, workflows, and technical setup',
      items: [
        'CDE workflow states are defined (WIP, Shared, Published, Archived).',
        'Permissions, approval gates, and status/revision rules are clear.',
        'Platform/system schedule and tooling assumptions are confirmed.',
        'Information exchange frequency and review turnaround are defined.'
      ],
      fix: 'Document the CDE as a live flow, not a diagram. Include turnaround times, who owns each gate, and what happens when a gate fails.',
      cta: { label: 'Capsar.io — next-gen CDE', href: 'capsar.html' }
    },
    {
      id: 's5', num: '5', title: 'Quality, acceptance, and audit trail',
      items: [
        'Quality checks before issue are defined by deliverable type.',
        'Acceptance criteria are objective and testable.',
        'Authorisation/acceptance process is explicit (who approves what and when).',
        'Audit trail is demonstrable (versioning, approvals, records, logs).'
      ],
      fix: 'If a reviewer had to audit your approvals tomorrow, could you show them? Make versioning and logs visible, and tie every deliverable type to testable criteria.',
      cta: { label: 'Request Capsar access', href: 'capsar.html' }
    },
    {
      id: 's6', num: '6', title: 'Capability, mobilisation, and risk',
      items: [
        'Capability/capacity evidence is available for key roles.',
        'Mobilisation plan covers training, system access, and readiness checks.',
        'Information delivery risks are identified with owners/mitigations.',
        'Critical assumptions and dependencies are visible and controlled.'
      ],
      fix: 'Generic capability statements don\u2019t cut it. Tie names to roles, roles to activities, and activities to demonstrable training or readiness checks.',
      cta: { label: 'Explore Capsar.io', href: 'capsar.html' }
    },
    {
      id: 's7', num: '7', title: 'Security, contract, and handover alignment',
      items: [
        'Information security/privacy requirements are addressed.',
        'BEP commitments align with appointment/contract obligations.',
        'PIM/AIM deliverables and handover expectations are clear.',
        'Deliverables align with scope, programme, and commercial milestones.'
      ],
      fix: 'Cross-check the BEP against the contract and the handover deliverables: every commitment in the BEP must have a contractual and handover counterpart.',
      cta: { label: 'Open BEP checklist', href: 'bep-checklist.html' }
    },
    {
      id: 's8', num: '!', title: 'ISO-critical — high-confidence checks',
      special: true,
      items: [
        'Pre-appointment vs delivery BEP requirements are not mixed or missing.',
        'Required supplementary documents are included with submission.',
        'Planned information deliverables can be traced from EIR to MIDP/TIDP.',
        'Team can evidence compliance approach in a bid/clarification workshop.'
      ],
      fix: 'These are the checks that separate a BEP that "passes" from one that wins. If even one is weak, it\u2019s a critical risk.',
      cta: { label: 'Open BEP checklist', href: 'bep-checklist.html' }
    },
    {
      id: 's9', num: '\u2713', title: 'Final Go / No-Go',
      special: true,
      items: [
        'We can evidence every critical claim in this BEP.',
        'We can execute this plan with current people, systems, and timelines.',
        'We are comfortable submitting without material clarifications.'
      ],
      fix: 'If even one of these three is "no", do not submit without a review. The cost of a weak submission massively outweighs the cost of 1\u20132 extra days.',
      cta: { label: 'Request Capsar access', href: 'capsar.html' }
    }
  ];

  var TOTAL_ITEMS = SECTIONS.reduce(function (acc, s) { return acc + s.items.length; }, 0);
  var STORAGE_KEY = 'noein.bep.v2';

  // ─── DOM refs ───
  var sectionsHost = document.getElementById('bepSections');
  var scoreNum = document.getElementById('bepScoreNum');
  var scoreFill = document.getElementById('bepScoreFill');
  var scoreBand = document.getElementById('bepScoreBand');
  var scoreBreakdown = document.getElementById('bepScoreBreakdown');
  var scoreCard = document.getElementById('bepScoreCard');
  var resultsPanel = document.getElementById('bepResults');
  var reportTitle = document.getElementById('bepReportTitle');
  var reportMeta = document.getElementById('bepReportMeta');
  var reportScoreNum = document.getElementById('bepReportScoreNum');
  var reportBand = document.getElementById('bepReportBand');
  var reportInterp = document.getElementById('bepReportInterp');
  var reportSectionsList = document.getElementById('bepReportSectionsList');
  var reportDiagnosis = document.getElementById('bepReportDiagnosis');
  var reportFooter = resultsPanel ? resultsPanel.querySelector('.bep-report-footer') : null;
  var projectInput = document.getElementById('bep-project');
  var authorInput = document.getElementById('bep-author');
  var dateInput = document.getElementById('bep-date');
  var jumpBtn = document.getElementById('bepJumpResults');
  var resetBtn = document.getElementById('bepReset');
  var printBtn = document.getElementById('bepPrintBtn');

  if (!sectionsHost) return; // safety

  // Set today as default date
  if (dateInput && !dateInput.value) {
    var t = new Date();
    var yyyy = t.getFullYear();
    var mm = String(t.getMonth() + 1).padStart(2, '0');
    var dd = String(t.getDate()).padStart(2, '0');
    dateInput.value = yyyy + '-' + mm + '-' + dd;
  }

  // ─── Render sections ───
  function renderSections() {
    var html = '';
    SECTIONS.forEach(function (sec, sIdx) {
      var openAttr = sIdx === 0 ? ' open' : '';
      var specialCls = sec.special ? ' bep-section--special' : '';
      html += '<details class="bep-section' + specialCls + '" id="' + sec.id + '"' + openAttr + '>';
      html +=   '<summary class="bep-section-head">';
      html +=     '<span class="bep-section-num" aria-hidden="true">' + sec.num + '</span>';
      html +=     '<span class="bep-section-title">' + sec.title + '</span>';
      html +=     '<span class="bep-section-progress" data-progress-for="' + sec.id + '">';
      html +=       '<span class="bep-section-progress-bar"><span class="bep-section-progress-fill"></span></span>';
      html +=       '<span class="bep-section-progress-text">0 / ' + sec.items.length + '</span>';
      html +=     '</span>';
      html +=     '<svg class="bep-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
      html +=   '</summary>';
      html +=   '<div class="bep-section-body">';
      sec.items.forEach(function (itemText, iIdx) {
        var inputId = sec.id + '_' + iIdx;
        html += '<label class="bep-check" for="' + inputId + '">';
        html +=   '<input type="checkbox" id="' + inputId + '" data-section="' + sec.id + '">';
        html +=   '<span class="bep-check-box" aria-hidden="true">';
        html +=     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        html +=   '</span>';
        html +=   '<span class="bep-check-text">' + itemText + '</span>';
        html += '</label>';
      });
      html +=   '</div>';
      html += '</details>';
    });
    sectionsHost.innerHTML = html;
  }

  renderSections();

  // ─── Scoring logic ───
  function computeScores() {
    var total = 0;
    var perSection = {};
    SECTIONS.forEach(function (sec) {
      var sum = 0;
      var inputs = document.querySelectorAll('input[data-section="' + sec.id + '"]');
      inputs.forEach(function (inp) { if (inp.checked) sum += 1; });
      perSection[sec.id] = { count: sum, total: sec.items.length, pct: sum / sec.items.length };
      total += sum;
    });
    return { total: total, max: TOTAL_ITEMS, perSection: perSection };
  }

  function bandFor(total) {
    if (total >= 30) return { key: 'high', label: I.bandHigh, className: 'is-high', chipClass: 'band-high', interp: I.interpHigh };
    if (total >= 22) return { key: 'med',  label: I.bandMed,  className: 'is-med',  chipClass: 'band-med',  interp: I.interpMed };
    return             { key: 'low',  label: I.bandLow,  className: 'is-low',  chipClass: 'band-low',  interp: I.interpLow };
  }

  function updateLiveScore() {
    var s = computeScores();
    scoreNum.textContent = s.total;
    var pct = (s.total / s.max) * 100;
    scoreFill.style.width = pct + '%';

    scoreCard.classList.remove('is-high', 'is-med', 'is-low');
    if (s.total === 0) {
      scoreBand.textContent = I.bandWaiting;
    } else {
      var b = bandFor(s.total);
      scoreCard.classList.add(b.className);
      scoreBand.textContent = b.label;
    }

    // per-section progress in score card
    var rows = '';
    SECTIONS.forEach(function (sec) {
      var ps = s.perSection[sec.id];
      rows += '<div class="bep-score-breakdown-row"><span>' + sec.title + '</span><strong>' + ps.count + ' / ' + ps.total + '</strong></div>';
    });
    scoreBreakdown.innerHTML = rows;

    // per-section progress inline on each section header
    SECTIONS.forEach(function (sec) {
      var host = document.querySelector('[data-progress-for="' + sec.id + '"]');
      if (!host) return;
      var ps = s.perSection[sec.id];
      var fill = host.querySelector('.bep-section-progress-fill');
      var text = host.querySelector('.bep-section-progress-text');
      if (fill) fill.style.width = (ps.pct * 100) + '%';
      if (text) text.textContent = ps.count + ' / ' + ps.total;
      var section = document.getElementById(sec.id);
      if (section) {
        if (ps.count === ps.total) section.classList.add('bep-section--highlight');
        else section.classList.remove('bep-section--highlight');
      }
    });

    persist();
  }

  // ─── Persistence ───
  function persist() {
    try {
      var state = {
        project: projectInput ? projectInput.value : '',
        author: authorInput ? authorInput.value : '',
        date: dateInput ? dateInput.value : '',
        context: (document.querySelector('input[name="context"]:checked') || {}).value || 'pre-appointment',
        checks: {}
      };
      document.querySelectorAll('input[data-section]').forEach(function (inp) {
        state.checks[inp.id] = inp.checked;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* storage blocked — silently continue */ }
  }

  function restore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      if (state.project && projectInput) projectInput.value = state.project;
      if (state.author && authorInput) authorInput.value = state.author;
      if (state.date && dateInput) dateInput.value = state.date;
      if (state.context) {
        var r = document.querySelector('input[name="context"][value="' + state.context + '"]');
        if (r) r.checked = true;
      }
      if (state.checks) {
        Object.keys(state.checks).forEach(function (k) {
          var inp = document.getElementById(k);
          if (inp) inp.checked = !!state.checks[k];
        });
      }
    } catch (_) { /* ignore */ }
  }

  restore();
  updateLiveScore();

  // ─── Build results report ───
  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(d.getTime())) return iso;
    var locale = isItalian ? 'it-IT' : 'en-GB';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildExportStyles() {
    return [
      ':root {',
      '  color-scheme: light only;',
      '  --ink: #18130d;',
      '  --muted: #5f574c;',
      '  --accent: #b68a33;',
      '  --accent-strong: #7a5d1e;',
      '  --border: #ddd2c1;',
      '  --paper-alt: #fbf8f2;',
      '  --good: #38762f;',
      '  --good-soft: #e8f3e4;',
      '  --warn: #7a5d1e;',
      '  --warn-soft: #fbf1d8;',
      '  --risk: #8a3322;',
      '  --risk-soft: #fbe5e0;',
      '}',
      '* { box-sizing: border-box; }',
      'html, body {',
      '  margin: 0;',
      '  padding: 0;',
      '  background: #d8d0c5;',
      '  color: var(--ink);',
      '  font-family: "DM Sans", system-ui, sans-serif;',
      '}',
      'body {',
      '  -webkit-print-color-adjust: exact;',
      '  print-color-adjust: exact;',
      '}',
      '.export-toolbar {',
      '  position: sticky;',
      '  top: 0;',
      '  z-index: 10;',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 0.85rem 1rem;',
      '  padding: 1rem 1.25rem;',
      '  background: rgba(17, 14, 10, 0.92);',
      '  color: #f7f3ea;',
      '}',
      '.export-toolbar-copy {',
      '  margin: 0;',
      '  max-width: 48rem;',
      '  font-size: 0.92rem;',
      '  line-height: 1.5;',
      '}',
      '.export-toolbar-actions {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.75rem;',
      '}',
      '.export-toolbar-actions button {',
      '  appearance: none;',
      '  border: 0;',
      '  border-radius: 999px;',
      '  padding: 0.75rem 1.1rem;',
      '  font: inherit;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  background: #c9a55a;',
      '  color: #16110a;',
      '}',
      '.export-toolbar-actions .is-secondary {',
      '  background: transparent;',
      '  color: #f7f3ea;',
      '  border: 1px solid rgba(255, 255, 255, 0.25);',
      '}',
      '.export-shell { padding: 1.5rem; }',
      '.export-page {',
      '  width: min(190mm, calc(100vw - 3rem));',
      '  min-height: 267mm;',
      '  margin: 0 auto;',
      '  background: #fff;',
      '  box-shadow: 0 22px 64px rgba(23, 16, 6, 0.18);',
      '  padding: 14mm 13mm 12mm;',
      '}',
      '.export-header {',
      '  display: grid;',
      '  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.3fr);',
      '  gap: 1.25rem;',
      '  align-items: end;',
      '  padding-bottom: 1.1rem;',
      '  border-bottom: 1px solid var(--border);',
      '}',
      '.export-brand-lockup { align-self: start; }',
      '.export-brand {',
      '  font-family: "Instrument Serif", Georgia, serif;',
      '  font-size: 2.2rem;',
      '  line-height: 0.95;',
      '  color: var(--ink);',
      '}',
      '.export-brand span { color: var(--accent); }',
      '.export-kicker {',
      '  margin-top: 0.45rem;',
      '  font-size: 0.78rem;',
      '  letter-spacing: 0.16em;',
      '  text-transform: uppercase;',
      '  color: var(--accent-strong);',
      '}',
      '.section-label {',
      '  font-size: 0.74rem;',
      '  letter-spacing: 0.18em;',
      '  text-transform: uppercase;',
      '  color: var(--accent-strong);',
      '}',
      '.export-report-title {',
      '  margin: 0.35rem 0 0;',
      '  font-family: "Instrument Serif", Georgia, serif;',
      '  font-size: 2.35rem;',
      '  line-height: 1.02;',
      '  letter-spacing: -0.02em;',
      '  color: var(--ink);',
      '}',
      '.bep-report-meta {',
      '  margin-top: 1rem;',
      '  display: grid;',
      '  grid-template-columns: repeat(2, minmax(0, 1fr));',
      '  gap: 0.55rem 1rem;',
      '  font-size: 0.86rem;',
      '  color: var(--muted);',
      '}',
      '.bep-report-meta span {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.3rem;',
      '  padding-top: 0.55rem;',
      '  border-top: 1px solid var(--border);',
      '}',
      '.bep-report-meta span strong {',
      '  color: var(--ink);',
      '  font-weight: 600;',
      '}',
      '.export-summary {',
      '  display: grid;',
      '  grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);',
      '  gap: 1rem;',
      '  margin-top: 1.2rem;',
      '  margin-bottom: 1.3rem;',
      '  break-inside: avoid;',
      '}',
      '.export-card {',
      '  background: var(--paper-alt);',
      '  border: 1px solid var(--border);',
      '  border-radius: 16px;',
      '  padding: 1rem 1rem 1.05rem;',
      '  break-inside: avoid;',
      '}',
      '.export-score-card {',
      '  background: linear-gradient(180deg, #faf4e8 0%, #f4ebdb 100%);',
      '}',
      '.export-eyebrow {',
      '  margin-bottom: 0.5rem;',
      '  font-size: 0.74rem;',
      '  letter-spacing: 0.16em;',
      '  text-transform: uppercase;',
      '  color: var(--accent-strong);',
      '}',
      '.bep-report-score-num {',
      '  font-family: "Instrument Serif", Georgia, serif;',
      '  font-size: 3.05rem;',
      '  line-height: 0.94;',
      '  color: var(--ink);',
      '  margin: 0 0 0.75rem;',
      '}',
      '.bep-report-score-band {',
      '  display: inline-block;',
      '  padding: 0.34rem 0.75rem;',
      '  border-radius: 999px;',
      '  font-size: 0.78rem;',
      '  font-weight: 700;',
      '  letter-spacing: 0.05em;',
      '  text-transform: uppercase;',
      '  margin-bottom: 0.85rem;',
      '}',
      '.band-high { background: var(--good-soft); color: var(--good); border: 1px solid rgba(74, 138, 61, 0.24); }',
      '.band-med { background: var(--warn-soft); color: var(--warn); border: 1px solid rgba(122, 93, 30, 0.22); }',
      '.band-low { background: var(--risk-soft); color: var(--risk); border: 1px solid rgba(138, 51, 34, 0.18); }',
      '.bep-report-score-interp {',
      '  margin: 0;',
      '  font-size: 0.94rem;',
      '  line-height: 1.6;',
      '  color: var(--muted);',
      '}',
      '.bep-report-h3 {',
      '  margin: 0 0 0.95rem;',
      '  font-family: "Instrument Serif", Georgia, serif;',
      '  font-size: 1.35rem;',
      '  line-height: 1.1;',
      '  letter-spacing: -0.01em;',
      '  color: var(--ink);',
      '}',
      '.bep-report-sections-list {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 0.55rem;',
      '}',
      '.bep-report-section-row {',
      '  display: grid;',
      '  grid-template-columns: minmax(0, 1fr) 78px auto;',
      '  gap: 0.7rem;',
      '  align-items: center;',
      '  padding: 0.72rem 0.85rem;',
      '  background: #fff;',
      '  border: 1px solid var(--border);',
      '  border-radius: 12px;',
      '  break-inside: avoid;',
      '}',
      '.bep-report-section-row-title {',
      '  color: var(--ink);',
      '  font-size: 0.9rem;',
      '  line-height: 1.35;',
      '}',
      '.bep-report-section-row-bar {',
      '  height: 6px;',
      '  border-radius: 999px;',
      '  background: #e7e0d3;',
      '  overflow: hidden;',
      '}',
      '.bep-report-section-row-bar span {',
      '  display: block;',
      '  height: 100%;',
      '  background: var(--accent);',
      '}',
      '.bep-report-section-row-count {',
      '  font-size: 0.8rem;',
      '  color: var(--muted);',
      '  font-variant-numeric: tabular-nums;',
      '  white-space: nowrap;',
      '}',
      '.bep-report-section-row.is-weak { border-color: rgba(138, 51, 34, 0.22); }',
      '.bep-report-section-row.is-weak .bep-report-section-row-bar span { background: var(--risk); }',
      '.bep-report-section-row.is-strong { border-color: rgba(74, 138, 61, 0.24); }',
      '.bep-report-section-row.is-strong .bep-report-section-row-bar span { background: var(--good); }',
      '.export-analysis { margin-top: 1.15rem; }',
      '#bepReportDiagnosis {',
      '  display: grid;',
      '  gap: 0.85rem;',
      '}',
      '.bep-diag-card {',
      '  background: #fff;',
      '  border: 1px solid var(--border);',
      '  border-radius: 16px;',
      '  padding: 1rem 1rem 1.05rem;',
      '  break-inside: avoid;',
      '}',
      '.bep-diag-card--good {',
      '  background: #f8fbf5;',
      '  border-color: rgba(74, 138, 61, 0.22);',
      '}',
      '.bep-diag-title {',
      '  margin: 0 0 0.65rem;',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  align-items: center;',
      '  gap: 0.55rem;',
      '  font-family: "Instrument Serif", Georgia, serif;',
      '  font-size: 1.14rem;',
      '  line-height: 1.2;',
      '  color: var(--ink);',
      '}',
      '.bep-diag-badge {',
      '  display: inline-block;',
      '  padding: 0.18rem 0.55rem;',
      '  border-radius: 999px;',
      '  background: var(--risk-soft);',
      '  color: var(--risk);',
      '  font-family: "DM Sans", system-ui, sans-serif;',
      '  font-size: 0.69rem;',
      '  font-weight: 700;',
      '  letter-spacing: 0.06em;',
      '  text-transform: uppercase;',
      '}',
      '.bep-diag-body {',
      '  margin: 0 0 0.75rem;',
      '  font-size: 0.92rem;',
      '  line-height: 1.58;',
      '  color: var(--muted);',
      '}',
      '.bep-diag-unchecked {',
      '  list-style: none;',
      '  padding: 0;',
      '  margin: 0 0 0.85rem;',
      '  display: grid;',
      '  gap: 0.42rem;',
      '}',
      '.bep-diag-unchecked li {',
      '  position: relative;',
      '  padding-left: 1.05rem;',
      '  font-size: 0.86rem;',
      '  line-height: 1.5;',
      '  color: var(--muted);',
      '}',
      '.bep-diag-unchecked li::before {',
      '  content: "";',
      '  position: absolute;',
      '  left: 0;',
      '  top: 0.55rem;',
      '  width: 6px;',
      '  height: 6px;',
      '  border-radius: 2px;',
      '  background: var(--accent);',
      '}',
      '.bep-diag-fix {',
      '  font-size: 0.87rem;',
      '  line-height: 1.55;',
      '  color: var(--ink);',
      '}',
      '.bep-diag-fix strong { color: var(--accent-strong); }',
      '.bep-report-footer {',
      '  margin-top: 1.25rem;',
      '  padding-top: 0.95rem;',
      '  border-top: 1px solid var(--border);',
      '  text-align: left;',
      '  font-size: 0.8rem;',
      '  line-height: 1.55;',
      '  color: var(--muted);',
      '}',
      '.bep-report-footer p { margin: 0 0 0.25rem; }',
      '.bep-report-footer a { color: var(--accent-strong); text-decoration: none; }',
      '.bep-report-disclaimer { font-style: italic; }',
      '@media (max-width: 960px) {',
      '  .export-header, .export-summary { grid-template-columns: 1fr; }',
      '  .export-page { width: calc(100vw - 2rem); padding: 1.2rem; min-height: auto; }',
      '  .bep-report-meta { grid-template-columns: 1fr; }',
      '}',
      '@media print {',
      '  @page { size: A4; margin: 12mm 10mm 12mm; }',
      '  html, body { background: #fff !important; }',
      '  .no-print, .export-toolbar { display: none !important; }',
      '  .export-shell { padding: 0; }',
      '  .export-page { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }',
      '  .export-card, .bep-diag-card, .bep-report-section-row, .export-summary, .export-analysis { break-inside: avoid; page-break-inside: avoid; }',
      '}',
      ''
    ].join('\n');
  }

  function openExportView() {
    var exportWindow = window.open('', '_blank');
    if (!exportWindow) {
      window.print();
      return;
    }

    var reportLabelNode = resultsPanel.querySelector('.section-label');
    var sectionsHeadingNode = resultsPanel.querySelector('.bep-report-sections .bep-report-h3');
    var diagnosisHeadingNode = resultsPanel.querySelector('.bep-report-diagnosis .bep-report-h3');
    var exportTitle = (reportTitle.textContent || I.reportTitleGeneric) + ' | Noein Solutions';
    var exportHtml = [
      '<!DOCTYPE html>',
      '<html lang="' + escapeHtml(document.documentElement.lang || 'en') + '">',
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<title>' + escapeHtml(exportTitle) + '</title>',
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">',
      '<style>' + buildExportStyles() + '</style>',
      '</head>',
      '<body>',
      '<div class="export-toolbar no-print">',
      '<p class="export-toolbar-copy">' + escapeHtml(I.exportViewNote) + '</p>',
      '<div class="export-toolbar-actions">',
      '<button type="button" onclick="window.print()">' + escapeHtml(I.exportPrintAction) + '</button>',
      '<button type="button" class="is-secondary" onclick="window.close()">' + escapeHtml(I.exportCloseAction) + '</button>',
      '</div>',
      '</div>',
      '<main class="export-shell">',
      '<article class="export-page">',
      '<header class="export-header">',
      '<div class="export-brand-lockup">',
      '<div class="export-brand">Noein<span>.</span></div>',
      '<div class="export-kicker">' + escapeHtml(I.exportKicker) + '</div>',
      '</div>',
      '<div class="export-report-head">',
      '<div class="section-label">' + escapeHtml(reportLabelNode ? reportLabelNode.textContent : '') + '</div>',
      '<h1 class="export-report-title">' + escapeHtml(reportTitle.textContent) + '</h1>',
      '<div class="bep-report-meta">' + reportMeta.innerHTML + '</div>',
      '</div>',
      '</header>',
      '<section class="export-summary">',
      '<section class="export-card export-score-card">',
      '<div class="export-eyebrow">' + escapeHtml(I.exportScoreLabel) + '</div>',
      '<div class="bep-report-score-num">' + escapeHtml(reportScoreNum.textContent) + '</div>',
      '<div class="' + escapeHtml(reportBand.className) + '">' + escapeHtml(reportBand.textContent) + '</div>',
      '<p class="bep-report-score-interp">' + escapeHtml(reportInterp.textContent) + '</p>',
      '</section>',
      '<section class="export-card">',
      '<h2 class="bep-report-h3">' + escapeHtml(sectionsHeadingNode ? sectionsHeadingNode.textContent : I.sectionBreakdownTitle) + '</h2>',
      '<div class="bep-report-sections-list">' + reportSectionsList.innerHTML + '</div>',
      '</section>',
      '</section>',
      '<section class="export-analysis">',
      '<h2 class="bep-report-h3">' + escapeHtml(diagnosisHeadingNode ? diagnosisHeadingNode.textContent : I.diagnosisTitle) + '</h2>',
      '<div id="bepReportDiagnosis">' + reportDiagnosis.innerHTML + '</div>',
      '</section>',
      '<footer class="bep-report-footer">' + (reportFooter ? reportFooter.innerHTML : '') + '</footer>',
      '</article>',
      '</main>',
      '<script>',
      '(function () {',
      '  function triggerPrint() {',
      '    try { window.focus(); } catch (_) {}',
      '    window.print();',
      '  }',
      '  window.addEventListener("load", function () {',
      '    if (document.fonts && document.fonts.ready) {',
      '      document.fonts.ready.then(function () { setTimeout(triggerPrint, 140); });',
      '      return;',
      '    }',
      '    setTimeout(triggerPrint, 220);',
      '  });',
      '})();',
      '<' + '/script>',
      '</body>',
      '</html>'
    ].join('');

    exportWindow.document.open();
    exportWindow.document.write(exportHtml);
    exportWindow.document.close();
  }

  function buildReport() {
    var s = computeScores();
    var b = bandFor(s.total);

    // Header: title + meta
    var projectName = (projectInput && projectInput.value || '').trim();
    reportTitle.textContent = projectName
      ? I.reportTitleNamed.replace('{project}', projectName)
      : I.reportTitleGeneric;

    var meta = [];
    if (projectName) meta.push('<span><strong>' + I.metaProject + ':</strong>' + escapeHtml(projectName) + '</span>');
    var authorName = (authorInput && authorInput.value || '').trim();
    if (authorName) meta.push('<span><strong>' + I.metaAuthor + ':</strong>' + escapeHtml(authorName) + '</span>');
    var dateVal = (dateInput && dateInput.value || '').trim();
    if (dateVal) meta.push('<span><strong>' + I.metaDate + ':</strong>' + escapeHtml(formatDate(dateVal)) + '</span>');
    var ctx = (document.querySelector('input[name="context"]:checked') || {}).value;
    var ctxLabel = ctx === 'delivery' ? I.contextDel : I.contextPre;
    meta.push('<span><strong>' + I.metaStage + ':</strong>' + escapeHtml(ctxLabel) + '</span>');
    reportMeta.innerHTML = meta.join('');

    // Score + band
    reportScoreNum.textContent = s.total + ' / ' + s.max;
    reportBand.className = 'bep-report-score-band ' + b.chipClass;
    reportBand.textContent = b.label;
    reportInterp.textContent = b.interp;

    // Section breakdown
    var rows = '';
    SECTIONS.forEach(function (sec) {
      var ps = s.perSection[sec.id];
      var cls = '';
      if (ps.pct >= 1) cls = ' is-strong';
      else if (ps.pct < 0.5) cls = ' is-weak';
      rows += '<div class="bep-report-section-row' + cls + '">';
      rows +=   '<span class="bep-report-section-row-title">' + escapeHtml(sec.title) + '</span>';
      rows +=   '<span class="bep-report-section-row-bar"><span style="width:' + (ps.pct * 100) + '%"></span></span>';
      rows +=   '<span class="bep-report-section-row-count">' + ps.count + ' / ' + ps.total + '</span>';
      rows += '</div>';
    });
    reportSectionsList.innerHTML = rows;

    // Diagnosis: weak sections (< 50% complete)
    var diag = '';
    var weak = SECTIONS.filter(function (sec) {
      return s.perSection[sec.id].pct < 0.5;
    });

    if (weak.length === 0) {
      diag += '<div class="bep-diag-card bep-diag-card--good">';
      diag +=   '<div class="bep-diag-title">' + I.allStrong + '</div>';
      diag +=   '<div class="bep-diag-body">' + I.allStrongBody + '</div>';
      diag += '</div>';
    } else {
      weak.forEach(function (sec) {
        var ps = s.perSection[sec.id];
        var unchecked = [];
        sec.items.forEach(function (txt, iIdx) {
          var inp = document.getElementById(sec.id + '_' + iIdx);
          if (inp && !inp.checked) unchecked.push(txt);
        });

        diag += '<div class="bep-diag-card">';
        diag +=   '<div class="bep-diag-title">' + escapeHtml(sec.title) + ' <span class="bep-diag-badge">' + I.diagBadgeWeak + '</span> <span class="bep-report-section-row-count">' + ps.count + ' / ' + ps.total + '</span></div>';
        if (unchecked.length) {
          diag += '<div class="bep-diag-body">' + I.unresolvedLead + '</div>';
          diag += '<ul class="bep-diag-unchecked">';
          unchecked.forEach(function (t) {
            diag += '<li>' + escapeHtml(t) + '</li>';
          });
          diag += '</ul>';
        }
        diag += '<div class="bep-diag-fix"><strong>' + I.diagFix + '</strong>' + escapeHtml(sec.fix) + '</div>';
        diag += '</div>';
      });
    }
    reportDiagnosis.innerHTML = diag;
  }

  // ─── Wire events ───
  sectionsHost.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[type="checkbox"]')) {
      updateLiveScore();
    }
  });

  [projectInput, authorInput, dateInput].forEach(function (el) {
    if (el) el.addEventListener('input', persist);
  });

  document.querySelectorAll('input[name="context"]').forEach(function (r) {
    r.addEventListener('change', persist);
  });

  if (jumpBtn) {
    jumpBtn.addEventListener('click', function () {
      var s = computeScores();
      if (s.total === 0) {
        scoreBand.textContent = I.noScoreYet;
        scoreCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      buildReport();
      resultsPanel.hidden = false;
      resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm(I.resetConfirm)) return;
      document.querySelectorAll('input[data-section]').forEach(function (inp) {
        inp.checked = false;
      });
      if (projectInput) projectInput.value = '';
      if (authorInput) authorInput.value = '';
      var defaultCtx = document.querySelector('input[name="context"][value="pre-appointment"]');
      if (defaultCtx) defaultCtx.checked = true;
      resultsPanel.hidden = true;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      updateLiveScore();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', function () {
      buildReport();
      resultsPanel.hidden = false;
      openExportView();
    });
  }

})();
