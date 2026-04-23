import { asyncHandler } from "../../../../../shared/infrastructure/http/asyncHandler.js";
import { assertAuthInputPort } from "../../../ports/input/authInputPort.js";

export const createAuthHttpController = ({ authInputPort }) => {
  assertAuthInputPort(authInputPort);

  const registerUserHandler = asyncHandler(async (req, res) => {
    const payload = await authInputPort.registerUser(req.body);
    return res.status(200).json(payload);
  });

  const loginUserHandler = asyncHandler(async (req, res) => {
    const payload = await authInputPort.loginUser(req.body);
    return res.status(200).json(payload);
  });

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
