import { toAuthPrincipal } from "../../domain/entities/AuthPrincipal.js";

export const buildLoginUserUseCase = ({ authUserRepository, tokenService }) => {
  return async ({ email, password }) => {
    const user = await authUserRepository.login({ email, password });
    const token = tokenService.signUserId(user._id);
    return toAuthPrincipal(user, token);
  };
};
