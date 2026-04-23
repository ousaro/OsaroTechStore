import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createCheckoutItems } from "../../domain/value-objects/CheckoutItem.js";
import { assertRedirectPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { assertPaymentRepositoryCommandPort } from "../../ports/output/paymentRepositoryPort.js";
import { createRedirectPaymentWorkflow } from "../../domain/services/paymentWorkflowService.js";
import { PaymentValidationError } from "../errors/PaymentApplicationError.js";
import { toPaymentCheckoutRedirectDto } from "../dto/paymentWorkflowDto.js";

export const buildCreatePaymentIntentUseCase = ({
  paymentGateway,
  paymentRepository,
  clientUrl,
}) => {
  assertRedirectPaymentGatewayPort(paymentGateway, ["createRedirectPayment"]);
  assertPaymentRepositoryCommandPort(paymentRepository, ["savePaymentWorkflow"]);

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

    const payment = await paymentGateway.createRedirectPayment({
      items: checkoutItems.map((item) => item.toPrimitives()),
      successUrl: `${clientUrl}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientUrl}/Cart`,
    });

    const paymentWorkflow = createRedirectPaymentWorkflow({
      gatewayPayment: payment,
    });
    await paymentRepository.savePaymentWorkflow(paymentWorkflow.toPrimitives());

    return toPaymentCheckoutRedirectDto(paymentWorkflow.toPrimitives());
  };
};
