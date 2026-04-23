import jwt from "jsonwebtoken";
import { AuthUnauthorizedError } from "../../../application/errors/AuthApplicationError.js";
import { env } from "../../../../../infrastructure/config/env.js";

export const createJwtTokenService = () => {
  return {
    signUserId(userId) {
      return jwt.sign({ _id: userId }, env.tokenSecret, { expiresIn: "2d" });
    },

    verifyAndExtractUserId(authorizationHeader) {
      const [scheme, token] = authorizationHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new AuthUnauthorizedError("Request is not authorized");
      }

      try {
        const { _id } = jwt.verify(token, env.tokenSecret);
        return _id;
      } catch (_error) {
        throw new AuthUnauthorizedError("Request is not authorized");
      }
    },
  };
};
