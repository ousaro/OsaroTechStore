import { buildGetAllUsersUseCase } from "./application/queries/getAllUsersUseCase.js";
import { buildGetUserByIdUseCase } from "./application/queries/getUserByIdUseCase.js";
import { buildUpdateUserUseCase } from "./application/commands/updateUserUseCase.js";
import { buildUpdateUserPasswordUseCase } from "./application/commands/updateUserPasswordUseCase.js";
import { buildDeleteUserUseCase } from "./application/commands/deleteUserUseCase.js";
import { createUsersInputPort } from "./ports/input/usersInputPort.js";
import { createUsersHttpController } from "./adapters/input/http/usersHttpController.js";

export const createUsersModule = ({ userRepository }) => {
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

  return createUsersHttpController({
    usersInputPort,
  });
};

export let getAllUsersHandler;
export let getUserByIdHandler;
export let updateUserHandler;
export let updateUserPasswordHandler;
export let deleteUserHandler;

export const configureUsersModule = (dependencies) => {
  ({
    getAllUsersHandler,
    getUserByIdHandler,
    updateUserHandler,
    updateUserPasswordHandler,
    deleteUserHandler,
  } = createUsersModule(dependencies));
};
