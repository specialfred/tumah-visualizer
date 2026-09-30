// Runs the engine off the main thread, always evaluating the latest request only. Falls back to
// the main thread where workers are unavailable (some sandboxed hosts block them).
import { evaluate } from '../engine/evaluate';
import type { Evaluation, Scene, ShittosSelection } from '../engine/types';

type Listener = (ev: Evaluation | null, error?: string) => void;

function makeWorker(): Worker | null {
  try {
    return new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

export class EngineClient {
  private worker = makeWorker();
  private seq = 0;
  private busy = false;
  private pending: { scene: Scene; shittos: ShittosSelection } | null = null;

  constructor(private listener: Listener) {
    if (!this.worker) return;
    this.worker.onmessage = (e: MessageEvent<{ seq: number; ev?: Evaluation; error?: string }>) => {
      this.busy = false;
      if (e.data.seq === this.seq) this.listener(e.data.ev ?? null, e.data.error);
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
      // Yield so the UI can paint before a synchronous evaluation.
      setTimeout(() => {
        try {
          this.listener(evaluate(job.scene, job.shittos));
        } catch (err) {
          this.listener(null, String(err));
        }
        this.busy = false;
        this.lastSent = null;
        if (this.pending) this.flush();
      }, 0);
      return;
    }
    this.busy = true;
    this.worker.postMessage({ seq: ++this.seq, scene: job.scene, shittos: job.shittos });
  }
}
