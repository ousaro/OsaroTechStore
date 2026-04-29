/**
 * Payment Confirmed → Order Sync Translator.
 *
 * Collaboration adapter (input side of Orders module).
 * Subscribes to PaymentConfirmed / PaymentFailed / PaymentExpired events
 * published by the Payments module and calls confirmOrderPayment use case.
 *
 * This is the Anti-Corruption Layer between the Payments bounded context
 * and the Orders bounded context. Neither module imports the other directly.
 */
import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";
import { PAYMENT_STATUSES }       from "../../../../../shared/domain/value-objects/PaymentStatus.js";

const EVENT_TO_PAYMENT_STATUS = Object.freeze({
  PaymentConfirmed: PAYMENT_STATUSES.PAID,
  PaymentFailed:    PAYMENT_STATUSES.FAILED,
  PaymentExpired:   PAYMENT_STATUSES.EXPIRED,
});

export const createPaymentConfirmedOrderSyncTranslator = ({ confirmOrderPayment }) => {
  if (typeof confirmOrderPayment !== "function") {
    throw new Error(
      "createPaymentConfirmedOrderSyncTranslator: confirmOrderPayment must be a function"
    );
  }

  return {
    async publish(event) {
      assertApplicationEvent(event);

      const paymentStatus = EVENT_TO_PAYMENT_STATUS[event.type];
      if (!paymentStatus) return; // not a payment event we care about

      const { orderId } = event.payload;
      if (!orderId) return;

      await confirmOrderPayment({ orderId, paymentStatus });
    },
  };
};
