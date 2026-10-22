// Stage 0: Orientation. Only public HackerRank behaviour is described here.
export const orient = [
  {
    id: 'o-grading',
    title: 'How HackerRank grades your work',
    minutes: 25,
    blurb: 'Run vs Submit, sample vs hidden tests, and why exact matches matter.',
    blocks: [
      { t: 'p', text: "Before you learn any code, learn the scoreboard. Most beginners lose points to the platform's rules, not to the logic." },
      { t: 'h', text: 'Run is not Submit' },
      { t: 'list', items: [
        '**Run Code** tests your code on a sample input so you can see what happens. It does not bank any points.',
        '**Submit** saves your answer for grading. You can submit more than once; the **last submitted version** is the one that counts.',
        "If time runs out and you never ran or submitted a question, what you typed is **not graded at all**. Submit early, then improve and resubmit.",
      ] },
      { t: 'h', text: 'Sample tests and hidden tests' },
      { t: 'p', text: 'Every coding question is checked against many test cases. A few are **sample** cases you can see. The rest are **hidden** (shown with a lock icon): they probe edge cases like an empty list, a single item, or a huge input.' },
      { t: 'p', text: "Each test case carries its own points. Pass a case and you get its points; fail it and you get zero for that case. Your score is the sum of the cases you pass. That means a simple solution that handles normal inputs still earns real points." },
      { t: 'analogy', text: 'Think of hidden test cases as an auditor sampling transactions you have not seen. Clean books on the obvious entries are not enough; the odd ones decide the grade.' },
      { t: 'h', text: 'Exact match' },
      { t: 'p', text: 'Output is compared character by character. An extra space, an extra blank line, `9.0` instead of `9`, or a leftover debug `print` can turn a correct answer into a fail.' },
      { t: 'h', text: 'Return vs print' },
      { t: 'p', text: 'Most coding questions give you a function to complete. The platform calls your function and reads what it **returns**. Anything you `print` goes to a separate debug panel and is not graded.' },
      { t: 'warn', text: 'Switching the language dropdown on a question resets your code. Pick one language (Python) and stay with it.' },
    ],
    quiz: [
      {
        q: 'You wrote a solution, clicked Run Code, saw the right output, and the timer ran out. What is graded?',
        options: ['Your last run counts automatically', 'Nothing, because you never submitted', 'Only the sample test cases', 'Half credit for effort'],
        answer: 1,
        explain: [
          'Running only shows you output. It does not bank any points.',
          'Correct. Run Code is for checking; Submit is what saves your answer for grading.',
          'Sample cases are often worth zero points, and they still need a submit.',
          'There is no credit for effort. Only submitted code is scored.',
        ],
      },
      {
        q: 'A solution passes 3 of 8 hidden test cases. How is the question scored?',
        options: ['Zero, because it is not fully correct', 'The points of the 3 cases it passed', 'Always exactly 3/8 of the points', 'A human reviewer decides'],
        answer: 1,
        explain: [
          'Scoring is per test case, so passing some cases still earns points.',
          'Correct. Each test case has its own points; you keep the ones you pass.',
          'Close, but cases can be worth different amounts (harder cases often count for more).',
          'Coding questions are scored automatically against the test cases.',
        ],
      },
      {
        q: 'Your function computes the right total and runs `print(total)`. The platform says Wrong Answer. Most likely fix?',
        options: ['Add more print statements', 'Replace `print(total)` with `return total`', 'Switch to a different language', 'Use a bigger number type'],
        answer: 1,
        explain: [
          'More printing goes to the debug panel, which is not graded.',
          'Correct. The platform reads the value your function returns.',
          'Switching languages resets your code and does not fix this.',
          'Python integers do not overflow; this is a return problem.',
        ],
      },
      {
        q: 'Expected output is `9`. Your output is `9.0`. What happens?',
        options: ['Pass: they are the same number', 'Fail: output is compared as exact text', 'Partial credit', 'The platform converts it for you'],
        answer: 1,
        explain: [
          'To a person they are the same; to an exact-match checker they are different text.',
          'Correct. Match the format exactly, including decimals.',
          'There is no partial credit within a single test case.',
          'The platform does not guess what you meant.',
        ],
      },
    ],
  },
  {
    id: 'o-errors',
    title: 'Reading an error message without panic',
    minutes: 40,
    blurb: 'Errors are directions, not insults. Learn the three you will see most.',
    blocks: [
      { t: 'p', text: 'When Python cannot run your code it stops and tells you the **kind** of problem, the **line number**, and usually a plain-English message. Read the last line first.' },
      { t: 'h', text: 'The three you will meet constantly' },
      { t: 'list', items: [
        '**SyntaxError**: the code is not written in a form Python can read. Usually a missing colon, bracket or quote.',
        "**NameError**: you used a name Python has never heard of. Usually a typo (case matters) or a variable you have not created yet.",
        '**TypeError**: you mixed things that do not mix, like adding text and a number.',
      ] },
      { t: 'code', text: 'def double(x)        # SyntaxError: this line is missing its ":"\n    return x * 2\n\nprint(totl)          # NameError: name \'totl\' is not defined (typo)\nprint("5" + 5)       # TypeError: can only concatenate str to str' },
      { t: 'tip', text: 'Look at the line number, then also look at the line **above** it. A forgotten bracket on one line is often reported on the next.' },
    ],
    quiz: [
      {
        q: "Python says: NameError: name 'totl' is not defined. What is the most likely cause?",
        options: ['Python is broken', 'A typo: the variable is probably called total', 'The function needs more arguments', 'The number is too large'],
        answer: 1,
        explain: [
          'Python is almost never the problem. The message points at your code.',
          'Correct. The name does not exist, so look for a typo or a missing assignment.',
          'That would be a TypeError about arguments.',
          'Large numbers are fine in Python.',
        ],
      },
      {
        q: 'Which error do you get from `"5" + 5`?',
        options: ['SyntaxError', 'NameError', 'TypeError', 'No error; it gives 10'],
        answer: 2,
        explain: [
          'The code is readable; the problem shows up when it runs.',
          'Both names exist, so this is not a NameError.',
          'Correct. Text and a number cannot be added; convert one with int() or str().',
          'Python does not guess. Excel might, Python will not.',
        ],
      },
    ],
    exercise: {
      kind: 'python',
      prompt: 'This function has a small bug and will not even run. Read the error message you get, then fix it. The function should return the input times two.',
      fn: 'double',
      starter: 'def double(x)\n    return x * 2\n',
      tests: [
        { expr: 'double(4)', expected: '8' },
        { expr: 'double(-3)', expected: '-6' },
      ],
      hints: [
        'Run it once and read the message. Which line does it point to?',
        'Lines that start with `def`, `if`, `for` or `while` must end with a colon.',
        'Change the first line to: `def double(x):`',
      ],
      solution: 'def double(x):\n    return x * 2\n',
    },
  },
  {
    id: 'o-conditions',
    title: 'Practice the way the real thing runs',
    minutes: 20,
    blurb: 'Timed assessments are often proctored. Build the habits now.',
    blocks: [
      { t: 'p', text: 'Many online assessments run in a proctored mode: webcam on, full-screen, one monitor, and no copy-paste. Confirm the exact rules in your own invitation email, and practice under similar conditions so exam day feels familiar.' },
      { t: 'list', items: [
        'Do timed practice in a quiet room, full-screen, with no notes and no AI assistant open.',
        'Type every line yourself, including common patterns. Pasting is usually disabled in the real test.',
        'Practice submitting early: write the simplest working version, submit, then improve.',
        'Use AI as a tutor while learning ("why is my loop off by one?"), never as a solver.',
      ] },
    ],
    quiz: [
      {
        q: 'Which practice session best prepares you for a proctored timed assessment?',
        options: [
          '90 minutes, full-screen, no notes, typing everything yourself',
          '90 minutes with a chat assistant open for hints',
          'Watching solution videos at 2x speed',
          'Copy-pasting from your earlier answers',
        ],
        answer: 0,
        explain: [
          'Correct. Practice under the same constraints you will face.',
          'Fine for learning, but it hides what you cannot yet do alone.',
          'Watching is not practicing. You must produce the answer yourself.',
          'Copy-paste is usually disabled in the real test, and it skips the recall you need.',
        ],
      },
    ],
  },
  {
    id: 'o-sample',
    title: 'Take the HackerRank sample test, cold',
    minutes: 45,
    blurb: 'The score does not matter. Seeing the interface once removes the fear.',
    blocks: [
      { t: 'p', text: 'Create a free HackerRank account and take the public sample test. Expect to get things wrong. The goal is only to see the editor, the Run and Submit buttons, and a timer, so that none of it is new later.' },
    ],
    links: [
      { label: 'HackerRank sample test', url: 'https://www.hackerrank.com/test/sample', use: 'About 30 minutes, 3 questions. Format preview only.' },
      { label: 'How to answer coding questions (HackerRank help)', url: 'https://candidatesupport.hackerrank.com/articles/9623161883-answer-coding-questions', use: 'Read it after the sample test and see which rules you tripped over.' },
    ],
  },
  {
    id: 'o-tutor',
    title: 'Watch code run, step by step',
    minutes: 20,
    blurb: 'Python Tutor shows variables changing line by line. Use it whenever code feels like magic.',
    blocks: [{ t: 'p', text: "Paste any small program into Python Tutor and click Next. You will see each variable change as the lines run. Use it again whenever a loop does something you did not expect." }],
    links: [{ label: 'Python Tutor', url: 'https://pythontutor.com/', use: 'Choose Python 3, paste a short program, then step through it.' }],
  },
];
