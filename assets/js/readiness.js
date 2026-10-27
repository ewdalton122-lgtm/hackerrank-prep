// Readiness: a rough, honest picture of where you stand in each skill area.
// It is an estimate from your own practice (completion and first-try accuracy), not a prediction.
// Weights are the reported points for each section of the exam (about 170 in total), from candidates who have taken it.
// They are a planning model, not an official breakdown.
import { itemsFor, ROLES } from '../../content/curriculum.js';

export const SECTIONS = [
  { id: 'sql', name: 'SQL', weight: 50, stages: ['s2', 's3'], tip: 'Work the SQL drills until joins, grouping and window functions feel automatic.' },
  { id: 'pe', name: 'Prompt engineering', weight: 50, stages: ['s4'], tip: 'Rewrite the prompt until the output matches exactly, with no extra words.' },
  { id: 'code', name: 'Coding', weight: 50, stages: ['s1', 's6', 's8', 's9'], tip: 'Submit a simple version first, then keep going until every test case passes.' },
  { id: 'mcq', name: 'Multiple choice', weight: 16, stages: ['s0', 's5'], tip: 'Read why each wrong answer is wrong. That is where the points are.', skip: (i) => i.id.startsWith('sk-') },
  { id: 'written', name: 'Written reply', weight: 4, stages: ['s5'], tip: 'Use the five-part structure and re-read against the checklist.', only: (i) => i.id.startsWith('sk-') },
];

const misses = (p) => Object.values(p?.missed || {}).reduce((a, b) => a + b, 0);
const inSection = (sec, item) => sec.stages.includes(item.stage.id) && (!sec.skip || !sec.skip(item)) && (!sec.only || sec.only(item));

// Completing everything with many misses is worth less than finishing cleanly.
const ACCURACY_FLOOR = 0.65;

export function computeReadiness(state) {
  const role = state.profile?.role || 'ds';
  const items = itemsFor(role);
  const progress = state.progress || {};
  const done = (i) => !!progress[i.id]?.done;

  const sections = SECTIONS.map((sec) => {
    const its = items.filter((i) => inSection(sec, i));
    const totalMin = its.reduce((a, i) => a + i.minutes, 0);
    const doneMin = its.filter(done).reduce((a, i) => a + i.minutes, 0);
    const coverage = totalMin ? doneMin / totalMin : 0;
    const inter = its.filter((i) => i.quiz || i.exercise);
    const doneInter = inter.filter(done);
    const clean = doneInter.filter((i) => misses(progress[i.id]) === 0).length;
    const firstTry = doneInter.length ? clean / doneInter.length : null;
    const readiness = coverage * (firstTry === null ? 1 : ACCURACY_FLOOR + (1 - ACCURACY_FLOOR) * firstTry);
    const nextItem = its.find((i) => !done(i)) || null;
    return {
      ...sec, items: its.length, doneItems: its.filter(done).length, coverage, firstTry, readiness,
      misses: its.reduce((a, i) => a + misses(progress[i.id]), 0), nextItem,
      gap: sec.weight * (1 - readiness),
    };
  }).filter((s) => s.items > 0);

  const wsum = sections.reduce((a, s) => a + s.weight, 0);
  const overall = wsum ? sections.reduce((a, s) => a + s.weight * s.readiness, 0) / wsum : 0;
  const focus = [...sections].sort((a, b) => b.gap - a.gap)[0] || null;
  const doneCount = items.filter(done).length;

  const review = items
    .map((i) => ({ item: i, n: misses(progress[i.id]), done: done(i) }))
    .filter((x) => x.n >= 2)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((x) => ({ ...x, section: sections.find((s) => inSection(s, x.item))?.name || '' }));

  return {
    role, bar: ROLES[role].bar, overall, sections, focus, review,
    enoughData: doneCount >= 8, doneCount,
  };
}

export const pct = (x) => `${Math.round(x * 100)}%`;
