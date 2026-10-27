// Practice that matches the problem list recommended in Jack's Ultimate Guide to HackerRank.
// Every problem is written from scratch (different wording, numbers and tests), covering the same skills
// as the guide's list: array indexing, falling-object ranges, anagrams and "greater than the previous average".
const t = (input, output, edge) => ({ input, output, ...(edge ? { hidden: true, edge } : {}) });
const START = '# Read the input with input(), then print the answer.\n';
const rep = (s, n) => Array(n).fill(s).join(' ');
const N = 100000;

const P = (id, title, minutes, blurb, prompt, tests, hints, solution, blocks = []) => ({
  id, title, minutes, blurb, blocks,
  exercise: { kind: 'python', io: true, prompt, starter: START, tests, hints, solution },
});

export const jackArrays = [
  P('io-target', 'Find the position', 30, 'Array indexing: where is the first match? (Jack\'s list: Target Index)',
    'The first line holds a list of integers (it may be empty). The second line is a target integer. Print the **position** (counting from 0) of the first occurrence of the target, or `-1` if it is not in the list.', [
      t('4 8 15 16\n15\n', '2'),
      t('1 2 3\n9\n', '-1'),
      t('7 7 7\n7\n', '0', 'When the target appears several times, report the first position.'),
      t('\n5\n', '-1', 'The first line is empty, so there is nothing to find.'),
      t(`${rep(1, N - 1)} 9\n9\n`, String(N - 1), 'Large input with the target at the very end.'),
    ], [
      'Read the list with `nums = list(map(int, input().split()))` and the target with `target = int(input())`.',
      'A loop with `for i in range(len(nums))` visits every position. Print `i` as soon as `nums[i] == target`.',
      'If the loop ends without a match, print `-1`. (Python also has `nums.index(target)`, which fails if the value is missing, so check with `in` first.)',
    ],
    'nums = list(map(int, input().split()))\ntarget = int(input())\nprint(nums.index(target) if target in nums else -1)\n', [
      { t: 'p', text: 'Positions in Python start at 0, so the first item is position 0, not 1. Most "array navigation" mistakes are off-by-one errors, so get used to counting from zero.' },
    ]),

  P('io-fruit', 'Falling fruit', 45, 'Array indexing with a range check. (Jack\'s list: Apples and Oranges)',
    'A house covers positions `s` to `t` (both included). An apple tree stands at position `a` and an orange tree at position `b`. A fruit that falls a distance `d` from its tree lands at the tree\'s position plus `d` (`d` can be negative: it landed to the left).\n\nLine 1: `s t`. Line 2: `a b`. Line 3: `m n`, the number of apples and oranges that fell. Line 4: the `m` apple distances. Line 5: the `n` orange distances (lines 4 and 5 may be empty). Print two lines: how many apples and how many oranges landed on the house.', [
      t('10 20\n8 30\n4 3\n1 3 12 -5\n-5 -12 2\n', '2\n1'),
      t('1 5\n0 10\n0 0\n\n\n', '0\n0', 'There may be no fruit at all, which leaves lines 4 and 5 empty.'),
      t('5 5\n5 5\n1 1\n0\n0\n', '1\n1', 'The house includes both of its end positions.'),
      t(`0 100\n50 50\n${N} ${N}\n${rep(0, N)}\n${rep(0, N)}\n`, `${N}\n${N}`, 'Large input. Check each fruit once.'),
    ], [
      'Read the numbers with `s, t = map(int, input().split())` and the same style for `a, b` and `m, n`. Read the two distance lines into lists.',
      'A fruit\'s landing position is the tree position plus the distance, for example `a + d`.',
      'Count the apples where `s <= a + d <= t`, then the oranges where `s <= b + d <= t`. Print the apple count, then the orange count, on separate lines.',
    ],
    's, t = map(int, input().split())\na, b = map(int, input().split())\nm, n = map(int, input().split())\napples = list(map(int, input().split()))\noranges = list(map(int, input().split()))\nprint(sum(1 for d in apples if s <= a + d <= t))\nprint(sum(1 for d in oranges if s <= b + d <= t))\n', [
      { t: 'p', text: 'Python lets you chain comparisons: `s <= x <= t` means "x is between s and t, ends included". It is shorter and less error-prone than two `if` tests joined with `and`.' },
      { t: 'tip', text: 'You do not actually need `m` and `n`. The lists already know their own length.' },
    ]),

  P('io-prevavg', 'Above the running average', 40, 'Array navigation with maths. (Jack\'s list: Count Greater than Previous Average)',
    'The first line is `n`. The second line has `n` integers (they may be negative). Count the positions, from the second number on, whose value is **strictly greater** than the average of all the numbers before it. Print the count. `n` can be 100000.', [
      t('5\n1 3 2 6 2\n', '2'),
      t('1\n5\n', '0', 'With one number there is nothing before it, so the count is 0.'),
      t('4\n5 5 5 5\n', '0', 'Equal to the average does not count.'),
      t('3\n-1 -2 0\n', '1', 'Negative numbers work too: 0 is above the average of -1 and -2.'),
      t(`${N}\n${Array.from({ length: N }, (_, i) => i + 1).join(' ')}\n`, String(N - 1), 'Large input. Recomputing the sum from scratch at every position is too slow. Keep a running total.'),
    ], [
      'Walk through the list from the second number. Before that, keep the total of everything seen so far in a variable.',
      'The average of the previous `i` numbers is `total / i`. To avoid decimals, compare `x * i > total` instead of `x > total / i`.',
      'After the check, add the current number to `total`. Start with `total = nums[0]`.',
    ],
    'n = int(input())\nnums = list(map(int, input().split()))\ntotal = nums[0]\ncount = 0\nfor i in range(1, n):\n    if nums[i] * i > total:\n        count += 1\n    total += nums[i]\nprint(count)\n', [
      { t: 'p', text: 'A **running total** turns a repeated calculation into one addition per step. Instead of re-adding all the earlier numbers every time, keep the total and update it.' },
      { t: 'warn', text: 'Comparing `x * i > total` avoids decimal rounding surprises. Multiplying both sides by the positive count `i` does not change the answer.' },
    ]),
];

export const jackStrings = [
  P('io-anagram', 'Anagram check', 30, 'Compare letters. (Jack\'s list: isAnagram)',
    'Two lines each hold a word. Two words are anagrams when they use exactly the same letters the same number of times, ignoring upper and lower case. Print `YES` if they are anagrams, otherwise `NO`. Each word can have 100000 letters.', [
      t('listen\nsilent\n', 'YES'),
      t('abc\nabd\n', 'NO'),
      t('Dusty\nStudy\n', 'YES', 'Capital letters count as the same letter.'),
      t('aab\nabb\n', 'NO', 'The same letters are not enough. The counts must match too.'),
      t('abc\nabcd\n', 'NO', 'Different lengths can never be anagrams.'),
      t(`${'ab'.repeat(50000)}\n${'ba'.repeat(50000)}\n`, 'YES', 'Large input.'),
    ], [
      'Read both words and convert them to lowercase with `.lower()`.',
      '`sorted("listen")` gives a list of its letters in order. Two anagrams give the same sorted list.',
      'Print `YES` if `sorted(a) == sorted(b)`, otherwise `NO`.',
    ],
    'a = input().strip().lower()\nb = input().strip().lower()\nprint("YES" if sorted(a) == sorted(b) else "NO")\n', [
      { t: 'p', text: 'Sorting the letters is the quickest way to compare "same letters, same counts". A dictionary of counts also works and is faster on very long words.' },
    ]),
];
