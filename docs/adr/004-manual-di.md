# ADR 004: Manual Dependency Injection vs DI Container

**Status:** Accepted  
**Date:** 2026-06-10  
**Deciders:** Project lead

---

## Context

The composition root (`configureApplicationModules.js`) must construct providers, repositories, modules, and wire cross-module event subscribers. Options for wiring:

1. **Manual DI** — explicit function calls, no container library
2. **Awilix** — lightweight DI container with `proxy`-based resolution and lifetime scoping
3. **InversifyJS** — full `@injectable` decorator-based IoC container
4. **Custom service locator** — global registry accessed by modules

Constraints:

- The project has 6 modules + 4 infrastructure providers + ~10 repositories
- Modules follow hexagonal ports/adapters — infrastructure must be injectable
- Architecture tests enforce dependency direction — DI should not bypass this

## Decision

Use **manual dependency injection** — `configureApplicationModules.js` explicitly constructs every object and passes dependencies as constructor/function arguments.

No DI container library is added. The wiring function returns a plain object with all assembled dependencies consumed by the HTTP layer and shutdown hook.

## Why Not a Container

| Factor                 | Manual DI                         | Awilix                               | InversifyJS                      |
| ---------------------- | --------------------------------- | ------------------------------------ | -------------------------------- |
| Lines of wiring        | ~120                              | ~100 + registration boilerplate      | ~80 + decorator annotations      |
| Debuggability          | Full stack traces, no proxy magic | Proxy-based resolution hides errors  | Decorators are compile-time (TS) |
| Learning curve         | None                              | Low                                  | Medium (decorators, metadata)    |
| Module count threshold | Good up to ~20 modules            | Excellent at any scale               | Excellent at any scale           |
| Testability            | Explicit mocks in tests           | Awilix `createContainer` for mocking | Container stubs per test         |
| Bundle size impact     | 0 KB                              | ~5 KB gzipped                        | ~15 KB gzipped                   |

For 6 modules, manual DI keeps the wiring explicit and trivially debuggable. A container would add a library dependency with no practical benefit at this scale.

## Consequences

**Positive:**

- Zero library dependencies — fewer audit surface items, no version conflicts
- Full IDE navigation (Ctrl+click on factory functions)
- No learning curve for new contributors
- Startup failures produce clear stack traces with no proxy indirection

**Negative:**

- Wiring verbosity grows linearly with module count — at ~20+ modules, consider Awilix
- Must manually ensure singleton vs transient lifetimes (currently all application-scoped singletons)
- No automatic circular-dependency detection (currently none exist)

**Future:** If the codebase exceeds 15–20 modules, adopt Awilix for its lifetime management and assembly-scanning features. The current factory-function signature (`createX({ deps })`) is container-friendly — migration requires only registering factories instead of calling them.

## Related

- [ADR-001: Architecture Pattern](./001-architecture-pattern.md) — hexagonal module structure that DI supports
