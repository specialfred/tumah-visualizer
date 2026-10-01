import { box, boxesMinus, container, kezayis, kli, room } from '../../engine/build';
import type { SceneObject } from '../../engine/types';
import type { Scenario } from '../types';

// 4:1 — a cupboard (מגדל) holding 40 se'ah, so it cannot become tamei, standing in a house.
// `gap` is its height off the floor.
function cupboardInHouse(gap: number, extra: SceneObject[]): SceneObject[] {
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 8], openings: [{ side: 'y-', offset: 3, width: 2, height: 5 }] }),
    container({
      id: 'cupboard',
      label: { en: 'Cupboard (40 se’ah)', he: 'מגדל' },
      material: 'wood',
      at: [4, 4, gap],
      size: [3, 3, 5],
      wall: 0.25,
      mouth: 'none',
      volumeSeah: 40,
    }),
    ...extra,
  ];
}

// 4:1 — the same kind of cupboard standing in the open (in a courtyard), its walls a tefach thick
// with a niche half a tefach square running through one of them, open inside and out, where small
// things are kept (Bartenura). One thing is inside the cupboard and the other in the niche.
function cupboardInOpen(tumahInNiche: boolean): SceneObject[] {
  const c = container({ id: 'cupboard', label: { en: 'Cupboard (40 se’ah)', he: 'מגדל' }, material: 'wood', at: [0, 0, 0], size: [6, 6, 6], wall: 1, mouth: 'none', volumeSeah: 40 });
  const inNiche: [number, number, number] = [5.5, 3, 3];
  const inside: [number, number, number] = [2, 2, 1];
  const small: [number, number, number] = [0.25, 0.25, 0.25];
  return [
    { ...c, parts: boxesMinus(c.parts, [box([5, 2.75, 2.75], [1, 0.5, 0.5])]) },
    kezayis('tumah', tumahInNiche ? inNiche : inside, 1, small),
    tumahInNiche ? kli('kli-inside', inside, 'Vessel inside the cupboard', small) : kli('kli-niche', inNiche, 'Needle in the niche', small),
  ];
}

// 4:2 — a drawer of the cupboard: a closed box of 40 se'ah holding a tefach cube of space, whose
// only outlet is a half-tefach hole facing into the house.
function drawer(tumahInside: boolean): SceneObject[] {
  const d = container({ id: 'drawer', label: { en: 'Drawer of the cupboard', he: 'תיבת המגדל' }, material: 'wood', at: [4, 3, 1], size: [1.5, 1.5, 1.5], wall: 0.25, mouth: 'none', volumeSeah: 40 });
  return [
    ...room({ id: 'house', at: [0, 0], size: [8, 8, 6], openings: [{ side: 'y-', offset: 3, width: 2, height: 5 }] }),
    { ...d, parts: boxesMinus(d.parts, [box([4, 3.5, 1.5], [0.25, 0.5, 0.5])]) },
    tumahInside ? kezayis('tumah', [4.5, 3.5, 1.25], 1, [0.25, 0.25, 0.25]) : kezayis('tumah', [1, 6, 0]),
    tumahInside ? kli('kli-house', [1, 6, 0], 'Vessel in the house') : kli('kli-drawer', [4.75, 4, 1.25], 'Vessel in the drawer', [0.25, 0.25, 0.25]),
  ];
}

export const ch04: Scenario[] = [
  {
    id: '4:1/in-open/tumah-inside',
    ref: '4:1',
    title: { en: 'A cupboard in the open — tumah inside it, a vessel in a niche in its wall', he: 'מגדל שהוא עומד באויר' },
    clause: { en: 'If there is uncleanness within it, vessels in the [niches in the] thickness [of its walls] remain clean.' },
    scene: () => ({ objects: cupboardInOpen(false) }),
    expect: { 'kli-niche': 'tahor' },
  },
  {
    id: '4:1/in-open/tumah-in-niche',
    ref: '4:1',
    title: { en: 'A cupboard in the open — tumah in a niche in its wall, a vessel inside' },
    clause: { en: 'If there is uncleanness in [the niches in] its thickness, vessels inside [the cupboard] remain clean.' },
    notes: 'The niche is too small to be a tent; the cupboard, which cannot become tamei, keeps the tumah out of its inside, so it breaks up and down.',
    scene: () => ({ objects: cupboardInOpen(true) }),
    expect: { 'kli-inside': 'tahor' },
  },
  {
    id: '4:1/in-house/tumah-inside',
    ref: '4:1',
    title: { en: 'Cupboard in a house — tumah inside it', he: 'מגדל העומד בבית, טומאה בתוכו' },
    clause: { en: 'When it is standing inside a house: If there is uncleanness inside [the cupboard], the house is unclean.' },
    scene: () => ({ objects: cupboardInHouse(0, [kezayis('tumah', [5, 5, 0.25]), kli('kli-house', [1, 1, 0], 'Vessel in the house')]) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '4:1/in-house/tumah-in-house',
    ref: '4:1',
    title: { en: 'Cupboard in a house — tumah in the house' },
    clause: { en: 'If there is uncleanness in the house that which is within [the cupboard] remains clean, for the manner of uncleanness is to go out and not to go in.' },
    scene: () => ({ objects: cupboardInHouse(0, [kezayis('tumah', [1, 1, 0]), kli('kli-cupboard', [5, 5, 0.25], 'Vessel in the cupboard')]) }),
    expect: { 'kli-cupboard': 'tahor' },
  },
  {
    id: '4:1/gap-tefach/vessels-under',
    ref: '4:1',
    title: { en: 'Vessels under the cupboard, with a tefach of space' },
    clause: { en: 'Vessels which are between [the cupboard] and the ground... If there is a space of one cubic handbreadth there, they become unclean.' },
    scene: () => ({ objects: cupboardInHouse(1, [kezayis('tumah', [1, 1, 0]), kli('kli-under', [5, 5, 0], 'Vessel under the cupboard')]) }),
    expect: { 'kli-under': 'tamei' },
  },
  {
    id: '4:1/gap-small/vessels-under',
    ref: '4:1',
    title: { en: 'Vessels under the cupboard, with less than a tefach of space' },
    clause: { en: 'If not they remain clean.' },
    scene: () => ({
      objects: cupboardInHouse(0.5, [kezayis('tumah', [1, 1, 0]), kli('kli-under', [5, 5, 0], 'Vessel under the cupboard', [0.25, 0.25, 0.25])]),
    }),
    expect: { 'kli-under': 'tahor' },
  },
  {
    id: '4:1/gap-small/tumah-under',
    ref: '4:1',
    title: { en: 'Tumah under the cupboard, with less than a tefach of space' },
    clause: { en: 'If there is uncleanness there, the house becomes unclean.' },
    scene: () => ({
      objects: cupboardInHouse(0.5, [kezayis('tumah', [5, 5, 0], 1, [0.25, 0.25, 0.25]), kli('kli-house', [1, 1, 0], 'Vessel in the house')]),
    }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '4:2/tumah-inside',
    ref: '4:2',
    title: { en: 'A drawer with a small outlet — tumah inside', he: 'תיבת המגדל' },
    clause: { en: 'If there is uncleanness inside it, the house becomes unclean.' },
    notes: 'In the end the tumah will come out, even through the small outlet, so it goes out now (Bartenura).',
    scene: () => ({ objects: drawer(true) }),
    expect: { 'kli-house': 'tamei' },
  },
  {
    id: '4:2/tumah-in-house',
    ref: '4:2',
    title: { en: 'A drawer with a small outlet — tumah in the house' },
    clause: { en: 'But if there is uncleanness in the house, that which is within [the drawer] remains clean, for the manner of uncleanness is to go out and not to go in.' },
    scene: () => ({ objects: drawer(false) }),
    expect: { 'kli-drawer': 'tahor' },
  },
  {
    id: '4:2/tumah-inside/yose',
    ref: '4:2',
    title: { en: 'A drawer with a small outlet — tumah inside (Rabbi Yose)' },
    clause: { en: 'Rabbi Yose declares [the house] clean, since he can remove [the uncleanness] by halves or burn it where it stands.' },
    shittos: { 'drawer-halves': 'yose' },
    scene: () => ({ objects: drawer(true) }),
    expect: { 'kli-house': 'tahor' },
  },
];
