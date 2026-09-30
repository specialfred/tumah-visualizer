import { box, kezayis, kli, room, solid } from '../../engine/build';
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
];
