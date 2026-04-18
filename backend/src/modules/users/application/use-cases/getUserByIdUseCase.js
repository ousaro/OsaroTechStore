import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildGetUserByIdUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new ApiError("No such user", 404);
    }

    // Keep current behavior stable (placeholder payload).
    return {
      message: `user id ${id} `,
    };
  };
};
