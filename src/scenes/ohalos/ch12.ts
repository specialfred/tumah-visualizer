import { kezayis, kli, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 12:6 — a beam laid from one wall to another, six tefachim up, with tumah under it.
function beamScene(width: number): SceneObject[] {
  return [
    solid('wall-a', 'Wall', 'structure', 'stone', [-1, 0, 0], [1, 3, 6]),
    solid('wall-b', 'Wall', 'structure', 'stone', [8, 0, 0], [1, 3, 6]),
    solid('beam', { en: `Beam, ${width} tefach wide`, he: 'קורה' }, 'structure', 'wood', [-1, 1, 6], [10, width, 0.5]),
    kezayis('tumah', [1.5, 1, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-under', [5.5, 1, 0], 'Vessel under the beam, away from the tumah', [0.25, 0.25, 0.25]),
    kli('kli-over', [1.5, 1, 6.5], 'Vessel on the beam, directly over the tumah', [0.25, 0.25, 0.25]),
  ];
}

export const ch12: Scenario[] = [
  {
    id: '12:6/tefach-wide',
    ref: '12:6',
    title: { en: 'A beam a tefach wide over tumah', he: 'קורה שהיא נתונה מכותל לכותל' },
    clause: { en: 'If it is one handbreadth wide, it conveys uncleanness to everything beneath it.' },
    scene: () => ({ objects: beamScene(1) }),
    expect: { 'kli-under': 'tamei', 'kli-over': 'tahor' },
  },
  {
    id: '12:6/narrow',
    ref: '12:6',
    title: { en: 'A beam narrower than a tefach over tumah' },
    clause: { en: 'If it is not [one handbreadth wide], the uncleanness cleaves upwards and downwards.' },
    scene: () => ({ objects: beamScene(0.75) }),
    expect: { 'kli-under': 'tahor', 'kli-over': 'tamei' },
  },
];
