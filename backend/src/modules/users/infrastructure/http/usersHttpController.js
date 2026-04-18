import { assertUsersInputPort } from "../../ports/input/usersInputPort.js";

export const createUsersHttpController = ({ usersInputPort }) => {
  assertUsersInputPort(usersInputPort);

  const getAllUsersHandler = async (req, res) => {
    const users = await usersInputPort.getAllUsers();
    return res.status(200).json(users);
  };

  const getUserByIdHandler = async (req, res) => {
    try {
      const payload = await usersInputPort.getUserById({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  const updateUserHandler = async (req, res) => {
    try {
      const payload = await usersInputPort.updateUser({
        id: req.params.id,
        updates: req.body,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  const updateUserPasswordHandler = async (req, res) => {
    try {
      const payload = await usersInputPort.updateUserPassword({
        id: req.params.id,
        requesterId: req.user._id,
        updates: req.body,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  const deleteUserHandler = async (req, res) => {
    try {
      const payload = await usersInputPort.deleteUser({
        id: req.params.id,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  };

  return {
    getAllUsersHandler,
    getUserByIdHandler,
    updateUserHandler,
    updateUserPasswordHandler,
    deleteUserHandler,
  };
};
