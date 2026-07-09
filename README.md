# Portfolio-2
Personal portfolio and client portal built with a single Next.js application.

## 🚀 Purpose
This repository demonstrates a full-stack Next.js setup with frontend pages, API routes, Stripe payment links, and PostgreSQL-backed data persistence.

## 🛠 Tech Stack
- **Application:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **Payments:** Stripe Payment Links + webhooks
- **Authentication:** Auth.js (NextAuth)
- **Storage:** Google Drive API + Google Docs API
- **Deployment:** Vercel

## 📁 Project Structure
- `pages/`: UI pages and API routes
- `pages/api/`: backend routes for contracts and Stripe webhooks
- `lib/`: database helpers and contract data layer
- `styles/`: global and component style files

## ⚙️ Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables:
   - `DATABASE_URL`
   - `STRIPE_API_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (e.g. `http://localhost:3000`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for Google Docs/Drive API service account)
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (service account private key)
   - `GOOGLE_DOCS_TEMPLATE_ID` (template document ID)
   - `GOOGLE_DRIVE_FOLDER_ID` (destination folder for generated docs)
   - `SMTP_HOST` (SMTP server host, e.g. `smtp-mail.outlook.com`)
   - `SMTP_PORT` (SMTP server port, e.g. `587`)
   - `SMTP_USER` (SMTP username or sender address)
   - `SMTP_PASS` (SMTP password or app password)
   - `CONTACT_EMAIL` (optional override for contact inbox; defaults to `the_dev_op@outlook.com`)
   - `CONTACT_RATE_LIMIT_WINDOW_MS` (optional; default `600000`)
   - `CONTACT_RATE_LIMIT_MAX` (optional; default `5`)
   - `CONTACT_MIN_SUBMIT_MS` (optional; default `1500`)
   - `ADMIN_REGISTRATION_CODE` (required to register new admin users)
   - `SEED_ADMIN_EMAIL` (optional seed admin email; default `admin@mamvolabs.com`)
   - `SEED_ADMIN_PASSWORD` (optional seed admin password; default `ChangeMe_Admin_123!`)
   - `SEED_CLIENT_EMAIL` (optional seed client email; default `client@example.com`)
   - `SEED_CLIENT_PASSWORD` (optional seed client password; default `secret`)
   - `EMAIL_VERIFICATION_EXPIRY_HOURS` (optional; default `24`)
   - `AUTH_MAX_FAILED_LOGIN_ATTEMPTS` (optional; default `5`)
   - `AUTH_LOCKOUT_MINUTES` (optional; default `15`)
3. Initialize the database:
   ```bash
   npm run db:init
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## 🧱 Infrastructure (Phase 5 / Epic 18)
- Prisma schema lives at `prisma/schema.prisma`.
- Prisma client singleton lives at `lib/prisma.ts`.
- Prisma commands:
   - `npm run prisma:generate`
   - `npm run prisma:migrate:dev`
   - `npm run prisma:migrate:deploy`
   - `npm run prisma:studio`

Current runtime remains compatible with the existing SQL store layer while Prisma is introduced for phased migration.

## 💳 Stripe Support
This app supports Stripe Payment Links and webhook handling through:
- `pages/api/contracts/[contractId]/create-payment-link.ts`
- `pages/api/webhooks/stripe.ts`

## 📈 Notes
- The database is PostgreSQL and is initialized automatically by `npm run db:init`.
- The client portal uses Next.js API routes directly, so frontend and backend are in one project.
- Authentication routes:
   - `/register`
   - `/login`
   - `/forgot-password`
   - `/reset-password?token=...`
   - `/verify-email?token=...`
- Roles:
   - `admin` has access to back office and contract management APIs.
   - `client` has access only to their own contract in the client portal.
- Client portal pages:
   - `/client-portal` (dashboard)
   - `/client-portal/project` (workspace)
   - `/client-portal/google-workspace` (Drive/Docs resources)
   - `/client-portal/contracts` (templates, versions, signed copies)
- Client portal APIs:
   - `GET /api/client/dashboard`
   - `GET|POST /api/client/workspace`
   - `GET|POST /api/client/google-workspace`
   - `GET|POST /api/client/contracts`
   - `GET /api/client/contracts/download-placeholder`

---
*Built with a clean full-stack Next.js architecture for portfolio and payment workflows.*
