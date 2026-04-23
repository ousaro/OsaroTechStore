# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist captures the current backend status after re-checking `backend/src` against a modular DDD + hexagonal target.

It keeps the focus on what is already true today and what is still worth tightening.

## Verified Alignment

The backend already applies the core shape of modular DDD + hexagonal architecture in these areas:

- business code is organized by module under `backend/src/modules`
- modules consistently separate `domain`, `application`, `ports`, and `adapters`
- module-to-module imports inside `backend/src/modules` are restricted to `public-api.js`
- the app shell consumes module entry points through module public APIs in `backend/src/app/createApp.js` and `backend/src/app/startApplication.js`
- cross-module workflows are coordinated through events and translators in `backend/src/app/registerApplicationWorkflows.js`
- modules expose explicit use cases, input ports, output ports, repositories, read models, and HTTP controllers instead of one shared layered backend
- architecture tests already protect module boundaries and workflow wiring in `backend/src/tests/architecture/moduleBoundaryImports.test.js` and `backend/src/tests/architecture/crossModuleWorkflows.test.js`

## Remaining Checklist

- [x] Invert the remaining app-shell dependency inside module composition roots.
  The app layer now injects the event publisher into `categories`, `orders`, and `payments` composition through module public APIs instead of those modules importing `../../app/applicationEventBus.js` directly.

- [x] Add an architecture guardrail for app-shell imports.
  `backend/src/tests/architecture/moduleBoundaryImports.test.js` now protects both module-to-module imports and app-shell imports, allowing `backend/src/app` to consume modules only through each module's `public-api.js`.

- [x] Make architecture tests load without unrelated runtime configuration.
  The architecture workflow test now seeds the minimal runtime env it needs before importing app wiring, so `npx mocha --timeout 10000 --require @babel/register 'src/tests/architecture/**/*.test.js'` runs without extra shell-level environment setup.
  That keeps the boundary-focused test suite isolated from application startup configuration while preserving the existing runtime config validation for the real app shell.

## Current Assessment

The backend is already meaningfully using modular DDD + hexagonal architecture.

What remains is not a large structural rewrite. The main structural guardrails described in this checklist are now in place, and the remaining work is about continuing to preserve them as backend changes land.
