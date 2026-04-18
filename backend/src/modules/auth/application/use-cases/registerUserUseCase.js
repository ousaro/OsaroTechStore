import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";

export const buildRegisterUserUseCase = ({ authUserRepository, tokenService }) => {
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
