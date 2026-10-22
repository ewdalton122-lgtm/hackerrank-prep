// Browser runners: Python (Pyodide in a worker) and SQL (sql.js).
import { DATASET } from '../../content/sql.js';

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
  readyP.catch(() => {});
}

export const pythonReady = () => { if (!worker) startWorker(); return readyP; };

export async function runPython(code, tests, timeoutMs = 6000) {
  await pythonReady();
  return new Promise((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null;
      resolve({ timeout: true, tests: [] });
    }, timeoutMs);
    pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
    worker.postMessage({ id, code, tests });
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
  }
  return sqlP;
}

/** Runs a query on a fresh copy of the practice data (so nothing a learner types can break it).
 *  Returns { columns, values } of the last statement, or throws the database error. */
export async function runQuery(sql) {
  const SQL = await loadSql();
  const db = new SQL.Database();
  try {
    db.exec(DATASET);
    addMysqlFunctions(db);
    const res = db.exec(sql);
    return res.length ? res[res.length - 1] : { columns: [], values: [] };
  } finally {
    db.close();
  }
}
