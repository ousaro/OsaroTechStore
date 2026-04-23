import { createUserPasswordUpdateCommand } from "../../domain/entities/User.js";
import {
  UserNotFoundError,
  UserValidationError,
} from "../errors/UserApplicationError.js";
import {
  assertUserRepositoryCommandPort,
  assertUserRepositoryQueryPort,
} from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildUpdateUserPasswordUseCase = ({ userRepository }) => {
  assertUserRepositoryQueryPort(userRepository, ["isValidId", "getCredentialsById"]);
  assertUserRepositoryCommandPort(userRepository, [
    "comparePassword",
    "hashPassword",
    "updateCredentialsById",
  ]);
  return async ({ id, requesterId, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError(`No such user ${id}`);
    }

    const command = createUserPasswordUpdateCommand(updates);
    const patch = { ...updates };

    if (command.newPassword) {
      if (id.toString() === requesterId.toString()) {
        const currentCredentials = await userRepository.getCredentialsById(id);

        if (!currentCredentials) {
          throw new UserNotFoundError("User not found");
        }

        const match = await userRepository.comparePassword(
          command.currentPassword,
          currentCredentials.password
        );
        if (!match) {
          throw new UserValidationError("Current password is incorrect");
        }
      }

      patch.password = await userRepository.hashPassword(command.newPassword);
    }

    delete patch.newPassword;
    delete patch.currentPassword;

    const user = await userRepository.updateCredentialsById(id, {
      password: patch.password,
    });
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return toUserReadModel(user);
  };
};
