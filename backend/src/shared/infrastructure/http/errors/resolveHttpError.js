/**
 * HTTP Error Resolver.
 *
 * Converts any thrown error into a structured HTTP response.
 * Uses error.code (set by domain/application errors) to determine
 * the HTTP status code.
 *
 * This is the Anti-Corruption Layer between domain errors and HTTP.
 */

import { HTTP_STATUS_BY_ERROR_CODE, DEFAULT_HTTP_STATUS } from "./httpErrorCodes.js";

export const resolveHttpError = (error, req, res, logger) => {
  const status =
    HTTP_STATUS_BY_ERROR_CODE[error.code] ?? DEFAULT_HTTP_STATUS;

  // Log server errors with full stack; client errors at warn level
  if (status >= 500) {
    logger?.error({
      msg: "Unhandled server error",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      errorCode: error.code,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger?.warn({
      msg: "Client error",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      errorCode: error.code,
      error: error.message,
    });
  }

  return res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message: status >= 500 ? "Internal server error" : error.message,
      ...(error.meta ? { meta: error.meta } : {}),
    },
  });
};
