import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { FieldPath } from 'firebase-admin/firestore';
import { Database } from './database.js';
import { Identity, SessionGuard, type AuthRequest } from './identity.js';
import { CsrfGuard } from './security.js';
import { fail } from './errors.js';
import { ownedPage } from './pagination.js';

const inputSchema = z.object({
  idToken: z.string().min(1).max(8192),
  kind: z.enum(['notes', 'lessons', 'attempts', 'learningReviews', 'scenes', 'classes', 'classMembers', 'teachingAssignments', 'teachingSubmissions','learningPosition']),
  cursor: z.string().max(512).optional(),
  lessonId: z.uuid().optional(),
}).strict();

/** Export pages require both the existing session and recent same-user identity. */
@Controller('api/v1/me/account/export')
@UseGuards(SessionGuard, CsrfGuard)
export class AccountExportController {
  constructor(@Inject(Database) private db: Database, @Inject(Identity) private identity: Identity) {}
  @Post()
  async page(@Req() req: AuthRequest, @Body() body: unknown) {
    const input = inputSchema.parse(body);
    const token = await this.identity.recent(input.idToken);
    if (token.uid !== req.user.firebaseUid) fail(403, 'IDENTITY_MISMATCH');
    if(input.kind==='learningPosition'){if(input.cursor||input.lessonId)fail(400,'INVALID_INPUT');return {kind:input.kind,items:req.user.learningPosition?[req.user.learningPosition]:[],nextCursor:null};}
    if (input.kind === 'scenes') {
      if (!input.lessonId) fail(400, 'LESSON_REQUIRED');
      const lesson = await this.db.get('lessons', input.lessonId);
      if (!lesson || lesson.ownerId !== req.user.id) fail(404, 'NOT_FOUND');
      if (input.cursor) fail(400, 'INVALID_CURSOR');
      // Lesson creation enforces a hard 100-scene limit; fail closed on old/corrupt data.
      const snapshots = await this.db.collection('scenes').where('lessonId', '==', lesson.id).orderBy(FieldPath.documentId()).limit(101).get();
      if (snapshots.size > 100 || snapshots.docs.reduce((bytes, doc) => bytes + (doc.get('snapshotPayload.bytes') ?? Buffer.byteLength(JSON.stringify(doc.data()))), 0) > 8 * 1024 * 1024) fail(413, 'EXPORT_CAPACITY_EXCEEDED');
      const rows = await Promise.all(snapshots.docs.map(doc => this.db.decode('scenes', doc.data())));
      return { kind: input.kind, items: rows.map(({id,lessonId,assetVersionId,snapshot,revision}) => ({id,lessonId,assetVersionId,snapshot,revision})), nextCursor: null };
    }
    if (input.lessonId) fail(400, 'INVALID_INPUT');
    const page = await ownedPage(this.db, input.kind, req.user.id, { cursor: input.cursor, limit: 50 }, input.kind === 'learningReviews' ? 'schedule.dueAt' : 'createdAt', input.kind === 'learningReviews' ? 'asc' : 'desc');
    // Explicit projections keep new internal fields private by default.
    const fields = {
      classes: ['id','title','createdAt','closedAt'],
      classMembers: ['id','classId','displayName','createdAt','revokedAt'],
      teachingAssignments: ['id','classId','lessonId','lessonRevision','content','dueAt','createdAt'],
      teachingSubmissions: ['id','classId','assignmentId','reflection','createdAt'],
      notes: ['id', 'text', 'anatomyId', 'revision', 'createdAt', 'updatedAt'],
      lessons: ['id', 'title', 'description', 'revision', 'createdAt', 'sceneCount', 'objectives', 'blocks'],
      attempts: ['id', 'quizId', 'quizRevision', 'answers', 'result', 'createdAt'],
      learningReviews: ['id', 'quizId', 'quizRevision', 'schedule', 'updatedAt'],
    }[input.kind];
    const items = page.items.map(row => Object.fromEntries(fields.map(field => [field, (row as unknown as Record<string, unknown>)[field]])));
    return { kind: input.kind, items, nextCursor: page.nextCursor };
  }
}
