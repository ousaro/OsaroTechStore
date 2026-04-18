import jwt from "jsonwebtoken";
import { env } from "../../../../config/env.js";

export const createJwtTokenService = () => {
  return {
    signUserId(userId) {
      return jwt.sign({ _id: userId }, env.tokenSecret, { expiresIn: "2d" });
    },

    verifyAndExtractUserId(authorizationHeader) {
      const [scheme, token] = authorizationHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        const error = new Error("Request is not authorized");
        error.statusCode = 401;
        throw error;
      }

      try {
        const { _id } = jwt.verify(token, env.tokenSecret);
        return _id;
      } catch (_error) {
        const error = new Error("Request is not authorized");
        error.statusCode = 401;
        throw error;
      }
    },
  };
};
