/**
 * Console Logger Adapter — Development.
 *
 * Implements the Logger port interface using console.
 * Replace with PinoLogger in production for structured JSON output.
 *
 * To switch loggers: change resolveLogger.js — no module code changes needed.
 */

const formatCtx = (ctx) => (ctx ? ` ${JSON.stringify(ctx)}` : "");

const createScopedMethods = (scope) => ({
  info: (msg, ctx) =>
    console.info(`[INFO]  [${scope}] ${msg}${formatCtx(ctx)}`),
  warn: (msg, ctx) =>
    console.warn(`[WARN]  [${scope}] ${msg}${formatCtx(ctx)}`),
  error: (msg, ctx) =>
    console.error(`[ERROR] [${scope}] ${msg}${formatCtx(ctx)}`),
  debug: (msg, ctx) =>
    process.env.NODE_ENV !== "production" &&
    console.debug(`[DEBUG] [${scope}] ${msg}${formatCtx(ctx)}`),
});

export const createConsoleLogger = (scope = "app") => {
  const methods = createScopedMethods(scope);
  return {
    ...methods,
    child: (meta = {}) => {
      const childScope = meta.scope
        ? `${scope}:${meta.scope}`
        : scope;
      return createConsoleLogger(childScope);
    },
  };
};
