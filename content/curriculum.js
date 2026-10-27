import { orient } from './orient.js';
import { python } from './python.js';
import { sql, sqlAdv } from './sql.js';
import { prompts } from './prompts.js';
import { systems } from './systems.js';
import { practice } from './practice.js';
import { sqlDrills } from './sqlpractice.js';
import { promptMore } from './promptdrills.js';
import { interview } from './interview.js';

const r = (id, title, minutes, blurb, links, blocks) => ({ id, title, minutes, blurb, links, blocks });

const codingStrategy = {
  id: 'cd-strategy',
  title: 'Coding strategy: bank points first',
  minutes: 30,
  blurb: 'Read constraints, write the simple version, submit, then improve.',
  blocks: [
    { t: 'p', text: 'Because each hidden test case has its own points, the best order of work is predictable:' },
    { t: 'list', items: [
      '**Read the problem for 3 minutes.** Note the input format, the output format and the **constraints** (for example n up to 100,000).',
      '**Work the sample by hand.** Be able to say, in plain words, how you get the sample output.',
      '**Write the simplest correct version and submit it.** It banks the easy cases even if it is slow.',
      '**Then optimize** if the constraints are large, and resubmit. Only the last submission counts.',
      '**Test edges:** empty input, one item, duplicates, zeros, negatives.',
    ] },
    { t: 'analogy', text: 'Constraints are like a term sheet: n up to 1,000 means a simple double loop is fine; n up to 100,000 means you need a sort or a dictionary.' },
  ],
  quiz: [
    {
      q: 'You have 20 minutes left. You have a slow solution that passes the small cases and an idea for a faster one you have not written. What should you do first?',
      options: ['Delete the slow code and start over', 'Submit the slow solution now, then try the faster idea', 'Wait until the faster one is perfect', 'Move on without submitting'],
      answer: 1,
      explain: [
        'You would risk ending with nothing graded.',
        'Correct. Banking the easy cases is worth points, and you can resubmit later.',
        'Unsubmitted code earns nothing.',
        'The slow solution still earns the small cases.',
      ],
    },
    {
      q: 'The input has n up to 100,000. Which approach is probably too slow?',
      options: ['One pass through the list', 'A dictionary lookup per item', 'A loop inside a loop over the whole list', 'Sorting once'],
      answer: 2,
      explain: [
        'One pass is fast.',
        'Dictionary lookups are fast.',
        'Correct. Nested loops do about n times n steps, which is 10 billion at this size.',
        'Sorting is n log n, which is fine.',
      ],
    },
  ],
};

export const STAGES = [
  {
    id: 's0', num: 0, title: 'Orientation', roles: ['ds', 'fde'],
    summary: 'Learn the scoreboard and the rules before you learn the code.',
    items: orient,
  },
  {
    id: 's1', num: 1, title: 'Python basics', roles: ['ds', 'fde'],
    summary: 'Variables, decisions, loops, text, dictionaries and functions. Enough to bank the easy test cases.',
    items: python,
  },
  {
    id: 's2', num: 2, title: 'SQL foundations', roles: ['ds', 'fde'],
    summary: 'Filtering, grouping and joins. The SQL version of what you already do in Excel.',
    items: sql,
  },
  {
    id: 's3', num: 3, title: 'SQL advanced', roles: ['ds', 'fde'],
    summary: 'Window functions, ranking, running totals and date functions.',
    items: [...sqlAdv.slice(0, 3), ...sqlDrills, ...sqlAdv.slice(3)],
  },
  {
    id: 's4', num: 4, title: 'Prompt engineering', roles: ['ds', 'fde'],
    summary: 'Write prompts whose output matches an exact expected answer.',
    items: [...prompts.slice(0, -1), ...promptMore, ...prompts.slice(-1)],
  },
  {
    id: 's5', num: 5, title: 'System design and stakeholders', roles: ['ds', 'fde'],
    summary: 'Architecture vocabulary for multiple choice, and structured written replies.',
    items: systems,
  },
  {
    id: 's6', num: 6, title: 'Coding warm-ups', roles: ['ds', 'fde'],
    summary: 'Easy and medium HackerRank problems that bank the straightforward test cases.',
    items: [
      codingStrategy,
      r('cw-1', 'Warm-up set 1: first programs', 150, 'Simple functions and sums.', [
        { label: 'Solve Me First', url: 'https://www.hackerrank.com/challenges/solve-me-first/problem', use: 'Functions and return' },
        { label: 'Simple Array Sum', url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem', use: 'Accumulator loop' },
        { label: 'A Very Big Sum', url: 'https://www.hackerrank.com/challenges/a-very-big-sum/problem', use: 'Same pattern, bigger numbers' },
        { label: 'Compare the Triplets', url: 'https://www.hackerrank.com/challenges/compare-the-triplets/problem', use: 'Comparisons' },
        { label: 'Plus Minus', url: 'https://www.hackerrank.com/challenges/plus-minus/problem', use: 'Counting and formatting output' },
      ]),
      r('cw-2', 'Warm-up set 2: arrays and output formatting', 180, 'Loops, max/min, nested loops.', [
        { label: 'Staircase', url: 'https://www.hackerrank.com/challenges/staircase/problem', use: 'Nested loops and printed output' },
        { label: 'Birthday Cake Candles', url: 'https://www.hackerrank.com/challenges/birthday-cake-candles/problem', use: 'Max and count' },
        { label: 'Mini-Max Sum', url: 'https://www.hackerrank.com/challenges/mini-max-sum/problem', use: 'Sort, sum, min and max' },
        { label: 'Diagonal Difference', url: 'https://www.hackerrank.com/challenges/diagonal-difference/problem', use: 'A 2D grid' },
        { label: 'Apple and Orange', url: 'https://www.hackerrank.com/challenges/apple-and-orange/problem', use: 'Ranges and conditions' },
      ]),
      r('cw-3', 'Warm-up set 3: strings', 180, 'Parsing and cleaning text.', [
        { label: 'sWAP cASE', url: 'https://www.hackerrank.com/challenges/swap-case/problem', use: 'String methods' },
        { label: 'String Split and Join', url: 'https://www.hackerrank.com/challenges/python-string-split-and-join/problem', use: 'split and join' },
        { label: 'Time Conversion', url: 'https://www.hackerrank.com/challenges/time-conversion/problem', use: 'Parsing and formatting' },
        { label: 'Pangrams', url: 'https://www.hackerrank.com/challenges/pangrams/problem', use: 'Sets' },
        { label: 'Mars Exploration', url: 'https://www.hackerrank.com/challenges/mars-exploration/problem', use: 'Counting mismatches' },
      ]),
      r('cw-4', 'Warm-up set 4: dictionaries and sets', 180, 'Counting and lookup.', [
        { label: 'collections.Counter()', url: 'https://www.hackerrank.com/challenges/collections-counter/problem', use: 'Counting' },
        { label: 'Sales by Match', url: 'https://www.hackerrank.com/challenges/sock-merchant/problem', use: 'Dictionary counting' },
        { label: 'Migratory Birds', url: 'https://www.hackerrank.com/challenges/migratory-birds/problem', use: 'Counting and ties' },
        { label: 'Two Strings', url: 'https://www.hackerrank.com/challenges/two-strings/problem', use: 'Sets' },
        { label: 'Making Anagrams', url: 'https://www.hackerrank.com/challenges/ctci-making-anagrams/problem', use: 'Counting letters' },
      ]),
      r('cw-5', 'Warm-up set 5: sorting and a first greedy idea', 180, 'Sort, then take the obvious choice.', [
        { label: 'Marc\'s Cakewalk', url: 'https://www.hackerrank.com/challenges/marcs-cakewalk/problem', use: 'Sort then multiply' },
        { label: 'Mark and Toys', url: 'https://www.hackerrank.com/challenges/mark-and-toys/problem', use: 'Sort, then spend a budget' },
        { label: 'Minimum Absolute Difference in an Array', url: 'https://www.hackerrank.com/challenges/minimum-absolute-difference-in-an-array/problem', use: 'Sort, compare neighbours' },
        { label: 'Grid Challenge', url: 'https://www.hackerrank.com/challenges/grid-challenge/problem', use: 'Sorting inside a grid (harder)' },
      ]),
      r('cw-6', 'Software Engineer prep kit', 240, 'HackerRank\'s own interview-style problem set.', [
        { label: 'HackerRank Software Engineer Prep Kit', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit', use: 'Needs a HackerRank login. Pick problems tagged easy first. Binary search and running-average problems are good practice.' },
        { label: 'HackerRank Preparation Kits', url: 'https://www.hackerrank.com/interview/preparation-kits', use: '1-week kit: 21 problems.' },
      ]),
      r('cw-7', 'Binary search and running totals', 240, 'Two patterns that show up in real exam problems.', [
        { label: 'Lookup with Binary Search', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/lookup-with-binary-search/problem', use: 'Plain binary search. Needs a HackerRank login.' },
        { label: 'Find Peak Element in Bitonic Array', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/find-peak-element-in-bitonic-array/problem', use: 'Binary search with a twist. Do it after the one above.' },
        { label: 'Check Valid Anagram', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/check-valid-anagram/problem', use: 'Counting letters with a dictionary' },
        { label: 'Count Elements Greater Than Previous Average', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/count-elements-greater-than-previous-average/problem', use: 'Keep a running sum, then divide' },
      ], [
        { t: 'h', text: 'Binary search: guess the middle' },
        { t: 'p', text: 'Searching a **sorted** list one item at a time is slow. Binary search looks at the middle item, throws away the half that cannot contain the answer, and repeats. A list of 1,000,000 items needs about 20 looks.' },
        { t: 'code', text: 'def find(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1      # answer is in the right half\n        else:\n            high = mid - 1     # answer is in the left half\n    return -1                  # not found' },
        { t: 'analogy', text: 'It is the "guess my number from 1 to 100" game. Guess 50, hear "higher", guess 75, and so on. You never need more than 7 guesses.' },
        { t: 'warn', text: 'The list must be sorted first. Most mistakes come from the loop condition (`low <= high`) and from forgetting the `+ 1` and `- 1`.' },
        { t: 'h', text: 'Running totals: keep a score as you go' },
        { t: 'p', text: 'Instead of re-adding the list every time, keep a `total` and a `count` as you loop. The average of everything so far is `total / count`. Update them **after** you compare the current item.' },
        { t: 'code', text: 'total = 0\nfor i, x in enumerate(nums):\n    if i > 0 and x > total / i:\n        print(x, "beats the average of the items before it")\n    total += x' },
        { t: 'tip', text: 'Write the simple version first and submit it, then improve. Each hidden test case earns its own points.' },
      ]),
      ...practice,
      r('cw-8', 'Checkpoint: the 13 representative problems', 300, 'A representative set of 13 problems. If you can solve most of these without help, your coding is in good shape.', [
        { label: '1. Solve Me First', url: 'https://www.hackerrank.com/challenges/solve-me-first/problem', use: 'Functions and return' },
        { label: '2. Simple Array Sum', url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem', use: 'Loop with a running total' },
        { label: '3. Birthday Cake Candles', url: 'https://www.hackerrank.com/challenges/birthday-cake-candles/problem', use: 'Max and count' },
        { label: '4. Lookup with Binary Search', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/lookup-with-binary-search/problem', use: 'Binary search' },
        { label: '5. Apple and Orange', url: 'https://www.hackerrank.com/challenges/apple-and-orange/problem', use: 'Loops, conditions, ranges' },
        { label: '6. Staircase', url: 'https://www.hackerrank.com/challenges/staircase/problem', use: 'Nested loops and printed output' },
        { label: '7. Find Peak Element in Bitonic Array', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/find-peak-element-in-bitonic-array/problem', use: 'Modified binary search' },
        { label: '8. Marc\'s Cakewalk', url: 'https://www.hackerrank.com/challenges/marcs-cakewalk/problem', use: 'Sort then greedy' },
        { label: '9. Mini-Max Sum', url: 'https://www.hackerrank.com/challenges/mini-max-sum/problem', use: 'Sort, sum, min and max' },
        { label: '10. Check Valid Anagram', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/check-valid-anagram/problem', use: 'Dictionary counting' },
        { label: '11. Diagonal Difference', url: 'https://www.hackerrank.com/challenges/diagonal-difference/problem', use: '2D grid' },
        { label: '12. Count Elements Greater Than Previous Average', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/count-elements-greater-than-previous-average/problem', use: 'Running average' },
        { label: '13. Grid Challenge', url: 'https://www.hackerrank.com/challenges/grid-challenge/problem', use: '2D grid and sorting' },
      ]),
    ],
  },
  {
    id: 's7', num: 7, title: 'Exam simulation', roles: ['ds', 'fde'],
    summary: 'Timed practice under exam conditions until your scores are comfortably above the bar.',
    items: [
      r('sim-1', 'Retake the HackerRank sample test', 45, 'Compare with your first attempt.', [
        { label: 'HackerRank sample test', url: 'https://www.hackerrank.com/test/sample', use: 'Full screen, timed, no notes.' },
      ]),
      r('sim-2', 'Skills certification: SQL (Basic)', 90, 'A free, timed SQL test.', [
        { label: 'HackerRank SQL (Basic) certification', url: 'https://www.hackerrank.com/skills-verification/sql_basic', use: 'Treat it like the real thing: one sitting, no help.' },
      ]),
      r('sim-3', 'Skills certification: Python (Basic)', 90, 'A free, timed Python test.', [
        { label: 'HackerRank Python (Basic) certification', url: 'https://www.hackerrank.com/skills-verification/python_basic', use: 'About 90 minutes, 2 questions.' },
      ]),
      r('sim-4', 'Mixed mock 1 (90 minutes)', 120, 'One coding problem, one SQL problem, one prompt drill, four MCQs, one written reply.', [
        { label: 'Build your own mock', url: 'https://www.hackerrank.com/domains/sql', use: 'Pick one unseen Medium SQL and one unseen Easy/Medium coding problem. Add a new prompt drill from a friend or the AI, plus 4 of your own MCQ flashcards. Time: coding 35 min, SQL 20, prompt 15, MCQ 8, written 7, review 5.' },
      ], [
        { t: 'p', text: 'After the mock, write down every point you lost and **why**: syntax, logic, format or time. Fix the pattern, not the single problem.' },
      ]),
      r('sim-5', 'Mixed mock 2 (90 minutes)', 120, 'Repeat with new problems.', [
        { label: 'HackerRank Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', use: 'Choose problems you have not seen.' },
      ]),
      r('sim-6', 'Mixed mock 3 (90 minutes)', 120, 'Aim for your target score two times in a row.', [
        { label: 'HackerRank Mock Interviews', url: 'https://www.hackerrank.com/mock-interviews', use: 'Optional extra timed practice.' },
      ]),
    ],
  },
  {
    id: 's8', num: 8, title: 'Patterns and Big-O (Forward Deployed Engineer path)', roles: ['fde'],
    summary: 'Needed if you aim for the 70% bar. Arrays, hashmaps, sorting, binary search and efficiency.',
    items: [
      r('pt-bigo', 'Big-O in plain English', 120, 'How code slows as input grows.', [
        { label: 'Grokking Algorithms, 2nd edition (paid book)', url: 'https://www.manning.com/books/grokking-algorithms-second-edition', use: 'The gentlest introduction to Big-O, hash tables and greedy. Chapters on Big-O, selection sort, hash tables and greedy.' },
        { label: 'Big-O cheat sheet', url: 'https://www.bigocheatsheet.com/', use: 'Quick reference.' },
      ]),
      r('pt-1', 'Interview Prep Kit: arrays, hashmaps, strings', 600, 'The core patterns.', [
        { label: 'Interview Preparation Kit', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', use: 'Warm-up, Arrays, Dictionaries and Hashmaps, Sorting, String Manipulation.' },
        { label: 'NeetCode 250', url: 'https://neetcode.io/practice/practice/neetcode250', use: 'Arrays and Hashing, Two Pointers, Sliding Window. Watch the video after each attempt.' },
      ]),
      r('pt-2', 'Binary search and running totals', 240, 'Halve the search space; keep running sums.', [
        { label: 'Lookup with Binary Search', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/lookup-with-binary-search/problem', use: 'Needs a HackerRank login.' },
        { label: 'Find Peak Element in Bitonic Array', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/find-peak-element-in-bitonic-array/problem', use: 'A variation of binary search. Needs a HackerRank login.' },
        { label: 'Count Elements Greater Than Previous Average', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/count-elements-greater-than-previous-average/problem', use: 'Running sum. Needs a HackerRank login.' },
        { label: 'Check Valid Anagram', url: 'https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/check-valid-anagram/problem', use: 'Hashmap counting. Needs a HackerRank login.' },
      ]),
    ],
  },
  {
    id: 's9', num: 9, title: 'Greedy and heaps (Forward Deployed Engineer path)', roles: ['fde'],
    summary: 'Needed if you aim for the 70% bar. Sort-then-choose problems and priority queues.',
    items: [
      r('gh-greedy', 'Greedy algorithms', 720, 'When taking the best choice now works.', [
        { label: 'USACO Guide: Intro to greedy', url: 'https://usaco.guide/bronze/intro-greedy', use: 'The core idea, and when greedy fails (coin-change counterexample).' },
        { label: 'Luck Balance', url: 'https://www.hackerrank.com/challenges/luck-balance/problem', use: 'Core' },
        { label: 'Permuting Two Arrays', url: 'https://www.hackerrank.com/challenges/two-arrays/problem', use: 'Core' },
        { label: 'Max Min', url: 'https://www.hackerrank.com/challenges/angry-children/problem', use: 'Exam level' },
        { label: 'Greedy Florist', url: 'https://www.hackerrank.com/challenges/greedy-florist/problem', use: 'Exam level' },
      ]),
      r('gh-heap', 'Heaps and priority queues', 720, 'Python\'s heapq: always get the smallest item fast.', [
        { label: 'Python heapq documentation', url: 'https://docs.python.org/3/library/heapq.html', use: 'Basic Examples section.' },
        { label: 'Real Python: heapq', url: 'https://realpython.com/python-heapq-module/', use: 'What are heaps, basic operations, problems heaps can solve.' },
        { label: 'LeetCode: Last Stone Weight', url: 'https://leetcode.com/problems/last-stone-weight/', use: 'Max-heap by negation.' },
        { label: 'LeetCode: Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', use: 'Top-k pattern.' },
        { label: 'LeetCode: Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', use: 'Count, then heap.' },
      ]),
    ],
  },
  {
    id: 's10', num: 10, title: 'Interview preparation', roles: ['ds', 'fde'], optional: true,
    summary: 'After the assessment: stories, presenting a build, and executive conversations. Not part of your daily study target.',
    items: interview,
  },
];

export const ROLES = {
  ds: { name: 'Deployment Strategist', bar: 60, short: 'Strategist' },
  fde: { name: 'Forward Deployed Engineer', bar: 70, short: 'Engineer' },
};

/** Ordered list of items for a role, with stage info attached. */
export function itemsFor(role) {
  const out = [];
  STAGES.filter((s) => s.roles.includes(role)).forEach((stage) => {
    stage.items.forEach((item) => out.push({ ...item, stage }));
  });
  return out;
}

export function findItem(id) {
  for (const stage of STAGES) {
    const item = stage.items.find((i) => i.id === id);
    if (item) return { ...item, stage };
  }
  return null;
}

/** Which parts must be completed before an item counts as done. */
export function requiredParts(item) {
  const parts = [];
  if (item.quiz?.length) parts.push('quiz');
  if (item.exercise) parts.push('ex');
  return parts;
}
