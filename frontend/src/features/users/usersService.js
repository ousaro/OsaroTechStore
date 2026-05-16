import { createUserCommands } from "./services/userCommands.js";
import { createUserQueries }  from "./services/userQueries.js";

export function createUsersModule(deps) {
  const commands = createUserCommands(deps);
  const queries  = createUserQueries(deps);

  return {
    getMyProfile:   queries.getMyProfile,
    updateProfile:  commands.updateProfile,
    updatePassword: commands.updatePassword,
    toggleFavorite: commands.toggleFavorite,
    deleteAccount:  commands.deleteAccount,
    deleteUser:     commands.deleteUser,
  };
}
