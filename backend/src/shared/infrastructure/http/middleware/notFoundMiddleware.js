/**
 * 404 Not Found Middleware.
 * Registered after all routes in createApp.js to catch unmatched paths.
 */
export const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
