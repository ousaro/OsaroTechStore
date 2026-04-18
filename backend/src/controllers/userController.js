// Backward-compatible exports for any existing imports.
import {
  getAllUsersHandler as getAllUsers,
  getUserByIdHandler as getUserById,
  updateUserHandler as updateUser,
  updateUserPasswordHandler as updateUserPassword,
  deleteUserHandler as deleteUser,
} from "../modules/users/index.js";

export { getAllUsers, getUserById, updateUser, updateUserPassword, deleteUser };
