import { box, boxesMinus, container, kezayis, kli, person, room, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 6:1 — a large flat stone (נדבך, per Bartenura) held up by different supports at its four
// corners. The stone is 14×14 tefachim, a quarter-tefach thick, at head height (3 amos).
type Support = 'people' | 'dung-vessels' | 'stones';
function stoneOn(support: Support, tumahBelow: boolean): SceneObject[] {
  const h = 18;
  const S = 14;
  const supports = [0, 1, 2, 3].map((n): SceneObject => {
    const id = `support${n + 1}`;
    const [w, d] = support === 'people' ? [6, 6] : [1, 1];
    const x = n % 2 ? S - w : 0;
    const y = n < 2 ? 0 : S - d;
    if (support === 'people') return person(id, [x, y, 0], 'Bearer', h);
    if (support === 'stones') return solid(id, 'Stone', 'misc', 'stone', [x, y, 0], [1, 1, h]);
    return container({ id, label: 'Dung vessel', material: 'dung', at: [x, y, 0], size: [1, 1, h], wall: 0.25 });
  });
  return [
    solid('stone', { en: 'Large stone', he: 'נדבך' }, 'misc', 'stone', [0, 0, h], [S, S, 0.25]),
    ...supports,
    tumahBelow ? kezayis('tumah', [6.75, 6.75, 0]) : kezayis('tumah', [6.75, 6.75, h + 0.25]),
    tumahBelow ? kli('kli-top', [10, 7, h + 0.25], 'Vessel on the stone') : kli('kli-below', [10, 7, 0], 'Vessel under the stone'),
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

// 6:4 — a vessel inside the plaster, with tumah in one of the stories.
function vesselInPlaster(offset: number, tumahUpstairs: boolean): SceneObject[] {
  return [
    kli('kli-plaster', [3, 3, 6 + offset], 'Vessel inside the plaster', [0.5, 0.5, 0.5]),
    ...room({ id: 'lower', label: { en: 'House', he: 'בית' }, at: [0, 0, 0], size: [6, 6, 6], roof: 2, openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, 8], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    tumahUpstairs ? kezayis('tumah', [1, 1, 8]) : kezayis('tumah', [1, 1, 0]),
  ];
}

// 6:5 — a house whose ceiling is beams (a space `gap` tefachim high between them) under a tefach
// of plaster, with the upper story on it. With `skin`, a covering thin as garlic skin is plastered
// under the beams, so the tumah among them is not seen in the house.
function amongBeams(gap: number, skin: boolean): SceneObject[] {
  const [house, ...doors] = room({ id: 'lower', label: { en: 'House', he: 'בית' }, at: [0, 0, 0], size: [6, 6, 6], roof: 0.25 + gap + 1, openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] });
  const space = skin ? box([0, 0, 6.25], [6, 6, gap]) : box([0, 0, 6], [6, 6, gap + 0.25]);
  const top = 6 + 0.25 + gap + 1;
  return [
    { ...house, parts: boxesMinus(house.parts, [space]) },
    ...doors,
    ...[0.5, 2.5, 4.5].map((x, n) => solid(`beam${n + 1}`, { en: 'Beam', he: 'קורה' }, 'structure', 'wood', [x, 0, 6.25], [0.5, 6, gap])),
    kezayis('tumah', [2, 3, 6.25], 1, [0.5, 0.5, 0.25]),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, top], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    kli('kli-lower', [1, 1, 0], 'Vessel in the house'),
    kli('kli-upper', [1, 1, top], 'Vessel in the upper story'),
  ];
}

// 6:6 — a house with a stone pillar in the middle, from floor to roof, and tumah under it.
function pillarInHouse(): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4 }] }),
    solid('pillar', { en: 'Pillar', he: 'עמוד' }, 'structure', 'stone', [3, 3, 0], [2, 2, 6]),
    kezayis('tumah', [3.875, 3.875, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-house', [1, 1, 0], 'Vessel in the house'),
    kli('kli-roof', [3.875, 3.875, 7], 'Vessel on the roof over the pillar', [0.25, 0.25, 0.25]),
  ];
}

// 6:7 — a pillar standing in a garden, 2×2 and 6 high, with a capital (פרח) on top that
// protrudes `overhang` on every side.
function capital(overhang: number, tumah: 'under-pillar' | 'under-capital'): SceneObject[] {
  const o = overhang;
  return [
    solid('pillar', { en: 'Pillar', he: 'עמוד' }, 'structure', 'stone', [o, o, 0], [2, 2, 6]),
    solid('capital', { en: 'Capital', he: 'פרח' }, 'structure', 'stone', [0, 0, 6], [2 + 2 * o, 2 + 2 * o, 0.5]),
    tumah === 'under-pillar' ? kezayis('tumah', [o + 0.875, o + 0.875, 0], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [0, 0.5, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-under', [o + 2 + (o - 0.25) / 2, o + 1, 0], 'Vessel under the capital', [0.25, 0.25, 0.25]),
  ];
}

// 6:2 — a house whose doorway opens onto a roofed porch, where a corpse is carried past. The door
// is shut: standing in the doorway by itself, or held up only by its key, which is a vessel.
function porchDoor(standsAlone: boolean): SceneObject[] {
  const lift = standsAlone ? 0 : 0.25;
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4 }] }),
    { id: 'door', label: { en: 'Door', he: 'דלת' }, kind: 'door', material: 'wood', parts: [box([3, -0.25, lift], [2, 0.25, 4 - lift])] },
    ...(standsAlone ? [] : [kli('key', [3.75, -0.25, 0], { en: 'Key holding the door up', he: 'מפתח' }, [0.5, 0.25, 0.25])]),
    solid('porch', { en: 'Porch roof', he: 'אכסדרה' }, 'structure', 'stone', [-1, -8, 6], [10, 7, 1]),
    solid('pillar1', 'Pillar', 'structure', 'stone', [-1, -8, 0], [1, 1, 6]),
    solid('pillar2', 'Pillar', 'structure', 'stone', [8, -8, 0], [1, 1, 6]),
    solid('tumah', { en: 'Corpse carried through the porch', he: 'המת' }, 'tumah', 'flesh', [-4, -6, 3], [18, 3, 1.5], { tumah: { kind: 'meis' } }),
    kli('kli-house', [1, 4, 0], 'Vessel in the house'),
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
  {
    id: '6:4/vessel-lower-half/tumah-below',
    ref: '6:4',
    title: { en: 'A vessel in the lower half of the plaster — tumah in the house' },
    clause: { en: 'If there is uncleanness in either [the house or the upper story] and there are vessels inside the plaster-work, those in the half nearer the uncleanness are unclean.' },
    scene: () => ({ objects: vesselInPlaster(0.25, false) }),
    expect: { 'kli-plaster': 'tamei' },
  },
  {
    id: '6:4/vessel-lower-half/tumah-above',
    ref: '6:4',
    title: { en: 'A vessel in the lower half of the plaster — tumah in the upper story' },
    clause: { en: 'And those in the half nearer the clean [space] are clean.' },
    scene: () => ({ objects: vesselInPlaster(0.25, true) }),
    expect: { 'kli-plaster': 'tahor' },
  },
  {
    id: '6:4/vessel-middle/tumah-above',
    ref: '6:4',
    title: { en: 'A vessel in the middle of the plaster — tumah in the upper story' },
    clause: { en: 'If they are in the middle, they are unclean.' },
    scene: () => ({ objects: vesselInPlaster(0.75, true) }),
    expect: { 'kli-plaster': 'tamei' },
  },
  {
    id: '6:5/tefach',
    ref: '6:5',
    title: { en: 'Tumah among the beams, a thin covering under them, a tefach of space', he: 'טומאה בין הקורות' },
    clause: { en: 'If there is a space within of a cubic handbreadth, everything becomes unclean.' },
    notes: 'The mishna follows Rabbi Yehuda, for whom all the plaster belongs to the upper story (Bartenura). The space has no opening, so the tumah breaks out of it into the house and the upper story.',
    shittos: { 'plaster-halves': 'yehuda' },
    scene: () => ({ objects: amongBeams(1, true) }),
    expect: { 'kli-lower': 'tamei', 'kli-upper': 'tamei' },
  },
  {
    id: '6:5/small',
    ref: '6:5',
    title: { en: 'Tumah among the beams, a thin covering under them, less than a tefach of space' },
    clause: { en: 'If there is not a space of a cubic handbreadth, the uncleanness is considered plugged up.' },
    notes: 'It does not go down into the house, but breaks up into the upper story (Bartenura), since the whole ceiling belongs to the upper story (Rabbi Yehuda).',
    shittos: { 'plaster-halves': 'yehuda' },
    scene: () => ({ objects: amongBeams(0.5, true) }),
    expect: { 'kli-lower': 'tahor', 'kli-upper': 'tamei' },
  },
  {
    id: '6:5/seen/tefach',
    ref: '6:5',
    title: { en: 'Tumah among the beams, seen from the house, a tefach of space' },
    clause: { en: 'If the uncleanness was visible within the house, in either case the house becomes unclean.' },
    shittos: { 'plaster-halves': 'yehuda' },
    scene: () => ({ objects: amongBeams(1, false) }),
    expect: { 'kli-lower': 'tamei' },
  },
  {
    id: '6:5/seen/small',
    ref: '6:5',
    title: { en: 'Tumah among the beams, seen from the house, less than a tefach of space' },
    clause: { en: 'If the uncleanness was visible within the house, in either case the house becomes unclean.' },
    shittos: { 'plaster-halves': 'yehuda' },
    scene: () => ({ objects: amongBeams(0.5, false) }),
    expect: { 'kli-lower': 'tamei' },
  },
  {
    id: '6:6/under-pillar',
    ref: '6:6',
    title: { en: 'Tumah under a pillar in a house', he: 'טומאה תחת העמוד' },
    clause: { en: 'If there is uncleanness beneath a pillar, the uncleanness cleaves upwards and downwards.' },
    notes: 'A pillar has the same space on every side, so it is not a wall with halves: the house stays tahor (Bartenura).',
    scene: () => ({ objects: pillarInHouse() }),
    expect: { 'kli-house': 'tahor', 'kli-roof': 'tamei' },
  },
  {
    id: '6:7/under-pillar',
    ref: '6:7',
    title: { en: 'Tumah under a pillar, vessels under its capital', he: 'כלים שתחת הפרח' },
    clause: { en: 'Vessels beneath the flowerlike top [of a pillar] remain clean.' },
    scene: () => ({ objects: capital(1, 'under-pillar') }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '6:7/under-pillar/yochanan-ben-nuri',
    ref: '6:7',
    title: { en: 'Tumah under a pillar, vessels under its capital — Rabbi Yochanan ben Nuri' },
    clause: { en: 'Rabbi Yohanan ben Nuri declares them unclean.' },
    shittos: { 'pillar-capital': 'yochanan-ben-nuri' },
    scene: () => ({ objects: capital(1, 'under-pillar') }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '6:7/under-capital/tefach',
    ref: '6:7',
    title: { en: 'Tumah and vessels under a capital that protrudes a tefach' },
    clause: { en: '[In the case of] the uncleanness and the vessels being [together] beneath the flowerlike top: if there is a space of one cubic handbreadth there, [the vessels] become unclean.' },
    scene: () => ({ objects: capital(1, 'under-capital') }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '6:7/under-capital/small',
    ref: '6:7',
    title: { en: 'Tumah and vessels under a capital that protrudes less than a tefach' },
    clause: { en: 'If not, they remain clean.' },
    scene: () => ({ objects: capital(0.75, 'under-capital') }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '6:2/door-stands',
    ref: '6:2',
    title: { en: 'A door that stands by itself, shut against a funeral in the porch', he: 'הגיף את הדלת' },
    clause: { en: 'If the door can remain in its position on its own, [the contents of the house] remain clean.' },
    scene: () => ({ objects: porchDoor(true) }),
    expect: { 'kli-house': 'tahor' },
  },
  {
    id: '6:2/door-on-key',
    ref: '6:2',
    title: { en: 'A door held up only by its key' },
    clause: { en: 'But if not, they become unclean.' },
    notes: 'Whatever rests on vessels does not block tumah (6:1); the key is a vessel (Bartenura).',
    scene: () => ({ objects: porchDoor(false) }),
    expect: { 'kli-house': 'tamei' },
  },
];
