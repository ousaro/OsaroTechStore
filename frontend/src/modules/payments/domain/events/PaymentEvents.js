// src/modules/payments/domain/events/PaymentEvents.js
import { DomainEvent, Events } from "../../../../shared/domain/events/DomainEvent.js";
export const PaymentEvents = {
  initiated: (payment) => new DomainEvent(Events.PAYMENT_INITIATED, { payment }),
};
