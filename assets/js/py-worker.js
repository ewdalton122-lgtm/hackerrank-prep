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

const HARNESS_IO = `
import sys, io, json, traceback

def _norm(s):
    s = s.replace("\\r\\n", "\\n").rstrip("\\n")
    return [l.rstrip() for l in s.split("\\n")] if s.strip() != "" else []

def _harness_io(code, tests_json):
    tests = json.loads(tests_json)
    res = {"error": None, "tests": []}
    try:
        compiled = compile(code, "<your code>", "exec")
    except SyntaxError as e:
        res["error"] = {"type": type(e).__name__, "msg": str(e.msg), "line": e.lineno, "text": (e.text or "").rstrip()}
        return json.dumps(res)
    for t in tests:
        entry = {"ok": False, "input": t["input"], "expected": t["expected"], "got": "", "err": None}
        old_in, old_out = sys.stdin, sys.stdout
        buf = io.StringIO()
        sys.stdin = io.StringIO(t["input"])
        sys.stdout = buf
        try:
            exec(compiled, {"__name__": "__main__"})
        except SystemExit:
            pass
        except BaseException as e:
            line = None
            for fr in traceback.extract_tb(e.__traceback__):
                if fr.filename == "<your code>":
                    line = fr.lineno
            entry["err"] = {"type": type(e).__name__, "msg": str(e), "line": line}
        finally:
            sys.stdin, sys.stdout = old_in, old_out
        entry["got"] = buf.getvalue()
        entry["ok"] = entry["err"] is None and _norm(entry["got"]) == _norm(t["expected"])
        res["tests"].append(entry)
    return json.dumps(res)
`;

let py;
const ready = (async () => {
  try {
    py = await loadPyodide();
    py.runPython(HARNESS);
    py.runPython(HARNESS_IO);
    postMessage({ type: 'ready' });
  } catch (err) {
    postMessage({ type: 'fail', message: String(err) });
  }
})();

onmessage = async (e) => {
  await ready;
  if (!py) return;
  const { id, code, tests, mode } = e.data;
  try {
    const out = py.globals.get(mode === 'io' ? '_harness_io' : '_harness')(code, JSON.stringify(tests));
    postMessage({ type: 'result', id, result: JSON.parse(out) });
  } catch (err) {
    postMessage({ type: 'result', id, result: { error: { type: 'InternalError', msg: String(err) }, tests: [] } });
  }
};
