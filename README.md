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

Create `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=<your_mongodb_connection_string>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
SESSION_SECRET=<session_secret>
CALLBACK_URL=<google_callback_url>
TOKEN_SECRET=<jwt_secret>
STRIPE_SECTET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_API_URL=http://localhost:5000/api/users/auth/google
REACT_APP_FOR_PASSWORD_RESET=<password_reset_url_if_used>
REACT_APP_STRIPE_PUBLIC_KEY=<stripe_publishable_key>
```

Note: `STRIPE_SECTET_KEY` is intentionally spelled this way to match the current backend implementation.

### 3) Run the app

Backend (from `backend/`):

```bash
npm run backend
```

Frontend (from `frontend/`):

```bash
npm start
```

## Scripts

Backend (`backend/package.json`):
- `npm run backend` -> starts API with nodemon
- `npm test` -> runs backend tests

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
