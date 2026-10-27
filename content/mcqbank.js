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
      'You are signed in, but not allowed to do this.', '403 means the server knows who you are but will not allow the action. It is an authorization failure.', [
        ['The server hit an error while handling it.', 'Server errors are 5xx codes, such as 500. A 403 is a deliberate refusal.'],
        ['The record at that URL does not exist.', 'A missing resource returns 404.'],
        ['You are not signed in, or your login expired.', 'A missing or expired login is usually 401. 403 means you are known but not permitted.'],
      ]),
    Q('You get 429 from an API. The best response is to:', 2,
      'Wait, then retry, waiting longer after each failure.', 'This is backoff. It respects the limit and avoids making the overload worse.', [
        ['Resend the request right away until it goes through.', 'Instant retries keep you over the limit and can get you blocked for longer.'],
        ['Fix the request body, since 429 means invalid input.', 'Invalid input is 400. 429 means too many requests, so the content is not the problem.'],
        ['Spread the calls across extra API keys to avoid it.', 'That dodges the limit instead of respecting it, and limits often apply per account anyway.'],
      ]),
    Q('Why is an idempotent operation convenient when a network call might fail?', 0,
      'It is safe to retry, since repeats have no extra effect.', 'Repeating it has the same effect as doing it once, so a retry cannot double-charge or double-create.', [
        ['It is guaranteed to succeed on the first attempt.', 'It can still fail. Idempotency only makes it safe to repeat.'],
        ['It changes no data, so a failed call cannot hurt anything.', 'Idempotent calls can change data, like setting a status to Paid. Repeats just do not change it again.'],
        ['It responds faster, so timeouts happen less often.', 'Idempotency is about the effect of repeats, not speed.'],
      ]),
    Q('Your system needs to know the moment a customer pays. Which approach is usually better than asking every minute?', 3,
      'A webhook: the payment system calls you when it happens.', 'You get the news right away and make far fewer pointless requests.', [
        ['Polling every few seconds instead of every minute.', 'Faster polling wastes even more requests and still has a small delay.'],
        ['A nightly batch job that pulls in all new payments.', 'Once a night is much slower than asking every minute.'],
        ['A cache that holds the latest payment status.', 'A cache stores copies for fast reads. It does not tell you when something new happens.'],
      ]),
    Q('Which HTTP verb is meant for creating a new record?', 0,
      'POST', 'POST sends data to create something new.', [
        ['GET', 'GET only reads data. It should never create anything.'],
        ['DELETE', 'DELETE removes a record.'],
        ['PATCH', 'PATCH updates part of a record that already exists.'],
      ]),
    Q('What does OAuth let an app do?', 2,
      'Act for you with limited access, without your password.', 'You grant specific permissions, the app gets a token instead of your password, and you can revoke it.', [
        ['Store your password safely so it can sign in as you.', 'The point of OAuth is that the app never holds your password.'],
        ['Encrypt your data while it travels over the network.', 'That is HTTPS, or encryption in transit. OAuth is about delegated access.'],
        ['Get full, permanent access to everything in your account.', 'OAuth access is limited to what you grant, and you can revoke it.'],
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
      'Read-only access to that one report.', 'Least privilege: grant only what the job needs.', [
        ['Edit access to that report, just in case.', 'The job is reading. Edit rights add risk with no need.'],
        ['Read access to the whole reports folder.', 'That grants far more than the one report the job needs.'],
        ['Temporary admin access for the first week.', 'Admin access, even for a short time, is the opposite of least privilege.'],
      ]),
    Q('Which control stops someone who has stolen a password from signing in?', 1,
      'Multi-factor authentication (MFA).', 'A second proof, such as a phone code, is required, and the thief does not have it.', [
        ['A rule requiring longer passwords.', 'The thief already has the password, so its length no longer matters.'],
        ['Single sign-on (SSO) for all apps.', 'SSO means one login opens many apps. On its own it adds no second proof.'],
        ['Audit logging of every sign-in.', 'Logs help investigate afterward. They do not block the sign-in.'],
      ]),
    Q('What does encryption at rest protect?', 0,
      'Data stored on disk or in a database.', '"At rest" means stored, not moving.', [
        ['Data moving between servers over the network.', 'That is encryption in transit, such as HTTPS.'],
        ['Who is allowed to open each stored file.', 'That is access control, which decides who may see what.'],
        ['Data an app is actively using in memory.', 'At rest means stored. Data in active use is a separate case.'],
      ]),
    Q('You must share a customer dataset for analysis, but analysts do not need names. Best practice?', 3,
      'Remove or mask the personal fields before sharing.', 'Less personal data shared means less risk.', [
        ['Share the full dataset and ask them to keep it private.', 'A request is not a control. The names are still exposed.'],
        ['Encrypt the file, then share it with the names included.', 'Encryption protects the file on the way, but analysts still see every name once they open it.'],
        ['Share it only with senior analysts you trust.', 'Trust does not remove the risk, and they still do not need the names.'],
      ]),
    Q('Where should an API key live?', 1,
      'In a secrets manager, not in the code.', 'Code gets shared and copied, so secrets must not travel with it.', [
        ['In the code, in a private repo.', 'Private code still gets cloned and shared. Anyone with the code gets the key.'],
        ['In a shared team document.', 'Documents are copied and forwarded, so the key spreads.'],
        ['Hidden in the web page\'s JavaScript.', 'Anyone can read a page\'s code in their browser.'],
      ]),
    Q('What is an audit log for?', 2,
      'A record of who did what, and when.', 'It is used to investigate problems and gives accountability after the fact.', [
        ['A copy of data to restore after a loss.', 'That is a backup. An audit log records actions, not a copy of the data.'],
        ['A live view of system speed and errors.', 'That is monitoring. Audit logs track what people did.'],
        ['A list of who is allowed to access what.', 'That is permissions. The audit log records what people actually did.'],
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
        ['Prompt injection.', 'Injection is outside text giving the model orders. Here the model made the policy up by itself.'],
        ['Fine-tuning.', 'Fine-tuning is extra training. It is a technique, not a kind of error.'],
        ['Low temperature.', 'Temperature is a setting for randomness, not the name for an invented answer.'],
      ]),
    Q('Which approach best reduces made-up answers about your own company policies?', 3,
      'Give it the real policy text with each question (RAG).', 'Grounding lets the model answer from facts, not memory.', [
        ['Tell the model in the prompt never to make things up.', 'An instruction does not give it the facts, so it still has to guess.'],
        ['Switch to a larger model trained on more of the internet.', 'Your internal policies are not on the internet, so a bigger model still guesses.'],
        ['Fine-tune it once on last year\'s policy documents.', 'It goes stale when policies change and cannot point to a source.'],
      ]),
    Q('What is a context window?', 0,
      'How much text the model can see at once, prompt and reply.', 'Text beyond the window is not visible to the model.', [
        ['The total amount of text the model learned from in training.', 'That is training data. The window is what it can see in one request.'],
        ['The date after which the model has no knowledge.', 'That is the training cutoff, not the context window.'],
        ['The chat history the model saves between sessions.', 'Saved history is memory or storage. The window is what fits in one request.'],
      ]),
    Q('You want an agent to answer from this week\'s pricing, which changes often. Which is the better approach?', 2,
      'Retrieve the current pricing when the question is asked.', 'Retrieval stays current without retraining anything.', [
        ['Fine-tune the model on the new prices every week.', 'Retraining is slow and costly, and prices may change mid-week.'],
        ['Paste the price list into the agent\'s instructions once.', 'A list pasted once goes stale as soon as prices change.'],
        ['Use the newest model, with the latest training date.', 'Any training date is fixed, so it still misses this week\'s changes.'],
      ]),
    Q('An agent can issue refunds. What is the sensible safeguard?', 1,
      'Cap refunds and require human approval above a limit.', 'Guardrails plus a person in the loop limit the damage of a mistake.', [
        ['Tell it in the prompt to refund only when it is fair.', 'A prompt instruction is not an enforced limit. The agent can still get it wrong.'],
        ['Log every refund so staff can review them each month.', 'Logs help afterward, but a bad refund has already been paid.'],
        ['Set the temperature to zero so it behaves the same way.', 'Consistent is not the same as safe. It can be consistently wrong.'],
      ]),
    Q('Why do teams keep a fixed set of test questions for their agent?', 3,
      'To measure whether a change made answers better or worse.', 'That is evaluation: run the same tests before and after a change.', [
        ['To train the model so it memorizes the right answers.', 'That is fine-tuning. Training on the test set spoils it as a fair measure.'],
        ['To give the agent examples to copy inside its prompt.', 'Those are prompt examples. A test set is kept apart to score the system.'],
        ['To restrict the agent to answering only those questions.', 'Real users ask anything. The set measures quality and does not limit topics.'],
      ]),
    Q('What does a low temperature setting do?', 0,
      'Makes the output steadier and more repeatable.', 'Low randomness means similar answers each time.', [
        ['Makes the answers more accurate and factual.', 'Steadier is not truer. A low setting can repeat the same wrong answer.'],
        ['Makes the output more varied and creative.', 'That is a high temperature.'],
        ['Makes the model respond faster and cost less.', 'Temperature changes randomness, not speed or price.'],
      ]),
    Q('An agent reads a customer email that contains hidden instructions to send out data. Which risk is this?', 2,
      'Prompt injection.', 'Untrusted text is trying to act as instructions.', [
        ['A hallucination.', 'A hallucination is the model inventing facts. Here outside text is giving it orders.'],
        ['SQL injection.', 'SQL injection targets database queries. Hidden orders aimed at an AI are prompt injection.'],
        ['Training data poisoning.', 'Poisoning corrupts the data a model learns from. This attack arrives in the input at run time.'],
      ]),
  ]),

  lesson('sd-crm', 'CRM and platform concepts', 40, 'The shape of a CRM, in plain language.', [
    { t: 'p', text: 'A **CRM** (customer relationship management system) stores customers, deals and activity. Many platforms, including Salesforce, share a few ideas. These are general concepts; use them to read a question, not to recall one product\'s menu.' },
    { t: 'list', items: [
      '**Object**: a type of record, like a table. **Record**: one row. **Field**: one column. Platforms ship **standard** objects (Account, Contact, Opportunity) and let you add **custom** ones.',
      '**Relationships**: a **lookup** loosely links two records. A **master-detail** link is tighter: the child cannot exist without its parent and is removed with it.',
      '**Declarative** tools (clicks, no code) such as a **flow** (an automated workflow) are quicker to build. **Code** is for what clicks cannot do.',
      '**Governor limits** (Salesforce): caps on what code may use, mostly **per transaction** (for example 100 SOQL queries in one synchronous transaction) plus some **per org** per day (such as API calls). They stop one tenant slowing everyone else down.',
      '**Sandbox**: a safe copy for building and testing. Changes are tested there, then moved to **production**.',
      '**Permission sets and profiles** control who can see and change what.',
      '**Data quality**: duplicates, missing values and stale records quietly break reports and automations.',
    ] },
    { t: 'tip', text: 'When a question says "least effort", "no code" or "quickest to maintain", look for the declarative answer first.' },
  ], [
    Q('In CRM terms, an Account is an object, and "Acme Retail" is a:', 1,
      'Record.', 'An object is the type; a record is one example of it.', [
        ['Field.', 'A field is one column, such as Industry, not the whole row.'],
        ['Object.', 'Account is the object, or type. Acme Retail is one example of it.'],
        ['Lookup.', 'A lookup is a link between records, not a record itself.'],
      ]),
    Q('A child record must be deleted whenever its parent is deleted, and cannot exist without it. Which relationship fits?', 3,
      'Master-detail.', 'It ties the child tightly to the parent.', [
        ['A lookup.', 'A lookup is looser: the child can exist alone and is kept when the parent is deleted.'],
        ['A matching text field.', 'Matching text is not a real link, so the platform cannot enforce the rule.'],
        ['A permission set.', 'Permission sets control who can access records, not how records are linked.'],
      ]),
    Q('A team wants an automatic email when a deal reaches a new stage, with no developers available. What is the best fit?', 0,
      'A declarative automation such as a flow.', 'Built with clicks, it is quick to change and maintain.', [
        ['A custom app written from scratch.', 'That needs developers, which the team does not have.'],
        ['A scheduled report emailed to the team.', 'A report on a schedule does not fire when a deal changes stage.'],
        ['A dashboard showing deals by stage.', 'A dashboard shows data. It does not send anything automatically.'],
      ]),
    Q('Why do multi-tenant platforms enforce governor limits?', 2,
      'So no single customer\'s heavy job slows everyone else down.', 'Shared resources need fair use.', [
        ['So each customer\'s data stays hidden from the other customers.', 'That is data isolation. Limits are about fair use of shared resources.'],
        ['So one customer\'s data cannot be lost in a crash.', 'That is the job of backups and replication. Limits are about sharing capacity fairly.'],
        ['So developers cannot write any custom code at all.', 'Custom code is allowed. Limits only cap how much each job can use.'],
      ]),
    Q('Where should you build and test a new automation before real users see it?', 1,
      'A sandbox.', 'It is a safe copy, so mistakes do not affect production.', [
        ['In production.', 'Production is where real users work, so testing there risks live data.'],
        ['A backup copy.', 'A backup is kept for restoring data, not for building and testing.'],
        ['A data warehouse.', 'A warehouse is for reporting on data, not for building automations.'],
      ]),
    Q('Reports show two copies of the same customer with different totals. This is a:', 3,
      'Data quality problem (duplicate records).', 'Duplicates split history and distort totals, so they should be merged.', [
        ['Scaling problem caused by too many records.', 'Heavy load slows a system down. It does not create a second customer.'],
        ['Caching problem showing an old total.', 'A stale cache shows an old value, not two separate customer records.'],
        ['Permissions problem hiding some records.', 'Hidden records would make totals smaller, not create two copies.'],
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
        ['Streaming.', 'Streaming is about timing, handling each event as it arrives, not the order of the steps.'],
        ['Data lineage.', 'Lineage tracks where a number came from. It does not name the order of steps.'],
      ]),
    Q('A nightly job runs twice by mistake and the totals double. What design property would have prevented this?', 0,
      'Idempotent loads.', 'Running the same load again leaves the data unchanged.', [
        ['Schema validation.', 'Schema checks catch data in the wrong shape, but duplicate rows have the right shape.'],
        ['Data lineage tracking.', 'Lineage shows where data came from. It does not stop a double load.'],
        ['A faster server.', 'More speed does not stop the same rows loading twice.'],
      ]),
    Q('The sales team renames a column in the source system, and next day the reports are empty. What most likely happened?', 3,
      'A source schema change broke downstream queries.', 'Pipelines depend on an agreed shape, and the queries still look for the old column name.', [
        ['A cache expired and the data has not reloaded yet.', 'An expired cache reloads from the source. It would not leave reports empty for a day.'],
        ['The nightly job ran twice and duplicated the rows.', 'Duplicates would inflate the totals, not empty the reports.'],
        ['Someone changed the date filter on the reports.', 'Nothing in the story points to the reports changing. The renamed column is the clear trigger.'],
      ]),
    Q('Which suits raw, mixed-format files at low cost for later use?', 1,
      'A data lake.', 'It stores raw data of any shape cheaply.', [
        ['A data warehouse.', 'A warehouse holds structured, cleaned data for reporting, so raw files must be shaped first.'],
        ['A cache.', 'A cache holds short-lived copies for speed, not long-term raw storage.'],
        ['A relational database.', 'Relational tables need a fixed structure before data goes in.'],
      ]),
    Q('A fraud team needs to react within seconds of each transaction. Which processing style fits?', 2,
      'Streaming.', 'Each event is handled as it arrives.', [
        ['Nightly batch.', 'A nightly run reacts hours after the transaction.'],
        ['Caching.', 'A cache speeds up repeated reads. It does not process each new event.'],
        ['Data warehousing.', 'A warehouse stores data for reporting. It does not decide how fast each event is handled.'],
      ]),
    Q('Three records exist for the same customer with slightly different spellings. The standard fix is to:', 0,
      'Deduplicate and keep one trusted golden record.', 'Merging into one true version keeps the customer\'s history together.', [
        ['Fix the spelling in all three so they match.', 'Matching spellings still leave three records for one customer.'],
        ['Delete the two oldest and keep the newest.', 'Newest is not always right, and you lose the history in the others.'],
        ['Keep all three and let users pick one.', 'The duplicates keep splitting history and breaking reports.'],
      ]),
  ]),

  lesson('sd-reliab', 'Reliability and delivery', 40, 'Keeping a system up, and releasing changes safely.', [
    { t: 'list', items: [
      '**SLA**: a promise to customers (such as 99.9% uptime). **SLO**: your internal target. **SLI**: the measurement.',
      '**Uptime math**: allowed downtime = (1 minus uptime) times the period. In a 30-day month (43,200 minutes): 99% allows about 7.2 hours, 99.9% about 43 minutes, 99.99% about 4.3 minutes. Each extra nine cuts downtime by ten.',
      '**Chains and backups**: two services that both must work multiply (99.9% x 99.9% is about 99.8%, worse than either). Two redundant copies where either can serve divide the risk (two 99% copies give about 99.99%).',
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
    Q('A service promises 99.99% uptime. About how much downtime does that allow in a 30-day month?', 2,
      'About 4 minutes.', 'A 30-day month has 43,200 minutes, and 0.01% of that is about 4.3 minutes.', [
        ['About 43 minutes.', 'That is 99.9% uptime, one nine fewer.'],
        ['About 7 hours.', 'That is 99% uptime, two nines fewer.'],
        ['About 4 seconds.', 'Far too small. That would be roughly six nines.'],
      ]),
    Q('You want to release a risky change to 5% of users first and watch the results. This is a:', 1,
      'Canary release.', 'A small group tries the change first, so problems reach only a few users.', [
        ['Blue-green release.', 'Blue-green runs old and new side by side, then switches all traffic over at once.'],
        ['Full rollout.', 'A full rollout sends every user to the new version at once.'],
        ['Load test.', 'A load test uses simulated traffic to check capacity, not real users.'],
      ]),
    Q('A dependency keeps timing out, and every request waits and piles up. Which pattern helps the system recover?', 3,
      'A circuit breaker.', 'It stops calling the failing service for a while, so requests fail fast and the service can recover.', [
        ['A longer timeout.', 'Waiting longer makes requests pile up even more.'],
        ['More immediate retries.', 'Instant retries add load to a service that is already struggling.'],
        ['A load balancer.', 'A load balancer spreads traffic across your own servers. It does not stop calls to a failing dependency.'],
      ]),
    Q('A new release causes errors. The fastest safe action is usually to:', 0,
      'Roll back to the previous version, then investigate.', 'Stop the harm first, then find the cause.', [
        ['Debug and patch the problem live in production.', 'Customers keep hitting errors while you debug.'],
        ['Write a quick fix and push it out without testing.', 'An untested fix can make things worse.'],
        ['Add more servers so the system absorbs the errors.', 'More capacity does not fix broken code.'],
      ]),
    Q('What does a blameless review focus on?', 2,
      'What let the problem happen, and how to prevent it.', 'It looks at the system and process. Learning improves the system; blame hides information.', [
        ['Who caused the problem, so that they can be retrained.', 'Focusing on a person makes people hide mistakes.'],
        ['Restoring service as fast as possible.', 'That is incident response. The review comes afterward, to learn.'],
        ['Writing an apology to the affected customers.', 'Customer updates matter, but the review is about internal learning.'],
      ]),
    Q('A backup exists, but nobody has ever tried restoring it. What is the risk?', 1,
      'It may fail to restore when you actually need it.', 'A backup is only as good as a successful restore, so restores should be tested.', [
        ['None, as long as the backup job reports success.', 'A success message proves a file was written, not that it can be restored.'],
        ['It may use up too much storage over time.', 'Storage cost is a budget issue, not what an untested restore puts at risk.'],
        ['It will slow down the system while it sits unused.', 'A stored backup does not slow anything down.'],
      ]),
    Q('Which lets you turn a feature off instantly without redeploying?', 3,
      'A feature flag.', 'The switch lives in configuration, not in the code release.', [
        ['A rollback.', 'A rollback redeploys the previous version. It is not a switch for one feature.'],
        ['A canary release.', 'A canary sends some users to a new version, which still needs a deploy.'],
        ['A database migration.', 'A migration changes the data structure. It does not toggle a feature.'],
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
      'Explain the impact, offer options, then agree on it in writing.', 'Options such as moving the date, dropping something else, or a second phase keep the relationship while making trade-offs visible.', [
        ['Say yes, and have the team work extra hours to fit it in.', 'It hides the real cost and often breaks quality or the deadline later.'],
        ['Say no, since the feature was not in the original scope.', 'A flat no harms the relationship and ignores a real need.'],
        ['Add it, and quietly cut testing time to make room for it.', 'Hidden trade-offs create risk the customer never agreed to.'],
      ]),
    Q('Why agree on success metrics at the start?', 0,
      'So everyone can tell later whether the project worked.', 'Without a target, success is just an opinion.', [
        ['So the scope cannot change at all once the work has begun.', 'Metrics define success. Scope can still change through a change request.'],
        ['So the team can skip discovery and start building.', 'Discovery still comes first. Metrics usually come out of it.'],
        ['So the team knows which tools and platform to use.', 'Metrics describe outcomes, not technology choices.'],
      ]),
    Q('You have six requests and time for three. What helps you decide?', 1,
      'Rank by value and urgency, then agree on the cut with the owner.', 'Separating must-haves from nice-to-haves in a shared ranking prevents arguments later.', [
        ['Build the three easiest first to show quick progress.', 'Easy is not the same as valuable.'],
        ['Start all six at once and finish whichever ones fit in time.', 'Spreading effort thin risks finishing none of them well.'],
        ['Build the three asked for by the most senior person.', 'Seniority is not value. The ranking should be shared and agreed on.'],
      ]),
    Q('What is the main value of delivering an MVP first?', 3,
      'Early real feedback from a small, useful version.', 'You learn what users really need before building more.', [
        ['It lets you skip testing so you can launch sooner.', 'An MVP is small, but it still needs testing.'],
        ['It locks the scope so nothing needs to change later.', 'Changes are expected. That is why you ship early.'],
        ['It is the cheapest way to build the full product.', 'An MVP leaves most features for later on purpose.'],
      ]),
    Q('A technically perfect solution sits unused after launch. What was probably missing?', 2,
      'Change management, such as training and communication.', 'People need training and a reason to switch. Adoption is part of delivery.', [
        ['More features to make the tool more appealing.', 'Extra features do not help if people were never trained or told why.'],
        ['Better performance and faster page load times for users.', 'It is technically perfect, so speed is not the problem.'],
        ['A more detailed technical design document.', 'Design documents guide the builders. They do not get users to switch.'],
      ]),
    Q('In a RACI chart, why is it important to have a single "Accountable" person per decision?', 0,
      'One clear owner, so decisions do not stall or get dropped.', 'Shared ownership often means no ownership.', [
        ['So that one person does all of the work themselves.', 'That describes Responsible. Accountable means owning the outcome, not doing every task.'],
        ['So fewer people need to be kept informed of progress.', 'Informed is a separate role. One owner does not change who is told.'],
        ['So the rest of the team does not need to be consulted at all.', 'Consulted people still give input. One owner just makes the final call.'],
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
      'Auto-scale out behind a load balancer, and queue slow work.', 'Capacity follows demand, so you do not pay for peak all year.', [
        ['Buy the biggest server and keep it running all year.', 'You pay for peak all year, and it is still a single point of failure.'],
        ['Cache every page, including checkout and payment.', 'Caching helps static pages, but checkout must be live and correct.'],
        ['Move the shop\'s live data into a data warehouse.', 'A warehouse is built for reporting, not for live shop traffic.'],
      ]),
    Q('Orders must never be lost, even if a server crashes mid-request. Which pair of ideas fits best?', 3,
      'A relational database with transactions, plus replication.', 'All-or-nothing writes, plus a copy ready if one machine dies.', [
        ['A cache in front of the database, plus a CDN.', 'Both hold temporary copies for speed, not a durable source of truth.'],
        ['Horizontal scaling, plus a load balancer.', 'That handles more traffic. It does not make writes durable.'],
        ['Nightly backups, plus a separate data warehouse for reports.', 'Nightly backups can lose a day of orders, and a warehouse is for reporting.'],
      ]),
    Q('An AI assistant must answer from the company\'s current policies and show where each answer came from. Best design?', 0,
      'Retrieve the relevant policy, answer from it, and cite it.', 'Grounding plus citation supports trust and checking.', [
        ['Fine-tune the model on the policies once a year.', 'It goes stale between updates and cannot point to a source.'],
        ['Use a low temperature so the answers stay consistent.', 'Consistent is not correct, and it still cannot cite anything.'],
        ['Ask the model to add its source at the end of every answer.', 'Without retrieved text to point to, it may invent the source too.'],
      ]),
    Q('Product search is slow because the same popular queries are recomputed all day. First fix?', 2,
      'Cache the results of popular queries for a short time.', 'It skips repeated work, with a TTL (time to live) to limit staleness.', [
        ['Put each search request on a message queue.', 'A queue delays work, but users want search results right away.'],
        ['Move the product data into a cheap data lake.', 'A lake is cheap raw storage, not built for fast queries.'],
        ['Run all searches as a nightly batch job instead of live.', 'Users need results for their searches now, not the next day.'],
      ]),
    Q('A partner\'s API goes down every hour and your app freezes waiting on it. Which combination helps most?', 1,
      'Timeouts, retry with backoff and a circuit breaker.', 'You fail fast, retry politely and protect your own app.', [
        ['Longer timeouts, so slow replies have time to arrive.', 'Waiting longer makes your app freeze for longer.'],
        ['Immediate retries until the partner responds again.', 'Instant retries pile more load on a failing service.'],
        ['A CDN in front of your own website\'s pages.', 'A CDN speeds up your static files. It does nothing about calls to the partner.'],
      ]),
    Q('A customer wants an AI agent to read incoming emails and update their CRM automatically. What is the most important safeguard to propose?', 3,
      'Treat emails as untrusted, limit access, and approve risky changes.', 'Treating email text as data, least privilege, and human approval address injection, access and oversight together.', [
        ['Give it admin rights so it never gets blocked.', 'A successful attack would then reach everything.'],
        ['Use a low temperature so its updates stay consistent.', 'Consistency does not stop hidden instructions in an email.'],
        ['Tell it in the prompt to ignore any instructions found in emails.', 'Prompt rules can be bypassed. You need enforced limits too.'],
      ]),
    Q('Two systems each hold a customer\'s address, with different values. Which action is best?', 0,
      'Agree on one source of truth, then sync the other from it.', 'One owner of each fact avoids endless conflicts. Fix any duplicates along the way.', [
        ['Always copy whichever value was edited most recently.', 'Newest is not always correct, and the systems may keep overwriting each other.'],
        ['Show both addresses and let staff choose each time.', 'The conflict never gets fixed and keeps causing errors.'],
        ['Cache the address so both systems always read the same copy.', 'A cache copies a value. It does not decide which value is right.'],
      ]),
    Q('A nightly import takes 6 hours and users must wait for it to finish before they can use the app. What is a good redesign?', 3,
      'Run it in the background with a queue so users keep working.', 'Slow work moves out of the user\'s path. Showing progress helps too.', [
        ['Run it on a bigger server so it finishes in five hours.', 'Faster helps a little, but users are still blocked while it runs.'],
        ['Run it only on weekends, when fewer people log in.', 'It still blocks the app whenever it runs.'],
        ['Show a progress bar while users wait for the import to finish.', 'Progress is helpful, but users are still blocked from working.'],
      ]),
  ]),
];
