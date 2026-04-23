import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { createUserProfileUpdatePatch } from "../../domain/entities/User.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildUpdateUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError(`No such user ${id}`);
    }

    const patch = createUserProfileUpdatePatch(updates);

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return user;
  };
};
