import jwt from "jsonwebtoken";
import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { env } from "../../../../config/env.js";

export const createJwtTokenService = () => {
  return {
    signUserId(userId) {
      return jwt.sign({ _id: userId }, env.tokenSecret, { expiresIn: "2d" });
    },

    verifyAndExtractUserId(authorizationHeader) {
      const [scheme, token] = authorizationHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new ApiError("Request is not authorized", 401);
      }

      try {
        const { _id } = jwt.verify(token, env.tokenSecret);
        return _id;
      } catch (_error) {
        throw new ApiError("Request is not authorized", 401);
      }
    },
  };
};
