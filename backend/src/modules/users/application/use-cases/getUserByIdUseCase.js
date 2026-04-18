import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildGetUserByIdUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findById"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new ApiError("No such user", 404);
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };
};
