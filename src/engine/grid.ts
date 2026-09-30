// Voxel analysis of a scene. The grid unit is one etzba.
import { canBring, canSeparate, protectsInterior, resolveProps } from './props';
import { shitah } from './shittos';
import { TEFACH, type ObjectProps, type Scene, type ShittosSelection, type Vec3 } from './types';

export const AIR = -1;
/** Cells below the ground surface belong to this pseudo-object: earth, structural, blocking. */
export const GROUND = -2;

/** Depth of earth modeled below z = 0. Everything under it is "the depths". */
const GROUND_DEPTH = 2 * TEFACH;
const MARGIN = 3 * TEFACH;

export interface Analysis {
  scene: Scene;
  props: ObjectProps[];
  /** Per object: separates spaces for everything (חוצץ), after the support rule of 6:1. */
  separates: boolean[];
  /** Per object: its walls keep tumah out of its own inside (9:1, 8:6). */
  guardsInterior: boolean[];
  /** Per object: its cells are walls for connectivity (separates, guardsInterior, or a solid person). */
  blocks: boolean[];
  /** Per object: rests only on people or vessels (6:1). */
  vesselSupported: boolean[];
  /** Per object: can be a roof. */
  brings: boolean[];
  origin: Vec3;
  dims: Vec3;
  /** Object index per cell, or AIR / GROUND. */
  cells: Int32Array;
  /** Cell has a roof-capable object somewhere above it. */
  covered: Uint8Array;
  /** Cell is part of an ohel: covered, connected air (vessels count as air) inside a tefach cube. */
  ohel: Uint8Array;
  /** Region label per cell: ohalim (1..n) then pockets (n+1..). 0 = none. */
  region: Int32Array;
  ohelCount: number;
  regionCount: number;
  /** Cell indices occupied by each object. */
  objCells: number[][];
}

export function idx(a: Pick<Analysis, 'dims'>, x: number, y: number, z: number): number {
  return x + a.dims[0] * (y + a.dims[1] * z);
}

export function coords(a: Pick<Analysis, 'dims'>, i: number): Vec3 {
  const [dx, dy] = a.dims;
  return [i % dx, Math.floor(i / dx) % dy, Math.floor(i / (dx * dy))];
}

export function isStructural(a: Analysis, v: number): boolean {
  return v === GROUND || (v >= 0 && a.props[v].structural);
}

export function blocksCell(a: Analysis, v: number): boolean {
  return v === GROUND || (v >= 0 && a.blocks[v]);
}

/** Stops overshadowing and compressed tumah columns: a true separator, not a vessel. */
export function separatesCell(a: Analysis, v: number): boolean {
  return v === GROUND || (v >= 0 && a.separates[v]);
}

function sceneBounds(scene: Scene): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, 0];
  const max: Vec3 = [-Infinity, -Infinity, TEFACH];
  for (const o of scene.objects)
    for (const p of o.parts)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], p.min[k]);
        max[k] = Math.max(max[k], p.min[k] + p.size[k]);
      }
  if (!isFinite(min[0])) return { min: [0, 0, 0], max: [TEFACH, TEFACH, TEFACH] };
  return { min, max };
}

export function analyze(scene: Scene, shittos: ShittosSelection = {}): Analysis {
  const props = scene.objects.map(resolveProps);
  const separates = scene.objects.map((o, i) => canSeparate(o, props[i]));
  const guardsInterior = scene.objects.map((o, i) => protectsInterior(o, props[i]));
  const brings = scene.objects.map((o, i) => canBring(o, props[i]));

  const b = sceneBounds(scene);
  const origin: Vec3 = [b.min[0] - MARGIN, b.min[1] - MARGIN, Math.min(b.min[2], 0) - GROUND_DEPTH];
  const dims: Vec3 = [
    b.max[0] - b.min[0] + 2 * MARGIN,
    b.max[1] - b.min[1] + 2 * MARGIN,
    b.max[2] + MARGIN - origin[2],
  ];
  const n = dims[0] * dims[1] * dims[2];
  const cells = new Int32Array(n).fill(AIR);
  const a: Analysis = {
    scene,
    props,
    separates,
    guardsInterior,
    blocks: [],
    vesselSupported: scene.objects.map(() => false),
    brings,
    origin,
    dims,
    cells,
    covered: new Uint8Array(n),
    ohel: new Uint8Array(n),
    region: new Int32Array(n),
    ohelCount: 0,
    regionCount: 0,
    objCells: [],
  };

  // Earth below the surface.
  for (let z = 0; z < -origin[2]; z++)
    for (let y = 0; y < dims[1]; y++)
      for (let x = 0; x < dims[0]; x++) cells[idx(a, x, y, z)] = GROUND;

  // Cavities carved out of the earth.
  scene.objects.forEach((o) => {
    if (o.kind !== 'cavity') return;
    for (const p of o.parts)
      for (let z = p.min[2]; z < p.min[2] + p.size[2]; z++)
        for (let y = p.min[1]; y < p.min[1] + p.size[1]; y++)
          for (let x = p.min[0]; x < p.min[0] + p.size[0]; x++)
            cells[idx(a, x - origin[0], y - origin[1], z - origin[2])] = AIR;
  });

  // Objects. Earlier objects win on overlap; tumah is placed last so it never erases a wall.
  const order = scene.objects.map((_, i) => i).sort((i, j) => {
    const ti = scene.objects[i].kind === 'tumah' ? 1 : 0;
    const tj = scene.objects[j].kind === 'tumah' ? 1 : 0;
    return ti - tj || i - j;
  });
  for (const oi of order) {
    if (scene.objects[oi].kind === 'cavity') continue;
    // Tumah always takes its cells: tumah inside a wall or buried in the earth displaces it.
    const isTumah = scene.objects[oi].kind === 'tumah';
    for (const p of scene.objects[oi].parts) {
      for (let z = p.min[2]; z < p.min[2] + p.size[2]; z++)
        for (let y = p.min[1]; y < p.min[1] + p.size[1]; y++)
          for (let x = p.min[0]; x < p.min[0] + p.size[0]; x++) {
            const i = idx(a, x - origin[0], y - origin[1], z - origin[2]);
            if (isTumah || cells[i] === AIR) cells[i] = oi;
          }
    }
  }

  a.objCells = scene.objects.map(() => []);
  for (let i = 0; i < n; i++) if (cells[i] >= 0) a.objCells[cells[i]].push(i);

  computeSupport(a);
  // Beis Shammai (11:3–11:6): a person's body is not hollow, so tumah does not pass through it,
  // though, like any person, it does not block what is above or below it.
  const solidPeople = shitah(shittos, 'adam-chalul') === 'beis-shammai';
  a.blocks = scene.objects.map((o, i) => a.separates[i] || a.guardsInterior[i] || (solidPeople && o.kind === 'person'));

  computeCovered(a);
  computeOhel(a);
  labelRegions(a);
  return a;
}

/** Air, or something that does not block (vessels, people, the tumah itself). */
export function passable(a: Analysis, v: number): boolean {
  return v === AIR || (v >= 0 && !a.blocks[v]);
}

/**
 * 6:1: a tent resting on people or on vessels (even vessels that cannot become tamei) defiles but
 * does not purify. An object whose every support is a person or a vessel cannot separate.
 */
function computeSupport(a: Analysis) {
  a.scene.objects.forEach((o, oi) => {
    if (!a.separates[oi] || o.kind === 'structure') return;
    const supporters = new Set<number>();
    for (const p of o.parts)
      for (let y = p.min[1]; y < p.min[1] + p.size[1]; y++)
        for (let x = p.min[0]; x < p.min[0] + p.size[0]; x++) {
          const z = p.min[2] - 1 - a.origin[2];
          if (z < 0) continue;
          const v = a.cells[idx(a, x - a.origin[0], y - a.origin[1], z)];
          if (v === GROUND) supporters.add(v);
          else if (v >= 0 && v !== oi && a.scene.objects[v].kind !== 'tumah') supporters.add(v);
        }
    if (supporters.size === 0) return;
    const allVesselsOrPeople = [...supporters].every(
      (v) => v >= 0 && (a.props[v].vessel || a.scene.objects[v].kind === 'person'),
    );
    if (allVesselsOrPeople) {
      a.vesselSupported[oi] = true;
      a.separates[oi] = false;
    }
  });
}

function computeCovered(a: Analysis) {
  const [dx, dy, dz] = a.dims;
  for (let y = 0; y < dy; y++)
    for (let x = 0; x < dx; x++) {
      let roof = false;
      for (let z = dz - 1; z >= 0; z--) {
        const i = idx(a, x, y, z);
        const v = a.cells[i];
        if (roof) a.covered[i] = 1;
        if (v === GROUND || (v >= 0 && a.brings[v])) roof = true;
      }
    }
}

/**
 * Morphological opening of the covered, passable space by a tefach cube: a cell is part of an ohel
 * if some tefach cube of covered, passable cells contains it. This single operation encodes both
 * "טפח על טפח על רום טפח" and "פותח טפח": spaces join only through openings a tefach cube fits.
 */
function computeOhel(a: Analysis) {
  const n = a.cells.length;
  const src = new Uint8Array(n);
  for (let i = 0; i < n; i++) src[i] = a.covered[i] && passable(a, a.cells[i]) ? 1 : 0;
  const { label, count } = labelOpening(a, src, TEFACH);
  a.ohel = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!label[i]) continue;
    a.ohel[i] = 1;
    a.region[i] = label[i];
  }
  a.ohelCount = count;
}

/** Morphological opening of `src` by a k×k×k cube: cells lying inside some cube fully in `src`. */
export function openBy(a: Pick<Analysis, 'dims'>, src: Uint8Array, k: number): Uint8Array {
  const { label } = labelOpening(a, src, k);
  const out = new Uint8Array(label.length);
  for (let i = 0; i < label.length; i++) out[i] = label[i] ? 1 : 0;
  return out;
}

/**
 * The opening of `src` by a k-cube, split into the spaces a k-cube can move between. Two spaces
 * whose cubes merely touch, or overlap by less than a cube, stay apart: a tefach cube cannot pass
 * from one to the other (15:2, tablets touching at their corners). Returns a label per cell
 * (0 = not in the opening) and the number of labels.
 */
export function labelOpening(a: Pick<Analysis, 'dims'>, src: Uint8Array, k: number): { label: Int32Array; count: number } {
  const [dx, dy, dz] = a.dims;
  const n = dx * dy * dz;
  const lines = (axis: 0 | 1 | 2, f: (base: number, stride: number, len: number) => void) => {
    const stride = axis === 0 ? 1 : axis === 1 ? dx : dx * dy;
    const len = a.dims[axis];
    const [o1, o2] = axis === 0 ? [dy, dz] : axis === 1 ? [dx, dz] : [dx, dy];
    for (let u = 0; u < o1; u++)
      for (let w = 0; w < o2; w++)
        f(axis === 0 ? idx(a, 0, u, w) : axis === 1 ? idx(a, u, 0, w) : idx(a, u, w, 0), stride, len);
  };
  // Erosion: a cell is a cube's min corner if the k-run starting at it along each axis is set.
  const erode = (inp: Uint8Array, axis: 0 | 1 | 2) => {
    const out = new Uint8Array(n);
    lines(axis, (base, stride, len) => {
      let run = 0;
      for (let t = len - 1; t >= 0; t--) {
        const i = base + t * stride;
        run = inp[i] ? run + 1 : 0;
        if (run >= k) out[i] = 1;
      }
    });
    return out;
  };
  const corners = erode(erode(erode(src, 0), 1), 2);

  // Cubes whose corners are neighbors overlap in all but one layer, so a cube can slide from one
  // to the other; a space is a connected set of corners.
  const label = new Int32Array(n);
  let count = 0;
  const stack = new Int32Array(n);
  const plane = dx * dy;
  for (let s = 0; s < n; s++) {
    if (!corners[s] || label[s]) continue;
    label[s] = ++count;
    let top = 0;
    stack[top++] = s;
    while (top) {
      const i = stack[--top];
      const x = i % dx;
      const y = Math.floor(i / dx) % dy;
      const z = Math.floor(i / plane);
      const visit = (j: number) => {
        if (corners[j] && !label[j]) {
          label[j] = count;
          stack[top++] = j;
        }
      };
      if (x > 0) visit(i - 1);
      if (x < dx - 1) visit(i + 1);
      if (y > 0) visit(i - dx);
      if (y < dy - 1) visit(i + dx);
      if (z > 0) visit(i - plane);
      if (z < dz - 1) visit(i + plane);
    }
  }

  // Dilation: every cell of each cube takes its corner's label. Where cubes of two spaces
  // overlap, the cell goes to one of them.
  const dilate = (inp: Int32Array, axis: 0 | 1 | 2) => {
    const out = new Int32Array(n);
    lines(axis, (base, stride, len) => {
      let last = -Infinity;
      let lab = 0;
      for (let t = 0; t < len; t++) {
        const i = base + t * stride;
        if (inp[i]) {
          last = t;
          lab = inp[i];
        }
        if (t - last < k) out[i] = lab;
      }
    });
    return out;
  };
  return { label: dilate(dilate(dilate(label, 0), 1), 2), count };
}

/** Label connected pockets (covered passable air too small to be an ohel). */
function labelRegions(a: Analysis) {
  const [dx, dy, dz] = a.dims;
  const n = dx * dy * dz;
  const stack: number[] = [];
  const flood = (seed: number, label: number, member: (i: number) => boolean) => {
    a.region[seed] = label;
    stack.push(seed);
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % dx;
      const y = Math.floor(i / dx) % dy;
      const z = Math.floor(i / (dx * dy));
      const nb = [
        x > 0 ? i - 1 : -1,
        x < dx - 1 ? i + 1 : -1,
        y > 0 ? i - dx : -1,
        y < dy - 1 ? i + dx : -1,
        z > 0 ? i - dx * dy : -1,
        z < dz - 1 ? i + dx * dy : -1,
      ];
      for (const j of nb)
        if (j >= 0 && a.region[j] === 0 && member(j)) {
          a.region[j] = label;
          stack.push(j);
        }
    }
  };
  // Ohalim are already labeled by the spaces a tefach cube can move between (computeOhel).
  let label = a.ohelCount;
  const isPocket = (j: number) => !a.ohel[j] && a.covered[j] === 1 && passable(a, a.cells[j]);
  for (let i = 0; i < n; i++) if (isPocket(i) && a.region[i] === 0) flood(i, ++label, isPocket);
  a.regionCount = label;
}

export function neighbors6(a: Analysis, i: number): number[] {
  const [dx, dy, dz] = a.dims;
  const x = i % dx;
  const y = Math.floor(i / dx) % dy;
  const z = Math.floor(i / (dx * dy));
  const out: number[] = [];
  if (x > 0) out.push(i - 1);
  if (x < dx - 1) out.push(i + 1);
  if (y > 0) out.push(i - dx);
  if (y < dy - 1) out.push(i + dx);
  if (z > 0) out.push(i - dx * dy);
  if (z < dz - 1) out.push(i + dx * dy);
  return out;
}
