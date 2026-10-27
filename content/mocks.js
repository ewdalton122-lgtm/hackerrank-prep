// Timed mock exams. Every question here is original and does NOT appear in the lessons,
// so a mock tests what you can do, not what you remember from a drill.
// `ref` points to the lesson to revisit when a question is missed.
import { RB } from './rubric.js';

const Q = (id, ref, q, at, right, rightWhy, wrongs) => {
  const options = []; const explain = []; let w = 0;
  for (let i = 0; i < 4; i++) {
    if (i === at) { options.push(right); explain.push(`Correct. ${rightWhy}`); }
    else { options.push(wrongs[w][0]); explain.push(wrongs[w][1]); w++; }
  }
  return { id, type: 'mcq', ref, q, options, answer: at, explain };
};

const t = (input, output, edge) => ({ input, output, ...(edge ? { hidden: true, edge } : {}) });
const START = '# Read the input with input(), then print the answer.\n';
const PY = (id, ref, title, prompt, tests, solution) => ({ id, type: 'py', ref, title, prompt, starter: START, tests, solution });
const SQ = (id, ref, title, data, prompt, starter, solution, ordered = true) => ({ id, type: 'sql', ref, title, data, prompt, starter, solution, ordered });
const PE = (id, ref, title, task, cases) => ({ id, type: 'prompt', ref, title, task, cases });
const WR = (id, ref, title, prompt, rubric, model, minWords = 60) => ({ id, type: 'written', ref, title, prompt, rubric: [...rubric, RB.noBlame], model, minWords });

const rb = {
  goal: (re) => ({ id: 'goal', label: 'Acknowledges the stakeholder\'s goal or concern first', test: re }),
  fact: (label, re) => ({ id: 'fact', label, test: re }),
  options: RB.options, rec: RB.rec, next: RB.next,
};

// ---------------------------------------------------------------- Mock 1
const m1 = [
  Q('m1-q1', 'sqf-having2', 'Which query returns each city that has MORE THAN 2 customers, with its customer count?', 1,
    'SELECT city, COUNT(*) FROM customers GROUP BY city HAVING COUNT(*) > 2', 'GROUP BY makes one group per city, and HAVING filters the groups after they are counted.', [
      ['SELECT city, COUNT(*) FROM customers WHERE COUNT(*) > 2 GROUP BY city', 'WHERE runs before grouping, so it cannot use COUNT.'],
      ['SELECT city, COUNT(*) FROM customers HAVING COUNT(*) > 2', 'Without GROUP BY the whole table is one group, so there are no per-city counts.'],
      ['SELECT city, COUNT(*) FROM customers GROUP BY city HAVING COUNT(*) >= 2', 'Using >= 2 also keeps cities with exactly 2 customers.'],
    ]),
  Q('m1-q2', 'sql-left', 'You LEFT JOIN customers to orders and add WHERE orders.id IS NULL. What do you get?', 2,
    'Customers who have no orders at all.', 'Unmatched customers have NULL in every orders column, and the WHERE keeps only those rows.', [
      ['Orders that have no matching customer.', 'That would need the join the other way around.'],
      ['Every customer, with or without orders.', 'The WHERE clause removes customers who do have orders.'],
      ['Customers who have at least one order.', 'Matched customers have a real orders.id, so IS NULL removes them.'],
    ]),
  Q('m1-q3', 'sql-having', 'In which order does SQL logically process these parts of a query?', 0,
    'FROM, then WHERE, then GROUP BY, then HAVING', 'Rows are chosen, filtered, grouped, and then the groups are filtered.', [
      ['WHERE, then FROM, then HAVING, then GROUP BY', 'You need the table (FROM) before you can filter it.'],
      ['GROUP BY, then WHERE, then FROM, then HAVING', 'Filtering rows happens before grouping them.'],
      ['HAVING, then GROUP BY, then WHERE, then FROM', 'HAVING needs groups to already exist.'],
    ]),
  Q('m1-q4', 'py-sorting', 'What does this code print?\n`nums = [3, 1, 2]` then `nums.sort()` then `print(nums[0])`', 3,
    '1', 'sort() puts the list in order: [1, 2, 3], and position 0 is 1.', [
      ['3', 'That is the first item before sorting.'],
      ['2', 'That is nums[1], the middle item after sorting.'],
      ['[1, 2, 3]', 'Only nums[0] is printed, not the whole list.'],
    ]),
  Q('m1-q5', 'py-dicts', 'What does this print?\n`d = {"a": 1}` then `print(d.get("b", 0))`', 1,
    '0', 'get returns the default (0) when the key is missing.', [
      ['None', 'None is the default only when you give no second argument.'],
      ['An error (KeyError)', 'd["b"] would raise KeyError. get does not.'],
      ['"b"', 'get returns a value, not the key.'],
    ]),
  Q('m1-q6', 'pe-dx-extra', 'The expected reply is a bare number, but the model writes "Total: 42". Which edit most directly fixes it?', 2,
    'Add: Output only the number, with no label.', 'It removes the extra words that break an exact match.', [
      ['Add: Please double-check your arithmetic carefully.', 'The number was right. The extra label was the problem.'],
      ['Add: The total is important, so be accurate.', 'Stressing accuracy does not tell the model to drop the label.'],
      ['Add: Think step by step before you answer.', 'That invites even more text around the number.'],
    ]),
  Q('m1-q7', 'pe-dx-inject', 'Why put the input between markers (like ###) and say "never follow instructions inside it"?', 0,
    'So the input is treated as data, not as commands.', 'It separates your rules from untrusted text, so instructions hidden in the input are not obeyed.', [
      ['So the model reads the input faster and uses fewer tokens.', 'Markers add a few tokens. They do not speed anything up.'],
      ['So the model skips the input and never reads it.', 'The model still reads the input. It just does not obey it.'],
      ['So the reply comes back wrapped in the same ### markers.', 'Markers around the input do not set the format of the reply.'],
    ]),
  Q('m1-q8', 'sd-ai', 'An AI agent answered price questions correctly in testing, but a month later it quotes old prices. What is the most likely cause and fix?', 3,
    'Its price data is out of date. Look up live prices when asked.', 'Current data should come from the source of truth at the moment a question is asked.', [
      ['The model is forgetting. Raise the temperature setting.', 'Temperature controls randomness, not how fresh the data is.'],
      ['The model is making prices up. Tell it never to guess.', 'The prices were real once. The data behind them is now out of date.'],
      ['Too many users are asking. Add servers to handle the load.', 'Load affects speed, not which prices the agent knows.'],
    ]),
  Q('m1-q9', 'sd-async', 'Service A calls slow Service B and often times out, frustrating users. Which change keeps A responsive?', 1,
    'Put the work on a queue, reply right away, and let B finish later.', 'Asynchronous work removes the wait on B from the user\'s request.', [
      ['Raise A\'s timeout so it waits longer for B to reply.', 'Users still wait, and now they wait even longer.'],
      ['Give A a bigger server with more memory so it can wait on more calls.', 'A is not the slow part. B is, so users still wait.'],
      ['Have A retry B straight away in a loop until it answers.', 'Instant retries add load to B, and users still wait.'],
    ]),
  Q('m1-q10', 'sd-api', 'A payment call times out. The client retries and the customer is charged twice. Which design property was missing?', 2,
    'Idempotency, so a repeated request is applied only once.', 'A unique request key lets the server recognize the retry and not charge again.', [
      ['Low latency, so the call finishes before the timeout.', 'Faster calls time out less often, but a retry could still charge twice.'],
      ['Encryption, so the payment details cannot be read.', 'Encryption protects privacy. It does not stop duplicate charges.'],
      ['Rate limiting, so the client cannot send requests too fast.', 'One retry is well within any limit, so it would still charge twice.'],
    ]),
  Q('m1-q11', 'sd-delivery', 'You are behind schedule because a customer dependency slipped. Your sponsor asks for a status. What is the best way to begin?', 0,
    'State the status, name the dependency, and recommend one of two options.', 'Clear facts, real options and a recommendation keep trust and let the sponsor decide.', [
      ['Say you are on track for now, and raise the delay only if it gets worse.', 'Hiding a known risk damages trust when it comes out later.'],
      ['Explain in detail how the customer\'s team caused the delay.', 'Blame makes people defensive and does not solve the delay.'],
      ['Apologize and promise your team will work weekends to catch up.', 'Extra hours cannot fix a dependency the customer controls.'],
    ]),
  Q('m1-q12', 'sd-security', 'An analyst asks for a full customer export, including national ID numbers, for a churn analysis. What is the best response?', 3,
    'Share only the fields the analysis needs, with IDs removed or masked.', 'Least privilege: give what the job needs, nothing more. A churn analysis does not need national IDs.', [
      ['Send the full export, since the analyst is a trusted employee.', 'Trusted people can still leak data, and the IDs are not needed.'],
      ['Refuse to share any customer data, just to be completely safe.', 'The analysis still needs the useful fields, which can be shared safely.'],
      ['Send the full export, but protect the file with a strong password first.', 'A password helps, but it still shares ID numbers the analysis does not need.'],
    ]),
  SQ('m1-sql1', 'sqf-multijoin', 'Above-average customers', 'shop',
    'Return each customer `name` and their total **Shipped** revenue as `revenue` (quantity times price, added up), but only for customers whose total is **higher than the average of those per-customer totals**. Highest revenue first, then name A to Z.',
    "WITH t AS (\n  SELECT c.name, SUM(i.qty * p.price) AS revenue\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY c.id, c.name\n)\nSELECT name, revenue\nFROM t\n",
    "WITH t AS (SELECT c.name, SUM(i.qty * p.price) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY c.id, c.name) SELECT name, revenue FROM t WHERE revenue > (SELECT AVG(revenue) FROM t) ORDER BY revenue DESC, name;"),
  SQ('m1-sql2', 'sqf-selfjoin', 'Payroll by department, including empty ones', 'staff',
    'For **every** department (even ones with no employees) return `dept` (the department name), `headcount` (number of employees) and `payroll` (total salary, **0** if there are no employees). Order by department name.',
    'SELECT d.name AS dept\nFROM departments d\n',
    'SELECT d.name AS dept, COUNT(e.id) AS headcount, COALESCE(SUM(e.salary), 0) AS payroll FROM departments d LEFT JOIN employees e ON e.dept_id = d.id GROUP BY d.id, d.name ORDER BY d.name;'),
  PY('m1-py1', 'io-palin', 'Balanced brackets',
    'Read one line made of the characters `(`, `)`, `[`, `]`, `{` and `}`. Print `YES` if every bracket is closed by the matching kind in the correct order, otherwise print `NO`. An empty line counts as balanced.',
    [
      t('()[]{}\n', 'YES'),
      t('([)]\n', 'NO'),
      t('{[()]}\n', 'YES'),
      t('(((\n', 'NO', 'Opening brackets that never close are not balanced.'),
      t('\n', 'YES', 'An empty line is balanced.'),
      t(')(\n', 'NO', 'A closing bracket with nothing open is not balanced.'),
      t('(' .repeat(50000) + ')'.repeat(50000) + '\n', 'YES', 'Large input. Use a stack (a list) and one pass.'),
    ],
    's = input().strip()\npairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nok = True\nfor ch in s:\n    if ch in "([{":\n        stack.append(ch)\n    elif ch in pairs:\n        if not stack or stack.pop() != pairs[ch]:\n            ok = False\n            break\nprint("YES" if ok and not stack else "NO")\n'),
  PY('m1-py2', 'io-topword', 'Second largest value',
    'The first line is `n`. The second line holds `n` integers. Print the **second largest different value**. If there are fewer than two different values, print `NONE`.',
    [
      t('5\n4 9 9 2 7\n', '7'),
      t('3\n5 5 5\n', 'NONE'),
      t('2\n-1 -5\n', '-5'),
      t('1\n10\n', 'NONE', 'A single value has no second largest.'),
      t('6\n3 3 8 8 8 1\n', '3', 'Duplicates of the largest value do not count as the second largest.'),
    ],
    'n = int(input())\nvals = sorted(set(map(int, input().split())), reverse=True)\nprint(vals[1] if len(vals) > 1 else "NONE")\n'),
  PE('m1-pe1', 'pe-dx-edge', 'Find order numbers',
    'Find every order number in the text. An order number is a `#` followed by digits. Output the numbers without the `#`, separated by commas with no spaces, in the order they appear. If there are none, output NONE.',
    [
      { input: 'Please cancel order #4521 for me', expected: '4521' },
      { input: 'Orders #12 and #345 are both late', expected: '12,345' },
      { input: 'I never got my package', expected: 'NONE' },
    ]),
  WR('m1-w1', 'sk-scope', 'Skip the testing',
    'A customer manager asks you to skip user testing so the agent can launch two weeks earlier. You believe testing is needed, because only the project team has tried the agent so far. Write your reply (about 100 to 150 words).',
    [
      rb.goal(/goal|understand|appreciate|thank|makes sense|launch|earlier|date|momentum/i),
      rb.fact('States the risk of skipping testing, neutrally', /risk|test|users|team|real|mistake|wrong|feedback|confidence/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you for pushing to get this in front of customers sooner. I understand the value of launching two weeks earlier.\n\nThe concern is risk: so far only our project team has used the agent, and real users often ask things we have not thought of. Launching without testing could mean wrong answers reaching customers.\n\nTwo options. Option A: run a short test with ten real users for three days, then launch, which saves one of the two weeks. Option B: launch on the early date to a small pilot group only, with a person reviewing answers.\n\nI recommend Option B. It meets your date, limits exposure, and gives us real feedback straight away.\n\nNext step: can we agree the pilot group this week? I will send a proposed list by Thursday.'),
];

// ---------------------------------------------------------------- Mock 2
const m2 = [
  Q('m2-q1', 'sqf-null', 'A table has bonus values of 100, 200 and two NULLs. What does AVG(bonus) return?', 1,
    '150, because NULLs are ignored.', 'AVG averages only the non-NULL values: (100 + 200) / 2.', [
      ['75, because NULLs count as zero.', 'Aggregates skip NULL. They do not treat it as zero.'],
      ['NULL, because any NULL makes it NULL.', 'That is true for plain arithmetic, but aggregates skip NULLs.'],
      ['300, the total of the non-NULL values.', 'That is the SUM. AVG then divides it by the 2 non-NULL values.'],
    ]),
  Q('m2-q2', 'sqa-leader', 'Three customers tie for first place by revenue. Which ranking function gives them all rank 1 and the next customer rank 2, with no gap?', 2,
    'DENSE_RANK() OVER (ORDER BY revenue DESC)', 'It keeps ties together and does not skip numbers.', [
      ['ROW_NUMBER() OVER (ORDER BY revenue DESC)', 'It gives every row a different number, even ties.'],
      ['RANK() OVER (ORDER BY revenue DESC)', 'RANK gives the next customer rank 4, leaving a gap.'],
      ['COUNT(*) OVER (ORDER BY revenue DESC)', 'That is a running count, so the three tied rows all get 3, not 1.'],
    ]),
  Q('m2-q3', 'sql-group', 'This query fails in strict SQL: SELECT dept, name, COUNT(*) FROM staff GROUP BY dept. Why?', 0,
    '`name` is not in GROUP BY and is not inside an aggregate.', 'Each dept has many names, so there is no single value to show. Every selected column must be grouped or wrapped in an aggregate.', [
      ['COUNT(*) cannot be combined with GROUP BY in one query.', 'COUNT(*) is the most common aggregate used with GROUP BY.'],
      ['`dept` must be wrapped in an aggregate such as MAX(dept).', 'dept is the grouping column, so it already has one value per group.'],
      ['A WHERE clause is required before GROUP BY can be used.', 'WHERE is optional. A query can group rows without filtering them.'],
    ]),
  Q('m2-q4', 'py-lists', 'What does this print?\n`print(len(set([1, 2, 2, 3])))`', 3,
    '3', 'A set keeps each different value once: {1, 2, 3}.', [
      ['4', 'That is the length of the list, before duplicates are removed.'],
      ['2', 'That is the number of duplicated values.'],
      ['{1, 2, 3}', 'len() returns a count, not the set itself.'],
    ]),
  Q('m2-q5', 'py-strings', 'What does this print?\n`print("a,b,c".split(",")[1])`', 1,
    'b', 'split gives ["a", "b", "c"], and position 1 is the second item.', [
      ['a', 'That is position 0. Python counts positions from 0.'],
      ['c', 'That is position 2, the last item.'],
      ['a,b,c', 'split breaks the text into a list, and [1] picks one item from it.'],
    ]),
  Q('m2-q6', 'py-loops', 'What is the last line printed by this code?\n`for i in range(3):` then `    print(i)`', 2,
    '2', 'range(3) produces 0, 1 and 2, so the last value printed is 2.', [
      ['3', 'range(3) stops before 3.'],
      ['1', 'That is printed second, not last.'],
      ['0', 'That is printed first, not last.'],
    ]),
  Q('m2-q7', 'pe-dx-format', 'A prompt should produce three CSV columns, but the model changes their order between runs. What is the best fix?', 0,
    'State the exact column order and show one worked example.', 'A named order plus an example removes the guesswork.', [
      ['Add: Please be consistent and keep the same order every time.', 'It asks for consistency but never says which order to use.'],
      ['Shorten the input so the model has less to keep track of.', 'Input length is not why the column order changes.'],
      ['Run the prompt several times and keep the best output.', 'Luck is not a fix. The order can still change next time.'],
    ]),
  Q('m2-q8', 'pe-dx-edge', 'A classifier must output POSITIVE, NEGATIVE or NEUTRAL. The input might be empty. Which line best handles that?', 3,
    'If the input is empty, output NEUTRAL.', 'It gives the exact word to output for the edge case.', [
      ['If the input is empty, do your best to classify it.', 'It names no output, so the reply could be anything.'],
      ['If the input is empty, output EMPTY.', 'EMPTY is not one of the three allowed labels.'],
      ['If the input is empty, output nothing at all.', 'The grader still expects one of the three words.'],
    ]),
  Q('m2-q9', 'sd-ai', 'How can a team tell whether a prompt change really improved their agent?', 1,
    'Run the same test questions before and after, and compare.', 'A fixed set of test questions makes the change measurable.', [
      ['Ask a colleague to try the new version and give their opinion.', 'One person\'s impression is not a measurement.'],
      ['Check whether the new replies sound more confident.', 'Sounding confident is not the same as being correct.'],
      ['Try a few new questions after the change and see if they look right.', 'Without the same questions before and after, there is nothing to compare.'],
    ]),
  Q('m2-q10', 'sd-reliab', 'A new release has a bug that only shows for about 2% of requests. Which release approach limits the damage?', 2,
    'A canary release: send a small share of traffic to it first.', 'Only a few users are exposed while you watch for problems.', [
      ['Release to everyone at once so the bug shows up quickly.', 'The bug does show up, but every user is exposed to it.'],
      ['Skip testing and fix bugs as customers report them.', 'Customers become your testers and hit the bug first.'],
      ['Turn off error alerts during the release to reduce noise.', 'Alerts are how you would notice the bug.'],
    ]),
  Q('m2-q11', 'sd-data', 'The same customer appears in the CRM and in billing with different ids. What is the best fix for reporting?', 0,
    'Map the two ids and build one trusted record per customer.', 'One identity per customer, often called a golden record, makes totals reliable.', [
      ['Keep both records and add their totals together in reports.', 'The same customer would be counted twice.'],
      ['Use only the CRM data and ignore the billing records.', 'Billing holds data the reports need, such as what was paid.'],
      ['Match the records by customer name in each report.', 'Names are not unique and are often spelled differently, so matches fail.'],
    ]),
  Q('m2-q12', 'sd-delivery', 'The customer asks for three more features with the same fixed deadline. Why is proposing a phased MVP a good response?', 3,
    'It ships a useful core on time, and the rest follows later.', 'It protects the date and keeps the extra features visible for a later phase.', [
      ['It avoids the need for a detailed plan for the extra work.', 'Phasing needs more planning, not less.'],
      ['It lets you say yes to everything without changing the plan.', 'It does change the plan: some features move to a later phase.'],
      ['It saves time by letting the team skip testing in phase one.', 'Every phase still needs testing.'],
    ]),
  SQ('m2-sql1', 'sqp-winrate', 'Reps who win at least half their deals', 'sales',
    'Return each rep `name`, their number of deals as `deals`, and the number of **Closed Won** deals as `wins`, but only for reps whose wins are **at least half** of their deals. Most wins first, then name A to Z.',
    'SELECT r.name,\n  COUNT(*) AS deals\nFROM deals d\nJOIN reps r ON r.id = d.rep_id\nGROUP BY r.id, r.name\n',
    "SELECT r.name, COUNT(*) AS deals, SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) AS wins FROM deals d JOIN reps r ON r.id = d.rep_id GROUP BY r.id, r.name HAVING SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) * 2 >= COUNT(*) ORDER BY wins DESC, r.name;"),
  SQ('m2-sql2', 'sqa-topn', 'Latest Shipped order per customer', 'shop',
    'For each customer, return their `name`, and the `id` and `order_date` of their **most recent Shipped** order. Customers with no Shipped order are left out. Order by name.',
    "SELECT c.name, o.id, o.order_date\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'Shipped'\n",
    "SELECT name, id, order_date FROM (SELECT c.name, o.id, o.order_date, ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.order_date DESC) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'Shipped') t WHERE rn = 1 ORDER BY name;"),
  PY('m2-py1', 'io-swapcase', 'Compress repeated letters',
    'Read one line of lower-case letters. Replace each run of the same letter with the letter followed by the length of the run. Example: `aaabcc` becomes `a3b1c2`.',
    [
      t('aaabcc\n', 'a3b1c2'),
      t('z\n', 'z1'),
      t('aabbaa\n', 'a2b2a2', 'The same letter in two separate runs is counted separately.'),
      t('abc\n', 'a1b1c1'),
      t('a' .repeat(100000) + '\n', 'a100000', 'Large input. Build the answer in one pass.'),
    ],
    's = input().strip()\nout = []\ni = 0\nwhile i < len(s):\n    j = i\n    while j < len(s) and s[j] == s[i]:\n        j += 1\n    out.append(s[i] + str(j - i))\n    i = j\nprint("".join(out))\n'),
  PY('m2-py2', 'io-share', 'Count pairs with a target sum',
    'The first line has `n` and `target`. The second line has `n` integers. Count the pairs of positions `i < j` where the two values add up to `target`. Print the count.',
    [
      t('4 6\n1 5 3 3\n', '2'),
      t('3 10\n1 2 3\n', '0'),
      t('5 4\n2 2 2 2 2\n', '10', 'Equal values at different positions are different pairs.'),
      t('2 0\n-3 3\n', '1'),
      t('100000 2\n' + Array(100000).fill(1).join(' ') + '\n', '4999950000', 'Large input. Checking every pair is too slow. Use a dictionary of counts.'),
    ],
    'n, target = map(int, input().split())\nnums = list(map(int, input().split()))\nseen = {}\ncount = 0\nfor x in nums:\n    count += seen.get(target - x, 0)\n    seen[x] = seen.get(x, 0) + 1\nprint(count)\n'),
  PE('m2-pe1', 'pe-dx-format', 'Format a phone number',
    'Each input is a US phone number with exactly 10 digits, written in any style (dots, dashes, spaces or brackets). Output it in the format (XXX) XXX-XXXX, with nothing else.',
    [
      { input: '555.123.4567', expected: '(555) 123-4567' },
      { input: '5551234567', expected: '(555) 123-4567' },
      { input: '555 987 0011', expected: '(555) 987-0011' },
      { input: '(646) 555-0123', expected: '(646) 555-0123' },
    ]),
  WR('m2-w1', 'sk-exec', 'Two VPs, one slot',
    'Two VPs on the same project disagree. Sales wants lead scoring first and Service wants case summaries first. You can deliver only one by the committed date. Write one message to both (about 100 to 150 words).',
    [
      rb.goal(/both|goal|understand|appreciate|thank|important|value|priorit/i),
      rb.fact('States the constraint (one by the date) neutrally, without taking sides', /one|capacity|date|time|only|constraint|both can|not both/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you both. Lead scoring and case summaries are each valuable, and I want to be clear about how we choose.\n\nThe constraint is capacity: we can deliver only one of them by the committed date, and the other would follow.\n\nTwo options. Option A: deliver lead scoring first and case summaries four weeks later. Option B: deliver case summaries first and lead scoring four weeks later.\n\nI recommend we decide using one measure both of you agree on, such as expected hours saved or revenue protected. On the numbers I have today, I would start with case summaries because the volume is higher, but I am open to your data.\n\nNext step: can we meet for 30 minutes this week? I will send each of you a one-page comparison by Wednesday.'),
];

// ---------------------------------------------------------------- Mock 3 and 4: new multiple-choice, plus the leftover SQL and coding problems
const m3 = [
  Q('m3-q1', 'sd-async', 'Why do software-as-a-service vendors run many customers on one shared platform?', 0,
    'To lower cost and give every customer updates at the same time.', 'One platform to run and update is far cheaper than many separate copies.', [
      ['To give each customer its own private copy of the code.', 'That is the opposite of a shared platform, and separate copies are costly to update.'],
      ['To let each customer freely change the core code to fit its needs.', 'Customers configure settings. A change to the shared core code would affect everyone.'],
      ['To avoid having to back up each customer\'s data.', 'Shared platforms still need backups, usually more carefully.'],
    ]),
  Q('m3-q2', 'sd-reliab', 'A vendor promises 99.9% uptime over a 30-day month. Roughly how much downtime does that allow?', 2,
    'About 43 minutes.', 'A 30-day month has 43,200 minutes, and 0.1% of that is about 43.', [
      ['About 7.2 hours.', 'That is roughly what 99% uptime allows, one nine fewer.'],
      ['About 4.3 minutes.', 'That is roughly what 99.99% uptime allows, one nine more.'],
      ['About 3 days.', 'That would be about 90% uptime.'],
    ]),
  Q('m3-q3', 'sd-async', 'A user clicks Export and the report takes ten minutes to build. Which design keeps the app responsive?', 1,
    'Queue it as a background job and tell the user when it is ready.', 'Long work belongs off the request path, with a notification when it finishes.', [
      ['Keep the user on a loading page with a spinner until it finishes.', 'The user is stuck for ten minutes, and the request may time out.'],
      ['Have the browser re-send the export request every few seconds.', 'That multiplies the load and may start many copies of the report.'],
      ['Raise the server timeout to an hour so the request can finish.', 'It hides the problem and ties up a server connection the whole time.'],
    ]),
  Q('m3-q4', 'sd-crm', 'Why test a change in a sandbox before it goes to production?', 3,
    'It is a safe copy, so mistakes cannot affect real customers.', 'Mistakes in the copy cannot touch real customers or data. Finding the problem there is cheap. Finding it in production is not.', [
      ['Sandboxes run faster, so tests finish much sooner there.', 'Speed is not the reason for using a sandbox.'],
      ['Production systems do not allow any changes to be made.', 'Production changes often. The point is to change it safely.'],
      ['Changes made in a sandbox go live without any deploy step.', 'Sandbox changes do not reach production until they are deployed.'],
    ]),
  PE('m3-pe1', 'pe-dx-extra', 'Extract the price',
    'Each input is a sentence containing exactly one price in dollars, such as $1,250.50. Output only the amount as a plain number: no dollar sign and no thousands commas. Keep any cents as written.',
    [
      { input: 'The total comes to $1,250.50 today', expected: '1250.50' },
      { input: 'It only costs $9', expected: '9' },
      { input: 'Please wire $12,000,000 by Friday', expected: '12000000' },
      { input: 'A refund of $0.99 was issued', expected: '0.99' },
    ]),
  WR('m3-w1', 'sk-date', 'The date you cannot hit',
    'A customer executive expects go-live on March 1. Your honest estimate is March 22, because the customer\'s own data cleanup is running late. Write your reply to the executive (about 100 to 150 words).',
    [
      rb.goal(/goal|understand|appreciate|thank|important|march 1|momentum|expect/i),
      rb.fact('States the real date and the reason, neutrally', /march 22|22|estimate|data|cleanup|clean-up|dependency|late/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you for being clear that March 1 matters. I understand why: your team is counting on it.\n\nThe honest picture is that March 22 is our realistic date. The reason is the data cleanup, which is running behind and which the agent depends on.\n\nThere are two options. Option one is to hold March 1 with a smaller first release, covering only the questions that do not need the cleaned data. Option two is a single full launch on March 22.\n\nI recommend option one, because it keeps the date you promised and gets real feedback early, while the full version follows on March 22.\n\nCan we spend 20 minutes this week with your data lead to confirm the cleanup dates and the smaller scope?'),
];

const m4 = [
  Q('m4-q1', 'sd-reliab', 'What is the difference between an SLO and an SLA?', 1,
    'An SLO is an internal target. An SLA is a promise to the customer.', 'An SLA often carries penalties if it is missed. Teams set SLOs a little tighter than the SLA so they have room to react.', [
      ['They mean the same thing. SLA is just the older name.', 'They are related but different: one is a target, the other a contract.'],
      ['An SLA is an internal target. An SLO is a promise to the customer.', 'That has them reversed.'],
      ['An SLO covers uptime. An SLA covers security and data privacy.', 'Both describe service levels, such as uptime and response time.'],
    ]),
  Q('m4-q2', 'sd-async', 'Which statement about caching is true?', 2,
    'It speeds up repeated reads, but data can be out of date.', 'A cache keeps a copy. The copy can go stale until it is refreshed.', [
      ['It speeds up reads and always shows the very latest data.', 'A cache keeps a copy, and the copy can go out of date.'],
      ['It is mainly used to make saving new data faster.', 'Caches mainly speed up repeated reads, not writes.'],
      ['It stores the data, so you no longer need a database.', 'A cache sits in front of the source of truth. It does not replace it.'],
    ]),
  Q('m4-q3', 'sd-api', 'An external system needs to know when an order is created. Which approach avoids constant checking?', 0,
    'A webhook: your system notifies theirs when an order is created.', 'Your system calls theirs the moment it happens, so nobody has to keep asking.', [
      ['Polling: their system asks yours for new orders every second.', 'That is the constant checking you are trying to avoid.'],
      ['Their system downloads the whole order table every minute.', 'That is still constant checking, and it moves far more data.'],
      ['A person copies each new order into their system by hand.', 'Someone still has to keep checking, and copying by hand is slow and error-prone.'],
    ]),
  Q('m4-q4', 'sd-security', 'A new analyst needs to see support cases only. What access should they get?', 3,
    'Access to only the support case data they need.', 'This is the least-privilege rule: grant the minimum needed for the job, and widen it only when there is a reason.', [
      ['Administrator access, so they never have to ask again.', 'Over-broad access is a common cause of data leaks.'],
      ['The shared support team login, so setup is quick.', 'Shared logins make it impossible to see who did what.'],
      ['Read-only access to all customer data in the system.', 'Read-only still exposes far more data than the job needs.'],
    ]),
  PE('m4-pe1', 'pe-dx-format', 'Classify a review',
    'Each input is a short product review. Output exactly one word: POSITIVE if it is clearly positive, NEGATIVE if it is clearly negative, or MIXED if it contains both praise and complaint.',
    [
      { input: 'Love it, works perfectly every day', expected: 'POSITIVE' },
      { input: 'Broke after two days, a total waste of money', expected: 'NEGATIVE' },
      { input: 'The screen is gorgeous but the battery is awful', expected: 'MIXED' },
      { input: 'Fast shipping and exactly as described', expected: 'POSITIVE' },
    ]),
  WR('m4-w1', 'sk-vp', 'Nobody is using the agent',
    'Four weeks after launch, only 15% of the customer\'s service reps use the new agent. Usage data shows that most reps never finished the 20-minute training. The VP of Service emails you: "Did this project fail?" Write your reply (about 100 to 150 words).',
    [
      rb.goal(/understand|concern|fair question|thank|goal|success|adoption/i),
      rb.fact('States what the usage data shows, neutrally', /training|15%|data shows|usage/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you for asking directly. It is a fair question, and I share your goal of having the whole team use the agent.\n\nThe usage data points to one clear gap: most reps have not finished the 20-minute training, so many have not yet seen what the agent can do for them.\n\nThere are two options. Option one is to make the training required, with a two-week deadline. Option two is to run short live sessions with each team lead, who then coaches their own reps.\n\nI recommend option two, because reps are more likely to adopt a tool that their own lead shows them working.\n\nNext step: I will send a session schedule by Thursday, and we can review the usage numbers together in two weeks.'),
];

// ---------------------------------------------------------------- Mock 5 and 6: all-new questions in every section
const m5 = [
  Q('m5-q1', 'sd-async', 'Which of these is the best candidate for an asynchronous background job?', 2,
    'Building a 2-million-row report and emailing a link to it.', 'Slow work should run off the request path, with a notification when it finishes.', [
      ['Checking that an email field contains an @ sign as the user types.', 'That is instant and gives immediate feedback, so it stays in the page.'],
      ['Showing the signed-in user\'s name in the page header.', 'A tiny lookup that must be there when the page loads.'],
      ['Checking the user\'s password when they click Log in.', 'The user is waiting for the answer, so it must happen right away.'],
    ]),
  Q('m5-q2', 'sd-async', 'On a shared multi-tenant platform, one customer starts a huge import that slows down everyone else. What is the usual defense?', 1,
    'Per-customer limits, so no tenant can use more than its share.', 'Limits and quotas keep one noisy tenant from slowing down the others.', [
      ['Give that customer their own copy of the whole platform.', 'That gives up the cost benefit of sharing one platform.'],
      ['Add more servers each time any customer runs a large import.', 'It is costly, and one tenant can still use up the new capacity.'],
      ['Cancel any import automatically once it runs for one minute.', 'Cancelling loses work. Limiting or queueing the import is safer.'],
    ]),
  Q('m5-q3', 'sd-reliab', 'A new release causes errors in production. What is a rollback?', 0,
    'Going back to the last working version while you investigate.', 'It limits customer impact first. The cause can be fixed calmly afterward.', [
      ['Undoing every change customers made to their data since the release.', 'A rollback changes the software version. Wiping customer changes would lose real work.'],
      ['Writing a quick fix and releasing it straight away.', 'That is a hotfix, sometimes called rolling forward. A rollback returns to the old version.'],
      ['Waiting to see whether the errors stop on their own.', 'Customers stay affected while you wait.'],
    ]),
  Q('m5-q4', 'sd-api', 'Your integration calls an API and receives HTTP status 429. What happened and what is the right response?', 3,
    'Too many requests. Wait, then retry with growing delays.', '429 means "too many requests". Backing off gives the other side time to recover.', [
      ['The resource does not exist, so stop calling it and log an error.', 'That is 404 Not Found.'],
      ['The server has crashed, so retry at once in a tight loop.', 'A crash is usually a 5xx code, and instant retries make overload worse.'],
      ['Your login has expired, so sign in again and resend the request.', 'Login problems are 401 or 403. A 429 is about how many requests you send.'],
    ]),
  PE('m5-pe1', 'pe-dx-format', 'Order number and quantity',
    'Each input is a short message that contains exactly one order number (a capital letter, a dash and four digits, such as B-2210) and exactly one quantity. Output only this, with no other text: ORDER=<order number>;QTY=<quantity>',
    [
      { input: 'Please ship 12 units for order B-2210 by Friday', expected: 'ORDER=B-2210;QTY=12' },
      { input: 'Order A-1042: customer needs 3 more', expected: 'ORDER=A-1042;QTY=3' },
      { input: 'We are cancelling 250 units on C-7781 effective today', expected: 'ORDER=C-7781;QTY=250' },
      { input: 'D-0007 should be 1 only', expected: 'ORDER=D-0007;QTY=1' },
    ]),
  WR('m5-w1', 'sk-scope', 'The feature that does not exist',
    'A customer\'s VP expects the agent to update billing records automatically. In this release it can only read billing data, and writing is not supported. Write your reply to the VP (about 100 to 150 words).',
    [
      rb.goal(/goal|understand|thank|appreciate|important|makes sense|saves|time/i),
      rb.fact('States plainly what is and is not possible today', /read|cannot|can't|not support|isn't supported|not possible|not in this release|today/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you for being clear about the goal. Updating billing records automatically would save your team real time, and I understand why it matters.\n\nTo be direct about today: in this release the agent can read billing data, but writing to it is not supported yet.\n\nThere are two options. Option one is a human-approval step: the agent prepares the change and a billing specialist approves it with one click. Option two is to wait for the write capability in a later release.\n\nI recommend option one, because it delivers most of the time savings now and keeps a person in control of financial data.\n\nNext step: can we schedule 30 minutes this week with your billing lead to design the approval step?'),
];

const m6 = [
  Q('m6-q1', 'sd-scale', 'Traffic to a service doubles. Which change is "horizontal scaling"?', 1,
    'Adding more servers and sharing the load between them.', 'Horizontal means more machines side by side.', [
      ['Moving to one bigger server with a faster processor and more memory.', 'That is vertical scaling: a bigger single machine.'],
      ['Rewriting the code in a faster programming language.', 'That may improve speed, but it is not scaling out.'],
      ['Limiting each user to fewer requests per minute.', 'That is rate limiting. It reduces load but adds no capacity.'],
    ]),
  Q('m6-q2', 'sd-security', 'What does "encryption at rest" protect?', 2,
    'Stored data, so a stolen disk or backup cannot be read.', 'It covers saved data, as opposed to data moving over the network. Without the key, the stored data is unreadable.', [
      ['Data while it travels between the browser and the server.', 'That is encryption in transit (for example HTTPS).'],
      ['Passwords as the user types them into a login form.', 'Typed passwords are protected in transit and by hashing, not by this.'],
      ['Data while it is loaded in memory and being used.', 'That is data in use. At rest means saved to storage.'],
    ]),
  Q('m6-q3', 'sd-reliab', 'After an outage, what should a good "blameless" postmortem focus on?', 0,
    'What happened, why the system allowed it, and how to prevent it.', 'Look at how the system and process allowed the failure. The aim is to fix them, so people feel safe reporting what really happened.', [
      ['Finding who made the mistake so they can be retrained.', 'Focusing on a person makes people hide details, and the system flaw stays.'],
      ['Writing a summary that keeps the cause hidden from customers.', 'Hiding the cause damages trust. Being open builds it.'],
      ['Listing every error message from the outage in full detail.', 'Logs help, but the goal is to find causes and prevent a repeat.'],
    ]),
  Q('m6-q4', 'sd-reliab', 'To answer a question, the agent must call two services one after the other. Each has 99.9% uptime, and both must be up. What is the best estimate of the combined uptime?', 3,
    'About 99.8%.', 'Both must work, so the uptimes multiply: 0.999 x 0.999 is about 0.998. Chaining makes availability worse.', [
      ['About 99.9%.', 'That would be true only if the two services never failed at different times.'],
      ['About 99.99%.', 'That is the effect of two redundant copies, where either one can serve. Here both are required.'],
      ['About 99.0%.', 'Too low. Each service adds about 0.1% of downtime, so the total is about 0.2%.'],
    ]),
  PE('m6-pe1', 'pe-dx-edge', 'Check the record is complete',
    'Each input is a customer record written as name=...; email=...; phone=... . A field is missing when nothing follows its equals sign. If all three are filled in, output exactly COMPLETE. Otherwise output MISSING: followed by the missing field names, in the order name, email, phone, separated by a comma and a space.',
    [
      { input: 'name=Ava Lee; email=ava@x.com; phone=555-0101', expected: 'COMPLETE' },
      { input: 'name=; email=bo@x.com; phone=555-0102', expected: 'MISSING: name' },
      { input: 'name=Cy Park; email=; phone=', expected: 'MISSING: email, phone' },
      { input: 'name=; email=; phone=', expected: 'MISSING: name, email, phone' },
    ]),
  WR('m6-w1', 'sk-exec', 'Two leaders, two priorities',
    'At a customer, the head of sales wants the agent to launch with lead qualification, and the head of support wants it to launch with case deflection. They disagree and both have copied you. Write one message to both (about 100 to 150 words).',
    [
      rb.goal(/shared|both|goal|customer|common|outcome|thank/i),
      rb.fact('Gives each leader\'s position and reason fairly', /^(?=[\s\S]*\bsales\b)(?=[\s\S]*\bsupport\b)[\s\S]*\bbecause\b/i),
      rb.options, rb.rec, rb.next,
    ],
    'Thank you both for being so clear. You share the same goal, a better customer experience, so this is a question of order, not of who is right.\n\nSales wants lead qualification first, because it speeds up pipeline. Support wants case deflection first, because it lowers the queue today. Both are good reasons.\n\nThere are two options. Option one is to launch lead qualification first. Option two is to launch case deflection first. Either way the second use case follows within one quarter.\n\nI recommend case deflection first, because its success measure is simple and it frees support time that helps both teams.\n\nNext step: a 30-minute call this week with both of you to confirm the order and the success measures.'),
];

const m5py = PY('m5-py1', 'py-lists', 'Count the peaks',
  'The first line is `n`. The second line has `n` integers. A **peak** is a number that is strictly greater than the number just before it and the number just after it (the first and last numbers cannot be peaks). Print how many peaks there are. `n` can be 100000.',
  [
    t('6\n1 3 2 4 1 5\n', '2'),
    t('3\n1 2 1\n', '1'),
    t('2\n5 1\n', '0', 'With fewer than three numbers there can be no peak.'),
    t('5\n2 2 2 2 2\n', '0', 'Equal neighbors do not count: a peak must be strictly greater.'),
    t('5\n1 3 3 1 0\n', '0', 'A flat top of two equal numbers is not a peak.'),
    t(`100000\n${Array.from({ length: 100000 }, (_, i) => (i % 2 ? 2 : 1)).join(' ')}\n`, '49999', 'Large input. One pass is enough.'),
  ],
  'n = int(input())\nnums = list(map(int, input().split()))\ncount = 0\nfor i in range(1, n - 1):\n    if nums[i] > nums[i - 1] and nums[i] > nums[i + 1]:\n        count += 1\nprint(count)\n');

const m6py = PY('m6-py1', 'py-strings', 'The shared beginning',
  'The first line is `n`. Each of the next `n` lines has one lowercase word. Print the **longest prefix** that every word starts with. If the words share no prefix, print `NONE`. `n` can be 100000.',
  [
    t('3\nflower\nflow\nflight\n', 'fl'),
    t('3\ndog\nracecar\ncar\n', 'NONE', 'No shared first letter, so print NONE rather than an empty line.'),
    t('1\nalone\n', 'alone', 'One word: the whole word is its own prefix.'),
    t('2\nabc\nab\n', 'ab', 'A shorter word can be the whole prefix. Do not read past its end.'),
    t('2\nsame\nsame\n', 'same'),
    t(`100000\n${Array.from({ length: 100000 }, (_, i) => 'interview' + i).join('\n')}\n`, 'interview', 'Large input. Shrink the prefix as you go instead of comparing every pair.'),
  ],
  'n = int(input())\nwords = [input().strip() for _ in range(n)]\nprefix = words[0]\nfor w in words[1:]:\n    while not w.startswith(prefix):\n        prefix = prefix[:-1]\nprint(prefix if prefix else "NONE")\n');

const m5sql = SQ('m5-sql1', 'sqw-second', 'The northernmost station in each state', 'stations',
  'For every **state with at least 2 stations**, return the `state`, the `city` of its most northern station (the largest `lat_n`) and that `lat_n`. Order by state.',
  'WITH r AS (\n  SELECT state, city, lat_n,\n         ROW_NUMBER() OVER (PARTITION BY ) AS rn,\n         COUNT(*) OVER (PARTITION BY state) AS cnt\n  FROM stations\n)\nSELECT state, city, lat_n\nFROM r\n',
  'WITH r AS (SELECT state, city, lat_n, ROW_NUMBER() OVER (PARTITION BY state ORDER BY lat_n DESC) AS rn, COUNT(*) OVER (PARTITION BY state) AS cnt FROM stations) SELECT state, city, lat_n FROM r WHERE rn = 1 AND cnt >= 2 ORDER BY state;');

const m6sql = SQ('m6-sql1', 'sqf-having2', 'Accounts above the average', 'sales',
  'Take each account\'s total of **Closed Won** deals (accounts with none are left out). Return the account `name` and that `total` for accounts whose total is **above the average** of those account totals. Highest total first.',
  'WITH t AS (\n  SELECT a.name, SUM(d.amount) AS total\n  FROM accounts a\n  JOIN deals d ON d.account_id = a.id\n  WHERE d.stage = \'Closed Won\'\n  GROUP BY a.id, a.name\n)\nSELECT name, total\nFROM t\n',
  'WITH t AS (SELECT a.name, SUM(d.amount) AS total FROM accounts a JOIN deals d ON d.account_id = a.id WHERE d.stage = \'Closed Won\' GROUP BY a.id, a.name) SELECT name, total FROM t WHERE total > (SELECT AVG(total) FROM t) ORDER BY total DESC;');

const pick = (arr, ids) => ids.map((id) => arr.find((q) => q.id === id));

const SHAPE = 'Built to match the exam as candidates describe it: 4 multiple choice, 1 SQL problem, 1 coding problem, 1 prompt-engineering problem and 1 written reply, scored out of 170 points. About 90 minutes.';

export const MOCKS = [
  { id: 'mock-1', title: 'Exam replica 1', minutes: 90, blurb: SHAPE, questions: [...pick(m1, ['m1-q9', 'm1-q10', 'm1-q8', 'm1-q12']), ...pick(m1, ['m1-sql1', 'm1-py1', 'm1-pe1', 'm1-w1'])] },
  { id: 'mock-2', title: 'Exam replica 2', minutes: 90, blurb: 'A different set, same shape. Take it after you have studied what replica 1 showed you.', questions: [...pick(m2, ['m2-q9', 'm2-q10', 'm2-q11', 'm2-q12']), ...pick(m2, ['m2-sql1', 'm2-py1', 'm2-pe1', 'm2-w1'])] },
  { id: 'mock-3', title: 'Exam replica 3', minutes: 90, blurb: 'Extra practice, same shape, new questions.', questions: [...m3.slice(0, 4), ...pick(m1, ['m1-sql2', 'm1-py2']), m3[4], m3[5]] },
  { id: 'mock-4', title: 'Exam replica 4', minutes: 90, blurb: 'Extra practice, same shape, new questions.', questions: [...m4.slice(0, 4), ...pick(m2, ['m2-sql2', 'm2-py2']), m4[4], m4[5]] },
  { id: 'mock-5', title: 'Exam replica 5', minutes: 90, blurb: 'All new questions in every section. The SQL problem uses window functions and the coding problem is array navigation.', questions: [...m5.slice(0, 4), m5sql, m5py, m5[4], m5[5]] },
  { id: 'mock-6', title: 'Exam replica 6', minutes: 90, blurb: 'All new questions in every section. The SQL problem uses a CTE and a subquery and the coding problem is string handling.', questions: [...m6.slice(0, 4), m6sql, m6py, m6[4], m6[5]] },
];

// Multiple-choice questions not used in a replica. The review sprint draws on these as well.
const used = new Set(MOCKS.flatMap((k) => k.questions.map((q) => q.id)));
export const SPARE = [...m1, ...m2].filter((q) => q.type === 'mcq' && !used.has(q.id));
