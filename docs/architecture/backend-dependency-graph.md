# Backend Dependency Graph

> Version 2.0.0 — Last updated: 2026-06-10

This backend is wired from `backend/src/infrastructure/bootstrap/configureApplicationModules.js`.
The composition root owns infrastructure selection, repository construction, module creation, and cross-module event subscriptions.

See [System Design Choices](./backend-system-design-choices.md) for rationale behind each architectural decision.

## Startup Wiring

```mermaid
flowchart TD
  Server["server.js"] --> Start["app/startApplication.js"]
  Start --> Configure["infrastructure/bootstrap/configureApplicationModules.js"]
  Start --> App["app/createApp.js"]

  Configure --> Env["infrastructure/config/env.js"]
  Configure --> LoggerProvider["resolveLogger"]
  Configure --> DatabaseProvider["resolveDatabaseStrategy"]
  Configure --> PaymentProvider["resolvePaymentStrategy"]
  Configure --> EventBusProvider["resolveEventBus"]
  Configure --> TokenService["createJwtTokenService"]
  Configure --> RepositoryFactory["createMongooseRepositories"]
  Configure --> IdempotencyStore["createMongoIdempotencyStore"]

  DatabaseProvider --> DbClient["dbClient"]
  DbClient --> RepositoryFactory

  RepositoryFactory --> AuthRepo["authUserRepository"]
  RepositoryFactory --> UserRepo["userRepository"]
  RepositoryFactory --> ProductRepo["productRepository"]
  RepositoryFactory --> CategoryRepo["categoryRepository"]
  RepositoryFactory --> OrderRepo["orderRepository"]
  RepositoryFactory --> PaymentRepo["paymentRepository"]

  AuthRepo --> AuthModule["createAuthModule"]
  TokenService --> AuthModule
  UserRepo --> UsersModule["createUsersModule"]
  ProductRepo --> ProductsModule["createProductsModule"]
  CategoryRepo --> CategoriesModule["createCategoriesModule"]
  OrderRepo --> OrdersModule["createOrdersModule"]
  PaymentRepo --> PaymentsModule["createPaymentsModule"]
  PaymentProvider --> PaymentsModule
  EventBusProvider --> CategoriesModule
  EventBusProvider --> OrdersModule
  EventBusProvider --> PaymentsModule
  IdempotencyStore --> PaymentsModule

  AuthModule --> AuthRoutes["authRoutes"]
  UsersModule --> UsersRoutes["usersRoutes"]
  ProductsModule --> ProductsRoutes["productsRoutes"]
  CategoriesModule --> CategoriesRoutes["categoriesRoutes"]
  OrdersModule --> OrdersRoutes["ordersRoutes"]
  PaymentsModule --> PaymentsRoutes["paymentsRoutes"]

  Configure --> HealthChecks["health check callbacks"]
  Configure --> Schedulers["product schedulers"]
  Configure --> Shutdown["shutdown hook"]

  TokenService --> App
  AuthRoutes --> App
  UsersRoutes --> App
  ProductsRoutes --> App
  CategoriesRoutes --> App
  OrdersRoutes --> App
  PaymentsRoutes --> App
  HealthChecks --> App

  App --> RequireAuth["createRequireAuthMiddleware"]
  App --> OpenApiDocs["registerOpenApiDocs"]
  App --> HealthRoutes["createHealthRoutes"]
  App --> ExpressRoutes["Express route registration"]
  App --> Versioning["apiVersionMiddleware"]
  App --> IdempotencyMiddleware["idempotencyMiddleware"]
  App --> Validation["validateRequest (Zod)"]
```

## Module Shape

Each module follows the same hexagonal composition pattern: validate output ports, build use cases, wrap them in an input port, then expose HTTP routes and any collaboration surface needed by another module.

```mermaid
flowchart LR
  OutputAdapters["Output adapters\nrepositories, event bus, gateways, services"]
  OutputPorts["Output port assertions"]
  UseCases["Application use cases"]
  InputPort["Input port"]
  HttpController["HTTP controller"]
  Routes["Routes"]
  PublicSurface["Public collaboration surface"]

  OutputAdapters --> OutputPorts
  OutputPorts --> UseCases
  UseCases --> InputPort
  InputPort --> HttpController
  HttpController --> Routes
  InputPort --> PublicSurface
```

The payments module extends this with CQRS — separate input ports for commands and queries:

```mermaid
flowchart LR
  Commands["Commands use cases\ncreatePaymentIntent, verifyWebhook, linkPaymentToOrder"]
  Queries["Queries use cases\ngetPaymentByOrderId"]
  CommandsPort["paymentsCommandsPort"]
  QueriesPort["paymentsQueriesPort"]
  Controller["paymentsHttpController"]
  Routes["paymentsRoutes"]

  Commands --> CommandsPort
  Queries --> QueriesPort
  CommandsPort --> Controller
  QueriesPort --> Controller
  Controller --> Routes
```

## Module Dependencies

```mermaid
flowchart TD
  AuthModule["Auth module"] --> AuthRepo["authUserRepository"]
  AuthModule --> TokenService["tokenService"]
  AuthModule --> OAuthProviders["oauthProviders"]

  UsersModule["Users module"] --> UserRepo["userRepository"]

  ProductsModule["Products module"] --> ProductRepo["productRepository"]
  ProductsModule --> ProductScheduler["newProductStatusScheduler"]

  CategoriesModule["Categories module"] --> CategoryRepo["categoryRepository"]
  CategoriesModule --> EventBus["eventBus"]

  OrdersModule["Orders module"] --> OrderRepo["orderRepository"]
  OrdersModule --> EventBus

  PaymentsModule["Payments module"] --> PaymentRepo["paymentRepository"]
  PaymentsModule --> PaymentGateway["paymentGateway"]
  PaymentsModule --> EventBus
  PaymentsModule --> IdempotencyStore["idempotencyStore"]
```

## Cross-Module Event Workflows

Modules do not call each other directly. The composition root subscribes collaboration translators to the event bus, and translators invoke the receiving module public surface.

```mermaid
sequenceDiagram
  participant Orders as Orders Module
  participant Bus as Event Bus
  participant PaymentsTranslator as OrderPlacedPaymentLinkTranslator
  participant Payments as Payments Module
  participant Categories as Categories Module
  participant ProductTranslator as CategoryDeletedProductCleanupTranslator
  participant Products as Products Module
  participant PaymentTranslator as PaymentConfirmedOrderSyncTranslator

  Orders->>Bus: publish OrderPlaced
  Bus->>PaymentsTranslator: OrderPlaced event
  PaymentsTranslator->>Payments: linkPaymentToOrder

  Categories->>Bus: publish CategoryDeleted
  Bus->>ProductTranslator: CategoryDeleted event
  ProductTranslator->>Products: removeProductsByCategory

  Payments->>Bus: publish PaymentConfirmed / PaymentFailed / PaymentExpired
  Bus->>PaymentTranslator: payment state event
  PaymentTranslator->>Orders: confirmOrderPayment
```

## HTTP Surface Wiring

All routes are mounted at both `/api/` (legacy) and `/api/v1/` (versioned) prefixes.

```mermaid
flowchart TD
  App["createApp"] --> RequireAuth["requireAuth"]
  RequireAuth --> AuthRepo["authUserRepository\nloads req.user admin flag"]
  RequireAuth --> TokenService["tokenService"]

  App --> Versioning["apiVersion + apiDeprecationWarning"]

  App --> AuthRoutes["/api/auth, /api/v1/auth"]
  App --> UsersRoutes["/api/users, /api/v1/users"]
  App --> ProductsRoutes["/api/products, /api/v1/products"]
  App --> CategoriesRoutes["/api/categories, /api/v1/categories"]
  App --> OrdersRoutes["/api/orders, /api/v1/orders"]
  App --> PaymentsRoutes["/api/payments, /api/v1/payments"]
  App --> HealthRoutes["/health, /ready"]
  App --> OpenApiDocs["/api-docs, /api-docs/openapi.yaml"]
  App --> Metrics["/metrics (Prometheus)"]

  AuthRoutes --> AuthController["authHttpController"]
  UsersRoutes --> UsersController["usersHttpController"]
  ProductsRoutes --> ProductsController["productsHttpController"]
  CategoriesRoutes --> CategoriesController["categoriesHttpController"]
  OrdersRoutes --> OrdersController["ordersHttpController"]
  PaymentsRoutes --> PaymentsController["paymentsHttpController"]
  HealthRoutes --> HealthChecks["database, payments, event bus checks"]
```

## Infrastructure Providers

```mermaid
flowchart LR
  Logger["resolveLogger"] --> Pino["pinoLogger"]
  Logger --> Console["consoleLogger"]
  Database["resolveDatabaseStrategy"] --> Mongo["mongoProvider (Mongoose)"]
  Payments["resolvePaymentStrategy"] --> Stripe["stripeGateway\n(with retry wrapper)"]
  Payments --> Disabled["disabled payments"]
  EventBus["resolveEventBus"] --> InProcess["inProcessEventBus"]
  EventBus --> Redis["redisStreamEventBus"]
```

## Checkout Flow Sequence

```mermaid
sequenceDiagram
  actor Customer
  participant Frontend as React SPA
  participant API as Express API
  participant Orders as Orders Module
  participant Payments as Payments Module
  participant Stripe

  Customer->>Frontend: Adds item to cart
  Customer->>Frontend: Proceeds to checkout
  Frontend->>API: POST /api/orders
  Note over API: requireAuth middleware
  API->>Orders: addOrder({ orderLines, deliveryAddress, currency })
  Orders-->>API: 201 { order }
  API-->>Frontend: { success: true, data: { order } }

  Frontend->>API: POST /api/payments/intent
  Note over API: requireAuth middleware, Idempotency-Key header
  API->>Payments: createPaymentIntent({ orderId, items, currency })
  Payments->>Stripe: checkout.sessions.create (with retry wrapper)
  Stripe-->>Payments: { sessionId, url }
  Payments->>Payments: Store PaymentWorkflow document in MongoDB
  Payments-->>API: 201 { orderId, provider, paymentStatus, url }
  API-->>Frontend: { success: true, data: { url } }

  Frontend->>Customer: Redirect to Stripe Checkout
  Customer->>Stripe: Completes payment
  Stripe->>API: POST /api/payments/webhook
  Note over API: Stripe-Signature verification, express.raw body
  API->>Payments: verifyWebhook({ rawBody, signature })
  Payments->>Stripe: Retrieve session to verify
  Payments->>Payments: Update PaymentWorkflow.paymentStatus
  Payments->>Payments: Publish PaymentConfirmed domain event
  Payments-->>API: 200 { received: true }

  Note over API: Event bus delivers PaymentConfirmed to Order Sync Translator
  Payments-->>Orders: confirmOrderPayment via event translator
  Orders->>Orders: Update Order.paymentStatus

  Customer->>API: GET /api/payments/order/:orderId
  API->>Payments: getPaymentByOrderId({ orderId })
  Payments-->>API: Payment status
  API-->>Frontend: { success: true, data: { paymentStatus: "confirmed" } }
```

## Documentation and Operations Surface

Swagger UI is served from `backend/src/shared/infrastructure/http/openApiDocs.js`.
The raw OpenAPI contract lives at `backend/docs/openapi.yaml` and documents all `/api/v1/*` routes plus the root-level `/health` and `/ready` endpoints.
Readiness checks are built by the composition root after provider resolution so they report the configured database, payment, and event bus adapters.
Prometheus metrics are collected at `/metrics` via `express-prom-bundle`.

---

## Revision History

| Date       | Change                                                      |
| ---------- | ----------------------------------------------------------- |
| 2026-06-10 | Added revision history, cross-link to system design choices |
| 2026-06-07 | Initial version                                             |
