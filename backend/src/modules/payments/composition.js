import { buildCreatePaymentIntentUseCase } from "./application/commands/createPaymentIntentUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/commands/verifyWebhookUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "./application/commands/linkPaymentToOrderUseCase.js";
import { buildGetPaymentByOrderIdUseCase } from "./application/queries/getPaymentByOrderIdUseCase.js";

import { createPaymentsCommandsPort } from "./ports/input/paymentsCommandsPort.js";
import { createPaymentsQueriesPort } from "./ports/input/paymentsQueriesPort.js";
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
  idempotencyStore,
}) => {
  assertNonEmptyString(
    clientUrl,
    "clientUrl",
    "createPaymentsModule: clientUrl is required. Set CLIENT_URL in .env"
  );

  if (paymentsEnabled || webhookEnabled) {
    assertPaymentGatewayPort(paymentGateway, "createPaymentsModule");
  }
  assertPaymentRepositoryPort(paymentRepository);
  assertPaymentEventPublisherPort(paymentEventPublisher);

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
    idempotencyStore,
  });

  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentGateway,
    paymentRepository,
    paymentsEnabled,
    clientUrl,
    logger,
  });

  const getPaymentByOrderId = buildGetPaymentByOrderIdUseCase({ paymentRepository });

  const paymentsCommands = createPaymentsCommandsPort({
    createPaymentIntent,
    verifyWebhook,
    linkPaymentToOrder,
  });

  const paymentsQueries = createPaymentsQueriesPort({
    getPaymentByOrderId,
  });

  const controller = createPaymentsHttpController({ paymentsCommands, paymentsQueries });

  const createRoutes = ({ requireAuth } = {}) =>
    createPaymentsRoutes({ controller, requireAuth, webhookEnabled });

  return {
    createRoutes,
    linkPaymentToOrder: paymentsCommands.linkPaymentToOrder,
  };
};
