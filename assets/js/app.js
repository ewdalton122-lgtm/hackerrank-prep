import { getState, update, subscribe, initRemote, remoteEnabled, getUser, signIn, signOut, fetchInternal, setPart, replaceState, resetAll, syncStatus } from './store.js';
import { STAGES, ROLES, itemsFor, findItem, requiredParts } from '../../content/curriculum.js';
import { computePlan, previewPlan, lastSevenDays, ymd, parseYmd, DAY_NAMES } from './planner.js';
import { esc, inline, fmtMin, toast, renderBlocks, feedback } from './ui.js';
import { mountQuiz, mountPython, mountSql, mountPrompt, mountWritten } from './components.js';

const app = document.getElementById('app');
const NAV = [
  ['#/today', 'Today', 'M4 12l8-8 8 8M6 10v9h12v-9'],
  ['#/roadmap', 'Roadmap', 'M4 6h16M4 12h16M4 18h10'],
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
        <nav class="nav">${NAV.map(([h, l, d]) => `<a href="${h}" class="${active === h ? 'active' : ''}">${icon(d)}<span>${l}</span></a>`).join('')}</nav>
        <div class="foot">
          ${plan ? `<b>${plan.pct}% complete</b><div class="bar"><i style="width:${plan.pct}%"></i></div><div>${ROLES[s.profile.role].name}</div>` : '<b>Welcome</b>'}
          <div style="margin-top:6px;opacity:.8">${esc(user?.email || '')}</div>
          <div style="opacity:.7">${syncText}</div>
        </div>
      </aside>
      <main class="main" id="main">${inner}</main>
    </div>`;
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
            ? `${r.bar}% pass mark. Focus: SQL, prompt engineering, system design and stakeholder skills, plus enough Python to bank the easy coding points.`
            : `${r.bar}% pass mark. Adds the Patterns and Greedy/Heaps stages for harder coding questions.`}</small></span></label>`).join('')}
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
  const bars = lastSevenDays(s);
  const maxBar = Math.max(30, ...bars.map((b) => b.min));
  const main = shell(`
    <div class="pagehead">
      <h1>${greet}</h1>
      <p>${ROLES[s.profile.role].name} track. Exam on ${fmtDate(s.profile.examDate)}.</p>
    </div>
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="stat"><div class="n">${plan.daysLeft}</div><div class="l">days to your exam</div></div>
      <div class="stat"><div class="n">${plan.perDay}<span style="font-size:1rem"> min</span></div><div class="l">target per study day</div></div>
      <div class="stat"><div class="n">${plan.studiedToday}<span style="font-size:1rem"> min</span></div><div class="l">studied today</div></div>
      <div class="stat"><div class="n">${plan.streak}</div><div class="l">study-day streak</div></div>
    </div>
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
      </div>
    </div>`, '#/today');
  return main;
}

function itemKind(it) {
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
      return `<div class="card"><div class="stagehead"><h2>Stage ${st.num}: ${esc(st.title)}</h2><span class="muted small">${done}/${st.items.length} done &middot; ${fmtMin(mins)}</span></div>
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
  return `<div class="card"><h2>${title}</h2><p class="muted">Enter your email and I'll send a sign-in link. No password needed.</p>
    <div class="row"><input type="email" id="email" placeholder="you@example.com" style="max-width:320px;margin:0"><button class="btn primary" data-act="signin">Send link</button></div><div id="signinMsg" style="margin-top:12px"></div></div>`;
}
function bindSignIn() {
  document.querySelector('[data-act="signin"]')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('signinMsg');
    if (!/^\S+@\S+\.\S+$/.test(email)) { msg.innerHTML = feedback('hint', 'Enter a valid email address.'); return; }
    msg.innerHTML = '<span class="spinner"></span>Sending...';
    try { await signIn(email); msg.innerHTML = feedback('ok', 'Check your email.', ['Open the link on this device to finish signing in.']); }
    catch (e) { msg.innerHTML = feedback('bad', 'Could not send the link.', [String(e.message || e)]); }
  });
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
        : user ? `<p>Signed in as <b>${esc(user.email)}</b>. Progress syncs automatically.</p><button class="btn" data-act="signout">Sign out</button>`
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
  const route = location.hash.replace(/^#/, '') || '/';
  const [, a, b] = route.split('/');
  const s = getState();
  if (!s.profile && a !== 'setup' && a !== 'settings' && a !== 'internal') { location.hash = '#/setup'; return; }
  window.scrollTo(0, 0);
  if (a === 'setup') return viewSetup();
  if (a === 'today' || route === '/') return viewToday();
  if (a === 'roadmap') return viewRoadmap();
  if (a === 'item') return viewItem(b);
  if (a === 'internal') return viewInternal();
  if (a === 'settings') return viewSettings();
  location.hash = '#/today';
}

// Re-render for global changes (sign-in, restore), but never while a lesson is open or while typing,
// so learner code and answers are never wiped.
function softRender() {
  if (location.hash.startsWith('#/item')) return;
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  render();
}
subscribe(softRender);

// Study timer: counts seconds while a lesson page is open and visible.
setInterval(() => {
  if (document.visibilityState !== 'visible' || !getState().profile || !location.hash.startsWith('#/item')) return;
  update((s) => { const k = ymd(); s.log[k] = (s.log[k] || 0) + 10; }, { silent: true });
}, 10000);

window.addEventListener('hashchange', render);
render();
initRemote().then(softRender);
