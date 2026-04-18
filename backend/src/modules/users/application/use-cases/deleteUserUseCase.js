import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildDeleteUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      // Keep legacy message for compatibility.
      throw new ApiError("No such Product", 404);
    }

    const deletedUser = await userRepository.findByIdAndDelete(id);
    if (!deletedUser) {
      // Keep legacy message for compatibility.
      throw new ApiError("Product not found", 404);
    }

    return deletedUser;
  };
};
