import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { PaymentValidationError } from "../errors/PaymentApplicationError.js";
import {
  assertNonEmptyArray,
  assertPositiveNumber,
  assertString,
} from "../validation/paymentInputValidation.js";

export const buildCreatePaymentIntentUseCase = ({ paymentGateway, clientUrl }) => {
  assertPaymentGatewayPort(paymentGateway, ["createCheckoutSession"]);

  return async ({ items }) => {
    assertNonEmptyArray(items, "items must be a non-empty array");
    items.forEach((item, index) => {
      try {
        assertString(item?.name, "item.name is required");
        assertPositiveNumber(item?.price, "item.price must be a positive number");
        assertPositiveNumber(item?.quantity, "item.quantity must be a positive number");
      } catch (error) {
        throw new PaymentValidationError(`Invalid item at index ${index}: ${error.message}`);
      }
    });

    const session = await paymentGateway.createCheckoutSession({
      items,
      successUrl: `${clientUrl}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientUrl}/Cart`,
    });

    return { url: session.url };
  };
};
