import { create } from 'zustand';
import { defaultShittos } from '../engine/shittos';
import { TEFACH, type Evaluation, type Lang, type Scene, type SceneObject, type ShittosSelection, type Vec3 } from '../engine/types';
import { SCENARIOS } from '../scenes/index';
import { EngineClient } from './engineClient';
import { TEMPLATES } from './templates';

export type RightTab = 'text' | 'inspect' | 'shittos';

interface State {
  lang: Lang;
  mishnaRef: string;
  scenarioId: string | null;
  /** The scene differs from the loaded scenario. */
  modified: boolean;
  scene: Scene;
  shittos: ShittosSelection;
  selected: string | null;
  evaluation: Evaluation | null;
  engineError: string | null;
  tab: RightTab;
  view: { showAir: boolean; xray: boolean; snap: number; labels: boolean };
  history: Scene[];

  setLang: (l: Lang) => void;
  setTab: (t: RightTab) => void;
  openMishna: (ref: string) => void;
  loadScenario: (id: string) => void;
  newScene: () => void;
  setShitah: (dispute: string, option: string) => void;
  select: (id: string | null) => void;
  setView: (v: Partial<State['view']>) => void;
  moveObjectTo: (id: string, anchor: Vec3) => void;
  updateObject: (id: string, f: (o: SceneObject) => SceneObject) => void;
  addTemplate: (templateId: string) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  undo: () => void;
}

const clone = (s: Scene): Scene => structuredClone(s);

/** Anchor of an object: the min corner of its bounding box, in grid units. */
export function anchorOf(o: SceneObject): Vec3 {
  const m: Vec3 = [Infinity, Infinity, Infinity];
  for (const p of o.parts) for (let k = 0; k < 3; k++) m[k] = Math.min(m[k], p.min[k]);
  return m;
}

export function shiftObject(o: SceneObject, d: Vec3): SceneObject {
  const sh = (v: Vec3): Vec3 => [v[0] + d[0], v[1] + d[1], v[2] + d[2]];
  return {
    ...o,
    parts: o.parts.map((p) => ({ ...p, min: sh(p.min) })),
    container: o.container ? { ...o.container, interior: { ...o.container.interior, min: sh(o.container.interior.min) } } : undefined,
  };
}

/** Objects that move together with `id` (a room and its doors). */
function groupOf(scene: Scene, id: string): Set<string> {
  const o = scene.objects.find((x) => x.id === id);
  if (!o?.group || o.group !== o.id) return new Set([id]);
  return new Set(scene.objects.filter((x) => x.group === o.group).map((x) => x.id));
}

const first = SCENARIOS[0];
let client: EngineClient | null = null;

export const useStore = create<State>((set, get) => {
  const commit = (scene: Scene, extra: Partial<State> = {}) => {
    set({ history: [...get().history.slice(-49), get().scene], scene, modified: true, ...extra });
    client?.request(scene, get().shittos);
  };

  return {
    lang: 'en',
    mishnaRef: first.ref,
    scenarioId: first.id,
    modified: false,
    scene: first.scene(),
    shittos: { ...defaultShittos(), ...first.shittos },
    selected: null,
    evaluation: null,
    engineError: null,
    tab: 'text',
    view: { showAir: true, xray: true, snap: TEFACH, labels: false },
    history: [],

    setLang: (lang) => set({ lang }),
    setTab: (tab) => set({ tab }),
    openMishna: (ref) => {
      const s = SCENARIOS.find((x) => x.ref === ref);
      if (s) get().loadScenario(s.id);
      else set({ mishnaRef: ref, tab: 'text' });
    },
    loadScenario: (id) => {
      const s = SCENARIOS.find((x) => x.id === id);
      if (!s) return;
      const scene = s.scene();
      const shittos = { ...defaultShittos(), ...s.shittos };
      set({ mishnaRef: s.ref, scenarioId: id, scene, shittos, modified: false, selected: null, history: [], evaluation: null, tab: 'text' });
      client?.request(scene, shittos);
    },
    newScene: () => commit({ objects: [] }, { scenarioId: null, selected: null }),
    setShitah: (dispute, option) => {
      const shittos = { ...get().shittos, [dispute]: option };
      set({ shittos });
      client?.request(get().scene, shittos);
    },
    select: (selected) => set(selected ? { selected, tab: 'inspect' } : { selected }),
    setView: (v) => set({ view: { ...get().view, ...v } }),
    moveObjectTo: (id, anchor) => {
      const { scene } = get();
      const o = scene.objects.find((x) => x.id === id);
      if (!o) return;
      const a = anchorOf(o);
      const d: Vec3 = [anchor[0] - a[0], anchor[1] - a[1], anchor[2] - a[2]];
      if (d.every((v) => v === 0)) return;
      const members = groupOf(scene, id);
      commit({ objects: scene.objects.map((x) => (members.has(x.id) ? shiftObject(x, d) : x)) });
    },
    updateObject: (id, f) => {
      const { scene } = get();
      commit({ objects: scene.objects.map((x) => (x.id === id ? f(x) : x)) });
    },
    addTemplate: (templateId) => {
      const t = TEMPLATES.find((x) => x.id === templateId);
      if (!t) return;
      const { scene } = get();
      const used = new Set(scene.objects.map((o) => o.id));
      let n = 1;
      while (used.has(`${t.id}-${n}`)) n++;
      const id = `${t.id}-${n}`;
      // Drop it just beyond the current scene, on the ground.
      let maxX = 0;
      for (const o of scene.objects) for (const p of o.parts) maxX = Math.max(maxX, (p.min[0] + p.size[0]) / TEFACH);
      const objs = t.make(id, [Math.ceil(maxX) + 2, 0, 0]);
      commit({ objects: [...scene.objects, ...objs] }, { selected: id, tab: 'inspect' });
    },
    removeObject: (id) => {
      const { scene } = get();
      const members = groupOf(scene, id);
      commit({ objects: scene.objects.filter((x) => !members.has(x.id)) }, { selected: null });
    },
    duplicateObject: (id) => {
      const { scene } = get();
      const members = scene.objects.filter((x) => groupOf(scene, id).has(x.id));
      const used = new Set(scene.objects.map((o) => o.id));
      const rename = (s: string) => {
        let n = 2;
        while (used.has(`${s}-${n}`)) n++;
        used.add(`${s}-${n}`);
        return `${s}-${n}`;
      };
      const ids = new Map(members.map((m) => [m.id, rename(m.id)]));
      const copies = members.map((m) =>
        shiftObject({ ...structuredClone(m), id: ids.get(m.id)!, group: m.group ? ids.get(m.group) ?? m.group : undefined }, [TEFACH, TEFACH, 0]),
      );
      commit({ objects: [...scene.objects, ...copies] }, { selected: ids.get(id) ?? null });
    },
    undo: () => {
      const h = get().history;
      if (!h.length) return;
      const scene = h[h.length - 1];
      set({ scene, history: h.slice(0, -1), selected: null });
      client?.request(scene, get().shittos);
    },
  };
});

client = new EngineClient((evaluation, error) => useStore.setState({ evaluation, engineError: error ?? null }));
{
  const s = useStore.getState();
  client.request(clone(s.scene), s.shittos);
}
