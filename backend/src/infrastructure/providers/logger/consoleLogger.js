/**
 * Console Logger Adapter — Development.
 *
 * Implements the Logger port interface using console.
 * Replace with PinoLogger in production for structured JSON output.
 *
 * To switch loggers: change resolveLogger.js — no module code changes needed.
 */

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ serializationError: "Unable to serialize log context" });
  }
};

const formatCtx = (ctx) =>
  ctx && Object.keys(ctx).length ? ` ${safeStringify(ctx)}` : "";

const normalizeLogArgs = (entry, ctx = {}) => {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const { msg, message, ...entryCtx } = entry;
    return {
      msg: msg ?? message ?? "",
      ctx: { ...entryCtx, ...ctx },
    };
  }

  return { msg: entry, ctx };
};

const logToConsole = (level, consoleMethod, scope, entry, ctx) => {
  const normalized = normalizeLogArgs(entry, ctx);
  consoleMethod(`[${level}] [${scope}] ${normalized.msg}${formatCtx(normalized.ctx)}`);
};

const createScopedMethods = (scope) => ({
  info: (entry, ctx) =>
    logToConsole("INFO", console.info, scope, entry, ctx),
  warn: (entry, ctx) =>
    logToConsole("WARN", console.warn, scope, entry, ctx),
  error: (entry, ctx) =>
    logToConsole("ERROR", console.error, scope, entry, ctx),
  debug: (msg, ctx) =>
    process.env.NODE_ENV !== "production" &&
    logToConsole("DEBUG", console.debug, scope, msg, ctx),
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
