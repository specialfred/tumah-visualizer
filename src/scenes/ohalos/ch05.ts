import { container, kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 5:3 — a house with an upper story; a hatch a tefach square between them. A whole earthenware pot
// stands in the upper story over the hatch, covering it. Its mouth is up, so its back faces the
// tumah in the house (Bartenura on 5:2), or it is turned over, mouth down over the hatch.
function potOverHatch(mouth: 'top' | 'bottom'): SceneObject[] {
  const door = [{ side: 'y-' as const, offset: 0.5, width: 1.5, height: 4 }];
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], hatches: [[3.5, 3.5, 1, 1]], openings: door }),
    ...room({ id: 'upper', label: { en: 'Upper story', he: 'עלייה' }, at: [0, 0, 7], size: [8, 8, 6], openings: door }),
    container({ id: 'pot', label: { en: 'Whole earthenware pot', he: 'קדרה שלמה' }, material: 'earthenware', at: [3, 3, 7], size: [2, 2, 2], mouth }),
    kezayis('tumah', [6, 6, 0]),
    kli('kli-upper', [6, 6, 7], 'Vessel in the upper story'),
  ];
}

export const ch05: Scenario[] = [
  {
    id: '5:3/whole-pot',
    ref: '5:3',
    title: { en: 'A whole earthenware pot over a hatch, its back to the tumah', he: 'היתה שלמה' },
    clause: { en: 'If [the pot] was whole: Bet Hillel says: it protects all [from uncleanness].' },
    notes:
      'Earthenware cannot become tamei from its back, so the pot blocks the tumah coming up at it (Bartenura on 5:2). Beis Hillel later agreed with Beis Shammai that the pot of one not careful about purity protects only food, drink and earthenware; the engine does not model whose pot it is.',
    scene: () => ({ objects: potOverHatch('top') }),
    expect: { 'kli-upper': 'tahor', pot: 'tahor' },
  },
  {
    id: '5:3/pot-mouth-down',
    ref: '5:3',
    title: { en: 'The same pot turned mouth down over the hatch' },
    clause: { en: 'If [the pot] was whole: Bet Hillel says: it protects all [from uncleanness].' },
    notes: 'Turned over, its inside faces the tumah: it becomes tamei and protects nothing (Bartenura on 5:2: the back of the pot faces the tumah).',
    scene: () => ({ objects: potOverHatch('bottom') }),
    expect: { 'kli-upper': 'tamei', pot: 'tamei' },
  },
];
