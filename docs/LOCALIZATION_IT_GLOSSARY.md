# Italian Terminology Glossary

This glossary is the **what** of EN→IT — which terms map to which words. For the **how** (voice, sentence rhythm, anti-patterns, register), see `LOCALIZATION_IT_STYLE.md`.

Both files apply to every IT change. The test `node it-translation.test.js` enforces a subset of these (accent words, EN-leakage blacklist, structural parity), but most of what's here is style discipline that has to be self-checked.

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
- Programme delivery → `delivery di programma` (when used as a section title or noun phrase). In running prose, `gestione del delivery di programma` works for explanation.
- Supply chain → `filiera`.
- Compliance → `conformità` (with accent — the test catches `conformita` without).
- Onboarding → `onboarding` (or `avvio operativo filiera` in formal copy).
- Gap analysis → `analisi gap`.
- Responsiveness matrix → `Matrice di Rispondenza`.
- Practitioner → `practitioner` (loanword; standard in IT AEC/tech context). `Sul campo` works as a paraphrase in headlines.

## English-stay terms

These never translate, regardless of context: `BEP`, `EIR`, `CDE`, `OIR`, `AIR`, `ISO 19650`, `TIDP`, `MIDP`, `AEC`, `Information Manager`, `BIM Manager`, `digital delivery` (in titles), `governance`, `onboarding`. Treat as Italian loanwords with the appropriate article (`il BEP`, `l'EIR`, `la governance`, `la filiera`).

## Voice

**Speaker `io`. Reader `tu`.** No `Lei` / `Vi` / `voi`. No `noi` as speaker. See `LOCALIZATION_IT_STYLE.md` for the full brief, voice exceptions (hero on index, career timeline on about, testimonials, footer brand), and the anti-pattern catalogue.

## Tone

- Direct and operational. Sound like a senior peer talking, not a vendor.
- Italian is shorter than English by ~15% per idea — split long EN sentences.
- Active verbs (`progetto`, `produco`, `costruisco`) over abstract nouns (`disegno di un framework`).
- No 1990s corporate idioms (`all'avanguardia`, `eccellenza`, `know-how`, `fornire soluzioni`, `mettere a disposizione`).
- No `tipicamente` as a hedge — use `di solito`, `in media`, `durata tipica`, or omit.
- Em-dash (`—`) is rare in IT prose. Use period or colon. (Allowed: title separators, `<cite>` attributions, metric labels.)

## Credentials

Credentials render descriptively in IT with the original EN designation in parens where useful:

- `Ingegnere civile abilitato (Italia, sezione A)`
- `RICS Certified BIM Professional` — keep English; UK-specific.
- `Autodesk 40 Under 40` — keep English; brand award.

## Testimonials

Testimonial blockquotes are translated to IT, never kept in EN. Translate the meaning, localise to how the same client persona would naturally talk in Italian. The speaker is the quoted client — let them address their own audience naturally (which can include `voi` if they're addressing their own team, but Andrea's voice never does).
