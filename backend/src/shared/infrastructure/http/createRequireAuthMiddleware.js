export const createRequireAuthMiddleware = ({ verifyAccessToken }) => {
  return async (req, res, next) => {
    try {
      req.user = await verifyAccessToken(req.headers.authorization);
      return next();
    } catch (error) {
      return res.status(error.statusCode || 401).json({
        error: error.message,
      });
    }
  };
};
