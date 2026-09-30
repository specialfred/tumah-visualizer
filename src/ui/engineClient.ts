// Runs the engine off the main thread, always evaluating the latest request only.
import type { Evaluation, Scene, ShittosSelection } from '../engine/types';

type Listener = (ev: Evaluation | null, error?: string) => void;

export class EngineClient {
  private worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  private seq = 0;
  private busy = false;
  private pending: { scene: Scene; shittos: ShittosSelection } | null = null;

  constructor(private listener: Listener) {
    this.worker.onmessage = (e: MessageEvent<{ seq: number; ev?: Evaluation; error?: string }>) => {
      this.busy = false;
      if (e.data.seq === this.seq) this.listener(e.data.ev ?? null, e.data.error);
      this.flush();
    };
  }

  request(scene: Scene, shittos: ShittosSelection) {
    this.pending = { scene, shittos };
    this.flush();
  }

  private flush() {
    if (this.busy || !this.pending) return;
    const { scene, shittos } = this.pending;
    this.pending = null;
    this.busy = true;
    this.worker.postMessage({ seq: ++this.seq, scene, shittos });
  }
}
