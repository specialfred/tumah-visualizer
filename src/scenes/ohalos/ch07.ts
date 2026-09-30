import { corpse, kezayis, kli, room, type OpeningSpec } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 3:6, 7:3 — a house (10×10×8) with three doorways, 4 tefachim wide and 6 high, in walls a
// tefach thick. Each door sits at the inner face of the wall; a vessel stands in each doorway on
// the outside, under the lintel.
type DoorState = 'closed' | 'open' | 'intended';
function doorsHouse(doors: [DoorState, DoorState, DoorState], tumah: 'meis' | 'kezayis', window?: number): SceneObject[] {
  const specs: OpeningSpec[] = [
    { side: 'y-', offset: 3, width: 4, height: 6 },
    { side: 'x+', offset: 3, width: 4, height: 6 },
    { side: 'y+', offset: 3, width: 4, height: 6 },
  ].map((s, n) => ({
    ...s,
    side: s.side as OpeningSpec['side'],
    door: doors[n] !== 'open',
    intendedExit: doors[n] === 'intended',
    id: `door${n + 1}`,
  }));
  // Per Bartenura on 3:6, a window saves the doors when they intend to take the tumah out by it.
  if (window) specs.push({ side: 'x-', offset: 4, width: window, height: window, sill: 3, door: true, intendedExit: true, id: 'window' });
  return [
    ...room({ id: 'house', at: [0, 0], size: [10, 10, 8], openings: specs }),
    tumah === 'meis' ? corpse('tumah', [1, 4, 0], 6) : kezayis('tumah', [4, 4, 0]),
    kli('v1', [4.75, -0.75, 0], 'Vessel in the first doorway'),
    kli('v2', [10.25, 4.75, 0], 'Vessel in the second doorway'),
    kli('v3', [4.75, 10.25, 0], 'Vessel in the third doorway'),
  ];
}

export const ch07: Scenario[] = [
  {
    id: '7:3/all-closed',
    ref: '7:3',
    title: { en: 'A corpse in a house with many closed doors', he: 'המת בבית ולו פתחים הרבה' },
    clause: { en: 'If a corpse is in a house in which there are many doors, they all become unclean.' },
    scene: () => ({ objects: doorsHouse(['closed', 'closed', 'closed'], 'meis') }),
    expect: { v1: 'tamei', v2: 'tamei', v3: 'tamei' },
  },
  {
    id: '7:3/one-open',
    ref: '7:3',
    title: { en: 'One of the doors is opened' },
    clause: { en: 'If one of them was opened, that one becomes unclean but all the rest remain clean.' },
    scene: () => ({ objects: doorsHouse(['closed', 'open', 'closed'], 'meis') }),
    expect: { v1: 'tahor', v2: 'tamei', v3: 'tahor' },
  },
  {
    id: '7:3/intent',
    ref: '7:3',
    title: { en: 'They intend to carry the corpse out through one door' },
    clause: { en: 'If he intended to carry out the corpse through one of them... he protects all the other doors.' },
    scene: () => ({ objects: doorsHouse(['closed', 'closed', 'intended'], 'meis') }),
    expect: { v1: 'tahor', v2: 'tahor', v3: 'tamei' },
  },
  {
    id: '3:6/kezayis-window',
    ref: '3:6',
    title: { en: 'An olive’s bulk, to be taken out by a window of a tefach', he: 'כזית מן המת פתחו בטפח' },
    clause: { en: 'For an olive-sized portion of a corpse, an opening of one handbreadth [square is enough] to prevent the uncleanness from [spreading to the other] openings.' },
    scene: () => ({ objects: doorsHouse(['closed', 'closed', 'closed'], 'kezayis', 1) }),
    expect: { v1: 'tahor', v2: 'tahor', v3: 'tahor' },
  },
  {
    id: '3:6/corpse-window',
    ref: '3:6',
    title: { en: 'A whole corpse, to be taken out by a window of a tefach' },
    clause: { en: 'And for a [whole] corpse, an opening of four handbreadths [square].' },
    scene: () => ({ objects: doorsHouse(['closed', 'closed', 'closed'], 'meis', 1) }),
    expect: { v1: 'tamei', v2: 'tamei', v3: 'tamei' },
  },
  {
    id: '3:6/corpse-big-window',
    ref: '3:6',
    title: { en: 'A whole corpse, to be taken out by a window of four tefachim' },
    clause: { en: 'And for a [whole] corpse, an opening of four handbreadths [square, is enough] to prevent the uncleanness from [spreading to the other] openings.' },
    scene: () => ({ objects: doorsHouse(['closed', 'closed', 'closed'], 'meis', 4) }),
    expect: { v1: 'tahor', v2: 'tahor', v3: 'tahor' },
  },
];
