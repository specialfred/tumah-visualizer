import { evaluate } from '../engine/evaluate';
import type { Scene, ShittosSelection } from '../engine/types';
import { greedyBoxes } from './meshing';

self.onmessage = (e: MessageEvent<{ seq: number; scene: Scene; shittos: ShittosSelection }>) => {
  const { seq, scene, shittos } = e.data;
  try {
    const ev = evaluate(scene, shittos);
    // Merging the tamei air into boxes is slow on big scenes, so it happens here too.
    const air = greedyBoxes(ev.tameiAir.mask, ev.tameiAir.dims, ev.tameiAir.origin);
    (self as unknown as Worker).postMessage({ seq, ev, air }, [ev.tameiAir.mask.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ seq, error: String(err) });
  }
};
