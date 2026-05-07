/**
 * Payments Module Composition.
 *
 */
import { buildCreatePaymentIntentUseCase } from "./application/commands/createPaymentIntentUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/commands/verifyWebhookUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "./application/commands/linkPaymentToOrderUseCase.js";
import { buildGetPaymentByOrderIdUseCase } from "./application/queries/getPaymentByOrderIdUseCase.js";

import { createPaymentsInputPort } from "./ports/input/paymentsInputPort.js";
import {
  assertPaymentRepositoryPort,
  assertPaymentEventPublisherPort,
} from "./ports/output/paymentsOutputPort.js";
import { createPaymentsHttpController } from "./adapters/input/http/paymentsHttpController.js";
import { createPaymentsRoutes } from "./adapters/input/http/paymentsRoutes.js";
import { assertPaymentGatewayPort } from "../../shared/application/ports/paymentGatewayPort.js";
import { assertNonEmptyString } from "../../shared/kernel/assertions/index.js";

export const createPaymentsModule = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher,
  paymentsEnabled,
  webhookEnabled,
  clientUrl,
  logger,
}) => {
  assertNonEmptyString(
    clientUrl,
    "clientUrl",
    "createPaymentsModule: clientUrl is required. Set CLIENT_URL in .env"
  );

  // ── Validate output ports ────────────────────────────────────────────────
  if (paymentsEnabled || webhookEnabled) {
    assertPaymentGatewayPort(paymentGateway, "createPaymentsModule");
  }
  assertPaymentRepositoryPort(paymentRepository);
  assertPaymentEventPublisherPort(paymentEventPublisher);

  // ── Use cases ────────────────────────────────────────────────────────────
  const createPaymentIntent = buildCreatePaymentIntentUseCase({
    paymentGateway,
    paymentRepository,
    paymentsEnabled,
    clientUrl,
    logger,
  });

  const verifyWebhook = buildVerifyWebhookUseCase({
    paymentGateway,
    paymentRepository,
    paymentEventPublisher,
    webhookEnabled,
    logger,
  });

  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentGateway,
    paymentRepository,
    paymentsEnabled,
    clientUrl,
    logger,
  });

  const getPaymentByOrderId = buildGetPaymentByOrderIdUseCase({ paymentRepository });

  // ── Input port ───────────────────────────────────────────────────────────
  const paymentsInputPort = createPaymentsInputPort({
    createPaymentIntent,
    verifyWebhook,
    linkPaymentToOrder,
    getPaymentByOrderId,
  });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createPaymentsHttpController({ paymentsInputPort });

  const createRoutes = ({ requireAuth } = {}) =>
    createPaymentsRoutes({ controller, requireAuth, webhookEnabled });

  // ── Public surface ───────────────────────────────────────────────────────
  return {
    createRoutes,
    linkPaymentToOrder: paymentsInputPort.linkPaymentToOrder,
  };
};
