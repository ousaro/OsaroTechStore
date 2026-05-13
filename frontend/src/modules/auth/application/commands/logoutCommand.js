import { AuthEvents } from "../../domain/events/AuthEvents.js";

export function createLogoutCommand({ sessionStore, eventBus, notify }) {
  return function logout() {
    sessionStore.clear();
    eventBus.publish(AuthEvents.userLoggedOut());
    notify.info("Logged out");
  };
}
