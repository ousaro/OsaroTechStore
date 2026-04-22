import { resolveHttpError } from "./resolveHttpError.js";

export const createRequireAuthMiddleware = ({ verifyAccessToken }) => {
  return async (req, res, next) => {
    try {
      req.user = await verifyAccessToken(req.headers.authorization);
      return next();
    } catch (error) {
      const { statusCode, body } = resolveHttpError(error);
      return res.status(statusCode).json(body);
    }
  };
};
