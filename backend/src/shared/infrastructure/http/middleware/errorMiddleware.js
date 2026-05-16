import { resolveHttpError } from "../errors/resolveHttpError.js";

export const createErrorMiddleware = (logger) => (error, req, res, _next) => {
  resolveHttpError(error, req, res, logger);
};
