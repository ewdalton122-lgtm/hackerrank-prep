// Stage 6 practice: in-browser versions of the problem types that appear on coding assessments.
// Each problem is written from scratch (not copied) and checked with visible and hidden tests.
const p = (id, title, minutes, blurb, blocks, ex) => ({ id, title, minutes, blurb, blocks, exercise: { kind: 'python', ...ex } });

export const practice = [
  p('pr-candles', 'Count the tallest', 35, 'Find the biggest value, then count how many times it appears.', [
    { t: 'p', text: 'A very common pattern: **find the maximum, then count it.** Python gives you `max(list)` and `list.count(value)`.' },
    { t: 'tip', text: 'Think about the empty list before you submit. `max([])` crashes.' },
  ], {
    prompt: 'Write `tallest_count(heights)` that returns how many items equal the **largest** value in the list. For an empty list, return `0`.',
    fn: 'tallest_count',
    starter: 'def tallest_count(heights):\n    # find the largest value, then count how many times it appears\n    pass\n',
    tests: [
      { expr: 'tallest_count([4, 4, 1, 3])', expected: '2' },
      { expr: 'tallest_count([1])', expected: '1' },
      { expr: 'tallest_count([5, 5, 5])', expected: '3' },
      { expr: 'tallest_count([])', expected: '0', hidden: true, edge: 'An empty list has no largest value. Check for it first.' },
    ],
    hints: ['`max(heights)` gives the largest value.', '`heights.count(x)` tells you how many times `x` appears.', 'Guard the empty list with `if not heights: return 0`.'],
    solution: 'def tallest_count(heights):\n    if not heights:\n        return 0\n    return heights.count(max(heights))\n',
  }),

  p('pr-minmax', 'Smallest and largest sum of four', 40, 'Sort, then add up the right slice.', [
    { t: 'p', text: 'You have exactly five numbers. If you leave one out and add the other four, what are the smallest and the largest totals you can get? **Sorting** makes this easy: leave out the largest for the smallest total, leave out the smallest for the largest total.' },
    { t: 'tip', text: 'Total of everything minus one number is a neat shortcut.' },
  ], {
    prompt: 'Write `mini_max(nums)` for a list of exactly 5 numbers. Return a tuple `(smallest_sum, largest_sum)`, where each sum adds up exactly four of the numbers.',
    fn: 'mini_max',
    starter: 'def mini_max(nums):\n    # total of all five, minus one number, gives a sum of four\n    pass\n',
    tests: [
      { expr: 'mini_max([1, 2, 3, 4, 5])', expected: '(10, 14)' },
      { expr: 'mini_max([5, 5, 5, 5, 5])', expected: '(20, 20)' },
      { expr: 'mini_max([1, 1, 1, 1, 1000000000])', expected: '(4, 1000000003)', hidden: true, edge: 'Python handles big numbers fine, so check that you are leaving out the right value.' },
    ],
    hints: ['`sum(nums)` is the total of all five.', 'Smallest sum = total minus the largest number. Largest sum = total minus the smallest.', '`return (total - max(nums), total - min(nums))`'],
    solution: 'def mini_max(nums):\n    total = sum(nums)\n    return (total - max(nums), total - min(nums))\n',
  }),

  p('pr-staircase', 'Draw a staircase', 45, 'Output formatting: the grader compares text exactly.', [
    { t: 'p', text: 'Printed-output problems fail on tiny details: a missing space, an extra space. Here you **return** the rows as a list of text lines so the checker can compare each one.' },
    { t: 'code', text: '"#" * 3        # "###"\n" " * 2        # "  "\n" " * 2 + "#"  # "  #"' },
    { t: 'tip', text: 'For row `i` (starting at 1) out of `n`, you need `n - i` spaces and then `i` hash signs.' },
  ], {
    prompt: 'Write `staircase(n)` that returns a list of `n` strings. Each line is right-aligned and exactly `n` characters wide, and row `i` has `i` `#` signs. For `n = 3` the result is `["  #", " ##", "###"]`.',
    fn: 'staircase',
    starter: 'def staircase(n):\n    rows = []\n    for i in range(1, n + 1):\n        # build one row of spaces followed by hash signs\n        pass\n    return rows\n',
    tests: [
      { expr: 'staircase(3)', expected: '["  #", " ##", "###"]' },
      { expr: 'staircase(1)', expected: '["#"]' },
      { expr: 'staircase(4)', expected: '["   #", "  ##", " ###", "####"]' },
      { expr: 'staircase(0)', expected: '[]', hidden: true, edge: 'With n = 0 there are no rows at all.' },
    ],
    hints: ['Each row is spaces followed by hashes: `" " * (n - i) + "#" * i`.', 'Add each row to the `rows` list with `rows.append(...)`.', 'Count the spaces carefully. The grader sees a missing space as a wrong answer.'],
    solution: 'def staircase(n):\n    rows = []\n    for i in range(1, n + 1):\n        rows.append(" " * (n - i) + "#" * i)\n    return rows\n',
  }),

  p('pr-diag', 'Diagonal difference', 45, 'Work with a grid (a list of lists).', [
    { t: 'p', text: 'A grid is a list of rows. `grid[r][c]` is row `r`, column `c`. In a square grid of size `n`, the main diagonal is `grid[i][i]` and the other diagonal is `grid[i][n - 1 - i]`.' },
    { t: 'analogy', text: 'It is a table in Excel. `grid[1][2]` is the cell in the second row, third column, because counting starts at 0.' },
  ], {
    prompt: 'Write `diagonal_difference(grid)` for a square grid. Add up the main diagonal (top-left to bottom-right) and the other diagonal (top-right to bottom-left). Return the **absolute** difference between the two sums.',
    fn: 'diagonal_difference',
    starter: 'def diagonal_difference(grid):\n    n = len(grid)\n    main = 0\n    other = 0\n    for i in range(n):\n        # add the two diagonal cells for this row\n        pass\n    return abs(main - other)\n',
    tests: [
      { expr: 'diagonal_difference([[11, 2, 4], [4, 5, 6], [10, 8, -12]])', expected: '15' },
      { expr: 'diagonal_difference([[1, 2], [3, 4]])', expected: '0' },
      { expr: 'diagonal_difference([[1]])', expected: '0', hidden: true, edge: 'A 1 by 1 grid has the same cell on both diagonals.' },
    ],
    hints: ['Main diagonal cell in row `i`: `grid[i][i]`.', 'Other diagonal cell in row `i`: `grid[i][n - 1 - i]`.', '`abs(...)` makes a negative difference positive.'],
    solution: 'def diagonal_difference(grid):\n    n = len(grid)\n    main = 0\n    other = 0\n    for i in range(n):\n        main += grid[i][i]\n        other += grid[i][n - 1 - i]\n    return abs(main - other)\n',
  }),

  p('pr-cakewalk', 'Sort first, then be greedy', 45, 'When the order of choices matters, sort so the biggest comes first.', [
    { t: 'p', text: 'A **greedy** solution makes the best-looking choice at each step. It works when you can prove the order matters in a simple way. Here, each item costs `value * 2^position`, so a big value should sit at an early position where the multiplier is small.' },
    { t: 'code', text: 'sorted([1, 3, 2], reverse=True)   # [3, 2, 1]\n2 ** 3                            # 8' },
    { t: 'tip', text: 'Do the example by hand first: for `[3, 2, 1]` the cost is 3x1 + 2x2 + 1x4 = 11.' },
  ], {
    prompt: 'Write `min_miles(calories)`. Eating a cupcake at position `i` (starting at 0, in the order you choose) costs `calories * 2**i` miles. Return the **smallest total** you can get by choosing the best order.',
    fn: 'min_miles',
    starter: 'def min_miles(calories):\n    # decide the order first, then add up calories * 2**position\n    pass\n',
    tests: [
      { expr: 'min_miles([1, 3, 2])', expected: '11' },
      { expr: 'min_miles([5, 5])', expected: '15' },
      { expr: 'min_miles([7])', expected: '7' },
      { expr: 'min_miles([])', expected: '0', hidden: true, edge: 'No cupcakes means no miles.' },
    ],
    hints: ['Put the biggest numbers first so they get the smallest multipliers.', '`sorted(calories, reverse=True)` gives biggest to smallest.', 'Loop with `for i, c in enumerate(order)` and add `c * 2 ** i`.'],
    solution: 'def min_miles(calories):\n    total = 0\n    for i, c in enumerate(sorted(calories, reverse=True)):\n        total += c * 2 ** i\n    return total\n',
  }),

  p('pr-grid', 'Sort inside a grid, then check', 55, 'Combine two ideas: sort each row, then test every column.', [
    { t: 'p', text: 'You have a list of equal-length strings. Step one: sort the letters inside every row. Step two: look down each column and check the letters never go **backwards** in the alphabet.' },
    { t: 'code', text: '"".join(sorted("ebacd"))   # "abcde"\nrows[r][c]                 # letter in row r, column c' },
    { t: 'warn', text: 'Compare each row only to the row directly above it, and do it for every column.' },
  ], {
    prompt: 'Write `grid_ok(rows)`. Sort the letters inside each row alphabetically. Then return `"YES"` if every column reads in non-decreasing alphabetical order from top to bottom, otherwise `"NO"`.',
    fn: 'grid_ok',
    starter: 'def grid_ok(rows):\n    sorted_rows = ["".join(sorted(r)) for r in rows]\n    # check each column from top to bottom\n    pass\n',
    tests: [
      { expr: 'grid_ok(["ebacd", "fghij", "olmkn", "trpqs", "xywuv"])', expected: '"YES"' },
      { expr: 'grid_ok(["abc", "lmp", "qrt"])', expected: '"YES"' },
      { expr: 'grid_ok(["mpxz", "abcd", "wlmf"])', expected: '"NO"' },
      { expr: 'grid_ok(["z"])', expected: '"YES"', hidden: true, edge: 'One row has nothing above it to compare with.' },
    ],
    hints: ['The starter already sorts every row for you.', 'For each row index `r` from 1 up, and each column `c`, compare `sorted_rows[r][c]` with `sorted_rows[r - 1][c]`.', 'If any letter is smaller than the one above it, return `"NO"`. After all checks pass, return `"YES"`.'],
    solution: 'def grid_ok(rows):\n    sorted_rows = ["".join(sorted(r)) for r in rows]\n    for r in range(1, len(sorted_rows)):\n        for c in range(len(sorted_rows[r])):\n            if sorted_rows[r][c] < sorted_rows[r - 1][c]:\n                return "NO"\n    return "YES"\n',
  }),

  p('pr-anagram', 'Are these two words anagrams?', 40, 'Counting letters with a dictionary or `Counter`.', [
    { t: 'p', text: 'Two words are anagrams when they use exactly the same letters the same number of times. The simplest check: **sort the letters of each word** and compare, or count the letters with a dictionary.' },
    { t: 'code', text: 'sorted("listen")                  # [\'e\', \'i\', \'l\', \'n\', \'s\', \'t\']\nsorted("listen") == sorted("silent")   # True' },
  ], {
    prompt: 'Write `is_anagram(a, b)` that returns `True` if the two words use exactly the same letters (ignore upper and lower case), otherwise `False`.',
    fn: 'is_anagram',
    starter: 'def is_anagram(a, b):\n    # compare the letters of the two words, ignoring case\n    pass\n',
    tests: [
      { expr: 'is_anagram("listen", "silent")', expected: 'True' },
      { expr: 'is_anagram("abc", "abd")', expected: 'False' },
      { expr: 'is_anagram("Aa", "aA")', expected: 'True', hidden: true, edge: 'Upper and lower case should count as the same letter.' },
      { expr: 'is_anagram("a", "ab")', expected: 'False', hidden: true, edge: 'Different lengths can never be anagrams.' },
    ],
    hints: ['Make both words lowercase first with `.lower()`.', '`sorted(word)` returns the letters in order.', '`return sorted(a.lower()) == sorted(b.lower())`'],
    solution: 'def is_anagram(a, b):\n    return sorted(a.lower()) == sorted(b.lower())\n',
  }),

  p('pr-running', 'Running average', 50, 'Keep a total as you go instead of re-adding everything.', [
    { t: 'p', text: 'Loop through the list and keep a running `total`. At each position, the average of everything **before** it is `total / count`. Compare first, then add the current item.' },
    { t: 'code', text: 'total = 0\nfor i, x in enumerate(nums):\n    if i > 0 and x > total / i:\n        ...\n    total += x' },
    { t: 'warn', text: 'The first item has nothing before it, so it never counts.' },
  ], {
    prompt: 'Write `count_above_average(nums)` that returns how many items are **strictly greater** than the average of all the items before them. The first item never counts.',
    fn: 'count_above_average',
    starter: 'def count_above_average(nums):\n    total = 0\n    count = 0\n    for i, x in enumerate(nums):\n        # compare x with the average of the items before it, then add x to total\n        pass\n    return count\n',
    tests: [
      { expr: 'count_above_average([1, 3, 2, 5])', expected: '2' },
      { expr: 'count_above_average([5, 4, 3])', expected: '0' },
      { expr: 'count_above_average([2, 2, 2])', expected: '0' },
      { expr: 'count_above_average([7])', expected: '0', hidden: true, edge: 'A single item has nothing before it.' },
      { expr: 'count_above_average([])', expected: '0', hidden: true, edge: 'An empty list should not crash.' },
    ],
    hints: ['At position `i` (counting from 0), the items before it number `i`.', 'Only compare when `i > 0`: `x > total / i`.', 'Add `x` to `total` after the comparison, never before.'],
    solution: 'def count_above_average(nums):\n    total = 0\n    count = 0\n    for i, x in enumerate(nums):\n        if i > 0 and x > total / i:\n            count += 1\n        total += x\n    return count\n',
  }),

  p('pr-binary', 'Binary search', 60, 'Cut the search area in half each time.', [
    { t: 'p', text: 'You have a **sorted** list. Look at the middle. If it is too small, the answer is in the right half. If it is too big, the left half. Keep halving until you find it or run out of list.' },
    { t: 'code', text: 'low, high = 0, len(nums) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    ...' },
    { t: 'warn', text: 'The common mistakes are `low < high` instead of `low <= high`, and forgetting the `+ 1` or `- 1` when moving the edges (which creates an endless loop).' },
  ], {
    prompt: 'Write `binary_search(nums, target)` for a sorted list. Return the **index** where `target` is found, or `-1` if it is not in the list.',
    fn: 'binary_search',
    starter: 'def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        # compare nums[mid] with target and move low or high\n        break  # delete this line once you add your logic\n    return -1\n',
    tests: [
      { expr: 'binary_search([1, 3, 5, 7, 9], 7)', expected: '3' },
      { expr: 'binary_search([1, 3, 5, 7, 9], 4)', expected: '-1' },
      { expr: 'binary_search([5], 5)', expected: '0' },
      { expr: 'binary_search([], 5)', expected: '-1', hidden: true, edge: 'An empty list never contains the target.' },
      { expr: 'binary_search(list(range(0, 2000000, 2)), 1999998)', expected: '999999', hidden: true, edge: 'A big list with the target at the very end. Check that your loop moves `low` or `high` every time, so it finishes.' },
    ],
    hints: ['If `nums[mid] == target`, return `mid`.', 'If `nums[mid] < target`, the target is to the right: `low = mid + 1`. Otherwise `high = mid - 1`.', 'If you get stuck in an endless loop, check that `low` or `high` really changes every time round.'],
    solution: 'def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n',
  }),

  p('pr-peak', 'Find the peak', 60, 'Binary search with a twist: compare neighbours.', [
    { t: 'p', text: 'A **bitonic** list goes strictly up, then strictly down, like `[1, 3, 8, 12, 4, 2]`. The peak is the biggest value. You do not need a target: compare the middle with the item to its right.' },
    { t: 'list', items: ['If `nums[mid] < nums[mid + 1]` you are still on the way up, so the peak is to the right.', 'Otherwise you are at the peak or past it, so the peak is at `mid` or to the left.'] },
    { t: 'tip', text: 'A simple loop with `max` also gets the right answer, and one pass is fast enough for these tests. Practise the halving version anyway: it is what this classic exam question is testing, and it is the follow-up interviewers ask for.' },
  ], {
    prompt: 'Write `peak_index(nums)` for a list that strictly increases and then strictly decreases (either part may be empty). Return the **index** of the largest value.',
    fn: 'peak_index',
    starter: 'def peak_index(nums):\n    low, high = 0, len(nums) - 1\n    while low < high:\n        mid = (low + high) // 2\n        # compare nums[mid] with nums[mid + 1] and move low or high\n        break  # delete this line once you add your logic\n    return low\n',
    tests: [
      { expr: 'peak_index([1, 3, 8, 12, 4, 2])', expected: '3' },
      { expr: 'peak_index([1, 2, 3])', expected: '2' },
      { expr: 'peak_index([9, 4, 1])', expected: '0' },
      { expr: 'peak_index([7])', expected: '0', hidden: true, edge: 'A single item is the peak.' },
      { expr: 'peak_index(list(range(0, 500000)) + list(range(499998, -1, -1)))', expected: '499999', hidden: true, edge: 'A very long list that rises to 499999 and then falls.' },
    ],
    hints: ['If `nums[mid] < nums[mid + 1]`, the peak is to the right: `low = mid + 1`.', 'Otherwise the peak is at `mid` or to its left: `high = mid`.', 'Keep `while low < high`. When they meet, `low` is the peak index.'],
    solution: 'def peak_index(nums):\n    low, high = 0, len(nums) - 1\n    while low < high:\n        mid = (low + high) // 2\n        if nums[mid] < nums[mid + 1]:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n',
  }),
];
