import { kezayis, kli, solid } from '../../engine/build';
import { ETZBA, TEFACH, type Box } from '../../engine/types';
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

// 12:7 — a round stone pillar lying on its side in a garden, along x, `diameter` tefachim across.
// Its round section is built from etzba-thin slices. Tumah lies under its side, where the curve
// rises off the ground, and a vessel lies further along under the same side.
function lyingPillar(diameter: number): SceneObject[] {
  const r = (diameter * TEFACH) / 2; // in etzbaos
  const parts: Box[] = [];
  for (let k = 0; k < 2 * r; k++) {
    // The slice k etzbaos up spans the chord of the circle at its middle height, rounded out to
    // whole etzbaos so that the stone fills every cell its curve passes through.
    const dz = k + 0.5 - r;
    const half = Math.ceil(Math.sqrt(r * r - dz * dz));
    if (half > 0) parts.push({ min: [0, -half, k * ETZBA], size: [12 * TEFACH, 2 * half, ETZBA] });
  }
  // Just inside the edge of the pillar's shadow, where the space under the curve is tallest.
  const y = diameter / 2 - 0.5;
  return [
    { id: 'pillar', label: { en: `Round pillar, ${diameter * 3} tefachim around`, he: 'עמוד מוטל' }, kind: 'structure', material: 'stone', parts },
    kezayis('tumah', [2, y, 0], 1, [0.25, 0.25, 0.25]),
    kli('kli-under', [9, y, 0], 'Vessel under the side of the pillar, away from the tumah', [0.25, 0.25, 0.25]),
  ];
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
  {
    id: '12:7/24-around',
    ref: '12:7',
    title: { en: 'A pillar lying in the open, 24 tefachim around — tumah under its side', he: 'עמוד שהוא מוטל באויר' },
    clause: { en: 'If its circumference is twenty-four handbreadths, it brings uncleanness to everything under its side.' },
    notes: 'Eight tefachim across: a tefach cube fits between its curve and the ground at the side (Bartenura). The measure is reckoned with the Sages’ approximations; by exact geometry a pillar about seven tefachim across would already fit one.',
    scene: () => ({ objects: lyingPillar(8) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '12:7/18-around',
    ref: '12:7',
    title: { en: 'A pillar lying in the open, 18 tefachim around — tumah under its side' },
    clause: { en: 'But if it is not, the uncleanness cleaves upwards and downwards.' },
    scene: () => ({ objects: lyingPillar(6) }),
    expect: { 'kli-under': 'tahor' },
  },
];
