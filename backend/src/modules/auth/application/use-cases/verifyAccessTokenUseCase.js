import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildVerifyAccessTokenUseCase = ({ tokenService, authUserRepository }) => {
  assertTokenServicePort(tokenService, ["verifyAndExtractUserId"]);
  assertAuthUserRepositoryPort(authUserRepository, ["findUserIdOnly"]);
  return async ({ authorizationHeader }) => {
    if (!authorizationHeader) {
      throw new ApiError("Authorization token required", 401);
    }
    const userId = tokenService.verifyAndExtractUserId(authorizationHeader);
    return authUserRepository.findUserIdOnly(userId);
  };
};
