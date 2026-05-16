
import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const assertLoggerPort = (logger, context = "unknown") => {
  assertObject(logger, "logger", `[${context}] logger port is required and must be an object`);

  for (const method of ["info", "warn", "error", "debug"]) {
    assertFunction(
      logger[method],
      `logger.${method}`,
      `[${context}] logger must implement .${method}`
    );
  }
  return logger;
};

export const createScopedLogger = (logger, scope) => {
  if (typeof logger.child === "function") {
    return logger.child({ scope });
  }

  const withScope = (entry) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const msg = entry.msg ?? entry.message ?? "";
      return { ...entry, msg: `[${scope}] ${msg}` };
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
