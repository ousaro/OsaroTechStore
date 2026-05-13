/**
 * AUTH MODULE — Composition
 *
 * Mirror of backend's modules/auth/composition.js.
 * Wires commands, queries → input port.
 * Called only by the composition root. Never called by other modules.
 */
import { assertInputPort } from "../../shared/kernel/assertions/portAssertions.js";
import { AUTH_INPUT_PORT_METHODS } from "./ports/input/AuthInputPort.js";

import { createLoginCommand }    from "./application/commands/loginCommand.js";
import { createRegisterCommand } from "./application/commands/registerCommand.js";
import { createLogoutCommand }   from "./application/commands/logoutCommand.js";
import { createGetSessionQuery } from "./application/queries/getSessionQuery.js";

export function createAuthModule({ auth: authRepository, sessionStore, eventBus, notify }) {
  const login      = createLoginCommand({ authRepository, sessionStore, eventBus, notify });
  const register   = createRegisterCommand({ authRepository, sessionStore, eventBus, notify });
  const logout     = createLogoutCommand({ sessionStore, eventBus, notify });
  const getSession = createGetSessionQuery({ sessionStore });

  const listUsers  = async () => authRepository.listUsers();
  const deleteUser = async (id) => authRepository.deleteUser(id);

  const inputPort = { login, register, logout, getSession, listUsers, deleteUser };
  assertInputPort("AuthInputPort", inputPort, AUTH_INPUT_PORT_METHODS);
  return inputPort;
}
