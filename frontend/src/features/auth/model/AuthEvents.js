import { DomainEvent, Events } from "../../../lib/events.js";

export const AuthEvents = {
  userLoggedIn:  (user)  => new DomainEvent(Events.USER_LOGGED_IN,  { user }),
  userLoggedOut: ()      => new DomainEvent(Events.USER_LOGGED_OUT, {}),
  userRegistered:(user)  => new DomainEvent(Events.USER_REGISTERED, { user }),
};
