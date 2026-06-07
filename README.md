# OsaroTechStore

[![CI](https://github.com/ousaro/OsaroTechStore/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/ousaro/OsaroTechStore/actions/workflows/backend-ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Coverage](https://img.shields.io/badge/coverage-%3E70%25-brightgreen)]()

OsaroTechStore is a full-stack MERN e-commerce application with customer shopping flows, admin management, Stripe payments, and Google OAuth authentication.

## Project Structure

- `frontend/`: React SPA (Create React App + Tailwind CSS)
- `backend/`: Express API + MongoDB (Mongoose)
- `docs/`: architecture and system design documentation
- `backend/docs/`: OpenAPI (Swagger) specification for backend endpoints

## Core Features

- Product browsing and product detail pages
- Category management
- Cart and checkout flow
- Stripe checkout integration
- User registration/login (email/password + Google OAuth)
- Admin-focused management for products, categories, users, and orders
- Dashboard/analytics UI components

## Tech Stack

- Frontend: React, React Router, Tailwind CSS
- Backend: Node.js (24), Express, Mongoose, TypeScript
- Database: MongoDB (with schema validation, migrations, compound indexes)
- Authentication: JWT + Passport Google OAuth
- Payments: Stripe Checkout (idempotent, retry with backoff)
- Logging: Pino (structured JSON, redacted secrets)
- Validation: Zod (request validation middleware)
- Testing: Node test runner (backend), React Testing Library (frontend)
- API: Versioned (`/api/v1/`), OpenAPI 3.0 docs at `/api-docs`
- Patterns: CQRS (payments), soft-delete, idempotency, retry with exponential backoff

## API Documentation (Swagger)

After starting the backend:

- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/docs.json`

OpenAPI source file:

- `backend/docs/openapi.yaml`

## System Design Documentation

- [System Design Choices](docs/architecture/backend-system-design-choices.md)

## Local Setup

### 1) Clone and install

```bash
git clone <your-repo-url>
cd OsaroTechStore

cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Create `backend/.env` from `backend/.env.example` and set deployment-specific values:

```env
# backend/.env
PORT=5000
CLIENT_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_PROVIDER=mongo
MONGO_URI=<your_mongodb_connection_string>
MONGO_MIN_POOL_SIZE=2
MONGO_MAX_POOL_SIZE=10
TOKEN_SECRET=<strong_jwt_secret>
TOKEN_EXPIRES_IN=15m
LOGGER_PROVIDER=console
EVENT_BUS_PROVIDER=inprocess
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
PRODUCT_IMAGE_UPLOAD_URL=https://object-storage.internal/products/
PRODUCT_IMAGE_PUBLIC_URL=https://cdn.example.com/products/
PRODUCT_IMAGE_UPLOAD_TOKEN=<storage_upload_token>
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_API_URL=http://localhost:5000/api/users/auth/google
REACT_APP_STRIPE_PUBLIC_KEY=<stripe_publishable_key>
```

Notes:

- Store production secrets in the deployment secret manager and rotate any value that has been exposed locally or in logs.
- Use `LOGGER_PROVIDER=json` in production when the host expects structured JSON logs.
- `CORS_ALLOWED_ORIGINS` is comma-separated and should list only trusted frontend origins when credentials are enabled.

Development note:

- MongoDB is still required for backend startup.
- Google OAuth is optional in development; if its env vars are omitted, `/api/users/auth/google` returns `503` instead of crashing the server.
- Stripe is optional in development; if its env vars are omitted, payment routes return `503` instead of crashing the server.

### 3) Run the app

Backend (from `backend/`):

```bash
npm run backend:dev
```

Frontend (from `frontend/`):

```bash
npm start
```

## Scripts

Backend (`backend/package.json`):

- `npm run backend` -> alias for `npm run backend:dev`
- `npm run backend:dev` -> starts the API with `NODE_ENV=development`
- `npm run backend:test` -> starts the API with `NODE_ENV=test`
- `npm run backend:prod` -> starts the API with `NODE_ENV=production`
- `npm test` -> alias for `npm run test:backend`
- `npm run test:backend` -> runs backend tests with `NODE_ENV=test`

Frontend (`frontend/package.json`):

- `npm start` -> starts React dev server
- `npm test` -> runs frontend tests
- `npm run build` -> production build

## Testing

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

## Deployment / Demo

Deployment instructions and CI/CD workflows are in `.github/workflows/`.

## License

MIT (see `LICENSE`).
