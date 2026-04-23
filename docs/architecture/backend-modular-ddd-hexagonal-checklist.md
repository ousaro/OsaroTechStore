# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist records the backend items that are still not fully aligned with `guide.md`.

It intentionally lists only the remaining differences found in `backend/src`.

## Verified Alignment

The backend already matches the guide in these areas:

- business code is organized by module under `backend/src/modules`
- modules consistently separate `domain`, `application`, `ports`, and `adapters`
- cross-module imports inside `backend/src/modules` are restricted to `public-api.js`
- cross-module workflows are coordinated through events and module public APIs
- module-specific repositories, read models, and HTTP controllers exist instead of a single shared layered backend

## Remaining Checklist

- [x] Keep module internals private to the app shell.
  `guide.md` says each module should expose only its public API and keep everything else private.
  The app layer still imports private module files directly instead of consuming module-level exports:
  [backend/src/app/createApp.js](/home/ousaro/Projects/OsaroTechStore/backend/src/app/createApp.js) imports route files from `modules/*/adapters/http/*`
  [backend/src/app/registerApplicationWorkflows.js](/home/ousaro/Projects/OsaroTechStore/backend/src/app/registerApplicationWorkflows.js) imports collaboration translators from `modules/*/adapters/collaboration/*`
  [backend/src/app/startApplication.js](/home/ousaro/Projects/OsaroTechStore/backend/src/app/startApplication.js) imports [backend/src/modules/products/bootstrap.js](/home/ousaro/Projects/OsaroTechStore/backend/src/modules/products/bootstrap.js)
  To align with the guide, those entry points should be exposed through module-level public exports instead of reaching into private internals.

- [ ] Reshape `adapters/` to the guide's explicit input/output split.
  `guide.md` defines adapters as `adapters/input/...` and `adapters/output/...`.
  The current backend keeps adapter types directly under `adapters/`, for example:
  `adapters/http`, `adapters/persistence`, `adapters/repositories`, `adapters/collaboration`, `adapters/gateways`, `adapters/services`, and `adapters/schedulers`.
  This is structurally close, but it is not the same contract the guide describes, so the folder layout is still partially divergent.

## Summary

The backend is mostly aligned with `guide.md` at the module and dependency-rule level.

The remaining differences are about stricter module encapsulation at the app boundary and the exact adapter folder shape described by the guide.
