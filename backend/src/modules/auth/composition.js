/**
 * Auth Module Composition.
 *
 * Pure factory — no global let singletons, no env imports.
 * The composition root calls createAuthModule() and holds the instance.
 *
 *  - Auth-specific admin operations (listManagedUserProfiles etc.) are now
 *    proper use cases in application/queries and application/commands —
 *    not inline logic inside the composition.
 *  - Returns createRoutes factory and public use cases as a plain object.
 */

import { buildRegisterUserUseCase }  from "./application/commands/registerUserUseCase.js";
import { buildLoginUserUseCase }     from "./application/commands/loginUserUseCase.js";
import { buildListUsersUseCase }     from "./application/queries/listUsersUseCase.js";
import { buildGetUserUseCase }       from "./application/queries/getUserUseCase.js";
import { buildUpdateUserUseCase }    from "./application/commands/updateManagedUserUseCase.js";
import { buildDeleteUserUseCase }    from "./application/commands/deleteManagedUserUseCase.js";

import { createAuthInputPort }       from "./ports/input/authInputPort.js";
import { createAuthHttpController }  from "./adapters/input/http/authHttpController.js";
import { createAuthRoutes }          from "./adapters/input/http/authRoutes.js";

export const createAuthModule = ({
  authUserRepository,
  tokenService,
  oauthProviders,
  clientUrl,
  logger,
}) => {
  // ── Use cases ─────────────────────────────────────────────────────────────
  const registerUser  = buildRegisterUserUseCase({ authUserRepository, tokenService, logger });
  const loginUser     = buildLoginUserUseCase({ authUserRepository, tokenService, logger });
  const listUsers     = buildListUsersUseCase({ authUserRepository });
  const getUser       = buildGetUserUseCase({ authUserRepository });
  const updateUser    = buildUpdateUserUseCase({ authUserRepository });
  const deleteUser    = buildDeleteUserUseCase({ authUserRepository });

  // ── Input port ────────────────────────────────────────────────────────────
  const authInputPort = createAuthInputPort({
    registerUser,
    loginUser,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
  });

  // ── HTTP controller ───────────────────────────────────────────────────────
  const controller = createAuthHttpController({ authInputPort });

  // ── Route factory (receives requireAuth at registration time) ─────────────
  const createRoutes = ({ requireAuth } = {}) =>
    createAuthRoutes({
      controller,
      requireAuth,
      oauthProviders,
      clientUrl,
    });

  return { createRoutes };
};
