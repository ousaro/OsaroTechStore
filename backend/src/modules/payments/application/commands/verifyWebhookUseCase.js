import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { createPaymentStateChangeEvent } from "../../domain/events/createPaymentStateChangeEvent.js";
import { assertPaymentEventPublisherPort } from "../../ports/output/paymentEventPublisherPort.js";
import { assertPaymentRepositoryCommandPort } from "../../ports/output/paymentRepositoryPort.js";

export const buildVerifyWebhookUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher = null,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["verifyWebhook"]);
  assertPaymentRepositoryCommandPort(paymentRepository, ["applyWebhookStateChangeOnce"]);
  if (paymentEventPublisher) {
    assertPaymentEventPublisherPort(paymentEventPublisher, ["publish"]);
  }

  return async ({ payload, signature }) => {
    const stateChange = paymentGateway.verifyWebhook(payload, signature);

    if (stateChange) {
      const appliedPayment = await paymentRepository.applyWebhookStateChangeOnce(
        stateChange
      );

      if (appliedPayment && paymentEventPublisher) {
        const paymentEvent = createPaymentStateChangeEvent({
          ...stateChange,
          paymentReference: appliedPayment.paymentReference,
        });

        if (paymentEvent) {
          await paymentEventPublisher.publish(paymentEvent);
        }
      }
    }

    return { received: true };
  };
};
