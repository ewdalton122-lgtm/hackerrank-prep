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
  return { v: 1, updatedAt: 0, profile: null, progress: {}, log: {}, notes: {} };
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

export function noteMiss(itemId, key) {
  update((s) => {
    const p = (s.progress[itemId] ||= { parts: {}, missed: {}, tries: 0 });
    p.missed[key] = (p.missed[key] || 0) + 1;
  }, { silent: true });
}

// ---------- merging (used when local and cloud copies differ) ----------
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
    out.progress[id] = { ...pick, missed, parts: { ...(x.parts || {}), ...(y.parts || {}), ...(pick.parts || {}) } };
  });
  const days = new Set([...Object.keys(a.log || {}), ...Object.keys(b.log || {})]);
  days.forEach((d) => { out.log[d] = Math.max(a.log?.[d] || 0, b.log?.[d] || 0); });
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}

// ---------- Supabase ----------
export async function initRemote() {
  if (!remoteEnabled()) return;
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true },
    });
    const { data } = await client.auth.getSession();
    session = data.session;
    client.auth.onAuthStateChange((_event, s) => {
      session = s;
      setTimeout(async () => { if (s) await pull(); else { syncStatus = 'local'; emit(); } }, 0);
    });
    if (session) await pull();
    if (new URL(location.href).searchParams.has('code')) {
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
  state = data?.state ? merge(state, data.state) : state;
  persist();
  await push();
  emit();
}

function schedulePush() {
  if (!client || !session) return;
  clearTimeout(pushTimer);
  syncStatus = 'saving';
  pushTimer = setTimeout(push, 1500);
}

async function push() {
  if (!client || !session) return;
  const { error } = await client.from('user_state').upsert({
    user_id: session.user.id, state, updated_at: new Date().toISOString(),
  });
  syncStatus = error ? 'error' : 'saved';
  if (error) console.warn(error);
  emit();
}

export async function signIn(email) {
  if (!client) throw new Error('Supabase is not configured yet.');
  const { error } = await client.auth.signInWithOtp({
    email, options: { emailRedirectTo: location.origin + location.pathname },
  });
  if (error) throw error;
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
