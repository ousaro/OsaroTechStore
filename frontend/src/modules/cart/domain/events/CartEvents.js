import { DomainEvent, Events } from "../../../../shared/domain/events/DomainEvent.js";

export const CartEvents = {
  updated: (cart) => new DomainEvent(Events.CART_UPDATED, { cart }),
};
