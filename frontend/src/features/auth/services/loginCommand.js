/**
 * AUTH — Application Command: login
 */
import { AuthUser } from "../model/AuthUser.js";
import { AuthEvents } from "../model/AuthEvents.js";
import { InvalidCredentialsError } from "../model/AuthErrors.js";

export function createLoginCommand({ authRepository, sessionStore, eventBus, notify }) {
  return async function login(email, password) {
    const { ok, data, error } = await authRepository.login(email, password);
    if (!ok) throw new InvalidCredentialsError(error);

    const user = new AuthUser(data);
    sessionStore.set(user.toJSON());
    eventBus.publish(AuthEvents.userLoggedIn(user));
    notify.success(`Welcome back, ${user.firstName}!`);
    return user;
  };
}
