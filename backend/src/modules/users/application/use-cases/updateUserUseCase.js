import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { createUserProfileUpdatePatch } from "../../domain/entities/User.js";
import { assertUserRepositoryCommandPort } from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildUpdateUserUseCase = ({ userRepository }) => {
  assertUserRepositoryCommandPort(userRepository, ["findByIdAndUpdate"]);
  if (typeof userRepository?.isValidId !== "function") {
    throw new Error("userRepository port must implement isValidId");
  }
  return async ({ id, updates }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError(`No such user ${id}`);
    }

    const patch = createUserProfileUpdatePatch(updates);

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return toUserReadModel(user);
  };
};
