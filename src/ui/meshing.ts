// Merge a voxel mask into a small set of boxes for rendering.
import type { Vec3 } from '../engine/types';

export interface MaskBox {
  min: Vec3;
  size: Vec3;
  value: number;
}

export function greedyBoxes(mask: Uint8Array, dims: Vec3, origin: Vec3): MaskBox[] {
  const [dx, dy, dz] = dims;
  const used = new Uint8Array(mask.length);
  const at = (x: number, y: number, z: number) => x + dx * (y + dy * z);
  const out: MaskBox[] = [];
  for (let z = 0; z < dz; z++)
    for (let y = 0; y < dy; y++)
      for (let x = 0; x < dx; x++) {
        const i = at(x, y, z);
        const v = mask[i];
        if (!v || used[i]) continue;
        const ok = (xx: number, yy: number, zz: number) => mask[at(xx, yy, zz)] === v && !used[at(xx, yy, zz)];
        let w = 1;
        while (x + w < dx && ok(x + w, y, z)) w++;
        let h = 1;
        grow: while (y + h < dy) {
          for (let k = 0; k < w; k++) if (!ok(x + k, y + h, z)) break grow;
          h++;
        }
        let d = 1;
        grow3: while (z + d < dz) {
          for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) if (!ok(x + k, y + j, z + d)) break grow3;
          d++;
        }
        for (let zz = z; zz < z + d; zz++) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) used[at(xx, yy, zz)] = 1;
        out.push({ min: [x + origin[0], y + origin[1], z + origin[2]], size: [w, h, d], value: v });
      }
  return out;
}
