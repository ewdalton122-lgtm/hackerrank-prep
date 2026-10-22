// Stage 4: Prompt engineering for exact-match grading.
// Original drills written for this site (no real assessment content).
const SKELETON = [
  'You are a precise data-processing engine.',
  'Task: <one sentence: extract / classify / validate / convert>.',
  'Rules:',
  '1. <inclusion rule>',
  '2. <edge-case rule: if X is missing, output Y>',
  'Output format (follow exactly):',
  '<the literal template>',
  'Output ONLY the result. No preamble, no explanation, no markdown, no code fences.',
  '',
  'Input:',
  '{input}',
].join('\n');

export const prompts = [
  {
    id: 'pe-mindset',
    title: 'The exact-match mindset',
    minutes: 40,
    blurb: 'Why a perfectly good answer can still fail, and how to write prompts that cannot.',
    blocks: [
      { t: 'p', text: 'In an automated prompt-engineering question you write a prompt, the platform swaps in each test input, sends it to an AI model, and compares the reply to the expected answer. HackerRank documents this comparison as an **exact match** on characters, casing, spacing and order.' },
      { t: 'p', text: 'So the model can be completely right and still fail. If the expected output is `Merci` and the model replies `Sure! The translation is: Merci`, that test case fails.' },
      { t: 'h', text: 'Four rules that follow' },
      { t: 'list', items: [
        '**Ask for only the output.** No greetings, no explanations, no "Here is..." lines.',
        '**Spell out the format.** Field order, separators, casing, one record per line, no markdown or code fences.',
        '**Say what happens in edge cases.** Missing field? Empty input? Tell the model the exact word to output.',
        '**Do not ask it to think out loud.** "Explain your reasoning" or "think step by step" adds text that breaks the match.',
      ] },
      { t: 'p', text: "Responses are also cached for an identical prompt. Re-running the exact same prompt returns the same answer, so change something if you want a different result." },
      { t: 'analogy', text: 'Write the prompt like an engagement letter so precise that only one deliverable could satisfy it.' },
      { t: 'h', text: 'A reusable skeleton' },
      { t: 'code', text: SKELETON },
      { t: 'tip', text: 'Keep the placeholder (`{input}` in these drills) exactly where the data goes. In the real question it is a fixed placeholder you must not delete.' },
    ],
    quiz: [
      {
        q: 'The expected output is `NEGATIVE`. The model replies `The sentiment is NEGATIVE.` Result?',
        options: ['Pass: the right word is in there', 'Fail: extra words break an exact match', 'Partial credit', 'Pass if the model was confident'],
        answer: 1,
        explain: [
          'Contains is not the same as equals. The check compares the whole reply.',
          'Correct. Add "Output only the label, nothing else" to the prompt.',
          'Each test case is pass or fail.',
          'Confidence is irrelevant to the comparison.',
        ],
      },
      {
        q: 'Which addition to a prompt is most likely to HURT your score?',
        options: [
          'Output ONLY the result, no explanation',
          'A short worked example copying the exact format',
          'Please think step by step and explain your reasoning',
          'If the input is empty, output NONE',
        ],
        answer: 2,
        explain: [
          'This one helps. It removes extra text.',
          'This one helps. Showing the exact format is very effective.',
          'Correct. Reasoning text becomes part of the output and breaks the exact match.',
          'This one helps. It defines the edge case.',
        ],
      },
      {
        q: 'Your prompt fails a case. You re-run the identical prompt hoping for a different answer. What happens?',
        options: ['The model tries harder', 'You usually get the same cached answer', 'You get a random new answer', 'The test case is skipped'],
        answer: 1,
        explain: [
          'There is no retry logic like that.',
          'Correct. Change the prompt (even a small edit) to get a new response.',
          'Identical prompts are cached, so there is no new draw.',
          'Failed cases are not skipped.',
        ],
      },
    ],
  },
  {
    id: 'pe-classify',
    title: 'Drill 1: classify with a single word',
    minutes: 45,
    blurb: 'Get the model to output one label and nothing else.',
    blocks: [
      { t: 'p', text: 'How these drills work: write one prompt in the box, using `{input}` where the data goes. Use the buttons to copy the finished prompt for each case, run it in any AI assistant you like (Claude, ChatGPT, Agentforce), and paste the reply back. The site checks it **exactly**, the way an automated grader would, and tells you what is off.' },
      { t: 'tip', text: 'Test on at least two different assistants. A prompt that works on both is more robust against a grader model you cannot see.' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'Classify the sentiment of the text as exactly one of: POSITIVE, NEGATIVE or NEUTRAL. Output only the label.',
      cases: [
        { input: 'The onboarding took forever and nobody replied to my emails.', expected: 'NEGATIVE' },
        { input: 'Great demo today, the team loved the Agentforce prototype!', expected: 'POSITIVE' },
        { input: 'The meeting is scheduled for Tuesday at 3pm.', expected: 'NEUTRAL' },
      ],
      hints: [
        'State the allowed labels and say "Output only the label".',
        'Add: "No punctuation, no explanation, no quotes."',
        'Add one example line for each label so the format is unmistakable.',
      ],
    },
  },
  {
    id: 'pe-convert',
    title: 'Drill 2: convert formats exactly',
    minutes: 45,
    blurb: 'Dates, separators and one record per line.',
    blocks: [
      { t: 'p', text: 'Format conversion tests whether you can describe a pattern precisely. Show the input pattern and the output pattern, and say how many lines to produce.' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'Convert each date from MM/DD/YYYY to YYYY-MM-DD. Output one date per line, in the same order, with nothing else.',
      cases: [
        { input: '03/07/2026\n11/30/2025\n01/01/2027', expected: '2026-03-07\n2025-11-30\n2027-01-01' },
        { input: '12/25/2026', expected: '2026-12-25' },
      ],
      hints: [
        'Give one worked example in the prompt: `03/07/2026` becomes `2026-03-07`.',
        'Say "one date per line, no blank lines, no bullets, no numbering".',
        'Note that the first number is the month (03 is March), so the model does not swap day and month.',
      ],
    },
  },
  {
    id: 'pe-extract',
    title: 'Drill 3: extract matching records',
    minutes: 60,
    blurb: 'Pull only the lines that meet a rule, in a fixed template, with an empty-result rule.',
    blocks: [
      { t: 'p', text: 'Extraction is the most common task type: filter the input by a rule, then print what is left in a fixed template. Always define what to print when nothing matches.' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'From the log, output only the ERROR lines, one per line, in order, in this format: `Timestamp: <date time>, Error: <message>`. If there are no ERROR lines, output NONE.',
      cases: [
        {
          input: '2026-03-01 10:00:01 INFO Service started\n2026-03-01 10:02:17 ERROR Database timeout\n2026-03-01 10:03:45 WARN Slow response\n2026-03-01 10:07:09 ERROR Disk full',
          expected: 'Timestamp: 2026-03-01 10:02:17, Error: Database timeout\nTimestamp: 2026-03-01 10:07:09, Error: Disk full',
        },
        {
          input: '2026-03-02 08:00:00 INFO Job started\n2026-03-02 08:01:00 INFO Job finished',
          expected: 'NONE',
        },
      ],
      hints: [
        'Quote the template exactly and say "replace the angle-bracket parts with the values".',
        'Say explicitly: "Ignore INFO and WARN lines" and "If there are zero ERROR lines output NONE".',
        'Add an example input and its exact output, including a case with no errors.',
      ],
    },
  },
  {
    id: 'pe-json',
    title: 'Drill 4: structured output (JSON)',
    minutes: 60,
    blurb: 'Fixed keys, fixed order, no spaces, no code fences.',
    blocks: [
      { t: 'p', text: '**JSON** is a way to write structured data as text. Keys and text values use **double quotes**, numbers do not, items are separated by commas, and there is no trailing comma.' },
      { t: 'code', text: '{"vendor":"Northwind Supply","amount":1250,"due_date":"2026-04-15"}' },
      { t: 'warn', text: 'Models love to wrap JSON in a markdown code fence (three backticks) or add a sentence before it. Both break an exact match. Say "no code fences, no explanation".' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'Extract the vendor, the amount (whole dollars, a number with no symbol) and the due date (YYYY-MM-DD) from the sentence. Output a single line of JSON with keys in this order: vendor, amount, due_date. No spaces after colons or commas, no code fences.',
      cases: [
        { input: 'Invoice from Northwind Supply for $1,250, payable by April 15, 2026.', expected: '{"vendor":"Northwind Supply","amount":1250,"due_date":"2026-04-15"}' },
        { input: 'Contoso Ltd billed $980, due 2026-05-02.', expected: '{"vendor":"Contoso Ltd","amount":980,"due_date":"2026-05-02"}' },
      ],
      hints: [
        'Paste the exact target shape into the prompt, with `<vendor>` style placeholders.',
        'Say "amount is a number: no quotes, no $ sign, no commas".',
        'Add "Output the JSON on one line with no spaces after : or ,".',
      ],
    },
  },
  {
    id: 'pe-validate',
    title: 'Drill 5: completeness validation',
    minutes: 60,
    blurb: 'Report which required fields are missing, in a fixed order.',
    blocks: [
      { t: 'p', text: 'Validation prompts check a record against a list of required fields. The answer is usually a sentinel word when everything is fine and a precise list when it is not. Sorting rules matter: say alphabetical, and say what separator to use.' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'Each input is a record with fields name, email and phone. A field is missing if its value is blank. If nothing is missing output COMPLETE. Otherwise output MISSING: followed by the missing field names in alphabetical order, separated by commas with no spaces (for example MISSING: email,name).',
      cases: [
        { input: 'name: Ana Ruiz\nemail: \nphone: 555-0101', expected: 'MISSING: email' },
        { input: 'name: \nemail: \nphone: 555-0101', expected: 'MISSING: email,name' },
        { input: 'name: Li Wei\nemail: li@example.com\nphone: 555-0199', expected: 'COMPLETE' },
      ],
      hints: [
        'Define "blank" explicitly: nothing after the colon.',
        'Give the three possible output shapes: `COMPLETE`, `MISSING: x`, `MISSING: x,y`.',
        'Say the field names must be lowercase and sorted alphabetically.',
      ],
    },
  },
  {
    id: 'pe-normalize',
    title: 'Drill 6: normalize messy input',
    minutes: 50,
    blurb: 'Fix casing and reorder names, one per line.',
    blocks: [
      { t: 'p', text: 'Normalization combines rules: reorder, change case, keep line order. Spell out each rule as a numbered list so none is dropped.' },
    ],
    exercise: {
      kind: 'prompt',
      task: 'Each input line is a person as "first last" in inconsistent casing. Output each as "Last, First" in Title Case, one per line, same order as the input, nothing else.',
      cases: [
        { input: 'ana RUIZ\nLI wei', expected: 'Ruiz, Ana\nWei, Li' },
        { input: 'sAM oRTIZ', expected: 'Ortiz, Sam' },
      ],
      hints: [
        'Number the rules: 1) swap the order, 2) Title Case each word, 3) keep the input line order.',
        'Show the output pattern: `Last, First` with a comma and one space.',
        'Add one example from different input than the test cases.',
      ],
    },
  },
  {
    id: 'pe-r-learn',
    title: 'Study: prompting references',
    minutes: 330,
    blurb: 'Read the official guidance and run a structured tutorial.',
    links: [
      { label: 'HackerRank: Answering prompt engineering questions', url: 'https://candidatesupport.hackerrank.com/articles/9597805344-answering-prompt-engineering-questions', use: 'Read first (about 20 minutes). The official walkthrough of the question format.' },
      { label: 'HackerRank: Scoring for prompt engineering questions', url: 'https://support.hackerrank.com/articles/6081633644-scoring-for-prompt-engineering-questions', use: 'The exact-match and caching rules.' },
      { label: 'Anthropic: Interactive prompting tutorial', url: 'https://github.com/anthropics/prompt-eng-interactive-tutorial', use: 'Chapters 1, 2, 4, 5, 7 and 8. Skip "thinking step by step" for this exam style.' },
      { label: 'Claude prompting best practices', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices', use: 'Output format control and avoiding preambles.' },
      { label: 'DeepLearning.AI: ChatGPT Prompt Engineering for Developers', url: 'https://www.deeplearning.ai/courses/chatgpt-prompt-eng', use: 'Guidelines, Iterative, Summarizing, Inferring, Transforming lessons.' },
    ],
  },
];
