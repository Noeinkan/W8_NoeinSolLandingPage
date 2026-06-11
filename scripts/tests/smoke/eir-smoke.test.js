// EIR Health Check — runtime smoke test
// Loads eir-checklist.html into jsdom, runs the actual JS, simulates user
// interactions, and verifies scoring / persistence / report generation.
// Run as a one-liner; auto-installs jsdom on first run.
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HERE = __dirname;
const PKG = path.join(HERE, 'package.json');
const NODE_MODULES = path.join(HERE, 'node_modules');
const JSDOM_DIR = path.join(NODE_MODULES, 'jsdom');

// ─── Self-bootstrap: install jsdom on first run ───
if (!fs.existsSync(JSDOM_DIR)) {
  console.log('[smoke] first run — installing jsdom into ' + HERE);
  fs.writeFileSync(PKG, JSON.stringify({ name: 'noein-eir-smoke', private: true, version: '0.0.0' }, null, 2) + '\n');
  try {
    execSync('npm install --no-audit --no-fund --silent --no-save jsdom', { cwd: HERE, stdio: 'inherit' });
  } catch (e) {
    console.error('[smoke] npm install failed; rerun manually: cd ' + HERE + ' && npm install jsdom');
    process.exit(2);
  }
}

let JSDOM, VirtualConsole;
try {
  ({ JSDOM, VirtualConsole } = require('jsdom'));
} catch (e) {
  console.error('[smoke] jsdom still not loadable: ' + e.message);
  process.exit(2);
}

const ROOT = path.resolve(HERE, '..', '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'eir-checklist.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'eir-checklist.js'), 'utf8');

let failures = 0;
let passes = 0;
function pass(msg) { console.log('  ok   ' + msg); passes += 1; }
function fail(msg) { console.log('  FAIL ' + msg); failures += 1; }
function check(cond, msg) { if (cond) pass(msg); else fail(msg); }

const vc = new VirtualConsole();
vc.on('jsdomError', (err) => fail('jsdomError: ' + err.message));
vc.on('error', (msg) => console.log('  [page error] ' + msg));
vc.on('warn', (msg) => console.log('  [page warn] ' + msg));

// All 12 question IDs in eir-checklist.js (format q{s}_{n})
const ALL_QS = ['q1_1','q1_2','q1_3','q2_1','q2_2','q2_3','q3_1','q3_2','q3_3','q4_1','q4_2','q4_3'];

function makeDom(url) {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: url,
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  dom.window.scrollTo = () => {};
  dom.window.print = () => {};
  dom.window.confirm = () => true;
  // jsdom doesn't implement scrollIntoView; stub it on every element
  dom.window.Element.prototype.scrollIntoView = function () {};
  try { dom.window.localStorage.clear(); } catch (_) {}
  return dom;
}

function rate(dom, qid, val) {
  const inp = dom.window.document.querySelector(`input[name="eir_${qid}"][value="${val}"]`);
  if (!inp) { fail(`no radio for ${qid} value ${val}`); return false; }
  inp.checked = true;
  inp.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  return true;
}

function rateAll(dom, val) { ALL_QS.forEach(q => rate(dom, q, val)); }

// ─── 1. DOM render ───
console.log('\n[1] DOM render');
const dom = makeDom('https://noeinsolutions.local/eir.html');
try { dom.window.eval(js); } catch (e) { fail('JS threw on load: ' + e.message); process.exit(1); }

check(!!dom.window.document.getElementById('eirForm'), 'eirForm exists');
check(!!dom.window.document.getElementById('eirSections'), 'eirSections exists');
check(!!dom.window.document.getElementById('eirScoreCard'), 'eirScoreCard exists');
check(!!dom.window.document.getElementById('eirScoreNum'), 'eirScoreNum exists');
check(!!dom.window.document.getElementById('eirScoreBreakdown'), 'eirScoreBreakdown exists');

const sections = dom.window.document.querySelectorAll('details.bep-section');
check(sections.length === 4, 'rendered 4 sections (got ' + sections.length + ')');

const questionFieldsets = dom.window.document.querySelectorAll('fieldset.eir-q');
check(questionFieldsets.length === 12, 'rendered 12 question fieldsets (got ' + questionFieldsets.length + ')');

const radioInputs = dom.window.document.querySelectorAll('input[type="radio"][name^="eir_"]');
check(radioInputs.length === 48, 'rendered 48 radios (12 questions x 4 options), got ' + radioInputs.length);

// ─── 2. Initial state ───
console.log('\n[2] Initial state');
check(dom.window.document.getElementById('eirScoreNum').textContent === '0', 'score starts at 0');
const initialBand = dom.window.document.getElementById('eirScoreBand').textContent;
check(/Start rating/i.test(initialBand), 'initial band text mentions "Start rating" (got "' + initialBand + '")');

// ─── 3. Score updates on rating ───
console.log('\n[3] Scoring — rate a few questions');

// Low band: rate q1_1=3, q2_1=0, q3_1=2, q4_1=1, q4_3=3 → total 9/36 → 25% → Low
rate(dom, 'q1_1', 3);
rate(dom, 'q2_1', 0);
rate(dom, 'q3_1', 2);
rate(dom, 'q4_1', 1);
rate(dom, 'q4_3', 3);

const score1 = parseInt(dom.window.document.getElementById('eirScoreNum').textContent, 10);
check(score1 === 25, 'score is 25/100 after 5 ratings (got ' + score1 + ')');
check(dom.window.document.getElementById('eirScoreCard').classList.contains('is-low'), 'card has is-low class');
const band1 = dom.window.document.getElementById('eirScoreBand').textContent;
check(/^Low/i.test(band1), 'band text starts with Low (got "' + band1 + '")');

// ─── 4. All Clear (high band) ───
console.log('\n[4] Scoring — all Clear (high band)');
rateAll(dom, 3);
const score2 = parseInt(dom.window.document.getElementById('eirScoreNum').textContent, 10);
check(score2 === 100, 'score is 100/100 when all Clear (got ' + score2 + ')');
check(dom.window.document.getElementById('eirScoreCard').classList.contains('is-high'), 'card has is-high class');

// ─── 5. Persistence ───
console.log('\n[5] Persistence');
const stored = dom.window.localStorage.getItem('noein.eir.v1');
check(!!stored, 'state saved to localStorage');
const state = JSON.parse(stored);
check(state.answers.q1_1 === 3, 'q1_1 saved as 3');
check(state.answers.q2_1 === 3, 'q2_1 saved as 3 (overwritten)');
check(Object.keys(state.answers).length === 12, '12 answers stored (got ' + Object.keys(state.answers).length + ')');

// ─── 6. Restore from storage in a fresh DOM ───
console.log('\n[6] Restore in fresh DOM');
// Seeded mix targeting Medium band: 5 clear, 3 partial, 4 vague → 5*3 + 3*2 + 4*1 = 25, pct = 25/36, score = 69
// (thresholds: >= 80 high, >= 55 med)
const dom2 = makeDom('https://noeinsolutions-2.local/eir.html');
const seeded = { project: 'Restored', author: 'Test', date: '2026-06-11', answers: {} };
['q1_1','q1_2','q1_3','q3_1','q3_2'].forEach(q => seeded.answers[q] = 3);
['q2_1','q2_2','q3_3'].forEach(q => seeded.answers[q] = 2);
['q2_3','q4_1','q4_2','q4_3'].forEach(q => seeded.answers[q] = 1);
dom2.window.localStorage.setItem('noein.eir.v1', JSON.stringify(seeded));
dom2.window.eval(js);
const score3 = parseInt(dom2.window.document.getElementById('eirScoreNum').textContent, 10);
check(score3 === 69, 'restored score is 69/100 (got ' + score3 + ')');
check(dom2.window.document.getElementById('eirScoreCard').classList.contains('is-med'), 'restored state is medium band');
const projectField = dom2.window.document.getElementById('eir-project');
check(projectField && projectField.value === 'Restored', 'project field restored');
check(!!dom2.window.document.querySelector('input[name="eir_q1_1"][value="3"]').checked, 'q1_1 radio restored to 3');
check(!!dom2.window.document.querySelector('input[name="eir_q2_1"][value="2"]').checked, 'q2_1 radio restored to 2');

// ─── 7. Report generation via jump button ───
console.log('\n[7] Report generation');
const jumpBtn = dom2.window.document.getElementById('eirJumpResults');
check(!!jumpBtn, 'jump button exists');
jumpBtn.dispatchEvent(new dom2.window.Event('click', { bubbles: true }));
const results = dom2.window.document.getElementById('eirResults');
check(!results.hasAttribute('hidden'), 'results panel is no longer hidden');

const gapsHost = dom2.window.document.getElementById('eirReportGaps');
const gapCards = gapsHost.querySelectorAll('.eir-gap-card');
check(gapCards.length === 3, '3 gap cards rendered (got ' + gapCards.length + ')');

// Top-3 lowest-rated: 4 questions tied at value 1 (q2_3, q4_1, q4_2, q4_3). Tie-break by section then question → q2_3, q4_1, q4_2.
const gapsText = gapsHost.textContent;
check(/Roles/.test(gapsText), 'gaps include Roles section (q2_3 rated 1)');
check(/Standards/.test(gapsText), 'gaps include Standards section (q4_1, q4_2 rated 1)');

const sectionsList = dom2.window.document.getElementById('eirReportSectionsList');
check(!!sectionsList && sectionsList.children.length > 0, 'section-by-section breakdown rendered');

// Full breakdown: must include all 12 questions. We assert by counting
// the .eir-breakdown-row children of #eirReportBreakdown.
const breakdown = dom2.window.document.getElementById('eirReportBreakdown');
const breakdownRows = breakdown.querySelectorAll('.eir-breakdown-row');
check(breakdownRows.length === 12, 'full breakdown covers all 12 questions (found ' + breakdownRows.length + ' rows)');

// ─── 8. Reset button ───
console.log('\n[8] Reset');
const dom3 = makeDom('https://noeinsolutions-3.local/eir.html');
dom3.window.confirm = () => true;
dom3.window.eval(js);
ALL_QS.forEach(q => rate(dom3, q, 2));
// 12 * 2 / 36 * 100 = 66.67 → rounds to 67
check(parseInt(dom3.window.document.getElementById('eirScoreNum').textContent, 10) === 67, 'pre-reset score 67 (all rated 2)');
const resetBtn = dom3.window.document.getElementById('eirReset');
resetBtn.dispatchEvent(new dom3.window.Event('click', { bubbles: true }));
const allUnchecked = dom3.window.document.querySelectorAll('input[name^="eir_"]:checked').length;
check(allUnchecked === 0, 'all radios unchecked after reset (got ' + allUnchecked + ')');
// After reset, updateLiveScore() re-persists an empty state. That's
// intentional: the next reload will restore an empty state, which is
// exactly what the user wants. We assert the *content* of the state is
// empty (no rated answers), not that the storage slot is gone.
const afterReset = dom3.window.localStorage.getItem('noein.eir.v1');
check(afterReset !== null, 'localStorage slot exists after reset (re-persisted empty state)');
if (afterReset) {
  const parsed = JSON.parse(afterReset);
  check(parsed.project === '', 'project cleared in stored state');
  check(parsed.author === '', 'author cleared in stored state');
  check(Object.keys(parsed.answers).length === 0, 'stored answers is empty (got ' + Object.keys(parsed.answers).length + ' keys)');
}

// ─── 9. lang-switcher is # (not a broken link) ───
console.log('\n[9] hreflang/lang-switch sanity');
const langSwitch = dom.window.document.querySelector('a.lang-switch');
check(langSwitch.getAttribute('href') === '#', 'lang-switch href is #');

// ─── 10. Export view HTML generation ───
console.log('\n[10] Export view generation');
const dom4 = makeDom('https://noeinsolutions-4.local/eir.html');
let capturedHtml = '';
const fakeWin = {
  document: { open: () => {}, write: (h) => { capturedHtml = h; }, close: () => {} }
};
dom4.window.open = () => fakeWin;
dom4.window.eval(js);
ALL_QS.forEach(q => rate(dom4, q, 2));
const printBtn = dom4.window.document.getElementById('eirPrintBtn');
printBtn.dispatchEvent(new dom4.window.Event('click', { bubbles: true }));
check(capturedHtml.length > 1000, 'export HTML captured (len ' + capturedHtml.length + ')');
check(capturedHtml.indexOf('ISO 19650 EIR clarity diagnostic') !== -1, 'export has EIR kicker');
check(capturedHtml.indexOf('Your EIR clarity report') !== -1, 'export has report title');
check(capturedHtml.indexOf('eir-gap-card') !== -1, 'export includes gap-card markup');
check(capturedHtml.indexOf('window.print()') !== -1, 'export triggers print on load');
check(capturedHtml.indexOf('Save as PDF') !== -1, 'export note mentions Save as PDF');

// ─── 11. Empty-report handling ───
console.log('\n[11] Empty-report handling');
const dom5 = makeDom('https://noeinsolutions-5.local/eir.html');
dom5.window.eval(js);
const jumpEmpty = dom5.window.document.getElementById('eirJumpResults');
jumpEmpty.dispatchEvent(new dom5.window.Event('click', { bubbles: true }));
const resultsEmpty = dom5.window.document.getElementById('eirResults');
check(resultsEmpty.hasAttribute('hidden'), 'empty click does not reveal results panel');
const emptyBand = dom5.window.document.getElementById('eirScoreBand').textContent;
check(/Rate at least/i.test(emptyBand), 'empty band message shown (got "' + emptyBand + '")');

// ─── 12. HTML link references all resolve ───
console.log('\n[12] HTML link resolution');
const links = [...dom.window.document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
const scripts = [...dom.window.document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
const styles = [...dom.window.document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.getAttribute('href'));
const refs = [...links, ...scripts, ...styles].filter(r => r && !r.startsWith('http') && !r.startsWith('mailto:') && !r.startsWith('#') && !r.startsWith('data:'));
let allFound = true;
refs.forEach((r) => {
  const p = path.join(ROOT, r.replace(/^\//, ''));
  if (!fs.existsSync(p)) { fail('missing referenced file: ' + r); allFound = false; }
});
if (allFound) pass('all local href/src references resolve (' + refs.length + ' checked)');

// ─── 13. Print path: results panel renders correctly when visible ───
console.log('\n[13] Print + in-page render');
const dom6 = makeDom('https://noeinsolutions-6.local/eir.html');
dom6.window.eval(js);
ALL_QS.forEach(q => rate(dom6, q, 3));  // all clear → high band
dom6.window.document.getElementById('eirJumpResults').dispatchEvent(new dom6.window.Event('click', { bubbles: true }));
const reportScore = dom6.window.document.getElementById('eirReportScoreNum').textContent;
check(/100/.test(reportScore), 'report score shows /100 (got "' + reportScore + '")');
const reportBandEl = dom6.window.document.getElementById('eirReportBand');
check(/is-high|band-high/.test(reportBandEl.className), 'report band has is-high/band-high class (got "' + reportBandEl.className + '")');

console.log('\n' + (failures === 0
  ? `SMOKE: all ${passes} checks passed`
  : `SMOKE: ${failures} failure(s), ${passes} passed`));
process.exit(failures === 0 ? 0 : 1);
