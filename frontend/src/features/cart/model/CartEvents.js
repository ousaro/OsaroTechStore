import { DomainEvent, Events } from "../../../lib/events.js";

export const CartEvents = {
  updated: (cart) => new DomainEvent(Events.CART_UPDATED, { cart }),
};
