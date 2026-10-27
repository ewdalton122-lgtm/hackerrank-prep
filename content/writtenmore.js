// Stage 5 extra: more written stakeholder replies. Each has a self-check list and one model reply.
// Same five-part shape as the first two: goal, fact, options, recommendation, next step.
const w = (id, title, blurb, prompt, rubric, model, extra = []) => ({
  id, title, minutes: 45, blurb,
  blocks: [
    { t: 'p', text: 'Use the same five-part shape: **acknowledge the goal**, **state the key fact** neutrally, **offer two options**, **recommend one**, **close with a next step**.' },
    ...extra,
  ],
  exercise: { kind: 'written', prompt, minWords: 60, rubric, model },
});

const goal = (re) => ({ id: 'goal', label: 'Acknowledges the stakeholder\'s goal or concern first', test: re });
const fact = (label, re) => ({ id: 'fact', label, test: re });
const options = { id: 'options', label: 'Offers at least two options', test: /option|alternatively|either|instead|versus|or we|two ways|two paths|choice/i };
const rec = { id: 'rec', label: 'Recommends one option and says why', test: /recommend|suggest|propose|prefer|i['’]d (start|go|choose|pick)|best (path|choice|option)/i };
const next = { id: 'next', label: 'Ends with a concrete next step, owner or date', test: /next step|this week|by (mon|tue|wed|thu|fri)|tomorrow|schedule|call|session|follow up|confirm/i };

export const writtenMore = [
  w('sk-scope', 'Written response: an extra request mid-project',
    'Say yes to the goal without silently saying yes to the scope.',
    'Three weeks into a six-week project, the customer\'s director emails: "Can you also build a Spanish-language version of the agent? We still want to launch on the original date." Write your reply (about 100 to 150 words).',
    [
      goal(/goal|understand|appreciate|thank|makes sense|great idea|customers who|spanish/i),
      fact('States the impact on time or effort neutrally, without blame', /time|effort|timeline|date|weeks|capacity|scope|additional|extra work|translat/i),
      options, rec, next,
    ],
    'Thank you for raising this. A Spanish-language version makes sense for your customers, and I want to help you get there.\n\nThe constraint is effort. Adding a second language means more content, more testing and review by a native speaker, which would not fit in the three weeks we have left without moving the date.\n\nTwo options. Option A: launch in English on the original date and add Spanish in a second phase two to three weeks later. Option B: move the whole launch back to include both languages.\n\nI recommend Option A. You keep your date, you learn from real English-language usage, and Spanish benefits from what we learn.\n\nNext step: can we agree the phase-two scope in a 30-minute call this week? I will send a short change summary by Thursday.',
    [{ t: 'tip', text: 'Scope questions are not a "no". They are a trade-off made visible: more scope means more time, less scope, or more people.' }]),

  w('sk-incident', 'Written response: the agent gave a wrong answer',
    'Report a mistake plainly, show control, and say what changes.',
    'Your customer\'s AI agent told a client the wrong return policy (30 days instead of 14). The customer\'s VP of Service emailed you, concerned. You found the cause: an outdated policy document was in the knowledge source. Write your reply (about 100 to 150 words).',
    [
      goal(/understand|sorry|apolog|appreciate|thank|concern|take this seriously|important/i),
      fact('States what happened and the cause, plainly and without blaming anyone', /cause|outdated|document|policy|knowledge|source|found|happened/i),
      options, rec, next,
    ],
    'Thank you for flagging this, and I am sorry for the confusion it caused your client. I understand how important accurate policy answers are.\n\nHere is what happened: the agent drew on an outdated policy document in its knowledge source, so it quoted 30 days instead of 14. The agent did what the document said; the document was wrong.\n\nTwo options. Option A: correct the document today and add a monthly review of policy content. Option B: also add a rule that policy answers always cite the document and its date, and send refund-related answers to a person to approve.\n\nI recommend both, starting with A today because it removes the error immediately, then B to prevent a repeat.\n\nNext step: I will confirm the fix by end of day tomorrow and send you the review checklist by Friday. Does that work for you?',
    [{ t: 'warn', text: 'Do not hide it, over-apologize, or blame the model or a colleague. State the cause, show the fix, and show what stops it happening again.' }]),

  w('sk-data', 'Written response: you need data you do not have',
    'Ask for what you need in a way that makes it easy to say yes.',
    'Your agent project is blocked because the customer\'s IT team has not yet shared a clean export of their product catalogue. The launch is in two weeks. Write the message you would send to your project sponsor (about 100 to 150 words).',
    [
      goal(/goal|launch|understand|appreciate|thank|momentum|excited|deadline|timeline/i),
      fact('States what is blocked and what is needed, clearly and neutrally', /catalogue|catalog|export|data|blocked|waiting|access|need/i),
      options, rec, next,
    ],
    'Thanks for your support on this. We are on track for the launch in two weeks, and I want to protect that date.\n\nThe one thing holding us back is the product catalogue export. Without it, the agent cannot answer product questions accurately.\n\nTwo options. Option A: IT sends a basic export (names, descriptions, prices) by Wednesday, and we launch with that. Option B: IT sends the full catalogue with images and stock levels, which is better but would likely move the launch by a week.\n\nI recommend Option A. It meets the date, and we can add the richer fields in the first update after launch.\n\nNext step: could you ask your IT lead to confirm by tomorrow whether Wednesday is possible? I will send them the exact field list today.',
    [{ t: 'tip', text: 'Make the ask small and specific: what, by when, in what form. A vague "we need data" gets a vague answer.' }]),

  w('sk-exec', 'Written response: a three-sentence executive update',
    'Brevity is a skill. Lead with the result.',
    'Your executive sponsor has two minutes and asks: "Where are we on the agent project?" Status: the pilot is live with 50 users, answer accuracy is 88% against a target of 90%, and the next step is adding order-status lookups. Write a short update of about 60 to 90 words.',
    [
      goal(/pilot|live|users|on track|progress|goal|target/i),
      fact('Gives the key number or status, with the target for comparison', /88|90|%|percent|target|accuracy/i),
      { id: 'options', label: 'Names the main risk or choice, even briefly', test: /risk|option|choice|trade|watch|gap|short of|below|decision/i },
      { id: 'rec', label: 'States what you will do about it', test: /recommend|plan|will|focus|propose|next|add/i },
      { id: 'next', label: 'Gives the next milestone or date', test: /next|this week|by (mon|tue|wed|thu|fri)|end of|two weeks|date|order-status|order status/i },
    ],
    'The pilot is live with 50 users and on track. Answer accuracy is 88% against our 90% target, so we are two points short, mostly on edge-case questions. The main risk is widening the rollout too early.\n\nI recommend we spend the next two weeks fixing those cases before widening the rollout, so we scale on a solid base.\n\nNext step: add order-status lookups, our top request type, by the end of the month. I will send you the updated accuracy figure on Friday.',
    [{ t: 'p', text: 'This one is **short on purpose**. Executives want the status, the number against the target, what you are doing about it, and the next date. Skip the background.' }]),
];
writtenMore[3].exercise.minWords = 40;
