# OsaroTechStore Frontend — Hexagonal DDD Architecture

React 18 frontend mirroring the backend's modular hexagonal architecture with full DDD boundaries.

---

## Quick Start

```bash
npm install
cp .env.example .env
npm start          # http://localhost:3000
```

---

## Architecture

This frontend uses the **exact same architectural pattern** as the backend, mapped to React idioms.

### Backend → Frontend Mapping

| Backend | Frontend |
|---|---|
| `server.js` | `src/index.js` |
| `app/createApp.js` | `src/app/Router.jsx` |
| `infrastructure/bootstrap/configureApplicationModules.js` | `src/infrastructure/bootstrap/configureModules.js` |
| `modules/<feature>/composition.js` | `modules/<feature>/composition.js` |
| `modules/<feature>/domain/` | `modules/<feature>/domain/` |
| `modules/<feature>/application/commands/` | `modules/<feature>/application/commands/` |
| `modules/<feature>/application/queries/` | `modules/<feature>/application/queries/` |
| `modules/<feature>/application/read-models/` | `modules/<feature>/application/read-models/` |
| `modules/<feature>/ports/input/` | `modules/<feature>/ports/input/` |
| `modules/<feature>/ports/output/` | `modules/<feature>/ports/output/` |
| `modules/<feature>/adapters/input/http/` | `modules/<feature>/adapters/input/views/` ← React hook/context |
| `modules/<feature>/adapters/input/collaboration/` | `modules/<feature>/adapters/input/collaboration/` |
| `modules/<feature>/adapters/output/repositories/` | `modules/<feature>/adapters/output/http/` |
| `infrastructure/providers/events/` | `infrastructure/providers/events/inProcessEventBus.js` |
| `shared/domain/value-objects/` | `shared/domain/value-objects/` |
| `shared/kernel/assertions/` | `shared/kernel/assertions/portAssertions.js` |

---

## Directory Layout

```
src/
├── index.js                          ← Entry (mirrors server.js)
├── app/
│   ├── App.jsx                       ← Thin root (mirrors server.js)
│   └── Router.jsx                    ← Route mounting (mirrors createApp.js)
│
├── infrastructure/
│   ├── bootstrap/
│   │   └── configureModules.js       ← COMPOSITION ROOT (mirrors configureApplicationModules.js)
│   ├── config/
│   │   └── env.js                    ← Normalized env vars
│   └── providers/
│       ├── http/httpClient.js        ← Single fetch wrapper
│       ├── session/sessionStore.js   ← localStorage adapter
│       ├── events/inProcessEventBus.js ← EventTarget-based event bus
│       └── notifications/toastNotifier.js
│
├── modules/
│   ├── auth/
│   │   ├── composition.js            ← Wires commands+queries → input port
│   │   ├── domain/
│   │   │   ├── entities/AuthUser.js
│   │   │   ├── events/AuthEvents.js
│   │   │   └── errors/AuthErrors.js
│   │   ├── application/
│   │   │   ├── commands/loginCommand.js
│   │   │   ├── commands/registerCommand.js
│   │   │   ├── commands/logoutCommand.js
│   │   │   └── queries/getSessionQuery.js
│   │   ├── ports/
│   │   │   ├── input/AuthInputPort.js
│   │   │   └── output/AuthRepositoryPort.js
│   │   └── adapters/
│   │       ├── input/views/useAuthModule.js     ← React context (input adapter)
│   │       ├── input/views/pages/LoginPage.jsx
│   │       ├── input/views/pages/RegisterPage.jsx
│   │       └── output/http/httpAuthRepository.js
│   │
│   ├── products/                     ← Same structure, + read-model + collaboration translator
│   ├── categories/
│   ├── orders/
│   ├── payments/
│   ├── users/
│   └── cart/                        ← Owns Cart entity + clearCart collaboration adapter
│
├── shared/
│   ├── domain/
│   │   ├── value-objects/Money.js
│   │   ├── value-objects/Address.js
│   │   ├── errors/DomainError.js
│   │   └── events/DomainEvent.js    ← DomainEvent base + Events constants
│   ├── application/
│   │   └── ports/RepositoryPort.js
│   ├── infrastructure/
│   │   └── ui/                      ← Navbar, Badge, Spinner, QtyControl, PasswordInput, Link
│   ├── kernel/
│   │   ├── assertions/portAssertions.js
│   │   └── guards/authGuard.js
│   └── hooks/useNavigate.js
│
└── ui/
    └── styles/index.css             ← Full design system
```

---

## Key Architecture Decisions

### 1. Modules Never Import Each Other's Internals

Cross-module workflows go through the **event bus + collaboration translators**, wired exclusively in `configureModules.js`:

```
OrderPlaced event
  → orderPlacedCartClearTranslator (in cart module)
  → cartModule.clearCart()

CategoryDeleted event
  → categoryDeletedProductCleanupTranslator (in products module)
  → productsModule.removeProductsByCategory()
```

### 2. Port Assertions at Startup

Every repository adapter is validated against its port contract at composition time. If a method is missing, the app throws immediately:

```js
assertPort("ProductRepositoryPort", adapter, ["getAll","getById","create","update","delete"]);
```

### 3. View Adapters as Input Adapters

React contexts are the frontend's HTTP controllers — they translate UI state lifecycle into input port calls:

```
LoginPage.handleSubmit()
  → useAuth().login()           ← input adapter (view hook)
    → authInputPort.login()     ← input port
      → loginCommand()          ← use case
        → authRepository.login() ← output adapter
          → httpClient()        ← infrastructure
```

### 4. Read Models per Module

Each module that has list state owns a reactive read model that listens to domain events:

```js
// products/application/read-models/productReadModel.js
eventBus.subscribe(Events.PRODUCT_CREATED, (e) => setProducts(ps => [e.payload.product, ...ps]));
eventBus.subscribe(Events.PRODUCT_UPDATED, (e) => setProducts(ps => ps.map(...)));
eventBus.subscribe(Events.PRODUCT_DELETED, (e) => setProducts(ps => ps.filter(...)));
```

### 5. Composition Root is the Only File with Full Knowledge

`configureModules.js` is the only file that:
- Knows which HTTP adapter → which repository port → which module gets it
- Subscribes collaboration translators to the event bus
- Knows the full module dependency graph

---

## Cross-Module Event Flow

```
Cart module                          Orders module
─────────────────                    ─────────────────
cartModule.clearCart()               ordersModule.placeOrder()
     ↑                                      │
     │                                      ▼
     │                              eventBus.publish(OrderPlaced)
     │                                      │
     └──── orderPlacedCartClear ────────────┘
           Translator (wired in
           configureModules.js)


Products module                      Categories module
─────────────────                    ─────────────────
productsModule                       categoriesModule.deleteCategory()
  .removeProductsByCategory()                │
     ↑                                       ▼
     │                               eventBus.publish(CategoryDeleted)
     │                                       │
     └──── categoryDeletedProduct ───────────┘
           CleanupTranslator (wired in
           configureModules.js)
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `/api` | Backend base URL |
| `REACT_APP_GOOGLE_API_URL` | `/api/auth/google` | Google OAuth |
| `REACT_APP_STRIPE_PUBLIC_KEY` | — | Stripe publishable key |

---

## Rules (mirrors backend rules exactly)

1. Keep `index.js` tiny — no modules, no routes, no domain.
2. Keep route mounting inside `Router.jsx` — not in App, not in modules.
3. Keep ALL runtime wiring in `configureModules.js` (the composition root).
4. Each feature owns its own `domain`, `application`, `ports`, and `adapters`.
5. Validate ports during module composition with `assertPort()`.
6. Keep infrastructure behind output ports (no direct `fetch` in use cases).
7. Use events + translators for cross-module workflows — never direct imports.
8. Expose only input port methods and deliberate collaboration surfaces from a module.
9. Put shared code in `shared/` only when genuinely cross-cutting.
10. Add boundary tests early (`tests/unit/architecture/module-boundaries.test.js`).
