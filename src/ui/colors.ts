import type { Material, ObjectResult, SceneObject } from '../engine/types';

export const STATUS_COLORS = {
  source: '#18181b',
  tamei7: '#e11d48',
  tameiErev: '#f59e0b',
  tahor: '#14b8a6',
};

const MATERIAL: Partial<Record<Material, string>> = {
  stone: '#a8a29e',
  marble: '#e7e5e4',
  earth: '#92400e',
  plaster: '#d6d3d1',
  wood: '#b08968',
  earthenware: '#c2410c',
  dung: '#78716c',
  reed: '#ca8a04',
};

export function objectColor(o: SceneObject, r: ObjectResult | undefined): string {
  if (o.kind === 'tumah') return STATUS_COLORS.source;
  if (!r || r.status === 'insusceptible') return MATERIAL[o.material] ?? '#a1a1aa';
  if (r.status === 'tamei') return r.sevenDay ? STATUS_COLORS.tamei7 : STATUS_COLORS.tameiErev;
  return STATUS_COLORS.tahor;
}
