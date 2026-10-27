// Local-first state with optional Supabase sync.
// Everything is saved in this browser immediately. When Supabase is configured
// and you are signed in, the same state is merged and synced to your account.
import { CONFIG } from './config.js';

const KEY = 'zta.v1';
const subs = new Set();
let state = load();
let client = null;
let session = null;
let pushTimer = null;
export let syncStatus = 'local'; // local | saving | saved | error

export const remoteEnabled = () => !!(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
export const getState = () => state;
export const getUser = () => session?.user || null;
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
const emit = () => subs.forEach((f) => f());

function blank() {
  return { v: 1, updatedAt: 0, profile: null, progress: {}, log: {}, notes: {}, mocks: [], review: {}, rv: 0 };
}
function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return blank(); }
}
function persist() { localStorage.setItem(KEY, JSON.stringify(state)); }

export function update(fn, { silent = false } = {}) {
  fn(state);
  state.updatedAt = Date.now();
  persist();
  schedulePush();
  if (typeof document !== 'undefined') document.dispatchEvent(new Event('zta:progress'));
  if (!silent) emit();
}

export function replaceState(next) {
  state = { ...blank(), ...next };
  persist();
  schedulePush();
  emit();
}

export function resetAll() {
  state = blank();
  try { localStorage.removeItem('zta.mockrun'); localStorage.removeItem('zta.mocklast'); } catch { /* storage unavailable */ }
  persist();
  schedulePush();
  emit();
}

/** Mark one part of an item (quiz / ex / manual) and recompute whether the item is done. */
export function setPart(item, part, value, required) {
  update((s) => {
    const p = (s.progress[item.id] ||= { parts: {}, missed: {}, tries: 0 });
    p.parts[part] = value;
    const wasDone = p.done;
    p.done = required.length ? required.every((k) => p.parts[k]) : !!p.parts.manual;
    if (p.done && !wasDone) p.at = Date.now();
    if (!p.done) delete p.at;
  }, { silent: true });
}

/** Review list: a missed multiple-choice question stays until it has been answered right twice. */
export function reviewMiss(key) {
  update((s) => {
    s.review ||= {};
    const e = s.review[key];
    const [id, q] = key.split('#');
    const base = e ? e.n : (q !== undefined ? (s.progress[id]?.missed?.[`q${q}`] || 0) : 0);
    s.review[key] = { n: base + 1, right: 0, at: Date.now() };
  }, { silent: true });
}
export function reviewRight(key, n = 1) {
  update((s) => {
    s.review ||= {};
    const e = s.review[key] || { n, right: 0 };
    s.review[key] = { n: e.n, right: e.right + 1, at: Date.now() };
    s.rv = (s.rv || 0) + 1;
  }, { silent: true });
}

export function noteMiss(itemId, key) {
  update((s) => {
    const p = (s.progress[itemId] ||= { parts: {}, missed: {}, tries: 0 });
    p.missed[key] = (p.missed[key] || 0) + 1;
  }, { silent: true });
}

/** Restore a backup file. It is merged with what is here, so a restore can never lose progress. */
export function restoreState(next) {
  if (!next || next.v !== 1 || typeof next.progress !== 'object' || next.progress === null) throw new Error('Not a backup file');
  state = merge(state, { ...blank(), ...next });
  persist();
  schedulePush();
  emit();
}

// ---------- merging (used when local and cloud copies differ) ----------
// Key-order-independent JSON, used to tell whether a merge actually changed anything.
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
const same = (x, y) => canon({ ...merge(x, x), updatedAt: 0 }) === canon({ ...merge(y, y), updatedAt: 0 });
const synced = () => { if (typeof document !== 'undefined') document.dispatchEvent(new Event('zta:synced')); };

function merge(a, b) {
  const out = blank();
  const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
  const older = newer === a ? b : a;
  out.profile = newer.profile || older.profile || null;
  out.notes = { ...(older.notes || {}), ...(newer.notes || {}) };
  const ids = new Set([...Object.keys(a.progress || {}), ...Object.keys(b.progress || {})]);
  ids.forEach((id) => {
    const x = a.progress?.[id], y = b.progress?.[id];
    if (!x || !y) { out.progress[id] = x || y; return; }
    const pick = (x.done ? 1 : 0) !== (y.done ? 1 : 0) ? (x.done ? x : y) : ((x.at || 0) >= (y.at || 0) ? x : y);
    const missed = { ...x.missed };
    Object.entries(y.missed || {}).forEach(([k, v]) => { missed[k] = Math.max(missed[k] || 0, v); });
    out.progress[id] = {
      ...pick, missed,
      parts: { ...(x.parts || {}), ...(y.parts || {}), ...(pick.parts || {}) },
      ...(x.q || y.q ? { q: { ...(x.q || {}), ...(y.q || {}) } } : {}),
      ...(x.cases || y.cases ? { cases: { ...(x.cases || {}), ...(y.cases || {}) } } : {}),
    };
  });
  const seen = new Set();
  out.mocks = [...(a.mocks || []), ...(b.mocks || [])].filter((m) => { const k = `${m.id}@${m.at}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => x.at - y.at);
  const rk = new Set([...Object.keys(a.review || {}), ...Object.keys(b.review || {})]);
  rk.forEach((k) => {
    const x = a.review?.[k], y = b.review?.[k];
    out.review[k] = !x ? y : !y ? x : ((x.at || 0) >= (y.at || 0) ? x : y);
  });
  out.rv = Math.max(a.rv || 0, b.rv || 0);
  const days = new Set([...Object.keys(a.log || {}), ...Object.keys(b.log || {})]);
  days.forEach((d) => { out.log[d] = Math.max(a.log?.[d] || 0, b.log?.[d] || 0); });
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}

// ---------- Supabase ----------
// After a sign-in link, Supabase returns tokens in the URL hash. Grab them before the router
// treats the hash as a page, then clean the address bar.
const authHash = (() => {
  const h = location.hash;
  if (h && !h.startsWith('#/') && /access_token=|error=|error_code=/.test(h)) {
    history.replaceState(null, '', location.pathname + location.search);
    return h.slice(1);
  }
  return '';
})();

export let linkError = false;

export async function initRemote() {
  if (!remoteEnabled()) return;
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { flowType: 'implicit', persistSession: true, detectSessionInUrl: false },
    });
    if (authHash) {
      const p = new URLSearchParams(authHash);
      if (p.get('access_token') && p.get('refresh_token')) {
        try {
          const { error } = await client.auth.setSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token') });
          if (error) linkError = true;
        } catch (e) { linkError = true; }
      } else linkError = true;
    }
    const { data } = await client.auth.getSession();
    session = data.session;
    client.auth.onAuthStateChange((_event, s) => {
      session = s;
      // Supabase re-announces the session whenever the tab becomes visible again. That is a good
      // moment to fetch progress made on another device; pull() stays quiet when nothing changed.
      setTimeout(async () => { if (s) await pull(); else { syncStatus = 'local'; emit(); } }, 0);
    });
    if (session) await pull();
    const params = new URL(location.href).searchParams;
    if (params.has('error') || params.has('error_code')) linkError = true;
    if (params.has('code') || linkError) {
      history.replaceState(null, '', location.pathname + location.hash);
    }
  } catch (e) {
    console.warn('Supabase unavailable, staying in local mode.', e);
    client = null;
  }
}

async function pull() {
  if (!client || !session) return;
  const { data, error } = await client.from('user_state').select('state').eq('user_id', session.user.id).maybeSingle();
  if (error) { syncStatus = 'error'; emit(); return; }
  const remote = data?.state || null;
  const merged = remote ? merge(state, remote) : state;
  const localChanged = !same(merged, state);
  if (localChanged) { state = merged; persist(); synced(); }
  if (!remote || !same(merged, remote)) await push({ merged: true });
  else if (syncStatus !== 'saved') { syncStatus = 'saved'; emit(); }
  if (localChanged) emit();
}

function schedulePush() {
  if (!client || !session) return;
  clearTimeout(pushTimer);
  syncStatus = 'saving';
  pushTimer = setTimeout(push, 1500);
}

async function push({ merged = false } = {}) {
  if (!client || !session) return;
  if (!merged) {
    // Merge the cloud copy in first, so progress saved from another device is never overwritten.
    const { data } = await client.from('user_state').select('state').eq('user_id', session.user.id).maybeSingle();
    if (data?.state) {
      const m = merge(state, data.state);
      if (!same(m, state)) { state = m; persist(); synced(); setTimeout(emit, 0); }
    }
  }
  const { error } = await client.from('user_state').upsert({
    user_id: session.user.id, state, updated_at: new Date().toISOString(),
  });
  syncStatus = error ? 'error' : 'saved';
  if (error) console.warn(error);
  emit();
}

export async function verifyCode(email, token) {
  if (!client) throw new Error('Supabase is not configured yet.');
  const { error } = await client.auth.verifyOtp({ email, token: String(token).replace(/\s+/g, ''), type: 'email' });
  if (error) throw error;
}

function friendly(error) {
  const msg = String(error?.message || error || '');
  if (error?.status === 429 || /rate limit|too many/i.test(msg)) return new Error('Too many sign-in emails were sent recently. Use your password instead, or wait an hour and try again.');
  if (/invalid login credentials/i.test(msg)) return new Error('That email and password do not match. If you have not set a password yet, use the email link once, then set one in Settings.');
  return error instanceof Error ? error : new Error(msg);
}

/** Password sign-in sends no email, so it never hits the email rate limit. */
export async function signInPassword(email, password) {
  if (!client) throw new Error('Supabase is not configured yet.');
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw friendly(error);
}
export async function setPassword(password) {
  if (!client || !session) throw new Error('Sign in first.');
  const { error } = await client.auth.updateUser({ password });
  if (error) throw friendly(error);
}

export async function signIn(email) {
  if (!client) throw new Error('Supabase is not configured yet.');
  const { error } = await client.auth.signInWithOtp({
    email, options: { emailRedirectTo: location.origin + location.pathname },
  });
  if (error) throw friendly(error);
}
export async function signOut() { if (client) await client.auth.signOut(); session = null; syncStatus = 'local'; emit(); }

/** Internal resources: only returned by the database to allow-listed, signed-in users. */
export async function fetchInternal() {
  if (!client || !session) return { rows: [], reason: 'signed-out' };
  const { data, error } = await client.from('internal_resources').select('*').order('sort', { ascending: true });
  if (error) return { rows: [], reason: 'error', error };
  if (data?.length) return { rows: data, reason: 'ok', allowed: true };
  const { data: allowed } = await client.rpc('is_allowed');
  return { rows: [], reason: 'empty', allowed: allowed === true };
}
