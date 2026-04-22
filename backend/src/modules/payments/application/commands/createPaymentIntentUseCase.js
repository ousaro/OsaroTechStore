import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createCheckoutItems } from "../../domain/value-objects/CheckoutItem.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";
import { createCheckoutSessionWorkflow } from "../../domain/services/paymentSessionWorkflowService.js";
import { PaymentValidationError } from "../errors/PaymentApplicationError.js";
import { toPaymentCheckoutRedirectDto } from "../dto/paymentSessionDto.js";

export const buildCreatePaymentIntentUseCase = ({
  paymentGateway,
  paymentRepository,
  clientUrl,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["createCheckoutSession"]);
  assertPaymentRepositoryPort(paymentRepository, ["savePaymentSession"]);

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

    const paymentSession = createCheckoutSessionWorkflow({
      gatewaySession: session,
    });
    await paymentRepository.savePaymentSession(paymentSession.toPrimitives());

    return toPaymentCheckoutRedirectDto(paymentSession.toPrimitives());
  };
};
