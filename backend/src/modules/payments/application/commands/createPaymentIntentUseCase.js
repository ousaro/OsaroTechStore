import { createPaymentWorkflow } from "../../domain/entities/PaymentWorkflow.js";
import { PaymentsDisabledError } from "../errors/PaymentApplicationError.js";
import { toPaymentReadModel }    from "../read-models/paymentReadModel.js";
import { assertNonEmptyString }  from "../../../../shared/kernel/assertions/index.js";

export const buildCreatePaymentIntentUseCase = ({
  paymentGateway,
  paymentRepository,
  paymentsEnabled,
  clientUrl,
  logger,
}) =>
  async ({ orderId, items, currency }) => {
    if (!paymentsEnabled) throw new PaymentsDisabledError();
    assertNonEmptyString(orderId, "orderId");

    const successUrl = `${clientUrl}/payment-success?orderId=${orderId}`;
    const cancelUrl  = `${clientUrl}/payment-cancelled?orderId=${orderId}`;

    const session = await paymentGateway.createRedirectPayment({
      items,
      successUrl,
      cancelUrl,
    });

    const workflow = createPaymentWorkflow({
      orderId,
      provider:     session.provider,
      workflowType: session.workflowType,
      sessionId:    session.id,
      url:          session.url,
    });

    const saved = await paymentRepository.create(workflow.toPrimitives());

    logger?.info({ msg: "Payment intent created", orderId, sessionId: session.id });
    return toPaymentReadModel(saved);
  };
