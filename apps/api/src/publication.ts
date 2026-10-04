import {
  articleBodySchema,
  assetManifestSchema,
  isAssetCurrent,
  type ArticleBody,
} from "@hs/contracts";
import type { ArticleRevision, ContentReview, Role, AssetVersion } from "./domain.js";
import { fail } from "./errors.js";
import { digest } from "./security.js";
export function requireRole(roles: Role[], role: Role) {
  if (!roles.includes(role)) fail(403, "FORBIDDEN");
}
export function contentHash(body: ArticleBody) {
  return digest(JSON.stringify(articleBodySchema.parse(body)));
}
export function assertPublishable(
  revision: ArticleRevision & { reviews: ContentReview[] },
  now = new Date(),
) {
  if (
    revision.status !== "APPROVED" ||
    !revision.reviewDueAt ||
    revision.reviewDueAt <= now ||
    contentHash(articleBodySchema.parse(revision.body)) !== revision.contentHash
  )
    fail(422, "REVIEW_REQUIRED");
  if (
    !revision.reviews.some(
      (r) =>
        r.approved &&
        r.reviewerId !== revision.authorId &&
        r.contentHash === revision.contentHash,
    )
  )
    fail(422, "INDEPENDENT_REVIEW_REQUIRED");
}
export function publicManifest(value: unknown, now = new Date()) {
  const m = assetManifestSchema.parse(value);
  if (!isAssetCurrent(m, now)) fail(404, "NOT_FOUND");
  return m;
}

export function currentAssetManifest(asset:AssetVersion,now=new Date()) {
  if(asset.status!=='PUBLISHED'||!asset.reviewDueAt||asset.reviewDueAt<=now||(asset.licenseExpiresAt&&asset.licenseExpiresAt<=now)) fail(404,'NOT_FOUND');
  return publicManifest(asset.manifest,now);
}
