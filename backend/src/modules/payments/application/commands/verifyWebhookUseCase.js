import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { createPaymentConfirmedEvent } from "../../domain/events/PaymentConfirmed.js";
import { assertPaymentEventPublisherPort } from "../../ports/output/paymentEventPublisherPort.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";

export const buildVerifyWebhookUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher = null,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["verifyWebhook"]);
  assertPaymentRepositoryPort(paymentRepository, ["applyWebhookStateChangeOnce"]);
  if (paymentEventPublisher) {
    assertPaymentEventPublisherPort(paymentEventPublisher, ["publish"]);
  }

  return async ({ payload, signature }) => {
    const stateChange = paymentGateway.verifyWebhook(payload, signature);

    if (stateChange) {
      const appliedPayment = await paymentRepository.applyWebhookStateChangeOnce(
        stateChange
      );

      if (
        appliedPayment &&
        paymentEventPublisher &&
        stateChange.paymentStatus === "paid"
      ) {
        await paymentEventPublisher.publish(
          createPaymentConfirmedEvent({
            ...stateChange,
            paymentReference: appliedPayment.paymentReference,
          })
        );
      }
    }

    return { received: true };
  };
};
