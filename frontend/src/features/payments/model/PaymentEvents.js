import { DomainEvent, Events } from "../../../lib/events.js";
export const PaymentEvents = {
  initiated: (payment) => new DomainEvent(Events.PAYMENT_INITIATED, { payment }),
};
