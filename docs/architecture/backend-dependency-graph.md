# Backend Dependency Graph

This backend is wired from `backend/src/infrastructure/bootstrap/configureApplicationModules.js`.
The composition root owns infrastructure selection, repository construction, module creation, and cross-module event subscriptions.

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

  AuthModule --> AuthRoutes["authRoutes"]
  UsersModule --> UsersRoutes["usersRoutes"]
  ProductsModule --> ProductsRoutes["productsRoutes"]
  CategoriesModule --> CategoriesRoutes["categoriesRoutes"]
  OrdersModule --> OrdersRoutes["ordersRoutes"]
  PaymentsModule --> PaymentsRoutes["paymentsRoutes"]

  Configure --> AuthRoutes
  Configure --> UsersRoutes
  Configure --> ProductsRoutes
  Configure --> CategoriesRoutes
  Configure --> OrdersRoutes
  Configure --> PaymentsRoutes
  Configure --> Schedulers["product schedulers"]
  Configure --> Shutdown["shutdown hook"]

  TokenService --> App
  AuthRepo --> App
  AuthRoutes --> App
  UsersRoutes --> App
  ProductsRoutes --> App
  CategoriesRoutes --> App
  OrdersRoutes --> App
  PaymentsRoutes --> App

  App --> RequireAuth["createRequireAuthMiddleware"]
  App --> ExpressRoutes["Express route registration"]
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
  Bus->>PaymentsTranslator: OrderPlaced
  PaymentsTranslator->>Payments: linkPaymentToOrder

  Categories->>Bus: publish CategoryDeleted
  Bus->>ProductTranslator: CategoryDeleted
  ProductTranslator->>Products: removeProductsByCategory

  Payments->>Bus: publish PaymentConfirmed / PaymentFailed / PaymentExpired
  Bus->>PaymentTranslator: payment state event
  PaymentTranslator->>Orders: confirmOrderPayment
```

## HTTP Surface Wiring

```mermaid
flowchart TD
  App["createApp"] --> RequireAuth["requireAuth"]
  RequireAuth --> AuthRepo["authUserRepository\nloads req.user admin flag"]
  RequireAuth --> TokenService["tokenService"]

  App --> AuthRoutes["/api/auth"]
  App --> UsersRoutes["/api/users"]
  App --> ProductsRoutes["/api/products"]
  App --> CategoriesRoutes["/api/categories"]
  App --> OrdersRoutes["/api/orders"]
  App --> PaymentsRoutes["/api/payments"]

  AuthRoutes --> AuthController["authHttpController"]
  UsersRoutes --> UsersController["usersHttpController"]
  ProductsRoutes --> ProductsController["productsHttpController"]
  CategoriesRoutes --> CategoriesController["categoriesHttpController"]
  OrdersRoutes --> OrdersController["ordersHttpController"]
  PaymentsRoutes --> PaymentsController["paymentsHttpController"]
```
