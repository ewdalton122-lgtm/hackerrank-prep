// Study planner: works backward from the exam date to a daily time target.
import { itemsFor } from '../../content/curriculum.js';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ymd = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Number of study days from `from` (inclusive) up to the exam date (exclusive). */
export function countStudyDays(from, examDate, studyDays) {
  const set = new Set(studyDays);
  let n = 0;
  for (let d = new Date(from); d < examDate; d = addDays(d, 1)) if (set.has(d.getDay())) n++;
  return n;
}

const bufferFor = (n) => Math.min(5, Math.floor(n * 0.1));

export function computePlan(state, now = new Date()) {
  const p = state.profile;
  if (!p) return null;
  const items = itemsFor(p.role).filter((i) => !(i.stage.optional || i.optional));
  const done = (i) => !!state.progress[i.id]?.done;
  const total = items.reduce((a, i) => a + i.minutes, 0);
  const remaining = items.filter((i) => !done(i)).reduce((a, i) => a + i.minutes, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exam = parseYmd(p.examDate);
  const start = parseYmd(p.startDate || ymd(today));

  const daysLeft = Math.max(0, Math.round((exam - today) / 86400000));
  const studyDaysLeft = countStudyDays(today, exam, p.studyDays);
  const buffer = bufferFor(studyDaysLeft);
  const usable = Math.max(1, studyDaysLeft - buffer);
  const perDay = remaining === 0 ? 0 : Math.ceil(remaining / usable);

  const startDays = Math.max(1, countStudyDays(start, exam, p.studyDays));
  const baseline = Math.ceil(total / Math.max(1, startDays - bufferFor(startDays)));

  const doneItems = items.filter(done).length;
  let status = 'on';
  if (remaining === 0) status = 'done';
  else if (daysLeft <= 0) status = 'past';
  else if (perDay > baseline * 1.15) status = 'behind';
  else if (perDay < baseline * 0.85) status = 'ahead';

  const studiedToday = Math.floor((state.log[ymd(today)] || 0) / 60);
  const isStudyDay = p.studyDays.includes(today.getDay());
  const needed = Math.max(20, perDay - studiedToday);
  const queue = [];
  let acc = 0;
  for (const it of items) {
    if (done(it)) continue;
    queue.push(it);
    acc += it.minutes;
    if (acc >= needed) break;
  }
  const nextItem = items.find((i) => !done(i)) || null;

  return {
    items, total, remaining, daysLeft, studyDaysLeft, buffer, perDay, baseline, status,
    doneItems, itemCount: items.length, studiedToday, isStudyDay, queue, nextItem,
    pct: total ? Math.round(((total - remaining) / total) * 100) : 0,
    tooHeavy: perDay > 180,
    streak: computeStreak(state, today),
  };
}

function computeStreak(state, today) {
  const p = state.profile;
  const set = new Set(p.studyDays);
  let streak = 0;
  for (let d = new Date(today), i = 0; i < 400; d = addDays(d, -1), i++) {
    const secs = state.log[ymd(d)] || 0;
    if (secs >= 600) streak++;
    else if (!set.has(d.getDay())) continue; // rest days never break a streak
    else if (i === 0) continue; // today is still in progress
    else break;
  }
  return streak;
}

export function lastSevenDays(state, now = new Date()) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(now, -i);
    out.push({ label: DAY_NAMES[d.getDay()], min: Math.round((state.log[ymd(d)] || 0) / 60), isStudy: state.profile?.studyDays.includes(d.getDay()) });
  }
  return out;
}

/** Preview used on the setup screen before anything is saved. */
export function previewPlan(role, examDateStr, studyDays, now = new Date()) {
  if (!examDateStr || !studyDays.length) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exam = parseYmd(examDateStr);
  const days = countStudyDays(today, exam, studyDays);
  const total = itemsFor(role).filter((i) => !(i.stage.optional || i.optional)).reduce((a, i) => a + i.minutes, 0);
  const usable = Math.max(1, days - bufferFor(days));
  return { total, days, perDay: Math.ceil(total / usable), weeks: Math.round((exam - today) / 604800000) };
}
