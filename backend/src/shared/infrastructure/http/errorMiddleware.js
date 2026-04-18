export const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Unexpected server error";

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && error.stack ? { stack: error.stack } : {}),
  });
};
