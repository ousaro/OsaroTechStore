import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createPaymentSession } from "../../domain/entities/PaymentSession.js";
import { createCheckoutItems } from "../../domain/value-objects/CheckoutItem.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { PaymentValidationError } from "../errors/PaymentApplicationError.js";

export const buildCreatePaymentIntentUseCase = ({ paymentGateway, clientUrl }) => {
  assertPaymentGatewayPort(paymentGateway, ["createCheckoutSession"]);

  return async ({ items }) => {
    let checkoutItems;

    try {
      checkoutItems = createCheckoutItems(items);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new PaymentValidationError(error.message);
      }

      throw error;
    }

    const session = await paymentGateway.createCheckoutSession({
      items: checkoutItems.map((item) => item.toPrimitives()),
      successUrl: `${clientUrl}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientUrl}/Cart`,
    });

    const paymentSession = createPaymentSession(session);
    return { url: paymentSession.url };
  };
};
