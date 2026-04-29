import {
  buildGetUserProfileUseCase, buildUpdateUserProfileUseCase,
  buildUpdateUserCartUseCase, buildUpdateUserFavoritesUseCase,
} from "./application/useCases.js";
import { createUsersHttpController } from "./adapters/input/http/usersHttpController.js";
import { createUsersRoutes }         from "./adapters/input/http/usersRoutes.js";

export const createUsersModule = ({ userRepository, logger }) => {
  const getUserProfile     = buildGetUserProfileUseCase({ userRepository });
  const updateUserProfile  = buildUpdateUserProfileUseCase({ userRepository });
  const updateUserCart     = buildUpdateUserCartUseCase({ userRepository });
  const updateUserFavorites= buildUpdateUserFavoritesUseCase({ userRepository });

  const commandPort = { updateUserProfile, updateUserCart, updateUserFavorites };
  const queryPort   = { getUserProfile };
  const controller  = createUsersHttpController({ commandPort, queryPort });

  return {
    createRoutes: ({ requireAuth } = {}) => createUsersRoutes({ controller, requireAuth }),
  };
};
