import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";
import { createRegistrationCommand } from "../../domain/entities/AuthCredentials.js";
import { assertAuthUserRepositoryPort } from "../../ports/output/authUserRepositoryPort.js";
import { assertTokenServicePort } from "../../ports/output/tokenServicePort.js";

export const buildRegisterUserUseCase = ({ authUserRepository, tokenService }) => {
  assertAuthUserRepositoryPort(authUserRepository, ["findByEmail", "hashPassword", "create"]);
  assertTokenServicePort(tokenService, ["signUserId"]);

  return async ({ firstName, lastName, email, password, confirmPassword, picture }) => {
    const command = createRegistrationCommand({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      picture,
    });

    const existingUser = await authUserRepository.findByEmail(command.email);
    if (existingUser) throw new Error("Email already exist!");

    const hashedPassword = await authUserRepository.hashPassword(command.password);
    const user = await authUserRepository.create({
      ...command,
      password: hashedPassword,
    });
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
