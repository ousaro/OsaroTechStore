import { buildUpdateUserProfileUseCase } from "./application/commands/updateUserProfileUseCase.js";
import { buildUpdateUserCartUseCase } from "./application/commands/updateUserCartUseCase.js";
import { buildUpdateUserFavoritesUseCase } from "./application/commands/updateUserFavoritesUseCase.js";
import { buildGetUserProfileUseCase } from "./application/queries/getUserProfileUseCase.js";
import { createUsersInputPort } from "./ports/input/usersInputPort.js";
import { createUsersHttpController } from "./adapters/input/http/usersHttpController.js";
import { createUsersRoutes }         from "./adapters/input/http/usersRoutes.js";

export const createUsersModule = ({ userRepository, logger }) => {
  const getUserProfile     = buildGetUserProfileUseCase({ userRepository });
  const updateUserProfile  = buildUpdateUserProfileUseCase({ userRepository });
  const updateUserCart     = buildUpdateUserCartUseCase({ userRepository });
  const updateUserFavorites= buildUpdateUserFavoritesUseCase({ userRepository });

  const usersInputPort = createUsersInputPort({
    getUserProfile,
    updateUserProfile,
    updateUserCart,
    updateUserFavorites,
  });

  const controller = createUsersHttpController({ usersInputPort });

  return {
    createRoutes: ({ requireAuth } = {}) => createUsersRoutes({ controller, requireAuth }),
  };
};
