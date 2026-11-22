# Naama Kadai

Naama Kadai is a multi-vendor marketplace for independent shops. Customers can
browse products from different stalls, add them to one cart, and check out with
Stripe or Razorpay. Vendors can manage products and orders.

## Requirements

- Node.js 20 LTS or newer
- npm
- Git

The local development database is SQLite. It is a file, not a separate server.

## Run locally

1. Clone the repository and enter the project directory:

   ```sh
   git clone <repository-url>
   cd naama-kadai
   ```

2. Install dependencies:

   ```sh
   npm ci
   ```

3. Create a local environment file:

   ```sh
   cp .env.example .env.local
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Set a unique `NEXTAUTH_SECRET` in `.env.local`. Generate one with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   The example file uses `file:./dev.db` for SQLite and `http://localhost:3000`
   for `NEXTAUTH_URL`; keep those values for local development.

5. Create or update the SQLite schema and generate the Prisma client:

   ```sh
   npx prisma migrate dev
   npx prisma generate
   ```

6. (Optional) Add demo users, categories, and products:

   ```sh
   npx prisma db seed
   ```

   Seed accounts use the demo password `password123`. They are for local
   development only; never deploy or reuse them in production.

7. Start the app:

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Payment gateways

Payment providers are optional for browsing and local development. Checkout
requires valid provider credentials in `.env.local`:

| Provider | Required settings |
| --- | --- |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |

Use test-mode credentials while developing. For local webhook testing, use the
provider's CLI or dashboard to forward events to:

- Stripe: `http://localhost:3000/api/webhooks/stripe`
- Razorpay: `http://localhost:3000/api/webhooks/razorpay`

Never commit `.env.local`, live credentials, or webhook secrets. The repository
ignores local environment files; `.env.example` contains placeholders only.

## Database

The default `DATABASE_URL` is `file:./dev.db`, which Prisma resolves to
`prisma/dev.db`.

Useful commands:

```sh
npx prisma migrate status
npx prisma migrate dev
npx prisma studio
```

SQLite is suitable for local development. For production, use a persistent
database supported by Prisma and update the datasource and deployment
configuration; a local SQLite file is not appropriate for ephemeral or
multi-instance serverless deployments.

## Tests and checks

```sh
npm test
npm run lint
npm run build
```

## Push to GitHub

1. Authenticate with GitHub CLI:

   ```sh
   gh auth login
   ```

2. Create a repository and push the current branch:

   ```sh
   gh repo create <owner>/<repository> --public --source . --remote origin --push
   ```

3. For later changes, review what will be committed, then push:

   ```sh
   git status
   git add <files>
   git commit -m "Describe the change"
   git push
   ```

Never use `git add .` without checking `git status`; `.env.local` and local
SQLite databases must stay out of version control.

## Project areas

- `app/` — Next.js pages, route handlers, authentication, and checkout
- `components/` — shared interface components
- `lib/` — Prisma client and shared application helpers
- `prisma/` — database schema, migrations, and seed script
- `vitest/` — automated tests

## Before deploying

- Replace all local secrets with production secrets managed by the host.
- Configure production database storage and run migrations.
- Configure provider webhook URLs using the public HTTPS deployment URL.
- Replace or disable demo accounts and change seed credentials.
- Verify checkout, payment verification, and webhook delivery in the provider's
  test environment before accepting live payments.
