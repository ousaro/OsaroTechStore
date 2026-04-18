import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildDeleteUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new ApiError("No such user", 404);
    }

    const deletedUser = await userRepository.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new ApiError("User not found", 404);
    }

    return deletedUser;
  };
};
