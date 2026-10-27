// Progress, motivation and rewards: the big progress banner, XP and levels, and the celebrations.
// Everything here is derived from saved progress, so nothing extra needs to sync.
import { STAGES, itemsFor, findItem } from '../../content/curriculum.js';
import { computePlan, ymd } from './planner.js';
import { getState, subscribe } from './store.js';
import { esc, fmtMin } from './ui.js';
import { confetti, xpPop, xpGain, celebrate } from './fx.js';

// What you can actually do once each stage is finished. Plain statements, no inflated claims.
const CAN = {
  s0: ['You know the rules of the game', 'how the assessment is scored and where the points are.'],
  s1: ['You can read and write short Python programs', 'variables, decisions, loops, text, dictionaries and functions. Roughly the level of someone who has finished an introductory programming module.'],
  s2: ['You can pull answers out of a database', 'filtering, joining several tables, grouping and handling NULLs. This is the SQL most business analysts use every day.'],
  s3: ['Your SQL now goes beyond most analysts', 'rankings, running totals, previous-row comparisons and date logic using window functions.'],
  s4: ['You can make an AI return an exact, checkable answer', 'a skill most professionals have never practised on purpose.'],
  s5: ['You can reason about system trade-offs', 'and write structured replies to stakeholders, which covers the multiple-choice and written sections.'],
  s6: ['You can solve exam-style coding problems end to end', 'read the input, build the answer, print it, and handle the edge cases.'],
  s7: ['You have held your accuracy under the clock', 'you are ready to book the real assessment.'],
  s8: ['You can reason about efficiency', 'arrays, hash maps, sorting, binary search and Big-O.'],
  s9: ['You can solve sort-then-choose problems', 'greedy choices and priority queues.'],
};

const HEAD = [
  [0, 'Day one. Every expert started exactly here.'],
  [8, 'You are moving. The first steps are the hardest.'],
  [20, 'Momentum is building.'],
  [35, 'A solid foundation is in place.'],
  [50, 'Congratulations, you are halfway there.'],
  [65, 'More than halfway. The finish line is in sight.'],
  [80, 'The home stretch.'],
  [92, 'Almost there. Time to prove it under the clock.'],
  [100, 'Path complete. You did the work.'],
];
const headline = (pct) => [...HEAD].reverse().find(([at]) => pct >= at)[1];

const MILESTONES = [
  [10, 'Ten percent done', 'You have started, and that is where most people stop. You are already ahead of them.'],
  [25, 'A quarter of the way', 'The path is real now. What you have learned so far is not going anywhere.'],
  [50, 'Halfway there. Congratulations.', 'The hardest stretch, building the habit, is behind you.'],
  [75, 'Three quarters done', 'Most of the new material is finished. From here it is about sharpening and speed.'],
  [90, 'The final stretch', 'Almost everything is learned. Now prove it under timed conditions.'],
  [100, 'Path complete', 'Every required lesson is done. Keep taking mocks until two in a row clear the bar comfortably.'],
];

// ---------------------------------------------------------------- XP and levels
// Monotonic and derived, so it can never go down and never needs syncing.
export function xpOf(s) {
  let xp = 0;
  for (const it of itemsFor(s.profile.role)) {
    const p = s.progress[it.id];
    if (p?.done) xp += it.minutes * 2;
    xp += Object.values(p?.q || {}).filter(Boolean).length * 5;
  }
  for (const m of s.mocks || []) xp += m.id === 'mock-sprint' ? 40 : 150;
  xp += (s.rv || 0) * 3;
  return Math.round(xp);
}
const thr = (level) => 50 * level * (level - 1);
export function levelOf(xp) {
  let level = 1;
  while (xp >= thr(level + 1)) level++;
  return { level, into: xp - thr(level), span: thr(level + 1) - thr(level), toNext: thr(level + 1) - xp };
}

// ---------------------------------------------------------------- derived path info
function pathInfo(s) {
  const role = s.profile.role;
  const stages = STAGES.filter((st) => st.roles.includes(role) && !st.optional);
  const rows = stages.map((st) => {
    const req = st.items.filter((i) => !i.optional);
    const done = req.filter((i) => s.progress[i.id]?.done).length;
    return { st, done, total: req.length, complete: req.length > 0 && done === req.length };
  });
  let k = 0;
  while (k < rows.length && rows[k].complete) k++;
  return { rows, lastDone: k > 0 ? rows[k - 1] : null, current: rows[k] || null };
}

function skillNote(info) {
  if (!info.lastDone) return 'You are at the starting line. This path assumes zero experience, so nobody here is behind.';
  const [a, b] = CAN[info.lastDone.st.id] || ['You are making real progress', 'keep going.'];
  return `${a}: ${b}`;
}

const flame = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3.2 2-4.2.2 1.4.9 2.2 1.7 2.7C10.3 7.5 10.5 4.5 12 2z" fill="currentColor"/></svg>';

function ring(minutes, goal, size = 44) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const f = Math.min(1, goal ? minutes / goal : 0);
  return `<svg class="ring ${f >= 1 ? 'full' : ''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${minutes} of ${goal} minutes today"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="rb"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="rf" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}

let shownPct = 0; // where the bar was last painted, so it glides rather than jumps

function barHtml(pct) {
  return `<div class="hbar" style="--p:${shownPct}" data-p="${pct}">
    <i class="fill"></i>
    ${[25, 50, 75, 100].map((t) => `<span class="tick ${t === 100 ? 'end' : ''} ${pct >= t ? 'hit' : ''}" style="left:${t}%"><em>${t === 100 ? 'Ready' : t + '%'}</em></span>`).join('')}
    <span class="you"></span></div>`;
}

export function heroHtml(s, kind = 'full', opts = {}) {
  const plan = computePlan(s);
  const xp = xpOf(s);
  const lv = levelOf(xp);
  const info = pathInfo(s);
  const goal = plan.perDay || 30;
  const nextMs = MILESTONES.find(([at]) => at > plan.pct);
  const doneMin = plan.total - plan.remaining;
  const toMs = nextMs ? Math.max(1, Math.ceil((nextMs[0] / 100) * plan.total - doneMin)) : 0;
  const streakCls = plan.streak > 0 ? 'on' : '';
  const sig = [plan.pct, xp, plan.studiedToday, plan.streak].join('|');

  if (kind === 'slim') {
    return `<div class="hslim" data-hero="slim" data-sig="${sig}">
      <a class="hs-pct" href="#/today" title="Back to your journey">${plan.pct}%</a>
      ${barHtml(plan.pct)}
      <span class="hs-chip" title="${xp.toLocaleString()} XP">Level ${lv.level}</span>
      <span class="hs-chip flame ${streakCls}" title="Study-day streak">${flame}${plan.streak}</span>
      ${ring(plan.studiedToday, goal, 30)}
    </div>`;
  }

  const stageLeft = info.current ? info.current.total - info.current.done : 0;
  return `<section class="hero" data-hero="full" data-sig="${sig}"${opts.eyebrow ? ` data-eyebrow="${esc(opts.eyebrow)}"` : ''}>
    <div class="hero-top">
      <div class="hero-copy">
        <div class="eyebrow">${esc(opts.eyebrow || 'Your journey to the assessment')}</div>
        <h1 class="hero-h">${esc(headline(plan.pct))}</h1>
        <p class="hero-sub">${esc(skillNote(info))}</p>
      </div>
      <div class="hero-pct" aria-label="${plan.pct} percent complete"><b>${plan.pct}</b><span>%</span></div>
    </div>
    ${barHtml(plan.pct)}
    <div class="hero-chips">
      <div class="hc"><div class="hc-t">Level ${lv.level}</div><div class="xpbar"><i style="width:${Math.round((lv.into / lv.span) * 100)}%"></i></div><div class="hc-s">${xp.toLocaleString()} XP &middot; ${lv.toNext} to Level ${lv.level + 1}</div></div>
      <div class="hc flame ${streakCls}"><div class="hc-t">${flame}${plan.streak} day${plan.streak === 1 ? '' : 's'}</div><div class="hc-s">${plan.streak ? 'study streak. Keep it alive.' : 'Study 10 minutes to start a streak.'}</div></div>
      <div class="hc ringc">${ring(plan.studiedToday, goal)}<div><div class="hc-t">${plan.studiedToday} / ${goal} min</div><div class="hc-s">${plan.studiedToday >= goal ? 'Daily goal reached' : 'today\'s goal'}</div></div></div>
      <div class="hc"><div class="hc-t">${nextMs ? `Next: ${nextMs[0]}%` : 'Finish line'}</div><div class="hc-s">${nextMs ? `about ${fmtMin(toMs)} of study away` : 'Keep mocking until you clear the bar twice.'}</div></div>
    </div>
    ${plan.nextItem ? `<div class="hero-next"><div><div class="hc-s">Next up${info.current ? ` &middot; ${stageLeft} item${stageLeft === 1 ? '' : 's'} left in Stage ${info.current.st.num}` : ''}</div><div class="hn-t">${esc(plan.nextItem.title)}</div></div><a class="btn go" href="#/item/${plan.nextItem.id}">${plan.doneItems ? 'Continue' : 'Start'} &rarr;</a></div>` : ''}
  </section>`;
}

/** Glide the bars to their real position. Call after the page HTML is in the DOM. */
export function paintHeroes() {
  const bars = [...document.querySelectorAll('.hbar')];
  if (!bars.length) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bars.forEach((b) => b.style.setProperty('--p', b.dataset.p));
    shownPct = Number(bars[0].dataset.p);
  }));
}

function refreshHeroes() {
  const s = getState();
  if (!s.profile) return;
  document.querySelectorAll('[data-hero]').forEach((el) => {
    const kind = el.dataset.hero;
    const html = heroHtml(s, kind, { eyebrow: el.dataset.eyebrow });
    const next = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild;
    if (next.dataset.sig === el.dataset.sig) return;
    el.replaceWith(next);
  });
  paintHeroes();
}

// ---------------------------------------------------------------- rewards
let prev = null;
let timer = null;

function snap(s) {
  const plan = computePlan(s);
  const xp = xpOf(s);
  const info = pathInfo(s);
  return {
    pct: plan.pct, xp, level: levelOf(xp).level,
    done: new Set(Object.entries(s.progress).filter(([, p]) => p.done).map(([id]) => id)),
    stages: new Set(info.rows.filter((r) => r.complete).map((r) => r.st.id)),
    studied: plan.studiedToday, goal: plan.perDay, day: ymd(), info,
  };
}

function check() {
  timer = null;
  const s = getState();
  if (!s.profile) { prev = null; return; }
  const cur = snap(s);
  const before = prev;
  prev = cur;
  refreshHeroes();
  if (!before || before.day !== cur.day) return;

  const newlyDone = [...cur.done].filter((id) => !before.done.has(id));
  // A restore, a reset or a sync from another device changes lots at once. Update quietly in that case.
  if (newlyDone.length > 3 || cur.pct < before.pct || cur.xp < before.xp) return;

  const gain = cur.xp - before.xp;
  const stageDone = [...cur.stages].find((id) => !before.stages.has(id));
  const crossed = MILESTONES.filter(([at]) => before.pct < at && cur.pct >= at).pop();
  const goalHit = before.goal > 0 && before.studied < before.goal && cur.studied >= cur.goal && cur.goal > 0;

  if (stageDone !== undefined || crossed) {
    const [a, b] = CAN[stageDone] || [];
    const stage = STAGES.find((st) => st.id === stageDone);
    celebrate({
      kicker: stage ? `Stage ${stage.num} complete` : `${cur.pct}% of the path`,
      title: crossed ? crossed[1] : `${stage.title.replace(/ \(.*\)/, '')} done`,
      body: crossed ? crossed[2] : '',
      note: stage ? `${a}: ${b}` : skillNote(cur.info),
      cta: cur.info.current ? `On to Stage ${cur.info.current.st.num}` : 'Keep going',
    });
    xpPop(`+${gain} XP`, 'big');
    return;
  }
  if (newlyDone.length) {
    const it = findItem(newlyDone[newlyDone.length - 1]);
    confetti(70);
    xpPop(`${it && it.mock ? 'Mock complete' : 'Lesson complete'}  +${gain} XP`, 'big');
  } else if (gain > 0) {
    xpGain(gain);
  }
  if (cur.level > before.level) setTimeout(() => xpPop(`Level ${cur.level}!`, 'level'), 500);
  if (goalHit) setTimeout(() => { confetti(60); xpPop('Daily goal reached', 'big'); }, 700);
}

function schedule() {
  if (!timer) timer = setTimeout(check, 60);
}

export function initMomentum() {
  const s = getState();
  prev = s.profile ? snap(s) : null;
  document.addEventListener('zta:progress', schedule);
  subscribe(schedule);
}
