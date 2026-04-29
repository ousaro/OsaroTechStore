/**
 * Register User Use Case.
 */
import { toAuthPrincipal }           from "../../domain/entities/AuthPrincipal.js";
import { createRegistrationCommand } from "../../domain/entities/AuthCredentials.js";
import { AuthConflictError }         from "../errors/AuthApplicationError.js";
import { assertValidRegistrationData }from "../policies/authCredentialsPolicy.js";

export const buildRegisterUserUseCase = ({ authUserRepository, tokenService, logger }) =>
  async ({ firstName, lastName, email, password, confirmPassword, picture }) => {
    const normalizedEmail = assertValidRegistrationData({
      firstName, lastName, email, password, confirmPassword,
    });

    const command = createRegistrationCommand({
      firstName, lastName, email: normalizedEmail, password, confirmPassword, picture,
    });

    const existing = await authUserRepository.findByEmail(command.email);
    if (existing) throw new AuthConflictError("Email already exists");

    const hashedPassword = await authUserRepository.hashPassword(command.password);
    const user  = await authUserRepository.create({ ...command, password: hashedPassword });
    const token = tokenService.signUserId(user._id);

    logger?.info({ msg: "User registered", userId: user._id });
    return toAuthPrincipal(user, token);
  };
