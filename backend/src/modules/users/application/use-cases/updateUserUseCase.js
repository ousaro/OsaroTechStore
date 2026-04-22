import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { createUserUpdatePatch } from "../../domain/entities/User.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildUpdateUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError(`No such user ${id}`);
    }

    const patch = createUserUpdatePatch(updates);

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return user;
  };
};
