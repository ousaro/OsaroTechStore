/**
 * requireAuth Middleware Factory.
 *
 * Depends on the tokenService port — the concrete implementation
 * (JWT, session, etc.) is injected by the composition root.
 *
 * On success: sets req.user = { _id: string, admin: boolean } and calls next().
 * On failure: throws ApplicationUnauthorizedError → 401 via errorMiddleware.
 */
import {
  ApplicationForbiddenError,
  ApplicationUnauthorizedError,
} from "../../../application/errors/index.js";
import { assertFunction, assertObject } from "../../../kernel/assertions/index.js";

export const createRequireAuthMiddleware = ({ tokenService, authUserRepository }) => {
  assertObject(
    tokenService,
    "tokenService",
    "createRequireAuthMiddleware: tokenService is required"
  );
  assertFunction(
    tokenService.verify,
    "tokenService.verify",
    "createRequireAuthMiddleware: tokenService must implement .verify()"
  );

  assertObject(
    authUserRepository,
    "authUserRepository",
    "createRequireAuthMiddleware: authUserRepository is required"
  );
  assertFunction(
    authUserRepository.findById,
    "authUserRepository.findById",
    "createRequireAuthMiddleware: authUserRepository must implement .findById()"
  );

  const requireAuth = async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApplicationUnauthorizedError("Authorization header is missing");
      }

      const tokenUser = await tokenService.verify(authHeader);
      const userId = tokenUser?._id ?? tokenUser?.id;
      if (!userId) {
        throw new ApplicationUnauthorizedError("Invalid token payload");
      }

      const user = await authUserRepository.findById(userId);
      if (!user) {
        throw new ApplicationUnauthorizedError("Authenticated user no longer exists");
      }

      req.user = {
        _id: user._id,
        admin: Boolean(user.admin),
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };

  requireAuth.requireAdmin = (req, _res, next) => {
    if (!req.user) {
      return next(new ApplicationUnauthorizedError("Authentication is required"));
    }
    if (!req.user.admin) {
      return next(new ApplicationForbiddenError("Admin privileges are required"));
    }
    return next();
  };

  return requireAuth;
};
