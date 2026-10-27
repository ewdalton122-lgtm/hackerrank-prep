// Extra prompt-writing drills. The site checks the pasted reply for an exact match.
const d = (id, title, minutes, blurb, text, ex) => ({
  id, title, minutes, blurb,
  blocks: [{ t: 'p', text }],
  exercise: { kind: 'prompt', ...ex },
});

export const promptMore = [
  d('pe-count', 'Drill 7: count carefully', 45, 'Language models are weak at counting. Make the steps explicit.',
    'Counting and arithmetic are where models slip. State the rule precisely, give one worked example, and tell the model to check each item silently. It must still print **only** the final number, because anything else it writes is graded.', {
      task: 'Count how many words in the text have **more than 5 letters**. Output only the number.',
      cases: [
        { input: 'The quick brown foxes jumped over lazy dogs', expected: '1' },
        { input: 'Extraordinary circumstances demand preparation', expected: '4' },
        { input: 'a b c', expected: '0' },
      ],
      hints: [
        'Tell the model to check each word\'s letter count silently, one by one, before answering.',
        'But the output must be only the number. Say: "Do your thinking silently. Output only the final number."',
        'Add the rule "5 letters is NOT more than 5" and one worked example.',
      ],
    }),
  d('pe-redact', 'Drill 8: change only what you are told to', 45, 'Redact one kind of thing and keep everything else untouched.',
    'Edit tasks fail when the model "helpfully" rewrites other parts. State what to change and what must stay exactly the same, including spacing and punctuation.', {
      task: 'Replace every email address in the text with [EMAIL]. Keep everything else exactly as it is.',
      cases: [
        { input: 'Contact jane.doe@acme.com or call 555-0100.', expected: 'Contact [EMAIL] or call 555-0100.' },
        { input: 'No contact info here.', expected: 'No contact info here.' },
        { input: 'a@b.co and c@d.org', expected: '[EMAIL] and [EMAIL]' },
      ],
      hints: [
        'Say "Output the original text with only the email addresses replaced".',
        'Add "Do not change any other character, word or punctuation. Do not add quotes."',
        'Include the no-email case: "If there are no email addresses, output the text unchanged."',
      ],
    }),
  d('pe-table', 'Drill 9: reorder into a table', 50, 'Fields arrive in any order; the output has a fixed layout.',
    'Real data rarely arrives in the order you need. Name the exact column order and show a worked example where the input order is different.', {
      task: 'Convert the lines of `key: value` into CSV with a header row. The columns must always be in this order: name, role, region.',
      cases: [
        { input: 'name: Ben\nrole: DS\nregion: West', expected: 'name,role,region\nBen,DS,West' },
        { input: 'region: East\nname: Cy\nrole: FDE', expected: 'name,role,region\nCy,FDE,East' },
      ],
      hints: [
        'Say "First line: name,role,region. Second line: the three values in that same order, separated by commas with no spaces."',
        'Point out that the input lines can come in any order, so the model must reorder them.',
        'Add one example where the input starts with region and show the correct output.',
      ],
    }),
];
