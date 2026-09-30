import { container, kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 4:1 — a cupboard (מגדל) holding 40 se'ah, so it cannot become tamei, standing in a house.
// `gap` is its height off the floor.
function cupboardInHouse(gap: number, extra: SceneObject[]): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 8], openings: [{ side: 'y-', offset: 3, width: 2, height: 5 }] }),
    container({
      id: 'cupboard',
      label: { en: 'Cupboard (40 se’ah)', he: 'מגדל' },
      material: 'wood',
      at: [4, 4, gap],
      size: [3, 3, 5],
      wall: 0.25,
      mouth: 'none',
      volumeSeah: 40,
    }),
    ...extra,
  ];
}

export const ch04: Scenario[] = [
  {
    id: '4:1/in-house/tumah-inside',
    ref: '4:1',
    title: { en: 'Cupboard in a house — tumah inside it', he: 'מגדל העומד בבית, טומאה בתוכו' },
    clause: { en: 'When it is standing inside a house: If there is uncleanness inside [the cupboard], the house is unclean.' },
    scene: () => ({ objects: cupboardInHouse(0, [kezayis('tumah', [5, 5, 0.25]), kli('kli-house', [1, 1, 0], 'Vessel in the house')]) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '4:1/in-house/tumah-in-house',
    ref: '4:1',
    title: { en: 'Cupboard in a house — tumah in the house' },
    clause: { en: 'If there is uncleanness in the house that which is within [the cupboard] remains clean, for the manner of uncleanness is to go out and not to go in.' },
    scene: () => ({ objects: cupboardInHouse(0, [kezayis('tumah', [1, 1, 0]), kli('kli-cupboard', [5, 5, 0.25], 'Vessel in the cupboard')]) }),
    expect: { 'kli-cupboard': 'tahor' },
  },
  {
    id: '4:1/gap-tefach/vessels-under',
    ref: '4:1',
    title: { en: 'Vessels under the cupboard, with a tefach of space' },
    clause: { en: 'Vessels which are between [the cupboard] and the ground... If there is a space of one cubic handbreadth there, they become unclean.' },
    scene: () => ({ objects: cupboardInHouse(1, [kezayis('tumah', [1, 1, 0]), kli('kli-under', [5, 5, 0], 'Vessel under the cupboard')]) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '4:1/gap-small/vessels-under',
    ref: '4:1',
    title: { en: 'Vessels under the cupboard, with less than a tefach of space' },
    clause: { en: 'If not they remain clean.' },
    scene: () => ({
      objects: cupboardInHouse(0.5, [kezayis('tumah', [1, 1, 0]), kli('kli-under', [5, 5, 0], 'Vessel under the cupboard', [0.25, 0.25, 0.25])]),
    }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '4:1/gap-small/tumah-under',
    ref: '4:1',
    title: { en: 'Tumah under the cupboard, with less than a tefach of space' },
    clause: { en: 'If there is uncleanness there, the house becomes unclean.' },
    scene: () => ({
      objects: cupboardInHouse(0.5, [kezayis('tumah', [5, 5, 0], 1, [0.25, 0.25, 0.25]), kli('kli-house', [1, 1, 0], 'Vessel in the house')]),
    }),
    expect: { 'kli-house': 'tamei' },
  },
];
