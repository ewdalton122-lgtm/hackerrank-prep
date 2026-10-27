import { ioSet6 } from './pythonhard.js';
// Exam-style Python problems: the program reads from input() and prints the answer.
// Every problem is written from scratch. Visible tests teach; hidden tests check the edge cases.
// t(input, output, edge?) -> a test; passing an edge message makes it a hidden test.
const t = (input, output, edge) => ({ input, output, ...(edge ? { hidden: true, edge } : {}) });
const START = '# Read the input with input(), then print the answer.\n';

const P = (id, title, minutes, blurb, prompt, tests, hints, solution, blocks = []) => ({
  id, title, minutes, blurb, blocks,
  exercise: { kind: 'python', io: true, prompt, starter: START, tests, hints, solution },
});

// ---------------------------------------------------------------- Set 1: first programs
export const ioSet1 = [
  P('io-hello', 'Greet by name', 25, 'Read a line of text and print a sentence.', 'Read one line containing a name. Print `Hello, NAME!` using that name.', [
    t('Ava\n', 'Hello, Ava!'),
    t('Sam Lee\n', 'Hello, Sam Lee!'),
    t('  Zoe  \n', 'Hello, Zoe!', 'Spaces around the name should be removed.'),
  ], ['`name = input()` reads one line.', '`.strip()` removes spaces at both ends.', '`print(f"Hello, {name}!")`'],
  'name = input().strip()\nprint(f"Hello, {name}!")\n', [
    { t: 'p', text: 'Every exam problem follows the same three steps: **read** the input, **compute** the answer, **print** it. This first one has almost no computing.' },
  ]),

  P('io-sum', 'Add up a list', 30, 'Read a count and a line of numbers.', 'The first line is `n`, the number of values. The second line holds `n` integers separated by spaces. Print their sum.', [
    t('5\n1 2 3 4 5\n', '15'),
    t('1\n-7\n', '-7'),
    t('3\n1000000000 1000000000 1000000000\n', '3000000000', 'Python handles very large numbers. Make sure you convert the text to integers before adding.'),
  ], ['`input().split()` turns `"1 2 3"` into `["1", "2", "3"]`.', 'Convert each piece with `int`: `nums = list(map(int, input().split()))`.', '`print(sum(nums))`. The first line (n) can simply be read and ignored.'],
  'n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(nums))\n'),

  P('io-triplets', 'Compare the scores', 35, 'Two rating lists, one point per win.', 'Two lines each hold three integers: Alice\'s ratings, then Bob\'s. Compare them position by position. Whoever has the higher number in a position gets 1 point (ties give nobody a point). Print Alice\'s points and Bob\'s points on one line, separated by a space.', [
    t('5 6 7\n3 6 10\n', '1 1'),
    t('17 28 30\n99 16 8\n', '2 1'),
    t('1 1 1\n1 1 1\n', '0 0', 'When every rating ties, nobody scores.'),
  ], ['Read both lines into lists with `list(map(int, input().split()))`.', 'Loop over the positions 0 to 2 with `for i in range(3)`.', 'Add 1 to `alice` if `a[i] > b[i]`, and 1 to `bob` if `a[i] < b[i]`. Then `print(alice, bob)`.'],
  'a = list(map(int, input().split()))\nb = list(map(int, input().split()))\nalice = bob = 0\nfor i in range(3):\n    if a[i] > b[i]:\n        alice += 1\n    elif a[i] < b[i]:\n        bob += 1\nprint(alice, bob)\n'),

  P('io-ratios', 'Share of positive, negative and zero', 40, 'Counting, dividing and formatting to six decimals.', 'The first line is `n`. The second line has `n` integers. Print three lines: the fraction of numbers that are positive, then negative, then zero. Each fraction must have exactly **6 decimal places**.', [
    t('6\n-4 3 -9 0 4 1\n', '0.500000\n0.333333\n0.166667'),
    t('3\n0 0 0\n', '0.000000\n0.000000\n1.000000'),
    t('1\n5\n', '1.000000\n0.000000\n0.000000', 'With one number, one fraction is 1 and the others are 0.'),
  ], ['Count how many numbers are `> 0`, how many are `< 0` and how many are `== 0`.', 'Divide each count by `n`.', 'Format with `f"{value:.6f}"`, and print each on its own line.'],
  'n = int(input())\nnums = list(map(int, input().split()))\npos = sum(1 for x in nums if x > 0)\nneg = sum(1 for x in nums if x < 0)\nzero = n - pos - neg\nfor c in (pos, neg, zero):\n    print(f"{c / n:.6f}")\n', [
    { t: 'tip', text: '`f"{x:.2f}"` rounds to 2 decimals and always shows them, even `3.00`. Exam graders compare text exactly, so formatting matters.' },
  ]),

  P('io-fizzbuzz', 'Count with a twist', 30, 'A classic interview warm-up.', 'Read `n`. Print the numbers from 1 to `n`, one per line, but print `Fizz` for multiples of 3, `Buzz` for multiples of 5, and `FizzBuzz` for multiples of both.', [
    t('5\n', '1\n2\nFizz\n4\nBuzz'),
    t('15\n', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'),
    t('1\n', '1', 'The smallest case: just the number 1.'),
  ], ['Loop with `for i in range(1, n + 1)`.', 'Check the **both** case first: `if i % 15 == 0`.', 'Then `elif i % 3 == 0`, then `elif i % 5 == 0`, then `else: print(i)`.'],
  'n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)\n'),
];

// ---------------------------------------------------------------- Set 2: arrays and output formatting
export const ioSet2 = [
  P('io-stairs', 'Draw a staircase', 35, 'Printed shapes must match to the character.', 'Read `n`. Print a right-aligned staircase of `n` rows, each exactly `n` characters wide. Row `i` has `i` hash signs.', [
    t('3\n', '  #\n ##\n###'),
    t('1\n', '#'),
    t('6\n', '     #\n    ##\n   ###\n  ####\n #####\n######', 'A bigger staircase. Count the leading spaces on each row.'),
  ], ['Row `i` (starting at 1) has `n - i` spaces and then `i` hashes.', '`" " * 3` is three spaces. `"#" * 2` is `##`.', '`print(" " * (n - i) + "#" * i)` inside `for i in range(1, n + 1)`.'],
  'n = int(input())\nfor i in range(1, n + 1):\n    print(" " * (n - i) + "#" * i)\n'),

  P('io-tallest', 'How many are tallest', 30, 'Find the maximum, then count it.', 'The first line is `n`. The second line holds `n` heights. Print how many heights equal the tallest one.', [
    t('4\n3 2 1 3\n', '2'),
    t('5\n4 4 1 3 4\n', '3'),
    t('1\n9\n', '1', 'One item is always the tallest.'),
  ], ['`max(heights)` finds the tallest.', '`heights.count(x)` counts how often `x` appears.', '`print(heights.count(max(heights)))`'],
  'n = int(input())\nheights = list(map(int, input().split()))\nprint(heights.count(max(heights)))\n'),

  P('io-minmax', 'Smallest and largest sum of four', 35, 'Sort, then add the right pieces.', 'Read one line with five integers. If you add up exactly four of them, what are the smallest and the largest sums you can make? Print the two sums on one line, separated by a space.', [
    t('1 2 3 4 5\n', '10 14'),
    t('7 69 2 221 8974\n', '299 9271'),
    t('5 5 5 5 5\n', '20 20', 'When all values are equal, both sums are the same.'),
  ], ['The total of all five minus one number gives a sum of four.', 'Smallest sum: leave out the largest. Largest sum: leave out the smallest.', '`print(total - max(nums), total - min(nums))`'],
  'nums = list(map(int, input().split()))\ntotal = sum(nums)\nprint(total - max(nums), total - min(nums))\n'),

  P('io-diag', 'Diagonal difference', 40, 'A grid arrives as several lines.', 'The first line is `n`. The next `n` lines each hold `n` integers: a square grid. Print the absolute difference between the sum of the main diagonal (top-left to bottom-right) and the other diagonal (top-right to bottom-left).', [
    t('3\n11 2 4\n4 5 6\n10 8 -12\n', '15'),
    t('2\n1 2\n3 4\n', '0'),
    t('1\n5\n', '0', 'In a 1 by 1 grid both diagonals are the same cell.'),
  ], ['Read the rows with `rows = [list(map(int, input().split())) for _ in range(n)]`.', 'Main diagonal: `rows[i][i]`. Other diagonal: `rows[i][n - 1 - i]`.', '`print(abs(main - other))`'],
  'n = int(input())\nrows = [list(map(int, input().split())) for _ in range(n)]\nmain = sum(rows[i][i] for i in range(n))\nother = sum(rows[i][n - 1 - i] for i in range(n))\nprint(abs(main - other))\n'),

  P('io-rotate', 'Rotate a list left', 40, 'Slicing and wrap-around.', 'The first line has two integers: `n` (the length) and `d` (the number of left rotations). The second line has `n` integers. Rotate the list left `d` times (each rotation moves the first item to the end) and print the result on one line, separated by spaces.', [
    t('5 4\n1 2 3 4 5\n', '5 1 2 3 4'),
    t('3 1\n10 20 30\n', '20 30 10'),
    t('4 0\n1 2 3 4\n', '1 2 3 4', 'Zero rotations leaves the list unchanged.'),
    t('3 5\n1 2 3\n', '3 1 2', '`d` can be bigger than `n`. Rotating `n` times returns the list to where it started.'),
  ], ['Rotating left by `d` is `nums[d:] + nums[:d]`.', 'If `d` can exceed `n`, use `d = d % n` first.', 'Print with `print(*result)`, which separates the items with spaces.'],
  'n, d = map(int, input().split())\nnums = input().split()\nd %= n\nprint(*(nums[d:] + nums[:d]))\n', [
    { t: 'tip', text: '`print(*items)` prints each item separated by a single space. It is the neatest way to print a list on one line.' },
  ]),
];

// ---------------------------------------------------------------- Set 3: strings
export const ioSet3 = [
  P('io-swapcase', 'Swap the case', 25, 'String methods do the work.', 'Read one line. Print it with every uppercase letter made lowercase and every lowercase letter made uppercase. Other characters stay as they are.', [
    t('Www.HackerRank.com\n', 'wWW.hACKERrANK.COM'),
    t('Pythonist 2\n', 'pYTHONIST 2'),
    t('123\n', '123', 'Digits have no case, so nothing changes.'),
  ], ['Python has a method for exactly this.', 'It is called `swapcase()`.', '`print(input().swapcase())`'],
  'print(input().swapcase())\n'),

  P('io-time', 'Convert to 24-hour time', 45, 'Parsing text and handling the midnight and noon edge cases.', 'Read a time in 12-hour format such as `07:05:45PM`. Print it in 24-hour format `HH:MM:SS`. Note that `12:00:00AM` is `00:00:00` and `12:00:00PM` is `12:00:00`.', [
    t('07:05:45PM\n', '19:05:45'),
    t('12:01:00AM\n', '00:01:00'),
    t('12:45:54PM\n', '12:45:54', 'Noon stays 12 in the afternoon.'),
    t('12:00:00AM\n', '00:00:00', 'Midnight becomes 00.'),
  ], ['Slice the text: hour is `s[:2]`, the rest of the time is `s[2:8]`, and AM or PM is `s[8:]`.', 'Turn the hour into a number: `h = int(s[:2]) % 12`. That makes 12 become 0.', 'If it is PM, add 12. Print the hour with two digits: `f"{h:02d}"`.'],
  's = input().strip()\nh = int(s[:2]) % 12\nif s[8:] == "PM":\n    h += 12\nprint(f"{h:02d}" + s[2:8])\n', [
    { t: 'tip', text: '`f"{5:02d}"` gives `05`. The `02d` means a whole number padded with zeros to 2 digits.' },
  ]),

  P('io-pangram', 'Does it use every letter?', 35, 'Sets answer "which items appear" questions.', 'Read one line of text. If it contains **every letter** of the alphabet at least once (ignoring case), print `pangram`. Otherwise print `not pangram`.', [
    t('We promptly judged antique ivory buckles for the next prize\n', 'pangram'),
    t('We promptly judged antique ivory buckles for the prize\n', 'not pangram'),
    t('ABCDEFGHIJKLMNOPQRSTUVWXYZ\n', 'pangram', 'Capital letters count as the same letters.'),
  ], ['Make the text lowercase first: `.lower()`.', 'A set keeps one copy of each item: `set(text)`.', 'Keep only letters, then check if there are 26 different ones: `len({c for c in text if c.isalpha()}) == 26`.'],
  'text = input().lower()\nletters = {c for c in text if c.isalpha()}\nprint("pangram" if len(letters) == 26 else "not pangram")\n'),

  P('io-sos', 'Count the damaged letters', 35, 'Process a string in chunks of three.', 'A message should be the text `SOS` repeated. The input line has a length that is a multiple of 3. Count how many **letters** differ from what `SOSSOSSOS...` should be at that position, and print the count.', [
    t('SOSSPSSQSSOR\n', '3'),
    t('SOSSOT\n', '1'),
    t('SOS\n', '0', 'A perfect message has zero damaged letters.'),
  ], ['The correct letter at position `i` is `"SOS"[i % 3]`.', 'Loop over the positions with `for i, c in enumerate(s)`.', 'Add 1 to a counter whenever `c != "SOS"[i % 3]`.'],
  's = input().strip()\nbad = 0\nfor i, c in enumerate(s):\n    if c != "SOS"[i % 3]:\n        bad += 1\nprint(bad)\n'),

  P('io-palin', 'Palindrome check', 40, 'Clean the text, then compare it with itself reversed.', 'Read one line. Ignoring case, spaces and punctuation (keep only letters and digits), decide whether it reads the same forwards and backwards. Print `YES` or `NO`.', [
    t('A man, a plan, a canal: Panama\n', 'YES'),
    t('hello\n', 'NO'),
    t("No 'x' in Nixon\n", 'YES', 'Apostrophes and spaces are ignored.'),
  ], ['Keep only letters and digits, in lowercase: `"".join(c.lower() for c in s if c.isalnum())`.', 'Reverse a string with `s[::-1]`.', '`print("YES" if clean == clean[::-1] else "NO")`'],
  's = input()\nclean = "".join(c.lower() for c in s if c.isalnum())\nprint("YES" if clean == clean[::-1] else "NO")\n'),
];

// ---------------------------------------------------------------- Set 4: dictionaries and sets
export const ioSet4 = [
  P('io-topword', 'Most common word', 40, 'The counting pattern with a dictionary.', 'Read one line of lowercase words separated by spaces. Print the word that appears **most often**. If several words tie, print the one that comes first alphabetically.', [
    t('the cat and the dog and the bird\n', 'the'),
    t('b a b a\n', 'a'),
    t('x\n', 'x', 'A single word is the most common word.'),
  ], ['Count each word: `counts[w] = counts.get(w, 0) + 1`.', 'You want the highest count, and among ties the smallest word.', '`min(counts, key=lambda w: (-counts[w], w))` picks it. The minus flips "highest count" into "smallest key".'],
  'words = input().split()\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(min(counts, key=lambda w: (-counts[w], w)))\n'),

  P('io-socks', 'Match the socks', 35, 'Counting pairs.', 'The first line is `n`, the number of socks. The second line has `n` integers, each a colour. A pair is two socks of the same colour. Print the number of pairs you can make.', [
    t('9\n10 20 20 10 10 30 50 10 20\n', '3'),
    t('3\n1 2 3\n', '0'),
    t('4\n5 5 5 5\n', '2', 'Four socks of one colour make two pairs.'),
  ], ['Count how many socks of each colour there are.', 'A colour with `c` socks makes `c // 2` pairs.', 'Add up `c // 2` over all the colours. `collections.Counter` does the counting for you.'],
  'from collections import Counter\nn = int(input())\ncolors = input().split()\nprint(sum(c // 2 for c in Counter(colors).values()))\n'),

  P('io-birds', 'Most sighted bird', 35, 'Counting with a tie-break.', 'The first line is `n`. The second line holds `n` bird type numbers. Print the type that was sighted most often. If several types tie, print the **smallest** type number.', [
    t('6\n1 4 4 4 5 3\n', '4'),
    t('11\n1 2 3 4 5 4 3 2 1 3 4\n', '3'),
    t('1\n2\n', '2', 'A single sighting.'),
  ], ['Count each type.', 'Highest count wins; ties go to the smaller number.', '`min(counts, key=lambda k: (-counts[k], k))` with numbers (not text) as keys.'],
  'n = int(input())\ntypes = list(map(int, input().split()))\ncounts = {}\nfor x in types:\n    counts[x] = counts.get(x, 0) + 1\nprint(min(counts, key=lambda k: (-counts[k], k)))\n'),

  P('io-share', 'Do they share a letter?', 30, 'Sets and overlap.', 'Read two lines of lowercase text. If they have at least one letter in common, print `YES`. Otherwise print `NO`.', [
    t('hello\nworld\n', 'YES'),
    t('hi\nbye\n', 'NO'),
    t('a\na\n', 'YES', 'A single shared letter is enough.'),
  ], ['Turn each line into a set of letters with `set(...)`.', 'The overlap of two sets is `a & b`.', 'If the overlap is not empty, print `YES`.'],
  'a = set(input().strip())\nb = set(input().strip())\nprint("YES" if a & b else "NO")\n'),

  P('io-deletions', 'Make them anagrams', 45, 'Compare letter counts.', 'Read two lowercase words. Print the smallest number of letters you must delete (from either word) so the two become anagrams of each other.', [
    t('cde\nabc\n', '4'),
    t('a\nb\n', '2'),
    t('abc\nabc\n', '0', 'Identical words need no deletions.'),
  ], ['Count the letters in each word with `Counter`.', 'For each letter, the extra letters are the difference between the two counts.', 'Add up `abs(a[c] - b[c])` over all letters that appear in either word.'],
  'from collections import Counter\na = Counter(input().strip())\nb = Counter(input().strip())\nprint(sum(abs(a[c] - b[c]) for c in set(a) | set(b)))\n'),
];

// ---------------------------------------------------------------- Set 5: sorting and greedy choices
export const ioSet5 = [
  P('io-cake', 'Burn the fewest miles', 45, 'Sort first, then be greedy.', 'The first line is `n`. The second line has `n` calorie values. Eating the cupcake at position `i` (counting from 0, in the order you choose) costs `calories * 2**i` miles of running. Print the **smallest total miles** possible.', [
    t('3\n1 3 2\n', '11'),
    t('4\n7 4 9 6\n', '79'),
    t('1\n5\n', '5', 'With one cupcake there is no choice.'),
  ], ['Put the biggest calorie values first, where the multiplier is smallest.', '`sorted(cal, reverse=True)` lists them biggest first.', 'Add `c * 2 ** i` for each `(i, c)` from `enumerate(...)`.'],
  'n = int(input())\ncal = list(map(int, input().split()))\nprint(sum(c * 2 ** i for i, c in enumerate(sorted(cal, reverse=True))))\n'),

  P('io-toys', 'Spend a budget', 40, 'Buy the cheapest first.', 'The first line has `n` (the number of toys) and `k` (your budget). The second line has the `n` prices. Print the **most toys** you can buy without spending more than `k`.', [
    t('7 50\n1 12 5 111 200 1000 10\n', '4'),
    t('3 5\n6 7 8\n', '0'),
    t('3 6\n6 7 8\n', '1', 'Spending exactly the full budget is allowed.'),
  ], ['To buy the most toys, always buy the cheapest next.', 'Sort the prices with `sorted(prices)`.', 'Loop through them, subtracting from the budget, and stop when the next price does not fit.'],
  'n, k = map(int, input().split())\nprices = sorted(map(int, input().split()))\ncount = 0\nfor p in prices:\n    if p > k:\n        break\n    k -= p\n    count += 1\nprint(count)\n'),

  P('io-closest', 'Smallest gap', 40, 'After sorting, the closest pair sits side by side.', 'The first line is `n`. The second line has `n` integers. Print the smallest absolute difference between any two of them.', [
    t('3\n3 -7 0\n', '3'),
    t('5\n1 -3 71 68 17\n', '3'),
    t('2\n5 5\n', '0', 'Equal values have a gap of 0.'),
  ], ['Comparing every pair works for small lists but is slow for big ones.', 'Sort the numbers. The closest pair must be neighbours.', '`min(b - a for a, b in zip(nums, nums[1:]))` on the sorted list.'],
  'n = int(input())\nnums = sorted(map(int, input().split()))\nprint(min(b - a for a, b in zip(nums, nums[1:])))\n'),

  P('io-gridsort', 'Sort rows, check columns', 55, 'Two ideas combined.', 'The first line is `n`. The next `n` lines are strings of the same length. Sort the letters inside each row alphabetically. Then print `YES` if every column reads in non-decreasing alphabetical order from top to bottom, otherwise `NO`.', [
    t('5\nebacd\nfghij\nolmkn\ntrpqs\nxywuv\n', 'YES'),
    t('3\nmpxz\nabcd\nwlmf\n', 'NO'),
    t('1\nz\n', 'YES', 'One row has nothing above it to compare with.'),
  ], ['Sort each row: `"".join(sorted(row))`.', 'Compare each row with the one above it, column by column.', 'If any letter is smaller than the letter above it, print `NO` and stop. If you finish with no problems, print `YES`.'],
  'n = int(input())\nrows = ["".join(sorted(input().strip())) for _ in range(n)]\nok = True\nfor r in range(1, n):\n    for c in range(len(rows[r])):\n        if rows[r][c] < rows[r - 1][c]:\n            ok = False\nprint("YES" if ok else "NO")\n'),

  P('io-search', 'Find it fast', 50, 'Binary search on a sorted list.', 'The first line has `n` and a `target`. The second line has `n` integers in increasing order. Print the **index** (counting from 0) of the target, or `-1` if it is not there.', [
    t('5 7\n1 3 5 7 9\n', '3'),
    t('5 4\n1 3 5 7 9\n', '-1'),
    t('1 5\n5\n', '0', 'A single item that matches.'),
    t('1 9\n5\n', '-1', 'A single item that does not match.'),
  ], ['Keep two edges: `low = 0` and `high = n - 1`.', 'Look at the middle `mid = (low + high) // 2`. Too small: `low = mid + 1`. Too big: `high = mid - 1`.', 'Stop when `low > high`. If you never found it, print `-1`.'],
  'n, target = map(int, input().split())\nnums = list(map(int, input().split()))\nlow, high = 0, n - 1\nans = -1\nwhile low <= high:\n    mid = (low + high) // 2\n    if nums[mid] == target:\n        ans = mid\n        break\n    elif nums[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nprint(ans)\n'),
];

export const ioSets = [
  { id: 'io-set-1', title: 'Coding set 1: first programs', items: ioSet1 },
  { id: 'io-set-2', title: 'Coding set 2: arrays and printed output', items: ioSet2 },
  { id: 'io-set-3', title: 'Coding set 3: strings', items: ioSet3 },
  { id: 'io-set-4', title: 'Coding set 4: dictionaries and sets', items: ioSet4 },
  { id: 'io-set-5', title: 'Coding set 5: sorting and greedy choices', items: ioSet5 },
  { id: 'io-set-6', title: 'Coding set 6: exam-level problems', items: ioSet6 },
];
