import { isDiscoveryEnabled } from "./discovery-release";
// Technical candidate metadata, separate from published AssetManifest.
export const referenceAnatomy = {
  sha256: "595e110ff1bbb6b03400d31584abcfc3584f77b11cacc452f3a02bea6b3d106a",
  byteLength: 9145964,
  sourceParts: 404,
  triangles: 411662,
  exactAge: null,
  ageVariants: [] as number[],
  reviewStatus: "unreviewed" as const,
};
export function canPreviewReferenceAnatomy(environment: string | undefined, discoveryFlag?: string) {
  return isDiscoveryEnabled(environment, discoveryFlag);
}
