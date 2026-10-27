// One-page quick reference. Everything here is something the practice problems use.
export const REFERENCE = [
  {
    id: 'ref-io', title: 'Python: reading input on HackerRank',
    blocks: [
      { t: 'p', text: 'On HackerRank the program usually **reads from input** and **prints** the answer. The coding practice on this site works the same way. Some HackerRank problems instead give you a function to fill in: then **return** the answer and let the template print it.' },
      { t: 'code', text: 'n = int(input())                          # one number\nnums = list(map(int, input().split()))   # "3 5 8" -> [3, 5, 8]\nname = input().strip()                    # one line of text\n\nfor _ in range(n):                        # n more lines\n    line = input()\n\nprint(total)                              # output\nprint(a, b)                               # prints "a b" with a space\nprint("\\n".join(rows))                    # one row per line' },
      { t: 'tip', text: 'Many HackerRank problems give you a function stub to complete and call it for you. Read the template before you type anything.' },
    ],
  },
  {
    id: 'ref-py', title: 'Python: the essentials',
    blocks: [
      { t: 'h', text: 'Numbers and text' },
      { t: 'code', text: '17 // 5   # 3 (whole-number division)\n17 % 5    # 2 (remainder)\n2 ** 3    # 8 (power)\nround(3.14159, 2)      # 3.14\nint("7"), float("2.5"), str(9)\n\ns = "  Hello, World  "\ns.strip()        # "Hello, World"\ns.lower(), s.upper(), s.title()\ns.split(",")     # split into a list\n", ".join(["a", "b"])   # "a, b"\nf"{name} owes {amt:.2f}"  # formatted text\ns[0], s[-1], s[1:4]       # first, last, slice\n"lo" in s                 # True or False' },
      { t: 'h', text: 'Lists' },
      { t: 'code', text: 'nums = [4, 1, 3]\nnums.append(9)\nsorted(nums)                    # new sorted list\nsorted(nums, reverse=True)      # biggest first\nsum(nums), min(nums), max(nums), len(nums)\n[x * 2 for x in nums if x > 1]  # list comprehension\nfor i, x in enumerate(nums):    # index and value\n    print(i, x)\nfor a, b in zip(list1, list2):  # walk two lists together\n    print(a, b)\nsorted(rows, key=lambda r: r[1])   # sort by the second item' },
      { t: 'h', text: 'Dictionaries and sets' },
      { t: 'code', text: 'counts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1     # the counting pattern\n\nfrom collections import Counter\nCounter(words)                           # same thing, built in\n\nfor key, value in counts.items():\n    print(key, value)\n\nseen = set()\nseen.add(3)\n3 in seen                                # fast lookup\na & b, a | b, a - b                      # sets: overlap, union, difference' },
    ],
  },
  {
    id: 'ref-patterns', title: 'Coding patterns',
    blocks: [
      { t: 'code', text: '# running total\ntotal = 0\nfor x in nums:\n    total += x\n\n# track the biggest\nbest = nums[0]\nfor x in nums:\n    if x > best:\n        best = x\n\n# binary search (list must be sorted)\nlow, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target: return mid\n    elif nums[mid] < target: low = mid + 1\n    else: high = mid - 1\nreturn -1' },
      { t: 'list', items: [
        '**Read the constraints.** n up to 1,000 allows a double loop. n up to 100,000 needs a sort, a dictionary or binary search.',
        '**Submit the simple version first**, then improve. Partial passes reportedly earn very little, so keep going until every case passes, and keep a copy of your best passing code.',
        '**Test the edges:** empty input, one item, duplicates, zero, negatives.',
        '**Return vs print:** follow the problem statement exactly.',
      ] },
    ],
  },
  {
    id: 'ref-sql', title: 'SQL: the essentials',
    blocks: [
      { t: 'p', text: 'You **write** a query as `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`. SQL **runs** it as `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`, which is why `WHERE` cannot use a column alias or an aggregate.' },
      { t: 'code', text: "SELECT region, SUM(amount) AS total\nFROM deals d\nJOIN accounts a ON a.id = d.account_id          -- only matches\nLEFT JOIN reps r ON r.id = d.rep_id              -- keeps every deal\nWHERE stage = 'Closed Won' AND amount >= 50000   -- filters rows\nGROUP BY region                                  -- one row per region\nHAVING SUM(amount) > 100000                      -- filters groups\nORDER BY total DESC\nLIMIT 5;" },
      { t: 'h', text: 'Handy pieces' },
      { t: 'code', text: "COUNT(*), COUNT(DISTINCT col), SUM(), AVG(), MIN(), MAX()\nCASE WHEN amount >= 50000 THEN 'Large' ELSE 'Small' END\ncol IS NULL / col IS NOT NULL          -- never = NULL\nCOALESCE(col, 0)                       -- replace NULL\ncol IN ('a','b'), BETWEEN 1 AND 5, LIKE 'A%'\nSELECT DISTINCT col FROM t\n\n-- find rows with NO match\nSELECT a.name FROM accounts a\nLEFT JOIN deals d ON d.account_id = a.id\nWHERE d.id IS NULL;" },
      { t: 'h', text: 'Windows, CTEs and dates (MySQL)' },
      { t: 'code', text: "ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC)\nRANK() / DENSE_RANK() OVER (ORDER BY total DESC)\nSUM(amount) OVER (ORDER BY close_date)     -- running total\n\nWITH totals AS (SELECT account_id, SUM(amount) AS total FROM deals GROUP BY account_id)\nSELECT * FROM totals WHERE total > 100000;\n\nYEAR(d), MONTH(d), DATEDIFF(a, b), DATE_FORMAT(d, '%Y-%m')" },
      { t: 'warn', text: 'Every subquery in `FROM` needs an alias in MySQL. You cannot use a window function directly in `WHERE`: wrap it in a subquery or CTE first.' },
    ],
  },
  {
    id: 'ref-prompt', title: 'Prompt engineering: a template that works',
    blocks: [
      { t: 'p', text: 'The grader compares the reply **exactly**, so every extra word costs you the test case. Build the prompt in this order:' },
      { t: 'code', text: 'TASK: <one sentence: what to do>\n\nRULES:\n- <the rule, including how to break ties or handle edge cases>\n- If <the empty or no-match case>, output <exact text>.\n\nFORMAT:\nOutput ONLY <the exact shape>. No introduction, no explanation,\nno quotes, no markdown, no trailing punctuation.\n\nEXAMPLE:\nInput: <sample input>\nOutput: <exact sample output>\n\nINPUT:\n{input}' },
      { t: 'list', items: [
        '**Show one worked example.** Models copy the format of an example faithfully.',
        '**Say what to do for empty or odd input.** Hidden cases love edges.',
        '**Counting and arithmetic:** state the rule precisely (5 letters is NOT more than 5) and give one worked example. Never ask the model to show its working: everything it writes is graded.',
        '**Test on more than one input** before you trust it. In the exam, Run sends your prompt to the exam\'s own AI model; there is no outside assistant.',
      ] },
    ],
  },
  {
    id: 'ref-time', title: 'Test-day habits',
    blocks: [
      { t: 'list', items: [
        '**First 5 minutes:** skim all questions. Start with the one you are surest of.',
        '**Bank points early:** submit a working simple solution, then improve.',
        '**Do not stall.** If you are stuck for 10 minutes, submit what you have and move on. Check at the start whether you can go back to earlier questions.',
        '**Check outputs against the sample** before you submit: spacing, case and blank lines.',
        '**If time runs out**, the last version you ran is submitted for you, and code you never ran is not graded. After every change, run it before you move on.',
        '**Setup:** quiet room, one monitor, charged laptop, a stable connection, webcam allowed. Rules vary, so confirm them in your invitation email.',
      ] },
    ],
  },
];
