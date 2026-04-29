/**
 * Logger Port — Shared Application Layer.
 *
 * Defines the interface every logger adapter must implement.
 * Use cases and repositories receive a logger through DI — they never
 * import a concrete logger directly.
 *
 * Adapters provided in infrastructure/providers/logger/:
 *   - ConsoleLogger (default, dev)
 *   - PinoLogger   (production — structured JSON)
 *   - NoopLogger   (tests)
 */

export const assertLoggerPort = (logger, context = "unknown") => {
  if (!logger || typeof logger !== "object") {
    throw new Error(`[${context}] logger port is required`);
  }
  for (const method of ["info", "warn", "error", "debug"]) {
    if (typeof logger[method] !== "function") {
      throw new Error(`[${context}] logger must implement .${method}()`);
    }
  }
  return logger;
};

/**
 * Creates a child logger scoped to a module/use-case.
 * The adapter must support .child() — both Pino and ConsoleLogger do.
 */
export const createScopedLogger = (logger, scope) => {
  if (typeof logger.child === "function") {
    return logger.child({ scope });
  }
  // Fallback: prefix every message with [scope]
  return {
    info: (msg, ctx) => logger.info(`[${scope}] ${msg}`, ctx),
    warn: (msg, ctx) => logger.warn(`[${scope}] ${msg}`, ctx),
    error: (msg, ctx) => logger.error(`[${scope}] ${msg}`, ctx),
    debug: (msg, ctx) => logger.debug(`[${scope}] ${msg}`, ctx),
  };
};
