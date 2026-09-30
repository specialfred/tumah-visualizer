import type { ObjectProps, SceneObject } from './types';

/** Materials whose vessels cannot become tamei (5:5: vessels of dung, stone and earth). */
const INSUSCEPTIBLE_VESSEL = new Set(['stone', 'marble', 'earth', 'dung']);

/** A flat-bottomed vessel holding 40 se'ah does not become tamei (8:1). */
export const FORTY_SEAH = 40;

export function resolveProps(o: SceneObject): ObjectProps {
  const base: ObjectProps = {
    susceptible: false,
    vessel: false,
    stable: true,
    solidSurface: true,
    structural: false,
    receivesFromInsideOnly: false,
  };
  switch (o.kind) {
    case 'structure':
    case 'door':
      base.structural = true;
      break;
    case 'vessel':
      base.vessel = true;
      base.susceptible =
        !INSUSCEPTIBLE_VESSEL.has(o.material) && (o.container?.volumeSeah ?? 0) < FORTY_SEAH;
      base.receivesFromInsideOnly = o.material === 'earthenware';
      break;
    case 'person':
    case 'food':
      base.susceptible = true;
      break;
    case 'tumah':
    case 'cavity':
    case 'animal':
    case 'plant':
    case 'misc':
      break;
  }
  const p = { ...base, ...o.props };
  // A broken vessel is no longer a vessel and no longer takes tumah (9:3 בזמן שהיא כלי).
  if (o.kind === 'vessel' && o.props?.vessel === false && o.props.susceptible === undefined)
    p.susceptible = false;
  return p;
}

/** Can be a roof that brings tumah under it (מביא את הטומאה). */
export function canBring(o: SceneObject, p: ObjectProps): boolean {
  return o.kind !== 'tumah' && o.kind !== 'cavity' && p.stable && p.solidSurface;
}

/**
 * Can separate one space from another (חוצץ). People and vessels, and whatever rests on them,
 * make tents to defile but not to purify (6:1), even vessels that cannot become tamei.
 */
export function canSeparate(o: SceneObject, p: ObjectProps): boolean {
  return (
    o.kind !== 'tumah' && o.kind !== 'cavity' && o.kind !== 'person' && p.stable && !p.susceptible && !p.vessel
  );
}

/**
 * The walls of this vessel keep tumah out of its own inside: a vessel that cannot become tamei
 * (9:1), or an earthenware vessel closed with a tight lid (צמיד פתיל, 8:6).
 */
export function protectsInterior(o: SceneObject, p: ObjectProps): boolean {
  if (!o.container || !p.vessel) return false;
  return !p.susceptible || (!!o.container.sealed && p.receivesFromInsideOnly);
}
