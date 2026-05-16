import { assertApplicationEvent } from "../../../../../shared/application/contracts/applicationEventContract.js";
import { PAYMENT_STATUSES } from "../../../../../shared/domain/value-objects/PaymentStatus.js";
import { assertFunction } from "../../../../../shared/kernel/assertions/index.js";

const EVENT_TO_PAYMENT_STATUS = Object.freeze({
  PaymentConfirmed: PAYMENT_STATUSES.PAID,
  PaymentFailed: PAYMENT_STATUSES.FAILED,
  PaymentExpired: PAYMENT_STATUSES.EXPIRED,
});

export const createPaymentConfirmedOrderSyncTranslator = ({ confirmOrderPayment }) => {
  assertFunction(
    confirmOrderPayment,
    "confirmOrderPayment",
    "createPaymentConfirmedOrderSyncTranslator: confirmOrderPayment must be a function"
  );

  return {
    async publish(event) {
      assertApplicationEvent(event);

      const paymentStatus = EVENT_TO_PAYMENT_STATUS[event.type];
      if (!paymentStatus) return;

      const { orderId } = event.payload;
      if (!orderId) return;

      await confirmOrderPayment({ orderId, paymentStatus });
    },
  };
};
