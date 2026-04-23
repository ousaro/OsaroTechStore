# OsaroTechStore

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
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JWT + Passport Google OAuth
- Payments: Stripe Checkout
- Testing: Mocha/Chai/Sinon (backend), React Testing Library (frontend)

## API Documentation (Swagger)

After starting the backend:

- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/docs.json`

OpenAPI source file:
- `backend/docs/openapi.yaml`

## System Design Documentation

- [System Design Choices](docs/system-design-choices.md)

## Local Setup

### 1) Clone and install

```bash
git clone <your-repo-url>
cd OsaroTechStore

cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Create these backend env files:

```env
# backend/.env
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_PROVIDER=mongo
AUTH_PROVIDERS=credentials
PAYMENT_PROVIDER=stripe
SESSION_SECRET=change-me
TOKEN_SECRET=change-me
```

```env
# backend/.env.dev
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_PROVIDER=mongo
MONGO_URI=<your_mongodb_connection_string>
AUTH_PROVIDERS=credentials,google
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
```

```env
# backend/.env.test
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_PROVIDER=mongo
MONGO_URI=mongodb://127.0.0.1:27017/osarotechstore-test
AUTH_PROVIDERS=credentials,google
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_backend
STRIPE_WEBHOOK_SECRET=whsec_test_backend
SESSION_SECRET=test-session-secret
TOKEN_SECRET=test-token-secret
```

```env
# backend/.env.prod
PORT=5000
CLIENT_URL=<your_frontend_url>
DATABASE_PROVIDER=mongo
MONGO_URI=<your_production_connection_string>
AUTH_PROVIDERS=credentials,google
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
CALLBACK_URL=<your_google_callback_url>
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
SESSION_SECRET=<strong_session_secret>
TOKEN_SECRET=<strong_jwt_secret>
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_API_URL=http://localhost:5000/api/users/auth/google
REACT_APP_FOR_PASSWORD_RESET=<password_reset_url_if_used>
REACT_APP_STRIPE_PUBLIC_KEY=<stripe_publishable_key>
```

Notes:
- The backend loads `backend/.env` first, then overlays `backend/.env.dev`, `backend/.env.test`, or `backend/.env.prod` based on `NODE_ENV`.
- `STRIPE_SECRET_KEY` is the preferred name now, but the backend still accepts legacy `STRIPE_SECTET_KEY`.

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

- Live app: https://osaro-tech-store.vercel.app/
- Admin preview video: https://www.youtube.com/watch?v=STGQrQquc94
- DevOps blog series: https://gitlab.com/ousaro/osarotechstore_blogseries

## License

MIT (see `LICENSE`).
