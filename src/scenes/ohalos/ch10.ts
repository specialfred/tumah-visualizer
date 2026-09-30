import { kezayis, kli, room, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 10:1–10:3 — a house (8×8×6) with a hatch (ארובה) in the roof at (3, 3).
function hatchHouse(hatch: number, extra: SceneObject[]): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], hatches: [[3, 3, hatch, hatch]] }),
    ...extra,
  ];
}

/** A small vessel standing on the floor directly under the middle of the hatch. */
const underHatch = (hatch: number) => kli('kli-under-hatch', [3 + hatch / 2 - 0.125, 3 + hatch / 2 - 0.125, 0], 'Vessel directly under the hatch', [0.25, 0.25, 0.25]);
const tumahUnderHatch = (hatch: number) => kezayis('tumah', [3 + hatch / 2 - 0.125, 3 + hatch / 2 - 0.125, 0], 1, [0.25, 0.25, 0.25]);
/** A foot placed over the hatch on the roof. */
const foot = (hatch: number) => solid('foot', { en: 'A foot over the hatch', he: 'רגלו' }, 'person', 'flesh', [2.75, 2.75, 7], [hatch + 0.5, hatch + 0.5, 0.5]);

export const ch10: Scenario[] = [
  {
    id: '10:1/tumah-in-house',
    ref: '10:1',
    title: { en: 'Hatch of a tefach — tumah in the house', he: 'ארובה שבבית ויש בה פותח טפח' },
    clause: { en: 'If there is uncleanness in the house, what is directly [below] the hatchway remains clean.' },
    scene: () => ({ objects: hatchHouse(1, [kezayis('tumah', [6, 6, 0]), underHatch(1), kli('kli-house', [1, 1, 0], 'Vessel in the house')]) }),
    expect: { 'kli-under-hatch': 'tahor', 'kli-house': 'tamei' },
  },
  {
    id: '10:1/tumah-under-hatch',
    ref: '10:1',
    title: { en: 'Hatch of a tefach — tumah directly under it' },
    clause: { en: 'If the uncleanness is directly [below] the hatchway, the house remains clean.' },
    scene: () => ({ objects: hatchHouse(1, [tumahUnderHatch(1), kli('kli-house', [1, 1, 0], 'Vessel in the house')]) }),
    expect: { 'kli-house': 'tahor' },
  },
  {
    id: '10:1/foot-over-hatch',
    ref: '10:1',
    title: { en: 'Hatch of a tefach — a foot placed over it' },
    clause: { en: 'If the uncleanness is either in the house or directly [below] the hatchway, and a person placed his foot above [the hatchway] he has combined [with the roof to bring] uncleanness.' },
    scene: () => ({ objects: hatchHouse(1, [tumahUnderHatch(1), kli('kli-house', [1, 1, 0], 'Vessel in the house'), foot(1)]) }),
    expect: { 'kli-house': 'tamei', foot: 'tamei' },
  },
  {
    id: '10:2/tumah-in-house',
    ref: '10:2',
    title: { en: 'Hatch smaller than a tefach — tumah in the house', he: 'אין בה פותח טפח' },
    clause: { en: 'If there is uncleanness in the house, what is directly [below] the hatchway remains clean.' },
    scene: () => ({ objects: hatchHouse(0.75, [kezayis('tumah', [6, 6, 0]), underHatch(0.75)]) }),
    expect: { 'kli-under-hatch': 'tahor' },
  },
  {
    id: '10:2/tumah-under-hatch',
    ref: '10:2',
    title: { en: 'Hatch smaller than a tefach — tumah directly under it' },
    clause: { en: 'If the uncleanness is directly [below] the hatchway, the house remains clean.' },
    scene: () => ({ objects: hatchHouse(0.75, [tumahUnderHatch(0.75), kli('kli-house', [1, 1, 0], 'Vessel in the house')]) }),
    expect: { 'kli-house': 'tahor' },
  },
  {
    id: '10:2/foot/tumah-in-house',
    ref: '10:2',
    title: { en: 'Hatch smaller than a tefach — foot over it, tumah in the house' },
    clause: { en: 'When the uncleanness is in the house, if he placed his leg above [the hatchway], he remains clean.' },
    scene: () => ({ objects: hatchHouse(0.75, [kezayis('tumah', [6, 6, 0]), foot(0.75)]) }),
    expect: { foot: 'tahor' },
  },
  ...(['meir', 'yehuda', 'yose'] as const).flatMap((s): Scenario[] => [
    {
      id: `10:3/split/${s}`,
      ref: '10:3',
      title: { en: `Tumah partly under the roof and partly under the hatch — ${s === 'meir' ? 'Rabbi Meir' : s === 'yehuda' ? 'Rabbi Yehuda' : 'Rabbi Yose, one measure'}`, he: 'מקצת טומאה בבית ומקצתה תחת הארובה' },
      clause: {
        en:
          s === 'meir'
            ? 'The house becomes unclean, and what is directly [above] the uncleanness becomes unclean, the words of Meir.'
            : s === 'yehuda'
              ? 'Rabbi Judah says: the house becomes unclean but what is directly [above] the uncleanness remains clean.'
              : 'Rabbi Yose says: ...if not, the house becomes unclean but what is directly [above] the uncleanness remains clean.',
      },
      shittos: { 'split-tumah': s },
      scene: () => ({ objects: splitScene(1) }),
      expect: { 'kli-house': 'tamei', 'kli-above': s === 'meir' ? 'tamei' : 'tahor' },
    },
  ]),
  {
    id: '10:3/split/yose-two-measures',
    ref: '10:3',
    title: { en: 'Tumah partly under the hatch — Rabbi Yose, enough for two measures' },
    clause: { en: 'Rabbi Yose says: if there is sufficient of the uncleanness for it to be divided so that [one part] defiles the house and [the other part] defiles what is directly [above] the uncleanness, [both spaces] become unclean.' },
    shittos: { 'split-tumah': 'yose' },
    scene: () => ({ objects: splitScene(2) }),
    expect: { 'kli-house': 'tamei', 'kli-above': 'tamei' },
  },
];

/** Tumah straddling the edge of a one-tefach hatch, with a vessel held above the hatch over it. */
function splitScene(amount: number): SceneObject[] {
  return hatchHouse(1, [
    kezayis('tumah', [2.5, 3.25, 0], amount, [1, 0.5, 0.25]),
    kli('kli-house', [6, 6, 0], 'Vessel in the house'),
    kli('kli-above', [3.125, 3.375, 9], 'Vessel above the hatch, over the tumah', [0.25, 0.25, 0.25]),
  ]);
}
