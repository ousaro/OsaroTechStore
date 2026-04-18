import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildRegisterUserUseCase = ({ authUserRepository, tokenService }) => {
  assertAuthUserRepositoryPort(authUserRepository, ["register"]);
  assertTokenServicePort(tokenService, ["signUserId"]);

  return async ({ firstName, lastName, email, password, confirmPassword, picture }) => {
    const user = await authUserRepository.register({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      picture,
    });
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
