# Backend Modular DDD + Hexagonal Checklist

## Current Status

The backend already follows the main shape of modular DDD + hexagonal architecture:

- code is organized by module under `backend/src/modules`
- modules are split into `domain`, `application`, `ports`, and `adapters`
- module-to-module access goes through `public-api.js`
- cross-module collaboration is orchestrated in `backend/src/app/registerApplicationWorkflows.js`
- repositories, read models, input ports, output ports, and controllers are module-local
- architecture regression tests already exist in `backend/src/tests/architecture`

This means the backend is applying the architecture and the main boundary-hardening items are now covered in code.

## Completed Checklist

- [x] Move event-bus wiring fully to the app shell.
  `backend/src/app/createApp.js` now injects event publishers into the categories, orders, and payments module composition roots instead of those modules importing the app event bus directly.

- [x] Add a regression test that blocks `backend/src/app` from importing private module internals.
  `backend/src/tests/architecture/moduleBoundaryImports.test.js` protects both module-to-module imports and app-shell imports, keeping `backend/src/app` on each module's `public-api.js`.

- [x] Add layer-dependency architecture tests inside each module.
  `backend/src/tests/architecture/moduleLayerDependencies.test.js` now blocks forbidden same-module dependencies such as `domain -> application|ports|adapters`, `application -> adapters`, and `ports -> application|adapters`.

- [x] Make architecture tests runnable without unrelated env setup.
  `backend/src/tests/architecture/crossModuleWorkflows.test.js` seeds the minimal runtime env it needs before importing app wiring, so the architecture suite can be run directly without extra shell-level env setup.

## Current Assessment

The backend is meaningfully enforcing its modular DDD + hexagonal shape with executable architecture guardrails, not just conventions in docs.
