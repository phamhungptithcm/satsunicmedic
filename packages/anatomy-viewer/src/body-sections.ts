import type { BodyBounds, BodyScene } from './scene-history';

export type SectionAxis = 'axial' | 'coronal' | 'sagittal';
export type BodySection = { position: number; reversed: boolean; tilt: number };
export type BodySections = Partial<Record<SectionAxis, BodySection>>;
export type SectionPlane = { normal: [number, number, number]; constant: number };
export const sectionAxes: SectionAxis[] = ['axial', 'coronal', 'sagittal'];
export const defaultSection = (): BodySection => ({ position: .7, reversed: false, tilt: 0 });

/** Existing scenes retain their horizontal cut until explicitly edited. */
export function sceneSections(scene: Pick<BodyScene, 'clipping' | 'sections'>): BodySections {
  return scene.sections ?? (scene.clipping === null ? {} : { axial: { ...defaultSection(), position: scene.clipping } });
}

/** Model coordinates after source conversion: Y superior, X lateral, Z anterior. */
export function sectionPlanes(bounds: BodyBounds, sections: BodySections): SectionPlane[] {
  if (bounds.some(v => v.length !== 3 || v.some(n => !Number.isFinite(n))) || bounds[0].some((v, i) => v > bounds[1][i]!)) throw Error('Invalid section bounds');
  return sectionAxes.flatMap(axis => {
    const cut = sections[axis];
    if (!cut) return [];
    if (!Number.isFinite(cut.position) || !Number.isFinite(cut.tilt)) throw Error('Invalid section coordinates');
    const angle = Math.max(-60, Math.min(60, cut.tilt)) * Math.PI / 180;
    const c = Math.cos(angle), s = Math.sin(angle);
    const normal: [number, number, number] = axis === 'axial' ? [0, -c, -s] : axis === 'coronal' ? [0, s, -c] : [-c, 0, s];
    let min = 0, max = 0;
    for (let i = 0; i < 3; i++) {
      const a = normal[i]! * bounds[0][i]!, b = normal[i]! * bounds[1][i]!;
      min += Math.min(a, b); max += Math.max(a, b);
    }
    const position = Math.max(0, Math.min(1, cut.position));
    const constant = -(max + (min - max) * position);
    return [{ normal: normal.map(n => cut.reversed ? -n : n) as [number, number, number], constant: cut.reversed ? -constant : constant }];
  });
}
