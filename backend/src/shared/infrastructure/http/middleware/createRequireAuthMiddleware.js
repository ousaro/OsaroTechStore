/**
 * requireAuth Middleware Factory.
 *
 * Depends on the tokenService port — the concrete implementation
 * (JWT, session, etc.) is injected by the composition root.
 *
 * On success: sets req.user = { id: string } and calls next().
 * On failure: throws ApplicationUnauthorizedError → 401 via errorMiddleware.
 */
import { ApplicationUnauthorizedError } from "../../../application/errors/index.js";
import { assertFunction, assertObject } from "../../../kernel/assertions/index.js";

export const createRequireAuthMiddleware = ({ tokenService }) => {
  assertObject(tokenService, "tokenService", "createRequireAuthMiddleware: tokenService is required");
  assertFunction(
    tokenService.verify,
    "tokenService.verify",
    "createRequireAuthMiddleware: tokenService must implement .verify()"
  );

  return async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApplicationUnauthorizedError("Authorization header is missing");
      }
      req.user = await tokenService.verify(authHeader);
      if (!req.user || !req.user.id) {
        throw new ApplicationUnauthorizedError("Invalid token payload");
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
