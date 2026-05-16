/**
 * AUTH MODULE — Composition
 *
 * Mirror of backend's modules/auth/composition.js.
 * Wires commands, queries → input port.
 * Called only by the composition root. Never called by other modules.
 */

import { createLoginCommand }    from "./services/loginCommand.js";
import { createRegisterCommand } from "./services/registerCommand.js";
import { createLogoutCommand }   from "./services/logoutCommand.js";
import { createGetSessionQuery } from "./services/getSessionQuery.js";

export function createAuthModule({ auth: authRepository, sessionStore, eventBus, notify }) {
  const login      = createLoginCommand({ authRepository, sessionStore, eventBus, notify });
  const register   = createRegisterCommand({ authRepository, sessionStore, eventBus, notify });
  const logout     = createLogoutCommand({ sessionStore, eventBus, notify });
  const getSession = createGetSessionQuery({ sessionStore });

  const listUsers  = async () => authRepository.listUsers();
  const deleteUser = async (id) => authRepository.deleteUser(id);

  const inputPort = { login, register, logout, getSession, listUsers, deleteUser };  return inputPort;
}
