// Exam-level Python problems (Coding set 6). Same format as pythonio.js. The first four are required; the rest are optional stretch practice, harder than the recommended practice list.
// These match the reported exam topics: array navigation, string handling, sorting and greedy choices.
// They have large hidden inputs, so a slow approach will time out the way it would on HackerRank.
// Every problem is written from scratch. Visible tests teach; hidden tests check edge cases and speed.
const t = (input, output, edge) => ({ input, output, ...(edge ? { hidden: true, edge } : {}) });
const START = '# Read the input with input(), then print the answer.\n';
const rep = (s, n) => Array(n).fill(s).join(' ');
const N = 100000;

const P = (id, title, minutes, blurb, prompt, tests, hints, solution, blocks = [], optional = false) => ({
  id, title, minutes, blurb, blocks, ...(optional ? { optional: true } : {}),
  exercise: { kind: 'python', io: true, prompt, starter: START, tests, hints, solution },
});

const chain = Array.from({ length: N }, (_, i) => `${i} ${i + 2}`).join('\n');
const consecutive = Array.from({ length: N }, (_, i) => `${i} ${i + 1}`).join('\n');

export const ioSet6 = [
  P('io-hop', 'Hop to the end', 45, 'Array navigation: can you reach the last square?',
    'The first line is `n`. The second line has `n` non-negative integers. You start on position 0. The number at each position is the **furthest** you may jump forward from it (you may also jump less far). Print `YES` if you can reach the last position, otherwise `NO`. `n` can be 100000.', [
      t('5\n2 3 1 1 4\n', 'YES'),
      t('5\n3 2 1 0 4\n', 'NO'),
      t('1\n0\n', 'YES', 'With one position you are already standing on the last one.'),
      t('2\n0 5\n', 'NO', 'A zero at the start traps you, whatever comes after it.'),
      t('6\n1 0 0 0 0 9\n', 'NO', 'A run of zeros can block you. Stop as soon as the next position is out of reach.'),
      t(`${N}\n${rep(50000, N)}\n`, 'YES', 'Large input with huge jumps. Trying every possible jump one by one will be too slow. Track one number instead.'),
      t(`${N}\n0 ${rep(1, N - 1)}\n`, 'NO', 'Large input where the very first square is a dead end.'),
    ], [
      'You do not need to try every path. Keep one number: the **furthest index** you can reach so far.',
      'Loop through the positions. If the current index is beyond the furthest reach, you are stuck, so stop.',
      'At each position update `far = max(far, i + nums[i])`. At the end, print YES if `far >= n - 1`.',
    ],
    'n = int(input())\nnums = list(map(int, input().split()))\nfar = 0\nfor i, x in enumerate(nums):\n    if i > far:\n        break\n    far = max(far, i + x)\nprint("YES" if far >= n - 1 else "NO")\n', [
      { t: 'p', text: 'This is a **greedy** problem: one simple rule applied left to right gives the right answer, with no need to explore every route.' },
      { t: 'analogy', text: 'Think of a road with stepping stones. At each stone you only care about how far the best stone you have seen so far can take you.' },
      { t: 'warn', text: 'Inputs with 100000 values are common in coding tests. A solution that checks all jumps from every position does billions of steps and times out. One pass with one tracked number does 100000 steps.' },
    ]),

  P('io-meetings', 'Fit the most meetings', 45, 'Greedy choice: always take the one that ends first.',
    'The first line is `n`, the number of meeting requests. Each of the next `n` lines has two integers: a start time and an end time. One room can hold only one meeting at a time, but a meeting may start at the **same time** another one ends. Print the largest number of meetings you can hold. `n` can be 100000.', [
      t('3\n1 3\n2 4\n3 5\n', '2'),
      t('4\n1 2\n2 3\n3 4\n1 10\n', '3'),
      t('1\n5 6\n', '1'),
      t('3\n1 5\n2 3\n3 4\n', '2', 'Pick by earliest **end** time. Picking the earliest start would choose the long 1 to 5 meeting and lose.'),
      t('3\n1 4\n1 4\n1 4\n', '1', 'Identical meetings overlap each other, so only one fits.'),
      t(`${N}\n${consecutive}\n`, String(N), 'Large input where every meeting touches the next. Sort once, then scan once.'),
    ], [
      'Store each meeting as `(end, start)` so that sorting orders them by end time.',
      'Walk through the sorted meetings. Keep `last_end`, the end of the last meeting you accepted.',
      'Accept a meeting when `start >= last_end`, then set `last_end = end` and add 1 to the count.',
    ],
    'n = int(input())\nmeetings = []\nfor _ in range(n):\n    s, e = map(int, input().split())\n    meetings.append((e, s))\nmeetings.sort()\ncount = 0\nlast_end = -1\nfor e, s in meetings:\n    if s >= last_end:\n        count += 1\n        last_end = e\nprint(count)\n', [
      { t: 'p', text: 'The rule "always pick the meeting that finishes first" leaves the most room for the rest. It is a classic greedy proof you can simply remember.' },
      { t: 'tip', text: 'Sorting a list of tuples sorts by the first item, then the second. Put the value you want to sort by first.' },
    ]),

  P('io-merge', 'Merge overlapping bookings', 50, 'Sorting, then one pass.',
    'The first line is `n`. Each of the next `n` lines has a booking: a start and an end (start is at most end). Bookings that overlap **or touch** (one ends exactly when the next starts) must be merged into one. Print the merged bookings in order of start, one per line as `start end`. `n` can be 100000.', [
      t('3\n1 3\n2 6\n8 10\n', '1 6\n8 10'),
      t('2\n5 7\n1 2\n', '1 2\n5 7', 'Bookings are not given in order. Sort first.'),
      t('3\n1 10\n2 3\n4 5\n', '1 10', 'A booking inside another one must not shrink the end.'),
      t('2\n1 3\n3 5\n', '1 5', 'Touching bookings merge.'),
      t('1\n4 4\n', '4 4'),
      t(`${N}\n${chain}\n`, `0 ${N + 1}`, 'Large input that merges into a single booking.'),
    ], [
      'Read the pairs into a list and sort it. Sorted pairs are ordered by start.',
      'Keep a list `merged`. For each booking, if `start <= merged[-1][1]` it overlaps the last one, so extend the end.',
      'Extend with `merged[-1][1] = max(merged[-1][1], end)`. Otherwise append a new pair. Use lists, not tuples, so you can change the end.',
    ],
    'n = int(input())\nbookings = []\nfor _ in range(n):\n    s, e = map(int, input().split())\n    bookings.append([s, e])\nbookings.sort()\nmerged = []\nfor s, e in bookings:\n    if merged and s <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], e)\n    else:\n        merged.append([s, e])\nfor s, e in merged:\n    print(s, e)\n', [
      { t: 'p', text: 'Once the bookings are sorted by start, any booking that overlaps must be touching the **most recent** merged one. That is why you only ever compare with `merged[-1]`.' },
      { t: 'warn', text: 'Use `max(...)` when extending the end. A short booking sitting inside a long one would otherwise shrink it.' },
    ], true),

  P('io-freqsort', 'Sort letters by popularity', 40, 'Count with a dictionary, then sort with two rules.',
    'Read one line of text. Count how often each character appears, skipping spaces. Print the letters from most frequent to least, each followed by its count, separated by spaces (for example `a3 n2 b1`). Letters with the same count are listed alphabetically.', [
      t('banana\n', 'a3 n2 b1'),
      t('abc\n', 'a1 b1 c1'),
      t('zzzaab\n', 'z3 a2 b1'),
      t('hello world\n', 'l3 o2 d1 e1 h1 r1 w1', 'Spaces are ignored, not counted.'),
      t('mississippi\n', 'i4 s4 p2 m1', 'Equal counts are ordered alphabetically (i before s).'),
      t(`${'a'.repeat(N)}\n`, `a${N}`, 'Large input. Count each letter once per character, not by repeatedly scanning the text.'),
    ], [
      'Build a dictionary of counts: `counts[ch] = counts.get(ch, 0) + 1` for every character that is not a space.',
      '`sorted(counts.items(), key=...)` sorts the pairs. The key can be a tuple: the first part decides, the second breaks ties.',
      'Use `key=lambda kv: (-kv[1], kv[0])`: the minus sign sorts counts high to low, and the letter sorts A to Z. Join with `" ".join(f"{ch}{n}" for ch, n in ...)`.',
    ],
    'text = input()\ncounts = {}\nfor ch in text:\n    if ch != " ":\n        counts[ch] = counts.get(ch, 0) + 1\nitems = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\nprint(" ".join(f"{ch}{n}" for ch, n in items))\n', [
      { t: 'p', text: 'Sorting by two rules at once is a very common exam move. Return a **tuple** from the key: Python compares the first item, and only looks at the second when the first ties.' },
      { t: 'tip', text: 'To sort numbers from high to low inside a tuple key, negate them: `-count`. You cannot negate a letter, so keep the letter as is to sort A to Z.' },
    ]),

  P('io-uniqsub', 'Longest stretch with no repeats', 55, 'Substring handling with a sliding window.',
    'Read one line of lowercase letters (it may be empty). Print the length of the longest **consecutive** stretch of characters in which no letter appears twice. The text can be up to 100000 characters long.', [
      t('abcabcbb\n', '3'),
      t('bbbbb\n', '1'),
      t('pwwkew\n', '3'),
      t('abcdef\n', '6'),
      t('\n', '0', 'An empty line has no characters, so the answer is 0.'),
      t('abba\n', '2', 'When a repeat is found, the window start may only move **forward**, never back.'),
      t('dvdf\n', '3'),
      t(`${'ab'.repeat(50000)}\n`, '2', 'Large input. Do one pass rather than re-checking every possible stretch.'),
    ], [
      'Keep a window from `start` to the current index `i` that never contains a repeat. Remember each letter\'s **last position** in a dictionary.',
      'For each letter, if it was last seen at an index that is inside the window (`last[ch] >= start`), move `start` to `last[ch] + 1`.',
      'Then record `last[ch] = i` and update the answer with `i - start + 1`. The `>= start` check is what stops the window from moving backward.',
    ],
    's = input().strip()\nlast = {}\nstart = 0\nbest = 0\nfor i, ch in enumerate(s):\n    if ch in last and last[ch] >= start:\n        start = last[ch] + 1\n    last[ch] = i\n    best = max(best, i - start + 1)\nprint(best)\n', [
      { t: 'p', text: 'A **sliding window** is a range of the text that grows on the right and shrinks on the left, so every character is looked at only a few times.' },
      { t: 'analogy', text: 'It is a highlighter moving across a line of text: stretch it on the right while everything inside is different, and slide the left edge past the old copy when a repeat shows up.' },
    ], true),

  P('io-kadane', 'Best stretch of profit', 50, 'Array navigation: the biggest total in a row of numbers.',
    'The first line is `n`. The second line has `n` integers, which may be negative: the profit or loss of each day. Print the biggest total you can get from a stretch of **consecutive** days (at least one day). `n` can be 100000.', [
      t('9\n-2 1 -3 4 -1 2 1 -5 4\n', '6'),
      t('4\n1 2 3 4\n', '10'),
      t('1\n-5\n', '-5', 'You must pick at least one day, so the answer can be negative.'),
      t('5\n-3 -1 -2 -4 -5\n', '-1', 'When every day is a loss, the best stretch is the single least bad day.'),
      t('5\n5 -10 4 -1 3\n', '6', 'The best stretch does not have to start at the first day.'),
      t(`${N}\n${rep(1, N)}\n`, String(N), 'Large input. Checking every possible stretch takes billions of steps. One pass is enough.'),
    ], [
      'Walk through the numbers keeping `current`: the best total of a stretch that **ends at this day**.',
      'At each day, either extend the stretch (`current + x`) or start fresh at this day (`x`). Take the bigger: `current = max(x, current + x)`.',
      'Keep `best = max(best, current)`. Start both from the first number, not from 0, so all-negative input works.',
    ],
    'n = int(input())\nnums = list(map(int, input().split()))\ncurrent = best = nums[0]\nfor x in nums[1:]:\n    current = max(x, current + x)\n    best = max(best, current)\nprint(best)\n', [
      { t: 'p', text: 'The question at each day is: "Is it better to carry on with the stretch I had, or to throw it away and start again from here?" If the stretch so far is negative, throw it away.' },
      { t: 'warn', text: 'Do not start `best` at 0. If every number is negative, the correct answer is negative, and a starting value of 0 would hide it.' },
    ], true),

  P('io-zip', 'Zip two words', 30, 'String building: take turns, then add what is left.',
    'Two lines each hold a word (either may be empty). Build a new word by taking one letter from the first word, then one from the second, and so on. When one word runs out, add the rest of the other. Print the result. Each word can have 50000 letters.', [
      t('abc\n12345\n', 'a1b2c345'),
      t('cat\ndog\n', 'cdaotg'),
      t('ab\n\n', 'ab', 'The second word is empty, so the first comes out unchanged.'),
      t('\nxyz\n', 'xyz', 'The first word is empty.'),
      t(`${'a'.repeat(50000)}\n${'b'.repeat(50000)}\n`, 'ab'.repeat(50000), 'Large input. Build a list of pieces and join once at the end.'),
    ], [
      'Find the length of the shorter word with `min(len(a), len(b))`.',
      'Loop over that many positions and add `a[i]` then `b[i]` to a list `out`.',
      'After the loop, add the leftovers: `a[k:]` and `b[k:]` (one of them is empty). Print `"".join(out)`.',
    ],
    'a = input()\nb = input()\nk = min(len(a), len(b))\nout = []\nfor i in range(k):\n    out.append(a[i])\n    out.append(b[i])\nout.append(a[k:])\nout.append(b[k:])\nprint("".join(out))\n', [
      { t: 'p', text: 'Slicing past the end of a string is safe in Python: `"abc"[3:]` is simply an empty string. That makes the "leftover" step work without any `if` checks.' },
    ], true),

  P('io-cookies', 'Assign the cookies', 40, 'Greedy with two sorted lists.',
    'The first line lists each child\'s **greed**: the smallest cookie size that makes that child happy. The second line lists the sizes of the available cookies (it may be empty). Each child can get at most one cookie, and each cookie can go to at most one child. A child is happy if the cookie size is at least their greed. Print the largest number of happy children. Each line can hold 100000 numbers.', [
      t('1 2 3\n1 1\n', '1'),
      t('1 2\n1 2 3\n', '2'),
      t('5 6\n1 2\n', '0'),
      t('3 1 2\n2 3\n', '2', 'The lists are not sorted. Sort both first.'),
      t('4 2 1\n\n', '0', 'The second line is empty, so there are no cookies.'),
      t(`${rep(1, N)}\n${rep(1, N)}\n`, String(N), 'Large input. Sort and scan once.'),
    ], [
      'Sort both lists, smallest first.',
      'Go through the cookies from smallest to largest. Keep a pointer `i` to the least greedy child who is still unhappy.',
      'If `cookie >= greed[i]`, that cookie makes child `i` happy, so move `i` forward. The final `i` is the answer.',
    ],
    'greed = sorted(map(int, input().split()))\ncookies = sorted(map(int, input().split()))\ni = 0\nfor c in cookies:\n    if i < len(greed) and greed[i] <= c:\n        i += 1\nprint(i)\n', [
      { t: 'p', text: 'The greedy idea: give each cookie to the **least demanding** child it can satisfy. Large cookies are never wasted on a child who would have been happy with a small one.' },
      { t: 'tip', text: '`input().split()` on an empty line gives an empty list, so `sorted(map(int, ...))` is fine with no cookies.' },
    ]),
];

// Required problems first, then the optional stretch problems (harder than the recommended practice list).
ioSet6.sort((a, b) => (a.optional ? 1 : 0) - (b.optional ? 1 : 0));
ioSet6.forEach((i) => { if (i.optional) i.blurb = `Stretch: ${i.blurb}`; });
