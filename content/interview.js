// Stage 10: interview preparation. Optional and not part of the daily study target:
// the assessment is the gate, the interview comes after.
const w = (id, title, minutes, blurb, blocks, ex, quiz) => ({ id, title, minutes, blurb, blocks, ...(quiz ? { quiz } : {}), ...(ex ? { exercise: { kind: 'written', ...ex } } : {}) });

export const interview = [
  w('iv-star', 'Tell a story: situation, action, result', 50, 'Interviews run on short, specific stories with a number at the end.', [
    { t: 'p', text: 'Most interview questions begin "Tell me about a time when...". The strongest answers follow one shape, and fit in about two minutes:' },
    { t: 'list', items: [
      '**Situation:** one sentence of context. Who, what, why it mattered.',
      '**Task:** what **you** were responsible for (not the team).',
      '**Action:** the two or three things **you** did, in order. Use "I", not "we".',
      '**Result:** a number if you can: dollars, hours, percent, customers. Then one lesson.',
    ] },
    { t: 'analogy', text: 'A good story is a small business case: the problem, your decision, the outcome in numbers, and what you would do differently.' },
    { t: 'warn', text: 'Stories fail when they are vague ("we improved things"), when the speaker hides behind "we", or when there is no result.' },
  ], {
    prompt: 'Write a story (about 150 words) about a time you helped a customer or colleague make a difficult decision, or delivered something under pressure. Use the situation, task, action, result shape.',
    minWords: 80,
    rubric: [
      { id: 's', label: 'Sets the scene in a sentence or two (who and what was at stake)', test: /when|at the time|situation|customer|client|team|deal|quarter|project|needed|faced/i },
      { id: 't', label: 'Makes clear what **you** were responsible for', test: /my role|i was (responsible|asked|accountable)|i owned|i led|my job|task|i needed to/i },
      { id: 'a', label: 'Describes specific actions you took, using "I"', test: /\bi (built|ran|led|created|proposed|met|analy[sz]ed|mapped|scoped|presented|negotiated|reviewed|set up|drafted|walked)/i },
      { id: 'r', label: 'Ends with a result, ideally with a number', test: /\d+\s?(%|percent|k\b|m\b|hours|days|weeks|customers|deals|\$)|\$\s?\d|resulted|outcome|saved|increased|reduced|closed|won|grew/i },
      { id: 'l', label: 'Names what you learned or would do differently', test: /learn|next time|differently|in hindsight|lesson|would now|since then/i },
    ],
    model: 'Last year a retail customer was about to cancel a large renewal because their reporting was always late. I was the account lead, so rescuing the relationship was my job.\n\nI started by sitting with their analysts for two days to map where the delay came from. It turned out nightly data loads were failing silently. I proposed a two-step fix: add monitoring first, then rebuild the slowest report. I walked their VP of Operations through the plan with a one-page timeline, and I set up a weekly check-in so nothing slipped.\n\nWithin six weeks reports were arriving on time, support tickets dropped by about 40 percent, and they renewed for three years, a deal worth about $1.2M.\n\nWhat I learned: bring data to the first meeting. Showing the failed-load log changed the conversation from opinion to evidence.',
  }),

  w('iv-build', 'Plan your 10-minute build presentation', 60, 'If you are asked to present something you built, structure beats polish.', [
    { t: 'p', text: 'Some panels ask you to present a solution you built, then take questions. You do not need a perfect build. You need a clear **story about a real problem**.' },
    { t: 'list', items: [
      '**The problem and the user:** who hurt, how much, how you know.',
      '**Why this approach:** what you considered and why you chose it.',
      '**How it works:** the data it uses, the steps, the guardrails. One simple diagram.',
      '**Demo or walkthrough:** show it working on one realistic example.',
      '**The result:** a measure that moved, or a measure you would track.',
      '**What you would do next, and what you would change:** honesty about limits builds trust.',
    ] },
    { t: 'tip', text: 'Prepare for the questions: "What happens when it is wrong?", "How do you control what it can say or do?", "How would you roll this out to 500 people?"' },
  ], {
    prompt: 'Write the outline of a 10-minute presentation about an AI or automation solution you built (or would build) for a real problem. Cover each of the six parts in the lesson, in a few sentences each.',
    minWords: 90,
    rubric: [
      { id: 'p', label: 'Starts with a real problem and who it affects', test: /problem|pain|customers?|users?|team|struggl|slow|manual|backlog|cost/i },
      { id: 'w', label: 'Explains why this approach over alternatives', test: /instead of|rather than|considered|alternative|chose|because|trade-?off/i },
      { id: 'h', label: 'Explains how it works (data, steps, guardrails)', test: /data|knowledge|topic|instruction|action|guardrail|integrat|prompt|workflow|escalat/i },
      { id: 'd', label: 'Includes a demo or example walkthrough', test: /demo|example|walk.?through|show|scenario|live/i },
      { id: 'm', label: 'States a result or how success will be measured', test: /\d+\s?(%|percent|hours|minutes|tickets|cases)|measure|metric|kpi|resolution|deflect|adoption|csat/i },
      { id: 'n', label: 'Names limits and next steps', test: /next|limit|risk|would change|improve|roll.?out|phase|future/i },
    ],
    model: '1. Problem. Our support team handled about 800 order-status questions a week by hand. Customers waited hours, and agents had no time for complex cases.\n\n2. Why this approach. I considered a better FAQ page and a rules-based chatbot, but neither could look up a live order. A service agent that reads order data could answer directly, so I chose that.\n\n3. How it works. The agent has instructions in plain language, one action that looks up an order by number, and a guardrail: refunds and anything about billing disputes escalate to a person.\n\n4. Demo. I will ask it "Where is my order 1042?" and show it answer, then ask for a refund and show the handoff.\n\n5. Result. In a two-week pilot it fully resolved about 55 percent of order-status chats and cut average wait from hours to seconds. I would track resolution rate and customer satisfaction.\n\n6. Next. I would add returns, review wrong answers weekly, and change my first draft by narrowing the agent to fewer topics sooner.',
  }),

  w('iv-exec', 'Executive conversation: adoption is stalling', 55, 'Diagnose before you prescribe, then agree on one measurable next step.', [
    { t: 'p', text: 'Strategist-style questions test how you handle senior people when something is not working. The pattern: **listen, diagnose with questions or data, offer options, recommend one, agree on a next step.**' },
    { t: 'list', items: [
      'Do not defend the product or the plan. Start with their goal and what they are seeing.',
      'Ask for facts: who uses it, who does not, what do the people who stopped say?',
      'Look for the real blocker: training, trust, workflow fit, data quality, or no owner.',
      'Agree on one measure that shows improvement within 30 days.',
    ] },
    { t: 'analogy', text: 'It is a variance review. Before you cut the budget, you find out whether the miss is volume, price or mix.' },
  ], {
    prompt: 'A customer executive says: "Six weeks after launch, only 20 percent of my team uses the new AI assistant. I am starting to wonder if this was a waste." Write your reply (about 120 to 150 words).',
    minWords: 70,
    rubric: [
      { id: 'a', label: 'Acknowledges the concern and the goal without getting defensive', test: /understand|fair|appreciate|concern|goal|thank|makes sense|right to/i },
      { id: 'd', label: 'Proposes to find out why (data or questions) before prescribing', test: /why|usage data|look at|talk to|interview|survey|find out|diagnos|understand what/i },
      { id: 'o', label: 'Offers at least two possible causes or options', test: /option|either|could be|possible|training|workflow|trust|owner|alternatively/i },
      { id: 'r', label: 'Recommends a specific path', test: /recommend|suggest|propose|i['’]d start|my suggestion/i },
      { id: 'm', label: 'Agrees a measurable target or checkpoint', test: /\d+\s?(%|percent|days|weeks)|measure|target|goal of|by (the )?(end|next)|30 days|checkpoint/i },
      { id: 'n', label: 'Ends with a next step, owner or date', test: /next step|this week|by (mon|tue|wed|thu|fri)|schedule|follow up|call|session|workshop/i },
    ],
    model: 'That is a fair concern, and I would rather we face it now than at renewal. Twenty percent after six weeks tells us something is blocking use, and I want to find out what before we change anything.\n\nThis week I will pull usage data by team and talk to five people: two who use it daily and three who stopped. In my experience the cause is usually one of three things: the assistant does not fit how people already work, people were not shown it in context, or nobody owns adoption.\n\nOnce we know which, I recommend a focused fix rather than a relaunch. For example a 30-minute hands-on session for the two teams with the most to gain, plus a named champion in each.\n\nLet us agree a target of 50 percent weekly use in those teams within 30 days. Could we meet Thursday to review what I find?',
  }),

  w('iv-discovery', 'Discovery: ask better questions', 40, 'Good discovery finds the problem behind the request.', [
    { t: 'p', text: 'In a discovery workshop or interview, your questions show your judgment. Strong questions are **open**, ask for **specifics**, and uncover **impact**.' },
    { t: 'list', items: [
      '**Weak:** "Do you want a chatbot?" It is closed and jumps to a solution.',
      '**Better:** "Walk me through what happens today when a customer asks where their order is."',
      '**Impact:** "How often does that happen, and what does it cost you?"',
      '**Success:** "In six months, how will you know this worked?"',
    ] },
  ], null, [
    {
      q: 'A customer says: "We need an AI agent for service." Which is the best first question?',
      options: ['Which AI model do you want to use?', 'Walk me through what happens today when a customer contacts you, and where it breaks down.', 'What is your budget?', 'Can we start next week?'],
      answer: 1,
      explain: [
        'This jumps to a technical choice before anyone understands the problem.',
        'Correct. It is open, asks for specifics, and finds the real problem.',
        'Budget matters, but not before you know what the problem is worth.',
        'Moving fast before discovery risks building the wrong thing.',
      ],
    },
    {
      q: 'Which question best uncovers the business impact of a problem?',
      options: ['Is it a big problem?', 'How many cases does it affect each week, and what does each one cost you?', 'Who caused it?', 'Have you tried turning it off and on again?'],
      answer: 1,
      explain: [
        'It is closed, and "big" is subjective.',
        'Correct. It asks for numbers you can put in a business case.',
        'Blame closes people down and teaches you nothing about impact.',
        'It is a joke, not discovery.',
      ],
    },
    {
      q: 'How will you know the discovery meeting went well?',
      options: ['You talked for most of the hour', 'You have a clear problem statement, an impact estimate and a named owner', 'Everyone agreed with you', 'You showed all your slides'],
      answer: 1,
      explain: [
        'In good discovery, the customer should talk most of the time.',
        'Correct. A problem, a number and an owner are the outputs that matter.',
        'Agreement without evidence is not a result.',
        'Slides are for later. Discovery is listening.',
      ],
    },
  ]),

  w('iv-ask', 'Questions to ask the interviewers', 25, 'Your questions are part of the interview.', [
    { t: 'p', text: 'At the end you will be asked "What questions do you have for us?". Prepare three. Good questions show you are thinking like someone already doing the job.' },
    { t: 'list', items: [
      '"What would success look like in the first 90 days?"',
      '"What is the hardest part of this role that is not obvious from the job description?"',
      '"Can you describe a recent engagement that went really well, and one that did not?"',
      '"How does the team decide which customers or use cases to take on?"',
      '"What kind of person tends to struggle here, and what kind of person thrives?"',
    ] },
    { t: 'warn', text: 'Avoid questions about pay, time off or perks in a first conversation. Avoid anything you could have learned from a minute of research.' },
  ], null, [
    {
      q: 'Which is the strongest question to ask at the end of an interview?',
      options: ['How many vacation days do I get?', 'What would success look like in my first 90 days?', 'What does your company do?', 'Do you have any questions for me?'],
      answer: 1,
      explain: [
        'Fine later in the process, but it makes a poor closing question in a first conversation.',
        'Correct. It shows you are already planning to deliver.',
        'It shows you did no research.',
        'Turning the question back on them is awkward and unprepared.',
      ],
    },
  ]),
];
