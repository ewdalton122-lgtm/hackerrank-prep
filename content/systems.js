import { RB } from './rubric.js';
// Stage 5: system design vocabulary (multiple-choice level) and stakeholder communication.
export const systems = [
  {
    id: 'sd-scale',
    title: 'Scaling and availability vocabulary',
    minutes: 50,
    blurb: 'Load, redundancy and failure: the words behind most architecture multiple-choice questions.',
    blocks: [
      { t: 'p', text: 'Multiple-choice design questions rarely ask you to draw anything. They test vocabulary plus trade-offs: given a problem, which tool fits?' },
      { t: 'list', items: [
        '**Vertical scaling**: a bigger machine. Simple, but has a ceiling and is a single point of failure.',
        '**Horizontal scaling**: more machines behind a **load balancer** that spreads requests across them.',
        '**Stateless services** keep no per-user data in memory, so any machine can handle any request. That is what makes horizontal scaling easy.',
        '**Replication**: keeping copies of data on several machines so a failure does not lose it.',
        '**Failover**: automatically switching to a healthy copy when one fails. **Health checks** detect the failure.',
        '**Latency** is how long one request takes. **Throughput** is how many requests per second the system handles.',
      ] },
      { t: 'analogy', text: 'Horizontal scaling is opening more checkout lanes, with a greeter (the load balancer) sending each shopper to a free lane. Replication is keeping a copy of the ledger in a second office.' },
      { t: 'h', text: 'How to attack a question' },
      { t: 'p', text: 'Underline the **constraint word**: "must not lose data" (replication), "traffic spikes at month-end" (horizontal scaling plus load balancer), "near-instant reads" (cache). Then eliminate options that just throw more hardware or licences at the problem.' },
    ],
    quiz: [
      {
        q: 'Traffic doubles every holiday season and a single server is maxed out. The best long-term fix is:',
        options: ['Move to one much larger server with more memory', 'Add more servers behind a load balancer', 'Rate-limit users so the server is never overloaded', 'Turn off logging to free up the server\'s resources'],
        answer: 1,
        explain: [
          'Vertical scaling has a ceiling and keeps a single point of failure.',
          'Correct. Horizontal scaling plus a load balancer grows with demand.',
          'That protects the server by turning users away. It does not add capacity.',
          'Logging is rarely the bottleneck, and turning it off hurts operations.',
        ],
      },
      {
        q: 'One database server fails and the application goes down for hours. Which design addition most directly prevents that?',
        options: ['A faster server with more CPU and memory', 'A standby replica with automatic failover', 'Nightly backups of the database to cloud storage', 'A longer timeout so the app waits for the server'],
        answer: 1,
        explain: [
          'Speed does not help when the machine is gone.',
          'Correct. A standby copy takes over when the primary fails.',
          'Backups protect the data, but restoring one takes hours, so the app is still down.',
          'Waiting longer does not bring a failed server back. Users just wait longer for an error.',
        ],
      },
      {
        q: 'Why are stateless services easier to scale horizontally?',
        options: [
          'They use less memory, so more of them fit on a server',
          'Any server can handle any request, since none holds user data',
          'They do not need a database, so there is nothing to sync',
          'They keep each user on the same server, so nothing is lost',
        ],
        answer: 1,
        explain: [
          'Memory use is not the key point. What matters is that no user is tied to one server.',
          'Correct. No user data is stuck on one machine, so nothing ties a user to a specific server.',
          'They still use databases; they just do not keep session state locally.',
          'Pinning each user to one server is the opposite of stateless, and it makes scaling harder.',
        ],
      },
      {
        q: 'Latency measures:',
        options: ['How many requests per second the system handles', 'How long a single request takes', 'How much of the time the system is up', 'How much data the system can store'],
        answer: 1,
        explain: [
          'That is throughput.',
          'Correct. Latency is time per request.',
          'That is availability, often called uptime.',
          'That is storage capacity, not speed.',
        ],
      },
    ],
  },
  {
    id: 'sd-async',
    title: 'Caching, queues and multi-tenancy',
    minutes: 50,
    blurb: 'Three patterns that show up again and again, especially in SaaS.',
    blocks: [
      { t: 'h', text: 'Caching' },
      { t: 'p', text: 'A **cache** keeps recent answers close so you skip slow work. Trade-off: cached data can go stale, so it needs a time-to-live (**TTL**) or an invalidation rule. A **CDN** caches static files near users.' },
      { t: 'analogy', text: 'A cache is keeping last night\'s report on hand instead of re-running the query.' },
      { t: 'h', text: 'Queues and asynchronous work' },
      { t: 'p', text: 'Slow or bursty work (sending thousands of emails, large imports) goes into a **message queue**. The user gets an instant "accepted" and workers process the jobs in the background, retrying on failure. Queues absorb spikes and prevent lost requests. Most queues deliver a job **at least once**, so a worker may see the same job twice: design workers so repeating a job is harmless (idempotent), and move jobs that keep failing to a dead-letter queue. On Salesforce, long work runs as asynchronous Apex (future methods, Queueable, Batch and Scheduled jobs).' },
      { t: 'analogy', text: 'A queue is an inbox for batch jobs: accept now, process later, and keep anything that failed for a second look.' },
      { t: 'h', text: 'Multi-tenancy' },
      { t: 'p', text: '**Multi-tenant** software serves many customers on shared infrastructure while keeping each customer\'s data isolated. Benefits: lower cost, easy upgrades for everyone. Challenges: **noisy neighbors** (one tenant hogging resources) and strict data isolation, which is why platforms impose **per-tenant limits**.' },
      { t: 'analogy', text: 'One building, many tenants: shared plumbing, locked apartments, and a rule that nobody may run the water all day.' },
    ],
    quiz: [
      {
        q: 'A report page is slow because it re-runs an expensive query on every visit, but the data only changes hourly. Best fix?',
        options: ['Cache the result with a one-hour TTL', 'Add more memory to each user\'s computer', 'Add an index to every column in the table', 'Cache the result and never let it expire'],
        answer: 0,
        explain: [
          'Correct. A cache with a TTL matching how often data changes removes repeated work.',
          'The slow part is the query on the server, not the user\'s computer.',
          'Indexing every column slows down writes, and the query still runs on every visit.',
          'The data changes hourly, so a cache that never expires would show old numbers.',
        ],
      },
      {
        q: 'A customer uploads 50,000 records and the web request times out. A good redesign is to:',
        options: ['Raise the request timeout to one hour so it can finish', 'Queue it, process it in the background, then notify the user', 'Process all 50,000 records at once on a bigger server', 'Ask users to split the file into smaller uploads'],
        answer: 1,
        explain: [
          'Long synchronous requests are fragile and hold resources.',
          'Correct. Accepting the upload and processing it asynchronously from a queue is the standard answer.',
          'The request is still synchronous. Bigger hardware only delays the timeout.',
          'That pushes the work onto the user.',
        ],
      },
      {
        q: 'In a multi-tenant system, one customer runs a huge job that slows everyone else. This is called:',
        options: ['A cache miss', 'A noisy neighbor', 'A failover event', 'A race condition'],
        answer: 1,
        explain: [
          'A cache miss is when requested data is not in the cache.',
          'Correct. Per-tenant limits and throttling are the usual protection.',
          'Failover is switching to a standby when something fails.',
          'A race condition is a bug where the timing of two operations changes the result.',
        ],
      },
      {
        q: 'What is the main risk of caching?',
        options: ['Cached data can go stale and be out of date', 'It adds an extra step, so most requests get slower', 'It makes the database harder to scale', 'It needs a message queue to work correctly'],
        answer: 0,
        explain: [
          'Correct. That is why TTLs and invalidation exist.',
          'A cache hit skips slow work, so most requests get faster.',
          'Caches take load off the database and usually help it scale.',
          'Caches and queues are independent patterns.',
        ],
      },
    ],
  },
  {
    id: 'sd-store',
    title: 'Choosing a data store',
    minutes: 40,
    blurb: 'Relational, key-value, document and when each one fits.',
    blocks: [
      { t: 'list', items: [
        '**Relational (SQL)**: structured tables, joins, strong consistency, transactions (**ACID**). Best for money, orders and anything where correctness matters.',
        '**Key-value**: look up a value by key, extremely fast and simple. Best for sessions, caches and counters.',
        '**Document**: flexible JSON-like records. Best when each record has a different shape.',
        '**Wide-column / large-scale NoSQL**: huge write volumes spread across many machines, trading some consistency for scale.',
      ] },
      { t: 'p', text: '**Indexes** make reads faster at the cost of slower writes and extra storage, like an index at the back of a book. **Sharding** splits one huge dataset across several databases. **Eventual consistency** means copies agree "soon", not instantly.' },
      { t: 'tip', text: 'Default thinking: if the question mentions transactions, money or complex joins, choose relational. If it mentions huge scale and simple lookups, think key-value or NoSQL.' },
    ],
    quiz: [
      {
        q: 'A banking ledger must never show a half-completed transfer. Which fits best?',
        options: ['A relational database with transactions', 'A fast in-memory cache as the main store', 'A key-value store with eventual consistency', 'A content delivery network near users'],
        answer: 0,
        explain: [
          'Correct. Transactions make a transfer all-or-nothing.',
          'A cache is temporary and not a source of truth.',
          'Eventual consistency allows temporarily wrong balances.',
          'A CDN serves static files. It does not record transfers.',
        ],
      },
      {
        q: 'You need very fast lookups of user session data by a session id. Best fit?',
        options: ['A key-value store keyed by session id', 'A data warehouse built for reporting', 'A relational database with several joins', 'A message queue that holds the sessions'],
        answer: 0,
        explain: [
          'Correct. Key in, value out, extremely fast.',
          'Warehouses are for analysis, not quick session lookups.',
          'Joins add work you do not need for a simple lookup.',
          'Queues pass messages along; they are not built for lookups by id.',
        ],
      },
      {
        q: 'What is the trade-off of adding many indexes to a table?',
        options: ['Reads get faster but writes get slower', 'Writes get faster but reads get slower', 'No real trade-off; every query just gets faster', 'Data can become inconsistent between copies'],
        answer: 0,
        explain: [
          'Correct. Each write must also update every index.',
          'It is the other way around.',
          'There is always a cost: write speed and storage.',
          'Indexes do not change correctness. That describes copies that lag behind, as in eventual consistency.',
        ],
      },
    ],
  },
  {
    id: 'sd-mcq',
    title: 'Multiple-choice technique',
    minutes: 20,
    blurb: 'How to read questions that allow more than one right answer.',
    blocks: [
      { t: 'list', items: [
        'Some questions have **one** correct option and some have **several**. Read the instruction line carefully.',
        'How multiple-correct questions are scored depends on how the test was set up, and it is not confirmed for this exam. A common rule is that **a wrong pick can zero the whole question**, so never select more options than you believe are correct.',
        'Some tests use negative marking for wrong answers. Check your test instructions before guessing.',
        'Answers are auto-saved when time runs out, but only if you selected them.',
        'Eliminate first. Two options are usually clearly wrong; decide between the remaining two using the constraint word.',
      ] },
    ],
    quiz: [
      {
        q: 'A question says "Select all that apply" and has two correct answers. You are sure of one and think a second is "maybe". What is the safest approach?',
        options: [
          'Select every option so you are sure to catch the two',
          'Pick the sure one and your best second choice, and stop at two',
          'Skip it for now and come back at the end if there is time',
          'Select three options to raise the chance of a match',
        ],
        answer: 1,
        explain: [
          'Selecting more options than there are correct answers can score zero.',
          'Correct. Keep your total at the number of correct answers the question implies.',
          'Skipping scores nothing, and you may not be able to move back to earlier questions.',
          'Three is more than the two correct answers, which can score zero.',
        ],
      },
    ],
  },
  {
    id: 'sk-vp',
    title: 'Written response: reset an ambitious ask',
    minutes: 45,
    blurb: 'Practice a structured, blame-free reply under a word limit.',
    blocks: [
      { t: 'p', text: 'Stakeholder questions test judgment and structure, not coding. Use this five-part shape for almost any difficult reply:' },
      { t: 'list', items: [
        '**1. Acknowledge the goal.** Show you understand why they want it.',
        '**2. State the key fact or constraint**, neutrally and without blame.',
        '**3. Offer two options** with a clear difference between them.',
        '**4. Recommend one** and say why.',
        '**5. Close with a next step**, an owner and a date.',
      ] },
    ],
    exercise: {
      kind: 'written',
      prompt: 'A VP says in the hallway: "We need the AI agent to handle all of our customer service by the end of the quarter." You know the customer data is scattered across three systems and not yet cleaned. Write the reply you would send (about 100 to 150 words).',
      minWords: 60,
      rubric: [
        { id: 'goal', label: 'Acknowledges the VP\'s goal before raising problems', test: /goal|understand|appreciate|great|agree|ambition|makes sense|shared|outcome|aiming|thanks|thank you|aim/i },
        { id: 'fact', label: 'States the data constraint neutrally, without blaming anyone', test: /data|systems|clean|scattered|consolidat|ready/i },
        { ...RB.options, label: 'Offers at least two options (for example phased scope vs full scope)' },
        { ...RB.rec, label: 'Makes a clear recommendation with a reason' },
        RB.next, RB.noBlame,
      ],
      model: 'Thanks for raising this. Automating customer service by quarter-end is exactly the outcome worth aiming for, and I want to get us there reliably.\n\nThe constraint is data: customer information currently sits in three systems that are not yet consolidated, and an agent is only as good as what it can see.\n\nTwo ways forward. Option A: launch the agent for the two or three highest-volume request types (order status, password resets) by quarter-end, then expand each month. Option B: wait to cover everything at once, which likely lands next quarter.\n\nI recommend Option A. It shows real results this quarter, builds trust, and lets us fix data issues in priority order.\n\nNext step: can we hold a 45-minute scoping session this week with service operations to pick the first request types? I will send options by Friday.',
    },
  },
  {
    id: 'sk-date',
    title: 'Written response: a date you cannot hit',
    minutes: 45,
    blurb: 'Reset an expectation without blaming a partner.',
    blocks: [
      { t: 'p', text: 'Same five-part shape, higher stakes. The skill is to stay factual and keep the relationship intact.' },
    ],
    exercise: {
      kind: 'written',
      prompt: 'A partner told the customer your team would deliver the first agent demo by next Friday. You know it cannot be ready until the week after, because required access has not been granted. Write your message to the customer (about 100 to 150 words).',
      minWords: 60,
      rubric: [
        { id: 'goal', label: 'Acknowledges the customer\'s goal or timeline', test: /goal|understand|appreciate|thank|commit|timeline|excited/i },
        { id: 'fact', label: 'States the real constraint (access) clearly and neutrally', test: /access|permission|credential|environment|dependency|waiting/i },
        { ...RB.options, label: 'Gives two options (for example reduced demo now vs full demo later)' },
        { ...RB.rec, label: 'Recommends one option' },
        { ...RB.next, label: 'Names a next step with an owner or date' }, RB.noBlame,
      ],
      model: 'Thank you for your patience, and I know next Friday was the date you were planning around. I want to be upfront so you can plan.\n\nThe full demo depends on environment access that has not been granted yet, and without it we cannot connect the agent to your real data.\n\nTwo options. Option A: on Friday we show a scaled-down demo using sample data, so your team can react to the experience. Option B: we hold the demo the following Friday with your real data connected.\n\nI recommend Option A on Friday, followed by the full demo the week after. You get early feedback and no loss of momentum.\n\nNext step: if your IT contact can confirm access by Wednesday, I will lock in the full demo date the same day. Can we agree on that?',
    },
  },
  {
    id: 'sd-r-primer',
    optional: true,
    title: 'Study: System Design Primer (selected sections)',
    minutes: 360,
    blurb: 'Read only what the multiple-choice questions need.',
    links: [
      { label: 'The System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', use: 'Read: CAP theorem, consistency and availability patterns, load balancer, horizontal scaling, database (replication, sharding), SQL vs NoSQL, cache, asynchronism (message queues, back pressure), CDN. Skip the interview walk-throughs.' },
    ],
  },
];
