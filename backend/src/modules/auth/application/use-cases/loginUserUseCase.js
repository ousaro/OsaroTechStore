import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";
import { createLoginCommand } from "../../domain/entities/AuthCredentials.js";
import {
  AuthUnauthorizedError,
} from "../errors/AuthApplicationError.js";
import { assertValidLoginData } from "../policies/authCredentialsPolicy.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildLoginUserUseCase = ({ authUserRepository, tokenService }) => {
  assertAuthUserRepositoryPort(authUserRepository, ["findByEmail", "comparePassword"]);
  assertTokenServicePort(tokenService, ["signUserId"]);

  return async ({ email, password }) => {
    assertValidLoginData({ email, password });

    const command = createLoginCommand({ email, password });
    const user = await authUserRepository.findByEmail(command.email);
    const passwordMatches =
      user && (await authUserRepository.comparePassword(command.password, user.password));
    if (!user || !passwordMatches) {
      throw new AuthUnauthorizedError("Email or Password are not correct");
    }
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
