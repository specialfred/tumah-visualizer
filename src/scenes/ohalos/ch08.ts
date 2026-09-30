import { container, kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 8:6 — two earthenware jars, each with half an olive's bulk of a corpse, in a house.
function jars(secondOpen: boolean): SceneObject[] {
  const jar = (id: string, x: number, sealed: boolean) =>
    container({ id, label: sealed ? 'Sealed earthenware jar' : 'Open earthenware jar', material: 'earthenware', at: [x, 3, 0], size: [2, 2, 2.5], wall: 0.25, sealed });
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4 }] }),
    jar('jar1', 1, true),
    jar('jar2', 5, !secondOpen),
    kezayis('half1', [1.75, 3.75, 0.25], 0.5),
    kezayis('half2', [5.75, 3.75, 0.25], 0.5),
    kli('kli-house', [1, 6.5, 0], 'Vessel in the house'),
  ];
}

export const ch08: Scenario[] = [
  {
    id: '8:6/both-sealed',
    ref: '8:6',
    title: { en: 'Two sealed jars, each with half an olive’s bulk', he: 'שתי חביות' },
    clause: { en: 'Sealed with tightly fitting lids, lying in a house, they remain clean, but the house becomes unclean.' },
    scene: () => ({ objects: jars(false) }),
    expect: { jar1: 'tahor', jar2: 'tahor', 'kli-house': 'tamei' },
  },
  {
    id: '8:6/one-open',
    ref: '8:6',
    title: { en: 'Two jars, one of them opened' },
    clause: { en: 'If one of them was opened, that [jar] and the house become unclean, but the other remains clean.' },
    scene: () => ({ objects: jars(true) }),
    expect: { jar1: 'tahor', jar2: 'tamei', 'kli-house': 'tamei' },
  },
];
