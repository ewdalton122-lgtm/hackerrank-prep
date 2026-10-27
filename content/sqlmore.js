// More SQL lessons and graded exercises. Each runs on its own small practice database (see sqldata.js).
// Practice runs SQLite, which is close to MySQL. Where they differ, the lesson says so.
const mk = (id, title, minutes, blurb, data, blocks, ex, quiz) => ({
  id, title, minutes, blurb, blocks,
  ...(quiz ? { quiz } : {}),
  exercise: { kind: 'sql', ordered: true, data, ...ex },
});

// ---------------------------------------------------------------- Stage 2: foundations
export const sqf = [
  mk('sqf-distinct', 'Unique values with DISTINCT', 30, 'Remove duplicates from a result.', 'staff', [
    { t: 'p', text: 'Many rows can share the same value. `SELECT DISTINCT` returns each different value **once**.' },
    { t: 'code', text: 'SELECT DISTINCT dept_id\nFROM employees\nORDER BY dept_id;' },
    { t: 'analogy', text: '`DISTINCT` is Excel\'s **Remove Duplicates** button, applied to the columns you select.' },
    { t: 'tip', text: 'With two columns, `DISTINCT` keeps each different **pair**, not each different value in either column.' },
  ], {
    prompt: 'Return each different job `title` held by an employee, listed A to Z. One column.',
    starter: 'SELECT \nFROM employees\n',
    solution: 'SELECT DISTINCT title FROM employees ORDER BY title;',
    hints: ['You only need the `title` column.', 'Write `SELECT DISTINCT title` so each title appears once.', 'Finish with `ORDER BY title`.'],
  }),

  mk('sqf-order', 'Top N: ORDER BY and LIMIT', 35, 'Get the 5 biggest, and break ties on purpose.', 'staff', [
    { t: 'p', text: '`ORDER BY` sorts and `LIMIT n` keeps only the first n rows. Together they answer "top 5" questions.' },
    { t: 'code', text: 'SELECT name, salary\nFROM employees\nORDER BY salary DESC, name\nLIMIT 3;' },
    { t: 'list', items: [
      'Sort by several columns with commas: the second column breaks ties in the first.',
      '`DESC` goes **after** the column it applies to. `salary DESC, name` means salary high to low, then name A to Z.',
    ] },
    { t: 'warn', text: 'If two rows tie at the cut-off and you gave no tie-breaker, the database may return either one. Exam questions often name the tie-breaker. Always include it.' },
  ], {
    prompt: 'Return the `name` and `salary` of the **5 highest paid** employees. Highest salary first. If two people have the same salary, list the name that comes first alphabetically.',
    starter: 'SELECT name, salary\nFROM employees\n',
    solution: 'SELECT name, salary FROM employees ORDER BY salary DESC, name LIMIT 5;',
    hints: ['Sort with `ORDER BY salary DESC`.', 'Add the tie-breaker: `ORDER BY salary DESC, name`.', 'Add `LIMIT 5` at the very end.'],
  }),

  mk('sqf-like', 'Pattern matching with LIKE', 40, 'Find text that starts, ends or contains something.', 'stations', [
    { t: 'p', text: '`LIKE` matches text against a pattern. `%` stands for any run of characters (including none). `_` stands for exactly one character.' },
    { t: 'code', text: "WHERE city LIKE 'P%'      -- starts with P\nWHERE city LIKE '%a'      -- ends with a\nWHERE city LIKE '%or%'    -- contains or\nWHERE city LIKE '_o%'     -- second letter is o" },
    { t: 'tip', text: 'For "starts with a vowel", write one `LIKE` for each vowel joined by `OR`. MySQL also lets you write `city REGEXP \'^[aeiou]\'`, and that works here too.' },
    { t: 'warn', text: 'Always wrap the pattern in single quotes. `LIKE` ignores upper and lower case in this practice database.' },
  ], {
    prompt: 'Return each different `city` whose name **starts with a vowel** (A, E, I, O or U). A to Z.',
    starter: 'SELECT DISTINCT city\nFROM stations\n',
    solution: "SELECT DISTINCT city FROM stations WHERE city LIKE 'A%' OR city LIKE 'E%' OR city LIKE 'I%' OR city LIKE 'O%' OR city LIKE 'U%' ORDER BY city;",
    hints: ["One test looks like `city LIKE 'A%'`.", 'Join five of them with `OR`, one per vowel.', 'Finish with `ORDER BY city`.'],
  }),

  mk('sqf-null', 'NULL and COALESCE', 45, 'Blank values break arithmetic unless you handle them.', 'staff', [
    { t: 'p', text: '`NULL` means **unknown or missing**. It is not zero and not an empty string. Any math with NULL gives NULL: `5 + NULL` is `NULL`.' },
    { t: 'code', text: 'SELECT name, commission\nFROM employees\nWHERE commission IS NULL;   -- never = NULL\n\nSELECT name, salary + COALESCE(commission, 0) AS total_pay\nFROM employees;' },
    { t: 'analogy', text: 'An empty cell in Excel behaves like zero in a SUM but breaks a formula that points at it. `COALESCE(x, 0)` says "use x, but if it is blank, use 0 instead".' },
    { t: 'tip', text: '`COALESCE` takes the first value that is not NULL. MySQL also has `IFNULL(x, 0)`, which does the same for two values.' },
  ], {
    prompt: "For employees whose `title` ends in **Manager**, return `name` and their total pay as `total_pay` (salary plus commission, counting a missing commission as 0). Highest total pay first.",
    starter: 'SELECT name,\nFROM employees\n',
    solution: "SELECT name, salary + COALESCE(commission, 0) AS total_pay FROM employees WHERE title LIKE '%Manager' ORDER BY total_pay DESC;",
    hints: ["Filter with `WHERE title LIKE '%Manager'`.", 'Compute `salary + COALESCE(commission, 0) AS total_pay`.', 'Sort with `ORDER BY total_pay DESC`.'],
  }, [
    {
      q: 'An employee has salary 50000 and a NULL commission. What does salary + commission return?',
      options: ['50000', '0', 'NULL', 'An error'],
      answer: 2,
      explain: ['It would only be 50000 if NULL counted as zero, and it does not.', 'NULL is not zero.', 'Correct. Any math with NULL gives NULL, so wrap the column in COALESCE.', 'No error. The result is just NULL.'],
    },
    {
      q: 'Which test finds employees with no commission?',
      options: ['WHERE commission = NULL', 'WHERE commission = 0', 'WHERE commission IS NULL', "WHERE commission = ''"],
      answer: 2,
      explain: ['Nothing equals NULL, so this returns no rows.', 'Zero is a real value, different from missing.', 'Correct. IS NULL is the only test for blanks.', 'An empty string is text, not NULL.'],
    },
  ]),

  mk('sqf-strings', 'Text functions: LENGTH, UPPER, SUBSTR', 40, 'Measure and reshape text.', 'stations', [
    { t: 'p', text: 'Text functions work on one value per row.' },
    { t: 'list', items: [
      '`LENGTH(city)` counts characters.',
      '`UPPER(city)` and `LOWER(city)` change case.',
      '`SUBSTR(city, 1, 3)` takes 3 characters starting at position **1** (positions start at 1, not 0).',
      '`CONCAT(a, \'-\', b)` joins text. MySQL has it, and it works in this practice database too.',
    ] },
    { t: 'code', text: 'SELECT city, LENGTH(city) AS len\nFROM stations\nORDER BY len, city\nLIMIT 1;' },
    { t: 'tip', text: 'To find the shortest or longest, sort by `LENGTH(...)` and take `LIMIT 1`. Add the tie-breaker the question asks for.' },
  ], {
    prompt: 'Return the **shortest** city name and its length. Columns: `city`, `len`. If several share the shortest length, return the one that comes first alphabetically. One row.',
    starter: 'SELECT city, \nFROM stations\n',
    solution: 'SELECT city, LENGTH(city) AS len FROM stations ORDER BY len, city LIMIT 1;',
    hints: ['`LENGTH(city) AS len` gives the length of each name.', 'Sort by `len` first, then `city` for the tie-break.', 'Keep one row with `LIMIT 1`.'],
  }),

  mk('sqf-concat', 'Building text with CONCAT', 35, 'Combine columns into one label.', 'stations', [
    { t: 'p', text: 'Reports often need one text column built from several. `CONCAT` glues pieces together in the order you give them.' },
    { t: 'code', text: "SELECT CONCAT(city, ', ', state) AS place\nFROM stations;" },
    { t: 'warn', text: 'If any piece is `NULL`, the whole `CONCAT` result is `NULL` in MySQL. Wrap possibly-blank columns in `COALESCE`.' },
    { t: 'tip', text: 'SQLite (used for some other tools) joins text with `||` instead: `city || \', \' || state`.' },
  ], {
    prompt: "For stations whose `city` starts with **P**, return one column `tag`: the city in lower case, a dash, then the state in lower case (like `portland-or`). Sort by `tag`.",
    starter: 'SELECT \nFROM stations\n',
    solution: "SELECT CONCAT(LOWER(city), '-', LOWER(state)) AS tag FROM stations WHERE city LIKE 'P%' ORDER BY tag;",
    hints: ["Filter with `WHERE city LIKE 'P%'`.", "Build it with `CONCAT(LOWER(city), '-', LOWER(state)) AS tag`.", 'Finish with `ORDER BY tag`.'],
  }),

  mk('sqf-math', 'Arithmetic and ROUND', 40, 'Spread, averages and rounding.', 'stations', [
    { t: 'p', text: 'SQL does math on columns row by row, and aggregates like `MAX`, `MIN`, `AVG`, `SUM` combine rows. You can mix them: `MAX(x) - MIN(x)`.' },
    { t: 'code', text: 'SELECT ROUND(AVG(lat_n), 2) AS avg_lat,\n       ROUND(MAX(lat_n) - MIN(lat_n), 4) AS spread\nFROM stations;' },
    { t: 'p', text: '`ROUND(x, 2)` rounds to 2 decimal places. `ROUND(x, 0)` rounds to a whole number.' },
    { t: 'warn', text: 'Division trap: in this practice database `7 / 2` is `3` (whole-number division), while MySQL gives `3.5`. To be safe, make one side a decimal: `7 * 1.0 / 2`.' },
  ], {
    prompt: 'In one row, return the **range** of the `long_w` column (largest minus smallest) rounded to **4 decimal places**, named `spread`.',
    starter: 'SELECT \nFROM stations\n',
    solution: 'SELECT ROUND(MAX(long_w) - MIN(long_w), 4) AS spread FROM stations;',
    hints: ['`MAX(long_w) - MIN(long_w)` gives the range.', 'Wrap it: `ROUND( ... , 4)`.', 'Name it with `AS spread`.'],
  }),

  mk('sqf-case', 'Classify rows with CASE', 45, 'Return a label chosen by rules, checked in order.', 'stations', [
    { t: 'p', text: '`CASE` checks its `WHEN` conditions **top to bottom** and uses the first one that is true. Put the special cases first and the general case last.' },
    { t: 'code', text: "SELECT id,\n  CASE WHEN a = b AND b = c THEN 'Equilateral'\n       WHEN a = b OR b = c OR a = c THEN 'Isosceles'\n       ELSE 'Scalene'\n  END AS kind\nFROM triangles;" },
    { t: 'tip', text: 'The order is part of the logic. An all-equal triangle also matches the "two equal" test, which is why Equilateral is checked first.' },
    { t: 'p', text: 'A shape is **not a triangle** when the two shorter sides do not add up to more than the longest side. You can test all three pairs: `a + b <= c OR a + c <= b OR b + c <= a`.' },
  ], {
    prompt: "For each row of `triangles`, return `id` and `kind`. `kind` is `Not A Triangle` if any two sides add up to **no more than** the third, otherwise `Equilateral` (all sides equal), `Isosceles` (exactly two equal) or `Scalene` (none equal). Order by `id`.",
    starter: 'SELECT id,\n  CASE\n    WHEN \n  END AS kind\nFROM triangles\n',
    solution: "SELECT id, CASE WHEN a + b <= c OR a + c <= b OR b + c <= a THEN 'Not A Triangle' WHEN a = b AND b = c THEN 'Equilateral' WHEN a = b OR b = c OR a = c THEN 'Isosceles' ELSE 'Scalene' END AS kind FROM triangles ORDER BY id;",
    hints: ['Check "Not A Triangle" **first**: `WHEN a + b <= c OR a + c <= b OR b + c <= a THEN ...`.', 'Then `a = b AND b = c` is Equilateral, then `a = b OR b = c OR a = c` is Isosceles.', 'Everything else is `ELSE \'Scalene\'`. Finish with `ORDER BY id`.'],
  }),

  mk('sqf-countd', 'COUNT(*), COUNT(column) and COUNT(DISTINCT)', 40, 'Three different questions that all say "count".', 'staff', [
    { t: 'list', items: [
      '`COUNT(*)` counts **rows**.',
      '`COUNT(column)` counts rows where that column is **not NULL**.',
      '`COUNT(DISTINCT column)` counts **different** non-NULL values.',
    ] },
    { t: 'code', text: 'SELECT COUNT(*)                AS rows_total,\n       COUNT(commission)       AS has_commission,\n       COUNT(DISTINCT dept_id) AS departments\nFROM employees;' },
    { t: 'warn', text: 'Most "wrong count" bugs are one of these three mixed up with another. Ask: do I want rows, non-blank values, or different values?' },
  ], {
    prompt: 'In one row, return `total_rows` (all employees), `with_commission` (employees who have a commission) and `titles` (the number of different job titles).',
    starter: 'SELECT \nFROM employees\n',
    solution: 'SELECT COUNT(*) AS total_rows, COUNT(commission) AS with_commission, COUNT(DISTINCT title) AS titles FROM employees;',
    hints: ['`COUNT(*)` counts every row.', '`COUNT(commission)` skips NULLs automatically.', '`COUNT(DISTINCT title)` counts each title once.'],
  }, [
    {
      q: 'A column has 10 rows: 6 hold a value and 4 are NULL. What does COUNT(column) return?',
      options: ['10', '6', '4', 'NULL'],
      answer: 1,
      explain: ['That is COUNT(*), which counts every row.', 'Correct. COUNT(column) counts only the non-NULL values.', 'That is the number of NULLs.', 'COUNT never returns NULL. It returns 0 when nothing counts.'],
    },
  ]),

  mk('sqf-having2', 'Filtering groups with HAVING', 45, 'WHERE filters rows before grouping, HAVING filters groups after.', 'staff', [
    { t: 'p', text: '`WHERE` runs **before** grouping, so it cannot see totals. `HAVING` runs **after** and can use aggregates like `COUNT(*)` or `AVG(salary)`.' },
    { t: 'code', text: 'SELECT dept_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) >= 4;' },
    { t: 'analogy', text: 'Build the pivot table first (GROUP BY), then filter the pivot rows (HAVING).' },
    { t: 'tip', text: 'Use both together: `WHERE` to drop rows you never want, `HAVING` to drop groups that fail the test.' },
  ], {
    prompt: 'Return each department (`dept_id`) with at least **4 employees** and an **average salary above 80,000**. Columns: `dept_id`, `headcount`, `avg_salary` (average rounded to a whole number). Order by `dept_id`.',
    starter: 'SELECT dept_id,\nFROM employees\nGROUP BY dept_id\n',
    solution: 'SELECT dept_id, COUNT(*) AS headcount, ROUND(AVG(salary)) AS avg_salary FROM employees GROUP BY dept_id HAVING COUNT(*) >= 4 AND AVG(salary) > 80000 ORDER BY dept_id;',
    hints: ['Add `COUNT(*) AS headcount` and `ROUND(AVG(salary)) AS avg_salary` to the SELECT.', 'After GROUP BY add `HAVING COUNT(*) >= 4 AND AVG(salary) > 80000`.', 'Finish with `ORDER BY dept_id`.'],
  }),

  mk('sqf-multijoin', 'Joining three tables', 50, 'Customers to orders to items to products.', 'shop', [
    { t: 'p', text: 'Real questions often need three or four tables. Chain the joins: each `JOIN ... ON` links the next table to one you already have.' },
    { t: 'code', text: 'SELECT c.city, SUM(i.qty * p.price) AS revenue\nFROM orders o\nJOIN customers c   ON c.id = o.customer_id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p    ON p.id = i.product_id\nWHERE o.status = \'Shipped\'\nGROUP BY c.city;' },
    { t: 'tip', text: 'Build it one join at a time and run after each. Start with `SELECT *` so you can see whether each join is linking on the right columns.' },
    { t: 'warn', text: 'Revenue is `qty * price` per item row, then summed. Summing `price` alone ignores quantity.' },
  ], {
    prompt: 'Return each customer `city` and the total revenue of its **Shipped** orders as `revenue` (quantity times price, added up). Highest revenue first, then city A to Z.',
    starter: 'SELECT c.city, \nFROM orders o\nJOIN customers c ON c.id = o.customer_id\n',
    solution: "SELECT c.city, SUM(i.qty * p.price) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY c.city ORDER BY revenue DESC, c.city;",
    hints: ['Add `JOIN order_items i ON i.order_id = o.id` and `JOIN products p ON p.id = i.product_id`.', "Filter with `WHERE o.status = 'Shipped'` and add `SUM(i.qty * p.price) AS revenue` with `GROUP BY c.city`.", 'Finish with `ORDER BY revenue DESC, c.city`.'],
  }),

  mk('sqf-selfjoin', 'Joining a table to itself', 45, 'Employees and their managers live in the same table.', 'staff', [
    { t: 'p', text: 'When a table points at itself (here `manager_id` holds another employee\'s `id`), join it to **itself** under two different nicknames.' },
    { t: 'code', text: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON m.id = e.manager_id;' },
    { t: 'analogy', text: 'It is a VLOOKUP into the same sheet: take `manager_id`, look it up in the `id` column, bring back the name.' },
    { t: 'warn', text: 'A plain `JOIN` drops people with no manager (their `manager_id` is NULL). Use `LEFT JOIN` if you want them listed too.' },
  ], {
    prompt: 'Return each employee `name` and their manager\'s name as `manager`. Only employees who **have** a manager. Order by employee name.',
    starter: 'SELECT e.name, \nFROM employees e\n',
    solution: 'SELECT e.name, m.name AS manager FROM employees e JOIN employees m ON m.id = e.manager_id ORDER BY e.name;',
    hints: ['Join the table to itself: `JOIN employees m`.', 'Link them with `ON m.id = e.manager_id`.', 'Select `m.name AS manager` and finish with `ORDER BY e.name`.'],
  }),

  mk('sqf-union', 'Stacking results with UNION ALL', 35, 'Combine two queries into one list.', 'staff', [
    { t: 'p', text: '`UNION ALL` stacks the rows of two queries. Both must return the **same number of columns** in the same order. `UNION` (without ALL) also removes duplicates.' },
    { t: 'code', text: "SELECT name, 'employee' AS kind FROM employees WHERE dept_id = 3\nUNION ALL\nSELECT name, 'contractor' FROM contractors\nORDER BY kind, name;" },
    { t: 'tip', text: 'A single `ORDER BY` at the very end sorts the combined result. Column names come from the first query.' },
  ], {
    prompt: "Return one list with `name` and `kind`: every **Support** employee (department 3) with kind `employee`, and every contractor with kind `contractor`. Order by `kind`, then `name`.",
    starter: "SELECT name, 'employee' AS kind\nFROM employees\n",
    solution: "SELECT name, 'employee' AS kind FROM employees WHERE dept_id = 3 UNION ALL SELECT name, 'contractor' FROM contractors ORDER BY kind, name;",
    hints: ['The first query is started for you. Add `WHERE dept_id = 3`.', "Add `UNION ALL` and a second query: `SELECT name, 'contractor' FROM contractors`.", 'Put one `ORDER BY kind, name` at the very end.'],
  }),

  mk('sqf-in', 'IN with a subquery', 40, 'Filter by a list that another query builds.', 'staff', [
    { t: 'p', text: 'A **subquery** is a query inside parentheses. With `IN`, it supplies the list to match against.' },
    { t: 'code', text: "SELECT name\nFROM employees\nWHERE dept_id IN (SELECT id FROM departments WHERE city = 'Chicago');" },
    { t: 'analogy', text: 'First work out the answer list on scratch paper (departments in Chicago), then use it to filter the main sheet.' },
    { t: 'tip', text: 'A subquery used with `IN` must return exactly **one column**.' },
  ], {
    prompt: 'Return the `name` of each employee who works in a department located in **Austin**. A to Z.',
    starter: 'SELECT name\nFROM employees\nWHERE dept_id IN (\n)\n',
    solution: "SELECT name FROM employees WHERE dept_id IN (SELECT id FROM departments WHERE city = 'Austin') ORDER BY name;",
    hints: ["The subquery picks department ids: `SELECT id FROM departments WHERE city = 'Austin'`.", 'Put it inside the parentheses after `IN`.', 'Finish with `ORDER BY name`.'],
  }),

  mk('sqf-exists', 'Who has no matching rows? NOT EXISTS', 45, 'Customers with no Shipped order.', 'shop', [
    { t: 'p', text: '`NOT EXISTS` keeps a row only if the inner query finds **nothing** for it. The inner query refers to the outer row, so it runs once per customer.' },
    { t: 'code', text: "SELECT c.name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'Shipped'\n);" },
    { t: 'warn', text: 'Avoid `NOT IN (subquery)` when the subquery column can contain `NULL`. One NULL makes the whole test return no rows. `NOT EXISTS` and `LEFT JOIN ... IS NULL` are safe.' },
    { t: 'tip', text: '`SELECT 1` is a convention: the inner query only needs to find *a* row, not return anything useful.' },
  ], {
    prompt: 'Return the `name` of each customer who has **no Shipped order** (including customers with no orders at all). A to Z.',
    starter: 'SELECT c.name\nFROM customers c\nWHERE \n',
    solution: "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'Shipped') ORDER BY c.name;",
    hints: ['Use `WHERE NOT EXISTS ( ... )`.', "Inside, look for this customer's Shipped orders: `SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'Shipped'`.", 'Finish with `ORDER BY c.name`.'],
  }, [
    {
      q: 'Why is NOT IN (SELECT some_column ...) risky?',
      options: ['It is always slow', 'If the subquery returns any NULL, the test matches no rows', 'It cannot use two tables', 'It sorts the result differently'],
      answer: 1,
      explain: ['Speed is not the problem here.', 'Correct. "Not equal to unknown" is unknown, so one NULL makes every row fail the test.', 'It works across tables fine.', 'It has nothing to do with sorting.'],
    },
  ]),
];

// ---------------------------------------------------------------- Stage 3: advanced
export const sqa = [
  mk('sqa-topn', 'Top N per group with ROW_NUMBER', 55, 'The most asked advanced question.', 'staff', [
    { t: 'p', text: '`ROW_NUMBER() OVER (PARTITION BY group ORDER BY sort)` numbers rows 1, 2, 3 **inside each group**. Then you keep the rows numbered 1 and 2.' },
    { t: 'code', text: 'SELECT *\nFROM (\n  SELECT dept_id, name, salary,\n         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC, name) AS rn\n  FROM employees\n)\nWHERE rn <= 2;' },
    { t: 'warn', text: 'You cannot filter on a window function in the same `SELECT`. Wrap the query and filter outside, as above (or use a `WITH` block).' },
    { t: 'tip', text: '`ROW_NUMBER` gives each row a unique number. `RANK` and `DENSE_RANK` give ties the **same** number, so they can return more rows than N.' },
  ], {
    prompt: 'Return the **2 highest paid** employees in each department: `dept_id`, `name`, `salary`. Ties on salary go to the name that comes first alphabetically. Order by `dept_id`, then salary highest first, then name.',
    starter: 'SELECT dept_id, name, salary\nFROM (\n  SELECT dept_id, name, salary,\n         ROW_NUMBER() OVER (PARTITION BY ) AS rn\n  FROM employees\n)\n',
    solution: 'SELECT dept_id, name, salary FROM (SELECT dept_id, name, salary, ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC, name) AS rn FROM employees) WHERE rn <= 2 ORDER BY dept_id, salary DESC, name;',
    hints: ['Fill the window: `PARTITION BY dept_id ORDER BY salary DESC, name`.', 'Outside the parentheses add `WHERE rn <= 2`.', 'Finish with `ORDER BY dept_id, salary DESC, name`.'],
  }, [
    {
      q: 'Department 4 has two analysts tied on salary. If you used RANK() instead of ROW_NUMBER() to keep rank <= 2, what could happen?',
      options: ['Nothing, the result is identical', 'Tied people share a rank, so you can get more than 2 rows for that department', 'The query fails', 'Both tied people are dropped'],
      answer: 1,
      explain: ['Ties are exactly where they differ.', 'Correct. RANK gives tied rows the same number, so more than N rows can pass the filter.', 'It runs fine.', 'Ties are kept, not dropped.'],
    },
  ]),

  mk('sqa-lag', 'Compare to the previous row with LAG', 55, 'Month-over-month change.', 'shop', [
    { t: 'p', text: '`LAG(x) OVER (ORDER BY ...)` returns the value of `x` from the **previous row**. `LEAD` looks at the next row. The first row has no previous one, so it gets `NULL`.' },
    { t: 'code', text: "WITH m AS (\n  SELECT SUBSTR(order_date, 1, 7) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n)\nSELECT month, orders,\n       orders - LAG(orders) OVER (ORDER BY month) AS diff\nFROM m\nORDER BY month;" },
    { t: 'analogy', text: 'In Excel it is `=B3-B2` filled down a column. `LAG` makes "the row above" available to SQL.' },
    { t: 'tip', text: '`SUBSTR(order_date, 1, 7)` turns `2026-03-12` into `2026-03`, a handy month label because dates here are stored as text.' },
  ], {
    prompt: 'For **Shipped** orders, return each `month` (like `2026-03`), its `revenue` (qty times price), and `diff`: revenue minus the previous month\'s revenue. The first month has `NULL` for diff. Order by month.',
    starter: "WITH m AS (\n  SELECT SUBSTR(o.order_date, 1, 7) AS month,\n         SUM(i.qty * p.price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY month\n)\nSELECT month, revenue\nFROM m\n",
    solution: "WITH m AS (SELECT SUBSTR(o.order_date, 1, 7) AS month, SUM(i.qty * p.price) AS revenue FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY month) SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS diff FROM m ORDER BY month;",
    hints: ['The monthly revenue is already built for you inside `m`.', 'Add a third column: `revenue - LAG(revenue) OVER (ORDER BY month) AS diff`.', 'Finish with `ORDER BY month`.'],
  }),

  mk('sqa-share', 'Share of total with SUM() OVER ()', 50, 'A percent of the grand total next to each row.', 'shop', [
    { t: 'p', text: 'A window function with an **empty** `OVER ()` looks at the whole result. `SUM(revenue) OVER ()` is the grand total, repeated on every row, so you can divide by it without a second query.' },
    { t: 'code', text: 'SELECT category, revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct\nFROM ( ... one row per category ... );' },
    { t: 'tip', text: 'Multiply by `100.0` (with the decimal) so the division gives a decimal, not a whole number.' },
    { t: 'analogy', text: 'Every row gets the SUM at the bottom of the column, so each row can compute its own "% of total".' },
  ], {
    prompt: 'For **Shipped** orders, return each product `category`, its `revenue`, and `pct`: that category\'s share of all revenue as a percent rounded to **1 decimal**. Highest revenue first.',
    starter: "SELECT category, revenue\nFROM (\n  SELECT p.category, SUM(i.qty * p.price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY p.category\n)\n",
    solution: "SELECT category, revenue, ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct FROM (SELECT p.category, SUM(i.qty * p.price) AS revenue FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY p.category) ORDER BY revenue DESC;",
    hints: ['The inner query already gives one row per category.', 'Add `ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct` to the outer SELECT.', 'Finish with `ORDER BY revenue DESC`.'],
  }),

  mk('sqa-pivot', 'Pivot with conditional sums', 50, 'Turn categories into columns.', 'staff', [
    { t: 'p', text: 'SQL has no pivot button. You build one by putting a `CASE` inside `SUM`: add 1 for the rows that belong in the column and 0 for the rest.' },
    { t: 'code', text: "SELECT dept_id,\n  SUM(CASE WHEN salary >= 100000 THEN 1 ELSE 0 END) AS high,\n  SUM(CASE WHEN salary <  100000 THEN 1 ELSE 0 END) AS other\nFROM employees\nGROUP BY dept_id;" },
    { t: 'analogy', text: 'Each `SUM(CASE ...)` is a `COUNTIFS` for one column of your pivot table.' },
    { t: 'tip', text: '`YEAR(hire_date)` returns the year of a date, a MySQL function that works in this practice database.' },
  ], {
    prompt: 'For each department, return the department `name` (from the `departments` table), `before_2020` (employees hired before 2020) and `since_2020` (hired in 2020 or later). Departments with no employees can be left out. Order by department name.',
    starter: 'SELECT d.name,\nFROM departments d\nJOIN employees e ON e.dept_id = d.id\n',
    solution: 'SELECT d.name, SUM(CASE WHEN YEAR(e.hire_date) < 2020 THEN 1 ELSE 0 END) AS before_2020, SUM(CASE WHEN YEAR(e.hire_date) >= 2020 THEN 1 ELSE 0 END) AS since_2020 FROM departments d JOIN employees e ON e.dept_id = d.id GROUP BY d.name ORDER BY d.name;',
    hints: ['Write one `SUM(CASE WHEN YEAR(e.hire_date) < 2020 THEN 1 ELSE 0 END) AS before_2020`.', 'Write the second with `>= 2020` and name it `since_2020`.', 'Add `GROUP BY d.name` and `ORDER BY d.name`.'],
  }),

  mk('sqa-span', 'First, last and the gap between', 50, 'MIN, MAX and DATEDIFF per customer.', 'shop', [
    { t: 'p', text: 'Combine `MIN` and `MAX` on a date column to find the first and last event per group. `DATEDIFF(later, earlier)` returns the number of days between them.' },
    { t: 'code', text: 'SELECT customer_id,\n       MIN(order_date) AS first_order,\n       MAX(order_date) AS last_order,\n       DATEDIFF(MAX(order_date), MIN(order_date)) AS days\nFROM orders\nGROUP BY customer_id;' },
    { t: 'tip', text: 'Dates written as `2026-03-12` sort correctly as text, so `MIN` and `MAX` work on them directly.' },
    { t: 'warn', text: 'Put the **later** date first in `DATEDIFF`, otherwise the answer is negative.' },
  ], {
    prompt: 'For each customer with **at least 2 Shipped orders**, return `name`, `first_order`, `last_order` (dates of their Shipped orders) and `days` between them. Longest gap first, then name A to Z.',
    starter: 'SELECT c.name,\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = \'Shipped\'\n',
    solution: "SELECT c.name, MIN(o.order_date) AS first_order, MAX(o.order_date) AS last_order, DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS days FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'Shipped' GROUP BY c.id, c.name HAVING COUNT(*) >= 2 ORDER BY days DESC, c.name;",
    hints: ['Add `MIN(o.order_date)`, `MAX(o.order_date)` and `DATEDIFF(MAX(...), MIN(...)) AS days`.', 'Group with `GROUP BY c.id, c.name` and keep groups with `HAVING COUNT(*) >= 2`.', 'Finish with `ORDER BY days DESC, c.name`.'],
  }),

  mk('sqa-rising', 'Orders bigger than the last one', 60, 'LAG inside each customer.', 'shop', [
    { t: 'p', text: 'Add `PARTITION BY` to `LAG` and it looks at the previous row **within the same group**: the customer\'s previous order, not the previous order in the whole table.' },
    { t: 'code', text: 'LAG(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_total' },
    { t: 'p', text: 'Then compare in an outer query: `WHERE total > prev_total`. A customer\'s first order has `prev_total = NULL`, and a comparison with NULL is never true, so first orders drop out automatically.' },
    { t: 'tip', text: 'Two steps: (1) a `WITH` block that totals each order, (2) a second block that adds `LAG`. Name each step and build it up.' },
  ], {
    prompt: 'For **Shipped** orders, return the order `id` and `total` (qty times price, added up) for orders whose total is **greater than the same customer\'s previous Shipped order**. Order by `id`.',
    starter: "WITH t AS (\n  SELECT o.id, o.customer_id, o.order_date, SUM(i.qty * p.price) AS total\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY o.id\n)\nSELECT id, total\nFROM t\n",
    solution: "WITH t AS (SELECT o.id, o.customer_id, o.order_date, SUM(i.qty * p.price) AS total FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY o.id), l AS (SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_total FROM t) SELECT id, total FROM l WHERE total > prev_total ORDER BY id;",
    hints: ['Add a second block: `, l AS (SELECT id, total, LAG(total) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_total FROM t)`.', 'Select from `l` instead of `t`.', 'Keep `WHERE total > prev_total` and `ORDER BY id`.'],
  }),

  mk('sqa-above', 'Above their own group\'s average', 55, 'Compare each row to its group.', 'staff', [
    { t: 'p', text: 'To compare each row with a number about its **group**, a window average is the shortest route: `AVG(salary) OVER (PARTITION BY dept_id)` puts the department average on every row of that department.' },
    { t: 'code', text: 'SELECT name, salary,\n       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg\nFROM employees;' },
    { t: 'p', text: 'Wrap it and filter outside: `WHERE salary > dept_avg`. The older way is a **correlated subquery**, a subquery that mentions the outer row: `salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)`. Both are fine.' },
  ], {
    prompt: 'Return `dept_id`, `name` and `salary` for employees who earn **more than the average salary of their own department**. Order by `dept_id`, then salary highest first, then name.',
    starter: 'SELECT dept_id, name, salary\nFROM (\n  SELECT dept_id, name, salary,\n         AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg\n  FROM employees\n)\n',
    solution: 'SELECT dept_id, name, salary FROM (SELECT dept_id, name, salary, AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg FROM employees) WHERE salary > dept_avg ORDER BY dept_id, salary DESC, name;',
    hints: ['The inner query already adds `dept_avg` to every row.', 'Filter outside with `WHERE salary > dept_avg`.', 'Finish with `ORDER BY dept_id, salary DESC, name`.'],
  }),

  mk('sqa-leader', 'Build a leaderboard with DENSE_RANK', 55, 'Group, filter groups, then rank.', 'shop', [
    { t: 'p', text: 'A leaderboard is three steps: **total** each customer (GROUP BY), **drop** the ones that do not qualify (HAVING), then **rank** the totals (window function). A window function can rank grouped results in the same query because it runs after the grouping.' },
    { t: 'code', text: 'SELECT DENSE_RANK() OVER (ORDER BY SUM(x) DESC) AS place,\n       name, SUM(x) AS total\nFROM ...\nGROUP BY name;' },
    { t: 'tip', text: '`DENSE_RANK` gives tied rows the same place and does not skip numbers: 1, 2, 2, 3. `RANK` would give 1, 2, 2, 4.' },
  ], {
    prompt: 'Rank customers with **at least 2 Shipped orders** by lifetime Shipped revenue (qty times price). Return `place` (DENSE_RANK, highest revenue = 1), `name` and `revenue`. Order by `place`, then name.',
    starter: "SELECT DENSE_RANK() OVER (ORDER BY ) AS place,\n       c.name,\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON p.id = i.product_id\nWHERE o.status = 'Shipped'\n",
    solution: "SELECT DENSE_RANK() OVER (ORDER BY SUM(i.qty * p.price) DESC) AS place, c.name, SUM(i.qty * p.price) AS revenue FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY c.id, c.name HAVING COUNT(DISTINCT o.id) >= 2 ORDER BY place, c.name;",
    hints: ['Fill the window with `ORDER BY SUM(i.qty * p.price) DESC` and add `SUM(i.qty * p.price) AS revenue`.', 'Add `GROUP BY c.id, c.name` and `HAVING COUNT(DISTINCT o.id) >= 2`.', 'Finish with `ORDER BY place, c.name`.'],
  }),

  mk('sqa-friends', 'Exam-level join: best friends and salaries', 65, 'Join the same table twice to compare two people.', 'school', [
    { t: 'p', text: 'This shape appears in assessments: **one table tells you who is linked to whom**, another holds a number for each person, and you must compare the two people\'s numbers.' },
    { t: 'code', text: 'SELECT s.name\nFROM students s\nJOIN friends f   ON f.id = s.id\nJOIN packages me ON me.id = s.id          -- my number\nJOIN packages pal ON pal.id = f.friend_id -- my friend\'s number\nWHERE pal.salary > me.salary;' },
    { t: 'tip', text: 'Join the same table twice with two nicknames (`me`, `pal`). Say out loud which nickname means which person. Most mistakes come from mixing them up.' },
    { t: 'analogy', text: 'It is two VLOOKUPs into the same price list: one using my id, one using my friend\'s id. Then compare the two results.' },
  ], {
    prompt: 'Return the `name` of each student whose **best friend got a higher salary offer** than they did. Order the result by the **friend\'s** salary (lowest first).',
    starter: 'SELECT s.name\nFROM students s\nJOIN friends f ON f.id = s.id\n',
    solution: 'SELECT s.name FROM students s JOIN friends f ON f.id = s.id JOIN packages me ON me.id = s.id JOIN packages pal ON pal.id = f.friend_id WHERE pal.salary > me.salary ORDER BY pal.salary;',
    hints: ['Join `packages` once for the student: `JOIN packages me ON me.id = s.id`.', 'Join it again for the friend: `JOIN packages pal ON pal.id = f.friend_id`.', 'Keep `WHERE pal.salary > me.salary` and sort with `ORDER BY pal.salary`.'],
  }),
];
