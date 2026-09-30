import { box, boxesMinus, kezayis, kli, person, room, solid } from '../../engine/build';
import type { Material, SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 15:1 — tablets laid one above another, with tumah between the lowest two and a vessel
// between the upper two, off to the side. The top tablet is a tefach and a quarter off the ground.
function tablets(material: Material): SceneObject[] {
  const kind = material === 'wood' ? 'vessel' : 'misc';
  const t = (id: string, z: number) => solid(id, `Tablet of ${material}`, kind, material, [0, 0, z], [3, 3, 0.25]);
  return [
    t('t1', 0),
    kezayis('tumah', [0.5, 0.5, 0.25], 1, [0.25, 0.25, 0.25]),
    t('t2', 0.5),
    kli('kli-between', [2.25, 2.25, 0.75], 'Vessel between the upper tablets', [0.25, 0.25, 0.25]),
    t('t3', 1),
  ];
}

// 15:1 — garments folded one on another, resting on four small stones a half-tefach high. The
// folds are a quarter-tefach each; with three, the uppermost is a tefach off the ground.
function folded(high: boolean): SceneObject[] {
  const lift = 0.5;
  const layers = high ? 3 : 2;
  return [
    ...[
      [0, 0],
      [3.5, 0],
      [0, 3.5],
      [3.5, 3.5],
    ].map(([x, y], n) => solid(`stone${n + 1}`, 'Stone', 'misc', 'stone', [x, y, 0], [0.5, 0.5, lift])),
    ...Array.from({ length: layers }, (_, n) =>
      solid(`fold${n + 1}`, { en: 'Folded garment', he: 'קפולין' }, 'vessel', 'cloth', [0, 0, lift + 0.25 * n], [4, 4, 0.25]),
    ),
    kezayis('tumah', [1, 1, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-under', [2.75, 2.75, 0], 'Vessel under the garments, away from the tumah', [0.25, 0.25, 0.25]),
  ];
}

// 15:2 — two wooden tablets a tefach off the ground on stone posts, touching only at a corner
// (a half-tefach of their edges meet), with tumah under the first.
function cornerTablets(): SceneObject[] {
  const post = (id: string, x: number, y: number) => solid(id, 'Post', 'misc', 'stone', [x, y, 0], [0.25, 0.25, 1]);
  return [
    solid('tablet-a', { en: 'First tablet', he: 'טבלה ראשונה' }, 'vessel', 'wood', [0, 0, 1], [3, 3, 0.25]),
    solid('tablet-b', { en: 'Second tablet', he: 'טבלה שנייה' }, 'vessel', 'wood', [3, 2.5, 1], [3, 3, 0.25]),
    post('post-a1', 0, 0),
    post('post-a2', 2.75, 0),
    post('post-a3', 0, 2.75),
    post('post-b1', 5.75, 2.5),
    post('post-b2', 3, 5.25),
    post('post-b3', 5.75, 5.25),
    kezayis('tumah', [1, 1, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-a', [2, 1.5, 0], 'Vessel under the first tablet', [0.25, 0.25, 0.25]),
    kli('kli-b', [4.5, 4, 0], 'Vessel under the second tablet', [0.25, 0.25, 0.25]),
    // A person standing beside the second tablet with a hand on its edge.
    (() => {
      const p = person('person', [6.25, 3, 0], { en: 'Person touching the second tablet', he: 'הנוגע בשנייה' }, 18, [1.5, 1.5]);
      return { ...p, parts: [...p.parts, box([6, 3.5, 1], [0.25, 0.5, 0.25])] };
    })(),
  ];
}

// 15:4 — a house with boards set up a little way inside one wall, from floor to roof, closing off
// a strip along it (חצץ). `space` is the width of the strip.
function partitioned(space: number, tumahBehind: boolean, vesselBehind: boolean): SceneObject[] {
  const x = 8 - space - 0.25;
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 1, width: 2, height: 4 }] }),
    solid('boards', { en: 'Boards partitioning the house', he: 'חצץ' }, 'misc', 'wood', [x, 0, 0], [0.25, 6, 6]),
    tumahBehind ? kezayis('tumah', [8 - space, 1, 0], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [2, 3, 0]),
    vesselBehind
      ? kli('kli-behind', [8 - space, 4, 0], 'Vessel behind the partition', [0.25, 0.25, 0.25])
      : kli('kli-house', [2, 4, 0], 'Vessel in the house'),
    ...(tumahBehind && vesselBehind ? [kli('kli-house', [2, 4, 0], 'Vessel in the house')] : []),
  ];
}

// 15:6 — a house 12×8 filled with straw (left there for good) on both sides of an aisle 4 wide
// running from the doorway to the far wall. The straw reaches to within less than a tefach of
// the roof beams.
function strawHouse(tumahIn: 'straw' | 'aisle', vessel: 'aisle' | 'straw-space' | 'straw-packed'): SceneObject[] {
  const straw = (id: string, x: number) =>
    ({ id, label: { en: 'Straw, left in the house', he: 'תבן' }, kind: 'structure', material: 'plant', parts: [box([x, 0, 0], [4, 8, 5.5])] }) as SceneObject;
  const cavity = vessel === 'straw-space' ? [box([9, 3, 0], [1, 1, 1])] : [];
  const right = straw('straw-right', 8);
  return [
    // The vessel comes before the straw so that the straw packs around it.
    vessel === 'aisle'
      ? kli('kli-aisle', [5.5, 1, 0], 'Vessel in the aisle by the doorway')
      : kli('kli-straw', [9.25, 3.25, 0], vessel === 'straw-space' ? 'Vessel in a tefach space in the straw' : 'Vessel packed in the straw', [0.25, 0.25, 0.25]),
    ...room({ id: 'house', at: [0, 0], size: [12, 8, 6], openings: [{ side: 'y-', offset: 4, width: 4, height: 5 }] }),
    straw('straw-left', 0),
    { ...right, parts: boxesMinus(right.parts, cavity) },
    tumahIn === 'straw' ? kezayis('tumah', [3.25, 4, 1], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [6, 6, 0]),
  ];
}

// 15:7 — a house filled with earth that he means to leave there, with tumah buried in it.
function earthHouse(): SceneObject[] {
  return [
    // The vessels come first so that the earth packs around them.
    kli('kli-beside', [2.75, 3, 2], 'Vessel beside the tumah', [0.25, 0.25, 0.25]),
    kli('kli-over', [2, 3, 4], 'Vessel in the earth, directly over the tumah', [0.25, 0.25, 0.25]),
    ...room({ id: 'house', at: [0, 0], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    solid('earth', { en: 'Earth filling the house', he: 'עפר' }, 'structure', 'earth', [0, -1, 0], [6, 7, 6]),
    kezayis('tumah', [2, 3, 2], 1, [0.25, 0.25, 0.25]),
  ];
}

// 15:5 — a floor of boards laid over the floor of a house, with a closed space beneath it.
function raisedFloor(gap: number, tumahBelow: boolean): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4, sill: 2 }] }),
    { id: 'boards', label: { en: 'Boards partitioning the floor', he: 'חצץ' }, kind: 'structure', material: 'wood', parts: [box([0, 0, gap], [6, 6, 0.25])] },
    tumahBelow ? kezayis('tumah', [3, 3, 0], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [1, 1, gap + 0.25]),
    tumahBelow
      ? kli('kli-house', [4, 4, gap + 0.25], 'Vessel in the house')
      : kli('kli-under', [4, 4, 0], 'Vessel beneath the boards', [0.25, 0.25, 0.25]),
  ];
}

// 15:1 — a thick woolen cloak (a garment, which can become tamei), lying low or raised a tefach.
function cloak(raised: boolean): SceneObject[] {
  const z = raised ? 1 : 0.5; // low: less than a tefach up, touching nothing
  const stones = raised
    ? [
        [0, 0],
        [3.5, 0],
        [0, 3.5],
        [3.5, 3.5],
      ].map(([x, y], n) => solid(`stone${n + 1}`, 'Stone', 'misc', 'stone', [x, y, 0], [0.5, 0.5, 1]))
    : [];
  return [
    solid('cloak', { en: 'Thick woolen cloak', he: 'סגוס עבה' }, 'vessel', 'cloth', [0, 0, z], [4, 4, 0.25]),
    ...stones,
    kezayis('tumah', [1, 1, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-under', [2.75, 2.75, 0], 'Vessel under the cloak, away from the tumah', [0.25, 0.25, 0.25]),
  ];
}

export const ch15: Scenario[] = [
  {
    id: '15:1/cloak-low',
    ref: '15:1',
    title: { en: 'A thick cloak lying low over tumah', he: 'סגוס עבה' },
    clause: { en: 'A thick woolen jacket or a thick wooden block does not bring uncleanness until they are one handbreadth high off the ground.' },
    scene: () => ({ objects: cloak(false) }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '15:1/cloak-raised',
    ref: '15:1',
    title: { en: 'A thick cloak raised a tefach over tumah' },
    clause: { en: '...until they are one handbreadth high off the ground.' },
    scene: () => ({ objects: cloak(true) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '15:1/wood',
    ref: '15:1',
    title: { en: 'Wooden tablets one above another, the top a tefach up', he: 'טבלאות של עץ' },
    clause: { en: 'Tablets of wood [placed] one above the other do not bring uncleanness unless the uppermost is one handbreadth high off the ground.' },
    scene: () => ({ objects: tablets('wood') }),
    expect: { 'kli-between': 'tamei' },
  },
  {
    id: '15:1/marble',
    ref: '15:1',
    title: { en: 'Marble tablets one above another' },
    clause: { en: 'But if they were of marble, the uncleanness cleaves upwards and downwards.' },
    scene: () => ({ objects: tablets('marble') }),
    expect: { 'kli-between': 'tahor' },
  },
  {
    id: '15:5/gap-tefach/tumah-below',
    ref: '15:5',
    title: { en: 'Floor partitioned off with a tefach of space — tumah beneath', he: 'חצצו מארצו' },
    clause: { en: 'If there is uncleanness beneath the partition, vessels in the house become unclean.' },
    scene: () => ({ objects: raisedFloor(1, true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '15:5/gap-small/tumah-below',
    ref: '15:5',
    title: { en: 'Floor partitioned off with less than a tefach — tumah beneath' },
    clause: { en: 'If there is uncleanness beneath the partition, vessels in the house become unclean.' },
    scene: () => ({ objects: raisedFloor(0.5, true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '15:5/gap-tefach/tumah-in-house',
    ref: '15:5',
    title: { en: 'Floor partitioned off with a tefach of space — tumah in the house' },
    clause: { en: 'Vessels beneath the partition, if there is a space there of one cubic hand breadth, remain clean.' },
    scene: () => ({ objects: raisedFloor(1, false) }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '15:5/gap-small/tumah-in-house',
    ref: '15:5',
    title: { en: 'Floor partitioned off with less than a tefach — tumah in the house' },
    clause: { en: 'But if not, they become unclean, since the floor of the house is reckoned as the house even to the nethermost deep.' },
    scene: () => ({ objects: raisedFloor(0.5, false) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '15:1/folded-low',
    ref: '15:1',
    title: { en: 'Folded garments, the uppermost less than a tefach up', he: 'קפולין' },
    clause: { en: 'If [garments] are folded one above the other they do not bring uncleanness until the uppermost is one handbreadth high off the ground.' },
    scene: () => ({ objects: folded(false) }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '15:1/folded-high',
    ref: '15:1',
    title: { en: 'Folded garments, the uppermost a tefach up' },
    clause: { en: '...until the uppermost is one handbreadth high off the ground.' },
    notes: 'The lower folds fill part of the space, but garments can become tamei and do not count as ground (Bartenura), so the uppermost roofs a full tefach.',
    scene: () => ({ objects: folded(true) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '15:2/corners',
    ref: '15:2',
    title: { en: 'Wooden tablets touching at their corners, tumah under one', he: 'טבליות של עץ נוגעות בקרנותיהן' },
    clause: {
      en: 'If there is uncleanness beneath one of them, [a person] touching the second [tablet] becomes defiled with seven-day defilement. Vessels under the first [tablet] become unclean; but those under the second remain clean.',
    },
    notes: 'The tablet over the tumah is the tent, and the tent does not count as a link (1:3, Bartenura here): the second tablet is as if it touched the dead, so one who touches it is tamei for seven days.',
    scene: () => ({ objects: cornerTablets() }),
    expect: { 'kli-a': 'tamei', 'kli-b': 'tahor', person: 'tamei7' },
  },
  {
    id: '15:4/tumah-in-house',
    ref: '15:4',
    title: { en: 'A house partitioned by boards — tumah in the house', he: 'בית שחצצו בנסרים' },
    clause: { en: 'If there is uncleanness in the house, vessels beyond the partition remain clean.' },
    scene: () => ({ objects: partitioned(1, false, true) }),
    expect: { 'kli-behind': 'tahor' },
  },
  {
    id: '15:4/tumah-behind',
    ref: '15:4',
    title: { en: 'A house partitioned by boards — tumah behind the partition' },
    clause: { en: 'If there is uncleanness beyond the partition, vessels in the house become unclean.' },
    notes: 'Like earthenware with a tight lid: it keeps tumah out, but tumah inside it goes out (Bartenura).',
    scene: () => ({ objects: partitioned(1, true, false) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '15:4/behind/tefach',
    ref: '15:4',
    title: { en: 'Tumah and vessels behind the partition, with a tefach of space' },
    clause: { en: 'The vessels beyond the partition: if there is a space of a [cubic] handbreadth there, they become unclean.' },
    scene: () => ({ objects: partitioned(1, true, true) }),
    expect: { 'kli-behind': 'tamei', 'kli-house': 'tamei' },
  },
  {
    id: '15:4/behind/small',
    ref: '15:4',
    title: { en: 'Tumah and vessels behind the partition, with less than a tefach' },
    clause: { en: 'But if not, they are clean.' },
    notes: 'The vessels are not directly over or under the tumah, which is compressed; the house is still tamei (Bartenura).',
    scene: () => ({ objects: partitioned(0.5, true, true) }),
    expect: { 'kli-behind': 'tahor', 'kli-house': 'tamei' },
  },
  {
    id: '15:6/tumah-in-straw',
    ref: '15:6',
    title: { en: 'A house full of straw — tumah in the straw', he: 'בית שמלאהו תבן' },
    clause: { en: 'If there is uncleanness within [the straw], vessels at the exit become unclean.' },
    scene: () => ({ objects: strawHouse('straw', 'aisle') }),
    expect: { 'kli-aisle': 'tamei' },
  },
  {
    id: '15:6/vessel-in-space',
    ref: '15:6',
    title: { en: 'A house full of straw — tumah in the aisle, a vessel in a tefach space in the straw' },
    clause: { en: 'If the uncleanness was outside, with regard to the vessels within: if they are in a space of a cubic handbreadth, they remain clean.' },
    scene: () => ({ objects: strawHouse('aisle', 'straw-space') }),
    expect: { 'kli-straw': 'tahor' },
  },
  {
    id: '15:6/vessel-packed',
    ref: '15:6',
    title: { en: 'A house full of straw — tumah in the aisle, a vessel packed in the straw' },
    clause: { en: 'But if not they become unclean.' },
    scene: () => ({ objects: strawHouse('aisle', 'straw-packed') }),
    expect: { 'kli-straw': 'tamei' },
  },
  {
    id: '15:7/earth',
    ref: '15:7',
    title: { en: 'A house filled with earth, tumah buried in it', he: 'בית שמילאהו עפר' },
    clause: { en: 'Even if the uncleanness is by the side of the vessels, the uncleanness cleaves upwards and downwards.' },
    scene: () => ({ objects: earthHouse() }),
    expect: { 'kli-beside': 'tahor', 'kli-over': 'tamei' },
  },
];
