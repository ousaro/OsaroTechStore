import { assertAuthInputPort } from "../../ports/input/authInputPort.js";

export const createAuthHttpController = ({ authInputPort }) => {
  assertAuthInputPort(authInputPort);

  const registerUserHandler = async (req, res) => {
    try {
      const payload = await authInputPort.registerUser(req.body);
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  const loginUserHandler = async (req, res) => {
    try {
      const payload = await authInputPort.loginUser(req.body);
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(400).json({ error: error.message });
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
    googleCallbackHandler,
  };
};
