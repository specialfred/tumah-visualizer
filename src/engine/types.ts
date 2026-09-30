// Core types for the tumah engine.
//
// Units: the grid unit is one etzba (fingerbreadth). A tefach is 4 etzbaos and an amah is
// 6 tefachim. Coordinates are [x, y, z] with z pointing up; z = 0 is the ground surface and
// everything below it is earth "until the depths" (עד התהום).

export const ETZBA = 1;
export const TEFACH = 4;
export const AMAH = 6 * TEFACH;

export type Vec3 = [number, number, number];

/** Axis-aligned box of whole grid cells: `min` inclusive, `size` in cells. */
export interface Box {
  min: Vec3;
  size: Vec3;
}

export type Lang = 'en' | 'he';
export type Text = { en: string; he?: string };

export type Material =
  | 'earthenware'
  | 'wood'
  | 'metal'
  | 'glass'
  | 'bone'
  | 'cloth'
  | 'leather'
  | 'reed'
  | 'stone'
  | 'marble'
  | 'earth'
  | 'dung'
  | 'plaster'
  | 'flesh'
  | 'food'
  | 'plant';

export type ObjectKind =
  | 'structure' // walls, roofs, floors, beams built into a building — part of the ohel itself
  | 'door' // a closure in an opening; the way the tumah will be taken out (דרך יציאת הטומאה)
  | 'vessel' // כלים
  | 'person' // אדם
  | 'food'
  | 'animal'
  | 'plant'
  | 'tumah' // a source of tumas meis
  | 'cavity' // empty space carved out of the earth (a drain, a cellar, a grave niche)
  | 'misc';

/** Physical properties the rules reason about. Derived from kind/material unless overridden. */
export interface ObjectProps {
  /** מקבל טומאה — can itself become tamei. */
  susceptible: boolean;
  /** Has the status of a vessel (תורת כלי). Broken or 40-se'ah vessels can lose it. */
  vessel: boolean;
  /** Stays in place by itself (8:5: things that float, flap or hop neither bring nor block). */
  stable: boolean;
  /** Has a continuous surface, so it can be a roof (8:4: lattices block but do not bring). */
  solidSurface: boolean;
  /** Built into / nullified to the building (floor boards, plaster, walls). */
  structural: boolean;
  /** Earthenware takes tumah only through its inside air (Vayikra 11:33). */
  receivesFromInsideOnly: boolean;
}

export type TumahKind =
  | 'meis' // a whole corpse
  | 'kezayis' // an olive's bulk of corpse flesh
  | 'rova-atzamos' // a quarter-kav of bones
  | 'rova-dam' // a quarter-log of blood
  | 'etzem-kseorah' // a bone the size of a barleycorn (touch and carry only, 2:3)
  | 'shidra-gulgoles'; // spine or skull

export interface TumahSource {
  kind: TumahKind;
  /** How many full measures (shiurim) this is: 0.5 = half an olive's bulk (3:1, 8:6). Default 1. */
  amount?: number;
}

export interface Container {
  /** The hollow inside of the vessel (air), used for "what is inside it". */
  interior: Box;
  /** צמיד פתיל — a tightly fitting lid. */
  sealed?: boolean;
  /** Capacity; 40 se'ah (dry: 2 kor) makes a flat-bottomed vessel no longer a vessel (8:1). */
  volumeSeah?: number;
}

export interface SceneObject {
  id: string;
  kind: ObjectKind;
  label: Text;
  material: Material;
  parts: Box[];
  props?: Partial<ObjectProps>;
  tumah?: TumahSource;
  container?: Container;
  /** Declared intent to carry the corpse out through this door/window (7:3). */
  intendedExit?: boolean;
  /** Visual hint for the renderer. */
  color?: string;
  /** Group id: parts of one composite built thing (e.g. a room) move together in the editor. */
  group?: string;
}

export interface Scene {
  objects: SceneObject[];
}

export type ShittosSelection = Record<string, string>;

export type Grade =
  | 'K1' // a vessel that touched the tumah (or was in its ohel): חרב הרי הוא כחלל
  | 'A1' // a person who touched the tumah (or was in its ohel)
  | 'K2' // a vessel that touched K1
  | 'A2' // a person who touched K1
  | 'K3' // a vessel that touched a person in the middle of the chain
  | 'E'; // tamei until evening (טומאת ערב)

export interface Reason {
  rule: string;
  /** Mishna refs that ground the rule, e.g. "3:7". */
  refs: string[];
  detail: Text;
  /** The object or region this tumah came from. */
  via?: string;
}

export type Status = 'tamei' | 'tahor' | 'source' | 'insusceptible';

export interface ObjectResult {
  status: Status;
  grade?: Grade;
  /** Seven-day tumah (tumas meis) vs. until evening. */
  sevenDay?: boolean;
  reasons: Reason[];
}

export interface RegionResult {
  id: number;
  kind: 'ohel' | 'pocket';
  /** Set when this region is the inside of a vessel. */
  interiorOf?: string;
  tamei: boolean;
  cellCount: number;
  reasons: Reason[];
}

export interface Evaluation {
  objects: Record<string, ObjectResult>;
  regions: RegionResult[];
  /** Tamei air, for shading: a mask over the analysis grid (1 = tamei air). */
  tameiAir: { origin: Vec3; dims: Vec3; mask: Uint8Array };
  warnings: Text[];
}
