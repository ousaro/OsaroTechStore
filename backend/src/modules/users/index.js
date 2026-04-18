import { buildGetAllUsersUseCase } from "./application/use-cases/getAllUsersUseCase.js";
import { buildGetUserByIdUseCase } from "./application/use-cases/getUserByIdUseCase.js";
import { buildUpdateUserUseCase } from "./application/use-cases/updateUserUseCase.js";
import { buildUpdateUserPasswordUseCase } from "./application/use-cases/updateUserPasswordUseCase.js";
import { buildDeleteUserUseCase } from "./application/use-cases/deleteUserUseCase.js";
import { authUserStore } from "../auth/index.js";
import { createMongooseUserRepository } from "./infrastructure/repositories/mongooseUserRepository.js";
import { createUsersHttpController } from "./infrastructure/http/usersHttpController.js";

const userRepository = createMongooseUserRepository({
  userStore: authUserStore,
});

const getAllUsersUseCase = buildGetAllUsersUseCase({ userRepository });
const getUserByIdUseCase = buildGetUserByIdUseCase({ userRepository });
const updateUserUseCase = buildUpdateUserUseCase({ userRepository });
const updateUserPasswordUseCase = buildUpdateUserPasswordUseCase({ userRepository });
const deleteUserUseCase = buildDeleteUserUseCase({ userRepository });

export const {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserPasswordHandler,
  deleteUserHandler,
} = createUsersHttpController({
  getAllUsersUseCase,
  getUserByIdUseCase,
  updateUserUseCase,
  updateUserPasswordUseCase,
  deleteUserUseCase,
});
