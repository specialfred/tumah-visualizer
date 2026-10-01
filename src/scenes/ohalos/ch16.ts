import { kezayis, kli, person, solid } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 16:2 — a pot seller carries a yoke on his shoulder, 3 amos up, one end over a grave. A pot hangs
// from the far end, below the yoke.
function yokeOverGrave(width: number): SceneObject[] {
  return [
    solid('yoke', { en: `Yoke, ${width} tefach wide`, he: 'כלונס' }, 'vessel', 'wood', [-3, 0, 12], [14, width, 0.5]),
    person('seller', [2, -2.5, 0], { en: 'The pot seller', he: 'הקדר' }, 12, [3, 3]),
    kezayis('tumah', [-2, 0, 0], 1, [0.5, 0.5, 0.25]),
    kli('pot', [8.25, 0, 9], { en: 'Pot hanging from the far end', he: 'כלים שבצד השני' }, [0.5, 0.5, 1]),
  ];
}

export const ch16: Scenario[] = [
  {
    id: '16:2/yoke/narrow',
    ref: '16:2',
    title: { en: 'A yoke over a grave, narrower than a tefach', he: 'הקדר שהיה עובר' },
    clause: { en: 'A pot seller passes by a grave with a yoke over his shoulder, one end of which overshadows a grave, vessels on the other side remain clean.' },
    notes: 'The olive-bulk stands for the grave. The yoke is too narrow to make a tent, so the tumah only breaks straight up and down.',
    scene: () => ({ objects: yokeOverGrave(0.75) }),
    expect: { pot: 'tahor' },
  },
  {
    id: '16:2/yoke/tefach',
    ref: '16:2',
    title: { en: 'A yoke over a grave, a tefach wide' },
    clause: { en: 'If the yoke is one handbreadth wide, they become unclean.' },
    scene: () => ({ objects: yokeOverGrave(1) }),
    expect: { pot: 'tamei' },
  },
];
