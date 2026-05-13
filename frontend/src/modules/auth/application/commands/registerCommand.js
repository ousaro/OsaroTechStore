import { AuthUser } from "../../domain/entities/AuthUser.js";
import { AuthEvents } from "../../domain/events/AuthEvents.js";
import { RegistrationError } from "../../domain/errors/AuthErrors.js";

export function createRegisterCommand({ authRepository, sessionStore, eventBus, notify }) {
  return async function register(payload) {
    const { ok, data, error } = await authRepository.register(payload);
    if (!ok) throw new RegistrationError(error);

    const user = new AuthUser(data);
    sessionStore.set(user.toJSON());
    eventBus.publish(AuthEvents.userRegistered(user));
    notify.success("Account created!");
    return user;
  };
}
