// Interactive parts of a lesson: quiz, Python exercise, SQL exercise, prompt drill, written reply.
import { getState, update, noteMiss } from './store.js';
import { esc, inline, feedback, copyText, enableTab, renderBlocks } from './ui.js';
import { runPython, pythonReady, runQuery } from './runners.js';
import { explainPyError, diagnosePyTest, diagnoseIo, explainSqlError, compareSql, diagnoseText, lintPrompt } from './diagnose.js';
import { DATASETS } from '../../content/sqldata.js';

const getNote = (k) => getState().notes[k] ?? '';
const setNote = (k, v) => update((s) => { s.notes[k] = v; }, { silent: true });
const letters = 'ABCDEFGH';

// ---------------------------------------------------------------- Quiz
export function mountQuiz(host, item, onComplete) {
  const prog = () => getState().progress[item.id];
  const solved = () => prog()?.q || {};
  host.innerHTML = item.quiz.map((q, qi) => `
    <div class="q" data-qi="${qi}">
      <div class="qt">${qi + 1}. ${inline(q.q)}</div>
      ${q.options.map((o, oi) => `<button class="opt" data-oi="${oi}"><b>${letters[oi]}.</b> ${inline(o)}</button>`).join('')}
      <div class="qfb"></div>
    </div>`).join('');

  const lockRight = (qEl, q) => {
    qEl.querySelectorAll('.opt').forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.oi) === q.answer) b.classList.add('right');
    });
    qEl.querySelector('.qfb').innerHTML = feedback('ok', 'Correct.', [q.explain?.[q.answer] || q.why].filter(Boolean));
  };

  item.quiz.forEach((q, qi) => { if (solved()[qi]) lockRight(host.querySelector(`[data-qi="${qi}"]`), q); });

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('.opt');
    if (!btn || btn.disabled) return;
    const qEl = btn.closest('.q');
    const qi = Number(qEl.dataset.qi);
    const oi = Number(btn.dataset.oi);
    const q = item.quiz[qi];
    if (oi === q.answer) {
      lockRight(qEl, q);
      update((s) => {
        const p = (s.progress[item.id] ||= { parts: {}, missed: {}, tries: 0 });
        (p.q ||= {})[qi] = true;
      }, { silent: true });
      if (item.quiz.every((_, i) => solved()[i])) onComplete(true);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      noteMiss(item.id, `q${qi}`);
      const why = q.explain?.[oi] || 'Not quite. Re-read the lesson section above and try another option.';
      qEl.querySelector('.qfb').innerHTML = feedback('bad', 'Not quite.', [why, 'Pick another option. Reading why a wrong answer is wrong is how this sticks.']);
    }
  });
}

// ---------------------------------------------------------------- shared exercise chrome
function ioSample(ex) {
  const t = ex.tests.find((x) => !x.hidden) || ex.tests[0];
  return `<div class="io"><div><b>Sample input</b><pre class="code">${esc(String(t.input).replace(/\n$/, '') || '(empty)')}</pre></div><div><b>Sample output</b><pre class="code">${esc(String(t.output).replace(/\n$/, '') || '(empty)')}</pre></div></div>
    <p class="small muted">Your program reads from <code>input()</code> and prints the answer with <code>print()</code>, just like on HackerRank.</p>`;
}
function exerciseShell(ex, item, extraTop = '') {
  return `
    <p>${inline(ex.prompt || ex.task)}</p>
    ${extraTop}`;
}

function hintUi(host, ex, state) {
  const box = host.querySelector('.hintbox');
  const btn = host.querySelector('[data-act="hint"]');
  const show = () => {
    if (state.hintIdx === 0) { box.innerHTML = ''; return; }
    box.innerHTML = ex.hints.slice(0, state.hintIdx).map((h, i) => `<div class="fb hint"><b class="lead">Hint ${i + 1}</b>${inline(h)}</div>`).join('');
  };
  btn?.addEventListener('click', () => {
    if (state.hintIdx < ex.hints.length) state.hintIdx++;
    btn.textContent = state.hintIdx >= ex.hints.length ? 'No more hints' : `Hint (${state.hintIdx}/${ex.hints.length})`;
    if (state.hintIdx >= ex.hints.length) btn.disabled = true;
    show();
  });
  return { show };
}

// ---------------------------------------------------------------- Python
export function mountPython(host, item, onPass) {
  const ex = item.exercise;
  const key = `code:${item.id}`;
  const st = { fails: 0, hintIdx: 0 };
  host.innerHTML = `
    ${exerciseShell(ex, item, ex.io ? ioSample(ex) : '')}
    <textarea class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code">${esc(getNote(key) || ex.starter)}</textarea>
    <div class="row" style="margin:12px 0">
      <button class="btn primary" data-act="run">Run and check</button>
      <button class="btn" data-act="hint">Hint (0/${ex.hints.length})</button>
      <button class="btn ghost" data-act="reset">Reset</button>
      <button class="btn ghost hidden" data-act="solution">Show a solution</button>
      <span class="muted small status"></span>
    </div>
    <div class="hintbox"></div>
    <div class="fbbox"></div>
    <ul class="tests"></ul>
    <div class="solbox"></div>`;
  const ta = host.querySelector('.editor');
  enableTab(ta);
  ta.addEventListener('input', () => setNote(key, ta.value));
  const status = host.querySelector('.status');
  const fbbox = host.querySelector('.fbbox');
  const list = host.querySelector('.tests');
  const hints = hintUi(host, ex, st);

  host.querySelector('[data-act="reset"]').onclick = () => { ta.value = ex.starter; setNote(key, ta.value); };
  host.querySelector('[data-act="solution"]').onclick = () => {
    host.querySelector('.solbox').innerHTML = `<div class="fb info"><b class="lead">One way to do it</b>Read it, close it, then type your own version from memory.</div><pre class="code"><code>${esc(ex.solution)}</code></pre>`;
  };

  host.querySelector('[data-act="run"]').onclick = async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    fbbox.innerHTML = ''; list.innerHTML = '';
    status.innerHTML = '<span class="spinner"></span>Running... (the first run loads Python and can take 10 to 20 seconds)';
    try {
      await pythonReady();
      const res = ex.io
        ? await runPython(ta.value, ex.tests.map((t) => ({ input: t.input, expected: t.output })), 6000, 'io')
        : await runPython(ta.value, ex.tests.map((t) => ({ expr: t.expr, expected: t.expected })));
      status.textContent = '';
      renderPythonResult(res);
    } catch (err) {
      status.textContent = '';
      fbbox.innerHTML = feedback('bad', 'Python could not start in this browser.', ['Check your internet connection (it loads from a CDN) and try again.']);
    }
    btn.disabled = false;
  };

  function fail() {
    st.fails++;
    noteMiss(item.id, 'ex');
    if (st.fails >= 2 && st.hintIdx < ex.hints.length) {
      st.hintIdx++;
      const hb = host.querySelector('[data-act="hint"]');
      hb.textContent = st.hintIdx >= ex.hints.length ? 'No more hints' : `Hint (${st.hintIdx}/${ex.hints.length})`;
      if (st.hintIdx >= ex.hints.length) hb.disabled = true;
      hints.show();
    }
    if (st.fails >= 3) host.querySelector('[data-act="solution"]').classList.remove('hidden');
  }

  function renderIoResult(res) {
    const clip = (s, n = 90) => { const t = String(s).replace(/\n$/, '').replace(/\n/g, ' / '); return t.length > n ? t.slice(0, n) + '...' : t; };
    list.innerHTML = res.tests.map((t, i) => {
      const spec = ex.tests[i];
      const label = spec.hidden ? `Hidden test ${i + 1}` : `Test ${i + 1}: input <code>${esc(clip(t.input) || '(empty)')}</code>`;
      if (t.ok) return `<li class="pass"><span>&#10003;</span><div>${label}${spec.hidden ? '' : ' printed the expected output'}</div></li>`;
      const detail = t.err ? `stopped with ${esc(t.err.type)}`
        : spec.hidden ? 'did not match. ' + esc(spec.edge || 'Think about edge cases.')
          : `expected <code>${esc(clip(t.expected))}</code> but got <code>${esc(clip(t.got) || '(nothing)')}</code>`;
      return `<li class="fail"><span>&#10007;</span><div>${label} ${detail}</div></li>`;
    }).join('');
    const firstFail = res.tests.findIndex((t) => !t.ok);
    if (firstFail === -1) {
      fbbox.innerHTML = feedback('ok', 'All tests passed. Nicely done.', ['Before moving on, ask yourself: what input would break this? Empty? One item? A very large number?']);
      onPass(true);
      return;
    }
    const t = res.tests[firstFail];
    const d = t.err ? explainPyError({ type: t.err.type, msg: t.err.msg, line: t.err.line }, '') : diagnoseIo(t, { hint: ex.tests[firstFail].hidden ? ex.tests[firstFail].edge : '' });
    fbbox.innerHTML = feedback('bad', d.lead, d.steps);
    fail();
  }

  function renderPythonResult(res) {
    if (res.timeout) {
      fbbox.innerHTML = feedback('bad', 'Your code ran for more than 6 seconds and was stopped.', ['This is usually an endless loop. For a `while` loop, check that something inside changes the condition.', 'For a `for` loop over a huge range, look for a simpler approach.']);
      return fail();
    }
    if (res.error) {
      const d = explainPyError(res.error, ex.fn);
      fbbox.innerHTML = feedback('bad', d.lead, d.steps);
      return fail();
    }
    if (ex.io) return renderIoResult(res);
    const printedNote = res.stdout?.trim() ? `<p class="small muted">Your code also printed: <code>${esc(res.stdout.trim().slice(0, 200))}</code></p>` : '';
    list.innerHTML = res.tests.map((t, i) => {
      const spec = ex.tests[i];
      const hidden = spec.hidden;
      const label = hidden ? `Hidden test ${i + 1}` : `Test ${i + 1}: <code>${esc(t.expr)}</code>`;
      if (t.ok) return `<li class="pass"><span>&#10003;</span><div>${label}${hidden ? '' : ` returned <code>${esc(t.got)}</code>`}</div></li>`;
      const detail = t.err ? `raised ${esc(t.err.type)}`
        : hidden ? 'did not match. ' + esc(spec.edge || 'Think about edge cases.')
          : `expected <code>${esc(t.expected)}</code> but got <code>${esc(t.got)}</code>`;
      return `<li class="fail"><span>&#10007;</span><div>${label} ${detail}</div></li>`;
    }).join('');
    const firstFail = res.tests.findIndex((t) => !t.ok);
    if (firstFail === -1) {
      fbbox.innerHTML = feedback('ok', 'All tests passed. Nicely done.', ['Before moving on, ask yourself: what would break this function? An empty list? A zero?']) + printedNote;
      onPass(true);
      return;
    }
    const t = res.tests[firstFail];
    const d = t.err ? explainPyError({ type: t.err.type, msg: t.err.msg }, ex.fn) : diagnosePyTest(t, { hint: ex.tests[firstFail].hidden ? ex.tests[firstFail].edge : '' });
    fbbox.innerHTML = feedback('bad', d.lead, d.steps) + printedNote;
    fail();
  }
}

// ---------------------------------------------------------------- SQL
export function mountSql(host, item, onPass) {
  const ex = item.exercise;
  const key = `code:${item.id}`;
  const st = { fails: 0, hintIdx: 0 };
  host.innerHTML = `
    ${exerciseShell(ex, item)}
    <details class="schema"><summary>Tables in this practice set</summary>
      <ul>${DATASETS[ex.data || 'sales'].doc.map((t) => `<li><code>${t.table}</code> (${esc(t.cols)}): ${esc(t.note)}</li>`).join('')}</ul>
    </details>
    <textarea class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="SQL query">${esc(getNote(key) || ex.starter)}</textarea>
    <div class="row" style="margin:12px 0">
      <button class="btn primary" data-act="run">Run and check</button>
      <button class="btn" data-act="hint">Hint (0/${ex.hints.length})</button>
      <button class="btn ghost" data-act="reset">Reset</button>
      <button class="btn ghost hidden" data-act="solution">Show a solution</button>
      <span class="muted small status"></span>
    </div>
    <div class="hintbox"></div>
    <div class="fbbox"></div>
    <div class="resbox"></div>
    <div class="solbox"></div>`;
  const ta = host.querySelector('.editor');
  enableTab(ta);
  ta.addEventListener('input', () => setNote(key, ta.value));
  const status = host.querySelector('.status');
  const fbbox = host.querySelector('.fbbox');
  const resbox = host.querySelector('.resbox');
  const hints = hintUi(host, ex, st);

  host.querySelector('[data-act="reset"]').onclick = () => { ta.value = ex.starter; setNote(key, ta.value); };
  host.querySelector('[data-act="solution"]').onclick = () => {
    host.querySelector('.solbox').innerHTML = `<div class="fb info"><b class="lead">One way to do it</b>Read it, close it, then write your own from memory.</div><pre class="code"><code>${esc(ex.solution)}</code></pre>`;
  };

  const table = (r) => !r.columns.length ? '' : `<div class="scroll"><table class="res"><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, 20).map((row) => `<tr>${row.map((v) => `<td>${v === null ? '<i>NULL</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${r.values.length > 20 ? `<p class="small muted">Showing 20 of ${r.values.length} rows.</p>` : ''}`;

  function fail() {
    st.fails++;
    noteMiss(item.id, 'ex');
    if (st.fails >= 2 && st.hintIdx < ex.hints.length) {
      st.hintIdx++;
      const hb = host.querySelector('[data-act="hint"]');
      hb.textContent = st.hintIdx >= ex.hints.length ? 'No more hints' : `Hint (${st.hintIdx}/${ex.hints.length})`;
      if (st.hintIdx >= ex.hints.length) hb.disabled = true;
      hints.show();
    }
    if (st.fails >= 3) host.querySelector('[data-act="solution"]').classList.remove('hidden');
  }

  host.querySelector('[data-act="run"]').onclick = async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    fbbox.innerHTML = ''; resbox.innerHTML = '';
    status.innerHTML = '<span class="spinner"></span>Running...';
    const sql = ta.value.replace(/--.*$/gm, '').trim();
    try {
      if (!/^(select|with)\b/i.test(sql)) {
        fbbox.innerHTML = feedback('bad', 'A practice query must start with SELECT.', ['Read the task, then write a single `SELECT ...` query.']);
        fail();
      } else {
        let got;
        try { got = await runQuery(ta.value, ex.data); }
        catch (err) {
          const d = explainSqlError(err.message || err);
          fbbox.innerHTML = feedback('bad', d.lead, d.steps, `<p class="small muted">Database message: <code>${esc(err.message || err)}</code></p>`);
          fail();
          got = null;
        }
        if (got) {
          resbox.innerHTML = `<h3>Your result</h3>${table(got)}`;
          const expected = await runQuery(ex.solution, ex.data);
          const cmp = compareSql(got, expected, { ordered: ex.ordered });
          if (cmp.ok) {
            fbbox.innerHTML = feedback('ok', 'Correct. Your result matches the expected answer.', ['Tip: write the same query again tomorrow without looking. Recall is what sticks.']);
            onPass(true);
          } else {
            fbbox.innerHTML = feedback('bad', cmp.lead, cmp.steps);
            fail();
          }
        }
      }
    } catch (err) {
      fbbox.innerHTML = feedback('bad', 'The SQL engine could not start.', ['Check your internet connection (it loads from a CDN) and try again.']);
    }
    status.textContent = '';
    btn.disabled = false;
  };
}

// ---------------------------------------------------------------- Prompt drill
export function mountPrompt(host, item, onPass) {
  const ex = item.exercise;
  const tmplKey = `prompt:${item.id}`;
  const st = { tries: ex.cases.map(() => 0), hintIdx: 0 };
  const passed = () => getState().progress[item.id]?.cases || {};
  host.innerHTML = `
    <div class="fb info"><b class="lead">Task you are prompting for</b>${inline(ex.task)}</div>
    <label class="field">Your prompt <span class="hint">Write it once. Put <code>{input}</code> where the data should go.</span>
      <textarea class="editor" style="min-height:160px;white-space:pre-wrap" spellcheck="true" data-role="tmpl">${esc(getNote(tmplKey))}</textarea>
    </label>
    <div class="row" style="margin-bottom:6px"><button class="btn" data-act="lint">Self-check my prompt</button><button class="btn" data-act="hint">Hint (0/${ex.hints.length})</button></div>
    <div class="lintbox"></div>
    <div class="hintbox"></div>
    ${ex.cases.map((c, i) => `
      <div class="case" data-ci="${i}">
        <b>Test case ${i + 1}</b>
        <p class="small muted" style="margin:6px 0">Input for this case:</p>
        <pre class="code">${esc(c.input)}</pre>
        <div class="row" style="margin-bottom:10px"><button class="btn" data-act="copy">Copy my prompt with this input</button></div>
        <label class="field" style="margin-bottom:8px">Paste the assistant's reply, exactly as given
          <textarea rows="3" data-role="out" style="font-family:var(--mono)"></textarea>
        </label>
        <button class="btn primary" data-act="check">Check</button>
        <div class="cfb"></div>
      </div>`).join('')}`;
  const tmpl = host.querySelector('[data-role="tmpl"]');
  tmpl.addEventListener('input', () => setNote(tmplKey, tmpl.value));
  const hints = hintUi(host, ex, st);
  host.querySelector('[data-act="lint"]').onclick = () => {
    const r = lintPrompt(tmpl.value, ex);
    const box = host.querySelector('.lintbox');
    if (r.text) { box.innerHTML = feedback('hint', 'Write your prompt in the box first, then run the self-check.'); return; }
    const rows = r.checks.map((c) => `<li class="lintrow ${c.ok ? 'ok' : c.soft ? 'soft' : 'bad'}"><span class="badge ${c.ok ? 'ok' : c.soft ? 'gray' : 'bad'}">${c.ok ? 'present' : c.soft ? 'consider' : 'missing'}</span> <span>${inline(c.label)}${c.ok || !c.tip ? '' : `<span class="muted small"> ${inline(c.tip)}</span>`}</span></li>`).join('');
    const lead = r.must === 0 ? 'No must-haves missing. Now test it with a real assistant.' : `${r.must} must-have${r.must > 1 ? 's' : ''} missing.`;
    box.innerHTML = `<div class="fb ${r.must === 0 ? 'ok' : 'info'}"><b class="lead">${lead}</b><ul class="lint">${rows}</ul><p class="small muted">This check reads your prompt only. It cannot run a model, so a clean result does not prove the prompt works. Run it on every case below.</p></div>`;
  };

  host.querySelectorAll('.case').forEach((el) => {
    const ci = Number(el.dataset.ci);
    const c = ex.cases[ci];
    const out = el.querySelector('[data-role="out"]');
    const cfb = el.querySelector('.cfb');
    const lock = () => { cfb.innerHTML = feedback('ok', 'Exact match. This case passes.'); out.value = c.expected; out.disabled = true; el.querySelector('[data-act="check"]').disabled = true; };
    if (passed()[ci]) lock();

    el.querySelector('[data-act="copy"]').onclick = async () => {
      const t = tmpl.value.trim();
      if (!t) { cfb.innerHTML = feedback('hint', 'Write your prompt in the box above first.'); return; }
      const full = t.includes('{input}') ? t.split('{input}').join(c.input) : `${t}\n\n${c.input}`;
      await copyText(full);
      cfb.innerHTML = feedback('info', 'Copied. Paste it into your assistant, then paste its reply below.', t.includes('{input}') ? [] : ['Your prompt has no `{input}` placeholder, so the data was added at the end. In the real exercise the placeholder must stay.']);
    };

    el.querySelector('[data-act="check"]').onclick = () => {
      st.tries[ci]++;
      const d = diagnoseText(out.value.replace(/\r/g, ''), c.expected);
      if (d.ok) {
        update((s) => {
          const p = (s.progress[item.id] ||= { parts: {}, missed: {}, tries: 0 });
          (p.cases ||= {})[ci] = true;
        }, { silent: true });
        lock();
        if (ex.cases.every((_, i) => passed()[i])) onPass(true);
        return;
      }
      noteMiss(item.id, `case${ci}`);
      const diff = st.tries[ci] >= 2 && d.diff
        ? `<div class="diff">${d.diff.map((l) => `<div class="${l.k}">${l.k === 'exp' ? 'expected: ' : l.k === 'got' ? 'you got:  ' : '          '}${esc(l.s)}</div>`).join('')}</div>`
        : (st.tries[ci] === 1 ? '<p class="small muted">Check again after tweaking your prompt. A line-by-line comparison appears after a second try.</p>' : '');
      cfb.innerHTML = feedback('bad', d.lead, d.steps, diff);
      if (st.tries[ci] >= 2 && st.hintIdx < ex.hints.length) {
        st.hintIdx++;
        const hb = host.querySelector('[data-act="hint"]');
        hb.textContent = st.hintIdx >= ex.hints.length ? 'No more hints' : `Hint (${st.hintIdx}/${ex.hints.length})`;
        if (st.hintIdx >= ex.hints.length) hb.disabled = true;
        hints.show();
      }
    };
  });
}

// ---------------------------------------------------------------- Written reply
export function mountWritten(host, item, onPass) {
  const ex = item.exercise;
  const key = `written:${item.id}`;
  const ticks = () => getState().progress[item.id]?.ticks || {};
  host.innerHTML = `
    <p>${inline(ex.prompt)}</p>
    <textarea rows="9" data-role="ans" placeholder="Type your reply here...">${esc(getNote(key))}</textarea>
    <div class="row" style="margin:12px 0"><button class="btn primary" data-act="check">Check my reply</button><span class="muted small wc"></span></div>
    <div class="fbbox"></div>
    <div class="review"></div>`;
  const ta = host.querySelector('[data-role="ans"]');
  const wc = host.querySelector('.wc');
  const words = () => (ta.value.trim().match(/\S+/g) || []).length;
  const upd = () => { wc.textContent = `${words()} words`; };
  ta.addEventListener('input', () => { setNote(key, ta.value); upd(); });
  upd();
  const fbbox = host.querySelector('.fbbox');
  const review = host.querySelector('.review');

  function renderReview() {
    const text = ta.value;
    const t = ticks();
    review.innerHTML = `
      <h3>Compare with the checklist</h3>
      <p class="muted small">The site spots keywords (shown as "looks present"), but you are the judge. Tick what your reply really does.</p>
      <div class="rubric">${ex.rubric.map((r) => `
        <label><input type="checkbox" data-rid="${r.id}" ${t[r.id] ? 'checked' : ''}><span>${inline(r.label)} <span class="badge ${r.test.test(text) ? 'ok' : 'gray'}">${r.test.test(text) ? 'looks present' : 'not detected'}</span></span></label>`).join('')}</div>
      <details class="schema" open><summary>A model reply (one good way, not the only way)</summary><pre class="code" style="white-space:pre-wrap">${esc(ex.model)}</pre></details>
      <div class="rfb"></div>`;
    review.querySelectorAll('input[type=checkbox]').forEach((cb) => cb.addEventListener('change', evaluate));
    evaluate(false);
  }
  function evaluate(save = true) {
    const picked = {};
    review.querySelectorAll('input[type=checkbox]').forEach((cb) => { picked[cb.dataset.rid] = cb.checked; });
    if (save !== false) update((s) => { (s.progress[item.id] ||= { parts: {}, missed: {}, tries: 0 }).ticks = picked; }, { silent: true });
    const n = Object.values(picked).filter(Boolean).length;
    const rfb = review.querySelector('.rfb');
    const missing = ex.rubric.filter((r) => !picked[r.id]).map((r) => r.label);
    if (n >= 4) {
      rfb.innerHTML = feedback('ok', `${n} of ${ex.rubric.length} checklist items met. Good structure.`, missing.length ? [`Next time also: ${missing[0]}`] : []);
      onPass(true);
    } else {
      rfb.innerHTML = feedback('hint', `${n} of ${ex.rubric.length} ticked. You need at least 4 to complete this one.`, missing.map((m) => `Still to add: ${m}`));
      onPass(false);
    }
  }

  host.querySelector('[data-act="check"]').onclick = () => {
    if (words() < ex.minWords) {
      fbbox.innerHTML = feedback('bad', `Your reply is ${words()} words. Aim for at least ${ex.minWords}.`, ['Follow the structure from the lesson above. Each part needs at least a sentence or two.']);
      review.innerHTML = '';
      noteMiss(item.id, 'ex');
      return;
    }
    fbbox.innerHTML = '';
    renderReview();
  };
  if (getNote(key) && Object.keys(ticks()).length) renderReview();
}

export { renderBlocks };
