// Runs learner Python in a Web Worker so an infinite loop can be stopped safely.
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

const HARNESS = `
import sys, io, json, traceback

def _harness(code, tests_json):
    tests = json.loads(tests_json)
    res = {"error": None, "stdout": "", "tests": []}
    ns = {"__name__": "learner"}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    try:
        try:
            exec(compile(code, "<your code>", "exec"), ns)
        except SyntaxError as e:
            res["error"] = {"type": type(e).__name__, "msg": str(e.msg), "line": e.lineno, "text": (e.text or "").rstrip()}
            return json.dumps(res)
        except BaseException as e:
            line = None
            for fr in traceback.extract_tb(e.__traceback__):
                if fr.filename == "<your code>":
                    line = fr.lineno
            res["error"] = {"type": type(e).__name__, "msg": str(e), "line": line}
            return json.dumps(res)
        res["stdout"] = buf.getvalue()
        for t in tests:
            buf.truncate(0); buf.seek(0)
            entry = {"expr": t["expr"]}
            try:
                got = eval(t["expr"], ns)
                exp = eval(t["expected"], {})
                same_bool = isinstance(got, bool) == isinstance(exp, bool)
                entry["ok"] = bool(got == exp and same_bool)
                entry["got"] = repr(got)
                entry["expected"] = repr(exp)
            except BaseException as e:
                entry["ok"] = False
                entry["err"] = {"type": type(e).__name__, "msg": str(e)}
            entry["printed"] = buf.getvalue()
            res["tests"].append(entry)
        return json.dumps(res)
    finally:
        sys.stdout = old
`;

let py;
const ready = (async () => {
  try {
    py = await loadPyodide();
    py.runPython(HARNESS);
    postMessage({ type: 'ready' });
  } catch (err) {
    postMessage({ type: 'fail', message: String(err) });
  }
})();

onmessage = async (e) => {
  await ready;
  if (!py) return;
  const { id, code, tests } = e.data;
  try {
    const out = py.globals.get('_harness')(code, JSON.stringify(tests));
    postMessage({ type: 'result', id, result: JSON.parse(out) });
  } catch (err) {
    postMessage({ type: 'result', id, result: { error: { type: 'InternalError', msg: String(err) }, tests: [] } });
  }
};
