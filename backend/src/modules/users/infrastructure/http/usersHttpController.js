export const createUsersHttpController = ({
  getAllUsersUseCase,
  getUserByIdUseCase,
  updateUserUseCase,
  updateUserPasswordUseCase,
  deleteUserUseCase,
}) => {
  const getAllUsersHandler = async (req, res) => {
    const users = await getAllUsersUseCase();
    return res.status(200).json(users);
  };

  const getUserByIdHandler = async (req, res) => {
    try {
      const payload = await getUserByIdUseCase({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  const updateUserHandler = async (req, res) => {
    try {
      const payload = await updateUserUseCase({
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
      const payload = await updateUserPasswordUseCase({
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
      const payload = await deleteUserUseCase({
        id: req.params.id,
      });
      return res.status(200).json(payload);
    } catch (error) {
      const key = error.responseKey || "error";
      return res.status(error.statusCode || 500).json({ [key]: error.message });
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
