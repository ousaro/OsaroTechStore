import { resolveHttpError } from "../errors/resolveHttpError.js";

export const errorMiddleware = (error, req, res, next) => {
  const { statusCode, body } = resolveHttpError(error);
  return res.status(statusCode).json(body);
};
