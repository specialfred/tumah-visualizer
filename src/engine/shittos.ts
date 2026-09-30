// Disputes (מחלוקות) the engine is parameterized by. Rules read the selected option with
// `shitah(ctx, id)`; the UI builds its selectors from this catalog.
import type { ShittosSelection, Text } from './types';

export interface ShitahOption {
  id: string;
  label: Text;
  summary: Text;
}

export interface Dispute {
  id: string;
  ref: string;
  topic: Text;
  options: ShitahOption[];
  /** The option followed by default: the halacha per Bartenura where he rules, else the tanna kamma. */
  defaultOption: string;
  /** Whether the engine reads this dispute yet. Unmodeled disputes are listed for coverage. */
  modeled: boolean;
}

const o = (id: string, en: string, he: string, summary: string): ShitahOption => ({
  id,
  label: { en, he },
  summary: { en: summary },
});

export const DISPUTES: Dispute[] = [
  {
    id: 'chain-fifth',
    ref: '1:3',
    topic: { en: 'Does a tent over the corpse add a link to the chain?', he: 'אהל ויתד' },
    options: [
      o('chachamim', 'Sages', 'חכמים', 'The tent does not count; a peg fixed in it is one with it.'),
      o('akiva', 'Rabbi Akiva', 'רבי עקיבא', 'The tent counts, giving a fifth link.'),
    ],
    defaultOption: 'chachamim',
    modeled: true,
  },
  {
    id: 'wall-halves',
    ref: '6:3',
    topic: { en: 'Tumah inside a wall that serves a house', he: 'כותל המשמש את הבית' },
    options: [
      o('chachamim', 'Sages', 'חכמים', 'Halves; tumah in the exact middle defiles the house but not what is above.'),
      o('meir', 'Rabbi Meir', 'רבי מאיר', 'Halves; tumah in the exact middle defiles the house and what is above.'),
      o('yehuda', 'Rabbi Yehuda', 'רבי יהודה', 'The whole wall belongs to the house.'),
    ],
    defaultOption: 'chachamim',
    modeled: true,
  },
  {
    id: 'plaster-halves',
    ref: '6:4',
    topic: { en: 'Tumah inside the plaster between a house and its upper story', he: 'מעזיבה' },
    options: [
      o('tanna-kamma', 'Tanna kamma', 'תנא קמא', 'Halves: the nearer story; the middle defiles both.'),
      o('yehuda', 'Rabbi Yehuda', 'רבי יהודה', 'All of the plaster belongs to the upper story.'),
    ],
    defaultOption: 'tanna-kamma',
    modeled: true,
  },
  {
    id: 'pillar-capital',
    ref: '6:7',
    topic: { en: 'Vessels under the capital of a pillar with tumah beneath it', he: 'כלים שתחת הפרח' },
    options: [
      o('tanna-kamma', 'Tanna kamma', 'תנא קמא', 'Tahor: the tumah breaks straight up and down through the pillar.'),
      o('yochanan-ben-nuri', 'Rabbi Yochanan ben Nuri', 'רבי יוחנן בן נורי', 'Tamei: the capital is like the pillar, so the tumah comes back down on what it overshadows.'),
    ],
    defaultOption: 'tanna-kamma',
    modeled: true,
  },
  {
    id: 'split-tumah',
    ref: '10:3',
    topic: { en: 'Tumah partly under a roof and partly under an open hatch', he: 'מקצת טומאה בבית ומקצתה תחת הארובה' },
    options: [
      o('meir', 'Rabbi Meir', 'רבי מאיר', 'The house and what is directly above the tumah are both tamei.'),
      o('yehuda', 'Rabbi Yehuda', 'רבי יהודה', 'The house is tamei; what is above the tumah is tahor.'),
      o(
        'yose',
        'Rabbi Yose',
        'רבי יוסי',
        'Both are tamei only if the tumah is large enough to be split into two full measures; otherwise only the house.',
      ),
    ],
    defaultOption: 'yose',
    modeled: true,
  },
  {
    id: 'adam-chalul',
    ref: '11:3',
    topic: { en: 'Does a person lying down make a tent?', he: 'אדם חלול' },
    options: [
      o('beis-hillel', 'Beis Hillel', 'בית הלל', 'A person is hollow: his upper side brings the tumah.'),
      o('beis-shammai', 'Beis Shammai', 'בית שמאי', 'A person is not hollow: tumah does not pass through his body.'),
    ],
    defaultOption: 'beis-hillel',
    modeled: true,
  },
  {
    id: 'drawer-halves',
    ref: '4:2',
    topic: { en: 'A drawer with a tefach space but a small opening', he: 'חלון המגדל' },
    options: [
      o('tanna-kamma', 'Tanna kamma', 'תנא קמא', 'Tumah inside goes out and defiles the house.'),
      o('yose', 'Rabbi Yose', 'רבי יוסי', 'The house stays tahor, since the tumah can be removed in halves or burnt in place.'),
    ],
    defaultOption: 'tanna-kamma',
    modeled: true,
  },
  {
    id: 'natural-ohel',
    ref: '3:7',
    topic: { en: 'Is a tent not made by people a tent?', he: 'אהל שאינו עשוי בידי אדם' },
    options: [
      o('tanna-kamma', 'Tanna kamma', 'תנא קמא', 'Yes: a cavity carved by water, creatures or salt is a tent.'),
      o('yehuda', 'Rabbi Yehuda', 'רבי יהודה', 'No, except for clefts and crags.'),
    ],
    defaultOption: 'tanna-kamma',
    modeled: false,
  },
  {
    id: 'overlap-less-than-tefach',
    ref: '14:5',
    topic: { en: 'Two projections overlapping by less than a tefach', he: 'זיזים זה על גב זה' },
    options: [
      o('yehoshua', 'Rabbi Yehoshua', 'רבי יהושע', 'Tumah between them does not reach what is under the lower one.'),
      o('eliezer', 'Rabbi Eliezer', 'רבי אליעזר', 'Tumah between them reaches what is under and between them.'),
    ],
    defaultOption: 'yehoshua',
    modeled: false,
  },
  {
    id: 'pot-over-hatch',
    ref: '5:2',
    topic: { en: 'A perforated pot over a hatch', he: 'קדרה על פי ארובה' },
    options: [
      o('beis-hillel', 'Beis Hillel', 'בית הלל', 'The pot is tamei; the upper story is tahor.'),
      o('beis-shammai', 'Beis Shammai', 'בית שמאי', 'All is tamei.'),
      o('akiva', 'Rabbi Akiva', 'רבי עקיבא', 'All is tahor.'),
    ],
    defaultOption: 'beis-hillel',
    modeled: false,
  },
];

export const DISPUTES_BY_ID: Record<string, Dispute> = Object.fromEntries(DISPUTES.map((d) => [d.id, d]));

export function defaultShittos(): ShittosSelection {
  return Object.fromEntries(DISPUTES.map((d) => [d.id, d.defaultOption]));
}

export function shitah(selection: ShittosSelection, id: string): string {
  return selection[id] ?? DISPUTES_BY_ID[id]?.defaultOption ?? '';
}
