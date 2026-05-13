import { DomainEvent, Events } from "../../../../shared/domain/events/DomainEvent.js";

export const OrderEvents = {
  placed:  (order) => new DomainEvent(Events.ORDER_PLACED,  { order }),
  updated: (order) => new DomainEvent(Events.ORDER_UPDATED, { order }),
};
