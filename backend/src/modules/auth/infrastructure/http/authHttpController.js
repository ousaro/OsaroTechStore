export const createAuthHttpController = ({
  registerUserUseCase,
  loginUserUseCase,
  verifyAccessTokenUseCase,
}) => {
  const registerUserHandler = async (req, res) => {
    try {
      const payload = await registerUserUseCase(req.body);
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  const loginUserHandler = async (req, res) => {
    try {
      const payload = await loginUserUseCase(req.body);
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  const requireAuthMiddleware = async (req, res, next) => {
    try {
      req.user = await verifyAccessTokenUseCase({
        authorizationHeader: req.headers.authorization,
      });
      return next();
    } catch (error) {
      return res.status(error.statusCode || 401).json({ error: error.message });
    }
  };

  const googleCallbackHandler = (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect(
        `${process.env.CLIENT_URL}/SetPassword?user=${encodeURIComponent(
          JSON.stringify(req.user)
        )}`
      );
    }
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  };

  return {
    registerUserHandler,
    loginUserHandler,
    requireAuthMiddleware,
    googleCallbackHandler,
  };
};
