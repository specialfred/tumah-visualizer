// Contact chains of tumas meis (Ohalos 1:1–1:4).
//
//   corpse → person (7) → person (evening)                          1:1
//   corpse → vessel (7) → vessel (7) → person/vessel (evening)      1:2
//   corpse → vessel (7) → person (7) → vessel (7) → any (evening)   1:3
//   a person in the middle of the chain passes seven-day tumah to vessels only (1:4)
//
// Being in the tent of the dead counts as touching it (the first link). The tent itself (what
// roofs the tumah) is tamei like a vessel that touched it, but it is not counted as a link: what
// touches the tent is as if it touched the dead (1:3 "the tent does not count", 15:2).
import { AIR, GROUND, neighbors6, type Analysis } from './grid';
import { RULES } from './rules';
import type { Grade, ObjectResult, Reason } from './types';

type Carrier = 'vessel' | 'person' | 'food';
/** M: the tumah itself. T: the tent over it, tamei as K1 but passing tumah on as M. */
type State = 'M' | 'T' | Grade;

const RANK: Record<State, number> = { M: -2, T: -1, K1: 0, A1: 1, K2: 2, A2: 3, K3: 4, E: 5 };

/**
 * Next state when `carrier` touches something in state `from`; `null` = no tumas meis passes.
 * Food and drink never carry seven-day tumah: they are tamei and pass nothing on here.
 */
const NEXT: Record<State, Record<Carrier, State | null>> = {
  M: { vessel: 'K1', person: 'A1', food: 'E' },
  T: { vessel: 'K1', person: 'A1', food: 'E' },
  K1: { vessel: 'K2', person: 'A2', food: 'E' },
  A1: { vessel: 'K3', person: 'E', food: 'E' },
  K2: { vessel: 'E', person: 'E', food: 'E' },
  A2: { vessel: 'K3', person: 'E', food: 'E' },
  K3: { vessel: 'E', person: 'E', food: 'E' },
  E: { vessel: null, person: null, food: null },
};

const LABEL: Record<Grade, string> = {
  K1: 'a vessel touching the dead (like the dead itself, חרב הרי הוא כחלל)',
  A1: 'a person touching the dead (אב הטומאה)',
  K2: 'a vessel touching such a vessel',
  A2: 'a person touching such a vessel',
  K3: 'a vessel touching a person in the middle of the chain',
  E: 'tamei until evening',
};

function carrierOf(a: Analysis, oi: number): Carrier | null {
  const o = a.scene.objects[oi];
  if (!a.props[oi].susceptible) return null;
  if (o.kind === 'person') return 'person';
  if (o.kind === 'food') return 'food';
  if (o.kind === 'vessel' || o.kind === 'misc') return 'vessel';
  return null;
}

export function contactPropagation(
  a: Analysis,
  exposed: Map<number, Reason[]>,
  objects: Record<string, ObjectResult>,
  /** Exposed objects that are the tent over the tumah. */
  roofs: Set<number> = new Set(),
) {
  // Object adjacency.
  const touching = new Map<number, Set<number>>();
  for (let v = 0; v < a.objCells.length; v++)
    for (const i of a.objCells[v])
      for (const j of neighbors6(a, i)) {
        const w = a.cells[j];
        if (w === AIR || w === GROUND || w === v) continue;
        if (!touching.has(v)) touching.set(v, new Set());
        touching.get(v)!.add(w);
      }

  const state = new Map<number, State>();
  const why = new Map<number, Reason[]>();
  const queue: number[] = [];
  const offer = (oi: number, s: State, rs: Reason[]) => {
    const cur = state.get(oi);
    if (cur !== undefined && RANK[cur] <= RANK[s]) return;
    state.set(oi, s);
    why.set(oi, rs);
    queue.push(oi);
  };

  // Seeds: the sources, and everything in their tents.
  a.scene.objects.forEach((o, oi) => {
    if (o.kind === 'tumah') {
      state.set(oi, 'M');
      queue.push(oi);
    }
  });
  for (const [oi, rs] of exposed) {
    const c = carrierOf(a, oi);
    if (!c) continue;
    // A person is never the tent here: a person overshadowing tumah is himself an av (A1).
    if (roofs.has(oi) && c === 'vessel') offer(oi, 'T', rs);
    else offer(oi, NEXT.M[c]!, rs);
  }

  while (queue.length) {
    const v = queue.shift()!;
    const s = state.get(v)!;
    // Earthenware does not pass tumah on by its outside.
    if (s !== 'M' && (a.props[v].receivesFromInsideOnly || carrierOf(a, v) === 'food')) continue;
    for (const w of touching.get(v) ?? []) {
      const c = carrierOf(a, w);
      if (!c || a.props[w].receivesFromInsideOnly) continue;
      const next = NEXT[s][c];
      if (!next) continue;
      const via = a.scene.objects[v];
      const what = s === 'M' ? ' (the tumah itself)' : s === 'T' ? ' (the tent over the tumah, which is not counted as a link)' : '';
      offer(w, next, [
        {
          rule: 'maga',
          refs: RULES.maga.refs,
          detail: { en: `Touches ${via.label.en}${what}.` },
          via: via.id,
        },
      ]);
    }
  }

  for (const [oi, s] of state) {
    if (s === 'M') continue;
    const o = a.scene.objects[oi];
    const grade: Grade = s === 'T' ? 'K1' : s;
    const label = s === 'T' ? 'the tent over the tumah, tamei for seven days; it is not counted as a link (האהל אינו מן המנין)' : LABEL[grade];
    objects[o.id] = {
      status: 'tamei',
      grade,
      sevenDay: grade !== 'E',
      reasons: [...(why.get(oi) ?? []), { rule: 'maga', refs: RULES.maga.refs, detail: { en: `Grade: ${label}.` } }],
    };
  }
}
