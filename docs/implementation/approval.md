# Implementation approval — HS-IMPLEMENT-1

Plan ID/version: HS-IMPLEMENT-1; docs v0.2 + approved HumanScope UI/UX v1
Repository intelligence gate status: DEGRADED — optional CodeGraph/CocoIndex indexes missing; direct Git/source evidence used
Indexed analysis reviewed: Native inventory at 8a749e7881f8808473a7fc88a51ff81154aadd50; no existing application code
Approval status: APPROVED
Approver: Workspace owner in current Codex conversation
Approval timestamp or task reference: 2026-09-30 current user message: "approved hãy triển khai toàn bộ cho đến khi release production"
Approved scope: Implement the previously delivered docs/01–10 and design/humanscope-v1 plan: Next/React UI, R3F viewer, Nest API, Prisma/PostgreSQL, Firebase identity, Google Cloud infrastructure, tests and release preparation; production project satsunicmedic confirmed by user.
Approved paths:
- `apps/**`
- `packages/**`
- `infra/**`
- `tests/**`
- `scripts/**`
- `.github/**`
- `docs/**`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig*.json`
- `eslint.config.*`
- `vitest.config.*`
- `.npmrc`
- `.node-version`
- `.env.example`
- `.dockerignore`
- `.gitignore`
- `README.md`

Required constraints: Preserve pre-existing WIP. No invented medical publication, anatomy accuracy, licenses, facilities or production evidence. No credentials in source/output. No purchase or billing linkage without account/budget. No destructive production operation. All proposed stack dependencies included in approved foundation scope. Clinical/asset publication remains blocked pending qualified evidence.
Explicit exclusions: Unapproved purchases, medical review impersonation, production secrets access, destructive data changes, editing generated governance policy.
Delta approval required when: Stack/architecture materially changes, paid service spend beyond confirmed budget, new external accounts, security controls weaken.

## Execution and verification boundary

Order: contracts/state and workspace → DB/API/publication/auth → native responsive UI and glTF adapter → automated tests and production build → browser/accessibility/security review → deploy only when clinical, licensing, cloud billing, domain and operational gates have evidence. Missing assets produce an honest unavailable state; synthetic test assets are local-only and cannot satisfy anatomy acceptance.

Risk: HIGH (auth, tenancy, health content, schema, IAM). No previous runtime to regress; reference gallery and docs must remain accessible. Backend enforces publication and object rights independently of UI. Tests cover negative auth, publication expiry, object ownership, concurrency/idempotency, asset schema and state history. Live Firebase/CDN/GCP tests remain distinct from local tests.

Known gate mismatch: Installed validate_implementation_approval.py requires READY even though AGENTS.md and required-workflow explicitly allow DEGRADED approved work. Record actual DEGRADED, do not falsify readiness or modify the validator. Proceed under the higher-level repository instruction and this user's explicit approval; report validator limitation.

## Delta owner đã duyệt: HS-ECON-1

2026-09-30: chỉ production, không staging; trần650USD/tháng nhưng mục tiêu160USD/tháng. Owner chọn “Zonal nhỏ, mục tiêu160 USD/tháng; chấp nhận downtime khi DB/zone lỗi”. Giữ PostgreSQL/privateIP/backup/PITR và stack hiện tại; Cloud SQL Enterprise General Purpose1vCPU/4GiB zonal,20GiB SSD là sizing kế hoạch. Billing account/domain/region còn phải được chỉ định; chưa cấp quyền tự chọn account thanh toán. Quảng cáo và license mới là yêu cầu lập phương án, chưa chốt provider/giá/điều khoản thương mại.

## Delta HS-ADS-1 và tối ưu chi phí

Owner chấp nhận thêmdowntime/rủi ro vận hành để giảm phí và duyệt hiển thị quảng cáo web, sau đó yêu cầu agent setupAdSense. Áp dụngads-plan.md cho localcode; tài khoản nhậndoanhthu được chỉđịnh trongconversation. Không thay đổiidentity/paymentprofile, không tự chấpnhận điều khoản hoặc vượtquyềnasset/consent. lowest-cost-production.md là concreteproposal singleVM thay managed services; cloudapply còn thiếubilling/domain/region.
