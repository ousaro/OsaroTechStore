import { buildRegisterUserUseCase } from "./application/commands/registerUserUseCase.js";
import { buildLoginUserUseCase } from "./application/commands/loginUserUseCase.js";
import { buildListUsersUseCase } from "./application/queries/listUsersUseCase.js";
import { buildGetUserUseCase } from "./application/queries/getUserUseCase.js";
import { buildUpdateUserUseCase } from "./application/commands/updateManagedUserUseCase.js";
import { buildDeleteUserUseCase } from "./application/commands/deleteManagedUserUseCase.js";

import { createAuthInputPort } from "./ports/input/authInputPort.js";
import {
  assertAuthUserRepositoryPort,
  assertTokenServicePort,
} from "./ports/output/authOutputPort.js";
import { createAuthHttpController } from "./adapters/input/http/authHttpController.js";
import { createAuthRoutes } from "./adapters/input/http/authRoutes.js";

export const createAuthModule = ({
  authUserRepository,
  tokenService,
  oauthProviders,
  clientUrl,
  logger,
}) => {
  assertAuthUserRepositoryPort(authUserRepository);
  assertTokenServicePort(tokenService);

  const registerUser = buildRegisterUserUseCase({ authUserRepository, tokenService, logger });
  const loginUser = buildLoginUserUseCase({ authUserRepository, tokenService, logger });
  const listUsers = buildListUsersUseCase({ authUserRepository });
  const getUser = buildGetUserUseCase({ authUserRepository });
  const updateUser = buildUpdateUserUseCase({ authUserRepository });
  const deleteUser = buildDeleteUserUseCase({ authUserRepository });

  const authInputPort = createAuthInputPort({
    registerUser,
    loginUser,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
  });

  const controller = createAuthHttpController({ authInputPort });

  const createRoutes = ({ requireAuth } = {}) =>
    createAuthRoutes({
      controller,
      requireAuth,
      oauthProviders,
      clientUrl,
    });

  return {
    createRoutes,
  };
};
