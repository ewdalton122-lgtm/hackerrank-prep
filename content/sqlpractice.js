// Extra SQL drills in the style of the assessment: short tasks, one result table, exact match.
const q = (id, title, minutes, blurb, blocks, ex) => ({ id, title, minutes, blurb, blocks, exercise: { kind: 'sql', ordered: true, ...ex } });

export const sqlDrills = [
  q('sqp-region', 'Revenue by region', 40, 'Join, filter, group and sort in one query.', [
    { t: 'p', text: 'Most assessment questions chain the same four moves: **join** the tables, **filter** with `WHERE`, **group** with `GROUP BY`, then **sort**. Build it one step at a time and run after each step.' },
    { t: 'tip', text: 'Join first and look at the raw rows with `SELECT *`. Then add the filter, then the grouping.' },
  ], {
    prompt: 'Return each account `region` and the **total amount** of its **Closed Won** deals, named `total`. Highest total first.',
    starter: 'SELECT a.region, \nFROM deals d\nJOIN accounts a ON a.id = d.account_id\n',
    solution: "SELECT a.region, SUM(d.amount) AS total FROM deals d JOIN accounts a ON a.id = d.account_id WHERE d.stage = 'Closed Won' GROUP BY a.region ORDER BY total DESC;",
    hints: ['The join is started for you. Add `WHERE d.stage = \'Closed Won\'` after it.', 'Add `SUM(d.amount) AS total` to the SELECT and `GROUP BY a.region`.', 'Finish with `ORDER BY total DESC`.'],
  }),

  q('sqp-allwins', 'Every account, even with no wins', 45, 'LEFT JOIN with the filter in ON, and COALESCE for the zeros.', [
    { t: 'p', text: 'A common exam twist: "include accounts with none, showing 0". That needs a `LEFT JOIN`, and the filter on the right-hand table must go in the `ON` clause, not in `WHERE`.' },
    { t: 'code', text: "SELECT a.name, COALESCE(SUM(d.amount), 0) AS won_total\nFROM accounts a\nLEFT JOIN deals d\n  ON d.account_id = a.id AND d.stage = 'Closed Won'\nGROUP BY a.id, a.name;" },
    { t: 'warn', text: "`WHERE d.stage = 'Closed Won'` runs after the join, and an account with no deals has `NULL` there, so `WHERE` throws it away. Inside `ON`, the condition only decides which deals attach, and every account stays." },
    { t: 'tip', text: '`SUM` of nothing is `NULL`, not 0. `COALESCE(SUM(...), 0)` turns it into 0. For counts, `COUNT(d.id)` already gives 0, but `COUNT(*)` gives 1 because the empty row still counts.' },
  ], {
    prompt: "Return **every** account `name` with `won_total`: the total amount of its **Closed Won** deals. Accounts with no Closed Won deals must still appear, with `0`. Order by `won_total` (highest first), then `name`.",
    starter: 'SELECT a.name\nFROM accounts a\n',
    solution: "SELECT a.name, COALESCE(SUM(d.amount), 0) AS won_total FROM accounts a LEFT JOIN deals d ON d.account_id = a.id AND d.stage = 'Closed Won' GROUP BY a.id, a.name ORDER BY won_total DESC, a.name;",
    hints: ["`LEFT JOIN deals d ON d.account_id = a.id AND d.stage = 'Closed Won'` keeps every account and attaches only the wins.", 'Add `COALESCE(SUM(d.amount), 0) AS won_total` and `GROUP BY a.id, a.name`.', 'Finish with `ORDER BY won_total DESC, a.name`.'],
    traps: [
      { lacks: /LEFT\s+JOIN/i, say: 'a plain `JOIN` drops accounts that have no deals. Use `LEFT JOIN`.' },
      { has: /WHERE[\s\S]*stage/i, say: "the stage filter is in `WHERE`, which removes the accounts with no wins. Move it into the `ON` clause: `ON d.account_id = a.id AND d.stage = 'Closed Won'`." },
      { lacks: /COALESCE|IFNULL/i, say: 'accounts with no wins show `NULL` instead of 0. Wrap the sum: `COALESCE(SUM(d.amount), 0)`.' },
    ],
  }),

  q('sqp-case', 'Bucket deals with CASE', 40, 'CASE WHEN turns numbers into labels.', [
    { t: 'p', text: '`CASE WHEN ... THEN ... ELSE ... END` is the SQL version of Excel\'s `IF`. You can group by the label it creates.' },
    { t: 'code', text: "SELECT CASE WHEN amount >= 50000 THEN 'Large' ELSE 'Small' END AS size,\n       COUNT(*) AS deals\nFROM deals\nGROUP BY size;" },
    { t: 'tip', text: 'In MySQL you can `GROUP BY` the alias. In some other databases you must repeat the whole CASE.' },
  ], {
    prompt: "Label each deal `Large` if its amount is **50,000 or more**, otherwise `Small`. Return the label as `size` and the number of deals as `deals`. Order by `size`.",
    starter: 'SELECT \n  COUNT(*) AS deals\nFROM deals\n',
    solution: "SELECT CASE WHEN amount >= 50000 THEN 'Large' ELSE 'Small' END AS size, COUNT(*) AS deals FROM deals GROUP BY size ORDER BY size;",
    hints: ["Start the label with `CASE WHEN amount >= 50000 THEN 'Large' ELSE 'Small' END AS size`.", 'Add `GROUP BY size` so you get one row per label.', 'Finish with `ORDER BY size`.'],
  }),

  q('sqp-winrate', 'Wins and total deals per rep', 50, 'Conditional counting with SUM(CASE ...).', [
    { t: 'p', text: 'To count only some rows inside a group, put a `CASE` inside `SUM`: add 1 for the rows you want and 0 for the rest.' },
    { t: 'code', text: "SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) AS won" },
    { t: 'analogy', text: 'It is `SUMIF` in Excel, but you build the condition yourself.' },
  ], {
    prompt: 'For each rep return `name`, the number of **Closed Won** deals as `won`, and their **total** number of deals as `total`. Order by rep name.',
    starter: 'SELECT r.name,\nFROM deals d\nJOIN reps r ON r.id = d.rep_id\n',
    solution: "SELECT r.name, SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) AS won, COUNT(*) AS total FROM deals d JOIN reps r ON r.id = d.rep_id GROUP BY r.name ORDER BY r.name;",
    hints: ["`SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) AS won`", '`COUNT(*) AS total` counts all deals in each group.', 'Add `GROUP BY r.name ORDER BY r.name`.'],
  }),

  q('sqp-subquery', 'Above the average', 45, 'A subquery that returns one number.', [
    { t: 'p', text: 'A subquery in parentheses can return a single value that you compare against. Use it when you need to compare each row with a figure calculated from the whole table.' },
    { t: 'code', text: 'SELECT id, amount\nFROM deals\nWHERE amount > (SELECT AVG(amount) FROM deals);' },
  ], {
    prompt: 'Return the `id` and `amount` of every deal **larger than the average deal amount**. Biggest amount first.',
    starter: 'SELECT id, amount\nFROM deals\n',
    solution: 'SELECT id, amount FROM deals WHERE amount > (SELECT AVG(amount) FROM deals) ORDER BY amount DESC;',
    hints: ['The average is `SELECT AVG(amount) FROM deals`. Put it in parentheses.', 'Use it in `WHERE amount > ( ... )`.', 'Finish with `ORDER BY amount DESC`.'],
  }),

  q('sqp-second', 'Second highest', 45, 'A classic interview question.', [
    { t: 'p', text: 'There are two common ways: a subquery that excludes the maximum, or `ORDER BY ... LIMIT 1 OFFSET 1`. Think about which one handles ties (two deals with the same top amount) correctly.' },
    { t: 'code', text: 'SELECT MAX(amount)\nFROM deals\nWHERE amount < (SELECT MAX(amount) FROM deals);' },
  ], {
    prompt: 'Return the **second-highest deal amount** as a single value named `second_highest`.',
    starter: 'SELECT MAX(amount) AS second_highest\nFROM deals\n',
    solution: 'SELECT MAX(amount) AS second_highest FROM deals WHERE amount < (SELECT MAX(amount) FROM deals);',
    hints: ['The highest amount is `SELECT MAX(amount) FROM deals`.', 'Ask for the biggest amount that is **less than** that.', '`WHERE amount < (SELECT MAX(amount) FROM deals)`'],
  }),

  q('sqp-dense', 'Rank reps by won revenue', 55, 'A window function over grouped totals.', [
    { t: 'p', text: 'You can rank the results of a `GROUP BY`. Calculate the totals in a subquery, then add `DENSE_RANK() OVER (ORDER BY total DESC)` outside it.' },
    { t: 'code', text: 'SELECT name, total,\n       DENSE_RANK() OVER (ORDER BY total DESC) AS rnk\nFROM ( ...grouped query... ) t;' },
    { t: 'warn', text: 'Remember the alias on the subquery in `FROM`. MySQL requires it.' },
  ], {
    prompt: "Return each rep's `name`, their total **Closed Won** amount as `total`, and their rank by that total as `rnk` (1 = highest, no gaps for ties). Order by `rnk`, then `name`.",
    starter: "SELECT name, total\nFROM (\n  SELECT r.name AS name, SUM(d.amount) AS total\n  FROM deals d\n  JOIN reps r ON r.id = d.rep_id\n  WHERE d.stage = 'Closed Won'\n  GROUP BY r.name\n) t\n",
    solution: "SELECT name, total, DENSE_RANK() OVER (ORDER BY total DESC) AS rnk FROM (SELECT r.name AS name, SUM(d.amount) AS total FROM deals d JOIN reps r ON r.id = d.rep_id WHERE d.stage = 'Closed Won' GROUP BY r.name) t ORDER BY rnk, name;",
    hints: ['The inner query that calculates `total` is already written.', 'Add `DENSE_RANK() OVER (ORDER BY total DESC) AS rnk` to the outer SELECT.', 'Finish with `ORDER BY rnk, name`.'],
  }),

  q('sqp-cte', 'Big accounts with a CTE', 55, 'WITH makes long queries readable.', [
    { t: 'p', text: 'A **CTE** (common table expression) gives a subquery a name at the top of the query. Read it as "first, calculate this table; then use it below".' },
    { t: 'code', text: 'WITH totals AS (\n  SELECT account_id, SUM(amount) AS total\n  FROM deals\n  GROUP BY account_id\n)\nSELECT ... FROM totals ...;' },
    { t: 'tip', text: 'Exam tasks written as "first find X, then use it for Y" are usually a CTE.' },
  ], {
    prompt: 'Using all deals regardless of stage, find accounts whose **combined deal amount is over 100,000**. Return the account `name` and the combined amount as `total`, biggest first.',
    starter: 'WITH totals AS (\n  SELECT account_id, SUM(amount) AS total\n  FROM deals\n  GROUP BY account_id\n)\nSELECT \nFROM totals\n',
    solution: 'WITH totals AS (SELECT account_id, SUM(amount) AS total FROM deals GROUP BY account_id) SELECT a.name, t.total FROM totals t JOIN accounts a ON a.id = t.account_id WHERE t.total > 100000 ORDER BY t.total DESC;',
    hints: ['The CTE `totals` is written for you. Join it to `accounts` on `a.id = t.account_id`.', 'Filter with `WHERE t.total > 100000`.', 'Select `a.name, t.total` and `ORDER BY t.total DESC`.'],
  }),
];
