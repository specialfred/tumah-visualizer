// Runs the engine off the main thread, always evaluating the latest request only. Falls back to
// the main thread where workers are unavailable (some sandboxed hosts block them).
import { evaluate } from '../engine/evaluate';
import type { Evaluation, Scene, ShittosSelection } from '../engine/types';
import { greedyBoxes, type MaskBox } from './meshing';

export interface EngineResult {
  ev: Evaluation | null;
  /** The tamei air, merged into boxes for drawing. */
  air: MaskBox[];
  error?: string;
}

/** Called with the result of the latest request only; results that a newer request has made stale are dropped. */
type Listener = (r: EngineResult) => void;

function makeWorker(): Worker | null {
  try {
    return new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

function afterPaint(f: () => void) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => setTimeout(f, 0));
  else setTimeout(f, 0);
}

export class EngineClient {
  private worker = makeWorker();
  private seq = 0;
  private busy = false;
  private pending: { scene: Scene; shittos: ShittosSelection } | null = null;

  constructor(private listener: Listener) {
    if (!this.worker) return;
    this.worker.onmessage = (e: MessageEvent<{ seq: number; ev?: Evaluation; air?: MaskBox[]; error?: string }>) => {
      this.busy = false;
      if (e.data.seq === this.seq && !this.pending) this.listener({ ev: e.data.ev ?? null, air: e.data.air ?? [], error: e.data.error });
      this.flush();
    };
    this.worker.onerror = () => {
      // The worker failed to load: switch to the main thread and redo the last request.
      this.worker = null;
      this.busy = false;
      this.flush();
    };
  }

  request(scene: Scene, shittos: ShittosSelection) {
    this.pending = { scene, shittos };
    this.flush();
  }

  private lastSent: { scene: Scene; shittos: ShittosSelection } | null = null;

  private flush() {
    if (this.busy) return;
    const job = this.pending ?? (this.worker ? null : this.lastSent);
    if (!job) return;
    this.pending = null;
    this.lastSent = job;
    if (!this.worker) {
      this.busy = true;
      // Let the UI paint (the drop, the "updating" note) before a synchronous evaluation blocks it.
      afterPaint(() => {
        let result: EngineResult;
        try {
          const ev = evaluate(job.scene, job.shittos);
          result = { ev, air: greedyBoxes(ev.tameiAir.mask, ev.tameiAir.dims, ev.tameiAir.origin) };
        } catch (err) {
          result = { ev: null, air: [], error: String(err) };
        }
        this.busy = false;
        this.lastSent = null;
        if (this.pending) this.flush();
        else this.listener(result);
      });
      return;
    }
    this.busy = true;
    this.worker.postMessage({ seq: ++this.seq, scene: job.scene, shittos: job.shittos });
  }
}
