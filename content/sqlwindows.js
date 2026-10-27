// Window-function drills. The SQL exam question is reported to go up to window functions,
// so these are extra graded practice on ranking, neighbours, frames, buckets and running shares.
// Each runs on one of the small practice databases (see sqldata.js).
const mk = (id, title, minutes, blurb, data, blocks, ex, quiz) => ({
  id, title, minutes, blurb, blocks,
  ...(quiz ? { quiz } : {}),
  exercise: { kind: 'sql', ordered: true, data, ...ex },
});

export const sqw = [
  mk('sqw-dense', 'Window drill 1: top distinct salaries with DENSE_RANK', 50, 'When ties must stay together.', 'staff', [
    { t: 'p', text: 'Three ranking functions look alike but treat ties differently. Suppose salaries are 100, 90, 90, 80:' },
    { t: 'table', head: ['Function', 'Gives', 'Rule'], rows: [
      ['`ROW_NUMBER()`', '1, 2, 3, 4', 'Every row gets its own number, even ties.'],
      ['`RANK()`', '1, 2, 2, 4', 'Ties share a number, then it skips ahead.'],
      ['`DENSE_RANK()`', '1, 2, 2, 3', 'Ties share a number, no gaps.'],
    ] },
    { t: 'p', text: 'When a question says "the top 2 **distinct** salaries" or "everyone tied for second place", you want `DENSE_RANK`.' },
    { t: 'tip', text: 'Read the wording for the tie rule. "Exactly N rows" points to `ROW_NUMBER`. "N levels, keep all ties" points to `DENSE_RANK`.' },
  ], {
    prompt: 'Return every employee whose salary is among the **top 2 distinct salaries** in their department: `dept_id`, `name`, `salary`. Everyone who ties at a kept salary is included. Order by `dept_id`, then salary highest first, then name.',
    starter: 'SELECT dept_id, name, salary\nFROM (\n  SELECT dept_id, name, salary,\n         DENSE_RANK() OVER (PARTITION BY ) AS r\n  FROM employees\n)\n',
    solution: 'SELECT dept_id, name, salary FROM (SELECT dept_id, name, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS r FROM employees) WHERE r <= 2 ORDER BY dept_id, salary DESC, name;',
    hints: ['Fill the window: `PARTITION BY dept_id ORDER BY salary DESC`.', 'Outside the parentheses keep the rows with `WHERE r <= 2`.', 'Finish with `ORDER BY dept_id, salary DESC, name`. Department 4 has two people tied at one salary, and both should appear.'],
  }, [
    {
      q: 'Salaries in a department are 100, 90, 90, 80. You want every row holding one of the top 3 DISTINCT salaries (so all four rows). You filter on "rank <= 3". Which function works?',
      options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'None of them'],
      answer: 2,
      explain: ['ROW_NUMBER gives 1, 2, 3, 4, so the 80 is dropped.', 'RANK gives 1, 2, 2, 4. The tie makes it skip 3, so the 80 (rank 4) is dropped.', 'Correct. DENSE_RANK gives 1, 2, 2, 3 with no gaps, so all four rows pass.', 'DENSE_RANK works.'],
    },
  ]),

  mk('sqw-lead', 'Window drill 2: days until the next order with LEAD', 55, 'Look at the next row, within each customer.', 'shop', [
    { t: 'p', text: '`LEAD(x)` returns the value from the **next** row, the mirror of `LAG`. Add `PARTITION BY` to restart for each customer, so one customer\'s last row never borrows from the next customer.' },
    { t: 'code', text: "SELECT customer_id, order_date,\n       LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS next_date\nFROM orders\nWHERE status = 'Shipped';" },
    { t: 'p', text: '`DATEDIFF(later, earlier)` counts the days between two dates. The last row in each group has no next row, so `LEAD` gives `NULL`, and so does `DATEDIFF`.' },
    { t: 'warn', text: 'The `WHERE` clause runs **before** the window functions. Only the rows that survive the filter are visible to `LEAD` and `LAG`.' },
  ], {
    prompt: 'For every **Shipped** order, return `customer_id`, the order `id`, `order_date`, and `days_to_next`: the days from this order to the same customer\'s next Shipped order (`NULL` for their last one). Order by `customer_id`, then `order_date`.',
    starter: "SELECT customer_id, id, order_date,\n       DATEDIFF(LEAD(order_date) OVER (PARTITION BY ), order_date) AS days_to_next\nFROM orders\nWHERE status = 'Shipped'\n",
    solution: "SELECT customer_id, id, order_date, DATEDIFF(LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date), order_date) AS days_to_next FROM orders WHERE status = 'Shipped' ORDER BY customer_id, order_date;",
    hints: ['Fill the window with `PARTITION BY customer_id ORDER BY order_date`.', '`DATEDIFF(next_date, order_date)` is positive when the next date is later.', 'End with `ORDER BY customer_id, order_date`.'],
  }, [
    {
      q: 'You filter with WHERE status = \'Shipped\' and also use LAG(order_date) OVER (...). A Cancelled order sits between two Shipped ones. What does LAG see?',
      options: ['The Cancelled order, because LAG looks at every row in the table', 'The earlier Shipped order, because the filter removed the Cancelled row first', 'NULL, because the sequence was broken', 'It depends on the database'],
      answer: 1,
      explain: ['The filter runs first, so the Cancelled row is not in the window at all.', 'Correct. WHERE runs before window functions, so the Cancelled row is invisible.', 'LAG only returns NULL for the first row of a partition.', 'This ordering is part of standard SQL, not a database quirk.'],
    },
  ]),

  mk('sqw-moving', 'Window drill 3: a moving average with a frame', 55, 'Only the last three rows count.', 'sales', [
    { t: 'p', text: 'A window function can look at all rows in its partition, or at a smaller **frame** around the current row. The frame is written after `ORDER BY`:' },
    { t: 'code', text: 'AVG(amount) OVER (\n  ORDER BY close_date\n  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n)' },
    { t: 'p', text: 'This averages the current row and the two before it. For the first row there is nothing before, so it just averages what exists.' },
    { t: 'analogy', text: 'It is the Excel formula `=AVERAGE(B2:B4)` copied down, with the range sliding one row at a time.' },
    { t: 'tip', text: '`ROWS` counts physical rows. `RANGE` groups rows with equal sort values. For moving averages, use `ROWS`.' },
  ], {
    prompt: 'For **Closed Won** deals, return `id`, `close_date`, `amount`, and `moving_avg`: the average amount of this deal and the two deals before it (by close date), rounded to a whole number with `ROUND(..., 0)`. Order by `close_date`.',
    starter: "SELECT id, close_date, amount,\n       ROUND(AVG(amount) OVER (ORDER BY close_date ), 0) AS moving_avg\nFROM deals\nWHERE stage = 'Closed Won'\n",
    solution: "SELECT id, close_date, amount, ROUND(AVG(amount) OVER (ORDER BY close_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) AS moving_avg FROM deals WHERE stage = 'Closed Won' ORDER BY close_date;",
    hints: ['Without a frame the average covers every earlier row. Add a frame after the `ORDER BY`.', 'The frame is `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`.', 'Finish with `ORDER BY close_date` outside the window as well.'],
  }, [
    {
      q: 'What does AVG(x) OVER (ORDER BY d) return when no frame is written?',
      options: ['The average of the current row only', 'The running average from the first row up to the current row', 'The average of the whole table on every row', 'An error'],
      answer: 1,
      explain: ['That would need a frame of just CURRENT ROW.', 'Correct. With an ORDER BY and no frame, the default frame runs from the first row to the current one.', 'That is what you get with OVER () and no ORDER BY.', 'It is valid SQL.'],
    },
  ]),

  mk('sqw-firstlast', 'Window drill 4: compare each row to the first with FIRST_VALUE', 50, 'Bring one value from the start of the group onto every row.', 'sales', [
    { t: 'p', text: '`FIRST_VALUE(x) OVER (PARTITION BY g ORDER BY d)` copies the first row\'s `x` in each group onto every row of that group. It is useful for "change since the first deal" style questions.' },
    { t: 'code', text: 'SELECT rep_id, close_date, amount,\n       FIRST_VALUE(amount) OVER (PARTITION BY rep_id ORDER BY close_date) AS first_amount\nFROM deals;' },
    { t: 'warn', text: '`LAST_VALUE` is a trap. With the default frame it stops at the **current row**, so it just returns the current row\'s own value. To get the true last value, add `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.' },
  ], {
    prompt: 'For **Closed Won** deals, return the rep `name`, `close_date`, `amount`, and `first_amount`: the amount of that rep\'s earliest Closed Won deal. Order by `name`, then `close_date`.',
    starter: "SELECT r.name, d.close_date, d.amount,\n       FIRST_VALUE(d.amount) OVER (PARTITION BY ) AS first_amount\nFROM deals d\nJOIN reps r ON r.id = d.rep_id\nWHERE d.stage = 'Closed Won'\n",
    solution: "SELECT r.name, d.close_date, d.amount, FIRST_VALUE(d.amount) OVER (PARTITION BY d.rep_id ORDER BY d.close_date) AS first_amount FROM deals d JOIN reps r ON r.id = d.rep_id WHERE d.stage = 'Closed Won' ORDER BY r.name, d.close_date;",
    hints: ['Fill the window with `PARTITION BY d.rep_id ORDER BY d.close_date`.', 'Each rep restarts, so the first row for each rep shows its own amount twice.', 'Finish with `ORDER BY r.name, d.close_date`.'],
  }, [
    {
      q: 'You write LAST_VALUE(amount) OVER (PARTITION BY rep ORDER BY close_date) and every row just shows its own amount. Why?',
      options: ['The data has no duplicates', 'The default frame ends at the current row, so the "last" row it sees is the current one', 'LAST_VALUE only works without a PARTITION BY', 'The ORDER BY must be descending'],
      answer: 1,
      explain: ['Duplicates have nothing to do with it.', 'Correct. Extend the frame to UNBOUNDED FOLLOWING, or use FIRST_VALUE with the opposite sort.', 'It works with PARTITION BY. The frame is the issue.', 'Sorting descending would just make the default frame end at the other side. A proper frame is the real fix.'],
    },
  ]),

  mk('sqw-ntile', 'Window drill 5: spend tiers with NTILE', 50, 'Cut a ranked list into equal buckets.', 'shop', [
    { t: 'p', text: '`NTILE(n)` splits the ordered rows into `n` buckets of near-equal size and returns the bucket number. `NTILE(4)` makes quartiles, `NTILE(10)` makes deciles.' },
    { t: 'code', text: 'SELECT name, revenue,\n       NTILE(3) OVER (ORDER BY revenue DESC) AS tier\nFROM rev;' },
    { t: 'list', items: [
      'Bucket 1 holds the highest revenues here, because of `ORDER BY revenue DESC`.',
      'When the rows do not divide evenly, the **earlier** buckets get the extra rows. Seven rows in three buckets gives sizes 3, 2, 2.',
      'Tied values can land in different buckets, so add a tie-breaker (like the name) to the `ORDER BY`.',
    ] },
  ], {
    prompt: 'Using each customer\'s revenue from **Shipped** orders (customers with none are left out), split customers into 3 spend tiers with `NTILE(3)`, tier 1 being the biggest spenders. Return `name`, `revenue`, `tier`. Break revenue ties by name inside the window. Order by `tier`, then revenue highest first, then name.',
    starter: "WITH rev AS (\n  SELECT c.name, SUM(i.qty * p.price) AS revenue\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY c.id, c.name\n)\nSELECT name, revenue,\n       NTILE(3) OVER (ORDER BY ) AS tier\nFROM rev\n",
    solution: "WITH rev AS (SELECT c.name, SUM(i.qty * p.price) AS revenue FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY c.id, c.name) SELECT name, revenue, NTILE(3) OVER (ORDER BY revenue DESC, name) AS tier FROM rev ORDER BY tier, revenue DESC, name;",
    hints: ['The revenue per customer is already built in the `rev` block.', 'Fill the window with `ORDER BY revenue DESC, name`.', 'Finish with `ORDER BY tier, revenue DESC, name`.'],
  }, [
    {
      q: 'Ten rows are split with NTILE(3). How many rows land in each bucket?',
      options: ['3, 3, 4', '4, 3, 3', '3, 4, 3', '10, 0, 0'],
      answer: 1,
      explain: ['The extra row goes to the first bucket, not the last.', 'Correct. The earlier buckets absorb the remainder, so ten rows give 4, 3, 3.', 'The extra row goes to the first bucket.', 'NTILE spreads rows across the buckets.'],
    },
  ]),

  mk('sqw-gap', 'Window drill 6: the longest gap between orders', 60, 'Window first, then summarize it.', 'shop', [
    { t: 'p', text: 'Many questions need two steps: use a window function to compute something per row, then **summarize** it. You cannot put `MAX` around a window function in the same `SELECT`, so do it in two layers with a `WITH` block.' },
    { t: 'code', text: "WITH g AS (\n  SELECT customer_id,\n         DATEDIFF(order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS gap\n  FROM orders\n  WHERE status = 'Shipped'\n)\nSELECT customer_id, MAX(gap)\nFROM g\nGROUP BY customer_id;" },
    { t: 'p', text: 'A customer with only one order has a `NULL` gap, and `MAX` of nothing but `NULL` is `NULL`. Filter those out if the question asks for it.' },
  ], {
    prompt: 'For each customer with **two or more Shipped orders**, return `name` and `longest_gap`: the most days between two consecutive Shipped orders. Customers with only one Shipped order are left out. Order by `longest_gap` highest first, then name.',
    starter: "WITH g AS (\n  SELECT c.name,\n         DATEDIFF(o.order_date, LAG(o.order_date) OVER (PARTITION BY )) AS gap\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  WHERE o.status = 'Shipped'\n)\nSELECT name, MAX(gap) AS longest_gap\nFROM g\n",
    solution: "WITH g AS (SELECT c.name, DATEDIFF(o.order_date, LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date)) AS gap FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'Shipped') SELECT name, MAX(gap) AS longest_gap FROM g GROUP BY name HAVING MAX(gap) IS NOT NULL ORDER BY longest_gap DESC, name;",
    hints: ['Fill the window with `PARTITION BY o.customer_id ORDER BY o.order_date`.', 'Group the outer query: `GROUP BY name`.', 'Remove single-order customers with `HAVING MAX(gap) IS NOT NULL`, then `ORDER BY longest_gap DESC, name`.'],
  }),

  mk('sqw-cumshare', 'Window drill 7: cumulative percent of the total', 55, 'A running total divided by a grand total, in one query.', 'shop', [
    { t: 'p', text: 'Two window functions side by side give a cumulative share. One adds up to the current row, and one adds up everything:' },
    { t: 'code', text: 'SUM(revenue) OVER (ORDER BY month)   -- running total\nSUM(revenue) OVER ()                 -- grand total, same on every row' },
    { t: 'p', text: 'Divide one by the other and multiply by 100. Use `100.0` rather than `100` so the division is not rounded down to a whole number.' },
    { t: 'analogy', text: 'It is the "cumulative % of revenue" column in a Pareto chart.' },
  ], {
    prompt: 'For **Shipped** orders, return each `month` (like `2026-03`), its `revenue` (qty times price), and `cum_pct`: the running total of revenue up to and including that month as a percent of all Shipped revenue, rounded to 1 decimal place. Order by month.',
    starter: "WITH m AS (\n  SELECT SUBSTR(o.order_date, 1, 7) AS month,\n         SUM(i.qty * p.price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'Shipped'\n  GROUP BY month\n)\nSELECT month, revenue,\n       ROUND(100.0 * SUM(revenue) OVER (ORDER BY month) / , 1) AS cum_pct\nFROM m\n",
    solution: "WITH m AS (SELECT SUBSTR(o.order_date, 1, 7) AS month, SUM(i.qty * p.price) AS revenue FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.status = 'Shipped' GROUP BY month) SELECT month, revenue, ROUND(100.0 * SUM(revenue) OVER (ORDER BY month) / SUM(revenue) OVER (), 1) AS cum_pct FROM m ORDER BY month;",
    hints: ['The top part of the division (the running total) is already written. You need the bottom part: the total of all months.', 'Use `SUM(revenue) OVER ()`. Empty parentheses mean every row is in one window.', 'Finish with `ORDER BY month`. The last month should show 100.'],
  }),

  mk('sqw-second', 'Window drill 8: the Nth row per group', 50, 'Second-best, third-best, and so on.', 'sales', [
    { t: 'p', text: 'To get the **second** largest in each group, number the rows with `ROW_NUMBER`, sorted largest first, and keep `rn = 2`. The same pattern gives any Nth place.' },
    { t: 'code', text: 'SELECT name, amount\nFROM (\n  SELECT r.name, d.amount,\n         ROW_NUMBER() OVER (PARTITION BY d.rep_id ORDER BY d.amount DESC) AS rn\n  FROM deals d JOIN reps r ON r.id = d.rep_id\n)\nWHERE rn = 2;' },
    { t: 'warn', text: 'If two rows tie for first, `ROW_NUMBER` still gives the second one the number 2. If the question means "second **distinct** value", use `DENSE_RANK` instead.' },
  ], {
    prompt: 'For each rep, return the rep `name`, and the `id` and `amount` of their **second largest deal** (any stage). Order by name.',
    starter: 'SELECT name, id, amount\nFROM (\n  SELECT r.name, d.id, d.amount,\n         ROW_NUMBER() OVER (PARTITION BY ) AS rn\n  FROM deals d\n  JOIN reps r ON r.id = d.rep_id\n)\n',
    solution: 'SELECT name, id, amount FROM (SELECT r.name, d.id, d.amount, ROW_NUMBER() OVER (PARTITION BY d.rep_id ORDER BY d.amount DESC) AS rn FROM deals d JOIN reps r ON r.id = d.rep_id) WHERE rn = 2 ORDER BY name;',
    hints: ['Fill the window with `PARTITION BY d.rep_id ORDER BY d.amount DESC`.', 'Filter outside with `WHERE rn = 2`.', 'End with `ORDER BY name`.'],
  }),
];
