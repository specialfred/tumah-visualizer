import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Grid, Html, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TEFACH, type SceneObject, type Vec3 } from '../engine/types';
import { objectColor } from './colors';
import { greedyBoxes } from './meshing';
import { ShapedBody, shapeOf, type ObjectHandlers, type SkinProps } from './shapes';
import { anchorOf, groupOf, useStore } from './store';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const T = (v: number) => v / TEFACH;

export function Viewport() {
  const deselect = useStore((s) => s.select);
  return (
    <Canvas
      camera={{ position: [18, -22, 16], fov: 40, near: 0.1, far: 1000 }}
      onPointerMissed={() => deselect(null)}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#f4f1ea']} />
      <hemisphereLight args={['#ffffff', '#b9a98f', 1.1]} />
      <directionalLight position={[20, -10, 30]} intensity={1.4} />
      <directionalLight position={[-15, 20, 10]} intensity={0.4} />
      <Ground />
      <SceneObjects />
      <TameiAir />
      <Framing />
      <OrbitControls makeDefault enableDamping dampingFactor={0.12} />
      <OrbitSafety />
    </Canvas>
  );
}

/** Whatever happens during a drag, letting go of the mouse always gives the camera back. */
function OrbitSafety() {
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  useEffect(() => {
    const release = () => {
      if (controls) controls.enabled = true;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
    };
  }, [controls]);
  return null;
}

function Framing() {
  const scenarioId = useStore((s) => s.scenarioId);
  const scene = useStore((s) => s.scene);
  const { camera, controls } = useThree();
  useEffect(() => {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const o of scene.objects)
      for (const p of o.parts)
        for (let k = 0; k < 3; k++) {
          min[k] = Math.min(min[k], T(p.min[k]));
          max[k] = Math.max(max[k], T(p.min[k] + p.size[k]));
        }
    if (!isFinite(min[0])) return;
    const c = new THREE.Vector3((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, Math.max(0, (min[2] + max[2]) / 2));
    const r = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2], 6);
    camera.position.set(c.x + r * 1.1, c.y - r * 1.5, c.z + r * 1.0);
    const oc = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (oc) {
      oc.target.copy(c);
      oc.update();
    } else camera.lookAt(c);
    // Only reframe when a new scenario is loaded, not on every edit.
  }, [scenarioId, controls]);
  return null;
}

function Ground() {
  const scene = useStore((s) => s.scene);
  const xray = useStore((s) => s.view.xray);
  const { min, max, depth } = useMemo(() => {
    const min = [-6, -6];
    const max = [6, 6];
    let depth = 2;
    for (const o of scene.objects)
      for (const p of o.parts) {
        min[0] = Math.min(min[0], T(p.min[0]) - 4);
        min[1] = Math.min(min[1], T(p.min[1]) - 4);
        max[0] = Math.max(max[0], T(p.min[0] + p.size[0]) + 4);
        max[1] = Math.max(max[1], T(p.min[1] + p.size[1]) + 4);
        depth = Math.max(depth, -T(p.min[2]) + 1);
      }
    return { min, max, depth };
  }, [scene]);
  return (
    <group>
      <Grid
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.001]}
        args={[400, 400]}
        cellSize={1}
        sectionSize={6}
        cellColor="#cfc6b4"
        sectionColor="#a8987a"
        cellThickness={0.6}
        sectionThickness={1}
        fadeDistance={120}
        infiniteGrid
      />
      <mesh position={[(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, -depth / 2]}>
        <boxGeometry args={[max[0] - min[0], max[1] - min[1], depth]} />
        <meshStandardMaterial color="#b08b5b" transparent opacity={xray ? 0.28 : 0.9} depthWrite={!xray} />
      </mesh>
    </group>
  );
}

function SceneObjects() {
  const scene = useStore((s) => s.scene);
  const selected = useStore((s) => s.selected);
  return (
    <>
      {scene.objects.map((o) => (
        <ObjectMesh key={o.id} o={o} selected={o.id === selected} />
      ))}
    </>
  );
}

/** Buildings are easy to grab by accident while turning the camera, so they need selecting first. */
const grabbableUnselected = (o: SceneObject) => !['structure', 'door', 'cavity'].includes(o.kind);

interface DragState {
  plane: THREE.Plane;
  start: THREE.Vector3;
  vertical: boolean;
  ids: string[];
}

function ObjectMesh({ o, selected }: { o: SceneObject; selected: boolean }) {
  const result = useStore((s) => s.evaluation?.objects[o.id]);
  const select = useStore((s) => s.select);
  const nudge = useStore((s) => s.nudge);
  const setDrag = useStore((s) => s.setDrag);
  const dragOffset = useStore((s) => (s.drag && s.drag.ids.includes(o.id) ? s.drag.offset : null));
  const xray = useStore((s) => s.view.xray);
  const labels = useStore((s) => s.view.labels);
  const lang = useStore((s) => s.lang);
  const { camera, controls } = useThree();
  const drag = useRef<DragState | null>(null);
  const anchor = anchorOf(o);
  const color = objectColor(o, result);
  const isCavity = o.kind === 'cavity';
  const translucent = isCavity || (xray && (o.kind === 'structure' || o.kind === 'door' || result?.status === 'insusceptible'));
  const opacity = isCavity ? 0.35 : translucent ? 0.28 : 1;
  const shape = shapeOf(o);
  const skin: SkinProps = {
    color: isCavity ? '#1c1917' : color,
    transparent: translucent,
    opacity,
    depthWrite: !translucent,
    emissive: o.kind === 'tumah' ? '#be123c' : '#000000',
    emissiveIntensity: o.kind === 'tumah' ? 0.18 : 0,
    roughness: 0.8,
  };
  const canGrab = selected || grabbableUnselected(o);
  const orbit = (on: boolean) => {
    if (controls) (controls as unknown as { enabled: boolean }).enabled = on;
  };
  // See-through walls let clicks pass to whatever solid thing is behind them.
  const passThrough = (e: ThreeEvent<PointerEvent | MouseEvent>) => translucent && e.intersections.some((i) => i.object.userData.translucent === false);

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    orbit(true);
    const d = useStore.getState().drag;
    setDrag(null);
    // The rules run once, on the drop, rather than on every step of the drag.
    if (d && d.offset.some((v) => v !== 0)) nudge(o.id, d.offset);
  };

  const handlers: ObjectHandlers = {
    onClick: (e) => {
      if (passThrough(e)) return;
      e.stopPropagation();
      select(o.id);
    },
    onPointerDown: (e) => {
      if (e.button !== 0 || passThrough(e)) return;
      e.stopPropagation();
      select(o.id);
      if (!canGrab) return;
      // Slide along the floor; with Shift, lift up and down on a wall facing the camera.
      const vertical = e.shiftKey;
      const start = e.point.clone();
      const normal = new THREE.Vector3(0, 0, 1);
      if (vertical) {
        camera.getWorldDirection(normal);
        normal.z = 0;
        if (normal.lengthSq() < 1e-6) normal.set(0, 1, 0);
        normal.normalize();
      }
      drag.current = { plane: new THREE.Plane().setFromNormalAndCoplanarPoint(normal, start), start, vertical, ids: [...groupOf(useStore.getState().scene, o.id)] };
      (e.target as Element).setPointerCapture(e.pointerId);
      orbit(false);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d) return;
      e.stopPropagation();
      const hit = new THREE.Vector3();
      if (!e.ray.intersectPlane(d.plane, hit)) return;
      hit.sub(d.start);
      const snap = useStore.getState().view.snap;
      const g = (v: number) => Math.round((v * TEFACH) / snap) * snap;
      const offset: Vec3 = d.vertical ? [0, 0, g(hit.z)] : [g(hit.x), g(hit.y), 0];
      const cur = useStore.getState().drag?.offset;
      if (!cur || cur.some((v, k) => v !== offset[k])) setDrag({ ids: d.ids, offset });
    },
    onPointerUp: (e) => {
      if (!drag.current) return;
      e.stopPropagation();
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      endDrag();
    },
    onLostPointerCapture: endDrag,
    onPointerOver: (e) => {
      if (passThrough(e)) return;
      e.stopPropagation();
      document.body.style.cursor = canGrab ? 'grab' : 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = '';
    },
  };

  const top = Math.max(...o.parts.map((p) => T(p.min[2] + p.size[2]))) - T(anchor[2]);
  const cx = o.parts.reduce((s, p) => s + T(p.min[0] + p.size[0] / 2), 0) / o.parts.length - T(anchor[0]);
  const cy = o.parts.reduce((s, p) => s + T(p.min[1] + p.size[1] / 2), 0) / o.parts.length - T(anchor[1]);
  const off = dragOffset ?? [0, 0, 0];

  return (
    <group position={[T(anchor[0] + off[0]), T(anchor[1] + off[1]), T(anchor[2] + off[2])]}>
      {shape === 'box' ? (
        o.parts.map((p, i) => (
          <mesh
            key={i}
            position={[T(p.min[0] - anchor[0] + p.size[0] / 2), T(p.min[1] - anchor[1] + p.size[1] / 2), T(p.min[2] - anchor[2] + p.size[2] / 2)]}
            {...handlers}
            userData={{ translucent }}
          >
            <boxGeometry args={[T(p.size[0]), T(p.size[1]), T(p.size[2])]} />
            <meshStandardMaterial {...skin} />
            <Edges color={selected ? '#2563eb' : o.kind === 'tumah' ? '#be123c' : '#44403c'} lineWidth={selected ? 2.5 : 1} threshold={20} />
          </mesh>
        ))
      ) : (
        <ShapedBody
          o={o}
          shape={shape}
          origin={[T(anchor[0]), T(anchor[1]), T(anchor[2])]}
          skin={skin}
          selected={selected}
          handlers={handlers}
          translucent={translucent}
        />
      )}
      {(labels || selected) && o.kind !== 'structure' && (
        <Html position={[cx, cy, top + 0.4]} center distanceFactor={18} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-stone-800 shadow ring-1 ring-stone-900/10">
            {(lang === 'he' && o.label.he) || o.label.en}
          </div>
        </Html>
      )}
    </group>
  );
}

function TameiAir() {
  const ev = useStore((s) => s.evaluation);
  const show = useStore((s) => s.view.showAir);
  const boxes = useMemo(() => (ev ? greedyBoxes(ev.tameiAir.mask, ev.tameiAir.dims, ev.tameiAir.origin) : []), [ev]);
  if (!show) return null;
  return (
    <group>
      {boxes.map((b, i) => (
        <mesh key={i} position={[T(b.min[0] + b.size[0] / 2), T(b.min[1] + b.size[1] / 2), T(b.min[2] + b.size[2] / 2)]} renderOrder={2}>
          <boxGeometry args={[T(b.size[0]), T(b.size[1]), T(b.size[2])]} />
          <meshBasicMaterial color={b.value === 1 ? '#f43f5e' : '#fb7185'} transparent opacity={b.value === 1 ? 0.16 : 0.09} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
