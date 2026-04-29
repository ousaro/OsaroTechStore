/**
 * Payments Module Composition.
 *
 * Fixed from original:
 *  - No env import (was importing env.clientUrl directly — infra in app layer).
 *  - clientUrl is now a required parameter — fails loudly if missing.
 *  - paymentsEnabled / webhookEnabled injected from resolvePaymentStrategy result.
 *  - createRoutes factory receives requireAuth at registration time.
 *  - linkPaymentToOrder exposed as collaboration method for event translator.
 */
import {
  buildCreatePaymentIntentUseCase,
  buildVerifyWebhookUseCase,
  buildLinkPaymentToOrderUseCase,
  buildGetPaymentByOrderIdUseCase,
} from "./application/useCases.js";

import { createPaymentsHttpController } from "./adapters/input/http/paymentsHttpController.js";
import { createPaymentsRoutes }         from "./adapters/input/http/paymentsRoutes.js";

export const createPaymentsModule = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher,
  paymentsEnabled,
  webhookEnabled,
  clientUrl,
  logger,
}) => {
  if (!clientUrl) {
    throw new Error("createPaymentsModule: clientUrl is required. Set CLIENT_URL in .env");
  }

  // ── Use cases ─────────────────────────────────────────────────────────────
  const createPaymentIntent = buildCreatePaymentIntentUseCase({
    paymentGateway, paymentRepository, paymentsEnabled, clientUrl, logger,
  });

  const verifyWebhook = buildVerifyWebhookUseCase({
    paymentGateway, paymentRepository, paymentEventPublisher, webhookEnabled, logger,
  });

  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentGateway, paymentRepository, paymentsEnabled, clientUrl, logger,
  });

  const getPaymentByOrderId = buildGetPaymentByOrderIdUseCase({ paymentRepository });

  // ── Ports ─────────────────────────────────────────────────────────────────
  const commandPort = { createPaymentIntent, verifyWebhook };
  const queryPort   = { getPaymentByOrderId };

  // ── HTTP adapter ──────────────────────────────────────────────────────────
  const controller = createPaymentsHttpController({ commandPort, queryPort });

  const createRoutes = ({ requireAuth } = {}) =>
    createPaymentsRoutes({ controller, requireAuth, webhookEnabled });

  return {
    createRoutes,
    linkPaymentToOrder,  // consumed by orderPlacedPaymentLinkTranslator
  };
};
