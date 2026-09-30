// Contact chains of tumas meis (Ohalos 1:1–1:4).
//
//   corpse → person (7) → person (evening)                          1:1
//   corpse → vessel (7) → vessel (7) → person/vessel (evening)      1:2
//   corpse → vessel (7) → person (7) → vessel (7) → any (evening)   1:3
//   a person in the middle of the chain passes seven-day tumah to vessels only (1:4)
//
// Being in the tent of the dead counts as touching it (the first link).
import { AIR, GROUND, neighbors6, type Analysis } from './grid';
import { RULES } from './rules';
import type { Grade, ObjectResult, Reason } from './types';

type Carrier = 'vessel' | 'person' | 'food';
type State = 'M' | Grade;

const RANK: Record<State, number> = { M: -1, K1: 0, A1: 1, K2: 2, A2: 3, K3: 4, E: 5 };

/**
 * Next state when `carrier` touches something in state `from`; `null` = no tumas meis passes.
 * Food and drink never carry seven-day tumah: they are tamei and pass nothing on here.
 */
const NEXT: Record<State, Record<Carrier, State | null>> = {
  M: { vessel: 'K1', person: 'A1', food: 'E' },
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
    if (c) offer(oi, NEXT.M[c]!, rs);
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
      offer(w, next, [
        {
          rule: 'maga',
          refs: RULES.maga.refs,
          detail: { en: `Touches ${via.label.en}${s === 'M' ? ' (the tumah itself)' : ''}.` },
          via: via.id,
        },
      ]);
    }
  }

  for (const [oi, s] of state) {
    if (s === 'M') continue;
    const o = a.scene.objects[oi];
    objects[o.id] = {
      status: 'tamei',
      grade: s,
      sevenDay: s !== 'E',
      reasons: [
        ...(why.get(oi) ?? []),
        { rule: 'maga', refs: RULES.maga.refs, detail: { en: `Grade: ${LABEL[s]}.` } },
      ],
    };
  }
}
