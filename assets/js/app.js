import { computeReadiness, pct, SECTIONS } from './readiness.js';
import { REFERENCE } from '../../content/reference.js';
import { getState, update, subscribe, initRemote, remoteEnabled, getUser, signIn, signInPassword, setPassword, signOut, fetchInternal, verifyCode, linkError, setPart, replaceState, resetAll, syncStatus } from './store.js';
import { STAGES, ROLES, itemsFor, findItem, requiredParts } from '../../content/curriculum.js';
import { computePlan, previewPlan, lastSevenDays, ymd, parseYmd, DAY_NAMES } from './planner.js';
import { esc, inline, fmtMin, toast, renderBlocks, feedback } from './ui.js';
import { mountQuiz, mountPython, mountSql, mountPrompt, mountWritten } from './components.js';
import { mountMockPage, mountMockList, stopMock, mockStats, verdict } from './mock.js';
import { heroHtml, paintHeroes, initMomentum } from './momentum.js';
import { mountReview, reviewCount } from './review.js';

const app = document.getElementById('app');
const NAV = [
  ['#/today', 'Today', 'M4 12l8-8 8 8M6 10v9h12v-9'],
  ['#/roadmap', 'Roadmap', 'M4 6h16M4 12h16M4 18h10'],
  ['#/review', 'Review missed', 'M4 4v6h6M20 20v-6h-6M20 10A8 8 0 006 6.3L4 10M4 14a8 8 0 0014 3.7l2-3.7'],
  ['#/mocks', 'Mock exams', 'M12 6v6l4 2M12 3a9 9 0 100 18 9 9 0 000-18z'],
  ['#/readiness', 'Readiness', 'M4 20V10M10 20V4M16 20v-7M22 20H2'],
  ['#/reference', 'Reference', 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM8 4v13'],
  ['#/internal', 'Internal', 'M6 10V8a6 6 0 1112 0v2M5 10h14v10H5z'],
  ['#/settings', 'Settings', 'M12 8a4 4 0 100 8 4 4 0 000-8z'],
];
const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

// ------------------------------------------------------------------ shell
function shell(inner, active) {
  const s = getState();
  const plan = s.profile ? computePlan(s) : null;
  const user = getUser();
  const syncText = !remoteEnabled() ? 'Saved in this browser' : user ? ({ saving: 'Saving...', saved: 'Synced to your account', error: 'Sync problem, saved locally' }[syncStatus] || 'Synced to your account') : 'Saved in this browser. Sign in to sync.';
  app.innerHTML = `
    <div class="shell">
      <aside class="side">
        <a class="brand" href="#/today"><span class="logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-11"/></svg></span>Zero to Assessment</a>
        <nav class="nav">${NAV.map(([h, l, d]) => { const n = h === '#/review' && s.profile ? reviewCount(s) : 0; return `<a href="${h}" class="${active === h ? 'active' : ''}">${icon(d)}<span>${l}</span>${n ? `<em class="navbadge">${n}</em>` : ''}</a>`; }).join('')}</nav>
        <div class="foot">
          ${plan ? `<div class="foot-prog"><b>${plan.pct}% complete</b><div class="bar"><i style="width:${plan.pct}%"></i></div><div>${ROLES[s.profile.role].name}</div></div>` : '<b>Welcome</b>'}
          <div style="margin-top:6px;opacity:.8">${esc(user?.email || '')}</div>
          <div style="opacity:.7">${syncText}</div>
        </div>
      </aside>
      <main class="main" id="main">${s.profile && active && active !== '#/today' && !location.hash.startsWith('#/mock/') ? heroHtml(s, 'slim') : ''}${inner}</main>
    </div>`;
  paintHeroes();
  return document.getElementById('main');
}

const pill = (text, kind = '') => `<span class="badge ${kind}">${esc(text)}</span>`;
const fmtDate = (str) => parseYmd(str).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

// ------------------------------------------------------------------ setup / settings form
function profileForm(existing, submitLabel) {
  const p = existing || { role: 'ds', examDate: '', studyDays: [1, 2, 3, 4, 5] };
  const tomorrow = ymd(new Date(Date.now() + 86400000));
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `
    <form id="profile" class="card">
      <h2>Your plan</h2>
      <p class="field" style="font-weight:600;color:var(--ink);margin-bottom:8px">Which role are you preparing for?</p>
      ${Object.entries(ROLES).map(([k, r]) => `
        <label class="choice"><input type="radio" name="role" value="${k}" ${p.role === k ? 'checked' : ''}>
          <span>${r.name}<small>${k === 'ds'
            ? `${r.bar}% pass mark, about 102 of 170 points. SQL and prompt engineering are 100 of those points and the quickest to learn, so they come first. Coding is the third big section and your safety net.`
            : `${r.bar}% pass mark, about 119 of 170 points. That realistically means all three big sections (SQL, prompts and coding), so this path adds the Patterns and Greedy/Heaps stages.`}</small></span></label>`).join('')}
      <label class="field" style="margin-top:18px">When do you want to take the assessment?
        <span class="hint">Pick a realistic date. You can change it any time.</span>
        <input type="date" name="examDate" value="${esc(p.examDate)}" min="${tomorrow}" required>
      </label>
      <div class="field">Which days will you study?
        <div class="days">${order.map((d) => `<label><input type="checkbox" name="day" value="${d}" ${p.studyDays.includes(d) ? 'checked' : ''}>${DAY_NAMES[d]}</label>`).join('')}</div>
      </div>
      <div id="preview" class="fb info" style="margin:18px 0"></div>
      <button class="btn primary" type="submit">${submitLabel}</button>
    </form>`;
}

function bindProfileForm(onSaved) {
  const form = document.getElementById('profile');
  if (!form) return;
  const read = () => ({
    role: form.role.value,
    examDate: form.examDate.value,
    studyDays: [...form.querySelectorAll('input[name=day]:checked')].map((c) => Number(c.value)),
  });
  const preview = () => {
    const v = read();
    const box = document.getElementById('preview');
    const pv = previewPlan(v.role, v.examDate, v.studyDays);
    if (!pv) { box.innerHTML = 'Choose an exam date and at least one study day to see your daily target.'; return; }
    if (pv.days < 1) { box.innerHTML = 'That date is too soon to plan for. Pick a later date.'; return; }
    const heavy = pv.perDay > 180;
    box.className = `fb ${heavy ? 'hint' : 'info'}`;
    box.innerHTML = `<b class="lead">About ${pv.perDay} minutes per study day</b>The full path is about ${Math.round(pv.total / 60)} hours across ${pv.days} study days (the last few are kept as buffer). ${heavy ? 'That is a lot alongside a full-time job. Consider a later date or more study days.' : 'That is a steady pace you can sustain.'}`;
  };
  form.addEventListener('input', preview);
  preview();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = read();
    if (!v.studyDays.length) { toast('Pick at least one study day'); return; }
    update((s) => {
      s.profile = { ...v, startDate: s.profile?.startDate || ymd() };
    });
    toast('Plan saved');
    onSaved();
  });
}

function viewSetup() {
  const main = shell(`
    <div class="center">
      <div class="pagehead"><h1>Let's build your plan</h1>
      <p>Tell me your target role and exam date. I'll work backward and tell you how much to study each day, and I'll remember where you are.</p></div>
      ${profileForm(null, 'Create my plan')}
    </div>`, '');
  bindProfileForm(() => { location.hash = '#/today'; });
  return main;
}

// ------------------------------------------------------------------ today
function viewToday() {
  const s = getState();
  const plan = computePlan(s);
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const statusMsg = {
    on: ['On track', 'ok', 'You are keeping pace with the plan. Keep the streak going.'],
    ahead: ['Ahead of plan', 'ok', 'You are ahead. Use the extra time to revisit anything you found shaky.'],
    behind: ['Behind plan', 'warn', `Your daily target has risen from about ${plan.baseline} to ${plan.perDay} minutes. Add a study day, or move the exam date in Settings.`],
    done: ['Path complete', 'ok', 'Every item is done. Run another timed mock or revisit weak spots.'],
    past: ['Exam date passed', 'bad', 'Your exam date has passed. Update it in Settings to get a fresh plan.'],
  }[plan.status];
  const queue = plan.queue;
  const weak = Object.entries(s.progress)
    .map(([id, p]) => ({ id, n: Object.values(p.missed || {}).reduce((a, b) => a + b, 0) }))
    .filter((x) => x.n > 0 && findItem(x.id)).sort((a, b) => b.n - a.n).slice(0, 3);
  const ready = computeReadiness(s);
  const bars = lastSevenDays(s);
  const maxBar = Math.max(30, ...bars.map((b) => b.min));
  const main = shell(`
    ${heroHtml(s, 'full', { eyebrow: `${greet} \u00b7 ${ROLES[s.profile.role].name} track \u00b7 exam ${fmtDate(s.profile.examDate)}` })}
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="stat"><div class="n">${plan.daysLeft}</div><div class="l">days to your exam</div></div>
      <div class="stat"><div class="n">${plan.perDay}<span style="font-size:1rem"> min</span></div><div class="l">target per study day</div></div>
      <div class="stat"><div class="n">${plan.studiedToday}<span style="font-size:1rem"> min</span></div><div class="l">studied today</div></div>
      <a class="stat" href="#/readiness" style="display:block;text-decoration:none"><div class="n">${ready.enoughData ? pct(ready.overall) : '...'}</div><div class="l">readiness${ready.enoughData && ready.focus ? `. Focus: ${esc(ready.focus.name)}` : ' (builds as you practise)'}</div></a>
    </div>
    ${journeyMap(s)}
    <div class="card">
      <div class="stagehead"><h2>${statusMsg[0] === 'On track' ? 'Your plan' : 'Your plan'}</h2>${pill(statusMsg[0], statusMsg[1])}</div>
      <p>${statusMsg[2]}</p>
      ${plan.tooHeavy ? feedback('hint', 'This pace is heavy.', ['At more than 3 hours a day, retention drops. Consider moving the exam date later or adding weekend study days in Settings.']) : ''}
      <div class="bar"><i style="width:${plan.pct}%"></i></div>
      <p class="small muted" style="margin-top:8px">${plan.doneItems} of ${plan.itemCount} items done. About ${fmtMin(plan.remaining)} left. ${plan.buffer} study day${plan.buffer === 1 ? '' : 's'} are held back as buffer.</p>
    </div>
    <div class="card">
      <div class="stagehead"><h2>${plan.isStudyDay ? "Today's session" : 'Up next (today is a rest day)'}</h2>${plan.nextItem ? `<a class="btn primary" href="#/item/${plan.nextItem.id}">${plan.doneItems ? 'Continue' : 'Start'}</a>` : ''}</div>
      ${queue.length ? `<ul class="items">${queue.map((it, i) => itemRow(it, i === 0)).join('')}</ul>` : '<p>Nothing left. Great work.</p>'}
    </div>
    <div class="grid cols-2">
      <div class="card"><h2>Last 7 days</h2>
        <div class="bars7">${bars.map((b) => `<div><i class="${b.isStudy ? '' : 'off'}" style="height:${Math.round((b.min / maxBar) * 54)}px" title="${b.min} min"></i>${b.label}</div>`).join('')}</div>
        <p class="small muted" style="margin-top:8px">Minutes studied while a lesson page was open. Grey bars are rest days.</p></div>
      <div class="card"><h2>Weak spots</h2>
        ${weak.length ? `<ul class="items">${weak.map((w) => { const it = findItem(w.id); return `<li><a class="item" href="#/item/${w.id}"><span class="t">${esc(it.title)}<small>${w.n} wrong attempt${w.n > 1 ? 's' : ''}</small></span><span class="m">Review</span></a></li>`; }).join('')}</ul>` : '<p class="muted">Nothing yet. Missed questions will appear here so you can review them.</p>'}
        ${reviewCount(s) ? `<a class="btn primary" style="margin-top:12px" href="#/review">Review ${reviewCount(s)} missed question${reviewCount(s) === 1 ? '' : 's'}</a>` : ''}
      </div>
    </div>`, '#/today');
  return main;
}


// A one-glance map of the whole path: every required stage, how far through it you are, and where you are now.
function journeyMap(s) {
  const role = s.profile.role;
  const stages = STAGES.filter((st) => st.roles.includes(role) && !st.optional);
  const rows = stages.map((st) => {
    const req = st.items.filter((i) => !i.optional);
    const done = req.filter((i) => s.progress[i.id]?.done).length;
    return { st, done, total: req.length, pct: req.length ? Math.round((done / req.length) * 100) : 0 };
  });
  const current = rows.findIndex((r) => r.done < r.total);
  return `<div class="card"><div class="stagehead"><h2>Where you are on the path</h2><span class="muted small">${current === -1 ? 'All stages complete' : `Now on Stage ${rows[current].st.num}`}</span></div>
    <div class="journey">${rows.map((r, i) => `<a href="#/roadmap" class="jstep ${r.pct === 100 ? 'done' : i === current ? 'now' : ''}"><span class="jn">${r.pct === 100 ? '&#10003;' : r.st.num}</span><span class="jt">${esc(r.st.title.replace(/ \(.*\)/, ''))}</span><span class="jbar"><i style="width:${r.pct}%"></i></span><span class="jp">${r.done}/${r.total}</span></a>`).join('')}</div></div>`;
}

function itemKind(it) {
  if (it.mock) return 'Timed mock exam';
  if (it.optional) return 'Optional extra';
  if (it.exercise?.kind === 'python') return 'Python practice';
  if (it.exercise?.kind === 'sql') return 'SQL practice';
  if (it.exercise?.kind === 'prompt') return 'Prompt drill';
  if (it.exercise?.kind === 'written') return 'Written reply';
  if (it.quiz) return 'Lesson and quiz';
  return 'Resource';
}

function itemRow(it, isNext = false) {
  const done = getState().progress[it.id]?.done;
  const st = it.noStage ? null : (it.stage || findItem(it.id)?.stage);
  return `<li><a class="item" href="#/item/${it.id}"><span class="dot ${done ? 'done' : isNext ? 'next' : ''}">${done ? '&#10003;' : ''}</span><span class="t">${esc(it.title)}<small>${st ? `Stage ${st.num}: ${esc(st.title)} &middot; ` : ''}${itemKind(it)}</small></span><span class="m">${fmtMin(it.minutes)}</span></a></li>`;
}

// ------------------------------------------------------------------ roadmap
function viewRoadmap() {
  const s = getState();
  const role = s.profile.role;
  const items = itemsFor(role);
  const next = items.find((i) => !s.progress[i.id]?.done);
  const mine = STAGES.filter((st) => st.roles.includes(role));
  const other = STAGES.filter((st) => !st.roles.includes(role));
  const main = shell(`
    <div class="pagehead"><h1>Roadmap</h1><p>Work top to bottom. Everything stays unlocked, so you can jump around, but the highlighted item is the best next step.</p></div>
    ${mine.map((st) => {
      const done = st.items.filter((i) => s.progress[i.id]?.done).length;
      const mins = st.items.reduce((a, i) => a + i.minutes, 0);
      const pct = Math.round((done / st.items.length) * 100);
      return `<div class="card"><div class="stagehead"><h2>Stage ${st.num}: ${esc(st.title)}${st.optional ? ' ' + pill('Optional', 'gray') : ''}</h2><span class="muted small">${done}/${st.items.length} done &middot; ${fmtMin(mins)}</span></div>
        <p class="muted">${esc(st.summary)}</p><div class="bar ${pct === 100 ? 'ok' : ''}" style="margin-bottom:8px"><i style="width:${pct}%"></i></div>
        <ul class="items">${st.items.map((i) => itemRow({ ...i, noStage: true }, next?.id === i.id)).join('')}</ul></div>`;
    }).join('')}
    ${other.length ? `<div class="card"><h2>Optional stretch</h2><p class="muted">These stages are part of the other role's path. Switch roles in Settings to add them to your plan.</p>
      <ul>${other.map((st) => `<li><b>${esc(st.title)}</b>: ${esc(st.summary)}</li>`).join('')}</ul></div>` : ''}`, '#/roadmap');
  return main;
}

// ------------------------------------------------------------------ item
function viewItem(id) {
  const item = findItem(id);
  if (!item) return shell('<div class="card"><h2>Not found</h2><p>That lesson does not exist. <a href="#/roadmap">Back to the roadmap</a></p></div>', '#/roadmap');
  const s = getState();
  const role = s.profile.role;
  const list = itemsFor(role);
  const idx = list.findIndex((i) => i.id === id);
  const prev = list[idx - 1], next = list[idx + 1];
  const req = requiredParts(item);
  const isResource = !req.length;
  const done = () => !!getState().progress[id]?.done;

  const main = shell(`
    <div class="crumbs"><a href="#/roadmap">Roadmap</a> / Stage ${item.stage.num}: ${esc(item.stage.title)}</div>
    <div class="pagehead"><div class="stagehead"><h1>${esc(item.title)}</h1><span id="status"></span></div>
      <p>${esc(item.blurb || '')} <span class="muted">About ${fmtMin(item.minutes)}.</span></p></div>
    <div class="card lesson">
      ${renderBlocks(item.blocks)}
      ${item.links ? `<ul class="links">${item.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a><span class="use">${esc(l.use || '')}</span></li>`).join('')}</ul>` : ''}
      ${item.quiz ? `<div class="part"><div class="part-head"><h2>Check your understanding</h2><span id="p-quiz"></span></div><div id="quiz"></div></div>` : ''}
      ${item.exercise ? `<div class="part"><div class="part-head"><h2>${{ python: 'Try it', sql: 'Write the query', prompt: 'Prompt drill', written: 'Write your reply' }[item.exercise.kind]}</h2><span id="p-ex"></span></div><div id="ex"></div></div>` : ''}
      ${isResource ? `<div class="part"><label class="choice" style="max-width:420px"><input type="checkbox" id="manual" ${done() ? 'checked' : ''}><span>I finished this<small>Tick it when you have done the work above.</small></span></label></div>` : ''}
    </div>
    <div class="nextbar">${prev ? `<a class="btn" href="#/item/${prev.id}">&larr; ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn primary" href="#/item/${next.id}" id="nextBtn">Next: ${esc(next.title)} &rarr;</a>` : ''}</div>`, '#/roadmap');

  const refresh = () => {
    const p = getState().progress[id] || {};
    document.getElementById('status').innerHTML = p.done ? pill('Done', 'ok') : pill(itemKind(item), 'gray');
    const mark = (el, ok) => { if (el) el.innerHTML = ok ? pill('Complete', 'ok') : ''; };
    mark(document.getElementById('p-quiz'), p.parts?.quiz);
    mark(document.getElementById('p-ex'), p.parts?.ex);
  };
  const complete = (part) => (ok) => {
    setPart(item, part, !!ok, req);
    refresh();
    if (ok && done()) toast('Lesson complete');
  };

  if (item.quiz) mountQuiz(document.getElementById('quiz'), item, complete('quiz'));
  if (item.exercise) {
    const host = document.getElementById('ex');
    ({ python: mountPython, sql: mountSql, prompt: mountPrompt, written: mountWritten })[item.exercise.kind](host, item, complete('ex'));
  }
  document.getElementById('manual')?.addEventListener('change', (e) => {
    setPart(item, 'manual', e.target.checked, req);
    refresh();
    if (e.target.checked) toast('Marked done');
  });
  refresh();
  return main;
}


// ------------------------------------------------------------------ review missed
function viewReview() {
  const main = shell('<div class="pagehead"><h1>Review what I missed</h1><p>Every multiple-choice question you got wrong, in one place. Answer each correctly twice to clear it.</p></div><div id="reviewhost"></div>', '#/review');
  mountReview(document.getElementById('reviewhost'));
  return main;
}

// ------------------------------------------------------------------ mock exams
function viewMocks() {
  const s = getState();
  const main = shell('<div class="pagehead"><h1>Mock exams</h1><p>Timed practice under exam conditions, scored by skill area. Each full mock uses questions that are not in the lessons.</p></div><div id="mockhost"></div>', '#/mocks');
  mountMockList(document.getElementById('mockhost'), s.profile.role);
  return main;
}
function viewMock(id) {
  const s = getState();
  const main = shell('<div id="mockhost"></div>', '#/mocks');
  mountMockPage(document.getElementById('mockhost'), id, s.profile.role);
  return main;
}

// ------------------------------------------------------------------ readiness
function viewReadiness() {
  const s = getState();
  const r = computeReadiness(s);
  const role = ROLES[r.role];
  const status = !r.enoughData ? 'early' : r.overall >= 0.8 ? 'strong' : r.overall >= role.bar / 100 ? 'close' : 'building';
  const msg = {
    early: ['Not enough data yet', 'gray', 'Finish about 8 items and this page will start to mean something. Until then, just follow the Today page.'],
    building: ['Still building', 'warn', `Your pass mark is ${role.bar}%. Practice scores run lower than you expect under time pressure, so aim for 75% or more here before you book the assessment.`],
    close: ['Getting close', 'ok', `You are above the ${role.bar}% pass mark on this estimate, but not with a safe margin. Aim for 75% or more, and fix the weak spots below first.`],
    strong: ['Looking strong', 'ok', 'Keep up the practice, and take the timed mock tests in Stage 7 to confirm it under exam conditions.'],
  }[status];
  const f = r.focus;
  const main = shell(`
    <div class="pagehead"><h1>Readiness</h1><p>An honest estimate from your own practice: how much you have finished, and how often you got it right first time. It is not a prediction of your exam score.</p></div>
    <div class="card">
      <div class="stagehead"><h2>Overall: ${r.enoughData ? pct(r.overall) : 'warming up'}</h2>${pill(msg[0], msg[1])}</div>
      <div class="meter"><i style="width:${Math.round(r.overall * 100)}%"></i><b style="left:${role.bar}%" title="Pass mark ${role.bar}%"></b></div>
      <p class="small muted" style="margin-top:8px">The marker is the ${role.bar}% pass mark for ${esc(role.name)}.</p>
      <p>${msg[2]}</p>
    </div>
    ${(() => { const ms = mockStats(s); const bar = role.bar; if (!ms.latest) return `<div class="card"><h2>Mock exams</h2><p class="muted">Your estimate above comes from practice. A timed mock shows how you do under pressure. Your first one is the most useful data point you can add.</p><a class="btn primary" href="#/mocks">Open mock exams</a></div>`; const v = verdict(ms.latest.pct, bar); return `<div class="card"><div class="stagehead"><h2>Mock exams</h2><span class="badge ${v[1]}">${v[0]}</span></div><p>Latest full mock: <b>${Math.round(ms.latest.pct)}%</b> (${esc(ms.latest.title)}).${ms.avg2 !== null ? ` Average of the last two: <b>${Math.round(ms.avg2)}%</b>.` : ''} Pass mark ${bar}%. The goal is two in a row at ${bar + 10}% or more.</p><a class="btn" href="#/mocks">Take another mock</a></div>`; })()}
    ${f && r.enoughData ? `<div class="card"><h2>Best use of your next session</h2>
      <p><b>${esc(f.name)}</b> has the most room to grow (${pct(f.readiness)} ready). ${esc(f.tip)}</p>
      ${f.nextItem ? `<a class="btn primary" href="#/item/${f.nextItem.id}">Next in ${esc(f.name)}: ${esc(f.nextItem.title)}</a>` : '<p class="muted">Everything in this area is done. Redo the review list below.</p>'}</div>` : ''}
    ${(() => {
      const total = SECTIONS.reduce((x, y) => x + y.weight, 0);
      const need = Math.ceil((role.bar / 100) * total);
      const est = Math.round(r.sections.reduce((x, y) => x + y.weight * y.readiness, 0));
      const big = r.sections.filter((x) => x.weight >= 50);
      return `<div class="card"><h2>Where the points are</h2>
        <p>Candidates who have taken the exam describe about <b>${total} points</b>. For ${esc(role.name)} you need about <b>${need}</b> (${role.bar}%).</p>
        <div class="scroll"><table class="res"><thead><tr><th>Section</th><th>Points</th><th>Your estimate</th></tr></thead><tbody>${r.sections.map((x) => `<tr><td>${esc(x.name)}</td><td>${x.weight}</td><td>about ${Math.round(x.weight * x.readiness)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${total}</b></td><td><b>about ${est}</b></td></tr></tbody></table></div>
        <p class="small muted" style="margin-top:8px">${r.enoughData ? `On this estimate you are ${est >= need ? 'above' : 'below'} the ${need} points you need. ` : ''}Each of the ${big.length} big sections is worth about 29% on its own. Two of them plus a few small points reaches 60%, so get two sections fully reliable before you polish the third. The split is one candidate's account, not an official breakdown.</p></div>`;
    })()}
    <div class="card"><h2>By skill area</h2>
      <div class="secs">${r.sections.map((x) => `<div class="sec">
        <div class="sec-head"><b>${esc(x.name)}</b><span>${pct(x.readiness)}</span></div>
        <div class="bar"><i style="width:${Math.round(x.readiness * 100)}%"></i></div>
        <p class="small muted">${x.doneItems} of ${x.items} items done &middot; ${x.firstTry === null ? 'no practice yet' : `${pct(x.firstTry)} right first time`} &middot; ${x.misses} wrong attempt${x.misses === 1 ? '' : 's'}</p>
      </div>`).join('')}</div>
      <p class="small muted" style="margin-top:12px">Skill areas are weighted by the points candidates report for each section of the exam.</p>
    </div>
    <div class="card"><h2>Redo these</h2>
      ${r.review.length ? `<ul class="items">${r.review.map((x) => `<li><a class="item" href="#/item/${x.item.id}"><span class="t">${esc(x.item.title)}<small>${esc(x.section)} &middot; ${x.n} wrong attempts &middot; ${x.done ? 'finished, but shaky' : 'not finished'}</small></span><span class="m">Retry</span></a></li>`).join('')}</ul>
      <p class="small muted" style="margin-top:8px">Redo each one from scratch tomorrow without looking at the solution. If you can, the topic is learned.</p>` : '<p class="muted">Nothing needs a redo yet. Items you get wrong twice or more will show up here.</p>'}
    </div>`, '#/readiness');
  return main;
}

// ------------------------------------------------------------------ reference
function viewReference() {
  const main = shell(`
    <div class="pagehead"><h1>Reference</h1><p>A cheat sheet for the things the practice problems use. Keep it open in another tab while you work.</p></div>
    <div class="card"><div class="chips">${REFERENCE.map((r) => `<a class="chip" href="#/reference" data-jump="${r.id}">${esc(r.title.split(':')[0])}${r.title.includes(':') ? ': ' + esc(r.title.split(':')[1].trim().split(' ').slice(0, 2).join(' ')) : ''}</a>`).join('')}</div></div>
    ${REFERENCE.map((r) => `<div class="card lesson" id="${r.id}"><h2>${esc(r.title)}</h2>${renderBlocks(r.blocks)}</div>`).join('')}`, '#/reference');
  main.querySelectorAll('[data-jump]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById(el.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  return main;
}

// ------------------------------------------------------------------ internal (gated)
async function viewInternal() {
  const user = getUser();
  const main = shell(`
    <div class="pagehead"><h1>Internal resources</h1><p>Company-internal study material. It is stored in your private account database, never in the public site code, and only shows after you sign in with an approved email.</p></div>
    <div id="internalBody"></div>`, '#/internal');
  const body = document.getElementById('internalBody');
  if (!remoteEnabled()) {
    body.innerHTML = `<div class="card"><h2>Not connected yet</h2><p>This section unlocks once the site is connected to its private account database and you sign in. Everything else on the site works without it.</p></div>`;
    return main;
  }
  if (!user) { body.innerHTML = signInCard('Sign in to see internal resources'); bindSignIn(); return main; }
  body.innerHTML = '<div class="card"><span class="spinner"></span>Loading...</div>';
  const res = await fetchInternal();
  if (res.reason === 'error') body.innerHTML = `<div class="card">${feedback('bad', 'Could not load internal resources.', ['Check that the database schema was run and your email is on the allow list.'])}</div>`;
  else if (!res.rows.length) body.innerHTML = `<div class="card"><h2>${res.allowed ? 'You are approved. Nothing has been added yet.' : 'This email is not on the approved list.'}</h2><p>${res.allowed ? 'Internal resources will show up here as soon as they are added to the private database.' : 'Ask the site owner to add this email address to the allow list.'}</p></div>`;
  else {
    const groups = {};
    res.rows.forEach((r) => (groups[r.stage || 'General'] ||= []).push(r));
    body.innerHTML = Object.entries(groups).map(([g, rows]) => `<div class="card"><h2>${esc(g)}</h2><ul class="links">${rows.map((r) => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>` : `<b>${esc(r.title)}</b>`}<span class="use">${esc(r.summary || '')}</span></li>`).join('')}</ul></div>`).join('');
  }
  return main;
}

function signInCard(title) {
  return `<div class="card"><h2>${title}</h2>
    <div class="row" style="margin-bottom:10px">
      <label class="chip"><input type="radio" name="smode" value="link" checked> Email me a link</label>
      <label class="chip"><input type="radio" name="smode" value="password"> Use my password</label>
    </div>
    <p class="muted small" id="smodehelp">Enter your email and I'll send a sign-in link. Open the link on the device you want to sign in on.</p>
    <div class="row"><input type="email" id="email" placeholder="you@example.com" autocomplete="email" style="max-width:300px;margin:0"><input type="password" id="pw" class="hidden" placeholder="Password" autocomplete="current-password" style="max-width:220px;margin:0"><button class="btn primary" data-act="signin">Send link</button></div>
    <div id="signinMsg" style="margin-top:12px"></div></div>`;
}
function bindSignIn() {
  const card = document.querySelector('[data-act="signin"]')?.closest('.card');
  if (!card) return;
  const mode = () => card.querySelector('input[name=smode]:checked').value;
  const sync = () => {
    const pw = mode() === 'password';
    card.querySelector('#pw').classList.toggle('hidden', !pw);
    card.querySelector('[data-act="signin"]').textContent = pw ? 'Sign in' : 'Send link';
    card.querySelector('#smodehelp').textContent = pw
      ? 'Password sign-in sends no email, so it always works, even if the email limit has been reached. Set a password once in Settings after your first sign-in.'
      : "Enter your email and I'll send a sign-in link. Open the link on the device you want to sign in on.";
  };
  card.querySelectorAll('input[name=smode]').forEach((r) => r.addEventListener('change', sync));
  const go = async () => {
    const email = card.querySelector('#email').value.trim();
    const msg = card.querySelector('#signinMsg');
    if (!/^\S+@\S+\.\S+$/.test(email)) { msg.innerHTML = feedback('hint', 'Enter a valid email address.'); return; }
    if (mode() === 'password') {
      const pw = card.querySelector('#pw').value;
      if (!pw) { msg.innerHTML = feedback('hint', 'Enter your password.'); return; }
      msg.innerHTML = '<span class="spinner"></span>Signing in...';
      try { await signInPassword(email, pw); msg.innerHTML = feedback('ok', 'Signed in.'); }
      catch (e) { msg.innerHTML = feedback('bad', 'Could not sign in.', [String(e.message || e)]); }
      return;
    }
    msg.innerHTML = '<span class="spinner"></span>Sending...';
    try { await signIn(email); msg.innerHTML = feedback('ok', 'Check your email.', ['Click the link once, on the device you want to sign in on. Links work one time and expire after an hour.', 'No email after a few minutes? Check spam, or use your password instead.']); }
    catch (e) { msg.innerHTML = feedback('bad', 'Could not send the link.', [String(e.message || e)]); }
  };
  card.querySelector('[data-act="signin"]').addEventListener('click', go);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') go(); });
}

// ------------------------------------------------------------------ settings
function viewSettings() {
  const s = getState();
  const user = getUser();
  const main = shell(`
    <div class="pagehead"><h1>Settings</h1></div>
    ${profileForm(s.profile, s.profile ? 'Update plan' : 'Create plan')}
    <div class="card"><h2>Account and sync</h2>
      ${!remoteEnabled() ? '<p>Your progress is saved in this browser. Connect the site to its account database to sign in and sync across devices (setup steps are in the project notes).</p>'
        : user ? `<p>Signed in as <b>${esc(user.email)}</b>. Progress syncs automatically.</p><button class="btn" data-act="signout">Sign out</button>
          <h3>Password</h3><p class="muted small">Set a password so you can sign in on your phone or any device without waiting for an email. At least 8 characters.</p>
          <div class="row"><input type="password" id="newpw" autocomplete="new-password" placeholder="New password" style="max-width:260px;margin:0"><button class="btn" data-act="setpw">Save password</button></div><div id="pwMsg" style="margin-top:10px"></div>`
          : signInCard('Sign in to sync your progress')}
    </div>
    <div class="card"><h2>Backup</h2>
      <p class="muted">Download a copy of your progress, or restore one. Useful as a safety net.</p>
      <div class="row"><button class="btn" data-act="export">Download backup</button>
      <label class="btn">Restore backup<input type="file" id="importFile" accept="application/json" style="display:none"></label>
      <button class="btn danger" data-act="reset">Erase all progress</button></div>
    </div>`, '#/settings');
  bindProfileForm(() => { location.hash = '#/today'; });
  bindSignIn();
  main.querySelector('[data-act="signout"]')?.addEventListener('click', () => signOut());
  main.querySelector('[data-act="setpw"]')?.addEventListener('click', async () => {
    const pw = document.getElementById('newpw').value;
    const msg = document.getElementById('pwMsg');
    if (pw.length < 8) { msg.innerHTML = feedback('hint', 'Use at least 8 characters.'); return; }
    try { await setPassword(pw); document.getElementById('newpw').value = ''; msg.innerHTML = feedback('ok', 'Password saved.', ['Next time, choose "Use my password" when you sign in.']); }
    catch (e) { msg.innerHTML = feedback('bad', 'Could not save the password.', [String(e.message || e)]); }
  });
  main.querySelector('[data-act="export"]').onclick = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `zero-to-assessment-backup-${ymd()}.json`; a.click();
  };
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { replaceState(JSON.parse(await f.text())); toast('Backup restored'); } catch { toast('That file could not be read'); }
  });
  main.querySelector('[data-act="reset"]').onclick = () => {
    if (confirm('Erase all progress and your plan on this device? This cannot be undone.')) { resetAll(); location.hash = '#/setup'; }
  };
  return main;
}

// ------------------------------------------------------------------ router
async function render() {
  stopMock();
  const route = location.hash.replace(/^#/, '') || '/';
  const [, a, b] = route.split('/');
  const s = getState();
  if (!s.profile && a !== 'setup' && a !== 'settings' && a !== 'internal') { location.hash = '#/setup'; return; }
  window.scrollTo(0, 0);
  if (a === 'setup') return viewSetup();
  if (a === 'today' || route === '/') return viewToday();
  if (a === 'roadmap') return viewRoadmap();
  if (a === 'item') { if (findItem(b)?.mock) { location.replace(`#/mock/${b}`); return; } return viewItem(b); }
  if (a === 'review') return viewReview();
  if (a === 'mocks') return viewMocks();
  if (a === 'mock') return viewMock(b);
  if (a === 'readiness') return viewReadiness();
  if (a === 'reference') return viewReference();
  if (a === 'internal') return viewInternal();
  if (a === 'settings') return viewSettings();
  location.hash = '#/today';
}

// Re-render for global changes (sign-in, restore), but never while a lesson is open or while typing,
// so learner code and answers are never wiped.
function softRender() {
  if (location.hash.startsWith('#/item') || location.hash.startsWith('#/mock/') || location.hash.startsWith('#/review')) return;
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  render();
}
subscribe(softRender);

// Study timer: counts seconds while a lesson page is open and visible.
setInterval(() => {
  if (document.visibilityState !== 'visible' || !getState().profile || !(location.hash.startsWith('#/item') || location.hash.startsWith('#/mock/') || location.hash.startsWith('#/review'))) return;
  update((s) => { const k = ymd(); s.log[k] = (s.log[k] || 0) + 10; }, { silent: true });
}, 10000);

initMomentum();
window.addEventListener('hashchange', render);
render();
initRemote().then(() => {
  if (linkError) { toast('That sign-in link expired or was already used. Send a new link and click it once.'); location.hash = '#/settings'; }
  softRender();
});
