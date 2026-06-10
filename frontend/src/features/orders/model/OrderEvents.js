import { DomainEvent, Events } from "../../../lib/events.js";

export const OrderEvents = {
  placed: (order) => new DomainEvent(Events.ORDER_PLACED, { order }),
  updated: (order) => new DomainEvent(Events.ORDER_UPDATED, { order }),
};
