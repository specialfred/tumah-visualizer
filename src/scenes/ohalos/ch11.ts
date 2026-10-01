import { box, boxesMinus, kezayis, kli, room, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 11:1 — a house split in two by a crack a quarter-tefach wide running through its roof and walls.
function splitHouse(tumahOuter: boolean): SceneObject[] {
  const [house, ...rest] = room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'x-', offset: 2, width: 2, height: 4 }] });
  const crack = box([4, -1, 0], [0.25, 8, 7]);
  return [
    { ...house, label: { en: 'Split house', he: 'בית שנסדק' }, parts: boxesMinus(house.parts, [crack]) },
    ...rest,
    kezayis('tumah', tumahOuter ? [1, 3, 0] : [6, 3, 0]),
    kli('v-outer', [2, 1, 0], 'Vessel in the outer part'),
    kli('v-inner', [6, 1, 0], 'Vessel in the inner part'),
  ];
}

// 11:2 — a portico (a roof on pillars) split across its roof.
function splitPortico(leg: boolean): SceneObject[] {
  const pillar = (id: string, x: number, y: number) => solid(id, 'Pillar', 'structure', 'stone', [x, y, 0], [1, 1, 6]);
  const roof = box([0, 0, 6], [10, 6, 1]);
  const crack = box([5, 0, 6], [0.25, 6, 1]);
  return [
    { id: 'portico', label: { en: 'Split portico', he: 'אכסדרה שנסדקה' }, kind: 'structure', material: 'stone', parts: boxesMinus([roof], [crack]) },
    pillar('p1', 0, 0),
    pillar('p2', 9, 0),
    pillar('p3', 0, 5),
    pillar('p4', 9, 5),
    kezayis('tumah', [2, 3, 0]),
    kli('v-far', [8, 3, 0], 'Vessel on the other side of the split'),
    ...(leg ? [solid('leg', { en: 'A leg across the split', he: 'רגלו' }, 'person', 'flesh', [4.5, 2.5, 7], [1.25, 1, 0.5])] : []),
  ];
}

// 11:3 — a long portico (24×8, six tefachim high) split across its roof, with tumah under one
// half and a vessel under the other. Something lies on the floor across the split.
type UnderSplit = 'cloak-low' | 'cloak-raised' | 'person';
function longPortico(under: UnderSplit): SceneObject[] {
  const roof = box([0, 0, 6], [24, 8, 1]);
  const crack = box([12, 0, 6], [0.25, 8, 1]);
  const pillar = (id: string, x: number, y: number) => solid(id, 'Pillar', 'structure', 'stone', [x, y, 0], [1, 1, 6]);
  const stone = (id: string, x: number, y: number, h: number) => solid(id, 'Stone', 'misc', 'stone', [x, y, 0], [0.5, 0.5, h]);
  const across: SceneObject[] =
    under === 'person'
      ? [
          solid('person', { en: 'A person lying across the split', he: 'אדם נתון שם' }, 'person', 'flesh', [3, 1, 0], [18, 6, 2]),
        ]
      : [
          solid('cloak', { en: 'Thick woolen cloak across the split', he: 'סגוס עבה' }, 'vessel', 'cloth', [10, 2, under === 'cloak-low' ? 0.5 : 1], [4, 4, 0.25]),
          ...[
            [10, 2],
            [13.5, 2],
            [10, 5.5],
            [13.5, 5.5],
          ].map(([x, y], n) => stone(`stone${n + 1}`, x, y, under === 'cloak-low' ? 0.5 : 1)),
        ];
  return [
    { id: 'portico', label: { en: 'Split portico', he: 'אכסדרה שנסדקה' }, kind: 'structure', material: 'stone', parts: boxesMinus([roof], [crack]) },
    pillar('p1', 0, 0),
    pillar('p2', 23, 0),
    pillar('p3', 0, 7),
    pillar('p4', 23, 7),
    ...across,
    kezayis('tumah', [1.5, 3.75, 0], 1, [0.25, 0.25, 0.25]),
    kli('v-far', [22, 3.75, 0], 'Vessel on the other side of the split', [0.25, 0.25, 0.25]),
  ];
}

// 11:4 — a house with a window two tefachim square; a person inside leans out of it, over a
// corpse being carried past in the open below.
function leaningOut(): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [
      { side: 'y-', offset: 3, width: 2, height: 2, sill: 2 },
      { side: 'x-', offset: 2, width: 2, height: 4 },
    ] }),
    {
      id: 'person',
      label: { en: 'A person leaning out of the window', he: 'הניבט מן החלון' },
      kind: 'person',
      material: 'flesh',
      // Legs standing inside the house, body out through the window.
      parts: [box([3.25, 0.5, 0], [1.5, 1.5, 2.25]), box([3.25, -4, 2.25], [1.5, 6, 1.5])],
    },
    solid('tumah', { en: 'Corpse carried past', he: 'המת' }, 'tumah', 'flesh', [-4, -4, 0], [18, 2.5, 1.5], { tumah: { kind: 'meis' } }),
    kli('v-house', [6, 4, 0], 'Vessel in the house'),
  ];
}

// 11:4 — where Beis Shammai agree: the person leaning out is dressed, his cloak hanging loose a
// tefach below his body, or a second person leans out beneath him, a tefach lower. The window is
// taller here (3 tefachim, a tefach off the floor) so there is room for both.
function leaningOutAgreed(what: 'dressed' | 'two'): SceneObject[] {
  const lower: SceneObject =
    what === 'dressed'
      ? {
          id: 'cloak',
          label: { en: 'His cloak, hanging loose below him', he: 'לבוש בכליו' },
          kind: 'vessel',
          material: 'cloth',
          parts: [box([3, -4, 1.25], [2, 4.5, 0.25]), box([3, -4, 1.5], [0.25, 4.5, 1]), box([4.75, -4, 1.5], [0.25, 4.5, 1])],
        }
      : solid('person2', { en: 'A second person leaning out below him', he: 'שנים זה על גבי זה' }, 'person', 'flesh', [3.25, -4, 1.25], [1.5, 4.25, 0.5]);
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [
      { side: 'y-', offset: 3, width: 2, height: 3, sill: 1 },
      { side: 'x-', offset: 2, width: 2, height: 4 },
    ] }),
    {
      id: 'person',
      label: { en: 'A person leaning out of the window', he: 'הניבט מן החלון' },
      kind: 'person',
      material: 'flesh',
      parts: [box([3.25, 0.5, 1], [1.5, 1.5, what === 'dressed' ? 1.5 : 1.75]), box([3.25, -4, what === 'dressed' ? 2.5 : 2.75], [1.5, 6, 1.25])],
    },
    lower,
    solid('tumah', { en: 'Corpse carried past', he: 'המת' }, 'tumah', 'flesh', [-4, -4, 0], [18, 2.5, 0.75], { tumah: { kind: 'meis' } }),
    kli('v-house', [6, 4, 0], 'Vessel in the house'),
  ];
}

// 11:5–11:6 — a person lying on the threshold of an open doorway, half in the house and half out.
function onThreshold(tumahInHouse: boolean): SceneObject[] {
  const out: SceneObject[] = [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], openings: [{ side: 'y-', offset: 1, width: 6, height: 4 }] }),
    solid('person', { en: 'A person lying on the threshold', he: 'מוטל על האסקופה' }, 'person', 'flesh', [1, -6, 0], [6, 12, 2]),
  ];
  if (tumahInHouse)
    out.push(
      kezayis('tumah', [6, 7, 0]),
      {
        id: 'overshadower',
        label: { en: 'A tahor person bending over his legs outside', he: 'טהורים שהאהילו עליו' },
        kind: 'person',
        material: 'flesh',
        parts: [box([8.5, -6, 0], [1.5, 1.5, 3]), box([1, -6, 3], [9, 1.5, 1.5])],
      },
    );
  // The corpse is carried past outside, over his legs.
  else out.push(solid('tumah', { en: 'Corpse carried past', he: 'המת' }, 'tumah', 'flesh', [-5, -5.5, 4], [18, 4, 1.5], { tumah: { kind: 'meis' } }), kli('v-house', [7.5, 7, 0], 'Vessel in the house'));
  return out;
}

// 11:7 — a dog that ate corpse flesh died lying across the threshold of an open doorway, its
// neck inside. The flesh is in its belly, under the lintel or outside it.
function deadDog(underLintel: boolean): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4 }] }),
    solid('dog', { en: 'A dead dog on the threshold', he: 'כלב שאכל בשר המת' }, 'animal', 'flesh', [3.25, -4, 0], [1.5, 7, 1]),
    kezayis('tumah', [3.75, underLintel ? -0.75 : -2.5, 0.25], 1, [0.5, 0.5, 0.25]),
    kli('kli-house', [1, 4, 0], 'Vessel in the house'),
  ];
}

export const ch11: Scenario[] = [
  {
    id: '11:7/under-lintel/yose',
    ref: '11:7',
    title: { en: 'A dead dog on the threshold — the flesh in its belly under the lintel (Rabbi Yose)', he: 'כלב שאכל בשר המת' },
    clause: { en: 'Rabbi Yose says: we [examine to] see where the uncleanness is. If it is beneath the lintel and inwards, the house becomes unclean.' },
    notes: 'The halacha follows Rabbi Yose (Bartenura): hidden tumah breaks up through the dog, and the house overshadows it.',
    scene: () => ({ objects: deadDog(true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '11:7/outside/yose',
    ref: '11:7',
    title: { en: 'A dead dog on the threshold — the flesh in its belly outside the lintel (Rabbi Yose)' },
    clause: { en: 'If from the lintel and outwards, the house remains clean.' },
    scene: () => ({ objects: deadDog(false) }),
    expect: { 'kli-house': 'tahor' },
  },
  {
    id: '11:1/tumah-outer',
    ref: '11:1',
    title: { en: 'A split house — tumah in the outer part', he: 'הבית שנחלק' },
    clause: { en: 'If there is uncleanness in the outer [part], vessels in the inner [part] remain clean.' },
    scene: () => ({ objects: splitHouse(true) }),
    expect: { 'v-inner': 'tahor', 'v-outer': 'tamei' },
  },
  {
    id: '11:1/tumah-inner/beis-hillel',
    ref: '11:1',
    title: { en: 'A split house — tumah in the inner part (Beis Hillel: a split of any size)' },
    clause: { en: 'If the uncleanness is in the inner [part], vessels in the outer [are clean]... Bet Hillel says: [when the split is of] any size.' },
    scene: () => ({ objects: splitHouse(false) }),
    expect: { 'v-outer': 'tahor', 'v-inner': 'tamei' },
  },
  {
    id: '11:2/split',
    ref: '11:2',
    title: { en: 'A split portico', he: 'אכסדרה שנסדקה' },
    clause: { en: 'If there is uncleanness on the one side, vessels on the other side remain clean.' },
    scene: () => ({ objects: splitPortico(false) }),
    expect: { 'v-far': 'tahor' },
  },
  {
    id: '11:2/leg',
    ref: '11:2',
    title: { en: 'A split portico — a leg across the split' },
    clause: { en: 'If a person placed his leg or a reed above [the split], he has combined [with the roof to bring the] uncleanness.' },
    scene: () => ({ objects: splitPortico(true) }),
    expect: { 'v-far': 'tamei' },
  },
  {
    id: '11:3/cloak-low',
    ref: '11:3',
    title: { en: 'A thick cloak lying across the split, less than a tefach up', he: 'סגוס עבה' },
    clause: { en: 'A thick woolen jacket or a thick wooden block does not bring uncleanness until they are one handbreadth high off the ground.' },
    scene: () => ({ objects: longPortico('cloak-low') }),
    expect: { 'v-far': 'tahor' },
  },
  {
    id: '11:3/cloak-raised',
    ref: '11:3',
    title: { en: 'A thick cloak across the split, a tefach up' },
    clause: { en: '...until they are one handbreadth high off the ground.' },
    scene: () => ({ objects: longPortico('cloak-raised') }),
    expect: { 'v-far': 'tamei' },
  },
  {
    id: '11:3/person/beis-hillel',
    ref: '11:3',
    title: { en: 'A person lying across the split — Beis Hillel', he: 'אדם חלול' },
    clause: { en: 'Bet Hillel says: a person is hollow and his uppermost side brings the uncleanness.' },
    scene: () => ({ objects: longPortico('person') }),
    expect: { 'v-far': 'tamei' },
  },
  {
    id: '11:3/person/beis-shammai',
    ref: '11:3',
    title: { en: 'A person lying across the split — Beis Shammai' },
    clause: { en: 'Bet Shammai says: he does not bring the uncleanness.' },
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: longPortico('person') }),
    expect: { 'v-far': 'tahor' },
  },
  {
    id: '11:4/beis-hillel',
    ref: '11:4',
    title: { en: 'A person leaning out of a window over a funeral — Beis Hillel', he: 'הניבט מן החלון' },
    clause: { en: 'Bet Hillel says: he does bring the uncleanness.' },
    notes: 'His body is hollow and reaches from the house out over the corpse, so it brings the tumah into the house.',
    scene: () => ({ objects: leaningOut() }),
    expect: { 'v-house': 'tamei', person: 'tamei' },
  },
  {
    id: '11:4/beis-shammai',
    ref: '11:4',
    title: { en: 'A person leaning out of a window over a funeral — Beis Shammai' },
    clause: { en: 'Bet Shammai says: he does not bring uncleanness.' },
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: leaningOut() }),
    expect: { 'v-house': 'tahor', person: 'tamei' },
  },
  {
    id: '11:4/dressed/beis-shammai',
    ref: '11:4',
    title: { en: 'A dressed person leaning out over a funeral — Beis Shammai agree' },
    clause: { en: 'They agree that if he was dressed in his clothes... they bring the uncleanness.' },
    notes: 'His cloak is a vessel: it roofs the corpse but cannot block, so it is full of tumah, which rises into the space between the cloak and his body, and that space runs into the house through the window.',
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: leaningOutAgreed('dressed') }),
    expect: { 'v-house': 'tamei' },
  },
  {
    id: '11:4/two/beis-shammai',
    ref: '11:4',
    title: { en: 'Two people leaning out, one above the other — Beis Shammai agree' },
    clause: { en: '...or if there were two persons, one above the other, they bring the uncleanness.' },
    notes: 'For Beis Shammai the lower one\'s body is solid, but he does not block: the tumah breaks straight up through him into the space between the two, which runs into the house through the window.',
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: leaningOutAgreed('two') }),
    expect: { 'v-house': 'tamei' },
  },
  {
    id: '11:5/beis-hillel',
    ref: '11:5',
    title: { en: 'A funeral passes over a person lying on the threshold — Beis Hillel', he: 'מוטל על האסקופה' },
    clause: { en: 'Bet Hillel says: he does bring the uncleanness.' },
    scene: () => ({ objects: onThreshold(false) }),
    expect: { 'v-house': 'tamei' },
  },
  {
    id: '11:5/beis-shammai',
    ref: '11:5',
    title: { en: 'A funeral passes over a person lying on the threshold — Beis Shammai' },
    clause: { en: 'Bet Shammai says: he does not bring the uncleanness.' },
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: onThreshold(false) }),
    expect: { 'v-house': 'tahor' },
  },
  {
    id: '11:6/beis-hillel',
    ref: '11:6',
    title: { en: 'Tumah in the house; tahor people bend over the one on the threshold — Beis Hillel', he: 'והאהילו עליו טהורים' },
    clause: { en: 'But Bet Hillel declares them unclean.' },
    notes: 'The tumah in the house comes under him, since his body is hollow, and so reaches those who overshadow him outside (Bartenura).',
    scene: () => ({ objects: onThreshold(true) }),
    expect: { overshadower: 'tamei' },
  },
  {
    id: '11:6/beis-shammai',
    ref: '11:6',
    title: { en: 'Tumah in the house; tahor people bend over the one on the threshold — Beis Shammai' },
    clause: { en: 'Bet Shammai declares them clean.' },
    shittos: { 'adam-chalul': 'beis-shammai' },
    scene: () => ({ objects: onThreshold(true) }),
    expect: { overshadower: 'tahor', person: 'tamei' },
  },
];
