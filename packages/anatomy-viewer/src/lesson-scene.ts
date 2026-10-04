import { atlasToHeart } from './canonical-heart';
import { sceneSections, sectionPlanes, type SectionPlane } from './body-sections';
import { selectionBounds, visibleSource, type BodyCatalog, type BodyScene, type CameraPose } from './scene-history';

/** Transform the discovery snapshot, never write into its history. */
export function lessonCamera(scene?: BodyScene): CameraPose | null {
 return scene?.camera ? {position:atlasToHeart(scene.camera.position),target:atlasToHeart(scene.camera.target)} : null;
}
export function lessonPlanes(catalog: BodyCatalog, scene?: BodyScene): SectionPlane[] {
 if (!scene) return [];
 return sectionPlanes(selectionBounds(catalog,scene.region),sceneSections(scene)).map(plane=>({
  normal:plane.normal,
  constant:(plane.constant+plane.normal[0]*.025+plane.normal[1]*1.245+plane.normal[2]*.125)/.04,
 }));
}
export function lessonSourceVisible(sourceId:string, scene?:BodyScene):boolean {
 return !scene || visibleSource(sourceId,scene);
}
export function lessonSourceOpacity(sourceId:string, fallback:number, scene?:BodyScene):number {
 return scene?.opacity[sourceId] ?? fallback;
}
