import { createUserPasswordUpdateCommand, createUserUpdatePatch } from "../../domain/entities/User.js";
import {
  UserNotFoundError,
  UserValidationError,
} from "../errors/UserApplicationError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildUpdateUserPasswordUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, [
    "isValidId",
    "findById",
    "comparePassword",
    "hashPassword",
    "findByIdAndUpdate",
  ]);
  return async ({ id, requesterId, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError(`No such user ${id}`);
    }

    const command = createUserPasswordUpdateCommand(updates);
    const patch = { ...updates };

    if (command.newPassword) {
      if (id.toString() === requesterId.toString()) {
        const currentUser = await userRepository.findById(id);

        if (!currentUser) {
          throw new UserNotFoundError("User not found");
        }

        const match = await userRepository.comparePassword(
          command.currentPassword,
          currentUser.password
        );
        if (!match) {
          throw new UserValidationError("Current password is incorrect");
        }
      }

      patch.password = await userRepository.hashPassword(command.newPassword);
    }

    delete patch.newPassword;
    delete patch.currentPassword;

    const user = await userRepository.findByIdAndUpdate(id, createUserUpdatePatch(patch));
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return user;
  };
};
