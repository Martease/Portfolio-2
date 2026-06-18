# Portfolio-2
Personal portfolio and client portal built with a single Next.js application.

## 🚀 Purpose
This repository demonstrates a full-stack Next.js setup with frontend pages, API routes, Stripe payment links, and PostgreSQL-backed data persistence.

## 🛠 Tech Stack
- **Application:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API routes, PostgreSQL
- **Payments:** Stripe Payment Links + webhooks
- **Authentication:** NextAuth with credential provider for demo

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
   - `BACK_OFFICE_PASSCODE` (owner passcode for `/back-office`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for Google Docs/Drive API service account)
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (service account private key)
   - `GOOGLE_DOCS_TEMPLATE_ID` (template document ID)
   - `GOOGLE_DRIVE_FOLDER_ID` (destination folder for generated docs)
3. Initialize the database:
   ```bash
   npm run db:init
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## 💳 Stripe Support
This app supports Stripe Payment Links and webhook handling through:
- `pages/api/contracts/[contractId]/create-payment-link.ts`
- `pages/api/webhooks/stripe.ts`

## 📈 Notes
- The database is PostgreSQL and is initialized automatically by `npm run db:init`.
- The client portal uses Next.js API routes directly, so frontend and backend are in one project.

---
*Built with a clean full-stack Next.js architecture for portfolio and payment workflows.*
