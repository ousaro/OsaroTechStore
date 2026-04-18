import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { assertUsersInputPort } from "../../ports/input/usersInputPort.js";

export const createUsersHttpController = ({ usersInputPort }) => {
  assertUsersInputPort(usersInputPort);

  const getAllUsersHandler = asyncHandler(async (req, res) => {
    const users = await usersInputPort.getAllUsers();
    return res.status(200).json(users);
  });

  const getUserByIdHandler = asyncHandler(async (req, res) => {
    const payload = await usersInputPort.getUserById({ id: req.params.id });
    return res.status(200).json(payload);
  });

  const updateUserHandler = asyncHandler(async (req, res) => {
    const payload = await usersInputPort.updateUser({
      id: req.params.id,
      updates: req.body,
    });
    return res.status(200).json(payload);
  });

  const updateUserPasswordHandler = asyncHandler(async (req, res) => {
    const payload = await usersInputPort.updateUserPassword({
      id: req.params.id,
      requesterId: req.user._id,
      updates: req.body,
    });
    return res.status(200).json(payload);
  });

  const deleteUserHandler = asyncHandler(async (req, res) => {
    const payload = await usersInputPort.deleteUser({
      id: req.params.id,
    });
    return res.status(200).json(payload);
  });

  return {
    getAllUsersHandler,
    getUserByIdHandler,
    updateUserHandler,
    updateUserPasswordHandler,
    deleteUserHandler,
  };
};
