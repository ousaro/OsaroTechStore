/**
 * JWT Token Service Adapter.
 *
 * Implements the tokenServicePort.
 */
import jwt from "jsonwebtoken";
import { AuthUnauthorizedError } from "../../../application/errors/AuthApplicationError.js";
import { assertNonEmptyString } from "../../../../../shared/kernel/assertions/index.js";

export const createJwtTokenService = ({ secret, expiresIn = "2d", logger }) => {
  assertNonEmptyString(secret, "secret", "createJwtTokenService: secret is required");

  return {
    signUserId(userId) {
      return jwt.sign({ _id: userId }, secret, { expiresIn });
    },

    /**
     * Verifies an Authorization header ("Bearer <token>") and returns { _id }.
     */
    verify(authorizationHeader) {
      try {
        assertNonEmptyString(authorizationHeader, "authorizationHeader");
      } catch (_err) {
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
