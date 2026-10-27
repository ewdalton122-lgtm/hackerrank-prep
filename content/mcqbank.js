// Stage 5 extra: multiple-choice lessons. Each one teaches the vocabulary, then tests it.
// General, widely known concepts only. Nothing here comes from a real assessment.

const Q = (q, at, right, rightWhy, wrongs) => {
  const options = []; const explain = []; let w = 0;
  for (let i = 0; i < 4; i++) {
    if (i === at) { options.push(right); explain.push(`Correct. ${rightWhy}`); }
    else { options.push(wrongs[w][0]); explain.push(wrongs[w][1]); w++; }
  }
  return { q, options, answer: at, explain };
};
const lesson = (id, title, minutes, blurb, blocks, quiz) => ({ id, title, minutes, blurb, blocks, quiz });

export const mcqBank = [
  lesson('sd-api', 'APIs and integration basics', 40, 'How systems talk to each other, and what the status codes mean.', [
    { t: 'p', text: 'An **API** is a menu of requests one system lets another send. Most web APIs follow **REST**: each thing has a URL, and the HTTP **verb** says what to do with it.' },
    { t: 'list', items: [
      '**GET** reads data. **POST** creates. **PUT** or **PATCH** updates. **DELETE** removes.',
      '**Status codes**: `200` OK, `201` created, `400` bad request (your input is wrong), `401` not signed in, `403` signed in but not allowed, `404` not found, `429` too many requests, `500` the server failed.',
      '**Authentication** proves who you are. **Authorization** decides what you may do. **OAuth** lets an app act for you without sharing your password.',
      '**Rate limiting** caps requests per minute. Respond to `429` by waiting, then retrying with **backoff** (waiting longer each time).',
      '**Pagination** returns big lists in pages. **Idempotent** means repeating a request has the same effect as doing it once, which makes retries safe.',
      '**Webhook**: the other system calls **you** when something happens. **Polling**: you keep asking "anything new?". Webhooks are faster and cheaper.',
    ] },
    { t: 'analogy', text: 'An API is a restaurant menu and a waiter. You choose from the menu, the waiter carries the order to the kitchen, and the status code is the waiter\'s reply: "coming up", "we do not have that", or "you need a reservation".' },
  ], [
    Q('A request returns 403. What does that most likely mean?', 1,
      'You are signed in, but you are not allowed to do this.', '403 is an authorization failure.', [
        ['The server crashed.', 'A server crash is a 5xx code, such as 500.'],
        ['The URL does not exist.', 'That is 404.'],
        ['You were not signed in.', 'That is usually 401. 403 means signed in but not permitted.'],
      ]),
    Q('You get 429 from an API. The best response is to:', 2,
      'Wait, then retry, waiting longer after each failure.', 'Backoff respects the limit and avoids making it worse.', [
        ['Resend instantly in a tight loop.', 'That keeps you over the limit.'],
        ['Delete your account.', 'Not relevant.'],
        ['Switch to a faster laptop.', 'The limit is on requests, not your hardware.'],
      ]),
    Q('Why is an idempotent operation convenient when a network call might fail?', 0,
      'You can safely retry it, because repeating it has the same effect as doing it once.', 'Retries cannot double-charge or double-create.', [
        ['It runs faster.', 'Speed is unrelated.'],
        ['It needs no authentication.', 'Idempotency says nothing about authentication.'],
        ['It never returns an error.', 'It can still fail. It is just safe to repeat.'],
      ]),
    Q('Your system needs to know the moment a customer pays. Which approach is usually better than asking every minute?', 3,
      'A webhook: the payment system calls you when it happens.', 'You get the news instantly and make fewer pointless requests.', [
        ['Polling every second.', 'That wastes requests and still has a delay.'],
        ['Check once a month.', 'Far too slow.'],
        ['Ask the customer by phone.', 'Not an integration.'],
      ]),
    Q('Which HTTP verb is meant for creating a new record?', 0,
      'POST', 'POST sends data to create something new.', [
        ['GET', 'GET only reads.'],
        ['DELETE', 'DELETE removes.'],
        ['HEAD', 'HEAD reads headers only.'],
      ]),
    Q('What does OAuth let an app do?', 2,
      'Act on your behalf with limited permission, without ever seeing your password.', 'You grant access, and you can revoke it.', [
        ['Store your password in plain text.', 'The point is the opposite.'],
        ['Skip authorization.', 'OAuth is an authorization method.'],
        ['Encrypt your database.', 'Different concern.'],
      ]),
  ]),

  lesson('sd-security', 'Security and privacy basics', 35, 'Who can see what, and how data stays protected.', [
    { t: 'list', items: [
      '**Authentication** (who are you?) versus **authorization** (what may you do?). **SSO** lets you sign in once for many apps. **MFA** adds a second proof, like a phone code.',
      '**Least privilege**: give each person or system only the access its job needs.',
      '**Encryption in transit** protects data on the network (HTTPS). **Encryption at rest** protects it on disk.',
      '**PII** (personally identifiable information) such as names, emails and ids needs extra care. **Mask** or remove it when you do not need it.',
      '**Secrets** (passwords, API keys) never go in code or chat. Store them in a secrets manager and rotate them.',
      '**Audit logs** record who did what and when, so you can investigate.',
      '**Injection attacks** happen when untrusted input is run as code or commands. The defense is to treat input as data, never as instructions.',
    ] },
    { t: 'analogy', text: 'Least privilege is giving a contractor a key to the room they are working in, not the whole building.' },
  ], [
    Q('An intern needs to read one report. What is the best access to grant?', 2,
      'Read-only access to that report.', 'Least privilege: only what the job needs.', [
        ['Full admin access, to be safe.', 'Admin access is the opposite of least privilege.'],
        ['The manager\'s login.', 'Sharing logins removes accountability.'],
        ['No access, and email them screenshots.', 'This does not solve the need and adds risk.'],
      ]),
    Q('Which control stops someone who has stolen a password from signing in?', 1,
      'Multi-factor authentication (MFA).', 'A second proof is required, such as a phone code.', [
        ['A longer page title.', 'Not a security control.'],
        ['A faster database.', 'Unrelated.'],
        ['More logging only.', 'Logs help investigate after the fact. They do not block sign-in.'],
      ]),
    Q('What does encryption at rest protect?', 0,
      'Data stored on disk or in a database.', '"At rest" means stored, not moving.', [
        ['Data moving across the network.', 'That is encryption in transit.'],
        ['Data being typed.', 'Not what the term means.'],
        ['Data in a screenshot.', 'Not what the term means.'],
      ]),
    Q('You must share a customer dataset for analysis, but analysts do not need names. Best practice?', 3,
      'Remove or mask the personal fields before sharing.', 'Less personal data shared means less risk.', [
        ['Share everything, then ask them to be careful.', 'Avoidable exposure.'],
        ['Email it to a personal account.', 'This is exactly the kind of thing policy forbids.'],
        ['Delete the dataset.', 'The analysis still needs data.'],
      ]),
    Q('Where should an API key live?', 1,
      'In a secrets manager or protected configuration, never in the code.', 'Code gets shared and copied; secrets must not travel with it.', [
        ['In the source code, so it is easy to find.', 'Anyone with the code gets the key.'],
        ['In a chat message to the team.', 'Chat is searchable and shared.'],
        ['On a sticky note on the monitor.', 'Physical exposure.'],
      ]),
    Q('What is an audit log for?', 2,
      'A record of who did what and when, used to investigate.', 'It gives accountability after the fact.', [
        ['Making pages load faster.', 'Not its purpose.'],
        ['Hiding errors.', 'It records them.'],
        ['Replacing backups.', 'A log is not a backup.'],
      ]),
  ]),

  lesson('sd-ai', 'AI and agent concepts', 50, 'The vocabulary behind AI agents, without the jargon.', [
    { t: 'list', items: [
      'A **large language model (LLM)** predicts text. It does not look facts up unless you give it a way to.',
      '**Token**: a piece of text the model reads (about three quarters of a word). The **context window** is how much it can read at once, your prompt and its answer together.',
      '**Hallucination**: a confident answer that is wrong or invented.',
      '**Grounding / RAG** (retrieval-augmented generation): fetch the relevant documents first and put them in the prompt, so the model answers from real data. This is the main defense against hallucination.',
      '**Temperature**: how random the output is. Low is steadier. High is more varied.',
      '**Fine-tuning** changes the model with extra training. **Prompting** and **RAG** change only what you send it. Prompting and RAG are cheaper and faster to change.',
      '**Agent**: an LLM that can use **tools** (look up a record, send an email) and decide the next step. More power means more need for **guardrails**.',
      '**Guardrails**: limits on what the agent may say or do. **Human-in-the-loop**: a person approves risky actions.',
      '**Evaluation**: test the system on a fixed set of examples, so you can see whether a change made it better or worse.',
    ] },
    { t: 'analogy', text: 'RAG is an open-book exam. The model is a smart student; the retrieved documents are the book.' },
    { t: 'warn', text: 'A fluent answer is not a true answer. Anything that matters should come from, and point back to, real data.' },
  ], [
    Q('A support agent invents a refund policy that does not exist. This is called:', 1,
      'A hallucination.', 'The model produced a confident but invented answer.', [
        ['Caching.', 'Caching stores results for reuse.'],
        ['Sharding.', 'Sharding splits data across databases.'],
        ['Load balancing.', 'That spreads traffic across servers.'],
      ]),
    Q('Which approach best reduces made-up answers about your own company policies?', 3,
      'Retrieve the real policy documents and give them to the model with the question (RAG).', 'Grounding lets the model answer from facts, not memory.', [
        ['Turn the temperature up.', 'That increases randomness.'],
        ['Ask it to be more confident.', 'Confidence is not accuracy.'],
        ['Shorten the question.', 'Length is not the issue.'],
      ]),
    Q('What is a context window?', 0,
      'The amount of text the model can consider at once, including your prompt and its reply.', 'Beyond it, the model cannot see earlier text.', [
        ['The size of the screen.', 'Unrelated.'],
        ['The model\'s training date.', 'Not what the term means.'],
        ['A list of allowed users.', 'That is access control.'],
      ]),
    Q('You want an agent to answer from this week\'s pricing, which changes often. Which is the better approach?', 2,
      'Retrieve the current pricing when the question is asked.', 'Retrieval stays current without retraining anything.', [
        ['Fine-tune the model every week.', 'Slower and more expensive than retrieving current data.'],
        ['Hope the model remembers.', 'It cannot know recent changes.'],
        ['Turn off the agent.', 'Does not solve the need.'],
      ]),
    Q('An agent can issue refunds. What is the sensible safeguard?', 1,
      'Limit the refund amount and require human approval above a threshold.', 'Guardrails plus a person in the loop limit damage.', [
        ['Let it refund anything instantly.', 'No safeguard at all.'],
        ['Hide the refund tool.', 'Then it cannot do its job.'],
        ['Ask it politely to be careful.', 'Politeness is not a control.'],
      ]),
    Q('Why do teams keep a fixed set of test questions for their agent?', 3,
      'To measure whether a change made answers better or worse.', 'That is evaluation: the same tests before and after.', [
        ['To make the agent slower.', 'Not the goal.'],
        ['To avoid using data.', 'It uses data.'],
        ['To impress customers.', 'The purpose is measurement.'],
      ]),
    Q('What does a low temperature setting do?', 0,
      'Makes the output steadier and more repeatable.', 'Low randomness means similar answers each time.', [
        ['Makes the model faster.', 'Speed is not what it changes.'],
        ['Adds more creativity.', 'That is high temperature.'],
        ['Deletes old data.', 'Unrelated.'],
      ]),
    Q('An agent reads a customer email that contains hidden instructions to send out data. Which risk is this?', 2,
      'Prompt injection.', 'Untrusted text is trying to act as instructions.', [
        ['A cache miss.', 'Unrelated.'],
        ['Index bloat.', 'A database topic.'],
        ['Latency.', 'That is speed, not security.'],
      ]),
  ]),

  lesson('sd-crm', 'CRM and platform concepts', 40, 'The shape of a CRM, in plain language.', [
    { t: 'p', text: 'A **CRM** (customer relationship management system) stores customers, deals and activity. Many platforms, including Salesforce, share a few ideas. These are general concepts; use them to read a question, not to recall one product\'s menu.' },
    { t: 'list', items: [
      '**Object**: a type of record, like a table. **Record**: one row. **Field**: one column. Platforms ship **standard** objects (Account, Contact, Opportunity) and let you add **custom** ones.',
      '**Relationships**: a **lookup** loosely links two records. A **master-detail** link is tighter: the child cannot exist without its parent and is removed with it.',
      '**Declarative** tools (clicks, no code) such as a **flow** (an automated workflow) are quicker to build. **Code** is for what clicks cannot do.',
      '**Governor limits**: shared platforms cap how much one tenant can use, so no one slows others down.',
      '**Sandbox**: a safe copy for building and testing. Changes are tested there, then moved to **production**.',
      '**Permission sets and profiles** control who can see and change what.',
      '**Data quality**: duplicates, missing values and stale records quietly break reports and automations.',
    ] },
    { t: 'tip', text: 'When a question says "least effort", "no code" or "quickest to maintain", look for the declarative answer first.' },
  ], [
    Q('In CRM terms, an Account is an object, and "Acme Retail" is a:', 1,
      'Record.', 'An object is the type; a record is one example of it.', [
        ['Field.', 'A field is a column, such as Industry.'],
        ['Sandbox.', 'A sandbox is a test environment.'],
        ['Flow.', 'A flow is an automation.'],
      ]),
    Q('A child record must be deleted whenever its parent is deleted, and cannot exist without it. Which relationship fits?', 3,
      'Master-detail.', 'It ties the child tightly to the parent.', [
        ['Lookup.', 'A lookup is looser: the child can exist alone.'],
        ['No relationship.', 'The question describes a strong link.'],
        ['Sandbox.', 'Not a relationship.'],
      ]),
    Q('A team wants an automatic email when a deal reaches a new stage, with no developers available. What is the best fit?', 0,
      'A declarative automation such as a flow.', 'Built with clicks, quick to change and maintain.', [
        ['A custom application written from scratch.', 'Needs developers and is slower to maintain.'],
        ['A weekly manual reminder.', 'Not automatic.'],
        ['A larger database.', 'Size is not the issue.'],
      ]),
    Q('Why do multi-tenant platforms enforce governor limits?', 2,
      'So no single customer\'s heavy job slows everyone else down.', 'Shared resources need fair use.', [
        ['To reduce the number of users.', 'Not the purpose.'],
        ['To make developers\' lives harder.', 'It is a fairness control.'],
        ['To avoid backups.', 'Unrelated.'],
      ]),
    Q('Where should you build and test a new automation before real users see it?', 1,
      'A sandbox.', 'It is a safe copy, so mistakes do not affect production.', [
        ['Directly in production.', 'Risky for live data.'],
        ['In an email draft.', 'Not an environment.'],
        ['On a customer\'s laptop.', 'Not controlled.'],
      ]),
    Q('Reports show two copies of the same customer with different totals. This is a:', 3,
      'Data quality problem: duplicate records that should be merged.', 'Duplicates split history and distort totals.', [
        ['Scaling problem.', 'Not about load.'],
        ['Network outage.', 'The system is up.'],
        ['Security breach.', 'Nothing suggests one.'],
      ]),
  ]),

  lesson('sd-data', 'Data pipelines and data quality', 40, 'Moving data between systems without breaking it.', [
    { t: 'list', items: [
      '**ETL**: extract data, transform it (clean and reshape), then load it. **ELT** loads first and transforms inside the destination.',
      '**Data warehouse**: organized, structured data built for reporting. **Data lake**: raw files of any shape, stored cheaply.',
      '**Batch** processing handles data in chunks on a schedule. **Streaming** handles each event as it arrives.',
      '**Schema**: the agreed shape of the data (columns and types). A change at the source can break everything downstream.',
      '**Deduplication** and a **golden record** (one trusted version of each customer) fix duplicates.',
      '**Idempotent loads**: running the same load twice does not double the data.',
      '**Data governance**: who owns the data, who can use it, and for what purpose.',
      '**Data lineage**: where a number came from and what changed it on the way.',
    ] },
    { t: 'analogy', text: 'A pipeline is plumbing. Most problems are leaks (missing rows), wrong fittings (schema changes), and dirty water (bad data).' },
  ], [
    Q('Data is loaded into the destination first and transformed there afterwards. This is:', 2,
      'ELT.', 'Load, then transform.', [
        ['ETL.', 'ETL transforms before loading.'],
        ['Sharding.', 'Splitting data across databases.'],
        ['Caching.', 'Storing results for reuse.'],
      ]),
    Q('A nightly job runs twice by mistake and the totals double. What design property would have prevented this?', 0,
      'Idempotent loads.', 'Running the same load again leaves the data unchanged.', [
        ['A bigger server.', 'More capacity does not prevent duplicate loads.'],
        ['A darker dashboard theme.', 'Irrelevant.'],
        ['Fewer columns.', 'Unrelated.'],
      ]),
    Q('The sales team renames a column in the source system, and next day the reports are empty. What most likely happened?', 3,
      'A schema change at the source broke the downstream queries.', 'Pipelines depend on an agreed shape.', [
        ['The reports got faster.', 'They broke, not sped up.'],
        ['A cache expired.', 'Would not empty the reports.'],
        ['The internet went down globally.', 'Far less likely than a renamed column.'],
      ]),
    Q('Which suits raw, mixed-format files at low cost for later use?', 1,
      'A data lake.', 'It stores raw data of any shape.', [
        ['A relational table with strict columns.', 'Needs a fixed structure first.'],
        ['A single spreadsheet.', 'Not built for volume.'],
        ['A load balancer.', 'Not storage.'],
      ]),
    Q('A fraud team needs to react within seconds of each transaction. Which processing style fits?', 2,
      'Streaming.', 'Each event is handled as it arrives.', [
        ['Monthly batch.', 'Far too slow.'],
        ['Quarterly export.', 'Far too slow.'],
        ['Manual review of printouts.', 'Not scalable or fast.'],
      ]),
    Q('Three records exist for the same customer with slightly different spellings. The standard fix is to:', 0,
      'Deduplicate and keep one trusted golden record.', 'One true version per customer.', [
        ['Keep all three and average them.', 'Averaging text makes no sense.'],
        ['Delete the customer.', 'You would lose real data.'],
        ['Rename the table.', 'Does not fix duplicates.'],
      ]),
  ]),

  lesson('sd-reliab', 'Reliability and delivery', 40, 'Keeping a system up, and releasing changes safely.', [
    { t: 'list', items: [
      '**SLA**: a promise to customers (such as 99.9% uptime). **SLO**: your internal target. **SLI**: the measurement.',
      '**Monitoring** tells you something is wrong. **Observability** (logs, metrics, traces) helps you find why.',
      '**Retry with backoff** handles brief failures. A **circuit breaker** stops calling a service that keeps failing, so it can recover.',
      '**Rollback**: go back to the previous version when a release goes wrong.',
      '**Blue-green**: run the new version beside the old and switch traffic over. **Canary**: send a small share of users to the new version first.',
      '**Feature flag**: turn a feature on or off without a new release.',
      '**Incident response**: stop the harm, communicate, fix, then run a **blameless review** to learn.',
      '**Backups** protect against data loss. They are only useful if you have tested a **restore**.',
    ] },
    { t: 'analogy', text: 'A canary release is sending one taster to try the soup before serving the whole room.' },
  ], [
    Q('You want to release a risky change to 5% of users first and watch the results. This is a:', 1,
      'Canary release.', 'A small group tests the change first.', [
        ['Full outage.', 'The opposite.'],
        ['Database index.', 'Unrelated.'],
        ['Cache refresh.', 'Unrelated.'],
      ]),
    Q('A dependency keeps timing out, and every request waits and piles up. Which pattern helps the system recover?', 3,
      'A circuit breaker.', 'It stops calling the failing service for a while.', [
        ['A bigger monitor.', 'Does not change the behavior.'],
        ['More retries immediately.', 'That adds more load to a struggling service.'],
        ['A new logo.', 'Irrelevant.'],
      ]),
    Q('A new release causes errors. The fastest safe action is usually to:', 0,
      'Roll back to the previous version, then investigate.', 'Stop the harm first.', [
        ['Debug live in production for hours.', 'Customers keep suffering.'],
        ['Say nothing.', 'Communication matters.'],
        ['Delete the logs.', 'You need them to investigate.'],
      ]),
    Q('What does a blameless review focus on?', 2,
      'What in the system and process allowed the problem, and how to prevent it.', 'Learning improves the system; blame hides information.', [
        ['Who to punish.', 'That makes people hide mistakes.'],
        ['Who was on call.', 'Not the point.'],
        ['How to avoid writing it down.', 'Writing it down is the value.'],
      ]),
    Q('A backup exists, but nobody has ever tried restoring it. What is the risk?', 1,
      'It may not work when you need it, so restores should be tested.', 'A backup is only as good as a successful restore.', [
        ['None. Backups always work.', 'Untested backups often fail.'],
        ['It will be too small.', 'Not the issue.'],
        ['It will make the site slower.', 'Not the issue.'],
      ]),
    Q('Which lets you turn a feature off instantly without redeploying?', 3,
      'A feature flag.', 'The switch lives in configuration.', [
        ['A database migration.', 'That changes the data.'],
        ['A new sprint.', 'A planning term.'],
        ['A load balancer.', 'Spreads traffic.'],
      ]),
  ]),

  lesson('sd-delivery', 'Projects, scope and stakeholders', 35, 'Multiple-choice judgment questions about running a customer project.', [
    { t: 'list', items: [
      '**Discovery** comes before design: understand the goal, the users, the data and the constraints.',
      '**Success metrics** are agreed up front, such as "cut handling time by 20%".',
      '**Scope creep**: new requests slip in without changing time or budget. Handle with a **change request**: note the impact, then decide together.',
      '**Prioritization**: separate **must have** from nice to have. A common frame is MoSCoW: Must, Should, Could, Won\'t (this time).',
      '**MVP / phased delivery**: ship a small useful version first, then expand.',
      '**RACI**: who is Responsible, Accountable, Consulted and Informed. One accountable owner per decision.',
      '**Risks and dependencies** are written down early, with an owner and a plan.',
      '**Change management**: people need training and a reason to switch, or the best solution goes unused.',
    ] },
    { t: 'tip', text: 'In judgment questions, the best answer usually listens first, makes the trade-off visible, offers options, and agrees a next step.' },
  ], [
    Q('Midway through a project, the customer asks for a large extra feature but wants the same deadline. Best response?', 2,
      'Explain the impact, offer options (move the date, drop something else, or add it in a second phase), and agree the change in writing.', 'It keeps the relationship while making trade-offs visible.', [
        ['Say yes and work weekends.', 'It hides the real cost and breaks later.'],
        ['Say no and end the conversation.', 'Needlessly adversarial.'],
        ['Quietly add it and say nothing.', 'The trade-off and the risk go unseen.'],
      ]),
    Q('Why agree on success metrics at the start?', 0,
      'So everyone can tell later whether the project worked.', 'Without a target, success is an opinion.', [
        ['To make reports longer.', 'Not the goal.'],
        ['To avoid talking to users.', 'Users still matter.'],
        ['To delay the launch.', 'Clarity usually speeds things up.'],
      ]),
    Q('You have six requests and time for three. What helps you decide?', 1,
      'Rank them by value and urgency, separate must-haves from nice-to-haves, and agree the cut with the owner.', 'A shared ranking prevents arguments later.', [
        ['Build whichever is easiest.', 'Easy is not the same as valuable.'],
        ['Build all six badly.', 'Quality and trust suffer.'],
        ['Let the loudest person decide.', 'Not a method.'],
      ]),
    Q('What is the main value of delivering an MVP first?', 3,
      'Early real feedback from a small, useful version.', 'You learn what users really need before building more.', [
        ['It avoids testing.', 'Testing is still needed.'],
        ['It guarantees no changes.', 'Changes are expected.'],
        ['It removes the need for a plan.', 'You still need a plan.'],
      ]),
    Q('A technically perfect solution sits unused after launch. What was probably missing?', 2,
      'Change management: training, communication and a reason to switch.', 'Adoption is part of delivery.', [
        ['A bigger server.', 'Capacity did not cause non-use.'],
        ['More code.', 'More code does not create adoption.'],
        ['A faster network.', 'Not the cause.'],
      ]),
    Q('In a RACI chart, why is it important to have a single "Accountable" person per decision?', 0,
      'One person owns the outcome, so decisions are not stuck or dropped.', 'Shared ownership often means no ownership.', [
        ['It lowers the cost.', 'Unrelated.'],
        ['It removes the need for meetings.', 'Not true.'],
        ['It guarantees success.', 'Nothing does.'],
      ]),
  ]),

  lesson('sd-tradeoff', 'Mixed trade-off scenarios', 45, 'Practice picking the best fit when several answers sound reasonable.', [
    { t: 'p', text: 'These questions combine ideas from the earlier lessons. For each, find the **constraint word** (must not lose data, spiky traffic, needs to be quick, untrusted input) and match it to the concept.' },
    { t: 'table', head: ['Constraint word', 'Usually points to'], rows: [
      ['must not lose data', 'replication, backups, transactions'],
      ['traffic spikes', 'horizontal scaling, queues, caching'],
      ['near-instant reads', 'cache, key-value store, index'],
      ['do slow work later', 'message queue, background job'],
      ['many customers, one platform', 'multi-tenancy, governor limits'],
      ['untrusted text', 'treat as data, least privilege, human approval'],
      ['same answer from real data', 'RAG, grounding, evaluation'],
      ['no developers, quick change', 'declarative automation, flow'],
    ] },
  ], [
    Q('A site is fine all year but crashes during a two-day sale. What is the most cost-effective design response?', 1,
      'Scale out automatically for the peak with a load balancer, and queue slow work.', 'Capacity follows demand, so you do not pay for peak all year.', [
        ['Buy the biggest server and keep it running forever.', 'Costly and still a single point of failure.'],
        ['Cancel the sale.', 'Avoids the problem instead of solving it.'],
        ['Turn off the database.', 'The site cannot work without it.'],
      ]),
    Q('Orders must never be lost, even if a server crashes mid-request. Which pair of ideas fits best?', 3,
      'A relational database with transactions, plus replication.', 'All-or-nothing writes, plus a copy ready if one machine dies.', [
        ['A cache and a CDN.', 'Both are temporary copies, not a source of truth.'],
        ['Polling and webhooks.', 'Those are integration styles.'],
        ['A larger font.', 'Irrelevant.'],
      ]),
    Q('An AI assistant must answer from the company\'s current policies and show where each answer came from. Best design?', 0,
      'Retrieve the relevant policy text, answer from it, and cite it.', 'Grounding plus citation supports trust and checking.', [
        ['Fine-tune once and never update.', 'It goes stale and cannot cite sources.'],
        ['Let it answer from memory.', 'Risks hallucination.'],
        ['Turn the temperature to maximum.', 'More randomness, less reliability.'],
      ]),
    Q('Product search is slow because the same popular queries are recomputed all day. First fix?', 2,
      'Cache the results of popular queries for a short time.', 'Skips repeated work, with a TTL to limit staleness.', [
        ['Delete the popular products.', 'Defeats the purpose.'],
        ['Add a second logo.', 'Irrelevant.'],
        ['Ask users to search less.', 'Pushes the problem to users.'],
      ]),
    Q('A partner\'s API goes down every hour and your app freezes waiting on it. Which combination helps most?', 1,
      'Timeouts, retry with backoff and a circuit breaker.', 'You fail fast, retry politely and protect your own app.', [
        ['Wait indefinitely for a reply.', 'Your app freezes.'],
        ['Call the API more often.', 'More load on a failing service.'],
        ['Remove all error messages.', 'Hiding errors does not fix them.'],
      ]),
    Q('A customer wants an AI agent to read incoming emails and update their CRM automatically. What is the most important safeguard to propose?', 3,
      'Treat email text as untrusted data, limit what the agent can change, and require approval for risky updates.', 'It addresses injection, access and oversight together.', [
        ['Give it full admin rights for convenience.', 'A successful attack would reach everything.'],
        ['Skip testing to launch faster.', 'Untested automation on live data is risky.'],
        ['Hide the feature from the team.', 'Nobody can review or trust it.'],
      ]),
    Q('Two systems each hold a customer\'s address, with different values. Which action is best?', 0,
      'Agree which system is the source of truth, then sync from it and fix duplicates.', 'One owner of each fact avoids endless conflicts.', [
        ['Copy whichever was edited last, always.', 'Newest is not always correct.'],
        ['Delete both.', 'You lose the data.'],
        ['Ignore the difference.', 'Reports and emails will keep going wrong.'],
      ]),
    Q('A nightly import takes 6 hours and users must wait for it to finish before they can use the app. What is a good redesign?', 3,
      'Process in the background with a queue, show progress, and let users keep working.', 'Slow work moves out of the user\'s path.', [
        ['Tell users to come back tomorrow.', 'Poor experience.'],
        ['Run it only on weekends.', 'Still blocks the app when it runs.'],
        ['Cut the data in half at random.', 'Loses data.'],
      ]),
  ]),
];
