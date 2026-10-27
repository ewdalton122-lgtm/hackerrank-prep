// Stages 2-3: SQL. Practice runs in your browser on a small sales dataset.
export const DATASET = `
CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, industry TEXT, region TEXT);
CREATE TABLE reps (id INTEGER PRIMARY KEY, name TEXT, team TEXT);
CREATE TABLE deals (id INTEGER PRIMARY KEY, account_id INTEGER, rep_id INTEGER, amount INTEGER, stage TEXT, close_date TEXT);

INSERT INTO accounts VALUES
 (1,'Acme Retail','Retail','East'),(2,'Bluebird Bank','Financial Services','East'),
 (3,'Cedar Health','Healthcare','West'),(4,'Delta Logistics','Logistics','Central'),
 (5,'Evergreen Foods','Retail','West'),(6,'Fjord Insurance','Financial Services','Central'),
 (7,'Granite Energy','Energy','West'),(8,'Harbor Telecom','Telecom','East'),
 (9,'Ivy Education','Education','Central'),(10,'Juniper Media','Media','East');

INSERT INTO reps VALUES (1,'Priya Shah','Strategic'),(2,'Marcus Lee','Commercial'),(3,'Dana Cruz','Strategic'),(4,'Sam Ortiz','Commercial');

INSERT INTO deals VALUES
 (1,1,1,42000,'Closed Won','2026-01-15'),(2,1,2,18000,'Closed Lost','2026-02-10'),
 (3,2,1,95000,'Closed Won','2026-02-20'),(4,2,3,60000,'Negotiation','2026-04-30'),
 (5,3,2,30000,'Closed Won','2026-03-05'),(6,3,4,75000,'Proposal','2026-05-15'),
 (7,4,3,52000,'Closed Won','2026-03-18'),(8,4,1,21000,'Closed Lost','2026-01-28'),
 (9,5,4,48000,'Closed Won','2026-04-02'),(10,5,2,12000,'Proposal','2026-06-01'),
 (11,6,3,120000,'Negotiation','2026-05-20'),(12,6,1,88000,'Closed Won','2026-04-14'),
 (13,7,4,67000,'Closed Won','2026-02-27'),(14,7,2,33000,'Proposal','2026-06-12'),
 (15,8,1,54000,'Closed Won','2026-05-08'),(16,8,3,26000,'Closed Lost','2026-03-22');
`;

export const SCHEMA_DOC = [
  { table: 'accounts', cols: 'id, name, industry, region', note: '10 customer accounts' },
  { table: 'reps', cols: 'id, name, team', note: '4 sales reps' },
  { table: 'deals', cols: 'id, account_id, rep_id, amount, stage, close_date', note: '16 deals. stage is Closed Won, Closed Lost, Negotiation or Proposal. close_date looks like 2026-03-18' },
];

const note = 'Practice here runs SQLite, which is close to MySQL. Where the two differ, the lesson says so.';

export const sql = [
  {
    id: 'sql-select',
    title: 'SELECT, WHERE and ORDER BY',
    minutes: 50,
    blurb: 'Pull the columns you want, filter the rows, and sort them.',
    blocks: [
      { t: 'p', text: 'A **table** is a sheet: rows are records, columns are fields. A query reads from a table and returns a new, smaller table.' },
      { t: 'code', text: 'SELECT name, industry\nFROM accounts\nWHERE region = \'East\'\nORDER BY name;' },
      { t: 'list', items: [
        '`SELECT` picks the columns. `SELECT *` means all of them.',
        '`FROM` names the table.',
        '`WHERE` keeps only rows that match. Text goes in **single quotes**.',
        '`ORDER BY` sorts. Add `DESC` for largest-first.',
      ] },
      { t: 'analogy', text: '`SELECT ... WHERE` is a filtered view of a sheet: choose the columns to show, then apply a filter.' },
      { t: 'tip', text: 'Combine filters with `AND` / `OR`. Test for blanks with `IS NULL`, never `= NULL`.' },
      { t: 'warn', text: note },
    ],
    quiz: [
      {
        q: 'Which clause keeps only rows that meet a condition?',
        options: ['SELECT', 'FROM', 'WHERE', 'ORDER BY'],
        answer: 2,
        explain: ['SELECT chooses columns, not rows.', 'FROM names the table.', 'Correct. WHERE filters rows.', 'ORDER BY only sorts.'],
      },
      {
        q: "How do you filter for the text East?",
        options: ['WHERE region = East', "WHERE region = 'East'", 'WHERE region = "East" (double quotes)', 'WHERE region == East'],
        answer: 1,
        explain: [
          'Without quotes SQL looks for a column called East.',
          'Correct. Text values go in single quotes.',
          'Double quotes work in some databases but are meant for column names. Single quotes are the safe habit.',
          'SQL uses a single `=` to compare.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return the **names** of all accounts in the **Retail** industry, sorted alphabetically (A to Z). One column.',
      starter: '-- Write your query here\nSELECT \nFROM accounts\n',
      solution: "SELECT name FROM accounts WHERE industry = 'Retail' ORDER BY name;",
      ordered: true,
      hints: [
        'You only need the `name` column from the `accounts` table.',
        "Filter with `WHERE industry = 'Retail'` (single quotes).",
        'Finish with `ORDER BY name`.',
      ],
    },
  },
  {
    id: 'sql-filter',
    title: 'Combining conditions and sorting',
    minutes: 45,
    blurb: 'AND, OR, comparisons and sorting largest first.',
    blocks: [
      { t: 'p', text: 'Use `AND` when **both** must be true and `OR` when **either** can be. Use comparison operators for numbers: `>`, `>=`, `<`, `<=`, `<>` (not equal).' },
      { t: 'code', text: "SELECT id, amount\nFROM deals\nWHERE stage = 'Closed Won'\n  AND amount >= 50000\nORDER BY amount DESC;" },
      { t: 'tip', text: '`IN` is a shortcut for several ORs: `stage IN (\'Proposal\', \'Negotiation\')`. `BETWEEN 10 AND 20` includes both ends.' },
      { t: 'warn', text: 'Do not put commas or quotes around numbers (`amount >= 50000`, not `\'50000\'`).' },
    ],
    quiz: [
      {
        q: "What does WHERE stage = 'Proposal' OR stage = 'Negotiation' return?",
        options: ['Rows in both stages at once', 'Rows in either stage', 'No rows', 'Only Negotiation'],
        answer: 1,
        explain: [
          'A single row has one stage, so it cannot be both.',
          'Correct. OR keeps a row when either condition is true.',
          'Several rows match.',
          'Both stages match.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return the `id` and `amount` of deals that are **Closed Won** and worth **at least 50,000**. Largest amount first.',
      starter: 'SELECT \nFROM deals\n',
      solution: "SELECT id, amount FROM deals WHERE stage = 'Closed Won' AND amount >= 50000 ORDER BY amount DESC;",
      ordered: true,
      hints: [
        'Two conditions joined by `AND`.',
        "`stage = 'Closed Won' AND amount >= 50000`",
        'Sort with `ORDER BY amount DESC`.',
      ],
    },
  },
  {
    id: 'sql-group',
    title: 'GROUP BY and aggregates',
    minutes: 55,
    blurb: 'The SQL version of a pivot table.',
    blocks: [
      { t: 'p', text: '**Aggregates** collapse many rows into one number: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `GROUP BY` does it once per group.' },
      { t: 'code', text: 'SELECT stage, SUM(amount) AS total\nFROM deals\nGROUP BY stage;' },
      { t: 'analogy', text: '`GROUP BY` is a **pivot table**: rows = the group, values = SUM or COUNT. `AS total` just names the column.' },
      { t: 'warn', text: 'Rule: every column in `SELECT` is either in the `GROUP BY` or wrapped in an aggregate. That rule explains most GROUP BY errors.' },
    ],
    quiz: [
      {
        q: 'Which query gives the number of deals per stage?',
        options: [
          'SELECT stage, COUNT(*) FROM deals;',
          'SELECT stage, COUNT(*) FROM deals GROUP BY stage;',
          'SELECT COUNT(stage) FROM deals GROUP BY amount;',
          'SELECT stage FROM deals GROUP BY COUNT(*);',
        ],
        answer: 1,
        explain: [
          'Without GROUP BY, the count covers the whole table and `stage` has no single value to show.',
          'Correct. One row per stage, with its count.',
          'This groups by amount, not stage.',
          'You group by a column, not by an aggregate.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return each deal `stage` and the **total amount** for it, with the total named `total`. Order by stage (A to Z).',
      starter: 'SELECT stage, \nFROM deals\n',
      solution: 'SELECT stage, SUM(amount) AS total FROM deals GROUP BY stage ORDER BY stage;',
      ordered: true,
      hints: [
        'Use `SUM(amount)` to add up the amounts.',
        'Add `GROUP BY stage` so you get one row per stage.',
        'Finish with `ORDER BY stage`.',
      ],
    },
  },
  {
    id: 'sql-having',
    title: 'HAVING: filter the groups',
    minutes: 40,
    blurb: 'WHERE filters rows before grouping; HAVING filters groups after.',
    blocks: [
      { t: 'p', text: '`WHERE` runs **before** grouping, so it cannot see totals. Use `HAVING` to filter on an aggregate.' },
      { t: 'code', text: 'SELECT rep_id, COUNT(*) AS deal_count\nFROM deals\nGROUP BY rep_id\nHAVING COUNT(*) >= 4;' },
      { t: 'analogy', text: '`HAVING` is a filter on the pivot table\'s **totals**, not on the raw rows underneath.' },
      { t: 'p', text: 'SQL processes your clauses in this order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.' },
    ],
    quiz: [
      {
        q: 'You want groups whose total is above 100,000. Which fits?',
        options: ['WHERE SUM(amount) > 100000', 'HAVING SUM(amount) > 100000', 'ORDER BY SUM(amount) > 100000', 'GROUP BY SUM(amount) > 100000'],
        answer: 1,
        explain: [
          'WHERE runs before grouping, so SQL has no sum to compare yet and will raise an error.',
          'Correct. HAVING filters the groups after they are built.',
          'ORDER BY sorts. It does not filter.',
          'GROUP BY takes a column, not a condition.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return `rep_id` and the number of deals as `deal_count`, only for reps with **at least 4** deals. Order by `rep_id`.',
      starter: 'SELECT rep_id, \nFROM deals\n',
      solution: 'SELECT rep_id, COUNT(*) AS deal_count FROM deals GROUP BY rep_id HAVING COUNT(*) >= 4 ORDER BY rep_id;',
      ordered: true,
      hints: [
        'Count with `COUNT(*) AS deal_count` and group by `rep_id`.',
        'The filter on the count belongs in `HAVING`, not `WHERE`.',
        '`HAVING COUNT(*) >= 4`',
      ],
    },
  },
  {
    id: 'sql-join',
    title: 'JOIN: connecting tables',
    minutes: 60,
    blurb: 'Match rows between two tables on a shared id.',
    blocks: [
      { t: 'p', text: 'Data lives in several tables linked by ids. A `JOIN` lines them up. Here `deals.account_id` points at `accounts.id`.' },
      { t: 'code', text: 'SELECT a.name, d.amount\nFROM deals d\nJOIN accounts a ON a.id = d.account_id;' },
      { t: 'analogy', text: 'A `JOIN` is an XLOOKUP between two sheets on a shared ID. `a` and `d` are short **aliases** so you do not retype the table names.' },
      { t: 'tip', text: 'Say which table each column comes from (`a.name`). If both tables have an `id` column, SQL will complain about an "ambiguous column" until you do.' },
    ],
    quiz: [
      {
        q: "What does ON a.id = d.account_id do?",
        options: ['Sorts both tables', 'Says which rows to match between the tables', 'Deletes unmatched rows from the database', 'Renames the columns'],
        answer: 1,
        explain: [
          'It does not sort anything.',
          'Correct. It is the matching rule: rows pair up when these two values are equal.',
          'A query never changes the stored data.',
          'Renaming is done with AS.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return the **account name** and **amount** for every **Closed Won** deal, biggest amount first. Two columns: the name, then the amount.',
      starter: 'SELECT \nFROM deals d\n',
      solution: "SELECT a.name, d.amount FROM deals d JOIN accounts a ON a.id = d.account_id WHERE d.stage = 'Closed Won' ORDER BY d.amount DESC;",
      ordered: true,
      hints: [
        'Start from `deals d` and `JOIN accounts a ON a.id = d.account_id`.',
        "Filter with `WHERE d.stage = 'Closed Won'`.",
        'Pick `a.name, d.amount` and add `ORDER BY d.amount DESC`.',
      ],
    },
  },
  {
    id: 'sql-left',
    title: 'LEFT JOIN: find what is missing',
    minutes: 45,
    blurb: 'Keep every row from the first table, even with no match.',
    blocks: [
      { t: 'p', text: 'A plain `JOIN` drops rows with no match. A `LEFT JOIN` keeps every row from the **left** table and fills the right side with `NULL` when nothing matches.' },
      { t: 'code', text: 'SELECT a.name\nFROM accounts a\nLEFT JOIN deals d ON d.account_id = a.id\nWHERE d.id IS NULL;' },
      { t: 'analogy', text: 'A `LEFT JOIN` keeps every row of the left sheet even when the lookup returns `#N/A`. Filtering on `IS NULL` finds exactly those misses.' },
    ],
    quiz: [
      {
        q: 'You need accounts that have never had a deal. Which join and filter?',
        options: [
          'INNER JOIN, then WHERE d.id IS NOT NULL',
          'LEFT JOIN from accounts, then WHERE d.id IS NULL',
          'LEFT JOIN from deals, then WHERE a.id IS NULL',
          'GROUP BY account and SUM',
        ],
        answer: 1,
        explain: [
          'That finds accounts with deals, the opposite of what you need.',
          'Correct. Accounts without matches show NULL on the deal side.',
          'This starts from the wrong table. Accounts must be on the left.',
          'A sum would give totals, not the missing rows.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'Return the **names** of accounts that have **no deals**, alphabetically.',
      starter: 'SELECT a.name\nFROM accounts a\n',
      solution: 'SELECT a.name FROM accounts a LEFT JOIN deals d ON d.account_id = a.id WHERE d.id IS NULL ORDER BY a.name;',
      ordered: true,
      hints: [
        'Start from `accounts a` and `LEFT JOIN deals d ON d.account_id = a.id`.',
        'Accounts with no match have `NULL` in every `d` column.',
        'Filter with `WHERE d.id IS NULL`, then `ORDER BY a.name`.',
      ],
    },
  },
  {
    id: 'sql-r-bolt',
    optional: true,
    title: 'Course: SQLBolt lessons 1 to 12',
    minutes: 300,
    blurb: 'Interactive lessons from SELECT through joins, aggregates and subqueries.',
    links: [
      { label: 'SQLBolt', url: 'https://sqlbolt.com/', use: 'Lessons 1 to 12, then the Subqueries topic. Skip lessons 13 to 18 (INSERT, UPDATE, DELETE, CREATE).' },
      { label: 'Backup: SQLZoo', url: 'https://sqlzoo.net/wiki/SQL_Tutorial', use: 'Sections 0 to 9, especially "SELECT within SELECT" and "SUM and COUNT".' },
    ],
  },
  {
    id: 'sql-r-hr1',
    optional: true,
    title: 'Practice: HackerRank Weather Station series (recommended)',
    minutes: 300,
    blurb: 'A candidate who took the exam recommends the Weather Station series (1 to 18) for SQL practice. Same editor and grader style as the real thing.',
    links: [
      { label: 'HackerRank SQL domain', url: 'https://www.hackerrank.com/domains/sql', use: 'Choose MySQL in the language dropdown.' },
      { label: 'Select All', url: 'https://www.hackerrank.com/challenges/select-all-sql/problem', use: 'Warm-up' },
      { label: 'Revising the Select Query I', url: 'https://www.hackerrank.com/challenges/revising-the-select-query/problem', use: 'Warm-up' },
      { label: 'Weather Observation Station 1', url: 'https://www.hackerrank.com/challenges/weather-observation-station-1/problem', use: 'Start of the series. Work through 1 to 18 in order; stations 1 to 12 are the core.' },
      ...Array.from({ length: 17 }, (_, i) => ({ label: `Weather Observation Station ${i + 2}`, url: `https://www.hackerrank.com/challenges/weather-observation-station-${i + 2}/problem`, use: i + 2 <= 12 ? 'Core' : 'Stretch' })),
      { label: 'Type of Triangle', url: 'https://www.hackerrank.com/challenges/what-type-of-triangle/problem', use: 'Core: CASE WHEN' },
      { label: 'Revising Aggregations: The Count Function', url: 'https://www.hackerrank.com/challenges/revising-aggregations-the-count-function/problem', use: 'Core' },
    ],
  },
  {
    id: 'sql-r-hr2',
    optional: true,
    title: 'Practice: HackerRank SQL joins (Population Census, African Cities)',
    minutes: 420,
    blurb: 'Harder, multi-table problems. Aim for 3 of 5 in under 20 minutes each.',
    links: [
      { label: 'Population Census', url: 'https://www.hackerrank.com/challenges/asian-population/problem', use: 'Warm-up join' },
      { label: 'African Cities', url: 'https://www.hackerrank.com/challenges/african-cities/problem', use: 'Warm-up join' },
      { label: 'The Report', url: 'https://www.hackerrank.com/challenges/the-report/problem', use: 'Core' },
      { label: 'Top Competitors', url: 'https://www.hackerrank.com/challenges/full-score/problem', use: 'Core' },
      { label: 'Contest Leaderboard', url: 'https://www.hackerrank.com/challenges/contest-leaderboard/problem', use: 'Core' },
      { label: 'Placements', url: 'https://www.hackerrank.com/challenges/placements/problem', use: 'Exam level' },
    ],
  },
];

export const sqlAdv = [
  {
    id: 'sqla-window',
    title: 'Window functions: rank without collapsing rows',
    minutes: 80,
    blurb: 'ROW_NUMBER, RANK and PARTITION BY: the top-N per group pattern.',
    blocks: [
      { t: 'p', text: 'A **window function** calculates something across related rows **without collapsing them** into one, the way `GROUP BY` does. You write it with `OVER (...)`.' },
      { t: 'code', text: 'SELECT rep_id, id, amount,\n       ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC) AS rn\nFROM deals;' },
      { t: 'list', items: [
        '`PARTITION BY rep_id` restarts the numbering for each rep (like a separate list per cost center).',
        '`ORDER BY amount DESC` decides who gets number 1.',
        '`ROW_NUMBER` gives 1, 2, 3 with no ties. `RANK` repeats numbers on ties (1, 1, 3). `DENSE_RANK` repeats without gaps (1, 1, 2).',
      ] },
      { t: 'analogy', text: 'A window function is a running-balance column or a `RANK()` within each cost center, **without** collapsing the sheet into a pivot.' },
      { t: 'h', text: 'Top-N per group' },
      { t: 'p', text: 'You cannot filter on a window function directly in `WHERE`. Calculate it in a subquery (or CTE), then filter outside:' },
      { t: 'code', text: 'SELECT rep_id, id, amount\nFROM (\n  SELECT rep_id, id, amount,\n         ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC) AS rn\n  FROM deals\n) t\nWHERE rn = 1;' },
      { t: 'warn', text: 'MySQL requires every subquery in `FROM` to have an alias (the `t` above). It is a common error on exam day.' },
    ],
    quiz: [
      {
        q: 'Two rows tie for first place. Which function gives them 1, 1, then 3 for the next row?',
        options: ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE'],
        answer: 1,
        explain: [
          'ROW_NUMBER never repeats; it would give 1, 2, 3.',
          'Correct. RANK repeats the number and then skips ahead.',
          'DENSE_RANK would give 1, 1, 2 with no gap.',
          'NTILE splits rows into buckets.',
        ],
      },
      {
        q: 'What does PARTITION BY do inside OVER?',
        options: ['Deletes duplicates', 'Restarts the calculation for each group', 'Sorts the final output', 'Joins two tables'],
        answer: 1,
        explain: [
          'That is DISTINCT.',
          'Correct. Each partition is calculated separately, like one list per group.',
          'Sorting the final output is done by the outer ORDER BY.',
          'Joins are separate.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'For **each rep**, return their **single biggest deal**: `rep_id`, `id` and `amount`. Order by `rep_id`.',
      starter: '-- Hint: number each rep\'s deals from biggest to smallest, then keep number 1\nSELECT rep_id, id, amount\nFROM deals\n',
      solution: 'SELECT rep_id, id, amount FROM (SELECT rep_id, id, amount, ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC) AS rn FROM deals) t WHERE rn = 1 ORDER BY rep_id;',
      ordered: true,
      hints: [
        'Use `ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC) AS rn` inside a subquery.',
        'Wrap that query in `SELECT ... FROM ( ... ) t` and give the subquery an alias.',
        'In the outer query add `WHERE rn = 1 ORDER BY rep_id`.',
      ],
    },
  },
  {
    id: 'sqla-running',
    title: 'Running totals',
    minutes: 50,
    blurb: 'SUM() OVER (ORDER BY ...) adds up as it goes.',
    blocks: [
      { t: 'p', text: 'Put an aggregate inside `OVER (ORDER BY ...)` and it becomes a **running total**: each row shows the sum of everything up to that row.' },
      { t: 'code', text: 'SELECT close_date, amount,\n       SUM(amount) OVER (ORDER BY close_date) AS running_total\nFROM deals\nWHERE stage = \'Closed Won\'\nORDER BY close_date;' },
      { t: 'analogy', text: 'This is the running-balance column in a ledger: `=SUM($B$2:B2)` dragged down.' },
      { t: 'tip', text: '`LAG(amount)` looks at the previous row and `LEAD(amount)` the next one. They are the "prior period" in a month-over-month variance.' },
    ],
    quiz: [
      {
        q: 'What does SUM(amount) OVER (ORDER BY close_date) return for the third row?',
        options: ['The third row\'s amount only', 'The sum of rows 1, 2 and 3', 'The sum of every row in the table', 'NULL'],
        answer: 1,
        explain: [
          'That would be the plain `amount` column.',
          'Correct. Each row adds everything up to and including itself.',
          'That is a total without ORDER BY inside OVER.',
          'There is no reason for NULL here.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'For **Closed Won** deals, return `close_date`, `amount` and a running total of amount named `running_total`, ordered by `close_date`.',
      starter: 'SELECT close_date, amount\nFROM deals\nWHERE stage = \'Closed Won\'\n',
      solution: "SELECT close_date, amount, SUM(amount) OVER (ORDER BY close_date) AS running_total FROM deals WHERE stage = 'Closed Won' ORDER BY close_date;",
      ordered: true,
      hints: [
        'Add a third column: `SUM(amount) OVER (...)`.',
        'Inside `OVER`, put `ORDER BY close_date`.',
        'Name it `AS running_total` and keep the final `ORDER BY close_date`.',
      ],
    },
  },
  {
    id: 'sqla-dates',
    title: 'Dates: YEAR, MONTH and DATEDIFF (MySQL style)',
    minutes: 50,
    blurb: 'Group and filter by month the way MySQL does it.',
    blocks: [
      { t: 'p', text: 'Date questions usually ask you to group by month or year, or find the gap between two dates. MySQL gives you simple functions for this:' },
      { t: 'code', text: "YEAR(close_date)                # 2026\nMONTH(close_date)               # 3\nDATEDIFF('2026-03-18','2026-03-01')   # 17 days\nDATE_FORMAT(close_date, '%Y-%m')      # '2026-03'" },
      { t: 'p', text: 'The practice box below has these four functions built in so you can drill the MySQL spelling.' },
      { t: 'warn', text: 'Other databases spell dates differently (SQL Server uses `DATEPART`, SQLite uses `strftime`). In an assessment, check which database you selected in the dropdown and use that one\'s functions.' },
    ],
    quiz: [
      {
        q: 'You want a deal count per calendar month in MySQL. Which grouping expression fits?',
        options: ['GROUP BY close_date', 'GROUP BY MONTH(close_date)', 'GROUP BY MONTH', 'GROUP BY close_date.month'],
        answer: 1,
        explain: [
          'That groups by each exact day, not by month.',
          'Correct. `MONTH(date)` returns 1 to 12, so all March deals land together.',
          '`MONTH` alone is a function, so it needs a column in parentheses.',
          'SQL does not use dot notation for date parts.',
        ],
      },
    ],
    exercise: {
      kind: 'sql',
      prompt: 'For **Closed Won** deals, return the **month number** as `m` and the **total amount** as `total`, ordered by month.',
      starter: "SELECT MONTH(close_date) AS m\nFROM deals\nWHERE stage = 'Closed Won'\n",
      solution: "SELECT MONTH(close_date) AS m, SUM(amount) AS total FROM deals WHERE stage = 'Closed Won' GROUP BY MONTH(close_date) ORDER BY m;",
      ordered: true,
      hints: [
        'Add `SUM(amount) AS total` next to the month.',
        'Group by the same expression: `GROUP BY MONTH(close_date)`.',
        'Finish with `ORDER BY m`.',
      ],
    },
  },
  {
    id: 'sqla-r-lemur',
    optional: true,
    title: 'Course: DataLemur SQL tutorial',
    minutes: 480,
    blurb: 'Date functions, CTEs, window functions, ranking, LEAD and LAG.',
    links: [
      { label: 'DataLemur SQL tutorial', url: 'https://datalemur.com/sql-tutorial', use: 'Use the lessons on date functions, CTE vs subquery, window functions, ranking, and LEAD/LAG. Some practice questions there are premium; skip those.' },
      { label: 'Backup: ThoughtSpot SQL tutorial', url: 'https://www.thoughtspot.com/sql-tutorial', use: 'Advanced SQL section if DataLemur does not click.' },
    ],
  },
  {
    id: 'sqla-r-prac',
    optional: true,
    title: 'Practice: ranking and window problems',
    minutes: 420,
    blurb: 'Solve the three core problems unaided in under 20 minutes each.',
    links: [
      { label: 'LeetCode: Rank Scores', url: 'https://leetcode.com/problems/rank-scores/', use: 'DENSE_RANK' },
      { label: 'LeetCode: Consecutive Numbers', url: 'https://leetcode.com/problems/consecutive-numbers/', use: 'LAG / LEAD' },
      { label: 'LeetCode: Rising Temperature', url: 'https://leetcode.com/problems/rising-temperature/', use: 'Date comparison' },
      { label: 'LeetCode: Last Person to Fit in the Bus', url: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/', use: 'Running total' },
      { label: 'LeetCode: Department Top Three Salaries', url: 'https://leetcode.com/problems/department-top-three-salaries/', use: 'Top-N per group (exam level)' },
      { label: 'HackerRank: Occupations', url: 'https://www.hackerrank.com/challenges/occupations/problem', use: 'ROW_NUMBER' },
    ],
  },
];
