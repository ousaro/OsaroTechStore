import { createPaymentConfirmedEvent } from "./PaymentConfirmed.js";
import { createPaymentExpiredEvent } from "./PaymentExpired.js";
import { createPaymentFailedEvent } from "./PaymentFailed.js";
import { createPaymentRefundedEvent } from "./PaymentRefunded.js";

export const createPaymentStateChangeEvent = (paymentStateChange) => {
  if (paymentStateChange?.paymentOutcome === "expired") {
    return createPaymentExpiredEvent(paymentStateChange);
  }

  switch (paymentStateChange?.paymentStatus) {
    case "paid":
      return createPaymentConfirmedEvent(paymentStateChange);
    case "failed":
      return createPaymentFailedEvent(paymentStateChange);
    case "refunded":
      return createPaymentRefundedEvent(paymentStateChange);
    default:
      return null;
  }
};
