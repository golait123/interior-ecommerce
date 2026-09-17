# CasaCanvas — Interior E-commerce

A full-stack starter for customized wallpaper and aesthetic home-decor commerce, with Customer, Admin and Stock Manager interfaces. It follows the requested PostgreSQL inventory model and transactional stock reservation design.

## Stack
- React + TypeScript + Vite + Tailwind
- Node.js + TypeScript + Express
- Prisma + PostgreSQL
- JWT authentication with role-based access control
- Swagger/OpenAPI-ready API

## Run locally
1. Copy `.env.example` to `apps/api/.env` and adjust values.
2. Start PostgreSQL: `docker compose up -d postgres`
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run db:generate`
5. Run migration: `npm run db:migrate`
6. Seed demo data: `npm run db:seed`
7. Start both apps: `npm run dev`

Web: http://localhost:5173
API: http://localhost:4000
Health: http://localhost:4000/api/v1/health

## Demo accounts
- admin@casacanvas.local / Admin@12345
- stock@casacanvas.local / Stock@12345
- customer@casacanvas.local / Customer@12345

These are development-only credentials; change them before any deployment.

## Inventory
Inventory is stored in PostgreSQL, never localStorage/JSON. Order creation uses a serializable transaction and row locks to prevent overselling. Every inventory mutation writes an InventoryTransaction and an AuditLog.

## Google OAuth / Payments
The codebase has extension points for Google OAuth and Razorpay. Credentials are intentionally absent. Until configured, use local login and the mock payment flow.

## Implemented API surface
- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/google` + callback when Google credentials are configured
- `GET /api/v1/products`
- `GET /api/v1/products/:id-or-slug`
- `POST /api/v1/customizations/calculate`
- `POST /api/v1/addresses`
- `GET/POST /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`
- `GET /api/v1/inventory`
- `POST /api/v1/inventory/mutate`
- `GET /api/v1/admin/metrics`

`openapi.json` is included as the initial API contract. Swagger UI can be mounted at `/api/docs` as a next deployment step; the API itself is already versioned and structured for it.
