import { box, kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 3:7 — a covered drain under a house. The house is 6×6×6 tefachim with an open doorway. The
// drain runs under the floor along x, from inside the house out past the wall, then rises to an
// outlet in the ground outside.
function drainScene(space: number, outlet: number, tumahInDrain: boolean): SceneObject[] {
  const depth = 1.5; // earth between the floor and the top of the drain
  const top = -depth;
  const drain: SceneObject = {
    id: 'drain',
    label: { en: 'Drain', he: 'ביב' },
    kind: 'cavity',
    material: 'earth',
    parts: [
      box([1, 2.5, top - space], [9, space, space]),
      box([10 - outlet, 2.5, top - space], [outlet, outlet, space + depth]),
    ],
  };
  const inDrain: [number, number, number] = [3, 2.5, top - space];
  return [
    ...room({
      id: 'house',
      at: [0, 0],
      size: [6, 6, 6],
      openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }],
    }),
    drain,
    tumahInDrain ? kezayis('tumah', inDrain, 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [4, 4, 0]),
    tumahInDrain ? kli('kli-house', [4, 4, 0], 'Vessel in the house') : kli('kli-drain', inDrain, 'Vessel in the drain', [0.25, 0.25, 0.25]),
  ];
}

const clause37 = (en: string) => ({ en });

export const ch03: Scenario[] = [
  {
    id: '3:7/space-outlet/tumah-in-drain',
    ref: '3:7',
    title: { en: 'Drain with a tefach space and a tefach outlet — tumah inside', he: 'יש בו פותח טפח וביציאתו פותח טפח' },
    clause: clause37('If it has a space a handbreadth wide and its outlet was a handbreadth wide, and there is uncleanness inside it, the house remains clean.'),
    scene: () => ({ objects: drainScene(1, 1, true) }),
    expect: { 'kli-house': 'tahor' },
  },
  {
    id: '3:7/space-outlet/tumah-in-house',
    ref: '3:7',
    title: { en: 'Drain with a tefach space and a tefach outlet — tumah in the house' },
    clause: clause37('And when there is uncleanness in the house, that which is within [the drain] remains clean, for the manner of the uncleanness is to go out and not to go in.'),
    scene: () => ({ objects: drainScene(1, 1, false) }),
    expect: { 'kli-drain': 'tahor' },
  },
  {
    id: '3:7/space-no-outlet/tumah-in-drain',
    ref: '3:7',
    title: { en: 'Drain with a tefach space but a small outlet — tumah inside', he: 'יש בו פותח טפח ואין ביציאתו פותח טפח' },
    clause: clause37('If it had a space one handbreadth wide but its outlet was not one handbreadth wide, when there is uncleanness in it, the house becomes unclean.'),
    scene: () => ({ objects: drainScene(1, 0.5, true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '3:7/space-no-outlet/tumah-in-house',
    ref: '3:7',
    title: { en: 'Drain with a tefach space but a small outlet — tumah in the house' },
    clause: clause37('But when there is uncleanness in the house, that which is within it remains clean, for the manner of the uncleanness is to go out and not to go in.'),
    scene: () => ({ objects: drainScene(1, 0.5, false) }),
    expect: { 'kli-drain': 'tahor' },
  },
  {
    id: '3:7/no-space/tumah-in-drain',
    ref: '3:7',
    title: { en: 'Drain with no tefach space and a small outlet — tumah inside', he: 'אין בו פותח טפח ואין ביציאתו פותח טפח' },
    clause: clause37('If it did not have a space one handbreadth wide and its outlet was not one handbreadth wide, when there is uncleanness within it, the house becomes unclean.'),
    scene: () => ({ objects: drainScene(0.5, 0.5, true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '3:7/no-space/tumah-in-house',
    ref: '3:7',
    title: { en: 'Drain with no tefach space and a small outlet — tumah in the house' },
    clause: clause37('And when there is uncleanness in the house, it [also] becomes unclean.'),
    scene: () => ({ objects: drainScene(0.5, 0.5, false) }),
    expect: { 'kli-drain': 'tamei' },
  },
];
