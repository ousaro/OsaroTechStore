export const createRequireAuthMiddleware = ({ tokenService }) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      req.user = await tokenService.verify(token);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};