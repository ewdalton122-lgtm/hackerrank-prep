// Shared self-check rules for written replies. They look for the phrases a strong reply uses,
// and they are deliberately strict enough that a rude or evasive reply does not pass.
export const RB = {
  options: {
    id: 'options', label: 'Offers at least two options',
    test: /\b(two (options|ways|paths|choices|approaches)|options? (a|b|one|two|1|2)\b|one option|(first|second|another|other) (option|path|choice|approach)|plan (a|b)\b|alternatively|either\b[^.?!]{1,120}\bor\b)/i,
  },
  rec: {
    id: 'rec', label: 'Recommends one option and says why',
    test: /\b(i recommend|i(?:'|’)d recommend|i would recommend|we recommend|my recommendation|my suggestion|i suggest|i would suggest|i(?:'|’)d go with|i(?:'|’)d suggest|i propose|my advice|i(?:'|’)d (start|go|choose|pick)|i would (start|go with|choose|pick)|i prefer|the best (path|option|choice) is)\b/i,
  },
  next: {
    id: 'next', label: 'Ends with a concrete next step, owner or date',
    test: /\b(next step|this week|next week|tomorrow|today|(mon|tues|wednes|thurs|fri)day|by (the )?end of|schedule|set up a|book a|meet|follow up|\d+-minute|\d+ minutes)\b/i,
  },
  noBlame: {
    id: 'tone', label: 'Stays respectful: no blame, no "told you so"',
    test: /^(?![\s\S]*\b(your fault|not our fault|you caused|your team caused|caused this mess|a mess|overpromised|told you so|as i told you|blame (you|your|them))\b)/i,
  },
};
