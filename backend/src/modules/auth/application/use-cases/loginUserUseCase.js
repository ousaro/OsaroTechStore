import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";
import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { createLoginCommand } from "../../domain/entities/AuthCredentials.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildLoginUserUseCase = ({ authUserRepository, tokenService }) => {
  assertAuthUserRepositoryPort(authUserRepository, ["findByEmail", "comparePassword"]);
  assertTokenServicePort(tokenService, ["signUserId"]);

  return async ({ email, password }) => {
    const command = createLoginCommand({ email, password });
    const user = await authUserRepository.findByEmail(command.email);
    const passwordMatches =
      user && (await authUserRepository.comparePassword(command.password, user.password));
    if (!user || !passwordMatches) throw new ApiError("Email or Password are not correct", 400);
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
