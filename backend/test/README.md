# Backend Test Layout

The unit test tree mirrors the backend architecture so new tests can be added
next to the layer they protect.

## Modules

Module-specific behavior lives under:

```text
test/unit/modules/<module>/
```

Examples:

```text
test/unit/modules/auth/application/authUseCases.test.js
test/unit/modules/products/application/newProductStatusScheduler.test.js
test/unit/modules/payments/collaboration/translators.test.js
```

Use this area for module use cases, module domain behavior, module HTTP
adapters, module collaboration adapters, and module-specific infrastructure.

## Shared

Shared kernel/application/infrastructure behavior lives under:

```text
test/unit/shared/
```

Examples:

```text
test/unit/shared/application/ports/ports.test.js
test/unit/shared/infrastructure/http/authMiddleware.test.js
test/unit/shared/kernel/assertions/assertions.test.js
```

## Infrastructure

Cross-cutting infrastructure providers live under:

```text
test/unit/infrastructure/providers/
```

Examples:

```text
test/unit/infrastructure/providers/events/inProcessEventBus.test.js
test/unit/infrastructure/providers/logger/consoleLogger.test.js
test/unit/infrastructure/providers/resolvers/resolvers.test.js
```

## Running

```bash
npm test
```
