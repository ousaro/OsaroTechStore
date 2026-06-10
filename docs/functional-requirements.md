# Functional Requirements

> Version 2.0.0 — Last updated: 2026-06-10

## Modules Overview

The system is divided into six business modules plus cross-cutting concerns:

| #   | Module         | User-facing                                   | Admin                                 |
| --- | -------------- | --------------------------------------------- | ------------------------------------- |
| 1   | Authentication | Register, login, Google OAuth, password reset | User management CRUD                  |
| 2   | Users          | Profile, cart, favorites, password change     | Lookup by ID                          |
| 3   | Products       | Browse, search, filter, view details, review  | Create, update, delete, image upload  |
| 4   | Categories     | Browse categories                             | Create, update, delete (with cascade) |
| 5   | Orders         | Place orders, view history                    | Manage order status                   |
| 6   | Payments       | Checkout via Stripe, payment status           | Webhook reconciliation                |

---

## 1. Authentication Module

### Guest (Unauthenticated)

| ID      | Requirement                                                          | API                             |
| ------- | -------------------------------------------------------------------- | ------------------------------- |
| AUTH-01 | User shall register with name, email, and password                   | `POST /api/auth/register`       |
| AUTH-02 | Password must be at least 6 characters and hashed with bcrypt        | —                               |
| AUTH-03 | User shall log in with email and password to receive a JWT           | `POST /api/auth/login`          |
| AUTH-04 | Rate limit: max 20 registration/login attempts per 15 minutes per IP | —                               |
| AUTH-05 | User shall authenticate via Google OAuth                             | `GET /api/auth/google`          |
| AUTH-06 | OAuth callback shall create account if new, or log in if existing    | `GET /api/auth/google/callback` |

### Admin

| ID      | Requirement                                  | API                          |
| ------- | -------------------------------------------- | ---------------------------- |
| AUTH-07 | Admin shall list all non-admin users         | `GET /api/auth/users`        |
| AUTH-08 | Admin shall view any user by ID              | `GET /api/auth/users/:id`    |
| AUTH-09 | Admin shall update any user's profile fields | `PUT /api/auth/users/:id`    |
| AUTH-10 | Admin shall delete any user                  | `DELETE /api/auth/users/:id` |

### Cross-Cutting

| ID      | Requirement                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------- |
| AUTH-11 | JWT access tokens expire after configurable duration (default 15 minutes)                       |
| AUTH-12 | The system shall seed an admin account on startup if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set |

---

## 2. Users Module

### Authenticated User

| ID      | Requirement                                                | API                                      |
| ------- | ---------------------------------------------------------- | ---------------------------------------- |
| USER-01 | User shall view own profile                                | `GET /api/users/me`                      |
| USER-02 | User shall update own profile fields                       | `PUT /api/users/me`                      |
| USER-03 | User shall change own password (requires current password) | `PUT /api/users/me/password`             |
| USER-04 | User shall manage own cart (replace entire cart contents)  | `PUT /api/users/me/cart`                 |
| USER-05 | User shall add or remove a product from own favorites      | `PUT /api/users/me/favorites/:productId` |

### Admin

| ID      | Requirement                               | API                  |
| ------- | ----------------------------------------- | -------------------- |
| USER-06 | Admin shall view any user's profile by ID | `GET /api/users/:id` |

---

## 3. Products Module

### Guest (Unauthenticated)

| ID      | Requirement                                                                         | API                     |
| ------- | ----------------------------------------------------------------------------------- | ----------------------- |
| PROD-01 | Anyone shall list products with optional category and status filters                | `GET /api/products`     |
| PROD-02 | List endpoint shall support pagination (`page`, `limit`), sorting (`sort`, `order`) | —                       |
| PROD-03 | Anyone shall view a single product by ID                                            | `GET /api/products/:id` |

### Authenticated User

| ID      | Requirement                                                      | API                              |
| ------- | ---------------------------------------------------------------- | -------------------------------- |
| PROD-04 | User shall submit a product review with rating (1–5) and comment | `POST /api/products/:id/reviews` |

### Admin

| ID      | Requirement                                                                         | API                          |
| ------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| PROD-05 | Admin shall create a product with name, description, price, category, stock, images | `POST /api/products`         |
| PROD-06 | Admin shall update any product field                                                | `PUT /api/products/:id`      |
| PROD-07 | Admin shall delete a product                                                        | `DELETE /api/products/:id`   |
| PROD-08 | Admin shall upload a product image (JPEG, PNG, WebP, GIF; max 5 MB)                 | `POST /api/products/uploads` |

### Domain Rules

| ID      | Requirement                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| PROD-09 | Product price must be positive                                                                                                           |
| PROD-10 | Product stock must be non-negative                                                                                                       |
| PROD-11 | Product status transitions follow: `new` → `active` → `discontinued` (automatic scheduler for `new` → `active` after configurable delay) |
| PROD-12 | Review rating must be an integer between 1 and 5                                                                                         |
| PROD-13 | Review comment is required and max 1000 characters                                                                                       |

---

## 4. Categories Module

### Guest (Unauthenticated)

| ID     | Requirement                               | API                       |
| ------ | ----------------------------------------- | ------------------------- |
| CAT-01 | Anyone shall list all categories          | `GET /api/categories`     |
| CAT-02 | Anyone shall view a single category by ID | `GET /api/categories/:id` |

### Admin

| ID     | Requirement                                                         | API                          |
| ------ | ------------------------------------------------------------------- | ---------------------------- |
| CAT-03 | Admin shall create a category with name and description             | `POST /api/categories`       |
| CAT-04 | Admin shall update a category                                       | `PUT /api/categories/:id`    |
| CAT-05 | Admin shall delete a category (cascade-deletes associated products) | `DELETE /api/categories/:id` |

### Domain Rules

| ID     | Requirement                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| CAT-06 | Category name must be unique                                                       |
| CAT-07 | Categories use soft-delete: `isDeleted` flag, filterable with `findAllWithDeleted` |

---

## 5. Orders Module

### Authenticated User

| ID     | Requirement                                                      | API                      |
| ------ | ---------------------------------------------------------------- | ------------------------ |
| ORD-01 | User shall create an order with order lines and delivery address | `POST /api/orders`       |
| ORD-02 | User shall list own orders (supports `?ownerId=` filter)         | `GET /api/orders`        |
| ORD-03 | User shall view a single order by ID                             | `GET /api/orders/:id`    |
| ORD-04 | User shall update own order                                      | `PUT /api/orders/:id`    |
| ORD-05 | User shall delete own order                                      | `DELETE /api/orders/:id` |

### Domain Rules

| ID     | Requirement                                                                    |
| ------ | ------------------------------------------------------------------------------ |
| ORD-06 | Order must contain at least one order line                                     |
| ORD-07 | Order line quantity must be a positive integer                                 |
| ORD-08 | Each order line must reference a valid product ID                              |
| ORD-09 | Non-admin users may only access their own orders (enforced by ownership guard) |

---

## 6. Payments Module

### Authenticated User

| ID     | Requirement                                              | API                                |
| ------ | -------------------------------------------------------- | ---------------------------------- |
| PAY-01 | User shall create a Stripe Checkout session for an order | `POST /api/payments/intent`        |
| PAY-02 | User shall query payment status for an order             | `GET /api/payments/order/:orderId` |

### System (Webhook)

| ID     | Requirement                                                                  | API                          |
| ------ | ---------------------------------------------------------------------------- | ---------------------------- |
| PAY-03 | Stripe webhook shall verify event signature before processing                | `POST /api/payments/webhook` |
| PAY-04 | Webhook shall deduplicate events by Stripe `eventId` (idempotent)            | —                            |
| PAY-05 | On `PaymentConfirmed`, publish domain event to sync order payment status     | —                            |
| PAY-06 | On `PaymentFailed` or `PaymentExpired`, publish domain event to update order | —                            |

### Domain Rules

| ID     | Requirement                                                                         |
| ------ | ----------------------------------------------------------------------------------- |
| PAY-07 | Payment intents support idempotency via `Idempotency-Key` header (409 on duplicate) |
| PAY-08 | Payment gateway calls use retry with exponential backoff (3 attempts, max 3s)       |

---

## 7. Cross-Cutting Functional Requirements

| ID       | Requirement                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------- |
| CROSS-01 | All API responses follow a standard envelope: `{ success: boolean, data?: T, error?: string }`     |
| CROSS-02 | All routes are available under both `/api/` (legacy) and `/api/v1/` (versioned) prefixes           |
| CROSS-03 | Deprecated routes (`/api/`) receive `Deprecation` and `Sunset` HTTP headers                        |
| CROSS-04 | Health check at `GET /health` returns service name, version, uptime, timestamp                     |
| CROSS-05 | Readiness check at `GET /ready` verifies database, payment provider, and event bus connectivity    |
| CROSS-06 | Request ID (UUID) is generated for every request, echoed in response header, and forwarded to logs |
| CROSS-07 | OpenAPI documentation served at `GET /api-docs` (Swagger UI) and `GET /api-docs/openapi.yaml`      |
| CROSS-08 | Prometheus metrics collected at `GET /metrics` (request count, latency, error rate by route)       |
| CROSS-09 | Product mutations are recorded in the `audit_logs` collection (actor, action, target, timestamp)   |
| CROSS-10 | Graceful shutdown drains in-flight requests within 10 seconds on SIGTERM/SIGINT                    |

---

## 8. Frontend Functional Requirements

| ID    | Requirement                                                                | Route                                    |
| ----- | -------------------------------------------------------------------------- | ---------------------------------------- |
| FE-01 | User shall browse products on the homepage with search and category filter | `/`                                      |
| FE-02 | User shall view product details with reviews                               | `/products/:id`                          |
| FE-03 | User shall register and log in (email/password and Google OAuth)           | `/login`, `/register`                    |
| FE-04 | User shall manage cart (add, remove, update quantities)                    | `/cart`                                  |
| FE-05 | User shall proceed to checkout and place an order                          | `/checkout`                              |
| FE-06 | User shall be redirected to Stripe and see success/cancellation pages      | `/payment/success`, `/payment/cancelled` |
| FE-07 | Admin shall manage products (CRUD)                                         | `/admin/products`, `/admin/products/new` |
| FE-08 | Admin shall manage categories (CRUD)                                       | `/admin/categories`                      |
| FE-09 | Admin shall manage users                                                   | `/admin/users`                           |
| FE-10 | User shall view and edit own profile                                       | `/profile`                               |
| FE-11 | User shall view own order history                                          | `/profile/orders`                        |
| FE-12 | Page transitions shall show a loading spinner during API calls             | —                                        |
| FE-13 | Toast notifications shall display success and error feedback               | —                                        |
