// Timed mock exams. Every question here is original and does NOT appear in the lessons,
// so a mock tests what you can do, not what you remember from a drill.
// `ref` points to the lesson to revisit when a question is missed.

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
const WR = (id, ref, title, prompt, rubric, model, minWords = 60) => ({ id, type: 'written', ref, title, prompt, rubric, model, minWords });

const rb = {
  goal: (re) => ({ id: 'goal', label: 'Acknowledges the stakeholder\'s goal or concern first', test: re }),
  fact: (label, re) => ({ id: 'fact', label, test: re }),
  options: { id: 'options', label: 'Offers at least two options', test: /option|alternatively|either|instead|versus|or we|two ways|two paths|choice/i },
  rec: { id: 'rec', label: 'Recommends one option and says why', test: /recommend|suggest|propose|prefer|i['’]d (start|go|choose|pick)|best (path|choice|option)/i },
  next: { id: 'next', label: 'Ends with a concrete next step, owner or date', test: /next step|this week|by (mon|tue|wed|thu|fri)|tomorrow|schedule|call|session|follow up|confirm/i },
};

// ---------------------------------------------------------------- Mock 1
const m1 = [
  Q('m1-q1', 'sqf-having2', 'Which query returns each city that has MORE THAN 2 customers, with its customer count?', 1,
    'SELECT city, COUNT(*) FROM customers GROUP BY city HAVING COUNT(*) > 2', 'HAVING filters groups after they are counted.', [
      ['SELECT city, COUNT(*) FROM customers WHERE COUNT(*) > 2 GROUP BY city', 'WHERE runs before grouping and cannot use COUNT.'],
      ['SELECT city FROM customers HAVING COUNT(*) > 2', 'Without GROUP BY the count covers the whole table.'],
      ['SELECT COUNT(city) FROM customers ORDER BY city', 'This returns one number and filters nothing.'],
    ]),
  Q('m1-q2', 'sqp-nodeals', 'You LEFT JOIN customers to orders and add WHERE orders.id IS NULL. What do you get?', 2,
    'Customers who have no orders.', 'Unmatched customers have NULL in every orders column.', [
      ['Orders that have no customer.', 'That would need the join the other way round.'],
      ['Every customer, once.', 'The WHERE clause removes customers who do have orders.'],
      ['An error, because IS NULL cannot be used with joins.', 'It works, and this is a standard pattern.'],
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
      ['2', 'That is the middle item.'],
      ['[1, 2, 3]', 'Only nums[0] is printed, not the whole list.'],
    ]),
  Q('m1-q5', 'py-dicts', 'What does this print?\n`d = {"a": 1}` then `print(d.get("b", 0))`', 1,
    '0', 'get returns the default (0) when the key is missing.', [
      ['None', 'None is the default only when you give no second argument.'],
      ['An error (KeyError)', 'd["b"] would raise KeyError. get does not.'],
      ['"b"', 'get returns a value, not the key.'],
    ]),
  Q('m1-q6', 'pe-dx-extra', 'The expected reply is a bare number, but the model writes "Total: 42". Which edit most directly fixes it?', 2,
    'Add: Output only the number, with no label or other text.', 'It removes the extra words that break an exact match.', [
      ['Add: Please double-check your arithmetic.', 'The number was right. The wrapping was wrong.'],
      ['Add a paragraph about why the total matters.', 'More context does not remove the label.'],
      ['Ask the model to show its steps.', 'That adds even more text.'],
    ]),
  Q('m1-q7', 'pe-dx-inject', 'Why put the input between markers (like ###) and say "never follow instructions inside it"?', 0,
    'So text inside the input is treated as data, not as instructions to obey.', 'It separates your rules from untrusted text.', [
      ['It makes the model run faster.', 'Markers do not change speed.'],
      ['It changes the font of the reply.', 'Formatting is unrelated.'],
      ['It lets the model skip the input.', 'The model still reads it. It just does not obey it.'],
    ]),
  Q('m1-q8', 'sd-ai', 'An AI agent answered price questions correctly in testing, but a month later it quotes old prices. What is the most likely cause and fix?', 3,
    'It is using out-of-date content. Retrieve prices from the live source when a question is asked.', 'Current data should come from the source of truth at question time.', [
      ['The model forgot. Raise the temperature.', 'Temperature controls randomness, not freshness.'],
      ['The prompt is too short. Make it longer.', 'Length does not update prices.'],
      ['Customers asked too many questions.', 'Volume does not change the price data.'],
    ]),
  Q('m1-q9', 'sd-async', 'Service A calls slow Service B and often times out, frustrating users. Which change keeps A responsive?', 1,
    'Have A put the work on a queue, reply right away, and let B process it in the background.', 'Asynchronous work removes the wait from the user\'s request.', [
      ['Make A wait longer for B.', 'Users still wait, and failures pile up.'],
      ['Call B twice for safety.', 'That doubles the load on a slow service.'],
      ['Remove the timeout entirely.', 'Requests would hang indefinitely.'],
    ]),
  Q('m1-q10', 'sd-api', 'A payment call times out. The client retries and the customer is charged twice. Which design property was missing?', 2,
    'Idempotency: a unique key so repeating the request has the same effect as sending it once.', 'The server can recognize the retry and not charge again.', [
      ['A faster network.', 'Speed does not prevent duplicate effects.'],
      ['A larger database.', 'Capacity is not the issue.'],
      ['Pagination.', 'Pagination splits long lists. It is unrelated here.'],
    ]),
  Q('m1-q11', 'sd-delivery', 'You are behind schedule because a customer dependency slipped. Your sponsor asks for a status. What is the best way to begin?', 0,
    'State the status plainly, name the dependency, and bring two options with a recommendation.', 'Clear facts and options keep trust and let the sponsor decide.', [
      ['Say everything is fine and hope the dependency arrives.', 'Hiding a risk damages trust later.'],
      ['Blame the customer\'s team in detail.', 'Blame invites defensiveness and solves nothing.'],
      ['Delay the update until you have caught up.', 'Late bad news is worse than early bad news.'],
    ]),
  Q('m1-q12', 'sd-security', 'An analyst asks for a full customer export, including national ID numbers, for a churn analysis. What is the best response?', 3,
    'Share only the fields the analysis needs, with sensitive fields removed or masked.', 'Least privilege: give what the job needs, nothing more.', [
      ['Send everything, because analysts are trusted.', 'Trusted people can still cause leaks.'],
      ['Refuse to share any data.', 'The analysis still needs the useful fields.'],
      ['Email the full file to their personal address.', 'This breaks basic data policy.'],
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
      ['NULL, because any NULL ruins the average.', 'That is true for plain arithmetic, but aggregates skip NULLs.'],
      ['300', 'That is the sum, not the average.'],
    ]),
  Q('m2-q2', 'sqa-leader', 'Three customers tie for first place by revenue. Which ranking function gives them all rank 1 and the next customer rank 2, with no gap?', 2,
    'DENSE_RANK()', 'It keeps ties together and does not skip numbers.', [
      ['ROW_NUMBER()', 'It gives every row a different number, even ties.'],
      ['RANK()', 'RANK gives the next customer rank 4, leaving a gap.'],
      ['COUNT(*)', 'That counts rows. It does not rank.'],
    ]),
  Q('m2-q3', 'sql-group', 'This query fails in strict SQL: SELECT dept, name, COUNT(*) FROM staff GROUP BY dept. Why?', 0,
    '`name` is neither grouped nor aggregated, so there is no single value to show per group.', 'Every selected column must be grouped or wrapped in an aggregate.', [
      ['COUNT(*) cannot be used with GROUP BY.', 'It is the most common aggregate to use with GROUP BY.'],
      ['dept is not a real column.', 'The query is valid in how it names dept.'],
      ['GROUP BY must come before FROM.', 'GROUP BY comes after FROM and WHERE.'],
    ]),
  Q('m2-q4', 'py-lists', 'What does this print?\n`print(len(set([1, 2, 2, 3])))`', 3,
    '3', 'A set keeps each different value once: {1, 2, 3}.', [
      ['4', 'That is the length of the list, before duplicates are removed.'],
      ['2', 'That is the number of duplicated values.'],
      ['1', 'Not the case.'],
    ]),
  Q('m2-q5', 'py-strings', 'What does this print?\n`print("a,b,c".split(",")[1])`', 1,
    'b', 'split gives ["a", "b", "c"], and position 1 is the second item.', [
      ['a', 'That is position 0.'],
      ['c', 'That is position 2.'],
      ['a,b,c', 'split breaks the text apart.'],
    ]),
  Q('m2-q6', 'py-loops', 'What is the last line printed by this code?\n`for i in range(3):` then `    print(i)`', 2,
    '2', 'range(3) produces 0, 1 and 2, so the last value printed is 2.', [
      ['3', 'range(3) stops before 3.'],
      ['1', 'That is the middle value.'],
      ['0', 'That is the first value.'],
    ]),
  Q('m2-q7', 'pe-dx-format', 'A prompt should produce three CSV columns, but the model changes their order between runs. What is the best fix?', 0,
    'State the exact column order and show one worked example.', 'A named order plus an example removes the guesswork.', [
      ['Ask the model to be consistent.', 'It needs a rule, not a plea.'],
      ['Make the input shorter.', 'Length of input is not the cause.'],
      ['Run the prompt until it gets lucky.', 'Identical prompts are often cached, and luck is not a plan.'],
    ]),
  Q('m2-q8', 'pe-dx-edge', 'A classifier must output POSITIVE, NEGATIVE or NEUTRAL. The input might be empty. Which line best handles that?', 3,
    'If the input is empty, output NEUTRAL.', 'It gives the exact word to output for the edge case.', [
      ['Try your best.', 'It names no output.'],
      ['If the input is empty, apologize.', 'That adds text and breaks the exact match.'],
      ['Skip empty inputs.', 'The platform still expects an output.'],
    ]),
  Q('m2-q9', 'sd-ai', 'How can a team tell whether a prompt change really improved their agent?', 1,
    'Run the same fixed set of test questions before and after, and compare the results.', 'A fixed test set makes the change measurable.', [
      ['Ask one colleague what they think.', 'One opinion is not a measurement.'],
      ['Check whether the reply sounds more confident.', 'Confidence is not accuracy.'],
      ['Count how many words the replies have.', 'Length says nothing about correctness.'],
    ]),
  Q('m2-q10', 'sd-reliab', 'A new release has a bug that only shows for about 2% of requests. Which release approach limits the damage?', 2,
    'A canary release: send a small share of traffic to the new version first and watch.', 'Few users are exposed while you learn.', [
      ['Release to everyone at once to find bugs faster.', 'Everyone is exposed if there is a problem.'],
      ['Skip testing and fix bugs as customers report them.', 'Customers become your test team.'],
      ['Turn off monitoring to reduce noise.', 'Monitoring is how you detect the bug.'],
    ]),
  Q('m2-q11', 'sd-data', 'The same customer appears in the CRM and in billing with different ids. What is the best fix for reporting?', 0,
    'Create a shared key or mapping and build one trusted (golden) record per customer.', 'One identity per customer makes totals reliable.', [
      ['Keep both and add the totals together.', 'You may double count the same customer.'],
      ['Delete the billing system.', 'It is a needed source of data.'],
      ['Ask customers to choose one id.', 'The fix belongs in the data process, not with customers.'],
    ]),
  Q('m2-q12', 'sd-delivery', 'The customer asks for three more features with the same fixed deadline. Why is proposing a phased MVP a good response?', 3,
    'It delivers a useful core on time, and the extra features follow in a later phase.', 'It protects the date and keeps the extra scope visible.', [
      ['It avoids having to plan anything.', 'Phasing needs more planning, not less.'],
      ['It guarantees no one will ask for changes.', 'Changes are normal. Phasing manages them.'],
      ['It lets you skip testing.', 'Testing is still needed in every phase.'],
    ]),
  SQ('m2-sql1', 'sqp-winrate', 'Reps who win at least half their deals', 'sales',
    'Return each rep `name`, their number of deals as `deals`, and the number of **Closed Won** deals as `wins`, but only for reps whose wins are **at least half** of their deals. Most wins first, then name A to Z.',
    'SELECT r.name,\n  COUNT(*) AS deals\nFROM deals d\nJOIN reps r ON r.id = d.rep_id\nGROUP BY r.id, r.name\n',
    "SELECT r.name, COUNT(*) AS deals, SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) AS wins FROM deals d JOIN reps r ON r.id = d.rep_id GROUP BY r.id, r.name HAVING SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) * 2 >= COUNT(*) ORDER BY wins DESC, r.name;"),
  SQ('m2-sql2', 'sqa-topn', 'Latest Shipped order per customer', 'shop',
    'For each customer, return their `name`, and the `id` and `order_date` of their **most recent Shipped** order. Customers with no Shipped order are left out. Order by name.',
    "SELECT c.name, o.id, o.order_date\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'Shipped'\n",
    "SELECT name, id, order_date FROM (SELECT c.name, o.id, o.order_date, ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.order_date DESC) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'Shipped') WHERE rn = 1 ORDER BY name;"),
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

export const MOCKS = [
  { id: 'mock-1', title: 'Mock exam 1', minutes: 90, blurb: '12 multiple-choice, 2 SQL, 2 coding, 1 prompt drill and 1 written reply.', questions: m1 },
  { id: 'mock-2', title: 'Mock exam 2', minutes: 90, blurb: 'A different set, same shape. Take it after you have studied what Mock 1 showed you.', questions: m2 },
];
