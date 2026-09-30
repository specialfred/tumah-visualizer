// Propagation of tumas meis through a scene.
//
// Each tumah source is propagated on its own, producing "exposures" of regions and objects with
// the reasons for each. Exposures are then summed per target (so two half-olives that reach the
// same space join into a full measure, 3:1, 8:6), and finally tumah passes by contact (ch. 1).
import {
  AIR,
  GROUND,
  analyze,
  coords,
  idx,
  isStructural,
  neighbors6,
  openBy,
  passable,
  separatesCell,
  type Analysis,
} from './grid';
import { RULES } from './rules';
import { shitah } from './shittos';
import { contactPropagation } from './contact';
import {
  TEFACH,
  type Evaluation,
  type ObjectResult,
  type Reason,
  type RegionResult,
  type Scene,
  type SceneObject,
  type ShittosSelection,
  type TumahKind,
} from './types';

/** Sources that defile through a tent (2:1–2:3). */
const DEFILES_BY_OHEL: Record<TumahKind, boolean> = {
  meis: true,
  kezayis: true,
  'rova-atzamos': true,
  'rova-dam': true,
  'shidra-gulgoles': true,
  'etzem-kseorah': false,
};

/** 3:6: an opening that lets out an exact kezayis is a tefach; a whole corpse needs four by four. */
function exitSize(o: SceneObject): number {
  const t = o.tumah!;
  if (t.kind === 'kezayis' && (t.amount ?? 1) <= 1) return TEFACH;
  return 4 * TEFACH;
}

const reason = (rule: string, en: string, via?: string, he?: string): Reason => ({
  rule,
  refs: RULES[rule]?.refs ?? [],
  detail: { en, he },
  via,
});

type Side = { kind: 'ohel'; region: number; dir: number } | { kind: 'open'; dir: number };

/** Directions: 0 -x, 1 +x, 2 -y, 3 +y, 4 -z (down), 5 +z (up). */
const DIRS: [number, number, number][] = [
  [-1, 0, 0],
  [1, 0, 0],
  [0, -1, 0],
  [0, 1, 0],
  [0, 0, -1],
  [0, 0, 1],
];

interface Exposures {
  /** target -> reasons. Targets: `r<id>` for regions, `o<index>` for objects. */
  map: Map<string, Reason[]>;
  /** Air cells this source makes tamei (1 = inside a tamei space, 2 = an overshadowing column). */
  air: Map<number, number>;
}

export function evaluate(scene: Scene, shittos: ShittosSelection = {}): Evaluation {
  const a = analyze(scene);
  const ctx = new Ctx(a, shittos);
  return ctx.run();
}

class Ctx {
  regionCells: number[][] = [];
  interiorOf: number[] = []; // per region: container object index or -1
  warnings: Evaluation['warnings'] = [];
  private openMask = new Map<number, { label: Int32Array; outside: Set<number> }>();

  constructor(
    readonly a: Analysis,
    readonly shittos: ShittosSelection,
  ) {
    const { regionCount } = a;
    for (let r = 0; r <= regionCount; r++) this.regionCells.push([]);
    for (let i = 0; i < a.cells.length; i++) if (a.region[i]) this.regionCells[a.region[i]].push(i);
    this.interiorOf = new Array(regionCount + 1).fill(-1);
    a.scene.objects.forEach((o, oi) => {
      if (!a.guardsInterior[oi] || !o.container) return;
      const b = o.container.interior;
      for (let r = 1; r <= regionCount; r++) {
        const cells = this.regionCells[r];
        if (cells.length && cells.every((i) => this.inBox(i, b))) this.interiorOf[r] = oi;
      }
    });
  }

  run(): Evaluation {
    const { a } = this;
    const perSource: { src: number; amount: number; ex: Exposures }[] = [];
    a.scene.objects.forEach((o, oi) => {
      if (o.kind !== 'tumah' || !o.tumah || !DEFILES_BY_OHEL[o.tumah.kind]) return;
      perSource.push({ src: oi, amount: o.tumah.amount ?? 1, ex: this.propagate(oi) });
    });

    // Sum per target over distinct sources.
    const totals = new Map<string, { amount: number; reasons: Reason[] }>();
    for (const { amount, ex } of perSource)
      for (const [t, rs] of ex.map) {
        const cur = totals.get(t) ?? { amount: 0, reasons: [] };
        cur.amount += amount;
        cur.reasons.push(...rs);
        totals.set(t, cur);
      }
    const tamei = (t: string) => (totals.get(t)?.amount ?? 0) >= 1 - 1e-9;

    // Regions.
    const regions: RegionResult[] = [];
    for (let r = 1; r <= a.regionCount; r++) {
      const t = totals.get(`r${r}`);
      regions.push({
        id: r,
        kind: r <= a.ohelCount ? 'ohel' : 'pocket',
        interiorOf: this.interiorOf[r] >= 0 ? a.scene.objects[this.interiorOf[r]].id : undefined,
        tamei: tamei(`r${r}`),
        cellCount: this.regionCells[r].length,
        reasons: t?.reasons ?? [],
      });
    }

    // Tamei air mask for shading: only from targets that reached a full measure.
    const mask = new Uint8Array(a.cells.length);
    for (const { ex } of perSource)
      for (const [i, v] of ex.air) {
        const r = a.region[i];
        const ok = r ? tamei(`r${r}`) : true;
        if (ok && (mask[i] === 0 || v < mask[i])) mask[i] = v;
      }
    for (let r = 1; r <= a.regionCount; r++)
      if (tamei(`r${r}`)) for (const i of this.regionCells[r]) if (a.cells[i] === AIR) mask[i] = 1;

    // Objects exposed by tent / overshadowing.
    const objects: Record<string, ObjectResult> = {};
    const exposed = new Map<number, Reason[]>();
    a.scene.objects.forEach((o, oi) => {
      const p = a.props[oi];
      if (o.kind === 'tumah') {
        objects[o.id] = { status: 'source', reasons: [] };
        return;
      }
      const rs: Reason[] = [];
      let hit = false;
      for (const t of this.objectTargets(oi)) {
        if (tamei(t)) {
          hit = true;
          rs.push(...(totals.get(t)?.reasons ?? []));
        }
      }
      if (!p.susceptible) {
        objects[o.id] = { status: 'insusceptible', reasons: hit ? rs : [] };
        return;
      }
      if (hit) exposed.set(oi, dedupe(rs));
      objects[o.id] = { status: 'tahor', reasons: [] };
    });

    contactPropagation(a, exposed, objects);

    return {
      objects,
      regions,
      tameiAir: { origin: a.origin, dims: a.dims, mask },
      warnings: this.warnings,
    };
  }

  /** The exposure keys that make object `oi` tamei if they are tamei. */
  objectTargets(oi: number): string[] {
    const { a } = this;
    const o = a.scene.objects[oi];
    const p = a.props[oi];
    const keys = new Set<string>([`o${oi}`]);
    // Earthenware takes tumah only through its inside air.
    const cells: number[] = [];
    if (p.receivesFromInsideOnly && o.container) {
      const b = o.container.interior;
      for (let z = b.min[2]; z < b.min[2] + b.size[2]; z++)
        for (let y = b.min[1]; y < b.min[1] + b.size[1]; y++)
          for (let x = b.min[0]; x < b.min[0] + b.size[0]; x++) cells.push(this.cellAt(x, y, z));
      for (const i of cells) if (a.region[i]) keys.add(`r${a.region[i]}`);
      return [...keys];
    }
    for (const i of a.objCells[oi]) cells.push(i);
    const pockets = new Set<number>();
    for (const i of cells) {
      const r = a.region[i];
      if (!r) continue;
      if (r <= a.ohelCount) keys.add(`r${r}`);
      else pockets.add(r);
    }
    // A vessel in a small gap inside a building belongs to the nearer space (6:4, 15:5); in a gap
    // bounded by a movable thing, the tumah of the space does not enter (4:1).
    for (const r of pockets) {
      keys.add(`r${r}`);
      if (this.pocketKind(r).kind === 'structural')
        for (const s of this.halves(cells.filter((i) => a.region[i] === r), r).sides)
          if (s.kind === 'ohel') keys.add(`r${s.region}`);
    }
    return [...keys];
  }

  // ---------------------------------------------------------------------------------------------
  // Propagation of one source.

  propagate(src: number): Exposures {
    const { a } = this;
    const o = a.scene.objects[src];
    const ex: Exposures = { map: new Map(), air: new Map() };
    const add = (t: string, r: Reason) => {
      const cur = ex.map.get(t);
      if (cur) cur.push(r);
      else ex.map.set(t, [r]);
    };
    const cells = a.objCells[src];
    if (!cells.length) return ex;

    const queue: number[] = [];
    const seenRegion = new Set<number>();
    const defileRegion = (r: number, why: Reason) => {
      add(`r${r}`, why);
      if (!seenRegion.has(r)) {
        seenRegion.add(r);
        queue.push(r);
      }
    };

    const ohelCells = cells.filter((i) => a.ohel[i]);
    const rest = cells.filter((i) => !a.ohel[i]);
    let restActive = true;
    if (ohelCells.length && rest.length) {
      // 10:3 — tumah partly inside a tent and partly outside it.
      const s = shitah(this.shittos, 'split-tumah');
      const amount = o.tumah?.amount ?? 1;
      if (s === 'yehuda' || (s === 'yose' && amount < 2)) restActive = false;
    }
    for (const r of new Set(ohelCells.map((i) => a.region[i])))
      defileRegion(r, reason('ohel', 'The tumah is inside this tent.', o.id, 'הטומאה באהל'));

    if (restActive && rest.length) {
      const pockets = new Map<number, number[]>();
      const uncovered: number[] = [];
      for (const i of rest) {
        const r = a.region[i];
        if (r) pockets.set(r, [...(pockets.get(r) ?? []), i]);
        else uncovered.push(i);
      }
      for (const [r, pc] of pockets) this.fromEnclosed(pc, r, o.id, defileRegion, add, ex);
      if (uncovered.length) {
        const embedded = uncovered.every((i) =>
          neighbors6(a, i).every((j) => a.cells[j] === src || separatesCell(a, a.cells[j])),
        );
        if (embedded) this.fromEnclosed(uncovered, 0, o.id, defileRegion, add, ex);
        else this.overshadow(uncovered, o.id, defileRegion, add, ex, src);
      }
    }

    // Follow tamei spaces outward: vessel roofs, the way out, closed spaces.
    while (queue.length) {
      const r = queue.shift()!;
      if (r > a.ohelCount) continue;
      this.fillVesselRoofs(r, o.id, defileRegion, add, ex);
      this.exits(r, src, defileRegion, add, ex);
    }
    return ex;
  }

  /** Tumah with no tefach cube of air around it: in a small gap, or inside a solid. */
  fromEnclosed(
    tcells: number[],
    pocket: number,
    via: string,
    defileRegion: (r: number, why: Reason) => void,
    add: (t: string, r: Reason) => void,
    ex: Exposures,
  ) {
    const kind = pocket
      ? this.openSided(tcells)
        ? ({ kind: 'boka' } as const)
        : this.pocketKind(pocket)
      : this.enclosureKind(tcells);
    // In an enclosed gap the whole gap is tamei; compressed tumah in the open reaches only what
    // is directly above and below it.
    if (pocket && kind.kind !== 'boka') defileRegion(pocket, reason('retzutzah', 'The tumah is in this small closed gap.', via));
    if (kind.kind === 'yotzeis') {
      for (const r of kind.ohalim)
        defileRegion(
          r,
          reason(
            'yotzeis',
            'The gap is too small to be a tent of its own and is closed off by something that is not part of the building; its tumah goes out into this space.',
            via,
          ),
        );
      return;
    }
    if (kind.kind === 'structural') {
      const h = this.halves(tcells, pocket);
      for (const s of h.sides) {
        if (s.kind === 'ohel')
          defileRegion(
            s.region,
            reason(
              h.rule,
              h.tie ? 'The tumah is in the exact middle of the building element.' : 'The tumah is nearer this side of the building element.',
              via,
            ),
          );
        else this.retzutzahColumn(tcells, via, add, ex, h.rule);
      }
      return;
    }
    this.retzutzahColumn(tcells, via, add, ex, 'retzutzah');
  }

  /**
   * Tumah under a roof narrower than a tefach, with open air beside it within a tefach, is not in
   * a gap at all: it is in the open, merely roofed over, and breaks up and down (12:6, 14:7).
   */
  openSided(tcells: number[]): boolean {
    const { a } = this;
    const self = a.cells[tcells[0]];
    for (const c of tcells) {
      const [x0, y0, z0] = coords(a, c);
      for (const [ddx, ddy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        for (let step = 1; step <= TEFACH; step++) {
          const x = x0 + ddx * step;
          const y = y0 + ddy * step;
          if (x < 0 || y < 0 || x >= a.dims[0] || y >= a.dims[1]) break;
          const i = idx(a, x, y, z0);
          const v = a.cells[i];
          if (v !== self && !passable(a, v)) break;
          if (!a.covered[i]) return true;
        }
      }
    }
    return false;
  }

  /** How a small gap lets its tumah out. */
  pocketKind(r: number): { kind: 'structural' } | { kind: 'yotzeis'; ohalim: number[] } | { kind: 'boka' } {
    const { a } = this;
    // A gap open to the outside through a tefach is not enclosed at all: it is part of the
    // outside, merely roofed over (a doorway outside a closed door).
    if (this.openTo(r, TEFACH)) return { kind: 'boka' };
    let nonStructural = false;
    const adj = new Set<number>();
    for (const i of this.regionCells[r])
      for (const j of neighbors6(a, i)) {
        if (a.region[j] === r) continue;
        const v = a.cells[j];
        if (a.ohel[j]) adj.add(a.region[j]);
        else if (!passable(a, v) && !isStructural(a, v)) nonStructural = true;
      }
    if (!nonStructural) return { kind: 'structural' };
    if (adj.size) return { kind: 'yotzeis', ohalim: [...adj] };
    return { kind: 'boka' };
  }

  enclosureKind(tcells: number[]): { kind: 'structural' } | { kind: 'boka' } {
    const { a } = this;
    const self = a.cells[tcells[0]];
    const all = tcells.every((i) =>
      neighbors6(a, i).every((j) => a.cells[j] === self || isStructural(a, a.cells[j])),
    );
    return { kind: all ? 'structural' : 'boka' };
  }

  /**
   * 6:3–6:4: something inside the thickness of a building element belongs to the space on the
   * nearer side. Rays run through the building (small gaps count as solid, per 3:7 "as if there is
   * no cavity") until they reach a tent or the open air. The depths below are not a side.
   */
  halves(scells: number[], pocket: number): { sides: Side[]; tie: boolean; rule: string } {
    const { a } = this;
    const selfSet = new Set(scells);
    const best: { dist: number; side: Side | null }[] = DIRS.map(() => ({ dist: Infinity, side: null }));
    for (const c of scells) {
      const [x0, y0, z0] = coords(a, c);
      DIRS.forEach(([ddx, ddy, ddz], d) => {
        let x = x0,
          y = y0,
          z = z0,
          dist = 0;
        for (;;) {
          x += ddx;
          y += ddy;
          z += ddz;
          if (x < 0 || y < 0 || x >= a.dims[0] || y >= a.dims[1]) return;
          if (z < 0) return; // the depths
          if (z >= a.dims[2]) {
            if (dist < best[d].dist) best[d] = { dist, side: { kind: 'open', dir: d } };
            return;
          }
          const i = idx(a, x, y, z);
          if (selfSet.has(i)) continue;
          const v = a.cells[i];
          if (a.ohel[i]) {
            if (dist < best[d].dist) best[d] = { dist, side: { kind: 'ohel', region: a.region[i], dir: d } };
            return;
          }
          const inGap = a.region[i] !== 0 && (a.region[i] === pocket || a.region[i] > a.ohelCount);
          if (isStructural(a, v) || inGap) {
            dist++;
            continue;
          }
          if (passable(a, v) && !a.covered[i]) {
            if (dist < best[d].dist) best[d] = { dist, side: { kind: 'open', dir: d } };
          }
          return;
        }
      });
    }
    const found = best.filter((b) => b.side);
    if (!found.length) return { sides: [], tie: false, rule: 'chatzi-kotel' };
    const min = Math.min(...found.map((b) => b.dist));
    let winners = found.filter((b) => b.dist === min).map((b) => b.side!) as Side[];
    // Collapse duplicates (e.g. both +x and -x reaching the same tent).
    const key = (s: Side) => (s.kind === 'ohel' ? `r${s.region}` : 'open');
    winners = [...new Map(winners.map((s) => [key(s), s])).values()];
    const vertical = winners.every((s) => s.dir >= 4);
    const allSides = [...new Map(found.map((b) => [key(b.side!), b.side!])).values()];

    if (!vertical) {
      // A wall (6:3).
      const s = shitah(this.shittos, 'wall-halves');
      const ohalim = allSides.filter((x) => x.kind === 'ohel');
      if (s === 'yehuda' && ohalim.length === 1 && allSides.some((x) => x.kind === 'open'))
        return { sides: ohalim, tie: false, rule: 'chatzi-kotel' };
      const tie = winners.length > 1;
      if (tie && s === 'chachamim' && winners.some((x) => x.kind === 'ohel'))
        winners = winners.filter((x) => x.kind === 'ohel');
      return { sides: winners, tie, rule: 'chatzi-kotel' };
    }
    // Plaster between stories, or a floor over the earth (6:4, 15:5).
    const s = shitah(this.shittos, 'plaster-halves');
    const up = allSides.find((x) => x.dir === 5 && x.kind === 'ohel');
    const down = allSides.find((x) => x.dir === 4 && x.kind === 'ohel');
    if (s === 'yehuda' && up && down) return { sides: [up], tie: false, rule: 'chatzi-kotel' };
    const rule = winners.length === 1 && winners[0].dir === 5 && !down ? 'karka-habayis' : 'chatzi-kotel';
    return { sides: winners, tie: winners.length > 1, rule };
  }

  /** Compressed tumah breaks up to the sky and down to the depths. It does not enter tents. */
  retzutzahColumn(
    tcells: number[],
    via: string,
    add: (t: string, r: Reason) => void,
    ex: Exposures,
    rule: string,
  ) {
    const { a } = this;
    const self = a.cells[tcells[0]];
    const cols = new Set<string>();
    for (const i of tcells) {
      const [x, y] = coords(a, i);
      cols.add(`${x},${y}`);
    }
    for (const c of cols) {
      const [x, y] = c.split(',').map(Number);
      for (let z = 0; z < a.dims[2]; z++) {
        const i = idx(a, x, y, z);
        if (a.ohel[i]) continue;
        const v = a.cells[i];
        if (v === self) continue;
        if (v === AIR) {
          if (z >= -a.origin[2]) ex.air.set(i, 2);
        } else if (v >= 0 && a.scene.objects[v].kind !== 'tumah')
          add(
            `o${v}`,
            reason(
              rule === 'retzutzah' ? 'retzutzah' : rule,
              'Directly above or below compressed tumah, which breaks through up to the sky and down to the depths.',
              via,
            ),
          );
      }
    }
  }

  /** In the open, tumah defiles what overshadows it and what it overshadows. */
  overshadow(
    tcells: number[],
    via: string,
    defileRegion: (r: number, why: Reason) => void,
    add: (t: string, r: Reason) => void,
    ex: Exposures,
    self: number,
  ) {
    const { a } = this;
    const cols = new Map<string, [number, number]>();
    for (const i of tcells) {
      const [x, y, z] = coords(a, i);
      const k = `${x},${y}`;
      const c = cols.get(k);
      cols.set(k, c ? [Math.min(c[0], z), Math.max(c[1], z)] : [z, z]);
    }
    const objReason = (v: number, up: boolean) =>
      add(
        `o${v}`,
        reason(
          'maahil',
          up ? 'Directly above tumah in the open: it overshadows the tumah.' : 'Directly below tumah in the open: the tumah overshadows it.',
          via,
        ),
      );
    for (const [k, [zmin, zmax]] of cols) {
      const [x, y] = k.split(',').map(Number);
      for (const [start, step] of [
        [zmax + 1, 1],
        [zmin - 1, -1],
      ] as const) {
        for (let z = start; z >= 0 && z < a.dims[2]; z += step) {
          const i = idx(a, x, y, z);
          const v = a.cells[i];
          if (v === self) continue;
          if (separatesCell(a, v)) break;
          const r = a.region[i];
          if (r && this.interiorOf[r] >= 0) continue; // a vessel's inside it guards
          if (a.ohel[i]) {
            defileRegion(r, reason('kelim-einam-chotzetzim', 'The tumah rests on a roof that does not block (a vessel, a person, or something resting on them), so it reaches the tent underneath.', via));
            break;
          }
          if (v === AIR) ex.air.set(i, 2);
          else if (v >= 0 && a.scene.objects[v].kind !== 'tumah') objReason(v, step === 1);
        }
      }
    }
  }

  /**
   * 6:1, 9:2: a vessel (or person, or something resting only on them) that roofs a tamei tent does
   * not protect what is on it: it is seen as full of tumah, which overshadows up and down.
   */
  fillVesselRoofs(
    r: number,
    via: string,
    defileRegion: (r: number, why: Reason) => void,
    add: (t: string, r: Reason) => void,
    ex: Exposures,
  ) {
    const { a } = this;
    const tops = new Map<string, number>();
    for (const i of this.regionCells[r]) {
      const [x, y, z] = coords(a, i);
      const k = `${x},${y}`;
      tops.set(k, Math.max(tops.get(k) ?? -1, z));
    }
    const filled = new Set<number>();
    for (const [k, ztop] of tops) {
      const [x, y] = k.split(',').map(Number);
      for (let z = ztop + 1; z < a.dims[2]; z++) {
        const v = a.cells[idx(a, x, y, z)];
        // Only a roof lying directly on the tent counts; a gap in between (e.g. a hatch smaller
        // than a tefach, 10:2) means it does not join the tent.
        if (v === AIR || v === GROUND) break;
        if (separatesCell(a, v)) break;
        if (a.scene.objects[v].kind === 'tumah') continue;
        if (a.brings[v]) {
          filled.add(v);
          break;
        }
      }
    }
    for (const v of filled) {
      add(`o${v}`, reason('kelim-einam-chotzetzim', 'It roofs the tamei tent below it but cannot block, so it counts as full of tumah.', via));
      this.overshadow(a.objCells[v], via, defileRegion, add, ex, v);
    }
  }

  /** The way tumah leaves a tent: open openings, closed doors, or nowhere. */
  exits(
    r: number,
    src: number,
    defileRegion: (r: number, why: Reason) => void,
    add: (t: string, r: Reason) => void,
    ex: Exposures,
  ) {
    const { a } = this;
    const o = a.scene.objects[src];
    const via = o.id;

    // Tumah inside a closed vessel goes out into the space around the vessel (8:6, 4:1).
    const c = this.interiorOf[r];
    if (c >= 0) {
      const around = new Set<number>();
      for (const i of a.objCells[c])
        for (const j of neighbors6(a, i)) if (a.ohel[j] && a.region[j] !== r) around.add(a.region[j]);
      for (const s of around)
        defileRegion(s, reason('yotzeis', `Tumah inside ${a.scene.objects[c].label.en} goes out into the space around it; tumah outside does not go in.`, via));
      if (!around.size) this.overshadow(a.objCells[c], via, defileRegion, add, ex, c);
      return;
    }

    if (this.openTo(r, TEFACH)) {
      // Tumah leaves through the opening. Closed doors are saved only by an opening big enough
      // to carry out this tumah (3:6, 7:3).
      if (this.openTo(r, exitSize(o))) return;
    }
    const doors = this.adjacentDoors(r);
    const intended = doors.filter((d) => a.scene.objects[d].intendedExit && this.doorSize(d) >= exitSize(o));
    if (intended.length && !this.openTo(r, TEFACH)) {
      for (const d of intended) this.throughDoor(d, r, via, defileRegion, add);
      return;
    }
    if (doors.length) {
      for (const d of doors) this.throughDoor(d, r, via, defileRegion, add);
      return;
    }
    if (this.openTo(r, TEFACH)) return;

    // No way out at all: the tumah rises into the space above (3:7).
    const above = new Set<number>();
    for (const i of this.regionCells[r]) {
      let [x, y, z] = coords(a, i);
      for (z = z + 1; z < a.dims[2]; z++) {
        const j = idx(a, x, y, z);
        if (a.region[j] === r) continue;
        if (a.ohel[j]) {
          above.add(a.region[j]);
          break;
        }
        const v = a.cells[j];
        if (!(isStructural(a, v) || (a.region[j] > a.ohelCount && passable(a, v)))) break;
      }
    }
    for (const s of above)
      defileRegion(s, reason('no-exit', 'The space holding the tumah has no opening of a tefach to let it out, so it rises into the space above.', via));
  }

  adjacentDoors(r: number): number[] {
    const { a } = this;
    const out = new Set<number>();
    for (const i of this.regionCells[r])
      for (const j of neighbors6(a, i)) {
        const v = a.cells[j];
        if (v >= 0 && a.scene.objects[v].kind === 'door') out.add(v);
      }
    return [...out];
  }

  doorSize(d: number): number {
    const dims = this.a.scene.objects[d].parts[0].size.slice().sort((p, q) => q - p);
    return Math.min(dims[0], dims[1]);
  }

  throughDoor(
    d: number,
    from: number,
    via: string,
    defileRegion: (r: number, why: Reason) => void,
    add: (t: string, r: Reason) => void,
  ) {
    const { a } = this;
    add(`o${d}`, reason('derech-yetzia', 'The tumah will be carried out through this door.', via));
    const beyond = new Set<number>();
    for (const i of a.objCells[d]) {
      for (const j of neighbors6(a, i)) {
        const r = a.region[j];
        if (r && r !== from && a.covered[j]) beyond.add(r);
        const v = a.cells[j];
        if (v >= 0 && v !== d && a.region[j] !== from && a.scene.objects[v].kind !== 'tumah' && !a.ohel[j])
          add(`o${v}`, reason('derech-yetzia', 'It is in the doorway the tumah will be carried out through.', via));
      }
    }
    for (const r of beyond)
      defileRegion(r, reason('derech-yetzia', 'The space in the doorway, under the lintel, that the tumah will be carried out through.', via));
  }

  /** Is tent `r` joined to the open air by a passage that a k-cube fits through? */
  openTo(r: number, k: number): boolean {
    const { a } = this;
    let m = this.openMask.get(k);
    if (!m) {
      const src = new Uint8Array(a.cells.length);
      for (let i = 0; i < src.length; i++) src[i] = passable(a, a.cells[i]) && !this.isInterior(i) ? 1 : 0;
      const open = openBy(a, src, k);
      const air = this.openAir();
      const label = new Int32Array(a.cells.length);
      let n = 0;
      const outside = new Set<number>();
      for (let s = 0; s < open.length; s++) {
        if (!open[s] || label[s]) continue;
        n++;
        const stack = [s];
        label[s] = n;
        while (stack.length) {
          const i = stack.pop()!;
          // Outside means reaching real open air, not merely a cell a narrow shaft exposes to it.
          if (air[i]) outside.add(n);
          for (const j of neighbors6(a, i))
            if (open[j] && !label[j]) {
              label[j] = n;
              stack.push(j);
            }
        }
      }
      m = { label, outside };
      this.openMask.set(k, m);
    }
    return this.regionCells[r].some((i) => m!.label[i] && m!.outside.has(m!.label[i]));
  }

  private openAirMask: Uint8Array | null = null;
  /** Open air: cells in some tefach cube of uncovered, passable cells. */
  openAir(): Uint8Array {
    const { a } = this;
    if (!this.openAirMask) {
      const src = new Uint8Array(a.cells.length);
      for (let i = 0; i < src.length; i++) src[i] = !a.covered[i] && passable(a, a.cells[i]) ? 1 : 0;
      this.openAirMask = openBy(a, src, TEFACH);
    }
    return this.openAirMask;
  }

  isInterior(i: number): boolean {
    const r = this.a.region[i];
    return r !== 0 && this.interiorOf[r] >= 0;
  }

  inBox(i: number, b: { min: number[]; size: number[] }): boolean {
    const [x, y, z] = coords(this.a, i);
    const o = this.a.origin;
    return (
      x + o[0] >= b.min[0] && x + o[0] < b.min[0] + b.size[0] &&
      y + o[1] >= b.min[1] && y + o[1] < b.min[1] + b.size[1] &&
      z + o[2] >= b.min[2] && z + o[2] < b.min[2] + b.size[2]
    );
  }

  cellAt(x: number, y: number, z: number): number {
    const o = this.a.origin;
    return idx(this.a, x - o[0], y - o[1], z - o[2]);
  }
}

function dedupe(rs: Reason[]): Reason[] {
  const seen = new Set<string>();
  return rs.filter((r) => {
    const k = `${r.rule}|${r.via}|${r.detail.en}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
