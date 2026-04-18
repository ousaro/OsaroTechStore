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
      const error = new Error(`No such user ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const command = createUserPasswordUpdateCommand(updates);
    const patch = { ...updates };

    if (command.newPassword) {
      if (id.toString() === requesterId.toString()) {
        const currentUser = await userRepository.findById(id);

        if (!currentUser) {
          const error = new Error("User not found");
          error.statusCode = 404;
          throw error;
        }

        const match = await userRepository.comparePassword(
          command.currentPassword,
          currentUser.password
        );
        if (!match) {
          const error = new Error("Current password is incorrect");
          error.statusCode = 400;
          throw error;
        }
      }

      patch.password = await userRepository.hashPassword(command.newPassword);
    }

    delete patch.newPassword;
    delete patch.currentPassword;

    const user = await userRepository.findByIdAndUpdate(id, createUserUpdatePatch(patch));
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  };
};
