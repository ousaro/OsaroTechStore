import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export interface Logger {
  info(msg: unknown, ctx?: unknown): void;
  warn(msg: unknown, ctx?: unknown): void;
  error(msg: unknown, ctx?: unknown): void;
  debug(msg: unknown, ctx?: unknown): void;
  child?(bindings: Record<string, unknown>): Logger;
}

export const assertLoggerPort = (logger: unknown, context = "unknown"): Logger => {
  assertObject(logger, "logger", `[${context}] logger port is required and must be an object`);
  const l = logger as Record<string, unknown>;

  for (const method of ["info", "warn", "error", "debug"] as const) {
    assertFunction(l[method], `logger.${method}`, `[${context}] logger must implement .${method}`);
  }
  return l as unknown as Logger;
};

export const createScopedLogger = (logger: Logger, scope: string): Logger => {
  if (typeof logger.child === "function") {
    return logger.child({ scope });
  }

  const withScope = (entry: unknown): unknown => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const msg =
        (entry as Record<string, unknown>).msg ?? (entry as Record<string, unknown>).message ?? "";
      return { ...(entry as Record<string, unknown>), msg: `[${scope}] ${msg}` };
    }
    return `[${scope}] ${entry}`;
  };

  return {
    info: (msg, ctx) => logger.info(withScope(msg), ctx),
    warn: (msg, ctx) => logger.warn(withScope(msg), ctx),
    error: (msg, ctx) => logger.error(withScope(msg), ctx),
    debug: (msg, ctx) => logger.debug(withScope(msg), ctx),
  };
};
