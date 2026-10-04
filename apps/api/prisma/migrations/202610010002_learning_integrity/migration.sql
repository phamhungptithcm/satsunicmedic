-- CreateTable
CREATE TABLE "FacilityBranch" (
    "id" UUID NOT NULL,
    "legalName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "areaCode" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "specialties" TEXT[],
    "evidence" JSONB NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "checkedAt" TIMESTAMPTZ,
    "reviewDueAt" TIMESTAMPTZ,

    CONSTRAINT "FacilityBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "reviewDueAt" TIMESTAMPTZ,
    "questions" JSONB NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAttempt" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "quizRevision" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareGrant" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "assetVersionId" UUID NOT NULL,
    "sceneRevision" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityBranch_areaCode_status_idx" ON "FacilityBranch"("areaCode", "status");

-- CreateIndex
CREATE INDEX "LearningAttempt_userId_createdAt_idx" ON "LearningAttempt"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAttempt_userId_idempotencyKey_key" ON "LearningAttempt"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ShareGrant_ownerId_idx" ON "ShareGrant"("ownerId");

-- AddForeignKey
ALTER TABLE "ArticleRevision" ADD CONSTRAINT "ArticleRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAttempt" ADD CONSTRAINT "LearningAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAttempt" ADD CONSTRAINT "LearningAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareGrant" ADD CONSTRAINT "ShareGrant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareGrant" ADD CONSTRAINT "ShareGrant_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareGrant" ADD CONSTRAINT "ShareGrant_assetVersionId_fkey" FOREIGN KEY ("assetVersionId") REFERENCES "AssetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Domain invariants in PostgreSQL, independent of HTTP validation.
ALTER TABLE "Note" ADD CONSTRAINT "Note_bounds" CHECK ("revision" > 0 AND char_length("text") BETWEEN 1 AND 5000);
ALTER TABLE "ArticleRevision" ADD CONSTRAINT "ArticleRevision_bounds" CHECK ("revision" > 0 AND "contentHash" ~ '^[a-f0-9]{64}$');
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_binding" CHECK ("revision" > 0 AND "snapshot"->>'assetVersionId' = "assetVersionId"::text);
ALTER TABLE "ShareGrant" ADD CONSTRAINT "ShareGrant_private_fields_excluded" CHECK (jsonb_typeof("snapshot"->'annotations') = 'array' AND jsonb_array_length("snapshot"->'annotations') = 0 AND "snapshot"->>'assetVersionId' = "assetVersionId"::text);
CREATE FUNCTION verify_published_article_pointer() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."publishedRevisionId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "ArticleRevision" r WHERE r.id = NEW."publishedRevisionId" AND r."articleId" = NEW.id AND r.status = 'PUBLISHED'
  ) THEN RAISE EXCEPTION 'Invalid published article pointer' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "Article_publication_binding" BEFORE INSERT OR UPDATE OF "publishedRevisionId" ON "Article" FOR EACH ROW EXECUTE FUNCTION verify_published_article_pointer();
