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

export const ch11: Scenario[] = [
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
];
