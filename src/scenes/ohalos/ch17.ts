import { kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 17:5 — a house with an upper story built on a field where a grave was lost. The grave could be
// anywhere; each scenario puts it in one place it might be. The house's doorway is on the near
// side; the upper story's doorway is directly above it, or off to one side.
type Grave = 'under-house' | 'under-threshold' | 'under-upper-doorway';
function fieldHouse(aligned: boolean, grave: Grave): SceneObject[] {
  const upperDoor = aligned ? 1 : 5;
  const at: Record<Grave, [number, number, number]> = {
    'under-house': [4, 3, -1],
    'under-threshold': [1.75, -0.75, -1],
    // Under the wall of the house, directly below the upper story's doorway.
    'under-upper-doorway': [upperDoor + 0.75, -0.75, -1],
  };
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 1, width: 2, height: 4 }] }),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, 7], size: [8, 6, 6], openings: [{ side: 'y-', offset: upperDoor, width: 2, height: 4 }] }),
    kezayis('tumah', at[grave]),
    kli('kli-house', [6.5, 4.5, 0], 'Vessel in the house'),
    kli('kli-upper', [6.5, 4.5, 7], 'Vessel in the upper story'),
  ];
}

export const ch17: Scenario[] = [
  {
    id: '17:5/aligned/under-house',
    ref: '17:5',
    title: { en: 'A house on a field with a lost grave, doorways aligned — the grave under the house', he: 'שדה שאבד בה קבר' },
    clause: { en: 'If the entrance of the upper room was directly above the entrance of the house, the upper story remains clean.' },
    notes: 'The olive-bulk stands for the grave. Bartenura: whichever way you turn, if the grave is within the house, the house is tamei and the upper story tahor.',
    scene: () => ({ objects: fieldHouse(true, 'under-house') }),
    expect: { 'kli-house': 'tamei', 'kli-upper': 'tahor' },
  },
  {
    id: '17:5/aligned/under-threshold',
    ref: '17:5',
    title: { en: 'Doorways aligned — the grave under the threshold' },
    clause: { en: 'If the entrance of the upper room was directly above the entrance of the house, the upper story remains clean.' },
    notes: 'Bartenura: under the threshold, the tumah comes into the house, and the upper story is tahor.',
    scene: () => ({ objects: fieldHouse(true, 'under-threshold') }),
    expect: { 'kli-house': 'tamei', 'kli-upper': 'tahor' },
  },
  {
    id: '17:5/offset/under-upper-doorway',
    ref: '17:5',
    title: { en: 'Doorways not aligned — the grave under the wall below the upper doorway' },
    clause: { en: 'But if not the upper story becomes unclean.' },
    notes: 'Bartenura: we fear the grave is under the wall below the upper story’s doorway; the tumah breaks up through the wall to that doorway and comes in.',
    scene: () => ({ objects: fieldHouse(false, 'under-upper-doorway') }),
    expect: { 'kli-upper': 'tamei' },
  },
];
