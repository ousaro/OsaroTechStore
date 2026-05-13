import { createUserCommands } from "./application/commands/userCommands.js";
import { createUserQueries }  from "./application/queries/userQueries.js";
import { assertInputPort }    from "../../shared/kernel/assertions/portAssertions.js";

const USERS_INPUT_PORT_METHODS = [
  "getMyProfile", "updateProfile", "toggleFavorite", "deleteAccount", "deleteUser",
];

export function createUsersModule(deps) {
  const commands = createUserCommands(deps);
  const queries  = createUserQueries(deps);

  const inputPort = {
    getMyProfile:   queries.getMyProfile,
    updateProfile:  commands.updateProfile,
    toggleFavorite: commands.toggleFavorite,
    deleteAccount:  commands.deleteAccount,
    deleteUser:     commands.deleteUser,
  };

  assertInputPort("UsersInputPort", inputPort, USERS_INPUT_PORT_METHODS);
  return inputPort;
}
