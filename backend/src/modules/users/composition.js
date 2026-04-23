import { buildGetAllUsersUseCase } from "./application/queries/getAllUsersUseCase.js";
import { buildGetUserByIdUseCase } from "./application/queries/getUserByIdUseCase.js";
import { buildUpdateUserUseCase } from "./application/commands/updateUserUseCase.js";
import { buildUpdateUserPasswordUseCase } from "./application/commands/updateUserPasswordUseCase.js";
import { buildDeleteUserUseCase } from "./application/commands/deleteUserUseCase.js";
import { createUsersInputPort } from "./ports/input/usersInputPort.js";
import {
  getManagedUserCredentials,
  getManagedUserProfile,
  listManagedUserProfiles,
  removeManagedUserProfile,
  updateManagedUserCredentials,
  updateManagedUserProfile,
} from "../auth/public-api.js";
import { createMongooseUserRepository } from "./adapters/output/repositories/mongooseUserRepository.js";
import { createUsersHttpController } from "./adapters/input/http/usersHttpController.js";

const authUserManagement = {
  getManagedUserCredentials,
  getManagedUserProfile,
  listManagedUserProfiles,
  removeManagedUserProfile,
  updateManagedUserCredentials,
  updateManagedUserProfile,
};

const userRepository = createMongooseUserRepository({
  authUserManagement,
});

const getAllUsersUseCase = buildGetAllUsersUseCase({ userRepository });
const getUserByIdUseCase = buildGetUserByIdUseCase({ userRepository });
const updateUserUseCase = buildUpdateUserUseCase({ userRepository });
const updateUserPasswordUseCase = buildUpdateUserPasswordUseCase({ userRepository });
const deleteUserUseCase = buildDeleteUserUseCase({ userRepository });
const usersInputPort = createUsersInputPort({
  getAllUsers: getAllUsersUseCase,
  getUserById: getUserByIdUseCase,
  updateUser: updateUserUseCase,
  updateUserPassword: updateUserPasswordUseCase,
  deleteUser: deleteUserUseCase,
});

export const {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} = createUsersHttpController({
  usersInputPort,
});
