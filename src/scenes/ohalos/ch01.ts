import { corpse, kli, person } from '../../engine/build';
import type { Vec3 } from '../../engine/types';
import type { Scenario } from '../types';

// Vessels here are pots three tefachim on a side, so they read at the scale of a person.
const POT: Vec3 = [3, 3, 3];

// Chains of contact. The corpse lies in the open so that only touching matters.
export const ch01: Scenario[] = [
  {
    id: '1:1/person-person',
    ref: '1:1',
    title: { en: 'Two: a person touching the corpse, and a person touching him', he: 'שנים' },
    clause: {
      en: 'A person who touches a corpse is defiled with seven days’ defilement and a person who touches him is defiled with a defilement lasting until the evening.',
    },
    scene: () => ({
      objects: [corpse('corpse', [0, 0, 0]), person('a', [18, 0, 0], 'First person'), person('b', [24, 0, 0], 'Second person')],
    }),
    expect: { a: 'tamei7', b: 'tameiErev' },
  },
  {
    id: '1:2/vessels',
    ref: '1:2',
    title: { en: 'Three: vessels touching the corpse and vessels touching them', he: 'שלשה' },
    clause: {
      en: 'Vessels touching a corpse and [other] vessels [touching these] vessels are defiled with seven days’ defilement. The third: whether a person or vessels, is defiled with a defilement lasting until the evening.',
    },
    scene: () => ({
      objects: [
        corpse('corpse', [0, 0, 0]),
        kli('k1', [18, 0, 0], 'First vessel', POT),
        kli('k2', [21, 0, 0], 'Second vessel', POT),
        person('p', [24, 0, 0], 'Person touching the second vessel'),
        // Narrower, so it touches only the second vessel and not the person beside it.
        kli('k3', [21, 3, 0], 'Vessel touching the second vessel', [2.5, 3, 3]),
      ],
    }),
    expect: { k1: 'tamei7', k2: 'tamei7', p: 'tameiErev', k3: 'tameiErev' },
  },
  {
    id: '1:3/person-in-middle',
    ref: '1:3',
    title: { en: 'Four: vessels, a person, and vessels', he: 'ארבעה' },
    clause: {
      en: 'Vessels touching a corpse, a person [touching these] vessels, and [other] vessels [touching this] person, are defiled with seven days’ defilement. The fourth, whether a person or vessels, is defiled with a defilement [lasting until the] evening.',
    },
    scene: () => ({
      objects: [
        corpse('corpse', [0, 0, 0]),
        kli('k1', [18, 0, 0], 'Vessel touching the corpse', POT),
        person('p1', [21, 0, 0], 'Person touching the vessel'),
        kli('k2', [27, 0, 0], 'Vessel touching the person', POT),
        person('p2', [30, 0, 0], 'Fourth: a person'),
      ],
    }),
    expect: { k1: 'tamei7', p1: 'tamei7', k2: 'tamei7', p2: 'tameiErev' },
  },
  {
    id: '1:4/person-first',
    ref: '1:4',
    title: { en: 'A person not in the middle: three', he: 'אדם שאינו באמצע' },
    clause: {
      en: 'Whenever they are in the middle of a [series] there can be four, whereas when they are not in the middle there can be [only] three.',
    },
    scene: () => ({
      objects: [
        corpse('corpse', [0, 0, 0]),
        person('p', [18, 0, 0], 'Person touching the corpse'),
        kli('k', [24, 0, 0], 'Vessel touching him', POT),
        kli('k2', [27, 0, 0], 'Third: a vessel', POT),
      ],
    }),
    expect: { p: 'tamei7', k: 'tamei7', k2: 'tameiErev' },
  },
];
