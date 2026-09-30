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

// 12:5 — roof beams of a house and of its upper story, with no plaster over them. Lower beams a
// tefach wide with a tefach between them, six tefachim up; upper beams three tefachim above.
function beams(staggered: boolean, where: 'under' | 'between'): SceneObject[] {
  const objs: SceneObject[] = [
    solid('wall-a', 'Wall', 'structure', 'stone', [-1, -1, 0], [1, 10, 10]),
    solid('wall-b', 'Wall', 'structure', 'stone', [9, -1, 0], [1, 10, 10]),
  ];
  for (let n = 0; n < 4; n++) {
    objs.push(solid(`lower${n}`, 'Lower beam', 'structure', 'wood', [-1, 2 * n, 6], [11, 1, 0.5]));
    objs.push(solid(`upper${n}`, 'Upper beam', 'structure', 'wood', [-1, 2 * n + (staggered ? 1 : 0), 9], [11, 1, 0.5]));
  }
  objs.push(
    where === 'under' ? kezayis('tumah', [2, 2.25, 0]) : kezayis('tumah', [2, 2.25, 6.5]),
    kli('v-same', [6, 2.25, 0], 'Vessel under the same lower beam'),
    kli('v-other', [6, 4.25, 0], 'Vessel under another lower beam'),
    kli('v-between', [6, 2.25, 6.5], 'Vessel on the same lower beam, under the upper one'),
  );
  return objs;
}

export const ch12: Scenario[] = [
  {
    id: '12:5/aligned/under',
    ref: '12:5',
    title: { en: 'Beams in line, without plaster — tumah under one', he: 'קורות הבית והעלייה' },
    clause: { en: 'If there is uncleanness beneath one of them, all beneath that one becomes unclean.' },
    scene: () => ({ objects: beams(false, 'under') }),
    expect: { 'v-same': 'tamei', 'v-other': 'tahor', 'v-between': 'tahor' },
  },
  {
    id: '12:5/aligned/between',
    ref: '12:5',
    title: { en: 'Beams in line — tumah between a lower and an upper beam' },
    clause: { en: 'If it is between a lower and an upper [beam] what is between them becomes unclean.' },
    scene: () => ({ objects: beams(false, 'between') }),
    expect: { 'v-between': 'tamei', 'v-same': 'tahor' },
  },
  {
    id: '12:5/staggered/under',
    ref: '12:5',
    title: { en: 'Upper beams over the gaps — tumah under one' },
    clause: { en: 'Where the upper [roof beams] were [over the gaps] between the lower: If there is uncleanness beneath one of them, what is beneath all of them becomes unclean.' },
    scene: () => ({ objects: beams(true, 'under') }),
    expect: { 'v-same': 'tamei', 'v-other': 'tamei' },
  },
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
