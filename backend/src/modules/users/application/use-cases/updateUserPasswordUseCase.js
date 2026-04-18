import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { createUserPasswordUpdateCommand, createUserUpdatePatch } from "../../domain/entities/User.js";
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
      throw new ApiError(`No such user ${id}`, 404);
    }

    const command = createUserPasswordUpdateCommand(updates);
    const patch = { ...updates };

    if (command.newPassword) {
      if (id.toString() === requesterId.toString()) {
        const currentUser = await userRepository.findById(id);

        if (!currentUser) {
          throw new ApiError("User not found", 404);
        }

        const match = await userRepository.comparePassword(
          command.currentPassword,
          currentUser.password
        );
        if (!match) {
          throw new ApiError("Current password is incorrect", 400);
        }
      }

      patch.password = await userRepository.hashPassword(command.newPassword);
    }

    delete patch.newPassword;
    delete patch.currentPassword;

    const user = await userRepository.findByIdAndUpdate(id, createUserUpdatePatch(patch));
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };
};
