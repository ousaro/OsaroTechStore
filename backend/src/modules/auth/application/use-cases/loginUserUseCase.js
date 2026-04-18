import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildLoginUserUseCase = ({ authUserRepository, tokenService }) => {
  assertAuthUserRepositoryPort(authUserRepository, ["login"]);
  assertTokenServicePort(tokenService, ["signUserId"]);

  return async ({ email, password }) => {
    const user = await authUserRepository.login({ email, password });
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
