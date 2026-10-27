// Browser runners: Python (Pyodide in a worker) and SQL (sql.js).
import { DATASETS } from '../../content/sqldata.js';

// ---------------- Python ----------------
let worker = null;
let readyP = null;
let seq = 0;
const pending = new Map();

function startWorker() {
  worker = new Worker(new URL('./py-worker.js', import.meta.url));
  readyP = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') resolve();
      else if (m.type === 'fail') reject(new Error(m.message));
      else if (m.type === 'result') { pending.get(m.id)?.(m.result); pending.delete(m.id); }
    };
    worker.onerror = (e) => reject(new Error(e.message || 'Worker failed to load'));
  });
  // If Python fails to load (for example a dropped connection), forget the worker so the next run retries.
  readyP.catch(() => { worker?.terminate(); worker = null; });
}

// Phones replace straight quotes with curly ones as you type, which breaks code.
export const straightQuotes = (s) => String(s).replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/[\u2018\u2019\u201A\u2032]/g, "'");

export const pythonReady = () => { if (!worker) startWorker(); return readyP; };

export async function runPython(code, tests, timeoutMs = 4000 + 1500 * tests.length, mode = 'fn') {
  await pythonReady();
  code = straightQuotes(code);
  return new Promise((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null;
      resolve({ timeout: true, tests: [] });
    }, timeoutMs);
    pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
    worker.postMessage({ id, code, tests, mode });
  });
}

// ---------------- SQL ----------------
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let sqlP = null;

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

const toDate = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return Date.UTC(y, m - 1, d); };

/** Adds the handful of MySQL date functions learners practice, on top of SQLite. */
export function addMysqlFunctions(db) {
  db.create_function('YEAR', (d) => (d == null ? null : Number(String(d).slice(0, 4))));
  db.create_function('MONTH', (d) => (d == null ? null : Number(String(d).slice(5, 7))));
  db.create_function('DAY', (d) => (d == null ? null : Number(String(d).slice(8, 10))));
  db.create_function('CONCAT', (...a) => (a.some((x) => x == null) ? null : a.join('')));
  db.create_function('LEFT', (s, n) => (s == null ? null : String(s).slice(0, n)));
  db.create_function('RIGHT', (s, n) => (s == null ? null : n <= 0 ? '' : String(s).slice(-n)));
  db.create_function('CEIL', (x) => (x == null ? null : Math.ceil(x)));
  db.create_function('CEILING', (x) => (x == null ? null : Math.ceil(x)));
  db.create_function('FLOOR', (x) => (x == null ? null : Math.floor(x)));
  db.create_function('TRUNCATE', (x, d) => {
    if (x == null || d == null) return null;
    const f = 10 ** d;
    return Math.trunc(Number((x * f).toPrecision(15))) / f;
  });
  db.create_function('CHAR_LENGTH', (s) => (s == null ? null : [...String(s)].length));
  db.create_function('REGEXP', (pattern, s) => {
    if (pattern == null || s == null) return null;
    try { return new RegExp(pattern, 'i').test(String(s)) ? 1 : 0; } catch { return 0; }
  });
  db.create_function('DATEDIFF', (a, b) => (a == null || b == null ? null : Math.round((toDate(a) - toDate(b)) / 86400000)));
  db.create_function('DATE_FORMAT', (d, f) => {
    if (d == null) return null;
    const s = String(d);
    return String(f).replace(/%Y/g, s.slice(0, 4)).replace(/%m/g, s.slice(5, 7)).replace(/%d/g, s.slice(8, 10));
  });
}

export function loadSql() {
  if (!sqlP) {
    sqlP = (async () => {
      if (!window.initSqlJs) await loadScript(SQLJS + 'sql-wasm.js');
      return window.initSqlJs({ locateFile: (f) => SQLJS + f });
    })();
    sqlP.catch(() => { sqlP = null; });
  }
  return sqlP;
}

/** Runs a query on a fresh copy of the practice data (so nothing a learner types can break it).
 *  Returns { columns, values } of the last statement, or throws the database error. */
export async function runQuery(sql, data = 'sales') {
  const SQL = await loadSql();
  const db = new SQL.Database();
  try {
    db.exec(DATASETS[data].sql);
    addMysqlFunctions(db);
    const res = db.exec(straightQuotes(sql));
    return res.length ? res[res.length - 1] : { columns: [], values: [] };
  } finally {
    db.close();
  }
}
