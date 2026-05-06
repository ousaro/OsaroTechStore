import { createPaymentWorkflow } from "../../domain/entities/PaymentWorkflow.js";
import { toPaymentReadModel }    from "../read-models/paymentReadModel.js";

export const buildLinkPaymentToOrderUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentsEnabled,
  clientUrl,
  logger,
}) =>
  async ({ orderId, orderLines, currency }) => {
    if (!paymentsEnabled) return null;

    const items = orderLines.map((line) => ({
      name:     line.name,
      price:    line.unitPrice?.amount ?? line.price,
      quantity: line.quantity,
    }));

    const successUrl = `${clientUrl}/payment-success?orderId=${orderId}`;
    const cancelUrl  = `${clientUrl}/payment-cancelled?orderId=${orderId}`;

    const session = await paymentGateway.createRedirectPayment({ items, successUrl, cancelUrl });

    const workflow = createPaymentWorkflow({
      orderId,
      provider:     session.provider,
      workflowType: session.workflowType,
      sessionId:    session.id,
      url:          session.url,
    });

    const saved = await paymentRepository.create(workflow.toPrimitives());
    logger?.info({ msg: "Payment linked to order", orderId, sessionId: session.id });
    return toPaymentReadModel(saved);
  };
