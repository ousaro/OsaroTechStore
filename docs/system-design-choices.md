# System Design Choices

## 1) Architecture Style
This project uses a classic full-stack split:
- `frontend/`: React single-page application (Create React App + Tailwind CSS).
- `backend/`: Node.js + Express REST API.
- MongoDB for persistence through Mongoose models.

Why this choice:
- Easy local development and deployment separation.
- Clear boundary between UI concerns and domain/API concerns.
- Familiar stack for fast team onboarding.

## 2) API Structure and Boundaries
The backend groups endpoints by business domain:
- Authentication: `api/users/auth/*`
- Users: `api/users/*`
- Products: `api/products/*`
- Categories: `api/categories/*`
- Orders: `api/orders/*`
- Payments: `api/create-payment-intent`, `api/webhook`, `api/session-details/:sessionId`

Why this choice:
- Predictable route discovery.
- Matches controller/module ownership.
- Keeps feature changes isolated.

## 3) Authentication Strategy
The solution combines:
- JWT bearer tokens for protected API routes (`requireAuth` middleware).
- Passport + Google OAuth for social login.
- Express session support for Passport authentication flow.

Why this choice:
- JWT works well for SPA to API authorization.
- OAuth supports low-friction sign-in.
- Session state simplifies Passport callback processing.

Tradeoff:
- Mixed auth paradigms increase complexity. A future simplification could be full token-only flow after OAuth callback.

## 4) Data Modeling (MongoDB/Mongoose)
Main collections:
- `User`: profile, role/admin flag, favorites/cart snapshots.
- `Product`: catalog data, stock, price, category linkage, rating/reviews.
- `Category`: category metadata and image.
- `Order`: cart snapshot + payment and shipping address details.

Why this choice:
- Flexible schema evolution during feature growth.
- Fast iteration for nested/order payloads.

Tradeoff:
- Some references are stored as strings instead of `ObjectId`, reducing referential guarantees.

## 5) Authorization Model
Protected business routes apply `requireAuth` at router level.
This is simple and secure-by-default for internal/admin-facing features.

Tradeoff:
- Router-level guards can over-protect special endpoints (example: webhook flows often need service-to-service access patterns).

## 6) Payment Flow
Stripe Checkout Session is used for payment initiation:
1. Client submits checkout items.
2. Backend creates Stripe Checkout Session.
3. Backend returns redirect URL.
4. Client redirects to Stripe-hosted payment page.
5. Session details can be fetched using `sessionId`.

Why this choice:
- Stripe-hosted checkout reduces PCI handling complexity.
- Faster path to production-grade payment UX.

## 7) Scheduled Product Freshness
`node-cron` runs a daily job to recalculate `isNewProduct` (within 30 days of creation).

Why this choice:
- Avoids recalculating “newness” on every read.
- Keeps presentation logic consistent across clients.

## 8) Frontend Design Choices
- React Router v6 for route-based screens.
- Context API + custom hooks for shared client state.
- Tailwind CSS for utility-first styling.

Why this choice:
- Good balance between speed and maintainability for medium-size apps.
- Low overhead compared to larger state-management stacks.

## 9) Testing Choices
- Backend uses Mocha/Chai/Sinon for controller-level coverage.
- Frontend uses React Testing Library for UI behavior tests.

Why this choice:
- Lightweight tools aligned to each runtime.
- Encourages pragmatic unit/component tests.

## 10) Operational and Documentation Choices
- Swagger/OpenAPI now documents and exposes backend contract at `/api/docs`.
- Root README centralizes setup and architecture orientation.
- Dedicated `docs/` directory holds system design rationale and future architecture decisions.

## 11) Known Constraints and Improvement Opportunities
- `GET /api/users/:id` and `GET /api/orders/:id` currently return placeholder messages rather than full resource lookup.
- Stripe env variable name in code is `STRIPE_SECTET_KEY` (typo kept for compatibility with current implementation).
- Webhook endpoint is currently inside authenticated payment router; many production setups exempt webhook from user JWT requirement.

These can be addressed incrementally without major architecture changes.
