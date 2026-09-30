// Every scenario is a test: the engine must reproduce the mishna's ruling from general rules.
import { describe, expect, it } from 'vitest';
import { evaluate } from '../engine/evaluate';
import { SCENARIOS } from './index';
import type { Expectation } from './types';
import type { ObjectResult } from '../engine/types';

function actual(r: ObjectResult | undefined, want: Expectation): Expectation {
  if (!r || r.status !== 'tamei') return 'tahor';
  if (want === 'tamei7') return r.sevenDay ? 'tamei7' : 'tameiErev';
  if (want === 'tameiErev') return r.sevenDay ? 'tamei7' : 'tameiErev';
  return 'tamei';
}

describe('scenarios', () => {
  const ids = new Set<string>();
  for (const s of SCENARIOS) {
    it(`${s.id} has a unique id and at least one ruling`, () => {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      expect(Object.keys(s.expect).length).toBeGreaterThan(0);
    });
    const run = () => {
      const scene = s.scene();
      const ev = evaluate(scene, s.shittos);
      for (const [id, want] of Object.entries(s.expect)) {
        expect(scene.objects.some((o) => o.id === id), `object ${id} exists`).toBe(true);
        const r = ev.objects[id];
        const why = r?.reasons.map((x) => `${x.rule}: ${x.detail.en}`).join(' | ');
        expect(actual(r, want), `${id} (${why || 'no reasons'})`).toBe(want);
      }
    };
    if (s.status === 'pending') it.todo(`${s.ref} ${s.id}`);
    else it(`${s.ref} ${s.id}`, run);
  }
});
