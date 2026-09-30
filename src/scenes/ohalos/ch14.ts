import { kezayis, kli, room, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 14:5–14:7 — two projections (זיזים) from a wall, one above the other.
type Where = 'under' | 'between' | 'above';
function projections(width: number, gap: number, where: Where, overhang = 0): SceneObject[] {
  const lowerZ = 6;
  const upperZ = lowerZ + 0.5 + gap;
  const tumahAt: Record<Where, [number, number, number]> = {
    under: [1, 0.25, 0],
    between: [1, 0.25, lowerZ + 0.5],
    above: [1, 0.25, upperZ + 0.5],
  };
  return [
    solid('wall', 'Wall', 'structure', 'stone', [-1, -1, 0], [8, 1, 14]),
    solid('lower', { en: 'Lower projection', he: 'זיז התחתון' }, 'structure', 'stone', [-1, 0, lowerZ], [8, width, 0.5]),
    solid('upper', { en: 'Upper projection', he: 'זיז העליון' }, 'structure', 'stone', [-1, 0, upperZ], [8, width + overhang, 0.5]),
    kezayis('tumah', tumahAt[where], 1, [0.25, 0.25, 0.25]),
    kli('v-under', [5, Math.min(0.25, width - 0.25), 0], 'Vessel under the lower projection', [0.25, 0.25, 0.25]),
    kli('v-between', [5, 0.25, lowerZ + 0.5], 'Vessel between the projections', [0.25, 0.25, 0.25]),
    kli('v-above', [1, 0.25, upperZ + 3], 'Vessel directly above the tumah, over the upper projection', [0.25, 0.25, 0.25]),
  ];
}

// 14:2 — a house with its door closed (set in the outer face of the wall) and tumah inside. A
// projection juts out from the wall over the doorway, `width` tefachim; a vessel stands under it.
function projectionOverDoor(width: number): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 6, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 4, door: true, doorAt: 'outer', id: 'door' }] }),
    solid('projection', { en: `Projection over the doorway, ${width} tefach wide`, he: 'זיז' }, 'structure', 'stone', [2, -1 - width, 4], [4, width, 0.5]),
    kezayis('tumah', [4, 3, 0]),
    kli('kli-outside', [3.875, -1 - width + 0.125, 0], 'Vessel under the projection', [0.25, 0.25, 0.25]),
  ];
}

export const ch14: Scenario[] = [
  {
    id: '14:2/door/tefach',
    ref: '14:2',
    title: { en: 'A projection a tefach wide over a closed doorway', he: 'זיז שעל גבי הפתח' },
    clause: { en: 'A projection that is above a doorway forms a passage for the uncleanness when it is one handbreadth wide.' },
    notes: 'The doorway is closed (Bartenura): the tumah will be carried out through it, and the projection makes a tent in its way.',
    scene: () => ({ objects: projectionOverDoor(1) }),
    expect: { 'kli-outside': 'tamei' },
  },
  {
    id: '14:2/door/narrow',
    ref: '14:2',
    title: { en: 'A projection narrower than a tefach over a closed doorway' },
    clause: { en: '...when it is one handbreadth wide.' },
    scene: () => ({ objects: projectionOverDoor(0.75) }),
    expect: { 'kli-outside': 'tahor' },
  },
  {
    id: '14:5/tefach-apart/under',
    ref: '14:5',
    title: { en: 'Projections a tefach wide, a tefach apart — tumah beneath', he: 'שני זיזין זה על גב זה' },
    clause: { en: 'If there is uncleanness beneath them, what is beneath them becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'under') }),
    expect: { 'v-under': 'tamei', 'v-between': 'tahor' },
  },
  {
    id: '14:5/tefach-apart/between',
    ref: '14:5',
    title: { en: 'Projections a tefach wide, a tefach apart — tumah between' },
    clause: { en: 'If it is between them, what is between them becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'between') }),
    expect: { 'v-under': 'tahor', 'v-between': 'tamei' },
  },
  {
    id: '14:5/tefach-apart/above',
    ref: '14:5',
    title: { en: 'Projections a tefach wide, a tefach apart — tumah above' },
    clause: { en: 'Above them, everything directly [above] to the sky becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'above') }),
    expect: { 'v-above': 'tamei', 'v-between': 'tahor', 'v-under': 'tahor' },
  },
  {
    id: '14:5/overlap-tefach/under',
    ref: '14:5',
    title: { en: 'The upper projects a tefach beyond the lower — tumah beneath' },
    clause: { en: 'If the upper [projection] overlapped the lower to the extent of one handbreadth: If there is uncleanness beneath or between them, what is beneath and between them becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'under', 1) }),
    expect: { 'v-under': 'tamei', 'v-between': 'tamei' },
  },
  {
    id: '14:5/overlap-tefach/between',
    ref: '14:5',
    title: { en: 'The upper projects a tefach beyond the lower — tumah between' },
    clause: { en: 'If there is uncleanness beneath or between them, what is beneath and between them becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'between', 1) }),
    expect: { 'v-under': 'tamei', 'v-between': 'tamei' },
  },
  {
    id: '14:5/overlap-less/under',
    ref: '14:5',
    title: { en: 'The upper projects less than a tefach beyond the lower — tumah beneath' },
    clause: { en: 'If the upper [projection] overlapped the lower to an extent of less than a handbreadth: If there is uncleanness beneath them, what is beneath and between them becomes unclean.' },
    scene: () => ({ objects: projections(1, 1, 'under', 0.5) }),
    expect: { 'v-under': 'tamei', 'v-between': 'tamei' },
    status: 'pending',
    notes: 'Tumah beneath reaches the space between through a gap smaller than a tefach. The engine only joins spaces through a tefach opening; this needs the reading of the commentators on how tumah rises into the upper space here.',
  },
  {
    id: '14:6/no-space/under',
    ref: '14:6',
    title: { en: 'Projections a tefach wide, less than a tefach apart — tumah beneath', he: 'אין ביניהם פותח טפח' },
    clause: { en: 'If there is uncleanness beneath them, what is beneath becomes unclean.' },
    scene: () => ({ objects: projections(1, 0.5, 'under') }),
    expect: { 'v-under': 'tamei', 'v-above': 'tahor' },
  },
  {
    id: '14:6/no-space/between',
    ref: '14:6',
    title: { en: 'Projections a tefach wide, less than a tefach apart — tumah between' },
    clause: { en: 'If it is between them or above them, everything directly [above] to the sky becomes unclean.' },
    scene: () => ({ objects: projections(1, 0.5, 'between') }),
    expect: { 'v-above': 'tamei', 'v-under': 'tahor' },
  },
  {
    id: '14:7/narrow/under',
    ref: '14:7',
    title: { en: 'Projections narrower than a tefach — tumah beneath', he: 'אין בהן פותח טפח' },
    clause: { en: 'If they did not have a width of a handbreadth... if there is uncleanness beneath, between or above them, the uncleanness cleaves upwards and downwards.' },
    scene: () => ({ objects: projections(0.75, 1, 'under') }),
    expect: { 'v-under': 'tahor', 'v-above': 'tamei' },
  },
];
