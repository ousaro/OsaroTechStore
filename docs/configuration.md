# Configuration Reference

> Version 2.0.0 — Last updated: 2026-06-10

All runtime configuration is driven by environment variables. The authoritative config loader is `backend/src/infrastructure/config/env.js`. Variables not listed there are accessed directly via `process.env` in their respective modules.

For a quick-start template, see `.env.example` in the backend and frontend root directories.

---

## Table of Contents

- [Backend](#backend)
  - [General](#general)
  - [Logging](#logging)
  - [Authentication & Session](#authentication--session)
  - [Database](#database)
  - [Payment Gateway](#payment-gateway)
  - [Event Bus](#event-bus)
  - [CORS & Frontend](#cors--frontend)
  - [Admin Seeding](#admin-seeding)
  - [Google OAuth](#google-oauth)
  - [Product Images](#product-images)
- [Frontend](#frontend)
- [System Collections](#system-collections)
- [Docker Compose Overrides](#docker-compose-overrides)

---

## Backend

### General

| Variable       | Required | Default                    | Description                                                                                                                          |
| -------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SERVICE_NAME` | No       | `osaro-tech-store-backend` | Service identifier used in logs                                                                                                      |
| `APP_VERSION`  | No       | `2.0.0`                    | Application version string                                                                                                           |
| `NODE_ENV`     | No       | `development`              | Runtime environment: `development`, `production`, or `test`. Affects log level, debug output, and `.env` loading (skipped in `test`) |
| `PORT`         | No       | `5000`                     | HTTP server listen port                                                                                                              |

### Logging

| Variable                   | Required | Default                   | Description                                          |
| -------------------------- | -------- | ------------------------- | ---------------------------------------------------- |
| `LOGGER_PROVIDER`          | No       | `pino`                    | Logger backend: `pino`, `console`, `json`, or `noop` |
| `NO_COLOR`                 | No       | `false`                   | Disable ANSI color in log output                     |
| `LOGGER_TIMESTAMP_FORMAT`  | No       | `YYYY-MM-DD HH:mm:ss.SSS` | Timestamp format (console logger only)               |
| `LOGGER_TIMESTAMP_ENABLED` | No       | `true`                    | Toggle timestamp in log output                       |

### Authentication & Session

| Variable           | Required | Default                                           | Description                                                 |
| ------------------ | -------- | ------------------------------------------------- | ----------------------------------------------------------- |
| `TOKEN_SECRET`     | **Yes**  | —                                                 | Secret key for signing JWT tokens. Startup fails if missing |
| `TOKEN_EXPIRES_IN` | No       | `15m`                                             | JWT expiry (ms or human string like `15m`, `1h`, `7d`)      |
| `SESSION_SECRET`   | No       | `development-session-secret-change-in-production` | Secret for Express session signing                          |

### Database

| Variable                     | Required    | Default | Description                                                              |
| ---------------------------- | ----------- | ------- | ------------------------------------------------------------------------ |
| `DATABASE_PROVIDER`          | No          | `mongo` | Database backend: `mongo` or `postgres`                                  |
| `MONGO_URI`                  | Conditional | —       | MongoDB connection string. Required when `DATABASE_PROVIDER=mongo`       |
| `MONGO_MIN_POOL_SIZE`        | No          | `2`     | Minimum MongoDB connection pool size                                     |
| `MONGO_MAX_POOL_SIZE`        | No          | `10`    | Maximum MongoDB connection pool size                                     |
| `MONGO_DEBUG`                | No          | `false` | Enable Mongoose debug logging (all queries logged)                       |
| `MONGO_SLOW_OP_THRESHOLD_MS` | No          | `200`   | Log warning when a query exceeds this threshold (ms)                     |
| `POSTGRES_URL`               | Conditional | —       | PostgreSQL connection string. Required when `DATABASE_PROVIDER=postgres` |

### Payment Gateway

| Variable                | Required    | Default    | Description                                                            |
| ----------------------- | ----------- | ---------- | ---------------------------------------------------------------------- |
| `PAYMENT_PROVIDER`      | No          | `disabled` | Payment gateway: `stripe`, `paypal`, or `disabled`                     |
| `STRIPE_SECRET_KEY`     | Conditional | —          | Stripe API secret key. Required when `PAYMENT_PROVIDER=stripe`         |
| `STRIPE_WEBHOOK_SECRET` | Conditional | —          | Stripe webhook signing secret. Required when `PAYMENT_PROVIDER=stripe` |
| `PAYPAL_CLIENT_ID`      | Conditional | —          | PayPal client ID. Required when `PAYMENT_PROVIDER=paypal`              |
| `PAYPAL_CLIENT_SECRET`  | Conditional | —          | PayPal client secret. Required when `PAYMENT_PROVIDER=paypal`          |

### Event Bus

| Variable             | Required    | Default     | Description                                                       |
| -------------------- | ----------- | ----------- | ----------------------------------------------------------------- |
| `EVENT_BUS_PROVIDER` | No          | `inprocess` | Event bus backend: `inprocess` or `redis`                         |
| `REDIS_URL`          | Conditional | —           | Redis connection string. Required when `EVENT_BUS_PROVIDER=redis` |

### CORS & Frontend

| Variable               | Required | Default                    | Description                                  |
| ---------------------- | -------- | -------------------------- | -------------------------------------------- |
| `CLIENT_URL`           | No       | `http://localhost:3000`    | Frontend URL for CORS and OAuth redirects    |
| `CORS_ALLOWED_ORIGINS` | No       | falls back to `CLIENT_URL` | Comma-separated list of allowed CORS origins |

### Admin Seeding

| Variable         | Required | Default | Description                                       |
| ---------------- | -------- | ------- | ------------------------------------------------- |
| `ADMIN_EMAIL`    | No       | —       | Email for seeding the first admin user on startup |
| `ADMIN_PASSWORD` | No       | —       | Password for seeding the first admin user         |

### Google OAuth

| Variable               | Required    | Default | Description                       |
| ---------------------- | ----------- | ------- | --------------------------------- |
| `GOOGLE_OAUTH_ENABLED` | No          | `false` | Enable/disable Google OAuth login |
| `GOOGLE_CLIENT_ID`     | Conditional | —       | Google OAuth client ID            |
| `GOOGLE_CLIENT_SECRET` | Conditional | —       | Google OAuth client secret        |
| `GOOGLE_CALLBACK_URL`  | Conditional | —       | Google OAuth callback URL         |

### Product Images

| Variable                     | Required | Default | Description                                                                                                                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRODUCT_IMAGE_UPLOAD_URL`   | No       | —       | Base URL for uploading product images to object storage. If set (along with `PUBLIC_URL`), images are uploaded via HTTP PUT; otherwise saved to local `uploads/` |
| `PRODUCT_IMAGE_PUBLIC_URL`   | No       | —       | Public-facing base URL for served product images                                                                                                                 |
| `PRODUCT_IMAGE_UPLOAD_TOKEN` | No       | —       | Bearer token for authenticating to the image upload endpoint                                                                                                     |

---

## Frontend

| Variable                      | Required | Default                                 | Description                                   |
| ----------------------------- | -------- | --------------------------------------- | --------------------------------------------- |
| `REACT_APP_API_BASE_URL`      | No       | `/api`                                  | Base URL for the backend API                  |
| `REACT_APP_GOOGLE_API_URL`    | No       | `http://localhost:5000/api/auth/google` | Google OAuth endpoint URL                     |
| `REACT_APP_STRIPE_PUBLIC_KEY` | No       | `pk_test_key`                           | Stripe publishable key for frontend Stripe.js |

---

## System Collections

The application creates the following internal MongoDB collections:

| Collection     | Purpose                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `_migrations`  | Tracks applied database migrations (unique index on `name`)                         |
| `_idempotency` | Idempotency store with TTL auto-cleanup (unique index on `key`, TTL on `expiresAt`) |
| `audit_logs`   | Audit trail for product mutations                                                   |

---

## Docker Compose Overrides

When running via `docker-compose.yml`, the following variables are overridden (or given defaults) compared to standalone backend/frontend defaults:

| Variable                      | Docker Value                                               |
| ----------------------------- | ---------------------------------------------------------- |
| `NODE_ENV`                    | `production`                                               |
| `MONGO_URI`                   | `mongodb://mongo:27017/osarotechstore`                     |
| `REDIS_URL`                   | `redis://redis:6379`                                       |
| `CLIENT_URL`                  | `http://localhost:80`                                      |
| `CORS_ALLOWED_ORIGINS`        | `http://localhost:80`                                      |
| `TOKEN_SECRET`                | `${TOKEN_SECRET:-dev-jwt-secret-not-for-production}`       |
| `SESSION_SECRET`              | `${SESSION_SECRET:-dev-session-secret-not-for-production}` |
| `STRIPE_SECRET_KEY`           | `${STRIPE_SECRET_KEY:-}` (empty = payments disabled)       |
| `STRIPE_WEBHOOK_SECRET`       | `${STRIPE_WEBHOOK_SECRET:-}` (empty = webhooks disabled)   |
| `REACT_APP_STRIPE_PUBLIC_KEY` | `${REACT_APP_STRIPE_PUBLIC_KEY:-pk_test_key}` (build arg)  |
| `REACT_APP_API_BASE_URL`      | `/api` (build arg)                                         |
| `REACT_APP_GOOGLE_API_URL`    | `/api/auth/google` (build arg)                             |
