import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildVerifyAccessTokenUseCase = ({ tokenService, authUserRepository }) => {
  assertTokenServicePort(tokenService, ["verifyAndExtractUserId"]);
  assertAuthUserRepositoryPort(authUserRepository, ["findUserIdOnly"]);
  return async ({ authorizationHeader }) => {
    if (!authorizationHeader) {
      const error = new Error("Authorization token required");
      error.statusCode = 401;
      throw error;
    }
    const userId = tokenService.verifyAndExtractUserId(authorizationHeader);
    return authUserRepository.findUserIdOnly(userId);
  };
};
