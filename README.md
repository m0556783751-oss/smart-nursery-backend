# המשתלה החכמה — Smart Nursery Backend

Backend API for the Smart Nursery application.
Browse plants, place orders for pickup, manage your personal garden with care reminders, and contact nursery staff.

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Docs:** Swagger / OpenAPI 3
- **Tests:** Vitest + Supertest

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. Seed demo data
npm run prisma:seed

# 6. Start development server
npm run dev
```

The server runs on `http://localhost:3000` by default.
Swagger docs are at `http://localhost:3000/api-docs`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:migrate:prod` | Run migrations (production) |
| `npm run prisma:seed` | Seed demo data |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Run tests |

## Project Structure

```
backend/
├── src/
│   ├── config/          # Environment config
│   ├── lib/             # Shared utilities (Prisma client)
│   ├── middleware/       # Auth, authorization, validation, errors
│   ├── schemas/         # Zod validation schemas
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── utils/           # Swagger setup
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data
├── tests/               # API tests
├── docs/                # Documentation
├── .env.example         # Environment variables template
├── render.yaml          # Render deployment config
└── package.json
```

## Demo Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Staff | admin@nursery.com | admin123 (or SEED_ADMIN_PASSWORD) |
| Customer | user@example.com | user123 (or SEED_USER_PASSWORD) |

## API Endpoints

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | /api/auth/register | Register | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Current user | Token |
| GET | /api/plants | List plants | Public |
| GET | /api/plants/:id | Plant details | Public |
| POST | /api/plants | Create plant | Staff |
| PUT | /api/plants/:id | Update plant | Staff |
| DELETE | /api/plants/:id | Delete plant | Staff |
| GET | /api/categories | List categories | Public |
| POST | /api/orders | Place order | Customer |
| GET | /api/orders | List orders | Token |
| GET | /api/orders/:id | Order details | Token |
| PATCH | /api/orders/:id/status | Update status | Staff |
| GET | /api/my-garden | My garden | Customer |
| GET | /api/care-reminders | Today's reminders | Customer |
| PATCH | /api/care-reminders/:id/done | Mark done | Customer |
| POST | /api/messages | Send message | Customer |
| GET | /api/messages | List messages | Token |
| GET | /api/messages/:id | Message details | Token |
| PATCH | /api/messages/:id/reply | Reply | Staff |
| GET | /api/health | Health check | Public |
