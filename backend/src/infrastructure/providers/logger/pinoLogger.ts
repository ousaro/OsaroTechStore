import pino from "pino";
import type { Logger } from "../../../shared/application/ports/loggerPort.js";

export const createPinoLogger = (scope = "app", options: Record<string, unknown> = {}): Logger => {
  const transport =
    options.outputFormat === "json"
      ? undefined
      : {
          target: "pino/file",
          options: { destination: 1, colorize: options.colorize ?? true },
        };

  const logger = pino({
    name: scope,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.token"],
      censor: "[REDACTED]",
    },
  });

  return {
    info: (msg, ctx) => {
      if (typeof msg === "object" && msg) {
        logger.info(msg as Record<string, unknown>);
      } else {
        logger.info(ctx as Record<string, unknown>, String(msg));
      }
    },
    warn: (msg, ctx) => {
      if (typeof msg === "object" && msg) {
        logger.warn(msg as Record<string, unknown>);
      } else {
        logger.warn(ctx as Record<string, unknown>, String(msg));
      }
    },
    error: (msg, ctx) => {
      if (typeof msg === "object" && msg) {
        logger.error(msg as Record<string, unknown>);
      } else {
        logger.error(ctx as Record<string, unknown>, String(msg));
      }
    },
    debug: (msg, ctx) => {
      if (typeof msg === "object" && msg) {
        logger.debug(msg as Record<string, unknown>);
      } else {
        logger.debug(ctx as Record<string, unknown>, String(msg));
      }
    },
    child: (bindings: Record<string, unknown>) =>
      createPinoLogger(String(bindings.scope ?? scope), options),
  };
};
