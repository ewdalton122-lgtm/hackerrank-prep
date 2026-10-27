// "Review what I missed": every multiple-choice question you got wrong, in lessons, sprints and mocks,
// collects here. Answer one correctly twice and it is retired from the list.
import { getState, reviewMiss, reviewRight } from './store.js';
import { esc, inline, feedback } from './ui.js';
import { findItem } from '../../content/curriculum.js';
import { MOCKS, SPARE } from '../../content/mocks.js';

const RETIRE_AT = 2;
const SESSION = 10;
const letters = 'ABCD';
const plain = (t) => String(t || '').replace(/^Correct\.\s*/, '');

const MOCKQ = Object.fromEntries([...MOCKS.flatMap((m) => m.questions), ...SPARE].filter((q) => q.type === 'mcq').map((q) => [q.id, q]));

function resolveQ(key) {
  if (key.includes('#')) {
    const [id, i] = key.split('#');
    const q = findItem(id)?.quiz?.[Number(i)];
    return q ? { ...q, ref: id } : null;
  }
  return MOCKQ[key] || null;
}

/** Every open question: lesson-quiz misses (including ones made before this feature existed) plus sprint and mock misses. */
export function reviewPool(s) {
  const entries = {};
  for (const [id, p] of Object.entries(s.progress || {})) {
    for (const [k, v] of Object.entries(p.missed || {})) {
      const m = /^q(\d+)$/.exec(k);
      if (m && v > 0) entries[`${id}#${m[1]}`] = { n: v, right: 0 };
    }
  }
  for (const [k, e] of Object.entries(s.review || {})) entries[k] = e;
  return Object.entries(entries)
    .filter(([, e]) => e.n > 0 && e.right < RETIRE_AT)
    .map(([key, e]) => ({ key, n: e.n, right: e.right, q: resolveQ(key) }))
    .filter((x) => x.q);
}
export const reviewCount = (s) => reviewPool(s).length;

/** Exercises (SQL, Python, prompt, written) with wrong attempts. They cannot be quick-fire, so link to them. */
function exercisesToRedo(s) {
  return Object.entries(s.progress || {})
    .map(([id, p]) => ({ id, n: Object.entries(p.missed || {}).filter(([k]) => !/^q\d+$/.test(k)).reduce((a, [, v]) => a + v, 0), done: !!p.done }))
    .filter((x) => x.n > 0 && findItem(x.id))
    .sort((a, b) => b.n - a.n || Number(a.done) - Number(b.done))
    .slice(0, 6)
    .map((x) => ({ ...x, item: findItem(x.id) }));
}

function pickSession(pool) {
  const weighted = pool.map((x) => ({ x, w: x.n * 1.5 + (RETIRE_AT - x.right) + Math.random() }));
  return weighted.sort((a, b) => b.w - a.w).slice(0, SESSION).map((o) => o.x);
}

export function mountReview(host) {
  const s = getState();
  const pool = reviewPool(s);
  const redo = exercisesToRedo(s);
  const bySource = {};
  pool.forEach((x) => { const t = findItem(x.q.ref)?.title || 'Mock exam question'; bySource[t] = (bySource[t] || 0) + 1; });

  const redoCard = redo.length ? `<div class="card"><h2>Exercises worth redoing</h2>
    <p class="muted">Coding, SQL and prompt exercises cannot be quick-fire. Redo each one tomorrow without looking at the solution.</p>
    <ul class="items">${redo.map((x) => `<li><a class="item" href="#/item/${x.id}"><span class="t">${esc(x.item.title)}<small>${x.n} wrong attempt${x.n === 1 ? '' : 's'} &middot; ${x.done ? 'finished, but shaky' : 'not finished'}</small></span><span class="m">Retry</span></a></li>`).join('')}</ul></div>` : '';

  if (!pool.length) {
    host.innerHTML = `<div class="card"><h2>Nothing waiting for review</h2>
      <p>Questions you miss in lessons, review sprints and mock exams collect here. Answer one correctly twice and it leaves the list. Come back after your next study session.</p>
      <a class="btn primary" href="#/today">Back to Today</a></div>${redoCard}`;
    return;
  }

  const start = () => {
    const queue = pickSession(reviewPool(getState()));
    const results = [];
    let i = 0;
    const show = () => {
      if (i >= queue.length) return summary();
      const { key, q, n } = queue[i];
      host.innerHTML = `
        <div class="card">
          <div class="stagehead"><h2>Question ${i + 1} of ${queue.length}</h2><span class="muted small">${esc(findItem(q.ref)?.title || 'Mock exam question')}</span></div>
          <div class="bar" style="margin-bottom:14px"><i style="width:${Math.round((i / queue.length) * 100)}%"></i></div>
          <div class="q"><div class="qt">${inline(q.q)}</div>
            ${q.options.map((o, oi) => `<button class="opt" data-oi="${oi}"><b>${letters[oi]}.</b> ${inline(o)}</button>`).join('')}
            <div class="qfb"></div></div>
          <div class="row" style="margin-top:14px"><button class="btn primary hidden" data-act="next">${i + 1 === queue.length ? 'See results' : 'Next question'}</button></div>
        </div>`;
      host.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const oi = Number(b.dataset.oi);
        const ok = oi === q.answer;
        host.querySelectorAll('.opt').forEach((x) => { x.disabled = true; if (Number(x.dataset.oi) === q.answer) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        const fb = host.querySelector('.qfb');
        if (ok) {
          reviewRight(key, n);
          const e = getState().review[key];
          const retired = e && e.right >= RETIRE_AT;
          results.push({ key, q, ok: true, retired });
          fb.innerHTML = feedback('ok', retired ? 'Correct, and retired from your review list.' : `Correct. Get it right once more in a later session to retire it.`, [plain(q.explain?.[q.answer] || q.why)].filter(Boolean));
        } else {
          reviewMiss(key);
          results.push({ key, q, ok: false });
          fb.innerHTML = feedback('bad', 'Not quite. This one stays on your list.', [q.explain?.[oi] || 'Not quite.', `The right answer is ${letters[q.answer]}: ${plain(q.explain?.[q.answer] || q.why)}`].filter(Boolean));
        }
        host.querySelector('[data-act="next"]').classList.remove('hidden');
        host.querySelector('[data-act="next"]').focus();
      }));
      host.querySelector('[data-act="next"]').addEventListener('click', () => { i++; show(); });
    };
    const summary = () => {
      const right = results.filter((r) => r.ok).length;
      const retired = results.filter((r) => r.retired).length;
      const remaining = reviewCount(getState());
      const miss = [...new Set(results.filter((r) => !r.ok).map((r) => r.q.ref))].filter((id) => findItem(id));
      host.innerHTML = `
        <div class="card"><h2>${right} of ${results.length} correct</h2>
          <p>${retired ? `<b>${retired}</b> question${retired === 1 ? ' was' : 's were'} retired from your list. ` : ''}${remaining ? `${remaining} still waiting.` : 'Your review list is empty. Nicely done.'}</p>
          <div class="row">${remaining ? '<button class="btn primary" data-act="again">Another round</button>' : ''}<a class="btn" href="#/today">Back to Today</a></div></div>
        ${miss.length ? `<div class="card"><h2>Study these next</h2><p class="muted">These lessons cover the questions you missed this round.</p><ul class="items">${miss.map((id) => { const it = findItem(id); return `<li><a class="item" href="#/item/${id}"><span class="t">${esc(it.title)}<small>Lesson in this site</small></span><span class="m">Open</span></a>${(it.links || []).slice(0, 2).map((l) => `<div class="small extl">Also: <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></div>`).join('')}</li>`; }).join('')}</ul></div>` : ''}
        ${redoCard}`;
      host.querySelector('[data-act="again"]')?.addEventListener('click', start);
    };
    show();
  };

  host.innerHTML = `
    <div class="card"><h2>${pool.length} question${pool.length === 1 ? '' : 's'} waiting</h2>
      <p>Each round is up to ${SESSION} questions, with the ones you miss most often first. Get a question right twice and it is retired. Wrong answers explain why, and link to the lesson.</p>
      <ul class="small muted">${Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, c]) => `<li>${esc(t)}: ${c}</li>`).join('')}</ul>
      <button class="btn primary" data-act="start">Start a round</button></div>${redoCard}`;
  host.querySelector('[data-act="start"]').addEventListener('click', start);
}
