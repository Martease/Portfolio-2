# Bycra Client Portal V2 Architecture

## 1) Complete Application Architecture

### Architecture style
- Modular monolith on Next.js 15 App Router.
- Domain-driven feature modules with clear boundaries.
- Server-first rendering with Server Components by default.
- Mutations through Server Actions and Route Handlers.
- PostgreSQL as source of truth, Prisma for data access.
- Event-driven side effects for email, notifications, and audit logging.

### High-level modules
- Identity and Access
	- Auth.js credential auth, invitation onboarding, password lifecycle, session controls, RBAC.
- Client Workspace
	- Dashboard, timeline, board, documents, uploads, meetings, messaging, notifications.
- Billing and Payments
	- Stripe invoice views, payment intents/links, receipts, webhooks.
- Website Care
	- Health snapshots, maintenance logs, support hour ledger, tickets.
- Admin Control Plane
	- Clients, projects, assignment, analytics, revenue, activity stream.
- Platform Services
	- File storage (R2 or S3), email (Resend), audit logs, rate limiting, observability.

### Runtime topology
- Web app: Next.js on Vercel.
- DB: Managed PostgreSQL.
- Object storage: Cloudflare R2 preferred.
- Payment: Stripe + webhook endpoint.
- Email: Resend transactional templates.
- Optional queue: Upstash Redis Queue or Vercel Cron + DB outbox for retries.

### Request lifecycle
1. User requests route.
2. Middleware enforces auth and route-level role checks.
3. Server Component fetches scoped data using repository/service layer.
4. User action posts through Server Action or Route Handler.
5. Zod validation, authz guard, and domain service execute transaction.
6. Outbox records side effects (email/notification/audit).
7. UI updates optimistically where safe, then revalidates tags.

## 2) Recommended Folder Structure

This coexists with your current Pages Router app while you migrate portal features to App Router.

app/
- (marketing)/
- (auth)/
	- login/
	- forgot-password/
	- reset-password/
	- change-password/
- (portal)/
	- dashboard/
	- projects/[projectId]/
	- timeline/
	- board/
	- documents/
	- uploads/
	- messages/
	- meetings/
	- billing/
	- care/
	- notifications/
- (admin)/
	- clients/
	- projects/
	- board/
	- invoices/
	- messages/
	- care/
	- analytics/
- api/
	- auth/
	- uploads/
	- stripe/
	- webhooks/stripe/
	- notifications/

src/
- modules/
	- auth/
	- users/
	- projects/
	- timeline/
	- tasks/
	- messages/
	- documents/
	- uploads/
	- billing/
	- meetings/
	- website-care/
	- notifications/
	- audit/
- components/
	- ui/
	- portal/
	- admin/
- lib/
	- db/
	- security/
	- storage/
	- stripe/
	- email/
	- telemetry/
- hooks/
- types/
- styles/

prisma/
- schema.prisma
- migrations/
- seed/

## 3) Prisma Database Schema

Proposed production schema is provided in:
- docs/client-portal-v2-schema.prisma

Design principles:
- UUID primary keys for external safety and horizontal scaling.
- Enums for finite workflow states.
- Soft delete fields on user-generated records where needed.
- Append-only audit/event tables.
- Explicit multi-tenant scoping via organization_id and project_id.

## 4) Authentication Flow

### Invitation onboarding flow
1. Proposal accepted.
2. Admin creates client organization + primary contact user.
3. System creates Invitation token (hashed, expiry, single use).
4. Resend sends invitation link.
5. Client sets password and accepts terms.
6. Email verification optional but recommended before full access.
7. First login lands in project dashboard.
8. Force password rotation from temporary credentials if generated.

### Auth requirements
- Auth.js Credentials provider.
- bcrypt password hashing.
- Session strategy: database sessions preferred for revocation; JWT allowed with rotation rules.
- Middleware-based protected routes.
- RBAC with role matrix and future role support.
- Forgot/reset/change password with one-time token hash.
- Login protection: IP + account rate limit, lockout policy.

### Route protection policy
- Public: marketing and auth pages.
- Client-only: portal workspace routes.
- Admin-only: control plane routes.
- Shared authenticated: profile/settings.

## 5) Route Structure

### Client routes
- /portal/dashboard
- /portal/projects/[projectId]
- /portal/projects/[projectId]/timeline
- /portal/projects/[projectId]/board
- /portal/projects/[projectId]/documents
- /portal/projects/[projectId]/uploads
- /portal/projects/[projectId]/messages
- /portal/projects/[projectId]/meetings
- /portal/projects/[projectId]/billing
- /portal/projects/[projectId]/care
- /portal/notifications

### Admin routes
- /admin/dashboard
- /admin/clients
- /admin/projects
- /admin/projects/[projectId]/board
- /admin/invoices
- /admin/messages
- /admin/care
- /admin/analytics

### API routes
- /api/uploads/presign
- /api/uploads/complete
- /api/stripe/create-payment-link
- /api/webhooks/stripe
- /api/notifications/read
- /api/messages/attachments

## 6) Component Hierarchy

### Shared shell
- AppShell
	- Sidebar
	- Topbar
	- CommandLauncher (future)
	- NotificationBell

### Client dashboard
- ClientDashboardPage
	- ProjectSummaryCard
	- ProgressCard
	- LaunchDateCard
	- UnreadMessagesCard
	- OutstandingInvoiceCard
	- RecentActivityFeed
	- UpcomingMeetingCard
	- QuickActionsPanel

### Timeline
- TimelinePage
	- StageProgressRail
	- TimelineStageCard
	- StageNotesPanel

### Board
- ProjectBoardPage
	- KanbanBoard
		- Column
		- TaskCard
		- TaskDrawer

### Documents and uploads
- DocumentsPage
	- DocumentList
	- DocumentRow
	- DownloadButton
- UploadsPage
	- DropzoneUploader
	- UploadQueue
	- FilePreviewPanel
	- FileVersionHistory

### Messaging
- MessagesPage
	- ConversationList
	- MessageThread
	- Composer
	- AttachmentPicker

### Billing
- BillingPage
	- InvoiceTable
	- PaymentHistory
	- ReceiptDownload
	- PayInvoiceButton

### Website care
- CarePage
	- HealthScoreCard
	- MonthlyUpdatesList
	- MaintenanceTimeline
	- SupportHoursMeter
	- SupportTicketList

## 7) ER Diagram

Core relationships:
- Organization 1..N Users
- Organization 1..N Projects
- Project 1..N Tasks, Messages, Documents, Uploads, Meetings, Notifications, ActivityLogs, CareLogs
- Invoice 1..N Payments
- Project 1..N SupportTickets

Text ER map:

[Organization]
	-> [UserMembership] <- [User]
	-> [Project]

[Project]
	-> [ProjectStage]
	-> [Task]
	-> [MessageThread] -> [Message] -> [MessageAttachment]
	-> [Document]
	-> [UploadFile] -> [UploadFileVersion]
	-> [Meeting]
	-> [Invoice] -> [Payment]
	-> [Notification]
	-> [SupportTicket]
	-> [WebsiteCareLog]
	-> [ActivityLog]

## 8) UI Wireframes (Low Fidelity)

### Client dashboard

+-------------------------------------------------------------+
| Sidebar | Topbar: Search | Notifications | Profile         |
|---------+---------------------------------------------------|
| Card: Current Project | Card: Status | Card: Progress %   |
| Card: Launch Date     | Card: Unread | Card: Invoice      |
|-------------------------------------------------------------|
| Recent Activity Feed                 | Upcoming Meeting    |
|-------------------------------------------------------------|
| Quick Actions: Upload, Message, Pay, Book Meeting          |
+-------------------------------------------------------------+

### Project board

+-------------------------------------------------------------+
| Completed | In Progress | Up Next | Waiting On Client      |
|  Task A   |   Task B    | Task C  | Task D                 |
|  Task E   |   Task F    | Task G  | Task H                 |
+-------------------------------------------------------------+

### Timeline

Discovery -> Proposal -> Agreement -> Deposit -> Questionnaire
-> Assets Received -> Design -> Development -> Review -> Launch -> Website Care

Each stage card:
- Status badge
- Completion date
- Progress meter
- Notes

## 9) Development Roadmap

Phase 0: Foundations (1 week)
- App Router scaffold for portal/admin.
- Design tokens, shell, typography, dark mode.
- Auth.js integration in App Router + middleware RBAC.
- Base observability and audit utilities.

Phase 1: Core Client Experience (2-3 weeks)
- Dashboard cards.
- Timeline and project board.
- Documents and notifications.
- Messaging MVP (thread + attachments).

Phase 2: Billing and Uploads (1-2 weeks)
- Stripe billing dashboard + payment history.
- R2 direct uploads with signed URLs.
- File preview and version history.

Phase 3: Meetings and Website Care (1-2 weeks)
- Meetings module.
- Website health + maintenance + support hours.
- Support tickets and care timeline.

Phase 4: Admin Control Plane (2 weeks)
- Client and project management.
- Task assignment and analytics.
- Revenue and activity intelligence.

Phase 5: Hardening (ongoing)
- Pen test checklist, security headers, threat model.
- Performance tuning, caching, query optimization.
- E2E tests and rollback playbooks.

## 10) Build Order: MVP to Version 2.0

### MVP (must-have)
- Auth and invitations.
- Client dashboard.
- Timeline and board.
- Documents + basic uploads.
- Stripe invoice pay flow.
- Notifications center.
- Admin client/project management.

### V1.5
- Messaging with attachments.
- Meetings module.
- Activity log explorer.
- Better analytics and filters.

### V2.0
- Website care full suite.
- SLA and support hour ledger automation.
- Command palette and global search.
- Real-time typing indicators and live board presence.
- Advanced role matrix for designer/developer/account manager.

## Security and Compliance Baseline

- RBAC checks in service layer, never only in UI.
- Zod validation at every write boundary.
- Sanitization for rich text and filenames.
- CSRF protection for cookie-auth endpoints.
- Strict file validation: type, size, malware scan hook.
- Rate limits for auth, uploads, and write-heavy APIs.
- Secrets only in environment variables, never client exposed.
- Audit logging for security and critical business events.

## Migration Notes for This Repository

- Keep existing Pages Router routes stable while introducing App Router under new portal paths.
- Reuse existing auth domain logic and strengthen with bcrypt and invitation tables.
- Expand existing contract/project records into organization/project scoped entities.
- Migrate progressively: dashboard first, then board/timeline, then billing/uploads.
