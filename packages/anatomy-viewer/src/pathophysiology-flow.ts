export const FLOW_PARTICLE_RADIUS = 0.006;
export type Point3 = [number, number, number];
export type FlowPath = { points: readonly Point3[]; distances: number[]; length: number };

export function preparePath(points: readonly Point3[]): FlowPath {
  if (points.length < 2 || points.length > 1000 || points.some(p => p.length !== 3 || p.some(n => !Number.isFinite(n)))) throw new Error("Invalid centerline");
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!, b = points[i]!;
    distances.push(distances[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const length = distances[distances.length - 1]!;
  if (length < 0.000001) throw new Error("Zero-length centerline");
  return { points, distances, length };
}

// Writes into a reusable array; the render loop does not allocate per particle.
export function samplePath(path: FlowPath, fraction: number, out: Point3): Point3 {
  const target = Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0)) * path.length;
  let i = 1;
  while (i < path.distances.length - 1 && path.distances[i]! < target) i++;
  const previous = path.distances[i - 1]!;
  const span = path.distances[i]! - previous;
  const t = span > 0 ? (target - previous) / span : 0;
  const a = path.points[i - 1]!, b = path.points[i]!;
  for (let axis = 0; axis < 3; axis++) out[axis] = a[axis]! + (b[axis]! - a[axis]!) * t;
  return out;
}

export function particleFraction(time: number, index: number, count: number) {
  const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0;
  return (safeTime * 0.12 + index / count) % 1;
}

export function isParticleVisible(fraction: number, blocked: boolean, blockageAt: number) {
  return !blocked || fraction < blockageAt - 0.018;
}

/** Qualitative teaching states; no physical velocity, pressure or flow estimate. */
export function coronaryFlowState(time: number, normalView: boolean, affected: boolean, blockedAt: number, narrowingAt = Infinity, recoveryAt = Infinity) {
  return {
    blocked: !normalView && affected && time >= blockedAt && time < recoveryAt,
    narrowed: !normalView && affected && time >= narrowingAt && time < recoveryAt,
  };
}
