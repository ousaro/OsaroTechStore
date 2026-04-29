/**
 * requireAuth Middleware Factory.
 *
 * Depends on the tokenService port — the concrete implementation
 * (JWT, session, etc.) is injected by the composition root.
 *
 * On success: sets req.user = { id: string } and calls next().
 * On failure: throws ApplicationUnauthorizedError → 401 via errorMiddleware.
 */
import { ApplicationUnauthorizedError } from "../../application/errors/index.js";

export const createRequireAuthMiddleware = ({ tokenService }) => {
  if (typeof tokenService?.verify !== "function") {
    throw new Error(
      "createRequireAuthMiddleware: tokenService must implement .verify()"
    );
  }

  return async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApplicationUnauthorizedError("Authorization header is missing");
      }
      req.user = await tokenService.verify(authHeader);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
