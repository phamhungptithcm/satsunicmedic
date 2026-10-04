import { z } from 'zod';
import { FieldPath, type Query } from 'firebase-admin/firestore';
import { Database } from './database.js';
import { fail } from './errors.js';
import type { Collections } from './domain.js';

const pageSchema = z.object({ cursor: z.string().max(512).optional(), limit: z.coerce.number().int().min(1).max(100).default(100) }).strict();
const anchorSchema = z.object({ v: z.literal(1), scope: z.string(), owner: z.string(), id: z.string().regex(/^[a-zA-Z0-9-]{1,128}$/) }).strict();

/** Opaque navigation token, never authorization. Every anchor is reauthorized. */
export function pageCursor(scope: string, owner: string, id: string) {
  return Buffer.from(JSON.stringify({ v: 1, scope, owner, id })).toString('base64url');
}
export function readPage(input: unknown) { return pageSchema.parse(input); }

export async function ownedPage<K extends 'notes' | 'lessons' | 'attempts' | 'learningReviews' | 'classes' | 'classMembers' | 'teachingAssignments' | 'teachingSubmissions'>(
  db: Database, collection: K, owner: string, input: unknown,
  order = 'createdAt', direction: 'asc' | 'desc' = 'desc',
) {
  const { cursor, limit } = readPage(input);
  const ownerField = collection === 'notes' || collection === 'lessons' || collection === 'classes' || collection === 'teachingAssignments' ? 'ownerId' : 'userId';
  let query: Query = db.collection(collection).where(ownerField, '==', owner)
    .orderBy(order, direction).orderBy(FieldPath.documentId(), direction);
  if (cursor) {
    let anchor: z.infer<typeof anchorSchema>;
    try {
      if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error();
      anchor = anchorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    } catch { fail(400, 'INVALID_CURSOR'); }
    if (anchor.scope !== collection || anchor.owner !== owner) fail(400, 'INVALID_CURSOR');
    const snap = await db.ref(collection, anchor.id).get();
    if (!snap.exists || snap.get(ownerField) !== owner) fail(409, 'CURSOR_EXPIRED');
    query = query.startAfter(snap);
  }
  const result = await query.limit(limit + 1).get();
  const page = result.docs.slice(0, limit);
  const items = await Promise.all(page.map(doc => db.decode<K>(collection, doc.data())));
  return {
    items: items as Collections[K][],
    nextCursor: result.size > limit && page.length ? pageCursor(collection, owner, page.at(-1)!.id) : null,
  };
}
