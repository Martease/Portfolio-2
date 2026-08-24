# Client Portal V2 Incremental Migration Plan

## Goal
Move from the current contract-centric schema to the organization + project model in docs/client-portal-v2-schema.prisma without downtime.

## Current constraints
- Existing production tables power Pages Router and back-office routes.
- Prisma is currently pinned to 6.x in this repository.
- Existing authentication uses app_user, password_reset_token, and next-auth JWT sessions.

## Migration strategy

1. Expand (non-breaking)
- Add new tables that do not conflict with existing names:
  - organization
  - user_membership
  - project_stage
  - message_thread
  - message
  - message_attachment
  - upload_file
  - upload_file_version
  - payment
  - meeting
  - notification_v2
  - support_ticket
  - website_care_log
  - activity_log_v2
- Keep existing app_user, client_project, project_task, project_file, invoice active.

2. Dual-write phase
- For new App Router endpoints, write to both old and new models where overlap exists.
- Add feature flags:
  - PORTAL_V2_READS_ENABLED
  - PORTAL_V2_WRITES_ENABLED
- Keep reads on old schema until data parity checks pass.

3. Backfill
- Backfill organizations from existing contracts/clients.
- Backfill memberships from app_user.role and contract mapping.
- Backfill project stages using current timeline/milestone/task state.
- Backfill upload versions from project_file.
- Backfill notifications and activity logs.

4. Read cutover
- Switch App Router portal reads to v2 tables per feature:
  - dashboard
  - timeline
  - board
  - documents/uploads
  - messages
  - billing
- Validate metrics and error rates after each feature cutover.

5. Decommission
- Remove old reads/writes once stable.
- Archive or drop superseded tables after retention period.

## Data mapping notes

- app_user -> user
  - role moves into user_membership per organization.
- contract + client_project -> organization + project
- project_task -> task
- project_file -> upload_file/upload_file_version
- project_notification -> notification_v2
- invoice stays invoice; add payment as child table.

## Execution checklist

1. Add initial SQL migration scripts in prisma/migrations.
2. Add repository adapters for v1/v2 dual write.
3. Add parity checker scripts under scripts/.
4. Gate App Router reads behind feature flags.
5. Run backfill in staging, then production.
6. Cut over feature-by-feature with rollback switches.

## Rollback plan
- If a cutover fails, disable PORTAL_V2_READS_ENABLED.
- Keep v1 writes authoritative until parity proves stable.
- Preserve append-only logs for reconciliation.
