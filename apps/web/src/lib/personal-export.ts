export type ExportPage = { items: Record<string, unknown>[]; nextCursor: string | null };
/** Build in memory and download only after every authorized page succeeds. */
export async function collectPersonalExport(
  profile: Record<string, unknown>,
  load: (kind: string, cursor?: string, lessonId?: string) => Promise<ExportPage>,
  signal: AbortSignal,
  progress: (records: number) => void,
  limits = { records: 10000, bytes: 16 * 1024 * 1024, pages: 500 },
) {
  const result: Record<string, unknown> = { format: 'humanscope-personal-data-v1', exportedAt: new Date().toISOString(), profile };
  let records = 0, bytes = 0, pages = 0;
  async function page(kind: string, cursor?: string, lessonId?: string) {
    signal.throwIfAborted();
    if (++pages > limits.pages) throw new Error('EXPORT_CAPACITY_EXCEEDED');
    const response = await load(kind, cursor, lessonId);
    signal.throwIfAborted();
    if (!Array.isArray(response.items) || !(response.nextCursor === null || typeof response.nextCursor === 'string')) throw new Error('INVALID_EXPORT_PAGE');
    records += response.items.length; bytes += new TextEncoder().encode(JSON.stringify(response.items)).length;
    if (records > limits.records || bytes > limits.bytes) throw new Error('EXPORT_CAPACITY_EXCEEDED');
    progress(records);return response;
  }
  for (const kind of ['notes', 'lessons', 'attempts', 'learningReviews', 'classes', 'classMembers', 'teachingAssignments', 'teachingSubmissions','learningPosition']) {
    const items: Record<string, unknown>[] = [], seen = new Set<string>();
    let cursor: string | undefined;
    do {
      const response = await page(kind, cursor);
      items.push(...response.items);cursor = response.nextCursor ?? undefined;
      if (cursor && seen.has(cursor)) throw new Error('INVALID_EXPORT_PAGE');
      if (cursor) seen.add(cursor);
    } while (cursor);
    result[kind] = items;
  }
  const scenes: Record<string, unknown>[] = [];
  for (const lesson of result.lessons as Record<string, unknown>[]) {
    if (typeof lesson.id !== 'string') throw new Error('INVALID_EXPORT_PAGE');
    const response = await page('scenes', undefined, lesson.id);
    if (response.nextCursor) throw new Error('INVALID_EXPORT_PAGE');
    scenes.push(...response.items);
  }
  result.scenes = scenes;
  signal.throwIfAborted();
  return result;
}
