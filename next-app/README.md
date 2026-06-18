Next.js demo app for client portal

Quick start:

1. Install dependencies

```bash
cd next-app
npm install
```

2. Set env vars (for demo credentials)

- `NEXTAUTH_URL` e.g. `http://localhost:3000`
- `NEXTAUTH_SECRET` a random string

3. Run dev server

```bash
npm run dev
```

Notes:
- This scaffolding uses a Credentials provider with a demo user (`client@example.com` / `secret`). Replace with Clerk or another provider for production.
- Replace stubbed contract data by fetching from your backend API.
- Later steps will add Stripe Payment Links and webhooks to the Next.js API backend.
