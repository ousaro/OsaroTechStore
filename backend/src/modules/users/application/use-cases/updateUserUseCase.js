import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { createUserUpdatePatch } from "../../domain/entities/User.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildUpdateUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndUpdate"]);
  return async ({ id, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new ApiError(`No such user ${id}`, 404);
    }

    const patch = createUserUpdatePatch(updates);

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };
};
