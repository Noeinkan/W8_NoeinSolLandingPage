/* ═══════════════════════════════════════════════════════════
   EIR Clarity Check — interactive tool
   Renders 12 questions across 4 sections on a 0–3 clarity
   scale (Missing / Vague / Partial / Clear), computes a live
   /100 clarity score, surfaces the 3 lowest-scoring questions
   as the "most expensive gaps", and builds a printable PDF
   report with the full breakdown. No gating — full report is
   always visible.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var isItalian = document.documentElement.lang === 'it';

  // ─── i18n strings ───
  // Single EN branch now; IT branch is stubbed for the later
  // mirror pass and follows the LOCALIZATION_IT_STYLE.md brief.
  var I = isItalian ? {
    scaleNone: 'Mancante',
    scaleVague: 'Vago',
    scalePartial: 'Parziale',
    scaleClear: 'Chiaro',
    sectionsLegend: 'Valuta quanto ogni requisito è chiaro, specifico e verificabile',
    progress: 'completate',
    bandWaiting: 'Inizia a rispondere per vedere la tua fascia',
    bandHigh: 'Alta chiarezza — idonea alla gara',
    bandMed: 'Media — chiudi i gap prima di pubblicare',
    bandLow: 'Bassa — alto rischio di cicli di chiarimento',
    interpHigh: 'Il tuo EIR è ben scritto: i bidder possono rispondere senza dover chiedere. Verifica che ogni numero rimandi a evidenze e fai un pass finale sulla sezione "informazioni riservate".',
    interpMed: 'La struttura c\'è, ma le ambiguità costeranno tempo in fase di chiarimento. Concentrati sui tre gap evidenziati sotto prima di pubblicare.',
    interpLow: 'Il tuo EIR non è ancora pronto. Pubblicarlo così significa invitare decine di chiarimenti e un\'alta probabilità di offerta non comparabile. Rivedi i gap evidenziati prima della pubblicazione.',
    noScoreYet: 'Rispondi almeno a una domanda per generare il report.',
    reportTitleGeneric: 'Report chiarezza EIR',
    reportTitleNamed: 'Report chiarezza EIR — {project}',
    metaProject: 'Progetto',
    metaAuthor: 'Preparato da',
    metaDate: 'Data',
    exportViewNote: 'Vista pulita ottimizzata per il PDF. Nella finestra di stampa scegli «Salva come PDF»; se il browser aggiunge intestazioni o piè di pagina, disattivali in Altre impostazioni.',
    exportPrintAction: 'Stampa / Salva PDF',
    exportCloseAction: 'Chiudi anteprima',
    exportKicker: 'Diagnostica chiarezza EIR ISO 19650',
    exportScoreLabel: 'Quadro punteggio',
    sectionBreakdownTitle: 'Dettaglio per sezione',
    gapsTitle: 'I tuoi tre gap più costosi',
    gapsSub: 'Le tre domande con il punteggio più basso. Chiuderle avrà l\'impatto maggiore su chiarimenti e tempi di risposta BEP.',
    breakdownTitle: 'Dettaglio completo delle 12 domande',
    breakdownSub: 'Ogni domanda, il tuo punteggio, niente nascosto. Usalo come foglio di lavoro per il team.',
    ratingLabels: { 0: 'Mancante', 1: 'Vago', 2: 'Parziale', 3: 'Chiaro' },
    fixLead: 'Come chiuderlo: ',
    resetConfirm: 'Azzerare tutte le risposte?',
    notRated: 'Non valutato'
  } : {
    scaleNone: 'Missing',
    scaleVague: 'Vague',
    scalePartial: 'Partial',
    scaleClear: 'Clear',
    sectionsLegend: 'Rate how clear, specific, and testable each requirement is',
    progress: 'complete',
    bandWaiting: 'Start rating questions to see your band',
    bandHigh: 'High clarity — fit for tender',
    bandMed: 'Medium — close gaps before issuing',
    bandLow: 'Low — high risk of clarification cycles',
    interpHigh: 'Your EIR is well written: bidders can respond without asking. Verify every claim points to evidence, and do a final pass on the security/classification section.',
    interpMed: 'The structure is there, but the ambiguities will cost you in clarifications. Focus on the three gaps highlighted below before issuing.',
    interpLow: 'Your EIR is not ready to issue. Publishing it like this invites dozens of clarifications and a high risk of non-comparable bids. Address the highlighted gaps before issuing.',
    noScoreYet: 'Rate at least one question to generate your report.',
    reportTitleGeneric: 'Your EIR clarity report',
    reportTitleNamed: 'EIR clarity report — {project}',
    metaProject: 'Project',
    metaAuthor: 'Prepared by',
    metaDate: 'Date',
    exportViewNote: 'Clean PDF view. Choose "Save as PDF" in the print dialog; if your browser adds headers and footers, switch them off in More settings for the cleanest export.',
    exportPrintAction: 'Print / Save PDF',
    exportCloseAction: 'Close preview',
    exportKicker: 'ISO 19650 EIR clarity diagnostic',
    exportScoreLabel: 'Score overview',
    sectionBreakdownTitle: 'Section-by-section breakdown',
    gapsTitle: 'Your three most expensive gaps',
    gapsSub: 'The three questions you rated lowest. Closing these will have the biggest impact on clarifications and BEP response time.',
    breakdownTitle: 'Full 12-question breakdown',
    breakdownSub: 'Every question, your rating, nothing hidden. Use this as a working sheet to brief your team.',
    ratingLabels: { 0: 'Missing', 1: 'Vague', 2: 'Partial', 3: 'Clear' },
    fixLead: 'How to close it: ',
    resetConfirm: 'Reset all answers?',
    notRated: 'Not rated'
  };

  // ─── Scale labels in render order (0,1,2,3) ───
  var SCALE_VALUES = [0, 1, 2, 3];
  function scaleLabel(v) {
    return I.ratingLabels[v] || I.notRated;
  }
  function ratingClass(v) {
    if (v === null || v === undefined) return 'is-none';
    if (v >= 3) return 'is-high';
    if (v >= 2) return 'is-med';
    return 'is-low';
  }

  // ─── Questionnaire data ───
  // 4 sections, 12 questions. Each question carries a `fix`
  // remediation sentence surfaced when it lands in the top-3.
  var SECTIONS = isItalian ? [
    {
      id: 's1', num: '1', title: 'Requisiti di consegna',
      questions: [
        {
          id: 'q1_1',
          text: 'Finalità informative e milestone di consegna sono dichiarate in modo specifico (cosa, quando, a chi).',
          fix: 'Elenca ogni scadenza contrattuale con un deliverable collegato. "Mensile" non basta: "Revisione architettonica al gate 2 entro il 15/03" è verificabile.'
        },
        {
          id: 'q1_2',
          text: 'I requisiti di naming, formato di scambio e metadati sono specificati in modo univoco (no interpretazioni multiple).',
          fix: 'Dai un formato, un esempio e un validator. ISO 19650-2 Annex B è un buon punto di partenza: tabelle, schemi, naming.'
        },
        {
          id: 'q1_3',
          text: 'Il livello di informazione necessario (LOIN) è espresso per tipo di deliverable, non genericamente.',
          fix: 'Sostituisci le frasi vaghe ("come richiesto") con tabelle LOIN per famiglia di deliverable. I bidder non possono quotare ciò che non è misurabile.'
        }
      ]
    },
    {
      id: 's2', num: '2', title: 'Ruoli e capability',
      questions: [
        {
          id: 'q2_1',
          text: 'I ruoli di information management (IM, BIM Manager, Task Team Manager) sono definiti con responsabilità e decisioni, non solo titoli.',
          fix: 'Una RACI per fase di progetto. Titoli senza responsabilità non sono requisiti: sono ambiguità che pagherai in clarification.'
        },
        {
          id: 'q2_2',
          text: 'I criteri di capability e capacity sono espressi come evidenze richieste, non come claim.',
          fix: 'Chiedi CV con progetti comparabili, certificazioni e ruoli. Meglio ancora: definisci una soglia minima (es. "minimo 3 progetti infrastrutturali ISO 19650-2 negli ultimi 5 anni").'
        },
        {
          id: 'q2_3',
          text: 'Mobilitazione, training e tempi di onboarding sono descritti in modo che un bidder sappia quotarli.',
          fix: 'Tempi di mobilitazione, accesso CDE, induction e training: ognuno con una durata. Un piano di mobilitazione vago diventa un costo nascosto in offerta.'
        }
      ]
    },
    {
      id: 's3', num: '3', title: 'CDE, piattaforme e integrazione',
      questions: [
        {
          id: 'q3_1',
          text: 'Gli stati di workflow CDE (WIP, Shared, Published, Archived) e i gate di approvazione sono definiti.',
          fix: 'Stati + responsabili per ogni transizione + turnaround massimo. Senza questo, la federazione diventa un problema di coordinamento, non un workflow.'
        },
        {
          id: 'q3_2',
          text: 'La piattaforma CDE è specificata, o i criteri di scelta/approvazione sono chiari (noein terms).',
          fix: 'O specifichi la piattaforma (con estensioni supportate), o specifichi i criteri di equivalenza. Altrimenti ti trovi a discutere di vendor in clarification.'
        },
        {
          id: 'q3_3',
          text: 'Frequenza di scambio informativo e turnaround di review sono dichiarati in modo realistico.',
          fix: 'Un numero di giorni per ogni review. "Tempestivo" non è un requisito: è una fonte di attrito. Es. "Review 5 giorni lavorativi, escalation automatica a 7".'
        }
      ]
    },
    {
      id: 's4', num: '4', title: 'Standard, riferimenti e accettazione',
      questions: [
        {
          id: 'q4_1',
          text: 'Gli standard di riferimento (ISO 19650 parti, BS/PAS, IDS) sono elencati in modo puntuale, con la versione.',
          fix: 'Lista per esteso: "ISO 19650-2:2018, ISO 19650-3:2020, ISO 19650-5:2020, IDS 1.0". Senza versione, ogni bidder assume una sua versione.'
        },
        {
          id: 'q4_2',
          text: 'I criteri di accettazione sono oggettivi e testabili (non "a discrezione del committente").',
          fix: 'Ogni deliverable ha una checklist di accettazione. Se serve giudizio soggettivo, definisci il panel e i criteri: niente "a insindacabile giudizio" senza processo.'
        },
        {
          id: 'q4_3',
          text: 'Audit trail, versioning e tracciabilità sono requisiti verificabili, non promesse.',
          fix: 'Specifica cosa deve essere tracciato (revisioni, approvals, log accessi) e per quanto tempo. I bidder devono poter quotare il costo di un audit trail conforme.'
        }
      ]
    }
  ] : [
    {
      id: 's1', num: '1', title: 'Delivery requirements',
      questions: [
        {
          id: 'q1_1',
          text: 'Information purposes and delivery milestones are declared specifically (what, when, to whom) — not as generic narrative.',
          fix: 'List every contractual deadline with a tied deliverable. "Monthly" is not enough — "Architectural review at gate 2 by 15/03" is testable.'
        },
        {
          id: 'q1_2',
          text: 'Naming, exchange format, and metadata requirements are specified unambiguously (no room for multiple interpretations).',
          fix: 'Give a format, an example, and a validator. ISO 19650-2 Annex B is a sound starting point: tables, schemas, naming.'
        },
        {
          id: 'q1_3',
          text: 'Level of Information Need (LOIN) is expressed per deliverable type, not generically for the project.',
          fix: 'Replace vague phrases ("as required") with LOIN tables per deliverable family. Bidders cannot price what is not measurable.'
        }
      ]
    },
    {
      id: 's2', num: '2', title: 'Roles and capability',
      questions: [
        {
          id: 'q2_1',
          text: 'Information management roles (IM, BIM Manager, Task Team Manager) are defined with responsibilities and decision rights — not just titles.',
          fix: 'A RACI per project phase. Titles without responsibilities are not requirements — they are ambiguities you will pay for in clarifications.'
        },
        {
          id: 'q2_2',
          text: 'Capability and capacity criteria are expressed as required evidence, not as narrative claims.',
          fix: 'Ask for CVs with comparable projects, certifications, and roles. Better still, define a minimum threshold (e.g. "minimum 3 ISO 19650-2 infrastructure projects in the last 5 years").'
        },
        {
          id: 'q2_3',
          text: 'Mobilisation, training, and onboarding are described in a way a bidder can price.',
          fix: 'Mobilisation timing, CDE access, induction, training — each with a duration. A vague mobilisation plan becomes a hidden cost in the bid.'
        }
      ]
    },
    {
      id: 's3', num: '3', title: 'CDE, platforms, and integration',
      questions: [
        {
          id: 'q3_1',
          text: 'CDE workflow states (WIP, Shared, Published, Archived) and approval gates are defined.',
          fix: 'States + owners for every transition + maximum turnaround. Without this, federation becomes a coordination problem, not a workflow.'
        },
        {
          id: 'q3_2',
          text: 'The CDE platform is specified, or the criteria for choosing/approving one are clear (no proprietary lock-in).',
          fix: 'Either specify the platform (with supported extensions), or specify equivalence criteria. Otherwise you end up debating vendors in clarification.'
        },
        {
          id: 'q3_3',
          text: 'Information exchange frequency and review turnaround are declared realistically.',
          fix: 'A number of days for each review. "Prompt" is not a requirement — it is a source of friction. E.g. "5 working days review, automatic escalation at 7".'
        }
      ]
    },
    {
      id: 's4', num: '4', title: 'Standards, references, and acceptance',
      questions: [
        {
          id: 'q4_1',
          text: 'Reference standards (ISO 19650 parts, BS/PAS, IDS) are listed precisely, with the version number.',
          fix: 'List fully: "ISO 19650-2:2018, ISO 19650-3:2020, ISO 19650-5:2020, IDS 1.0". Without a version, every bidder assumes their own.'
        },
        {
          id: 'q4_2',
          text: 'Acceptance criteria are objective and testable (not "at the client\'s discretion").',
          fix: 'Every deliverable has an acceptance checklist. If subjective judgement is required, define the panel and criteria — no "sole discretion" without a process.'
        },
        {
          id: 'q4_3',
          text: 'Audit trail, versioning, and traceability are verifiable requirements, not promises.',
          fix: 'Specify what must be tracked (revisions, approvals, access logs) and for how long. Bidders must be able to price the cost of a compliant audit trail.'
        }
      ]
    }
  ];

  var TOTAL_QUESTIONS = SECTIONS.reduce(function (acc, s) { return acc + s.questions.length; }, 0);
  var MAX_PER_QUESTION = 3;
  var MAX_TOTAL = TOTAL_QUESTIONS * MAX_PER_QUESTION; // 36
  var STORAGE_KEY = 'noein.eir.v1';

  // ─── DOM refs ───
  var sectionsHost = document.getElementById('eirSections');
  var scoreNum = document.getElementById('eirScoreNum');
  var scoreFill = document.getElementById('eirScoreFill');
  var scoreBand = document.getElementById('eirScoreBand');
  var scoreBreakdown = document.getElementById('eirScoreBreakdown');
  var scoreCard = document.getElementById('eirScoreCard');
  var resultsPanel = document.getElementById('eirResults');
  var reportTitle = document.getElementById('eirReportTitle');
  var reportMeta = document.getElementById('eirReportMeta');
  var reportScoreNum = document.getElementById('eirReportScoreNum');
  var reportBand = document.getElementById('eirReportBand');
  var reportInterp = document.getElementById('eirReportInterp');
  var reportSectionsList = document.getElementById('eirReportSectionsList');
  var reportGaps = document.getElementById('eirReportGaps');
  var reportBreakdown = document.getElementById('eirReportBreakdown');
  var reportFooter = resultsPanel ? resultsPanel.querySelector('.bep-report-footer') : null;
  var projectInput = document.getElementById('eir-project');
  var authorInput = document.getElementById('eir-author');
  var dateInput = document.getElementById('eir-date');
  var jumpBtn = document.getElementById('eirJumpResults');
  var resetBtn = document.getElementById('eirReset');
  var printBtn = document.getElementById('eirPrintBtn');

  if (!sectionsHost) return; // safety

  // Set today as default date
  if (dateInput && !dateInput.value) {
    var t = new Date();
    var yyyy = t.getFullYear();
    var mm = String(t.getMonth() + 1).padStart(2, '0');
    var dd = String(t.getDate()).padStart(2, '0');
    dateInput.value = yyyy + '-' + mm + '-' + dd;
  }

  // ─── Render sections (4 accordions) + questions (12 fieldsets with 0-3 radios) ───
  function renderSections() {
    var html = '';
    SECTIONS.forEach(function (sec, sIdx) {
      var openAttr = sIdx === 0 ? ' open' : '';
      html += '<details class="bep-section" id="' + sec.id + '"' + openAttr + '>';
      html +=   '<summary class="bep-section-head">';
      html +=     '<span class="bep-section-num" aria-hidden="true">' + sec.num + '</span>';
      html +=     '<span class="bep-section-title">' + escapeHtml(sec.title) + '</span>';
      html +=     '<span class="bep-section-progress" data-progress-for="' + sec.id + '">';
      html +=       '<span class="bep-section-progress-bar"><span class="bep-section-progress-fill"></span></span>';
      html +=       '<span class="bep-section-progress-text">0 / ' + sec.questions.length + '</span>';
      html +=     '</span>';
      html +=     '<svg class="bep-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
      html +=   '</summary>';
      html +=   '<div class="bep-section-body">';
      sec.questions.forEach(function (q) {
        html += '<fieldset class="eir-q" data-question="' + q.id + '">';
        html +=   '<legend class="eir-q-legend">' + escapeHtml(q.text) + '</legend>';
        html +=   '<div class="eir-q-scale" role="radiogroup" aria-label="' + escapeHtml(q.text) + '">';
        SCALE_VALUES.forEach(function (v) {
          var inputId = 'eir_' + q.id + '_' + v;
          html += '<label for="' + inputId + '">';
          html +=   '<input type="radio" name="eir_' + q.id + '" id="' + inputId + '" value="' + v + '">';
          html +=   '<span class="eir-q-scale-num">' + v + '</span>';
          html +=   '<span class="eir-q-scale-text">' + escapeHtml(scaleLabel(v)) + '</span>';
          html += '</label>';
        });
        html +=   '</div>';
        html += '</fieldset>';
      });
      html +=   '</div>';
      html += '</details>';
    });
    sectionsHost.innerHTML = html;
  }

  renderSections();

  // ─── Read a single question's value (0-3 or null) ───
  function readValue(qid) {
    var checked = document.querySelector('input[name="eir_' + qid + '"]:checked');
    if (!checked) return null;
    var v = parseInt(checked.value, 10);
    if (isNaN(v) || v < 0 || v > 3) return null;
    return v;
  }

  // ─── Scoring ───
  // Sums 0-3 per question, /36 normalised to /100.
  function computeScores() {
    var total = 0;
    var answered = 0;
    var perSection = {};
    var perQuestion = {}; // { qid: { value, sectionId, sectionIdx, qIdx, text, fix } }

    SECTIONS.forEach(function (sec, sIdx) {
      var sum = 0;
      var ansInSection = 0;
      sec.questions.forEach(function (q, qIdx) {
        var v = readValue(q.id);
        perQuestion[q.id] = {
          value: v,
          sectionId: sec.id,
          sectionIdx: sIdx,
          qIdx: qIdx,
          sectionTitle: sec.title,
          text: q.text,
          fix: q.fix
        };
        if (v !== null) {
          sum += v;
          ansInSection += 1;
          total += v;
          answered += 1;
        }
      });
      perSection[sec.id] = {
        sum: sum,
        count: ansInSection,
        total: sec.questions.length,
        max: sec.questions.length * MAX_PER_QUESTION, // 9 per section
        pct: sum / (sec.questions.length * MAX_PER_QUESTION)
      };
    });

    var pct = total / MAX_TOTAL; // 0..1
    return {
      total: total,
      max: MAX_TOTAL,
      answered: answered,
      pct: pct,
      score: Math.round(pct * 100),
      perSection: perSection,
      perQuestion: perQuestion
    };
  }

  function bandFor(score) {
    if (score >= 80) return { key: 'high', label: I.bandHigh, className: 'is-high', chipClass: 'band-high', interp: I.interpHigh };
    if (score >= 55) return { key: 'med',  label: I.bandMed,  className: 'is-med',  chipClass: 'band-med',  interp: I.interpMed };
    return             { key: 'low',  label: I.bandLow,  className: 'is-low',  chipClass: 'band-low',  interp: I.interpLow };
  }

  function updateLiveScore() {
    var s = computeScores();
    scoreNum.textContent = s.score;
    scoreFill.style.width = s.score + '%';

    scoreCard.classList.remove('is-high', 'is-med', 'is-low');
    if (s.answered === 0) {
      scoreBand.textContent = I.bandWaiting;
    } else {
      var b = bandFor(s.score);
      scoreCard.classList.add(b.className);
      scoreBand.textContent = b.label;
    }

    // Per-section sub-scores in the sidebar
    var rows = '';
    SECTIONS.forEach(function (sec) {
      var ps = s.perSection[sec.id];
      rows += '<div class="bep-score-breakdown-row"><span>' + escapeHtml(sec.title) + '</span><strong>' + ps.sum + ' / ' + ps.max + '</strong></div>';
    });
    scoreBreakdown.innerHTML = rows;

    // Per-section progress inline on each section header
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
        if (ps.count === ps.total && ps.sum === ps.max) section.classList.add('bep-section--highlight');
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
        answers: {}
      };
      SECTIONS.forEach(function (sec) {
        sec.questions.forEach(function (q) {
          var v = readValue(q.id);
          if (v !== null) state.answers[q.id] = v;
        });
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
      if (state.answers) {
        Object.keys(state.answers).forEach(function (qid) {
          var v = state.answers[qid];
          var radio = document.querySelector('input[name="eir_' + qid + '"][value="' + v + '"]');
          if (radio) radio.checked = true;
        });
      }
    } catch (_) { /* ignore */ }
  }

  restore();
  updateLiveScore();

  // ─── Helpers ───
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

  // ─── Top-3 gaps ───
  // Pick the 3 lowest-scoring questions. Unrated questions go to the
  // bottom (they're "unknown", not "weak"). Tie-break by section order.
  function pickTop3Gaps(s) {
    var entries = [];
    Object.keys(s.perQuestion).forEach(function (qid) {
      var q = s.perQuestion[qid];
      entries.push({
        qid: qid,
        value: q.value,
        sectionId: q.sectionId,
        sectionTitle: q.sectionTitle,
        sectionIdx: q.sectionIdx,
        qIdx: q.qIdx,
        text: q.text,
        fix: q.fix
      });
    });
    // Sort: lowest value first; null/unrated last; tie-break by section then q idx
    entries.sort(function (a, b) {
      var aRank = a.value === null ? 99 : a.value;
      var bRank = b.value === null ? 99 : b.value;
      if (aRank !== bRank) return aRank - bRank;
      if (a.sectionIdx !== b.sectionIdx) return a.sectionIdx - b.sectionIdx;
      return a.qIdx - b.qIdx;
    });
    return entries.slice(0, 3);
  }

  // ─── Build report ───
  function buildReport() {
    var s = computeScores();
    var b = bandFor(s.score);

    // Title + meta
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
    reportMeta.innerHTML = meta.join('');

    // Score + band
    reportScoreNum.textContent = s.score + ' / 100';
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
      rows +=   '<span class="bep-report-section-row-count">' + ps.sum + ' / ' + ps.max + '</span>';
      rows += '</div>';
    });
    reportSectionsList.innerHTML = rows;

    // Top-3 gap cards
    var gaps = pickTop3Gaps(s);
    var gapHtml = '';
    gaps.forEach(function (g, i) {
      var displayValue = g.value === null ? I.notRated : (g.value + ' / 3 · ' + scaleLabel(g.value));
      var pillLabel = g.value === null ? '—' : (g.value + '/3');
      gapHtml += '<div class="eir-gap-card">';
      gapHtml +=   '<div class="eir-gap-rank"><span class="eir-gap-rank-num">' + (i + 1) + '</span> Top gap</div>';
      gapHtml +=   '<div class="eir-gap-section">' + escapeHtml(g.sectionTitle) + '</div>';
      gapHtml +=   '<div class="eir-gap-q">' + escapeHtml(g.text) + '</div>';
      gapHtml +=   '<div class="eir-gap-rating">';
      gapHtml +=     '<span class="eir-gap-rating-pill ' + ratingClass(g.value) + '">' + escapeHtml(pillLabel) + '</span>';
      gapHtml +=     '<span>' + escapeHtml(displayValue) + '</span>';
      gapHtml +=   '</div>';
      gapHtml +=   '<div class="eir-gap-fix"><strong>' + I.fixLead + '</strong>' + escapeHtml(g.fix) + '</div>';
      gapHtml += '</div>';
    });
    reportGaps.innerHTML = gapHtml;

    // Full 12-question breakdown (always visible, nothing blurred)
    var breakdownHtml = '';
    SECTIONS.forEach(function (sec) {
      sec.questions.forEach(function (q) {
        var v = readValue(q.id);
        var display = v === null ? I.notRated : (v + ' / 3 · ' + scaleLabel(v));
        var pillLabel = v === null ? '—' : (v + '/3');
        breakdownHtml += '<div class="eir-breakdown-row">';
        breakdownHtml +=   '<div class="eir-breakdown-q"><span class="eir-breakdown-q-section">' + escapeHtml(sec.title) + '</span>' + escapeHtml(q.text) + '</div>';
        breakdownHtml +=   '<div class="eir-breakdown-rating">';
        breakdownHtml +=     '<span class="eir-breakdown-rating-pill ' + ratingClass(v) + '">' + escapeHtml(pillLabel) + '</span>';
        breakdownHtml +=     '<span>' + escapeHtml(display) + '</span>';
        breakdownHtml +=   '</div>';
        breakdownHtml += '</div>';
      });
    });
    reportBreakdown.innerHTML = breakdownHtml;
  }

  // ─── PDF export — reuses the BEP buildExportStyles scaffolding with eir- IDs ───
  function buildExportStyles() {
    // Identical structure to bep-checklist.js — same class names. Reuse as-is.
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
      'html, body { margin: 0; padding: 0; background: #d8d0c5; color: var(--ink); font-family: "DM Sans", system-ui, sans-serif; }',
      'body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '.export-toolbar { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.85rem 1rem; padding: 1rem 1.25rem; background: rgba(17, 14, 10, 0.92); color: #f7f3ea; }',
      '.export-toolbar-copy { margin: 0; max-width: 48rem; font-size: 0.92rem; line-height: 1.5; }',
      '.export-toolbar-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }',
      '.export-toolbar-actions button { appearance: none; border: 0; border-radius: 999px; padding: 0.75rem 1.1rem; font: inherit; font-weight: 600; cursor: pointer; background: #c9a55a; color: #16110a; }',
      '.export-toolbar-actions .is-secondary { background: transparent; color: #f7f3ea; border: 1px solid rgba(255, 255, 255, 0.25); }',
      '.export-shell { padding: 1.5rem; }',
      '.export-page { width: min(190mm, calc(100vw - 3rem)); min-height: 267mm; margin: 0 auto; background: #fff; box-shadow: 0 22px 64px rgba(23, 16, 6, 0.18); padding: 14mm 13mm 12mm; }',
      '.export-header { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.3fr); gap: 1.25rem; align-items: end; padding-bottom: 1.1rem; border-bottom: 1px solid var(--border); }',
      '.export-brand-lockup { align-self: start; }',
      '.export-brand { font-family: "Instrument Serif", Georgia, serif; font-size: 2.2rem; line-height: 0.95; color: var(--ink); }',
      '.export-brand span { color: var(--accent); }',
      '.export-kicker { margin-top: 0.45rem; font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-strong); }',
      '.section-label { font-size: 0.74rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-strong); }',
      '.export-report-title { margin: 0.35rem 0 0; font-family: "Instrument Serif", Georgia, serif; font-size: 2.35rem; line-height: 1.02; letter-spacing: -0.02em; color: var(--ink); }',
      '.bep-report-meta { margin-top: 1rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem 1rem; font-size: 0.86rem; color: var(--muted); }',
      '.bep-report-meta span { display: flex; flex-wrap: wrap; gap: 0.3rem; padding-top: 0.55rem; border-top: 1px solid var(--border); }',
      '.bep-report-meta span strong { color: var(--ink); font-weight: 600; }',
      '.export-summary { display: grid; grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr); gap: 1rem; margin-top: 1.2rem; margin-bottom: 1.3rem; break-inside: avoid; }',
      '.export-card { background: var(--paper-alt); border: 1px solid var(--border); border-radius: 16px; padding: 1rem 1rem 1.05rem; break-inside: avoid; }',
      '.export-score-card { background: linear-gradient(180deg, #faf4e8 0%, #f4ebdb 100%); }',
      '.export-eyebrow { margin-bottom: 0.5rem; font-size: 0.74rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-strong); }',
      '.bep-report-score-num { font-family: "Instrument Serif", Georgia, serif; font-size: 3.05rem; line-height: 0.94; color: var(--ink); margin: 0 0 0.75rem; }',
      '.bep-report-score-band { display: inline-block; padding: 0.34rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.85rem; }',
      '.band-high { background: var(--good-soft); color: var(--good); border: 1px solid rgba(74, 138, 61, 0.24); }',
      '.band-med { background: var(--warn-soft); color: var(--warn); border: 1px solid rgba(122, 93, 30, 0.22); }',
      '.band-low { background: var(--risk-soft); color: var(--risk); border: 1px solid rgba(138, 51, 34, 0.18); }',
      '.bep-report-score-interp { margin: 0; font-size: 0.94rem; line-height: 1.6; color: var(--muted); }',
      '.bep-report-h3 { margin: 0 0 0.95rem; font-family: "Instrument Serif", Georgia, serif; font-size: 1.35rem; line-height: 1.1; letter-spacing: -0.01em; color: var(--ink); }',
      '.bep-report-sections-list { display: flex; flex-direction: column; gap: 0.55rem; }',
      '.bep-report-section-row { display: grid; grid-template-columns: minmax(0, 1fr) 78px auto; gap: 0.7rem; align-items: center; padding: 0.72rem 0.85rem; background: #fff; border: 1px solid var(--border); border-radius: 12px; break-inside: avoid; }',
      '.bep-report-section-row-title { color: var(--ink); font-size: 0.9rem; line-height: 1.35; }',
      '.bep-report-section-row-bar { height: 6px; border-radius: 999px; background: #e7e0d3; overflow: hidden; }',
      '.bep-report-section-row-bar span { display: block; height: 100%; background: var(--accent); }',
      '.bep-report-section-row-count { font-size: 0.8rem; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }',
      '.bep-report-section-row.is-weak { border-color: rgba(138, 51, 34, 0.22); }',
      '.bep-report-section-row.is-weak .bep-report-section-row-bar span { background: var(--risk); }',
      '.bep-report-section-row.is-strong { border-color: rgba(74, 138, 61, 0.24); }',
      '.bep-report-section-row.is-strong .bep-report-section-row-bar span { background: var(--good); }',
      '.export-analysis { margin-top: 1.15rem; }',
      '.eir-export-gaps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem; margin-top: 0.5rem; }',
      '.eir-export-gap { background: #fff; border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 12px; padding: 0.85rem 0.9rem; break-inside: avoid; }',
      '.eir-export-gap-rank { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-strong); font-weight: 700; }',
      '.eir-export-gap-section { font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-top: 0.2rem; }',
      '.eir-export-gap-q { font-size: 0.9rem; line-height: 1.4; color: var(--ink); margin: 0.35rem 0 0.45rem; }',
      '.eir-export-gap-rating { display: inline-block; padding: 0.15rem 0.55rem; border-radius: 999px; background: var(--risk-soft); color: var(--risk); font-size: 0.74rem; font-weight: 600; margin-bottom: 0.5rem; }',
      '.eir-export-gap-rating.is-med { background: var(--warn-soft); color: var(--warn); }',
      '.eir-export-gap-rating.is-high { background: var(--good-soft); color: var(--good); }',
      '.eir-export-gap-fix { font-size: 0.84rem; line-height: 1.55; color: var(--muted); }',
      '.eir-export-gap-fix strong { color: var(--accent-strong); display: block; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.2rem; }',
      '.eir-export-breakdown { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.45rem; }',
      '.eir-export-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.7rem; align-items: center; padding: 0.55rem 0.75rem; background: #fff; border: 1px solid var(--border); border-radius: 8px; font-size: 0.85rem; break-inside: avoid; }',
      '.eir-export-row-section { display: block; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.15rem; }',
      '.eir-export-row-q { color: var(--ink); line-height: 1.4; }',
      '.eir-export-row-rating { display: inline-flex; align-items: center; gap: 0.4rem; font-variant-numeric: tabular-nums; white-space: nowrap; }',
      '.eir-export-row-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 1.7rem; height: 1.4rem; padding: 0 0.45rem; border-radius: 999px; border: 1px solid var(--border); font-size: 0.78rem; font-weight: 600; }',
      '.eir-export-row-pill.is-high { color: var(--good); border-color: rgba(74, 138, 61, 0.3); }',
      '.eir-export-row-pill.is-med { color: var(--warn); border-color: rgba(122, 93, 30, 0.3); }',
      '.eir-export-row-pill.is-low { color: var(--risk); border-color: rgba(138, 51, 34, 0.3); }',
      '.eir-export-row-pill.is-none { color: var(--muted); border-color: var(--border); }',
      '.bep-report-footer { margin-top: 1.25rem; padding-top: 0.95rem; border-top: 1px solid var(--border); text-align: left; font-size: 0.8rem; line-height: 1.55; color: var(--muted); }',
      '.bep-report-footer p { margin: 0 0 0.25rem; }',
      '.bep-report-footer a { color: var(--accent-strong); text-decoration: none; }',
      '.bep-report-disclaimer { font-style: italic; }',
      '@media (max-width: 960px) {',
      '  .export-header, .export-summary { grid-template-columns: 1fr; }',
      '  .export-page { width: calc(100vw - 2rem); padding: 1.2rem; min-height: auto; }',
      '  .bep-report-meta { grid-template-columns: 1fr; }',
      '  .eir-export-gaps { grid-template-columns: 1fr; }',
      '}',
      '@media print {',
      '  @page { size: A4; margin: 12mm 10mm 12mm; }',
      '  html, body { background: #fff !important; }',
      '  .no-print, .export-toolbar { display: none !important; }',
      '  .export-shell { padding: 0; }',
      '  .export-page { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }',
      '  .export-card, .eir-export-gap, .eir-export-row, .export-summary, .export-analysis { break-inside: avoid; page-break-inside: avoid; }',
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

    // Build the static, print-friendly markup from current report state
    var sectionsHeadingNode = resultsPanel.querySelector('.bep-report-sections .bep-report-h3');
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
      '<div class="section-label">Your Clarity Report</div>',
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
      '<h2 class="bep-report-h3">' + escapeHtml(I.gapsTitle) + '</h2>',
      '<div class="eir-export-gaps">' + reportGaps.innerHTML + '</div>',
      '<h2 class="bep-report-h3" style="margin-top: 1.2rem;">' + escapeHtml(I.breakdownTitle) + '</h2>',
      '<div class="eir-export-breakdown">' + reportBreakdown.innerHTML + '</div>',
      '</section>',
      '<footer class="bep-report-footer">' + (reportFooter ? reportFooter.innerHTML : '') + '</footer>',
      '</article>',
      '</main>',
      '<script>',
      '(function () {',
      '  function triggerPrint() { try { window.focus(); } catch (_) {} window.print(); }',
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

  // ─── Wire events ───
  sectionsHost.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[type="radio"]')) {
      updateLiveScore();
    }
  });

  [projectInput, authorInput, dateInput].forEach(function (el) {
    if (el) el.addEventListener('input', persist);
  });

  if (jumpBtn) {
    jumpBtn.addEventListener('click', function () {
      var s = computeScores();
      if (s.answered === 0) {
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
      sectionsHost.querySelectorAll('input[type="radio"]').forEach(function (r) { r.checked = false; });
      if (projectInput) projectInput.value = '';
      if (authorInput) authorInput.value = '';
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
