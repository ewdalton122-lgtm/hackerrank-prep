// Timed mock exams: start screen, exam runner (timer, question navigator), scoring and review.
// An unfinished exam survives a page refresh (the deadline is stored, not a countdown).
import { getState, update, reviewMiss } from './store.js';
import { esc, inline, fmtMin, feedback, copyText, enableTab, toast } from './ui.js';
import { runPython, pythonReady, runQuery } from './runners.js';
import { compareSql, diagnoseText, explainSqlError } from './diagnose.js';
import { SECTIONS } from './readiness.js';
import { DATASETS } from '../../content/sqldata.js';
import { MOCKS, SPARE } from '../../content/mocks.js';
import { itemsFor, ROLES, findItem } from '../../content/curriculum.js';

const RUN_KEY = 'zta.mockrun';
const LAST_KEY = 'zta.mocklast';
const TYPES = {
  mcq: { label: 'Multiple choice', sec: 'mcq' },
  sql: { label: 'SQL', sec: 'sql' },
  py: { label: 'Coding', sec: 'code' },
  prompt: { label: 'Prompt engineering', sec: 'pe' },
  written: { label: 'Written reply', sec: 'written' },
};
const ORDER = ['mcq', 'sql', 'py', 'prompt', 'written'];
const TOTAL = SECTIONS.reduce((a, s) => a + s.weight, 0); // about 170 points

const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let timer = null;
export function stopMock() { if (timer) { clearInterval(timer); timer = null; } }

export const SPRINT = { id: 'mock-sprint', title: 'Review sprint', minutes: 20, generated: true, blurb: '12 multiple-choice questions drawn from the lessons you have studied, weighted toward the ones you got wrong.' };
export const getMock = (id) => (id === SPRINT.id ? SPRINT : MOCKS.find((m) => m.id === id));
export const allMocks = () => [...MOCKS, SPRINT];

function buildSprint(role, n = 12) {
  const progress = getState().progress || {};
  const pool = [];
  itemsFor(role).filter((i) => i.quiz?.length).forEach((it) => {
    const p = progress[it.id] || {};
    const misses = Object.values(p.missed || {}).reduce((a, b) => a + b, 0);
    const weight = (p.done ? 1 : 0.3) + Math.min(misses, 4) * 1.5;
    it.quiz.forEach((q, qi) => pool.push({ w: weight, q: { id: `${it.id}#${qi}`, type: 'mcq', ref: it.id, q: q.q, options: q.options, answer: q.answer, explain: q.explain } }));
  });
  SPARE.forEach((q) => {
    const p = progress[q.ref] || {};
    const misses = Object.values(p.missed || {}).reduce((a, b) => a + b, 0);
    pool.push({ w: (p.done ? 1 : 0.3) + Math.min(misses, 4) * 1.5, q });
  });
  const out = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((a, x) => a + x.w, 0);
    let r = Math.random() * total, k = 0;
    while (k < pool.length - 1 && (r -= pool[k].w) > 0) k++;
    out.push(pool.splice(k, 1)[0].q);
  }
  return out;
}

const questionsOf = (run) => run.qs || getMock(run.mockId).questions;
const answered = (q, a) => {
  if (a === undefined || a === null) return false;
  if (q.type === 'mcq') return typeof a === 'number';
  if (q.type === 'prompt') return !!(a.tmpl || '').trim();
  return !!String(a).trim();
};
const fmtClock = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;

// ---------------------------------------------------------------- summaries for other pages
export function mockStats(state) {
  const full = (state.mocks || []).filter((m) => m.id !== SPRINT.id).sort((a, b) => a.at - b.at);
  const latest = full[full.length - 1] || null;
  const best = full.reduce((a, m) => (a && a.pct >= m.pct ? a : m), null);
  const lastTwo = full.slice(-2);
  const avg2 = lastTwo.length === 2 ? (lastTwo[0].pct + lastTwo[1].pct) / 2 : null;
  return { full, latest, best, avg2, sprints: (state.mocks || []).filter((m) => m.id === SPRINT.id).length };
}
export function verdict(pct, bar) {
  if (pct >= bar + 10) return ['Comfortably above the bar', 'ok'];
  if (pct >= bar) return ['Above the bar, thin margin', 'ok'];
  if (pct >= bar - 10) return ['Close to the bar', 'warn'];
  return ['Below the bar', 'bad'];
}

// ---------------------------------------------------------------- page entry
export function mountMockPage(host, mockId, role) {
  stopMock();
  const mock = getMock(mockId);
  if (!mock) { host.innerHTML = '<div class="card"><h2>Not found</h2><p><a href="#/mocks">Back to mock exams</a></p></div>'; return; }
  const run = read(RUN_KEY);
  if (run && run.mockId === mockId) return renderRun(host, mock, run, role);
  const last = read(LAST_KEY);
  if (last && last.mockId === mockId && location.hash.endsWith('/result')) return renderResult(host, last, role);
  renderStart(host, mock, role);
}

export function mountMockList(host, role) {
  const s = getState();
  const run = read(RUN_KEY);
  const st = mockStats(s);
  const bar = ROLES[role].bar;
  host.innerHTML = `
    ${run ? `<div class="card"><div class="fb hint"><b class="lead">An exam is in progress.</b><p><a href="#/mock/${run.mockId}">Go back to it</a>. The clock kept running.</p></div></div>` : ''}
    <div class="grid cols-2">
      ${allMocks().map((m) => {
        const tries = (s.mocks || []).filter((x) => x.id === m.id).sort((a, b) => b.at - a.at);
        return `<div class="card"><h2>${esc(m.title)}</h2>
          <p class="muted">${esc(m.blurb)}</p>
          <p class="small">${m.generated ? 'Questions are drawn fresh each time. ' : ''}About ${fmtMin(m.minutes)}.</p>
          ${tries.length ? `<p class="small">Attempts: ${tries.length}. Latest ${Math.round(tries[0].pct)}%${m.generated ? '' : ` &middot; best ${Math.round(Math.max(...tries.map((x) => x.pct)))}%`}.</p>` : '<p class="small muted">Not attempted yet.</p>'}
          <a class="btn primary" href="#/mock/${m.id}">${tries.length ? 'Open' : 'Start'}</a></div>`;
      }).join('')}
    </div>
    <div class="card"><h2>Your history</h2>
      ${st.full.length ? `<table class="res"><thead><tr><th>When</th><th>Exam</th><th>Score</th><th>Result</th></tr></thead><tbody>${[...st.full].reverse().map((m) => `<tr><td>${new Date(m.at).toLocaleDateString()}</td><td>${esc(m.title)}</td><td>${Math.round(m.pct)}%</td><td>${verdict(m.pct, bar)[0]}</td></tr>`).join('')}</tbody></table>
        <p class="small muted" style="margin-top:8px">The pass mark for your role is ${bar}%. The aim is two full mocks in a row at ${bar + 10}% or more.</p>` : '<p class="muted">Your full mock scores will appear here.</p>'}
    </div>`;
}

// ---------------------------------------------------------------- start screen
function renderStart(host, mock, role) {
  const s = getState();
  const bar = ROLES[role].bar;
  const tries = (s.mocks || []).filter((x) => x.id === mock.id).sort((a, b) => b.at - a.at);
  const last = read(LAST_KEY);
  const q = mock.questions || [];
  const mix = ORDER.map((t) => [t, q.filter((x) => x.type === t).length]).filter((x) => x[1]);
  host.innerHTML = `
    <div class="pagehead"><h1>${esc(mock.title)}</h1><p>${esc(mock.blurb)}</p></div>
    <div class="card">
      <h2>Before you start</h2>
      <ul>
        <li>${mock.generated ? '12 multiple-choice questions' : mix.map(([t, n]) => `${n} ${TYPES[t].label.toLowerCase()}`).join(', ')}.</li>
        <li>Treat it like the real thing: one sitting, no notes, no outside help, no looking back at the lessons.</li>
        <li>You can move between questions freely and change answers until you finish. Python and SQL are graded when you finish, against hidden tests.</li>
        ${mix.some(([t]) => t === 'prompt') ? '<li>The prompt question needs an AI assistant in another tab. Paste its replies back in. Only the visible cases can be scored here.</li>' : ''}
        <li>When time is up the exam submits itself.</li>
      </ul>
      <div class="field">Time allowed
        <div class="row" style="gap:16px;margin-top:6px">
          ${[[mock.minutes, `${mock.minutes} minutes (recommended)`], [Math.round(mock.minutes * 0.67), `${Math.round(mock.minutes * 0.67)} minutes (harder)`], [Math.round(mock.minutes * 1.33), `${Math.round(mock.minutes * 1.33)} minutes`], [0, 'No timer']].map(([v, l], i) => `<label class="choice" style="margin:0"><input type="radio" name="lim" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}
        </div>
      </div>
      <button class="btn primary" data-act="begin" style="margin-top:14px">Start the exam</button>
      ${last && last.mockId === mock.id ? ` <a class="btn" href="#/mock/${mock.id}/result">View your last result</a>` : ''}
    </div>
    ${tries.length ? `<div class="card"><h2>Previous attempts</h2><table class="res"><thead><tr><th>When</th><th>Score</th><th>Result</th></tr></thead><tbody>${tries.map((m) => `<tr><td>${new Date(m.at).toLocaleString()}</td><td>${Math.round(m.pct)}%</td><td>${verdict(m.pct, bar)[0]}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
  host.querySelector('[data-act="begin"]').onclick = () => {
    const lim = Number(host.querySelector('input[name=lim]:checked').value);
    const run = { mockId: mock.id, startedAt: Date.now(), limit: lim * 60, answers: {}, cur: 0, role, ...(mock.generated ? { qs: buildSprint(role) } : {}) };
    if (mock.generated && !run.qs.length) { toast('No questions available yet'); return; }
    write(RUN_KEY, run);
    mountMockPage(host, mock.id, role);
  };
}

// ---------------------------------------------------------------- runner
function renderRun(host, mock, run, role) {
  const qs = questionsOf(run);
  const save = () => write(RUN_KEY, run);
  host.innerHTML = `
    <div class="mockbar"><b>${esc(mock.title)}</b><span class="clock" id="clock"></span><span class="muted small" id="prog"></span><button class="btn primary" data-act="finish">Finish and score</button></div>
    <div class="mockgrid"><nav class="qnav" id="qnav"></nav><section class="card qpane" id="qpane"></section></div>`;
  const nav = host.querySelector('#qnav');
  const pane = host.querySelector('#qpane');

  function renderNav() {
    let html = '';
    let lastType = '';
    qs.forEach((q, i) => {
      if (q.type !== lastType) { html += `<div class="qgroup">${TYPES[q.type].label}</div>`; lastType = q.type; }
      html += `<button class="qb ${i === run.cur ? 'cur' : ''} ${answered(q, run.answers[q.id]) ? 'ans' : ''}" data-i="${i}">${i + 1}</button>`;
    });
    nav.innerHTML = html;
    nav.querySelectorAll('.qb').forEach((b) => { b.onclick = () => { run.cur = Number(b.dataset.i); save(); renderNav(); renderQ(); }; });
    host.querySelector('#prog').textContent = `${qs.filter((q) => answered(q, run.answers[q.id])).length} of ${qs.length} answered`;
  }
  const mark = () => { renderNav(); };

  function renderQ() {
    const q = qs[run.cur];
    const head = `<div class="qhead"><span class="badge gray">${TYPES[q.type].label}</span><span class="muted small">Question ${run.cur + 1} of ${qs.length}</span></div>`;
    pane.innerHTML = head + '<div id="qbody"></div>' + `<div class="nextbar" style="margin-top:18px"><button class="btn" data-act="prev" ${run.cur === 0 ? 'disabled' : ''}>&larr; Previous</button><button class="btn" data-act="next" ${run.cur === qs.length - 1 ? 'disabled' : ''}>Next &rarr;</button></div>`;
    const body = pane.querySelector('#qbody');
    ({ mcq: bodyMcq, sql: bodySql, py: bodyPy, prompt: bodyPrompt, written: bodyWritten })[q.type](body, q, run, save, mark);
    pane.querySelector('[data-act="prev"]').onclick = () => { run.cur--; save(); renderNav(); renderQ(); };
    pane.querySelector('[data-act="next"]').onclick = () => { run.cur++; save(); renderNav(); renderQ(); };
    window.scrollTo(0, 0);
  }

  const clock = host.querySelector('#clock');
  let finishing = false;
  const tick = () => {
    const elapsed = Math.floor((Date.now() - run.startedAt) / 1000);
    if (run.limit > 0) {
      const left = run.limit - elapsed;
      clock.textContent = fmtClock(left);
      clock.className = `clock ${left <= 300 ? 'low' : ''}`;
      if (left <= 0 && !finishing) { finishing = true; finish(true); }
    } else clock.textContent = `${fmtClock(elapsed)} elapsed`;
  };
  tick();
  timer = setInterval(tick, 1000);

  host.querySelector('[data-act="finish"]').onclick = () => {
    const open = qs.filter((q) => !answered(q, run.answers[q.id])).length;
    if (!confirm(open ? `${open} question${open > 1 ? 's are' : ' is'} unanswered. Finish and score anyway?` : 'Finish and score the exam?')) return;
    finishing = true; finish(false);
  };

  async function finish(auto) {
    stopMock();
    host.innerHTML = `<div class="card"><h2>${auto ? 'Time is up.' : 'Scoring your exam...'}</h2><p><span class="spinner"></span>Checking your answers. If there is coding, the first run loads Python and can take 10 to 20 seconds.</p></div>`;
    const result = await scoreRun(mock, run, qs, role);
    write(LAST_KEY, result);
    localStorage.removeItem(RUN_KEY);
    // Every missed multiple-choice question goes onto the review list.
    qs.filter((q) => q.type === 'mcq' && (result.perQ[q.id]?.score ?? 1) < 1).forEach((q) => reviewMiss(q.id));
    update((s) => {
      (s.mocks ||= []).push({ id: mock.id, title: mock.title, at: result.at, secs: result.secs, pct: result.pct, sections: result.sectionPct, role });
      const p = (s.progress[mock.id] ||= { parts: {}, missed: {}, tries: 0 });
      p.parts.manual = true; p.done = true; p.at = p.at || Date.now();
    }, { silent: true });
    location.hash = `#/mock/${mock.id}/result`;
  }

  renderNav();
  renderQ();
}

// ---------------------------------------------------------------- question bodies
function bodyMcq(el, q, run, save, mark) {
  el.innerHTML = `<p class="qtext">${inline(q.q).replace(/\n/g, '<br>')}</p>
    <div class="opts">${q.options.map((o, i) => `<label class="choice"><input type="radio" name="o" value="${i}" ${run.answers[q.id] === i ? 'checked' : ''}><span>${inline(o)}</span></label>`).join('')}</div>`;
  el.querySelectorAll('input[name=o]').forEach((r) => r.addEventListener('change', () => { run.answers[q.id] = Number(r.value); save(); mark(); }));
}

const tableHtml = (r) => !r.columns.length ? '' : `<div class="scroll"><table class="res"><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, 12).map((row) => `<tr>${row.map((v) => `<td>${v === null ? '<i>NULL</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${r.values.length > 12 ? `<p class="small muted">Showing 12 of ${r.values.length} rows.</p>` : ''}`;

function bodySql(el, q, run, save, mark) {
  el.innerHTML = `<h3 style="margin-top:0">${esc(q.title)}</h3><p>${inline(q.prompt)}</p>
    <details class="schema"><summary>Tables</summary><ul>${DATASETS[q.data].doc.map((t) => `<li><code>${t.table}</code> (${esc(t.cols)}): ${esc(t.note)}</li>`).join('')}</ul></details>
    <textarea class="editor" spellcheck="false" autocapitalize="off" aria-label="SQL query">${esc(run.answers[q.id] ?? q.starter)}</textarea>
    <div class="row" style="margin:12px 0"><button class="btn" data-act="run">Run query</button><span class="muted small st"></span></div>
    <div class="out"></div>`;
  const ta = el.querySelector('.editor');
  enableTab(ta);
  const out = el.querySelector('.out');
  ta.addEventListener('input', () => { run.answers[q.id] = ta.value; save(); mark(); });
  el.querySelector('[data-act="run"]').onclick = async (e) => {
    run.answers[q.id] = ta.value; save(); mark();
    e.currentTarget.disabled = true; out.innerHTML = '';
    try { out.innerHTML = `<h4>Your result</h4>${tableHtml(await runQuery(ta.value, q.data)) || '<p class="muted">No rows returned.</p>'}`; }
    catch (err) { out.innerHTML = feedback('bad', explainSqlError(err.message || err).lead, [], `<p class="small muted">Database message: <code>${esc(err.message || err)}</code></p>`); }
    e.currentTarget.disabled = false;
  };
}

function bodyPy(el, q, run, save, mark) {
  const sample = q.tests.filter((t) => !t.hidden);
  const shown = sample.slice(0, 1)[0];
  el.innerHTML = `<h3 style="margin-top:0">${esc(q.title)}</h3><p>${inline(q.prompt)}</p>
    <div class="io"><div><span class="lbl">Sample input</span><pre class="code"><code>${esc(shown.input.length > 200 ? shown.input.slice(0, 200) + '...' : shown.input.replace(/\n$/, ''))}</code></pre></div>
    <div><span class="lbl">Sample output</span><pre class="code"><code>${esc(shown.output)}</code></pre></div></div>
    <textarea class="editor" spellcheck="false" autocapitalize="off" aria-label="Python code">${esc(run.answers[q.id] ?? q.starter)}</textarea>
    <div class="row" style="margin:12px 0"><button class="btn" data-act="run">Run the sample tests</button><span class="muted small st"></span></div>
    <ul class="tests"></ul><p class="small muted">Sample tests show here. More tests, including ones for unusual input, run when you finish.</p>`;
  const ta = el.querySelector('.editor');
  enableTab(ta);
  const list = el.querySelector('.tests');
  const st = el.querySelector('.st');
  ta.addEventListener('input', () => { run.answers[q.id] = ta.value; save(); mark(); });
  el.querySelector('[data-act="run"]').onclick = async (e) => {
    run.answers[q.id] = ta.value; save(); mark();
    const btn = e.currentTarget; btn.disabled = true; list.innerHTML = '';
    st.innerHTML = '<span class="spinner"></span>Running...';
    try {
      await pythonReady();
      const res = await runPython(ta.value, sample.map((t) => ({ input: t.input, expected: t.output })), 6000, 'io');
      st.textContent = '';
      if (res.timeout) list.innerHTML = '<li class="fail"><span>&#10007;</span><div>Your code ran for more than 6 seconds and was stopped.</div></li>';
      else if (res.error) list.innerHTML = `<li class="fail"><span>&#10007;</span><div>${esc(res.error.type)}: ${esc(res.error.msg)}</div></li>`;
      else list.innerHTML = res.tests.map((t, i) => `<li class="${t.ok ? 'pass' : 'fail'}"><span>${t.ok ? '&#10003;' : '&#10007;'}</span><div>Sample test ${i + 1} ${t.ok ? 'passed' : t.err ? `stopped with ${esc(t.err.type)}` : 'did not match'}</div></li>`).join('');
    } catch { st.textContent = ''; list.innerHTML = '<li class="fail"><span>&#10007;</span><div>Python could not start. Check your internet connection.</div></li>'; }
    btn.disabled = false;
  };
}

function bodyPrompt(el, q, run, save, mark) {
  const a = (run.answers[q.id] ||= { tmpl: '', replies: {} });
  el.innerHTML = `<h3 style="margin-top:0">${esc(q.title)}</h3>
    <div class="fb info"><b class="lead">Task you are prompting for</b>${inline(q.task)}</div>
    <label class="field">Your prompt <span class="hint">Put <code>{input}</code> where the data goes.</span>
      <textarea class="editor" style="min-height:150px;white-space:pre-wrap" spellcheck="true" data-role="tmpl">${esc(a.tmpl)}</textarea></label>
    ${q.cases.map((c, i) => `<div class="case" data-ci="${i}"><b>Case ${i + 1}</b>
      <pre class="code">${esc(c.input)}</pre>
      <div class="row" style="margin-bottom:8px"><button class="btn" data-act="copy">Copy my prompt with this input</button></div>
      <textarea rows="2" data-role="out" style="font-family:var(--mono)" placeholder="Paste the assistant's reply here">${esc(a.replies[i] || '')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn" data-act="check">Check this case</button></div><div class="cfb"></div></div>`).join('')}`;
  const tmpl = el.querySelector('[data-role="tmpl"]');
  tmpl.addEventListener('input', () => { a.tmpl = tmpl.value; save(); mark(); });
  el.querySelectorAll('.case').forEach((box) => {
    const i = Number(box.dataset.ci);
    const out = box.querySelector('[data-role="out"]');
    out.addEventListener('input', () => { a.replies[i] = out.value; save(); });
    box.querySelector('[data-act="copy"]').onclick = async () => {
      const t = tmpl.value.trim();
      if (!t) { box.querySelector('.cfb').innerHTML = feedback('hint', 'Write your prompt first.'); return; }
      await copyText(t.includes('{input}') ? t.split('{input}').join(q.cases[i].input) : `${t}\n\n${q.cases[i].input}`);
      box.querySelector('.cfb').innerHTML = feedback('info', 'Copied. Paste it into your assistant, then paste its reply above.');
    };
    box.querySelector('[data-act="check"]').onclick = () => {
      const d = diagnoseText((out.value || '').replace(/\r/g, ''), q.cases[i].expected);
      box.querySelector('.cfb').innerHTML = d.ok ? feedback('ok', 'Exact match.') : feedback('bad', d.lead, d.steps.slice(0, 2));
    };
  });
}

function bodyWritten(el, q, run, save, mark) {
  el.innerHTML = `<h3 style="margin-top:0">${esc(q.title)}</h3><p>${inline(q.prompt)}</p>
    <textarea rows="10" placeholder="Type your reply here...">${esc(run.answers[q.id] || '')}</textarea><p class="small muted wc"></p>`;
  const ta = el.querySelector('textarea');
  const wc = el.querySelector('.wc');
  const upd = () => { wc.textContent = `${(ta.value.trim().match(/\S+/g) || []).length} words (aim for about 100 to 150)`; };
  upd();
  ta.addEventListener('input', () => { run.answers[q.id] = ta.value; save(); mark(); upd(); });
}

// ---------------------------------------------------------------- scoring
async function scoreRun(mock, run, qs, role) {
  const perQ = {};
  let pythonOk = null;
  for (const q of qs) {
    const a = run.answers[q.id];
    let score = 0; let detail = {};
    try {
      if (q.type === 'mcq') score = a === q.answer ? 1 : 0;
      else if (q.type === 'sql') {
        if (!String(a || '').trim()) detail = { empty: true };
        else if (!/^(select|with)\b/i.test(String(a).replace(/--.*$/gm, '').trim())) detail = { lead: 'The query must start with SELECT.' };
        else {
          try {
            const got = await runQuery(a, q.data);
            const exp = await runQuery(q.solution, q.data);
            const cmp = compareSql(got, exp, { ordered: q.ordered });
            score = cmp.ok ? 1 : 0;
            detail = { lead: cmp.ok ? 'Correct.' : cmp.lead, steps: cmp.ok ? [] : cmp.steps, got: { columns: got.columns, values: got.values.slice(0, 12) } };
          } catch (err) { detail = { lead: explainSqlError(err.message || err).lead, err: String(err.message || err) }; }
        }
      } else if (q.type === 'py') {
        if (!String(a || '').trim() || String(a).trim() === q.starter.trim()) detail = { empty: true };
        else {
          if (pythonOk === null) { try { await pythonReady(); pythonOk = true; } catch { pythonOk = false; } }
          if (!pythonOk) detail = { lead: 'Python could not start, so this was not scored.' };
          else {
            const res = await runPython(a, q.tests.map((t) => ({ input: t.input, expected: t.output })), 6000, 'io');
            if (res.timeout) detail = { lead: 'Your code ran for more than 6 seconds.', timeout: true };
            else if (res.error) detail = { lead: `${res.error.type}: ${res.error.msg}`, error: true };
            else {
              // Candidates report that the real coding question is effectively all or nothing, so it is scored that way here.
              score = res.tests.every((t) => t.ok) ? 1 : 0;
              detail = { passed: res.tests.filter((t) => t.ok).length, total: q.tests.length, tests: res.tests.map((t, i) => ({ ok: t.ok, hidden: !!q.tests[i].hidden, edge: q.tests[i].edge, err: t.err?.type })) };
            }
          }
        }
      } else if (q.type === 'prompt') {
        const replies = a?.replies || {};
        const oks = q.cases.map((c, i) => !!(replies[i] || '').trim() && diagnoseText(replies[i].replace(/\r/g, ''), c.expected).ok);
        score = oks.filter(Boolean).length / q.cases.length;
        detail = { oks, tmpl: a?.tmpl || '' };
      } else if (q.type === 'written') {
        const text = String(a || '');
        const words = (text.trim().match(/\S+/g) || []).length;
        const hits = q.rubric.filter((r) => r.test.test(text)).map((r) => r.id);
        score = words === 0 ? 0 : (hits.length / q.rubric.length) * (words >= q.minWords ? 1 : 0.5);
        detail = { hits, words, short: words < q.minWords };
      }
    } catch (err) { detail = { lead: 'This question could not be scored.', err: String(err.message || err) }; }
    perQ[q.id] = { score, detail };
  }
  const wById = Object.fromEntries(SECTIONS.map((s) => [s.id, s.weight]));
  const sectionPct = {}; const sectionN = {};
  ORDER.forEach((t) => {
    const group = qs.filter((q) => q.type === t);
    if (!group.length) return;
    const sec = TYPES[t].sec;
    sectionPct[sec] = (group.reduce((a, q) => a + perQ[q.id].score, 0) / group.length) * 100;
    sectionN[sec] = group.length;
  });
  const secs = Object.keys(sectionPct);
  const wsum = secs.reduce((a, k) => a + (wById[k] || 1), 0);
  const pct = secs.reduce((a, k) => a + sectionPct[k] * (wById[k] || 1), 0) / wsum;
  return {
    mockId: mock.id, title: mock.title, at: Date.now(), secs: Math.floor((Date.now() - run.startedAt) / 1000), limit: run.limit,
    pct, sectionPct, sectionN, perQ, qs: run.qs ? qs : null, answers: run.answers, role,
  };
}

// ---------------------------------------------------------------- results
function renderResult(host, res, role) {
  const mock = getMock(res.mockId) || { title: res.title };
  const qs = res.qs || getMock(res.mockId).questions;
  const bar = ROLES[role]?.bar ?? 60;
  const full = res.mockId !== SPRINT.id;
  const [vt, vk] = full ? verdict(res.pct, bar) : ['Practice only, no pass mark', 'gray'];
  const secName = Object.fromEntries(SECTIONS.map((s) => [s.id, s.name]));
  const secW = Object.fromEntries(SECTIONS.map((s) => [s.id, s.weight]));
  const lost = [];
  qs.forEach((q) => { if (res.perQ[q.id].score < 1 && q.ref) lost.push(q.ref); });
  const refs = [...new Set(lost)];
  const items = itemsFor(role);
  const title = (id) => items.find((i) => i.id === id)?.title;
  const weakest = Object.entries(res.sectionPct).sort((a, b) => a[1] - b[1])[0];

  host.innerHTML = `
    <div class="pagehead"><h1>${esc(mock.title)}: result</h1><p>Finished in ${fmtClock(res.secs)}${res.limit ? ` of ${fmtClock(res.limit)}` : ''}.</p></div>
    <div class="card">
      <div class="stagehead"><h2>Score: ${Math.round(res.pct)}%</h2><span class="badge ${vk}">${vt}</span></div>
      ${full ? `<p><b>About ${Math.round(res.pct * TOTAL / 100)} of ${TOTAL} points.</b> You need about ${Math.ceil(bar * TOTAL / 100)} for ${esc(ROLES[role]?.name || '')}.</p>` : ''}
      ${full ? `<div class="meter"><i style="width:${Math.round(res.pct)}%"></i><b style="left:${bar}%" title="Pass mark ${bar}%"></b></div>
      <p class="small muted" style="margin-top:8px">The marker is the ${bar}% pass mark for ${esc(ROLES[role]?.name || '')}. Practice scores run a little lower than real-exam scores under pressure, which is why the target is ${bar + 10}% or more, twice in a row.</p>` : ''}
      <p class="small muted">This is a practice score from questions written for this site. It is an honest signal, not a prediction. Each skill area is worth the points candidates report for the real exam, and coding is scored all or nothing, as reported.</p>
    </div>
    <div class="card"><h2>By skill area</h2><div class="secs">${Object.entries(res.sectionPct).map(([k, v]) => `<div class="sec"><div class="sec-head"><b>${esc(secName[k] || k)}</b><span>${full ? `${Math.round(v * secW[k] / 100)} of ${secW[k]} points` : `${Math.round(v)}%`}</span></div><div class="bar"><i style="width:${Math.round(v)}%"></i></div><p class="small muted">${res.sectionN[k]} question${res.sectionN[k] > 1 ? 's' : ''}</p></div>`).join('')}</div>
      ${weakest && weakest[1] < 100 ? `<p style="margin-top:12px"><b>Weakest area:</b> ${esc(secName[weakest[0]] || weakest[0])}.</p>` : ''}</div>
    ${refs.length ? `<div class="card"><h2>Study these next</h2><p class="muted">Each lesson below covers a question you missed or only partly got.</p><ul class="items">${refs.map((id) => title(id) ? `<li><a class="item" href="#/item/${id}"><span class="t">${esc(title(id))}<small>Lesson in this site</small></span><span class="m">Open</span></a>${(findItem(id)?.links || []).slice(0, 2).map((l) => `<div class="small extl">Also: <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></div>`).join('')}</li>` : '').join('')}</ul></div>` : '<div class="card"><h2>Nothing to review</h2><p>You got every question right.</p></div>'}
    <div class="card"><h2>Review every question</h2>${qs.map((q, i) => reviewQ(q, i, res)).join('')}</div>
    <div class="row"><a class="btn primary" href="#/mocks">Back to mock exams</a><a class="btn" href="#/readiness">See readiness</a></div>`;
}

function reviewQ(q, i, res) {
  const r = res.perQ[q.id];
  const a = res.answers[q.id];
  const mark = r.score >= 1 ? '<span class="badge ok">Correct</span>' : r.score > 0 ? `<span class="badge warn">${Math.round(r.score * 100)}%</span>` : '<span class="badge bad">Missed</span>';
  let body = '';
  if (q.type === 'mcq') {
    body = `<div class="opts">${q.options.map((o, k) => `<div class="ropt ${k === q.answer ? 'right' : ''} ${k === a && k !== q.answer ? 'wrong' : ''}">${k === q.answer ? '&#10003; ' : k === a ? '&#10007; ' : ''}${inline(o)}</div>`).join('')}</div>
      ${typeof a === 'number' && a !== q.answer ? `<p class="small"><b>Why not that one:</b> ${inline(q.explain[a])}</p>` : typeof a !== 'number' ? '<p class="small muted">Not answered.</p>' : ''}
      <p class="small">${inline(q.explain[q.answer])}</p>`;
  } else if (q.type === 'sql') {
    body = `<p>${inline(q.prompt)}</p><p class="small"><b>Your query</b></p><pre class="code"><code>${esc(a || '(no answer)')}</code></pre>
      ${r.detail.lead && r.score < 1 ? feedback('bad', r.detail.lead, r.detail.steps || []) : ''}
      <p class="small"><b>One correct way</b></p><pre class="code"><code>${esc(q.solution)}</code></pre>`;
  } else if (q.type === 'py') {
    const tests = r.detail.tests ? `<ul class="tests">${r.detail.tests.map((t, k) => `<li class="${t.ok ? 'pass' : 'fail'}"><span>${t.ok ? '&#10003;' : '&#10007;'}</span><div>${t.hidden ? 'Hidden' : 'Visible'} test ${k + 1}${t.ok ? ' passed' : t.err ? ` stopped with ${esc(t.err)}` : ' did not match'}${!t.ok && t.edge ? `. ${esc(t.edge)}` : ''}</div></li>`).join('')}</ul>` : '';
    body = `<p>${inline(q.prompt)}</p><p class="small"><b>Your code</b></p><pre class="code"><code>${esc(a || '(no answer)')}</code></pre>
      ${r.detail.empty ? '<p class="small muted">No code was written.</p>' : ''}${r.detail.total ? `<p class="small muted">${r.detail.passed} of ${r.detail.total} tests passed. Coding is scored all or nothing here, as candidates report for the real exam.</p>` : ''}${r.detail.lead ? feedback('bad', r.detail.lead) : ''}${tests}
      <p class="small"><b>One correct way</b></p><pre class="code"><code>${esc(q.solution)}</code></pre>`;
  } else if (q.type === 'prompt') {
    body = `<p>${inline(q.task)}</p><p class="small"><b>Your prompt</b></p><pre class="code" style="white-space:pre-wrap"><code>${esc(r.detail.tmpl || '(no prompt)')}</code></pre>
      <ul class="tests">${q.cases.map((c, k) => `<li class="${r.detail.oks?.[k] ? 'pass' : 'fail'}"><span>${r.detail.oks?.[k] ? '&#10003;' : '&#10007;'}</span><div>Case ${k + 1}: ${r.detail.oks?.[k] ? 'exact match' : `not matched. Expected <code>${esc(c.expected.replace(/\n/g, ' / '))}</code>`}</div></li>`).join('')}</ul>
      <p class="small muted">Hidden cases cannot be run here, so only the visible cases count. Use the self-check on the drill pages to tighten the prompt.</p>`;
  } else if (q.type === 'written') {
    body = `<p>${inline(q.prompt)}</p><p class="small"><b>Your reply</b> (${r.detail.words} words)</p><pre class="code" style="white-space:pre-wrap"><code>${esc(a || '(no answer)')}</code></pre>
      <div class="rubric">${q.rubric.map((x) => `<div class="rl"><span class="badge ${r.detail.hits?.includes(x.id) ? 'ok' : 'gray'}">${r.detail.hits?.includes(x.id) ? 'looks present' : 'not detected'}</span> ${inline(x.label)}</div>`).join('')}</div>
      <p class="small muted">The site spots keywords, so judge your own reply too. ${r.detail.short ? 'Your reply was shorter than the target, which reduced the score.' : ''}</p>
      <details class="schema"><summary>A model reply</summary><pre class="code" style="white-space:pre-wrap">${esc(q.model)}</pre></details>`;
  }
  return `<details class="rq" ${r.score < 1 ? 'open' : ''}><summary><b>${i + 1}. ${esc(q.title || (q.q || '').split('\n')[0].slice(0, 80))}</b> ${mark}</summary>${body}</details>`;
}
