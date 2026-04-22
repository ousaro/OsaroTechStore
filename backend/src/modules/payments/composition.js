import { env } from "../../config/env.js";
import { buildCreatePaymentIntentUseCase } from "./application/use-cases/createPaymentIntentUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/use-cases/verifyWebhookUseCase.js";
import { buildGetSessionDetailsUseCase } from "./application/use-cases/getSessionDetailsUseCase.js";
import { createPaymentsCommandPort } from "./ports/input/paymentsCommandPort.js";
import { createPaymentsQueryPort } from "./ports/input/paymentsQueryPort.js";
import { createStripeGateway } from "./infrastructure/gateways/stripeGateway.js";
import { createMongoosePaymentRepository } from "./infrastructure/repositories/mongoosePaymentRepository.js";
import { createPaymentsHttpController } from "./infrastructure/http/paymentsHttpController.js";

const paymentGateway = createStripeGateway({
  secretKey: env.stripeSecretKey,
  webhookSecret: env.stripeWebhookSecret,
});
const paymentRepository = createMongoosePaymentRepository();

const createPaymentIntentUseCase = buildCreatePaymentIntentUseCase({
  paymentGateway,
  paymentRepository,
  clientUrl: env.clientUrl,
});
const verifyWebhookUseCase = buildVerifyWebhookUseCase({
  paymentGateway,
  paymentRepository,
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
