/**
 * JWT Token Service Adapter.
 *
 * Implements the tokenServicePort.
 * Fixed: no longer imports env directly — secret and expiresIn are injected.
 * Fixed: verify() now returns the user object, not void.
 */
import jwt from "jsonwebtoken";
import { AuthUnauthorizedError } from "../../application/errors/AuthApplicationError.js";

export const createJwtTokenService = ({ secret, expiresIn = "2d", logger }) => {
  if (!secret) {
    throw new Error("createJwtTokenService: secret is required");
  }

  return {
    signUserId(userId) {
      return jwt.sign({ _id: userId }, secret, { expiresIn });
    },

    /**
     * Verifies an Authorization header ("Bearer <token>") and returns { _id }.
     * Fixed: original verify() called extractUserId but discarded the return value.
     */
    verify(authorizationHeader) {
      if (typeof authorizationHeader !== "string") {
        throw new AuthUnauthorizedError("Authorization header is missing");
      }

      const [scheme, token] = authorizationHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new AuthUnauthorizedError(
          "Invalid Authorization header format. Expected: Bearer <token>"
        );
      }

      try {
        const decoded = jwt.verify(token, secret);
        return { _id: decoded._id };
      } catch (_err) {
        logger?.debug({ msg: "JWT verification failed" });
        throw new AuthUnauthorizedError("Token is invalid or expired");
      }
    },

    extractUserId(token) {
      try {
        const { _id } = jwt.verify(token, secret);
        return _id;
      } catch (_err) {
        throw new AuthUnauthorizedError("Token is invalid or expired");
      }
    },
  };
};
