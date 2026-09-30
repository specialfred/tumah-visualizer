// Helpers for building scenes. All helper arguments are in tefachim (fractions allowed down to a
// quarter, i.e. one etzba) and converted to grid units here.
import { TEFACH, type Box, type Material, type ObjectKind, type SceneObject, type Text, type Vec3 } from './types';

const u = (t: number) => Math.round(t * TEFACH);
const uv = (v: Vec3): Vec3 => [u(v[0]), u(v[1]), u(v[2])];

export const box = (min: Vec3, size: Vec3): Box => ({ min: uv(min), size: uv(size) });

/** Subtract `hole` from `b`, returning up to six disjoint boxes. */
export function boxMinus(b: Box, hole: Box): Box[] {
  const lo = hole.min.map((v, k) => Math.max(v, b.min[k]));
  const hi = hole.min.map((v, k) => Math.min(v + hole.size[k], b.min[k] + b.size[k]));
  if (lo.some((v, k) => v >= hi[k])) return [b];
  const out: Box[] = [];
  const bmax = b.min.map((v, k) => v + b.size[k]);
  let cur = { min: [...b.min] as Vec3, max: [...bmax] as Vec3 };
  for (let k = 0; k < 3; k++) {
    if (cur.min[k] < lo[k]) {
      const max = [...cur.max] as Vec3;
      max[k] = lo[k];
      out.push({ min: [...cur.min] as Vec3, size: max.map((v, j) => v - cur.min[j]) as Vec3 });
      cur.min[k] = lo[k];
    }
    if (cur.max[k] > hi[k]) {
      const min = [...cur.min] as Vec3;
      min[k] = hi[k];
      out.push({ min, size: cur.max.map((v, j) => v - min[j]) as Vec3 });
      cur.max[k] = hi[k];
    }
  }
  return out.filter((x) => x.size.every((s) => s > 0));
}

export function boxesMinus(bs: Box[], holes: Box[]): Box[] {
  let cur = bs;
  for (const h of holes) cur = cur.flatMap((b) => boxMinus(b, h));
  return cur;
}

const txt = (label: string | Text): Text => (typeof label === 'string' ? { en: label } : label);

export function solid(
  id: string,
  label: string | Text,
  kind: ObjectKind,
  material: Material,
  min: Vec3,
  size: Vec3,
  extra: Partial<SceneObject> = {},
): SceneObject {
  return { id, label: txt(label), kind, material, parts: [box(min, size)], ...extra };
}

export const stoneSlab = (id: string, label: string | Text, min: Vec3, size: Vec3, extra: Partial<SceneObject> = {}) =>
  solid(id, label, 'structure', 'stone', min, size, extra);

export const woodPlank = (id: string, label: string | Text, min: Vec3, size: Vec3, extra: Partial<SceneObject> = {}) =>
  solid(id, label, 'vessel', 'wood', min, size, extra);

/** A small vessel (e.g. a metal cup), a quarter-tefach cube by default. */
export const kli = (id: string, at: Vec3, label: string | Text = 'Vessel', size: Vec3 = [0.5, 0.5, 0.5], material: Material = 'metal') =>
  solid(id, label, 'vessel', material, at, size);

/** An olive's bulk of corpse flesh: a half-tefach by half-tefach by quarter-tefach lump. */
export const kezayis = (id: string, at: Vec3, amount = 1, size: Vec3 = [0.5, 0.5, 0.25]) =>
  solid(id, amount === 1 ? 'Olive-bulk of a corpse' : `${amount} × olive-bulk of a corpse`, 'tumah', 'flesh', at, size, {
    tumah: { kind: 'kezayis', amount },
  });

export const corpse = (id: string, at: Vec3, length = 18) =>
  solid(id, 'Corpse', 'tumah', 'flesh', at, [length, 2, 1], { tumah: { kind: 'meis' } });

export const person = (id: string, at: Vec3, label: string | Text = 'Person', height = 16) =>
  solid(id, label, 'person', 'flesh', at, [1.5, 1, height]);

export interface ContainerSpec {
  id: string;
  label: string | Text;
  material: Material;
  at: Vec3;
  /** Outer size in tefachim. */
  size: Vec3;
  wall?: number;
  /** Which face is open: 'top' (default), 'bottom', 'x-', 'x+', 'y-', 'y+', or 'none'. */
  mouth?: 'top' | 'bottom' | 'x-' | 'x+' | 'y-' | 'y+' | 'none';
  sealed?: boolean;
  volumeSeah?: number;
  props?: SceneObject['props'];
}

export function container(s: ContainerSpec): SceneObject {
  const w = s.wall ?? 0.25;
  const outer = box(s.at, s.size);
  const interior = box(
    [s.at[0] + w, s.at[1] + w, s.at[2] + w],
    [s.size[0] - 2 * w, s.size[1] - 2 * w, s.size[2] - 2 * w],
  );
  const mouth = s.sealed ? 'none' : (s.mouth ?? 'top');
  const holes: Box[] = [interior];
  if (mouth !== 'none') {
    const m: Box = { min: [...interior.min] as Vec3, size: [...interior.size] as Vec3 };
    const axis = mouth === 'top' || mouth === 'bottom' ? 2 : mouth[0] === 'x' ? 0 : 1;
    const positive = mouth === 'top' || mouth.endsWith('+');
    if (positive) m.size[axis] += u(w);
    else {
      m.min[axis] -= u(w);
      m.size[axis] += u(w);
    }
    holes.push(m);
  }
  return {
    id: s.id,
    label: txt(s.label),
    kind: 'vessel',
    material: s.material,
    parts: boxesMinus([outer], holes),
    container: { interior, sealed: s.sealed, volumeSeah: s.volumeSeah },
    props: s.props,
  };
}

export type Side = 'x-' | 'x+' | 'y-' | 'y+';

export interface OpeningSpec {
  side: Side;
  /** Offset along the wall from the room's interior corner, in tefachim. */
  offset: number;
  width: number;
  height: number;
  /** Height of the sill above the floor. */
  sill?: number;
  /** Put a closed door in the opening. */
  door?: boolean;
  intendedExit?: boolean;
  id?: string;
}

export interface RoomSpec {
  id: string;
  label?: string | Text;
  /** Interior min corner (x, y) in tefachim; floor at z (default 0). */
  at: [number, number] | Vec3;
  /** Interior size in tefachim. */
  size: Vec3;
  wall?: number;
  roof?: number;
  openings?: OpeningSpec[];
  /** Holes in the roof: [x, y, w, d] relative to the interior corner. */
  hatches?: [number, number, number, number][];
  noRoof?: boolean;
  material?: Material;
}

/** A house: four walls and a roof. Returns walls/roof as one structural object plus doors. */
export function room(s: RoomSpec): SceneObject[] {
  const w = s.wall ?? 1;
  const rf = s.roof ?? 1;
  const [x0, y0] = s.at;
  const z0 = s.at.length === 3 ? s.at[2] : 0;
  const [W, D, H] = s.size;
  const walls: Record<Side, Box> = {
    'x-': box([x0 - w, y0 - w, z0], [w, D + 2 * w, H]),
    'x+': box([x0 + W, y0 - w, z0], [w, D + 2 * w, H]),
    'y-': box([x0, y0 - w, z0], [W, w, H]),
    'y+': box([x0, y0 + D, z0], [W, w, H]),
  };
  const out: SceneObject[] = [];
  const holes: Record<Side, Box[]> = { 'x-': [], 'x+': [], 'y-': [], 'y+': [] };
  (s.openings ?? []).forEach((op, n) => {
    const sill = op.sill ?? 0;
    const along = op.side[0] === 'x' ? 1 : 0;
    const min: Vec3 = [0, 0, z0 + sill];
    const size: Vec3 = [0, 0, op.height];
    if (along === 1) {
      min[0] = op.side === 'x-' ? x0 - w : x0 + W;
      size[0] = w;
      min[1] = y0 + op.offset;
      size[1] = op.width;
    } else {
      min[1] = op.side === 'y-' ? y0 - w : y0 + D;
      size[1] = w;
      min[0] = x0 + op.offset;
      size[0] = op.width;
    }
    const hole = box(min, size);
    holes[op.side].push(hole);
    if (op.door) {
      // A door a quarter-tefach thick, set at the inner face of the wall.
      const dmin = [...min] as Vec3;
      const dsize = [...size] as Vec3;
      const axis = along === 1 ? 0 : 1;
      const inner = op.side.endsWith('-') ? min[axis] + w - 0.25 : min[axis];
      dmin[axis] = inner;
      dsize[axis] = 0.25;
      out.push({
        id: op.id ?? `${s.id}-door${n + 1}`,
        label: { en: 'Door', he: 'דלת' },
        kind: 'door',
        material: 'wood',
        parts: [box(dmin, dsize)],
        intendedExit: op.intendedExit,
        group: s.id,
      });
    }
  });
  const parts: Box[] = [];
  for (const side of Object.keys(walls) as Side[]) parts.push(...boxesMinus([walls[side]], holes[side]));
  if (!s.noRoof) {
    const roof = box([x0 - w, y0 - w, z0 + H], [W + 2 * w, D + 2 * w, rf]);
    const hatchBoxes = (s.hatches ?? []).map(([hx, hy, hw, hd]) => box([x0 + hx, y0 + hy, z0 + H], [hw, hd, rf]));
    parts.push(...boxesMinus([roof], hatchBoxes));
  }
  out.unshift({
    id: s.id,
    label: txt(s.label ?? { en: 'House', he: 'בית' }),
    kind: 'structure',
    material: s.material ?? 'stone',
    parts,
    group: s.id,
  });
  return out;
}
