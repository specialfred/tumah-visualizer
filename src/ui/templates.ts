// Objects the user can add from the palette. Positions are in tefachim.
import { container, corpse, kezayis, kli, person, room, solid } from '../engine/build';
import type { SceneObject, Text, Vec3 } from '../engine/types';

export interface Template {
  id: string;
  label: Text;
  group: 'tumah' | 'vessels' | 'people' | 'building';
  make: (id: string, at: Vec3) => SceneObject[];
}

export const TEMPLATES: Template[] = [
  { id: 'kezayis', group: 'tumah', label: { en: 'Olive-bulk of a corpse', he: 'כזית מן המת' }, make: (id, at) => [kezayis(id, at)] },
  { id: 'half-kezayis', group: 'tumah', label: { en: 'Half an olive-bulk', he: 'חצי זית' }, make: (id, at) => [kezayis(id, at, 0.5)] },
  { id: 'corpse', group: 'tumah', label: { en: 'Corpse', he: 'מת' }, make: (id, at) => [corpse(id, at, 12)] },
  { id: 'kli', group: 'vessels', label: { en: 'Metal vessel', he: 'כלי מתכות' }, make: (id, at) => [kli(id, at, { en: 'Metal vessel', he: 'כלי מתכות' })] },
  {
    id: 'jar',
    group: 'vessels',
    label: { en: 'Earthenware jar', he: 'חבית של חרס' },
    make: (id, at) => [container({ id, label: { en: 'Earthenware jar', he: 'חבית' }, material: 'earthenware', at, size: [2, 2, 2.5] })],
  },
  {
    id: 'sealed-jar',
    group: 'vessels',
    label: { en: 'Sealed earthenware jar', he: 'חבית מוקפת צמיד פתיל' },
    make: (id, at) => [container({ id, label: { en: 'Sealed jar', he: 'חבית בצמיד פתיל' }, material: 'earthenware', at, size: [2, 2, 2.5], sealed: true })],
  },
  {
    id: 'chest',
    group: 'vessels',
    label: { en: 'Wooden chest', he: 'שידה' },
    make: (id, at) => [container({ id, label: { en: 'Wooden chest', he: 'שידה' }, material: 'wood', at, size: [3, 2, 2], mouth: 'none' })],
  },
  {
    id: 'cupboard',
    group: 'vessels',
    label: { en: 'Cupboard (40 se’ah)', he: 'מגדל' },
    make: (id, at) => [container({ id, label: { en: 'Cupboard (40 se’ah)', he: 'מגדל' }, material: 'wood', at, size: [3, 3, 5], mouth: 'none', volumeSeah: 40 })],
  },
  { id: 'plank', group: 'vessels', label: { en: 'Wooden board', he: 'טבלה' }, make: (id, at) => [solid(id, { en: 'Wooden board', he: 'טבלה' }, 'vessel', 'wood', at, [3, 3, 0.25])] },
  { id: 'person', group: 'people', label: { en: 'Person', he: 'אדם' }, make: (id, at) => [person(id, at, { en: 'Person', he: 'אדם' })] },
  { id: 'stone', group: 'building', label: { en: 'Stone slab', he: 'נדבך' }, make: (id, at) => [solid(id, { en: 'Stone slab', he: 'נדבך' }, 'misc', 'stone', at, [4, 4, 0.25])] },
  { id: 'pillar', group: 'building', label: { en: 'Stone pillar', he: 'עמוד' }, make: (id, at) => [solid(id, { en: 'Stone pillar', he: 'עמוד' }, 'misc', 'stone', at, [1, 1, 6])] },
  { id: 'beam', group: 'building', label: { en: 'Beam', he: 'קורה' }, make: (id, at) => [solid(id, { en: 'Beam', he: 'קורה' }, 'structure', 'wood', [at[0], at[1], 6], [8, 1, 0.5])] },
  { id: 'wall', group: 'building', label: { en: 'Wall', he: 'כותל' }, make: (id, at) => [solid(id, { en: 'Wall', he: 'כותל' }, 'structure', 'stone', at, [6, 1, 6])] },
  {
    id: 'house',
    group: 'building',
    label: { en: 'House with a doorway', he: 'בית' },
    make: (id, at) => room({ id, at: [at[0], at[1]], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }] }),
  },
  {
    id: 'closed-house',
    group: 'building',
    label: { en: 'House with a closed door', he: 'בית ודלת נעולה' },
    make: (id, at) => room({ id, at: [at[0], at[1]], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4, door: true }] }),
  },
  {
    id: 'hatch-house',
    group: 'building',
    label: { en: 'House with a hatch', he: 'בית וארובה' },
    make: (id, at) => room({ id, at: [at[0], at[1]], size: [6, 6, 6], openings: [{ side: 'y-', offset: 2, width: 2, height: 4 }], hatches: [[2.5, 2.5, 1, 1]] }),
  },
];
