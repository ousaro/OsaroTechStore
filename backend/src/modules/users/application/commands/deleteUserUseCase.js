import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { assertUserRepositoryCommandPort } from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildDeleteUserUseCase = ({ userRepository }) => {
  assertUserRepositoryCommandPort(userRepository, ["findByIdAndDelete"]);
  if (typeof userRepository?.isValidId !== "function") {
    throw new Error("userRepository port must implement isValidId");
  }
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError("No such user");
    }

    const deletedUser = await userRepository.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new UserNotFoundError("User not found");
    }

    return toUserReadModel(deletedUser);
  };
};
