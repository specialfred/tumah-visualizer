import { describe, expect, it } from 'vitest';
import text from '../data/ohalos-text.json';
import { COVERAGE } from './coverage';
import { SCENARIOS } from './index';

describe('coverage', () => {
  const refs = text.chapters.flat().map((m) => m.ref);
  it('lists every mishna exactly once', () => {
    expect(COVERAGE.map((c) => c.ref)).toEqual(refs);
  });
  it('has a scenario for every mishna marked modeled or partial', () => {
    for (const c of COVERAGE)
      if (c.status === 'modeled' || c.status === 'partial')
        expect(SCENARIOS.some((s) => s.ref === c.ref && s.status !== 'pending'), c.ref).toBe(true);
  });
  it('scenarios only cite real mishnayos', () => {
    for (const s of SCENARIOS) expect(refs, s.id).toContain(s.ref);
  });
});
