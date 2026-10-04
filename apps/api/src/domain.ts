import type { ContributionRecord, ContributionRevision, ContributionConsent, AssignmentRecord, DecisionRecord, VerificationRecord } from './contributions.js';
import type { AccountSettings, ReviewSchedule } from '@hs/contracts';
export type Role = 'USER' | 'AUTHOR' | 'REVIEWER' | 'PUBLISHER' | 'ADMIN';
export type PublicationStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'WITHDRAWN';
export interface User { learningPosition?:import("@hs/contracts").LearningPosition; accountSettings?:AccountSettings; accountRevision?:number; id:string; firebaseUid:string; roles:Role[]; disabledAt:Date|null; createdAt:Date; sessionGeneration:number; sessionsRevokedAt:Date|null }
export interface Session { id:string; tokenHash:string; userId:string; expiresAt:Date; lastSeenAt:Date; revokedAt:Date|null; generation:number }
export interface AnatomyStructure { id:string; systemId:string; nameVi:string; nameEn:string|null; laterality:string; published:boolean; reviewDueAt:Date|null; grams:string[] }
export interface AssetVersion { id:string; status:PublicationStatus; manifest:unknown; objectKey:string; sha256:string; reviewDueAt:Date|null; licenseExpiresAt:Date|null; createdAt:Date }
export interface Article { id:string; slug:string; locale:string; anatomyId:string|null; publishedRevisionId:string|null }
export interface ArticleRevision { id:string; articleId:string; authorId:string; body:unknown; contentHash:string; status:PublicationStatus; revision:number; reviewDueAt:Date|null; createdAt:Date }
export interface ContentReview { id:string; revisionId:string; reviewerId:string; contentHash:string; approved:boolean; createdAt:Date }
export interface Note { id:string; ownerId:string; anatomyId:string|null; text:string; revision:number; createdAt:Date; updatedAt:Date }
export interface Lesson { objectives?:string[]; blocks?:import("@hs/contracts").LessonBlock[]; id:string; ownerId:string; title:string; description:string; revision:number; createdAt:Date; sceneCount:number }
export interface Scene { id:string; lessonId:string; assetVersionId:string; snapshot:unknown; revision:number }
export interface AuditEvent { id:string; actorId:string; action:string; objectId:string; createdAt:Date }
export interface IdempotencyRecord { id:string; userId:string; key:string; fingerprint:string; response:unknown; expiresAt:Date }
export interface ContentReport { id:string; objectId:string; category:string; text?:string; createdAt:Date }
export interface FacilityBranch { services?:unknown[]; id:string; legalName:string; branchName:string; address:string; areaCode:string; officialUrl:string; specialties:string[]; evidence:unknown; status:PublicationStatus; checkedAt:Date|null; reviewDueAt:Date|null }
export interface Quiz { id:string; title:string; status:PublicationStatus; revision:number; reviewDueAt:Date|null; questions:unknown }
export interface LearningReview { id:string; userId:string; quizId:string; quizRevision:number; schedule:ReviewSchedule; updatedAt:Date }
export interface LearningAttempt { answers?:{questionId:string;optionId:string}[]; id:string; userId:string; quizId:string; quizRevision:number; idempotencyKey:string; fingerprint:string; result:unknown; createdAt:Date }
export interface ShareGrant { id:string; ownerId:string; lessonId:string; assetVersionId:string; sceneRevision:number; snapshot:unknown; expiresAt:Date; revokedAt:Date|null; createdAt:Date }
export interface ArticleSearch { id:string; slug:string; locale:string; title:string; summary:string; reviewDueAt:Date; grams:string[]; revisionId:string }
export interface UniqueKey { id:string; targetId:string }
export interface Classroom {id:string;ownerId:string;title:string;createdAt:Date;closedAt:Date|null;memberCount:number;assignmentCount:number}
export interface ClassMember {id:string;classId:string;userId:string;displayName:string;createdAt:Date;revokedAt:Date|null}
export interface ClassInvite {id:string;classId:string;tokenHash:string;expiresAt:Date}
export interface TeachingAssignment {id:string;classId:string;ownerId:string;lessonId:string;lessonRevision:number;content:ReturnType<typeof import('@hs/contracts').presentLesson>;dueAt:Date|null;createdAt:Date}
export interface TeachingSubmission {id:string;classId:string;assignmentId:string;userId:string;reflection:string;createdAt:Date}
export interface Collections {classes:Classroom;classMembers:ClassMember;classInvites:ClassInvite;teachingAssignments:TeachingAssignment;teachingSubmissions:TeachingSubmission; contributions:ContributionRecord; contributionRevisions:ContributionRevision; contributionConsents:ContributionConsent; contributionAssignments:AssignmentRecord; contributionDecisions:DecisionRecord; contributorVerifications:VerificationRecord; anatomySystems:{id:string;systemId:string}; users:User; sessions:Session; anatomy:AnatomyStructure; assets:AssetVersion; articles:Article; revisions:ArticleRevision; reviews:ContentReview; notes:Note; lessons:Lesson; scenes:Scene; audits:AuditEvent; idempotency:IdempotencyRecord; reports:ContentReport; facilities:FacilityBranch; quizzes:Quiz; attempts:LearningAttempt; learningReviews:LearningReview; shares:ShareGrant; articleSearch:ArticleSearch; unique:UniqueKey }
