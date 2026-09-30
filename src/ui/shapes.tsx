// Recognizable stand-ins for scene objects. The engine reasons about boxes of grid cells; here a
// person is drawn as a figure, a corpse as a body lying down, an olive-bulk as a lump, a vessel as
// a cup or jar — each fitted inside the object's box, which is outlined when it is selected.
import type { ThreeElements } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { TEFACH, type SceneObject, type Vec3 } from '../engine/types';

const T = (v: number) => v / TEFACH;

export type Shape = 'figure' | 'limb' | 'body' | 'lump' | 'cup' | 'jar' | 'box';

/** Bounds of all parts, in tefachim. */
export function boundsOf(o: SceneObject): { min: Vec3; size: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const p of o.parts)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], T(p.min[k]));
      max[k] = Math.max(max[k], T(p.min[k] + p.size[k]));
    }
  return { min, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

/** Whether the container's mouth is on top (nothing covers the cells just above its hollow). */
function openOnTop(o: SceneObject): boolean {
  const i = o.container!.interior;
  const at = [i.min[0] + i.size[0] / 2, i.min[1] + i.size[1] / 2, i.min[2] + i.size[2] + 0.5];
  return !o.parts.some((p) => p.min.every((v, k) => at[k] >= v && at[k] < v + p.size[k]));
}

export function shapeOf(o: SceneObject): Shape {
  const [sx, sy, sz] = boundsOf(o).size;
  const wide = Math.max(sx, sy);
  if (o.kind === 'person') return sz >= 2 * wide ? 'figure' : 'limb';
  if (o.kind === 'tumah') return o.tumah?.kind === 'meis' || wide >= 4 * sz ? 'body' : 'lump';
  if (o.kind === 'vessel') {
    if (o.container) {
      const potMaterial = o.material === 'earthenware' || o.material === 'dung';
      return potMaterial && (o.container.sealed || openOnTop(o)) ? 'jar' : 'box';
    }
    // Boards, tablets and cloaks stay flat slabs; small chunky vessels read as cups.
    if (o.parts.length === 1 && sz >= 0.5 * Math.min(sx, sy)) return 'cup';
  }
  return 'box';
}

export interface SkinProps {
  color: string;
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
}

/** Pointer handlers shared by every mesh that makes up an object. */
export type ObjectHandlers = Pick<
  ThreeElements['mesh'],
  'onClick' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onLostPointerCapture' | 'onPointerOver' | 'onPointerOut'
>;

interface BodyProps {
  o: SceneObject;
  shape: Exclude<Shape, 'box'>;
  /** The group's origin in tefachim; shapes are placed relative to it. */
  origin: Vec3;
  skin: SkinProps;
  selected: boolean;
  handlers: ObjectHandlers;
  translucent: boolean;
}

export function ShapedBody({ o, shape, origin, skin, selected, handlers, translucent }: BodyProps) {
  const b = boundsOf(o);
  const min: Vec3 = [b.min[0] - origin[0], b.min[1] - origin[1], b.min[2] - origin[2]];
  const [sx, sy, sz] = b.size;
  const outline = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(sx, sy, sz)), [sx, sy, sz]);
  const center: Vec3 = [min[0] + sx / 2, min[1] + sy / 2, min[2]];
  // Lay the shape's long axis along x or y, whichever the box is longer in.
  const alongY = sy > sx;
  const [L, W] = alongY ? [sy, sx] : [sx, sy];
  const mesh = { ...handlers, userData: { translucent } };
  const mat = <meshStandardMaterial {...skin} side={shape === 'cup' || shape === 'jar' ? THREE.DoubleSide : THREE.FrontSide} />;

  let body: React.ReactNode;
  if (shape === 'figure') body = <Figure h={sz} W={L} D={W} mesh={mesh} mat={mat} />;
  else if (shape === 'limb') body = <Capsule a={[-L / 2 + Math.min(W, sz) / 2, 0, sz / 2]} b={[L / 2 - Math.min(W, sz) / 2, 0, sz / 2]} r={Math.min(W, sz) / 2} mesh={mesh} mat={mat} />;
  else if (shape === 'body') body = <Lying L={L} W={W} H={sz} mesh={mesh} mat={mat} />;
  else if (shape === 'lump')
    body = (
      <mesh {...mesh} position={[0, 0, sz / 2]} scale={[L / 2, W / 2, sz / 2]}>
        <dodecahedronGeometry args={[1, 1]} />
        {mat}
      </mesh>
    );
  else body = <Pot kind={shape} L={L} W={W} H={sz} sealed={!!o.container?.sealed} mesh={mesh} mat={mat} />;

  return (
    <group position={center}>
      <group rotation={[0, 0, alongY ? Math.PI / 2 : 0]}>{body}</group>
      {o.kind === 'tumah' && <Halo rx={sx / 2 + 0.35} ry={sy / 2 + 0.35} />}
      {selected && (
        <lineSegments geometry={outline} position={[0, 0, sz / 2]} raycast={() => null}>
          <lineBasicMaterial color="#2563eb" />
        </lineSegments>
      )}
    </group>
  );
}

type MeshProps = ObjectHandlers & { userData: { translucent: boolean } };
type PartProps = { mesh: MeshProps; mat: React.ReactNode };

const Y = new THREE.Vector3(0, 1, 0);

/** A capsule whose core runs from a to b. */
function Capsule({ a, b, r, mesh, mat }: { a: Vec3; b: Vec3; r: number } & PartProps) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, vb.clone().sub(va).normalize());
  return (
    <mesh {...mesh} position={va.add(vb).multiplyScalar(0.5)} quaternion={q}>
      <capsuleGeometry args={[r, len, 4, 12]} />
      {mat}
    </mesh>
  );
}

/** A standing person: legs, torso, arms and head, shoulders across W. */
function Figure({ h, W, D, mesh, mat }: { h: number; W: number; D: number } & PartProps) {
  const rh = Math.min(0.065 * h, 0.25 * W, 0.6 * D);
  const neck = h - 1.85 * rh;
  const hip = 0.48 * h;
  // The torso is wider across the shoulders than it is deep: a round capsule stretched sideways.
  const tw = 0.25 * W;
  const td = Math.min(0.4 * D, tw);
  const rl = Math.min(0.08 * W, 0.3 * D);
  const ra = Math.min(0.06 * W, 0.25 * D);
  const shoulder = neck - td;
  const p = { mesh, mat };
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Capsule a={[s * 0.1 * W, 0, rl]} b={[s * 0.1 * W, 0, hip]} r={rl} {...p} />
          <Capsule a={[s * (tw + ra * 0.6), 0, shoulder]} b={[s * (tw + ra * 1.2), 0, hip - 0.04 * h]} r={ra} {...p} />
        </group>
      ))}
      <group scale={[tw / td, 1, 1]}>
        <Capsule a={[0, 0, hip]} b={[0, 0, shoulder]} r={td} {...p} />
      </group>
      <mesh {...mesh} position={[0, 0, h - rh]}>
        <sphereGeometry args={[rh, 20, 14]} />
        {mat}
      </mesh>
    </group>
  );
}

/** A body lying on its back, head toward +x. */
function Lying({ L, W, H, mesh, mat }: { L: number; W: number; H: number } & PartProps) {
  const x0 = -L / 2;
  const rh = Math.min(0.5 * H, 0.35 * W, 0.07 * L);
  const rt = 0.45 * H;
  const rl = Math.min(0.12 * W, 0.4 * H);
  const ra = Math.min(0.09 * W, 0.35 * H);
  const hip = x0 + 0.47 * L;
  const neck = L / 2 - 1.8 * rh;
  const p = { mesh, mat };
  return (
    <group>
      <mesh {...mesh} position={[L / 2 - rh, 0, rh]}>
        <sphereGeometry args={[rh, 20, 14]} />
        {mat}
      </mesh>
      {/* A round capsule flattened out to the body's width. */}
      <group scale={[1, Math.min(0.3 * W, 1.6 * rt) / rt, 1]}>
        <Capsule a={[hip + rt, 0, rt]} b={[neck - rt, 0, rt]} r={rt} {...p} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Capsule a={[x0 + rl, s * 0.13 * W, rl]} b={[hip + rl, s * 0.12 * W, rl]} r={rl} {...p} />
          <Capsule a={[hip - 0.02 * L, s * 0.38 * W, ra]} b={[neck - ra * 2, s * 0.36 * W, ra]} r={ra} {...p} />
        </group>
      ))}
    </group>
  );
}

// Lathe profiles as [radius, height], both as fractions of the box (radius 0.5 = touching its sides).
const CUP: [number, number][] = [
  [0, 0.1], [0.3, 0.1], [0.34, 0], [0.4, 0], [0.42, 0.08], [0.47, 0.92], [0.5, 1], [0.45, 1], [0.42, 0.9], [0.37, 0.18], [0, 0.18],
];
const JAR: [number, number][] = [
  [0, 0], [0.28, 0], [0.4, 0.12], [0.5, 0.42], [0.46, 0.66], [0.34, 0.8], [0.24, 0.88], [0.26, 0.97], [0.3, 1], [0.24, 1], [0.2, 0.92], [0.2, 0.88],
];

function Pot({ kind, L, W, H, sealed, mesh, mat }: { kind: 'cup' | 'jar'; L: number; W: number; H: number; sealed: boolean } & PartProps) {
  const geo = useMemo(() => {
    const pts = (kind === 'cup' ? CUP : JAR).map(([r, z]) => new THREE.Vector2(r, z));
    // Round the jar's belly and shoulder; the cup keeps its crisp rim.
    return new THREE.LatheGeometry(kind === 'jar' ? new THREE.SplineCurve(pts).getPoints(48) : pts, 32);
  }, [kind]);
  return (
    <group>
      {/* Lathe geometry spins around y; turn it upright and stretch it to the box. */}
      <mesh {...mesh} geometry={geo} scale={[L, H, W]} rotation={[Math.PI / 2, 0, 0]}>
        {mat}
      </mesh>
      {kind === 'jar' && sealed && (
        // צמיד פתיל: a lid pressed onto the mouth.
        <mesh {...mesh} position={[0, 0, H]} rotation={[Math.PI / 2, 0, 0]} scale={[L, 1, W]}>
          <cylinderGeometry args={[0.33, 0.33, Math.max(0.08, 0.05 * H), 24]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

/** A glowing ring on the ground around a source of tumah, so even a tiny one is easy to spot. */
function Halo({ rx, ry }: { rx: number; ry: number }) {
  return (
    <mesh position={[0, 0, 0.02]} scale={[rx, ry, 1]} raycast={() => null} renderOrder={3}>
      <ringGeometry args={[0.82, 1, 48]} />
      <meshBasicMaterial color="#e11d48" transparent opacity={0.75} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
