import { evaluate } from '../engine/evaluate';
import type { Scene, ShittosSelection } from '../engine/types';

self.onmessage = (e: MessageEvent<{ seq: number; scene: Scene; shittos: ShittosSelection }>) => {
  const { seq, scene, shittos } = e.data;
  try {
    const ev = evaluate(scene, shittos);
    (self as unknown as Worker).postMessage({ seq, ev }, [ev.tameiAir.mask.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ seq, error: String(err) });
  }
};
