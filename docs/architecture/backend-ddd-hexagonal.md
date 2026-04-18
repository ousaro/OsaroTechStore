# Backend Architecture (DDD + Hexagonal)

## Layers
- Domain: entities, value objects, domain services, domain errors.
- Application: use-cases (orchestrate domain logic).
- Infrastructure: adapters (HTTP, DB, Stripe, OAuth, etc).

## Folder Contract
- `modules/<bounded-context>/domain/*`
- `modules/<bounded-context>/application/*`
- `modules/<bounded-context>/infrastructure/*`

## Module Surface Convention
- `composition.js`: private module wiring and object graph assembly.
- `index.js`: stable module export surface used by local adapters and app bootstrap.
- `public-api.js`: explicit cross-module surface for other bounded contexts.

Rule:
- other modules should prefer `public-api.js`
- app bootstrap may consume `index.js` or route adapters as needed
- `composition.js` should stay private to the module

## Dependency Rule
- Domain depends on nothing.
- Application depends on domain ports/interfaces.
- Infrastructure implements ports.

## Current Stage
- Foundation + app bootstrap created.
- Auth context reconstructed (JWT + OAuth adapters).
- Users context reconstructed (legacy behavior preserved).
- Catalog context reconstructed (products + categories, including write-side).
- Orders context reconstructed (legacy placeholder read-by-id preserved).
- Payments context reconstructed (Stripe gateway adapter).
- Cross-cutting hardening added (shared ApiError, targeted tests, test env bootstrap).
- HTTP adapters are module-local (routers live inside each bounded context).
- Legacy compatibility layer removed (`src/routes`, `src/controllers`, `src/middleware`, `src/APIs`).
- Input ports now exist for:
  - `auth`
  - `payments`
  - `categories`
  - `orders`
  - `products`
  - `users`
- Output ports now exist for:
  - auth user repository
  - token service
  - payment gateway
  - category repository
  - order repository
  - product repository
  - user repository
- Cross-module boundary cleanup completed for the previously identified direct infrastructure leaks:
  - categories now delete products through the products module API
  - users now access shared auth-backed user storage through the auth module API
  - route modules no longer import auth HTTP middleware directly
- Adapter cleanup completed for the previously identified issues:
  - product status cron scheduling moved out of the HTTP route adapter into bootstrap-owned infrastructure
  - payments webhook is no longer protected by end-user auth middleware
- Auth business rules no longer live in Mongoose statics:
  - registration/login validation now lives in auth domain commands
  - auth use cases orchestrate hashing, lookup, and token creation explicitly
- Backend unit test suite currently passes:
  - `npm test` in `backend/` -> 16 passing
- Orders now follow full clean flow:
  - domain owns creation rules (`createOrder`)
  - use-case orchestrates only
  - repository persists domain object (`order.toPrimitives()`)
- Products now follow same clean flow:
  - product model moved to products module infrastructure
  - domain owns create/update rules
  - repository accepts domain object/patch
- Users now follow same clean flow:
  - user model moved into auth module infrastructure (shared by auth/users repositories)
  - domain owns update/password command rules
  - users repository accepts domain patch object
- Categories now follow same clean flow:
  - category model moved to categories module infrastructure
  - domain owns create rules
  - repository accepts domain object
- Reconstructed modules now follow an emerging export convention:
  - `composition.js` owns wiring
  - `index.js` is thin
  - `public-api.js` is used for explicit cross-module access where needed
- Remaining reconstruction focus:
  - split command/query folders where useful
  - add contract tests around input/output ports
  - continue tightening module public APIs so cross-module access uses narrow capability exports instead of broad input ports
  - continue reducing persistence/anemic-model leftovers where they still exist
