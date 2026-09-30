import { box, container, kezayis, kli, person, room, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 6:1 — a large flat stone (נדבך, per Bartenura) held up by different supports. The stone is
// 4×4 tefachim, a quarter-tefach thick, twelve tefachim up.
type Support = 'people' | 'dung-vessels' | 'stones';
function stoneOn(support: Support, tumahBelow: boolean): SceneObject[] {
  const h = 12;
  const corners: [number, number][] = [
    [0, 0],
    [3, 0],
    [0, 3],
    [3, 3],
  ];
  const supports = corners.map(([x, y], n): SceneObject => {
    const id = `support${n + 1}`;
    if (support === 'people') return person(id, [x - 0.25, y, 0], 'Bearer', h);
    if (support === 'stones') return solid(id, 'Stone', 'misc', 'stone', [x, y, 0], [1, 1, h]);
    return container({ id, label: 'Dung vessel', material: 'dung', at: [x, y, 0], size: [1, 1, h], wall: 0.25 });
  });
  return [
    solid('stone', { en: 'Large stone', he: 'נדבך' }, 'misc', 'stone', [0, 0, h], [4, 4, 0.25]),
    ...supports,
    tumahBelow ? kezayis('tumah', [1.75, 1.75, 0]) : kezayis('tumah', [1.75, 1.75, h + 0.25]),
    tumahBelow ? kli('kli-top', [2.75, 2.75, h + 0.25], 'Vessel on the stone') : kli('kli-below', [2.75, 2.75, 0], 'Vessel under the stone'),
  ];
}

// 6:3 — a house whose wall on the x+ side is 2 tefachim thick and faces open space. The roof
// covers only the inner half of that wall, so something can sit on the outer half.
function wallScene(offset: number): SceneObject[] {
  const tumahX = 6 + offset;
  return [
    {
      id: 'house',
      label: { en: 'House', he: 'בית' },
      kind: 'structure',
      material: 'stone',
      parts: [
        box([-1, -1, 0], [1, 8, 6]),
        box([0, -1, 0], [6, 1, 6]),
        box([0, 6, 0], [6, 1, 6]),
        box([6, -1, 0], [2, 8, 6]), // the thick wall
        box([-1, -1, 6], [8, 8, 1]), // roof: over the inner half of the thick wall only
      ],
    },
    kezayis('tumah', [tumahX, 3, 2]),
    kli('kli-house', [2, 2, 0], 'Vessel in the house'),
    kli('kli-above', [tumahX, 3, 7], 'Vessel above the wall, directly over the tumah', [0.5, 0.5, 0.5]),
  ];
}

// 6:4 — a house with an upper story; the plaster floor between them is 2 tefachim thick.
function plasterScene(offset: number, thick = 0.25): SceneObject[] {
  return [
    ...room({ id: 'lower', label: { en: 'House', he: 'בית' }, at: [0, 0, 0], size: [6, 6, 6], roof: 2, openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, 8], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    kezayis('tumah', [3, 3, 6 + offset], 1, [0.5, 0.5, thick]),
    kli('kli-lower', [1, 1, 0], 'Vessel in the house'),
    kli('kli-upper', [1, 1, 8], 'Vessel in the upper story'),
  ];
}

export const ch06: Scenario[] = [
  {
    id: '6:1/people/tumah-below',
    ref: '6:1',
    title: { en: 'A stone carried by people — tumah beneath it', he: 'ארבעה בני אדם יושבין על הנדבך' },
    clause: { en: 'If there is uncleanness beneath it, vessels upon it become unclean.' },
    scene: () => ({ objects: stoneOn('people', true) }),
    expect: { 'kli-top': 'tamei' },
  },
  {
    id: '6:1/people/tumah-above',
    ref: '6:1',
    title: { en: 'A stone carried by people — tumah on it' },
    clause: { en: 'If there is uncleanness upon it, vessels beneath it become unclean.' },
    scene: () => ({ objects: stoneOn('people', false) }),
    expect: { 'kli-below': 'tamei' },
  },
  {
    id: '6:1/dung-vessels/tumah-below',
    ref: '6:1',
    title: { en: 'A stone on four dung vessels — tumah beneath it' },
    clause: { en: '[If the stone] is placed upon four vessels, even if they are vessels made of dung... If there is uncleanness beneath, vessels upon it become unclean.' },
    scene: () => ({ objects: stoneOn('dung-vessels', true) }),
    expect: { 'kli-top': 'tamei' },
  },
  {
    id: '6:1/stones/tumah-below',
    ref: '6:1',
    title: { en: 'A stone on four stones — tumah beneath it' },
    clause: { en: '[If it] is placed on four stones... If there is uncleanness beneath it, vessels upon it remain clean.' },
    scene: () => ({ objects: stoneOn('stones', true) }),
    expect: { 'kli-top': 'tahor' },
  },
  {
    id: '6:1/stones/tumah-above',
    ref: '6:1',
    title: { en: 'A stone on four stones — tumah on it' },
    clause: { en: 'If there is uncleanness upon it vessels beneath it remain clean.' },
    scene: () => ({ objects: stoneOn('stones', false) }),
    expect: { 'kli-below': 'tahor' },
  },
  {
    id: '6:3/inner-half',
    ref: '6:3',
    title: { en: 'Tumah in the inner half of a wall', he: 'כותל המשמש את הבית' },
    clause: { en: 'If it is in the inward half, the house is unclean, but what is above [the wall] remains clean.' },
    scene: () => ({ objects: wallScene(0.25) }),
    expect: { 'kli-house': 'tamei', 'kli-above': 'tahor' },
  },
  {
    id: '6:3/outer-half',
    ref: '6:3',
    title: { en: 'Tumah in the outer half of a wall' },
    clause: { en: 'If it is in the outward half, the house remains clean, but what is above [the wall] becomes unclean.' },
    scene: () => ({ objects: wallScene(1.25) }),
    expect: { 'kli-house': 'tahor', 'kli-above': 'tamei' },
  },
  {
    id: '6:3/middle/chachamim',
    ref: '6:3',
    title: { en: 'Tumah in the exact middle of a wall — Sages' },
    clause: { en: 'If it is exactly in the middle, the house becomes unclean, and as for what is above... the sages declare it clean.' },
    shittos: { 'wall-halves': 'chachamim' },
    scene: () => ({ objects: wallScene(0.75) }),
    expect: { 'kli-house': 'tamei', 'kli-above': 'tahor' },
  },
  {
    id: '6:3/middle/meir',
    ref: '6:3',
    title: { en: 'Tumah in the exact middle of a wall — Rabbi Meir' },
    clause: { en: 'And as for what is above, Rabbi Meir declares it unclean.' },
    shittos: { 'wall-halves': 'meir' },
    scene: () => ({ objects: wallScene(0.75) }),
    expect: { 'kli-house': 'tamei', 'kli-above': 'tamei' },
  },
  {
    id: '6:3/outer-half/yehuda',
    ref: '6:3',
    title: { en: 'Tumah in the outer half of a wall — Rabbi Yehuda' },
    clause: { en: 'Rabbi Judah says: the whole of the wall belongs to the house.' },
    shittos: { 'wall-halves': 'yehuda' },
    scene: () => ({ objects: wallScene(1.25) }),
    expect: { 'kli-house': 'tamei', 'kli-above': 'tahor' },
  },
  {
    id: '6:4/lower-half',
    ref: '6:4',
    title: { en: 'Tumah in the lower half of the plaster between stories', he: 'מעזיבה שבין הבית לעלייה' },
    clause: { en: 'If it is in the lower half, the house [below] is unclean and the upper story is clean.' },
    scene: () => ({ objects: plasterScene(0.25) }),
    expect: { 'kli-lower': 'tamei', 'kli-upper': 'tahor' },
  },
  {
    id: '6:4/upper-half',
    ref: '6:4',
    title: { en: 'Tumah in the upper half of the plaster' },
    clause: { en: 'If it is in the upper half, the upper story is unclean and the house is clean.' },
    scene: () => ({ objects: plasterScene(1.5) }),
    expect: { 'kli-lower': 'tahor', 'kli-upper': 'tamei' },
  },
  {
    id: '6:4/middle',
    ref: '6:4',
    title: { en: 'Tumah in the middle of the plaster' },
    clause: { en: 'If it is in the middle, both are unclean.' },
    scene: () => ({ objects: plasterScene(0.75, 0.5) }),
    expect: { 'kli-lower': 'tamei', 'kli-upper': 'tamei' },
  },
  {
    id: '6:4/lower-half/yehuda',
    ref: '6:4',
    title: { en: 'Tumah in the lower half of the plaster — Rabbi Yehuda' },
    clause: { en: 'Rabbi Judah says: all the plaster-work is considered as part of the upper story.' },
    shittos: { 'plaster-halves': 'yehuda' },
    scene: () => ({ objects: plasterScene(0.25) }),
    expect: { 'kli-lower': 'tahor', 'kli-upper': 'tamei' },
  },
];
