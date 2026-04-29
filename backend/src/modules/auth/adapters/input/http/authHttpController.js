import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertAuthInputPort } from "../../../ports/input/authInputPort.js";

export const createAuthHttpController = ({ authInputPort }) => {
  assertAuthInputPort(authInputPort);

  return {
    registerUser: asyncHandler(async (req, res) => {
      const payload = await authInputPort.registerUser(req.body);
      res.status(201).json(payload);
    }),

    loginUser: asyncHandler(async (req, res) => {
      const payload = await authInputPort.loginUser(req.body);
      res.status(200).json(payload);
    }),

    listUsers: asyncHandler(async (_req, res) => {
      const users = await authInputPort.listUsers();
      res.status(200).json(users);
    }),

    getUser: asyncHandler(async (req, res) => {
      const user = await authInputPort.getUser({ id: req.params.id });
      res.status(200).json(user);
    }),

    updateUser: asyncHandler(async (req, res) => {
      const user = await authInputPort.updateUser({ id: req.params.id, updates: req.body });
      res.status(200).json(user);
    }),

    deleteUser: asyncHandler(async (req, res) => {
      const user = await authInputPort.deleteUser({ id: req.params.id });
      res.status(200).json(user);
    }),

    googleCallbackHandler: (req, res) => {
      if (req.isAuthenticated()) {
        const userData = encodeURIComponent(JSON.stringify(req.user));
        return res.redirect(`${req.app.locals.clientUrl}/SetPassword?user=${userData}`);
      }
      return res.redirect(`${req.app.locals.clientUrl}/login`);
    },
  };
};
