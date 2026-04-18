import { ApiError } from "../../../../shared/domain/errors/ApiError.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
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
        throw new ApiError(`Invalid item at index ${index}: ${error.message}`, 400);
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
