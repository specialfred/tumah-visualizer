import { box, boxesMinus, corpse, kezayis, kli, room, solid, type OpeningSpec } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 3:6, 7:3 — a house four amos square (24×24×8) with three doorways, 4 tefachim wide and 6 high, in walls a
// tefach thick. Each door sits at the inner face of the wall; a vessel stands in each doorway on
// the outside, under the lintel.
type DoorState = 'closed' | 'open' | 'intended';
function doorsHouse(doors: [DoorState, DoorState, DoorState], tumah: 'meis' | 'kezayis', window?: number): SceneObject[] {
  const specs: OpeningSpec[] = [
    { side: 'y-', offset: 10, width: 4, height: 6 },
    { side: 'x+', offset: 10, width: 4, height: 6 },
    { side: 'y+', offset: 10, width: 4, height: 6 },
  ].map((s, n) => ({
    ...s,
    side: s.side as OpeningSpec['side'],
    door: doors[n] !== 'open',
    intendedExit: doors[n] === 'intended',
    id: `door${n + 1}`,
  }));
  // Per Bartenura on 3:6, a window saves the doors when they intend to take the tumah out by it.
  if (window) specs.push({ side: 'x-', offset: 10, width: window, height: window, sill: 3, door: true, intendedExit: true, id: 'window' });
  return [
    ...room({ id: 'house', at: [0, 0], size: [24, 24, 8], openings: specs }),
    tumah === 'meis' ? corpse('tumah', [3, 9, 0]) : kezayis('tumah', [11.75, 11.75, 0]),
    kli('v1', [11.75, -0.75, 0], 'Vessel in the first doorway'),
    kli('v2', [24.25, 11.75, 0], 'Vessel in the second doorway'),
    kli('v3', [11.75, 24.25, 0], 'Vessel in the third doorway'),
  ];
}

// 7:1 — two houses side by side, sharing a wall 2 tefachim thick with a tefach-cube space in it
// holding tumah. One upper story is built over both houses, and a second over it.
function wallUnderStories(): SceneObject[] {
  const [left, ...leftDoors] = room({ id: 'left', label: { en: 'House', he: 'בית' }, at: [0, 0], size: [6, 6, 6], roof: 1, openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] });
  const right = room({ id: 'right', label: { en: 'Second house', he: 'בית שני' }, at: [8, 0], size: [6, 6, 6], roof: 1, openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] });
  const hollow = box([6.5, 2.5, 2], [1, 1, 1]);
  return [
    // The left house's x+ wall is the shared wall, widened to fill the gap between the houses.
    { ...left, parts: boxesMinus([...left.parts, box([6, -1, 0], [2, 8, 6])], [hollow]) },
    ...leftDoors,
    ...right.map((o) => (o.kind === 'structure' ? { ...o, parts: boxesMinus(o.parts, [hollow]) } : o)),
    ...room({ id: 'upper1', label: { en: 'Upper story over both houses', he: 'עלייה' }, at: [0, 0, 7], size: [14, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    ...room({ id: 'upper2', label: { en: 'Second upper story', he: 'עלייה שנייה' }, at: [0, 0, 14], size: [14, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
    kezayis('tumah', [6.75, 2.75, 2], 1, [0.5, 0.5, 0.25]),
    kli('kli-upper1', [1, 1, 7], 'Vessel in the upper story'),
    kli('kli-upper2', [1, 1, 14], 'Vessel in the second upper story'),
  ];
}

// 7:2 — a cloth tent on four poles, 6×6 and 6 high, with one side sloping down in steps of a
// tefach to half a tefach off the ground.
function slopingTent(tumahUnderSlope: boolean): SceneObject[] {
  const steps = [5, 4, 3, 2, 1, 0.5];
  const parts = [box([0, 0, 6], [6, 6, 0.25])];
  steps.forEach((z, k) => {
    const x = 6 + k;
    parts.push(box([x, 0, z], [1, 6, 0.25]));
    // A riser closing the step to the one above it.
    const above = k === 0 ? 6 : steps[k - 1];
    parts.push(box([x, 0, z + 0.25], [0.25, 6, above - z]));
  });
  const pole = (id: string, x: number, y: number) => solid(id, 'Pole', 'misc', 'wood', [x, y, 0], [0.25, 0.25, 6]);
  return [
    { id: 'tent', label: { en: 'Tent', he: 'אהל' }, kind: 'vessel', material: 'cloth', parts },
    pole('pole1', 0, 0),
    pole('pole2', 0, 5.75),
    pole('pole3', 5.75, 0),
    pole('pole4', 5.75, 5.75),
    tumahUnderSlope ? kezayis('tumah', [11.5, 3, 0], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [2, 3, 0]),
    tumahUnderSlope
      ? kli('kli-tent', [3, 1, 0], 'Vessel in the tent')
      : kli('kli-slope', [11.5, 3, 0], 'Vessel under the lowest part of the slope', [0.25, 0.25, 0.25]),
  ];
}

export const ch07: Scenario[] = [
  {
    id: '7:2/tumah-in-tent',
    ref: '7:2',
    title: { en: 'A tent sloping down to near the ground — tumah in the tent', he: 'כל שפועי אהלים כאהלים' },
    clause: { en: 'A ‘tent’ [whose sides] sloped downwards and finished off one fingerbreadth [from the ground]: if there is uncleanness in the ‘tent’, vessels beneath the slope become unclean.' },
    notes: 'The lowest part of the slope is too low for a tefach cube, but it is under the tent’s own side, so it is part of the tent.',
    scene: () => ({ objects: slopingTent(false) }),
    expect: { 'kli-slope': 'tamei' },
  },
  {
    id: '7:2/tumah-under-slope',
    ref: '7:2',
    title: { en: 'A tent sloping down to near the ground — tumah under the slope' },
    clause: { en: 'If there is uncleanness beneath the slope, vessels in the ‘tent’ become unclean.' },
    scene: () => ({ objects: slopingTent(true) }),
    expect: { 'kli-tent': 'tamei' },
  },
  {
    id: '7:1/one-upper-story',
    ref: '7:1',
    title: { en: 'Tumah in a tefach space in a wall, one upper story over two houses', he: 'עלייה אחת בנויה על גבי שני בתים' },
    clause: { en: 'If there was a single upper story [built] over two houses, that one becomes unclean but all upper stories above it remain clean.' },
    notes: 'The wall reaches up to the floor of the first upper story; the tumah, with no way out of its space, rises into it (Bartenura). The floor above it separates the stories higher up.',
    scene: () => ({ objects: wallUnderStories() }),
    expect: { 'kli-upper1': 'tamei', 'kli-upper2': 'tahor' },
  },
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
