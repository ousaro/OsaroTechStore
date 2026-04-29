/**
 * Login User Use Case.
 */
import { toAuthPrincipal }    from "../../domain/entities/AuthPrincipal.js";
import { createLoginCommand } from "../../domain/entities/AuthCredentials.js";
import { AuthUnauthorizedError } from "../errors/AuthApplicationError.js";
import { assertValidLoginData }  from "../policies/authCredentialsPolicy.js";

export const buildLoginUserUseCase = ({ authUserRepository, tokenService, logger }) =>
  async ({ email, password }) => {
    const normalizedEmail = assertValidLoginData({ email, password });
    const command = createLoginCommand({ email: normalizedEmail, password });

    // findByEmail returns record WITHOUT password hash (safe default)
    // We need the hash — so we use the specific method
    const user = await authUserRepository.findByEmail(command.email);
    const withCredentials = user
      ? await authUserRepository.findByIdWithPassword(user._id)
      : null;

    const passwordMatch =
      withCredentials &&
      (await authUserRepository.comparePassword(command.password, withCredentials.password));

    if (!user || !passwordMatch) {
      throw new AuthUnauthorizedError("Email or password is incorrect");
    }

    const token = tokenService.signUserId(user._id);
    logger?.info({ msg: "User logged in", userId: user._id });
    return toAuthPrincipal(user, token);
  };
