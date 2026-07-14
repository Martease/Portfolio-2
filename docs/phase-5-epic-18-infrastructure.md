# Phase 5 - Epic 18: Infrastructure

## System Architecture

### Frontend
- Next.js (Pages Router)
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM (introduced in this phase)
- Existing runtime data layer (`pg`) remains active for current features.

### Database
- PostgreSQL (`DATABASE_URL`)

### Authentication
- Auth.js (NextAuth) is active in production code.
- Clerk remains an optional future migration path.

### Storage and Documents
- Google Drive API
- Google Docs API

### Deployment
- Vercel (recommended production target)

## Current Infrastructure State

This repository currently runs production features through `lib/db.ts` and SQL queries. Epic 18 adds Prisma infrastructure in parallel so the app can migrate incrementally without downtime.

Added in this phase:
- `prisma/schema.prisma`
- `lib/prisma.ts`
- Prisma package dependencies and npm scripts
- `.env.example` environment template
- `vercel.json` deployment config
- `GET /api/back-office/infrastructure` protected stack status endpoint

## Epic 18 Deliverables

- Frontend stack confirmed: Next.js + TypeScript + Tailwind CSS
- Backend stack confirmed: Next.js API Routes + Prisma ORM (available for phased migration)
- Database confirmed: PostgreSQL (`DATABASE_URL`)
- Authentication confirmed: Auth.js (NextAuth)
- Storage integration confirmed: Google Drive API + Google Docs API
- Deployment target confirmed: Vercel (`vercel.json`)

### Infrastructure Status API

Endpoint:
- `GET /api/back-office/infrastructure`

Behavior:
- Requires authenticated admin session.
- Returns deployment-safe booleans for stack readiness (no secret values exposed).

## Migration Strategy (No Breaking Changes)

1. Keep all existing APIs on the current SQL data layer.
2. Introduce Prisma for new modules first.
3. Gradually migrate existing store functions from SQL to Prisma.
4. Remove duplicate SQL schema bootstrapping only after migration is complete.

## Environment Variables

Required baseline:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Google integrations:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_DOCS_TEMPLATE_ID`
- `GOOGLE_DRIVE_FOLDER_ID`

Auth and security hardening:
- `ADMIN_REGISTRATION_CODE`
- `AUTH_MAX_FAILED_LOGIN_ATTEMPTS`
- `AUTH_LOCKOUT_MINUTES`

## Vercel Deployment Baseline

1. Connect repository in Vercel.
2. Configure all required environment variables for Production/Preview.
3. Ensure build command is `npm run build`.
4. Ensure install command is `npm install`.
5. Set runtime database to managed PostgreSQL.
6. Run Prisma deploy migrations in CI/CD or a release command:
   - `npm run prisma:migrate:deploy`

## Suggested Next Epic Steps

1. Generate and commit initial Prisma migration from current schema.
2. Migrate one store module (recommended: audit log read paths) to Prisma.
3. Add health endpoint that verifies database and Google API configuration.
