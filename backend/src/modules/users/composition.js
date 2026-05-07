import { buildUpdateUserProfileUseCase } from "./application/commands/updateUserProfileUseCase.js";
import { buildUpdateUserCartUseCase } from "./application/commands/updateUserCartUseCase.js";
import { buildUpdateUserFavoritesUseCase } from "./application/commands/updateUserFavoritesUseCase.js";
import { buildGetUserProfileUseCase } from "./application/queries/getUserProfileUseCase.js";
import { createUsersInputPort } from "./ports/input/usersInputPort.js";
import { assertUserRepositoryPort } from "./ports/output/usersOutputPort.js";
import { createUsersHttpController } from "./adapters/input/http/usersHttpController.js";
import { createUsersRoutes } from "./adapters/input/http/usersRoutes.js";

export const createUsersModule = ({ userRepository }) => {
  // ── Validate output ports ────────────────────────────────────────────────
  assertUserRepositoryPort(userRepository);

  // ── Use cases ────────────────────────────────────────────────────────────
  const getUserProfile = buildGetUserProfileUseCase({ userRepository });
  const updateUserProfile = buildUpdateUserProfileUseCase({ userRepository });
  const updateUserCart = buildUpdateUserCartUseCase({ userRepository });
  const updateUserFavorites = buildUpdateUserFavoritesUseCase({ userRepository });

  // ── Input port ───────────────────────────────────────────────────────────
  const usersInputPort = createUsersInputPort({
    getUserProfile,
    updateUserProfile,
    updateUserCart,
    updateUserFavorites,
  });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createUsersHttpController({ usersInputPort });

  const createRoutes = ({ requireAuth } = {}) => createUsersRoutes({ controller, requireAuth });

  // ── Public surface ───────────────────────────────────────────────────────
  return {
    createRoutes,
  };
};
