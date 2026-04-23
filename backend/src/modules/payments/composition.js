import { env } from "../../infrastructure/config/env.js";
import { buildCreatePaymentIntentUseCase } from "./application/commands/createPaymentIntentUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "./application/commands/linkPaymentToOrderUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/commands/verifyWebhookUseCase.js";
import { buildGetSessionDetailsUseCase } from "./application/queries/getSessionDetailsUseCase.js";
import { createPaymentsCommandPort } from "./ports/input/paymentsCommandPort.js";
import { createPaymentsQueryPort } from "./ports/input/paymentsQueryPort.js";
import { createStripeGateway } from "./adapters/gateways/stripeGateway.js";
import { createMongoosePaymentRepository } from "./adapters/repositories/mongoosePaymentRepository.js";
import { createPaymentsHttpController } from "./adapters/http/paymentsHttpController.js";
import { applicationEventBus } from "../../app/applicationEventBus.js";

const paymentGateway = createStripeGateway({
  secretKey: env.stripeSecretKey,
  webhookSecret: env.stripeWebhookSecret,
});
const paymentRepository = createMongoosePaymentRepository();
const paymentEventPublisher = applicationEventBus;

const createPaymentIntentUseCase = buildCreatePaymentIntentUseCase({
  paymentGateway,
  paymentRepository,
  clientUrl: env.clientUrl,
});
export const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
  paymentRepository,
});
const verifyWebhookUseCase = buildVerifyWebhookUseCase({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher,
});
const getSessionDetailsUseCase = buildGetSessionDetailsUseCase({
  paymentGateway,
  paymentRepository,
});
const paymentsCommandPort = createPaymentsCommandPort({
  createPaymentIntent: createPaymentIntentUseCase,
  verifyWebhook: verifyWebhookUseCase,
});
const paymentsQueryPort = createPaymentsQueryPort({
  getSessionDetails: getSessionDetailsUseCase,
});

export const {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} = createPaymentsHttpController({
  paymentsCommandPort,
  paymentsQueryPort,
});
