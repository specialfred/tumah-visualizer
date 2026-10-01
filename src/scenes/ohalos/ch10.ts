import { box, container, kezayis, kli, room, solid } from '../../engine/build';
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

// 10:6 — an earthenware pot under a hatch (4×4) in the roof of a house, smaller than the hatch, so
// that if raised it would pass through. It stands on the floor, or a tefach up. The tumah is under
// it, inside it, over it (in the hatch), or elsewhere in the house.
type PotTumah = 'below' | 'within' | 'above' | 'house';
const SMALL: [number, number, number] = [0.25, 0.25, 0.25];
function potUnderHatch(raised: boolean, where: PotTumah): SceneObject[] {
  const z = raised ? 1 : 0.25;
  const at: Record<PotTumah, [number, number, number]> = {
    below: [3.75, 3.75, 0],
    within: [3.75, 3.75, z + 0.25],
    above: [3.75, 3.75, z + 2.5],
    house: [6.5, 0.5, 0],
  };
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], hatches: [[2, 2, 4, 4]], openings: [{ side: 'y-', offset: 0.5, width: 1.5, height: 4 }] }),
    container({ id: 'pot', label: { en: 'Earthenware pot', he: 'קדרה' }, material: 'earthenware', at: [3, 3, z], size: [2, 2, 2] }),
    kezayis('tumah', at[where], 1, [0.5, 0.5, 0.25]),
    ...(where === 'within' ? [] : [kli('kli-in', [3.5, 3.5, z + 0.25], 'Vessel in the pot, not in line with the tumah', SMALL)]),
    kli('kli-above', [4.5, 4.5, 8], 'Vessel above the hatch', SMALL),
    kli('kli-house', [0.5, 6.5, 0], 'Vessel in the house'),
    ...(raised && where !== 'below' ? [kli('kli-under', [4.5, 4.5, 0], 'Vessel under the pot', SMALL)] : []),
  ];
}

// 10:7 — the same pot outside a doorway (2 wide, 4 high), on the floor or a tefach up. Its mouth is
// outside; its wide base reaches in under the lintel, a tefach or less (Bartenura).
function potAtThreshold(raised: boolean, under: number, where: PotTumah): SceneObject[] {
  const z = raised ? 1 : 0.25;
  const pot = container({ id: 'pot', label: { en: 'Earthenware pot', he: 'קדרה' }, material: 'earthenware', at: [3, -4, z], size: [2, 2.5, 2] });
  pot.parts.push(box([3, -1.5, z], [2, 0.5 + under, 0.5]));
  const at: Record<PotTumah, [number, number, number]> = {
    below: [3.75, -2.75, 0],
    within: [3.75, -2.75, z + 0.25],
    above: [3.75, -2.75, z + 2.5],
    house: [6.5, 4.5, 0],
  };
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4 }] }),
    pot,
    kezayis('tumah', at[where], 1, [0.5, 0.5, 0.25]),
    ...(where === 'within' ? [] : [kli('kli-in', [3.5, -3.5, z + 0.25], 'Vessel in the pot', SMALL)]),
    kli('kli-above', [4.5, -3.25, z + 3], 'Vessel above the pot', SMALL),
    kli('kli-house', [0.5, 4.5, 0], 'Vessel in the house'),
    ...(raised && where !== 'below' ? [kli('kli-under', [4.5, -3.5, 0], 'Vessel under the pot', SMALL)] : []),
  ];
}

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
  ...hatchStackScenarios(),
  ...potScenarios(),
];

function potScenarios(): Scenario[] {
  const cleaves = 'If there is uncleanness below, within or above [the pot], the uncleanness cleaves upwards and downwards.';
  const asIfHatch =
    'Bartenura: the pot, a tefach up, protects together with the walls of the tent. But it is smaller than the hatch, and the engine does not join the space under it to the house across the open hatch; this needs a way to see the pot as stopping up the hatch (DESIGN tension 8).';
  return [
    ...(['below', 'within', 'above'] as const).map(
      (w): Scenario => ({
        id: `10:6/floor/${w}`,
        ref: '10:6',
        title: { en: `A pot on the floor under a hatch — tumah ${w === 'below' ? 'under' : w === 'within' ? 'inside' : 'over'} it`, he: 'ארובה וקדרה נתונה תחתיה' },
        clause: { en: cleaves },
        notes:
          w === 'within'
            ? 'The house stays tahor: the pot is under the open hatch.'
            : 'Bartenura: the pot cannot become tamei from outside, but tumah breaking into it does make it tamei, and everything in it, even what is not in line with the tumah.',
        scene: () => ({ objects: potUnderHatch(false, w) }),
        expect: w === 'within' ? { 'kli-house': 'tahor' } : { 'kli-house': 'tahor', 'kli-in': 'tamei' },
      }),
    ),
    {
      id: '10:6/raised/below',
      ref: '10:6',
      title: { en: 'A pot a tefach up under a hatch — tumah under it' },
      clause: { en: 'If there is uncleanness below it or in the house, what is below it and in the house becomes unclean, but what is within [the pot] or above it, remains clean.' },
      status: 'pending',
      notes: asIfHatch,
      scene: () => ({ objects: potUnderHatch(true, 'below') }),
      expect: { 'kli-house': 'tamei', 'kli-in': 'tahor', 'kli-above': 'tahor' },
    },
    {
      id: '10:6/raised/within',
      ref: '10:6',
      title: { en: 'A pot a tefach up under a hatch — tumah inside it' },
      clause: { en: '[If the uncleanness is] within or above [the pot], everything becomes unclean.' },
      status: 'pending',
      notes: asIfHatch,
      scene: () => ({ objects: potUnderHatch(true, 'within') }),
      expect: { 'kli-house': 'tamei', 'kli-under': 'tamei', 'kli-above': 'tamei' },
    },
    ...(['below', 'within', 'above'] as const).map(
      (w): Scenario => ({
        id: `10:7/floor/${w}`,
        ref: '10:7',
        title: { en: `A pot on the floor by the threshold, reaching a tefach under the lintel — tumah ${w === 'below' ? 'under' : w === 'within' ? 'inside' : 'over'} it`, he: 'קדרה בצד האסקופה' },
        clause: { en: cleaves },
        notes: 'The tumah is outside the line of the lintel, so the house stays tahor (Bartenura).',
        scene: () => ({ objects: potAtThreshold(false, 1, w) }),
        expect: w === 'within' ? { 'kli-house': 'tahor' } : { 'kli-house': 'tahor', 'kli-in': 'tamei' },
      }),
    ),
    {
      id: '10:7/raised/below',
      ref: '10:7',
      title: { en: 'A pot a tefach up by the threshold, a tefach under the lintel — tumah under it' },
      clause: { en: 'If there is uncleanness below it or in the house, what is below it and in the house becomes unclean.' },
      notes: 'The pot is a tent reaching a tefach in under the lintel, so it brings the tumah into the house. Its inside and what is on it are protected: earthenware does not become tamei from outside (Bartenura).',
      scene: () => ({ objects: potAtThreshold(true, 1, 'below') }),
      expect: { 'kli-house': 'tamei', 'kli-in': 'tahor', 'kli-above': 'tahor' },
    },
    {
      id: '10:7/raised/house',
      ref: '10:7',
      title: { en: 'A pot a tefach up by the threshold — tumah in the house' },
      clause: { en: 'If there is uncleanness below it or in the house, what is below it and in the house becomes unclean.' },
      scene: () => ({ objects: potAtThreshold(true, 1, 'house') }),
      expect: { 'kli-under': 'tamei', 'kli-in': 'tahor', 'kli-above': 'tahor' },
    },
    ...(['within', 'above'] as const).map(
      (w): Scenario => ({
        id: `10:7/raised/${w}`,
        ref: '10:7',
        title: { en: `A pot a tefach up by the threshold — tumah ${w === 'within' ? 'inside' : 'over'} it` },
        clause: { en: 'If the uncleanness is within or above [the pot], everything becomes unclean.' },
        notes: 'The pot becomes tamei and no longer protects; the tumah in it comes down under it and into the house (Bartenura).',
        scene: () => ({ objects: potAtThreshold(true, 1, w) }),
        expect: { 'kli-house': 'tamei', 'kli-under': 'tamei', 'kli-above': 'tamei' },
      }),
    ),
    {
      id: '10:7/short/below',
      ref: '10:7',
      title: { en: 'A pot a tefach up by the threshold, less than a tefach under the lintel — tumah under it' },
      clause: { en: '[In the case where the pot] if raised would not touch the lintel over a [space of a square] handbreadth... if there is uncleanness below it, nothing is unclean except what is below [the pot].' },
      status: 'pending',
      notes: 'The engine joins the space under the pot to the doorway wherever their roofs meet; the mishna asks for a tefach under both (DESIGN tension 14).',
      scene: () => ({ objects: potAtThreshold(true, 0.5, 'below') }),
      expect: { 'kli-house': 'tahor' },
    },
  ];
}

/** Tumah straddling the edge of a one-tefach hatch, with a vessel held above the hatch over it. */
function splitScene(amount: number): SceneObject[] {
  return hatchHouse(1, [
    kezayis('tumah', [2.5, 3.25, 0], amount, [1, 0.5, 0.25]),
    kli('kli-house', [6, 6, 0], 'Vessel in the house'),
    kli('kli-above', [3.125, 3.375, 9], 'Vessel above the hatch, over the tumah', [0.25, 0.25, 0.25]),
  ]);
}

// 10:4–10:5 — a house with an upper story over it. The upper story's floor has a hatch, and its
// roof has another directly above it. Something may stop up one of the hatches: a wooden board,
// which can become tamei, or a stone, which cannot.
type Plug = 'none' | 'board-upper' | 'board-lower' | 'stone-upper' | 'stone-lower';
function hatchStack(hatch: number, tumahUnder: boolean, plug: Plug): SceneObject[] {
  const c = 3 + hatch / 2 - 0.125;
  const plugAt = (upper: boolean): [number, number, number] => [3, 3, upper ? 13 : 6];
  const plugs: SceneObject[] = [];
  if (plug.startsWith('board'))
    plugs.push(solid('plug', { en: 'Wooden board in the hatch', he: 'דבר המקבל טומאה' }, 'vessel', 'wood', plugAt(plug.endsWith('upper')), [hatch, hatch, 0.25]));
  if (plug.startsWith('stone'))
    plugs.push(solid('plug', { en: 'Stone in the hatch', he: 'דבר שאינו מקבל טומאה' }, 'misc', 'stone', plugAt(plug.endsWith('upper')), [hatch, hatch, 0.25]));
  return [
    ...plugs,
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], hatches: [[3, 3, hatch, hatch]], openings: [{ side: 'y-', offset: 5, width: 2, height: 4 }] }),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, 7], size: [8, 8, 6], hatches: [[3, 3, hatch, hatch]], openings: [{ side: 'y-', offset: 5, width: 2, height: 4 }] }),
    tumahUnder ? kezayis('tumah', [c, c, 0], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [6, 6, 0]),
    ...(tumahUnder ? [] : [kli('kli-under', [c, c, 0], 'Vessel directly under the hatches', [0.25, 0.25, 0.25])]),
    kli('kli-house', [1, 1, 0], 'Vessel in the house'),
    kli('kli-upper', [1, 1, 7], 'Vessel in the upper story'),
  ];
}

function hatchStackScenarios(): Scenario[] {
  const plugName: Record<Plug, string> = {
    none: '',
    'board-upper': ', a board in the upper hatch',
    'board-lower': ', a board in the lower hatch',
    'stone-upper': ', a stone in the upper hatch',
    'stone-lower': ', a stone in the lower hatch',
  };
  const s = (
    ref: '10:4' | '10:5',
    tumahUnder: boolean,
    plug: Plug,
    clause: string,
    expect: Scenario['expect'],
    extra: Partial<Scenario> = {},
  ): Scenario => {
    const hatch = ref === '10:4' ? 1 : 0.75;
    return {
      id: `${ref}/${tumahUnder ? 'tumah-under' : 'tumah-in-house'}/${plug}`,
      ref,
      title: {
        en: `Hatches one above another${ref === '10:4' ? ', a tefach wide' : ', less than a tefach'} — tumah ${tumahUnder ? 'under them' : 'in the house'}${plugName[plug]}`,
        he: 'ארובות זו על גב זו',
      },
      clause: { en: clause },
      scene: () => ({ objects: hatchStack(hatch, tumahUnder, plug) }),
      expect,
      ...extra,
    };
  };
  const asIfUpper =
    'Bartenura: something that can become tamei does not block, so it is seen as if it stopped up the upper hatch. The engine lets the tumah fill the board and rise through the open hatch above it, but does not yet carry it into the upper story around that hatch.';
  return [
    s('10:4', false, 'none', 'If there is uncleanness in the house, what is directly [below] the hatchways remains clean.', { 'kli-under': 'tahor', 'kli-house': 'tamei', 'kli-upper': 'tahor' }),
    s('10:4', true, 'none', 'If the uncleanness is directly [below] the hatchways, the house remains clean.', { 'kli-house': 'tahor', 'kli-upper': 'tahor' }),
    s('10:4', false, 'board-upper', 'If something susceptible to uncleanness was placed either in the upper or the lower [hatchway], everything becomes unclean.', { 'kli-under': 'tamei', 'kli-house': 'tamei', 'kli-upper': 'tamei' }),
    s('10:4', true, 'board-upper', 'If something susceptible to uncleanness was placed either in the upper or the lower [hatchway], everything becomes unclean.', { 'kli-house': 'tamei', 'kli-upper': 'tamei' }),
    s('10:4', false, 'board-lower', 'If something susceptible to uncleanness was placed either in the upper or the lower [hatchway], everything becomes unclean.', { 'kli-under': 'tamei', 'kli-house': 'tamei', 'kli-upper': 'tamei' }),
    s('10:4', false, 'stone-lower', 'If the article is insusceptible to uncleanness, what is below becomes unclean, but what is above remains clean.', { 'kli-under': 'tamei', 'kli-house': 'tamei', 'kli-upper': 'tahor' }),
    s('10:4', false, 'stone-upper', 'If the article is insusceptible to uncleanness, what is below becomes unclean, but what is above remains clean.', { 'kli-under': 'tamei', 'kli-house': 'tamei', 'kli-upper': 'tamei' }),
    s('10:5', false, 'none', 'If there is uncleanness in the house, what is directly [below] the hatchways remains clean.', { 'kli-under': 'tahor', 'kli-house': 'tamei' }),
    s('10:5', true, 'none', 'If there is uncleanness directly [below] the hatchways, the house remains clean.', { 'kli-house': 'tahor', 'kli-upper': 'tahor' }),
    ...(['board-upper', 'board-lower', 'stone-upper', 'stone-lower'] as const).map((p) =>
      s('10:5', false, p, 'Where the uncleanness is in the house, if an article whether susceptible to uncleanness or insusceptible was placed either in the upper or the lower [hatchway], nothing becomes unclean except the lower story.', { 'kli-house': 'tamei', 'kli-upper': 'tahor' }),
    ),
    ...(['board-upper', 'board-lower'] as const).map((p) =>
      s('10:5', true, p, 'Where the uncleanness is directly [below] the hatchways, if an article susceptible to uncleanness was placed either in the upper or lower [hatchway], everything becomes unclean.', { 'kli-house': 'tamei', 'kli-upper': 'tamei' }),
    ),
    ...(['stone-upper', 'stone-lower'] as const).map((p) =>
      s('10:5', true, p, 'If the article is insusceptible to uncleanness, whether [it is placed] in the upper or lower [hatchway], nothing becomes unclean except the lower story.', { 'kli-house': 'tamei', 'kli-upper': 'tahor' }),
    ),
  ].map((x) => (x.id.endsWith('/board-lower') && x.expect['kli-upper'] === 'tamei' ? { ...x, notes: asIfUpper, status: 'pending' as const } : x));
}
