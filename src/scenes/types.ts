import type { Scene, ShittosSelection, Text } from '../engine/types';

/**
 * What a mishna says about one object: 'tamei' / 'tahor', or more specifically seven-day tumah
 * ('tamei7') or tumah until evening ('tameiErev').
 */
export type Expectation = 'tamei' | 'tahor' | 'tamei7' | 'tameiErev';

export interface Scenario {
  /** Unique id, e.g. "3:7/outlet-tefach/tumah-inside". */
  id: string;
  /** The mishna, e.g. "3:7". */
  ref: string;
  title: Text;
  /** The words of the mishna this scenario demonstrates. */
  clause?: Text;
  /** Shittos this scenario runs under; unspecified disputes use their defaults. */
  shittos?: ShittosSelection;
  scene: () => Scene;
  /** Object id -> ruling. Every scenario must state at least one ruling from the mishna. */
  expect: Record<string, Expectation>;
  /**
   * 'pending': the engine does not reproduce this ruling yet. The test suite reports it as a
   * todo instead of failing, and the coverage report lists it. Never mark a scenario pending to
   * hide a regression.
   */
  status?: 'pending';
  notes?: string;
}

export type MishnaStatus =
  | 'modeled' // every ruling in the mishna has a passing scenario
  | 'partial' // some rulings have passing scenarios
  | 'todo' // spatial, not yet modeled
  | 'catalog'; // not a spatial case: defines sources, measures, or procedures (tracked as data)

export interface MishnaCoverage {
  ref: string;
  status: MishnaStatus;
  /** What the engine needs in order to model this mishna, or why it is catalog-only. */
  needs?: string;
}
