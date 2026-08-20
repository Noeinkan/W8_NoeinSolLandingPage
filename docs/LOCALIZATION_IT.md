# Italian Localization — Terminology and Style

The single reference for IT copy on this site: **what** terms to use (glossary) and **how** the copy should read (voice and style).

The voice locked here was established after a full IT rewrite (April 2026), following an audit that found the original IT copy read as AI-generated and dated to native readers.

Run `node scripts/tests/it-translation.test.js` after any IT change. The test catches structural drift, EN-leakage, missing accents, and find/replace scars — but **not voice**. The style half of this document is what catches voice, and it has to be self-checked against the [pre-commit checklist](#pre-commit-checklist).

---

# Part 1 — Glossary

## Terms (EN → IT)

- Digital delivery → `digital delivery` (preferred in titles); `consegna digitale` only in explanatory copy.
- Information management → `gestione informativa`.
- Information requirements → `requisiti informativi`.
- Common Data Environment (CDE) → `Ambiente di Condivisione Dati (ACDat)` on first mention where useful; `CDE` afterwards. In short prose, `CDE` from the start is fine.
- Governance → `governance` (or `governo operativo`, context-specific).
- Building Execution Plan (BEP) → `BEP` (`Piano di Gestione Informativa` only if required by client context).
- Exchange Information Requirements (EIR) → `EIR` (`Capitolato Informativo` on first mention where needed).
- Organisational Information Requirements (OIR) → `OIR`.
- Asset Information Requirements (AIR) → `AIR`.
- Programme delivery → `delivery di programma` (as a section title or noun phrase). In running prose, `gestione del delivery di programma` works for explanation.
- Supply chain → `filiera`.
- Compliance → `conformità` (with accent — the test catches `conformita` without).
- Onboarding → `onboarding` (or `avvio operativo filiera` in formal copy).
- Gap analysis → `analisi gap`.
- Responsiveness matrix → `Matrice di Rispondenza`.
- Practitioner → `practitioner` (loanword; standard in IT AEC/tech context). `Sul campo` works as a paraphrase in headlines.

## English-stay terms

These never translate, regardless of context: `BEP`, `EIR`, `CDE`, `OIR`, `AIR`, `ISO 19650`, `TIDP`, `MIDP`, `AEC`, `Information Manager`, `BIM Manager`, `digital delivery` (in titles), `governance`, `onboarding`.

Treat them as Italian loanwords, with the article agreeing with the gender of the IT equivalent: `il BEP` (masculine, like "il piano"), `l'EIR` (masculine), `la governance` (feminine), `la filiera`.

**Don't stack three glossary terms in a row.** `governance CDE, naming convention, data governance` is a noun-stack, not a sentence — group differently or add verbs.

**First-mention rule** for less-known acronyms on a page where they appear once: `Common Data Environment (CDE)` or `CDE (Common Data Environment)`, then bare `CDE` afterwards. BEP / EIR / ISO 19650 need no gloss — the audience knows them.

## Credentials

Credentials render descriptively in IT with the original EN designation in parens where useful:

- `Ingegnere civile abilitato (Italia, sezione A)`
- `RICS Certified BIM Professional` — keep English; UK-specific.
- `Autodesk 40 Under 40` — keep English; brand award.

---

# Part 2 — Style

## Voice (locked)

**Speaker: `io` (first-person singular). Reader: `tu` (informal second-person).**

The site is a solo consultant addressing senior AEC peers. The EN copy uses pure first-person ("I design", "I produce") and direct second-person ("your team"). The IT must mirror that.

- Default speaker subject is `io`. "Progetto il framework", "Produco BEP", "Entro nel programma".
- Default reader address is `tu`. "Pronto a partire?", "Ti rispondo entro 24 ore", "Ti serve un BEP?".
- **Never `Lei` / `Vi` / `voi` as reader address.** Reads as either dated B2B deference or auto-translated corporate.
- **Never `noi` as speaker.** Andrea is solo — using "we" fabricates a team.
- **Impersonal voice** (`si progetta...`, `viene costruito...`) is allowed sparingly for methodology where Andrea isn't grammatically the subject. Not the default.

### Voice exceptions

These are the only places voice diverges from `io + tu`:

- **Hero on `index.html`** uses third-person `Andrea Aita costruisce…` as a brand billboard. Mirrors EN. This is one block, not a pattern.
- **About-preview on `index.html`** describes Andrea biographically in implicit third-person ("Leader di digital delivery con oltre 10 anni…"). Mirrors EN's biographical intro.
- **Career timeline on `about.html`** uses third-person `Ha guidato…`, `Ha coordinato…` for past roles. Mirrors EN. The "Come lavoro" section on the same page switches back to `io`.
- **Testimonial blockquotes** are in the speaker's voice (the quoted client), not Andrea's. Translate fully to IT — never keep EN quotes — but let the speaker address their own audience naturally (which can include `voi` if they are addressing their own team).
- **Footer brand tagline** is brand voice (third-person about Noein), not Andrea's voice.
- **Privacy policy** stays formal (`Raccogliamo`, `Trattiamo`) because legal copy needs that register.

## Hard rules — never appears in IT copy

1. **No `Lei`, `Vi`, `voi` as reader address.** Single exception: testimonial speakers naturally addressing their own team in `voi`.
2. **No `noi` as speaker** when Andrea is the actual agent. Brand-voice `Noi di Noein` is also out.
3. **No 1990s corporate idioms**: `soluzioni all'avanguardia`, `eccellenza`, `know-how`, `fornire soluzioni`, `mettere a disposizione`, `garantire la massima qualità`, `Vi forniamo`, `Ci mettiamo a vostra completa disposizione`.
4. **No formulaic corporate closings**: `non esitare a contattare`, `a tua disposizione`, `per qualsiasi informazione`.
5. **No `tipicamente`** as a hedge. Use `di solito`, `in media`, `durata tipica`, or omit.
6. **No em-dash (`—`) as a paragraph connector.** Italian uses period, colon, or parenthesis. Two em-dashes in one sentence is a clear EN tell. Em-dash IS allowed as a typographic separator in titles (`Page Title — Site Name`), in `<cite>` tags before an attribution, or in metric labels — but not as a sentence-internal pause.
7. **No `Scopri di più` repeated as default CTA on every card.** Vary: `Approfondisci`, `Vedi come funziona`, `Vedi i dettagli`, or a specific action (`Vedi il case study`, `Prenota una call`).

## Anti-patterns flagged from the audit

These are calques and AI-tells from the pre-rewrite IT. Do not let them creep back.

| Pattern | Why it fails | Use instead |
|---|---|---|
| `da pagina bianca` | Calque of "from a blank page" | `da zero` |
| `non è un'opzione` | Calque of "not an option" | `non è praticabile` / restructure |
| `lato committente` | Calque of "client-side" | `del committente` / `come digital lead del committente` |
| `Nativa ISO 19650` | Calque of "ISO 19650-native" | `disegnata per ISO 19650` / `costruita per ISO 19650` |
| `Costruita sul modo in cui i team reali rispondono` | Calque of "Built around the way real teams respond" | `Disegnata per come i team rispondono davvero` |
| `ha trasformato il modo in cui` | AI-cliché closing | `ha cambiato come …` / specific outcome |
| `visibilità reale` | Corporate-speak | `visibilità vera` / `sappiamo davvero cosa…` |
| `un sistema che le persone usano davvero, non un documento che resta in una cartella` | Formulaic closing — once OK, not repeated across pages | Vary or use `non carta che nessuno legge` / `non un PDF che resta sul CDE` |
| `Andrea disegna / produce / si inserisce` | Third-person speaker | `io progetto / produco / entro` |
| `viene consegnato / vengono prodotti` | Passive when `io` would do | `consegno / produco` |
| `Raccontami su cosa stai lavorando` | Calque of "Tell me about what you're working on" | `Raccontami il progetto` / `Mi racconti il progetto` |
| `Tecnologia a supporto` | Dated corporate H3 | `Accelerato dalla tecnologia` / `La tecnologia giusta al posto giusto` |
| `Imposta bene la gestione informativa` | Bookish imperative | `Una gestione informativa che tiene` / `Gestisci l'informazione come si deve` |
| `dimostrazioni di capability generiche non bastano` | `capability` stays English, but avoid the rest of the noun-stack pattern | Concrete: `Lega i nomi ai ruoli, i ruoli alle attività…` |

## Sentence rhythm

- **Italian is shorter than English per idea by ~15%.** Where the EN has one long sentence with clauses joined by `—`, the IT is usually two or three shorter sentences.
- **Vary sentence length.** Three short sentences in a row read as snappy. Three long ones read as bureaucratic. Mix.
- **Active verbs over abstract nouns.** "Progetto il framework" beats "Disegno di un framework" beats "Il framework viene progettato". Prefer the first.
- **Tone:** direct and operational. Sound like a senior peer talking, not a vendor.

## Lists

- **Three-item parallel noun lists are an EN tell.** When the EN has `frameworks, documents, and systems` styled as a tight tricolon, the IT can:
  - break into a colon + sub-list,
  - merge two items and keep one separate,
  - introduce a verb to break the parallel rhythm.
- **Noun-stacks of 4+ without a verb** (`governance CDE, naming convention, data governance, strutture di reporting, requisiti informativi per la filiera e processi di capability assessment`) are the worst offender. Group, chunk with verbs, or split into two sentences.

## Punctuation

- **Period and colon over em-dash.** When in doubt, replace `—` with `:` (continuation/explanation) or `.` (full stop).
- **Italian quotation marks**: `«»` is most natural for formal quoted material. Curly `"…"` is acceptable but reads more English. Inline quotes within prose (e.g., `cosa significhi «buono»`) prefer `«»`.
- **Numbers and ranges**: en-dash `–` for ranges (`5–7 giorni`, `2024–2025`), not hyphen.

## CTAs and reader address

- CTAs are short and direct. `Prenota una call`, `Contattami`, `Vedi i servizi`. The article + verb pattern (`Prenota una call gratuita di 30 min`) is fine — drop `gratuita` where saying "free" no longer adds commercial value.
- Question-form CTAs work well in IT: `Pronto a partire?`, `Ti serve un BEP in una settimana?`, `Non sai da dove cominciare?`.
- Reader-direct openings: `Ti dico subito`, `Ti rispondo entro 24 ore`, `Mi racconti il progetto`. These set the `tu` register from the first word.

## Calibration: bad → good

| EN | IT (pre-rewrite, AI-tell) | IT (target) |
|---|---|---|
| "I produce compliant, EIR-aligned BEPs in days" | "Andrea produce BEP conformi e allineati all'EIR in giorni" | "Produco BEP conformi all'EIR in 5–7 giorni" |
| "A system people actually use — not a document sitting in a folder" | "Un sistema che le persone usano davvero — non un documento che resta in una cartella" | "Un sistema che il team usa tutti i giorni" |
| "Book a free 30-min call" | "Prenota una call gratuita di 30 min" | "Prenota una call di 30 minuti" (omit `gratuita` after first use) |
| "Not sure where to start?" | "Non sai da dove partire?" | "Non sai da dove cominciare?" |
| "From a single BEP to full programme delivery" | "Dal singolo BEP alla delivery completa di programma" | "Da un singolo BEP alla digital delivery su un intero programma" |
| "no AI for confidential projects" (heading) | "Nessuna AI adatta a progetti riservati" | (the IT was already fine — keep) |
| "Powered by Capsar.io" | "Con il supporto di Capsar.io" | (acceptable as-is — `Powered by` is also fine as a loanword) |
| "Ready to get your digital delivery right?" | "Pronto a strutturare al meglio la tua digital delivery?" | "Pronto a far funzionare davvero la tua digital delivery?" |
| "I'll get back to you within 24 hours" | "Ti risponderò entro 24 ore" | (active future is fine — "Ti rispondo entro 24 ore" also works) |

---

## Pre-commit checklist

Self-review before committing any IT change:

- [ ] No `Lei`, `Vi`, `voi` as reader address (testimonials excepted)
- [ ] No `noi` as speaker (brand voice excepted)
- [ ] No `tipicamente` as a hedge
- [ ] No em-dash as sentence-internal pause (titles / cites / metric labels OK)
- [ ] No three-item noun-stack copying the EN list shape
- [ ] No `Andrea` in third-person where `io` would work
- [ ] No `Scopri di più` repeated identically across multiple cards
- [ ] No formulaic AI-closings reused twice on the same page
- [ ] Terminology matches Part 1, and English-stay terms are untranslated
- [ ] `node scripts/tests/it-translation.test.js` passes
- [ ] Read the page aloud — does it sound like a native Italian peer talking, or a translation? If translation, flag the spot.

## Where this doesn't apply

- **Privacy policy** (`it/privacy.html`) — formal legal register is appropriate. Don't force `tu`.
- **JSON-LD schema descriptions** — these stay in English (machine-readable; the EN site is the canonical source).
- **Form `name` HTML attributes** (`name`, `email`, `company`) — technical identifiers, not copy.
- **Anchor IDs** (`#delivery`, `#markets`, `#tools`, `#games`, `#platform-preview`, `#main-content`) — must stay English; CSS/JS reference them. Only visible link text is translated.
- **JS-referenced element IDs** (`exitOverlayClose`, `exitOverlayDismiss`, `stickyCtaClose`, `leadMagnetSuccess`, and the `bep*` / `eir*` checklist IDs) — must stay byte-identical to EN.
