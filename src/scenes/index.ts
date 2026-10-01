import { ch01 } from './ohalos/ch01';
import { ch03 } from './ohalos/ch03';
import { ch04 } from './ohalos/ch04';
import { ch05 } from './ohalos/ch05';
import { ch06 } from './ohalos/ch06';
import { ch07 } from './ohalos/ch07';
import { ch08 } from './ohalos/ch08';
import { ch10 } from './ohalos/ch10';
import { ch11 } from './ohalos/ch11';
import { ch12 } from './ohalos/ch12';
import { ch14 } from './ohalos/ch14';
import { ch15 } from './ohalos/ch15';
import { ch16 } from './ohalos/ch16';
import { ch17 } from './ohalos/ch17';
import type { Scenario } from './types';

export const SCENARIOS: Scenario[] = [...ch01, ...ch03, ...ch04, ...ch05, ...ch06, ...ch07, ...ch08, ...ch10, ...ch11, ...ch12, ...ch14, ...ch15, ...ch16, ...ch17];

export function scenariosFor(ref: string): Scenario[] {
  return SCENARIOS.filter((s) => s.ref === ref);
}
