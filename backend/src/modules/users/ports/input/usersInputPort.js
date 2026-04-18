export const createUsersInputPort = ({
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser,
}) => {
  return assertUsersInputPort({
    getAllUsers,
    getUserById,
    updateUser,
    updateUserPassword,
    deleteUser,
  });
};

export const assertUsersInputPort = (usersInputPort) => {
  if (!usersInputPort || typeof usersInputPort !== "object") {
    throw new Error("usersInputPort is required");
  }

  const requiredMethods = [
    "getAllUsers",
    "getUserById",
    "updateUser",
    "updateUserPassword",
    "deleteUser",
  ];

  for (const methodName of requiredMethods) {
    if (typeof usersInputPort[methodName] !== "function") {
      throw new Error(`usersInputPort must implement ${methodName}`);
    }
  }

  return usersInputPort;
};
