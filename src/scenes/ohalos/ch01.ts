import { corpse, kli, person } from '../../engine/build';
import type { Scenario } from '../types';

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
      objects: [corpse('corpse', [0, 0, 0], 6), person('a', [6, 0, 0], 'First person'), person('b', [10, 0, 0], 'Second person')],
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
        corpse('corpse', [0, 0, 0], 6),
        kli('k1', [6, 0, 0], 'First vessel'),
        kli('k2', [6.5, 0, 0], 'Second vessel'),
        person('p', [7, 0, 0], 'Person touching the second vessel'),
        kli('k3', [6.5, 0.5, 0], 'Vessel touching the second vessel'),
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
        corpse('corpse', [0, 0, 0], 6),
        kli('k1', [6, 0, 0], 'Vessel touching the corpse'),
        person('p1', [6.5, 0, 0], 'Person touching the vessel'),
        kli('k2', [10.5, 0, 0], 'Vessel touching the person'),
        person('p2', [11, 0, 0], 'Fourth: a person'),
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
        corpse('corpse', [0, 0, 0], 6),
        person('p', [6, 0, 0], 'Person touching the corpse'),
        kli('k', [10, 0, 0], 'Vessel touching him'),
        kli('k2', [10.5, 0, 0], 'Third: a vessel'),
      ],
    }),
    expect: { p: 'tamei7', k: 'tamei7', k2: 'tameiErev' },
  },
];
