// Turns raw failures into plain-English direction. Pure functions (no DOM) so they can be tested.

// ---------------- Python ----------------
export function explainPyError(err, fn = '') {
  const { type, msg = '', line, text } = err;
  const where = line ? ` (line ${line})` : '';
  const snippet = text ? ` Python is pointing at: \`${text.trim()}\`.` : '';
  const steps = [];
  let lead = `${type}${where}: ${msg}`;

  if (type === 'IndentationError' || /expected an indented block/.test(msg)) {
    lead = `Python needs an indented block${where}.`;
    steps.push('After a line that ends in `:` (def, if, for, while), the next lines must be indented by 4 spaces.');
    steps.push('If you wrote `pass` or a comment only, add a real line of code there.');
  } else if (/unexpected indent/.test(msg)) {
    lead = `This line is indented too far${where}.`;
    steps.push('A line should only be indented more than the one above it if that line ended with a colon.');
  } else if (type === 'SyntaxError' || type === 'TabError') {
    if (/expected ':'/.test(msg)) {
      lead = `A colon is missing${where}.${snippet}`;
      steps.push('Lines starting with `def`, `if`, `elif`, `else`, `for` and `while` must end with `:`.');
    } else if (/unterminated string|EOL while/.test(msg)) {
      lead = `A quote was opened but not closed${where}.${snippet}`;
      steps.push('Every opening `"` or `\'` needs a matching closing one on the same line.');
    } else if (/never closed|unmatched|was never closed/.test(msg)) {
      lead = `A bracket is not matched${where}.${snippet}`;
      steps.push('Count your `(` `[` `{` and make sure each has a matching closer.');
      steps.push('Also check the line above: the real mistake is often there.');
    } else if (/Missing parentheses in call to 'print'/.test(msg)) {
      lead = `print needs parentheses${where}.`;
      steps.push('Write `print(value)`, not `print value`.');
    } else if (/cannot assign|invalid syntax. Maybe you meant '=='/.test(msg)) {
      lead = `Use \`==\` to compare, \`=\` to assign${where}.${snippet}`;
      steps.push('Inside an `if`, write `if x == 5:` not `if x = 5:`.');
    } else {
      lead = `Python could not read your code${where}: ${msg}.${snippet}`;
      steps.push('Look at that line and the one above it for a missing colon, bracket or quote.');
      steps.push('Check that you did not use a reserved word (like `return` outside a function).');
    }
  } else if (type === 'EOFError') {
    lead = `Your program asked for more input than the test provides${where}.`;
    steps.push('Each `input()` reads one line. Count how many lines the sample input has and how many times you call `input()`.');
    steps.push('If a line holds several numbers, read it once with `input().split()` instead of calling `input()` for each number.');
  } else if (type === 'ValueError' && /invalid literal for int|could not convert/.test(msg)) {
    lead = `Python could not turn that text into a number${where}.`;
    steps.push('A line like `3 5 8` is one piece of text. Split it first: `input().split()`, then convert each piece with `int(...)`.');
    steps.push('Calling `int(input())` on a line with several numbers fails. Use `list(map(int, input().split()))`.');
  } else if (type === 'NameError') {
    const m = msg.match(/name '([^']+)' is not defined/);
    const name = m?.[1];
    if (name && fn && name === fn) {
      lead = `Your code needs to define a function named \`${fn}\`.`;
      steps.push(`Check the spelling and that the first line is \`def ${fn}(...):\`.`);
    } else {
      lead = `Python does not know the name \`${name || '?'}\`${where}.`;
      steps.push('Check for a typo: capital letters count (`Total` is not `total`).');
      steps.push('Make sure you create the variable before you use it.');
      steps.push('If it should be text, put it in quotes.');
    }
  } else if (type === 'TypeError') {
    if (/can only concatenate|unsupported operand/.test(msg)) {
      lead = `You are mixing text and numbers${where}.`;
      steps.push('Convert with `int(...)`, `float(...)` or `str(...)` so both sides match.');
    } else if (/positional argument/.test(msg)) {
      lead = `The function is called with the wrong number of inputs${where}.`;
      steps.push('Compare the parameters in your `def` line with the example call in the instructions.');
    } else if (/NoneType/.test(msg)) {
      lead = `Something is \`None\` where a value was expected${where}.`;
      steps.push('A function with no `return` gives back `None`. Make sure every path returns a value.');
    } else if (/not subscriptable|not iterable/.test(msg)) {
      lead = `You are indexing or looping over something that is not a list or text${where}.`;
      steps.push('Print the variable (or use Python Tutor) to see what type it really is.');
    } else {
      steps.push('Read the message: it names the two types that clash.');
    }
  } else if (type === 'IndexError') {
    lead = `You asked for a position that does not exist${where}.`;
    steps.push('Lists start at 0 and the last valid index is `len(list) - 1`.');
    steps.push('If the list can be empty, check `if not items:` first.');
  } else if (type === 'KeyError') {
    lead = `That key is not in the dictionary yet${where}.`;
    steps.push('Use `d.get(key, 0)` for a safe lookup, or check `if key in d:` first.');
  } else if (type === 'ZeroDivisionError') {
    lead = `You divided by zero${where}.`;
    steps.push('This often happens with an empty list: `len([])` is 0. Handle that case before dividing.');
  } else if (type === 'AttributeError') {
    lead = `That value does not have that method${where}: ${msg}.`;
    steps.push('Check the spelling, and whether the variable is the type you think (list vs text vs number).');
  } else if (type === 'ValueError') {
    steps.push('A conversion failed, for example `int("abc")`. Check what the text really contains.');
  } else if (type === 'RecursionError') {
    lead = 'A function kept calling itself without stopping.';
    steps.push('Make sure there is a stopping condition.');
  } else {
    steps.push('Read the message above and check the line number.');
  }
  return { lead, steps };
}

export function diagnosePyTest(entry, ctx = {}) {
  const steps = [];
  let lead = 'The result does not match.';
  const { got, expected, printed } = entry;
  const asNum = (s) => (s !== undefined && s.trim() !== '' && !Number.isNaN(Number(s)) ? Number(s) : null);
  const isStr = (s) => /^['"]/.test(s || '');

  const squash = (s) => (s || '').replace(/\s+/g, '');
  if (got !== 'None' && got !== expected && squash(got) === squash(expected) && /['"]/.test(expected || '')) {
    lead = 'The right characters, but the spaces are off.';
    steps.push('Graders compare text exactly, including every space. Compare each line with the expected one, character by character.');
    steps.push('Building a row? Check how many spaces come before the first character, e.g. `" " * (n - i)`.');
  } else if (got === 'None' && expected !== 'None') {
    if (printed && printed.trim()) {
      lead = 'Your function printed a value but did not return it.';
      steps.push('The grader reads what your function returns, not what it prints.');
      steps.push('Replace `print(...)` with `return ...`.');
    } else {
      lead = 'Your function returned nothing (`None`).';
      steps.push('Add a `return` statement with the answer.');
      steps.push('If your `return` is inside an `if`, make sure every path returns something.');
    }
  } else if (isStr(got) && asNum(expected) !== null) {
    lead = 'You returned text, but a number was expected.';
    steps.push('Convert it with `int(...)` or `float(...)`, or avoid building the result as text.');
  } else if (asNum(got) !== null && isStr(expected)) {
    lead = 'You returned a number, but text was expected.';
    steps.push('Convert with `str(...)`.');
  } else if (isStr(got) && isStr(expected)) {
    const strip = (s) => s.slice(1, -1);
    if (strip(got).trim() === strip(expected).trim()) {
      lead = 'Right text, but with extra spaces.';
      steps.push('Use `.strip()` to remove spaces at the ends. Graders compare exact text.');
    } else if (strip(got).toLowerCase() === strip(expected).toLowerCase()) {
      lead = 'Right letters, wrong capitalisation.';
      steps.push('Check `.upper()`, `.lower()` or `.title()`. Case must match exactly.');
    }
  } else if (got?.startsWith('[') && expected?.startsWith('[')) {
    const norm = (s) => s.slice(1, -1).split(',').map((x) => x.trim()).sort().join('|');
    if (norm(got) === norm(expected)) {
      lead = 'Right items, wrong order.';
      steps.push('Check whether the problem wants sorted order or the original order.');
    }
  } else if (asNum(got) !== null && asNum(expected) !== null) {
    const diff = Math.abs(asNum(got) - asNum(expected));
    if (diff <= 1) {
      lead = 'Very close, off by a small amount.';
      steps.push('Check rounding (`round(x, 2)`), and look for an off-by-one in a loop or a `>` that should be `>=`.');
    }
  }
  if (!steps.length && ctx.hint) steps.push(ctx.hint);
  if (!steps.length) steps.push('Work through this example by hand, then compare with what your code does line by line. Python Tutor can show it.');
  return { lead, steps };
}

// ---------------- SQL ----------------
export function explainSqlError(message) {
  const m = String(message);
  const steps = [];
  let lead = m;
  let x;
  if ((x = m.match(/no such column: (.+)/))) {
    lead = `There is no column called \`${x[1]}\`.`;
    steps.push('Open "Tables in this practice set" and compare the spelling.');
    steps.push('If you joined tables, make sure you wrote which table it comes from (for example `d.amount`).');
    steps.push("Text values need single quotes: `'Retail'`, not `Retail`.");
  } else if ((x = m.match(/no such table: (.+)/))) {
    lead = `There is no table called \`${x[1]}\`.`;
    steps.push('The tables here are `accounts`, `reps` and `deals`.');
  } else if (/ambiguous column name/.test(m)) {
    lead = 'A column name exists in more than one table.';
    steps.push('Put the table alias in front of it, like `a.id` or `d.id`.');
  } else if (/misuse of aggregate|aggregate functions are not allowed/.test(m)) {
    lead = 'An aggregate (SUM, COUNT...) is used where it is not allowed.';
    steps.push('Aggregates cannot go in `WHERE`. Filter groups with `HAVING` instead.');
  } else if (/syntax error/.test(m) || /incomplete input/.test(m)) {
    lead = 'SQL could not read the query.';
    const near = m.match(/near "([^"]+)"/);
    if (near) steps.push(`Look at the text just before \`${near[1]}\`.`);
    steps.push('Common causes: a trailing comma before `FROM`, a missing comma between columns, or an unclosed quote or bracket.');
    steps.push('The clause order is SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY.');
  } else if (/no such function/.test(m)) {
    lead = 'That function does not exist in this practice database.';
    steps.push('Check the spelling. Available date helpers here: YEAR, MONTH, DAY, DATEDIFF, DATE_FORMAT.');
  } else if (/unrecognized token/.test(m)) {
    lead = 'There is a character SQL does not understand.';
    steps.push('Check for a smart quote pasted from a document; use plain single quotes `\'`.');
  }
  return { lead, steps };
}

const norm = (v) => (typeof v === 'number' ? v : v === null ? null : String(v));
const rowKey = (r) => JSON.stringify(r.map(norm));

/** Compares a learner's result to the expected result and explains the first problem found. */
export function compareSql(got, expected, { ordered = false } = {}) {
  const steps = [];
  if (!got || got.columns.length === 0) {
    return { ok: false, lead: 'Your query did not return a result table.', steps: ['Start with `SELECT`. A query that only creates or changes data returns nothing to check.'] };
  }
  if (got.columns.length !== expected.columns.length) {
    return {
      ok: false,
      lead: `The answer needs ${expected.columns.length} column${expected.columns.length > 1 ? 's' : ''}, but your query returns ${got.columns.length}.`,
      steps: [`Expected column${expected.columns.length > 1 ? 's' : ''} like: ${expected.columns.map((c) => '`' + c + '`').join(', ')}.`, 'Re-read the task and check which columns it asks for, and in what order.'],
    };
  }
  if (got.values.length !== expected.values.length) {
    const more = got.values.length > expected.values.length;
    return {
      ok: false,
      lead: `Expected ${expected.values.length} row${expected.values.length === 1 ? '' : 's'}, but your query returns ${got.values.length}.`,
      steps: more
        ? ['You are returning too many rows. Is a filter missing in `WHERE`? Are JOIN matches creating duplicates (try `COUNT(DISTINCT ...)` or `DISTINCT`)?', 'Did you forget `GROUP BY` or `HAVING`?']
        : ['You are dropping rows. A condition may be too strict (`>` vs `>=`), or a `JOIN` should be a `LEFT JOIN` to keep unmatched rows.'],
    };
  }
  const gotKeys = got.values.map(rowKey);
  const expKeys = expected.values.map(rowKey);
  const sameSet = [...gotKeys].sort().join('\n') === [...expKeys].sort().join('\n');
  if (!sameSet) {
    const i = gotKeys.findIndex((k, idx) => !expKeys.includes(k) || idx < 0);
    const bad = i >= 0 ? got.values[i] : got.values[0];
    const sorted = (rows) => rows.map((r) => r.map(String).sort().join('|')).sort().join('\n');
    if (sorted(got.values) === sorted(expected.values)) {
      return {
        ok: false,
        lead: 'The right values, but the columns are in a different order.',
        steps: [`Expected column order: ${expected.columns.map((c) => '`' + c + '`').join(', ')}.`, 'Reorder the columns in your `SELECT` to match the task.'],
      };
    }
    const hasNull = bad.some((v) => v === null);
    const steps = [`For example your query returns the row (${bad.map((v) => (v === null ? 'NULL' : v)).join(', ')}), which is not in the expected answer.`];
    if (hasNull) steps.push('A `NULL` appeared. Blank values turn math into NULL. Replace them with `COALESCE(column, 0)`, or filter them with `IS NULL` / `IS NOT NULL`.');
    const close = expected.values.some((e) => e.length === bad.length && e.every((v, k) => String(v) === String(bad[k]) || (typeof v === 'number' && typeof bad[k] === 'number' && Math.abs(v - bad[k]) <= Math.max(0.05, Math.abs(v) * 0.01))));
    if (close) steps.push('You are very close. Check how many decimal places `ROUND(...)` should keep, and whether a number should be rounded at all.');
    steps.push('Check the filter values and spelling, the aggregate (SUM vs COUNT), and which columns you selected.');
    return { ok: false, lead: 'The right number of rows, but some values are different.', steps };
  }
  if (ordered && gotKeys.join('\n') !== expKeys.join('\n')) {
    return {
      ok: false,
      lead: 'The right rows, in the wrong order.',
      steps: ['Check `ORDER BY`: the column, and the direction (`ASC` smallest-first, `DESC` largest-first).', 'If values tie, the task may specify a second sort column.'],
    };
  }
  return { ok: true };
}

// ---------------- Prompt output ----------------
const PREAMBLE = /^(sure|certainly|of course|okay|ok|here(?:'s| is| are)|the (?:answer|result|output|sentiment)|answer:|output:|result:)/i;

export function diagnoseText(gotRaw, expected) {
  const got = String(gotRaw ?? '');
  if (got === expected) return { ok: true };
  const steps = [];
  let lead = 'Not an exact match.';

  if (!got.trim()) return { ok: false, lead: 'Nothing was pasted.', steps: ['Run the prompt in your assistant and paste its reply into the box.'] };

  if (/```/.test(got)) {
    lead = 'The reply is wrapped in a code fence.';
    steps.push('Add to the prompt: "No markdown and no code fences."');
  }
  if (PREAMBLE.test(got.trim()) && got.trim() !== expected.trim()) {
    lead = lead === 'Not an exact match.' ? 'The reply starts with extra words before the answer.' : lead;
    steps.push('Add to the prompt: "Output ONLY the result. No introduction, no explanation."');
  }
  if (got.trim() === expected) {
    lead = 'The content is right, but there is extra whitespace.';
    steps.push('Leading or trailing spaces or blank lines count as a mismatch. Add: "No blank lines before or after the output."');
  } else if (got.trim().toLowerCase() === expected.toLowerCase()) {
    lead = 'The right words, wrong capitalisation.';
    steps.push('Say exactly how the text must be cased, for example "UPPERCASE".');
  } else if (got.includes(expected) && got.length > expected.length) {
    lead = lead === 'Not an exact match.' ? 'The correct answer is in there, but with extra text around it.' : lead;
    steps.push('Tell the model to output only the answer, and nothing before or after it.');
  }
  try {
    const a = JSON.parse(got), b = JSON.parse(expected);
    if (JSON.stringify(a) === JSON.stringify(b) && got !== expected) {
      lead = 'Valid JSON with the right content, but the text differs.';
      steps.push('An exact match includes spaces. Ask for compact JSON with no spaces after `:` or `,`.');
    } else if (JSON.stringify(Object.keys(a)) !== JSON.stringify(Object.keys(b))) {
      lead = 'The JSON keys are different or in a different order.';
      steps.push('List the keys in the prompt in the exact order you want.');
    }
  } catch { /* not JSON */ }

  const gl = got.replace(/\r/g, '').split('\n');
  const el = expected.split('\n');
  if (gl.length !== el.length) steps.push(`Expected ${el.length} line${el.length === 1 ? '' : 's'}, got ${gl.length}.`);
  if (!steps.length) steps.push('Compare the lines below. Then add one worked example to the prompt that shows exactly this format.');
  return { ok: false, lead, steps, diff: lineDiff(gl, el) };
}

function lineDiff(gl, el) {
  const out = [];
  const n = Math.max(gl.length, el.length);
  for (let i = 0; i < n; i++) {
    if (gl[i] === el[i]) out.push({ k: 'same', s: el[i] });
    else {
      if (el[i] !== undefined) out.push({ k: 'exp', s: el[i] });
      if (gl[i] !== undefined) out.push({ k: 'got', s: gl[i] });
    }
  }
  return out;
}

/** Explains a failed stdin/stdout test: what the program printed versus what was expected. */
export function diagnoseIo(entry, ctx = {}) {
  const steps = [];
  let lead = 'Your output does not match the expected output.';
  const norm = (s) => {
    const t = (s || '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
    return t.trim() === '' ? [] : t.split('\n').map((l) => l.replace(/\s+$/, ''));
  };
  const got = norm(entry.got);
  const exp = norm(entry.expected);
  const num = (s) => (s !== undefined && s.trim() !== '' && !Number.isNaN(Number(s)) ? Number(s) : null);

  if (!got.length && exp.length) {
    lead = 'Your program printed nothing.';
    steps.push('The grader reads what your program **prints**. Use `print(answer)` at the end.');
    steps.push('If you wrote a function, remember to call it, and print what it returns.');
  } else if (got.length && exp.length && got[0] !== exp[0] && got[0].endsWith(exp[0]) && got.length >= exp.length) {
    lead = 'Your output has extra text before the answer.';
    steps.push('A message inside `input("...")` is printed too. Use `input()` with nothing in the parentheses.');
    steps.push('Print only the answer. No labels like "Result:".');
  } else if (got.length !== exp.length) {
    lead = `Expected ${exp.length} line${exp.length === 1 ? '' : 's'} of output, but your program printed ${got.length}.`;
    steps.push(got.length > exp.length ? 'You are printing too much. Is a `print` inside a loop that should be outside it? Is there debug output left in?' : 'You are printing too little. Should each result be printed on its own line? Check the loop and the cases where nothing is printed.');
  } else {
    const i = got.findIndex((l, k) => l !== exp[k]);
    const g = got[i];
    const e = exp[i];
    const where = exp.length > 1 ? ` on line ${i + 1}` : '';
    if (g.toLowerCase() === e.toLowerCase()) {
      lead = `Right letters, wrong capitalisation${where}.`;
      steps.push('Compare the case of each word with the expected output exactly.');
    } else if (g.replace(/\s+/g, '') === e.replace(/\s+/g, '')) {
      lead = `The right characters, but the spacing is off${where}.`;
      steps.push('Check spaces between items and at the start of the line. Graders compare text exactly.');
      steps.push('`print(a, b)` puts one space between the values. Use `"".join(...)` or an f-string when you need a different separator.');
    } else if (num(g) !== null && num(e) !== null) {
      if (Math.abs(num(g) - num(e)) < 1e-9) {
        lead = `The right number, but written differently${where}.`;
        steps.push(/\./.test(g) && !/\./.test(e) ? 'You printed a decimal like `5.0` but a whole number was expected. Use `//` for whole-number division, or `int(...)`.' : 'Format the number to match, for example `f"{x:.2f}"` for two decimal places.');
      } else {
        lead = `A number is different${where}.`;
        steps.push(`Expected \`${e}\` but your program printed \`${g}\`.`);
        steps.push('Work this input by hand, then compare with each step of your code. Look for an off-by-one in a loop, or `>` that should be `>=`.');
      }
    } else {
      lead = `A line is different${where}.`;
      steps.push(`Expected \`${e}\` but your program printed \`${g}\`.`);
    }
  }
  if (ctx.hint) steps.push(ctx.hint);
  return { lead, steps };
}
