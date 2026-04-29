/**
 * Global Express Error Middleware.
 *
 * Must be registered LAST in createApp.js (after all routes).
 * Receives any error forwarded via next(error) or thrown in asyncHandler.
 */
import { resolveHttpError } from "../errors/resolveHttpError.js";

export const createErrorMiddleware = (logger) =>
  // eslint-disable-next-line no-unused-vars
  (error, req, res, _next) => {
    resolveHttpError(error, req, res, logger);
  };
