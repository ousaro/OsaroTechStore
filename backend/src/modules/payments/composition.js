import { env } from "../../config/env.js";
import { buildCreatePaymentIntentUseCase } from "./application/use-cases/createPaymentIntentUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/use-cases/verifyWebhookUseCase.js";
import { buildGetSessionDetailsUseCase } from "./application/use-cases/getSessionDetailsUseCase.js";
import { createPaymentsInputPort } from "./ports/input/paymentsInputPort.js";
import { createStripeGateway } from "./infrastructure/gateways/stripeGateway.js";
import { createPaymentsHttpController } from "./infrastructure/http/paymentsHttpController.js";

const paymentGateway = createStripeGateway({
  secretKey: env.stripeSecretKey,
  webhookSecret: env.stripeWebhookSecret,
});

const createPaymentIntentUseCase = buildCreatePaymentIntentUseCase({
  paymentGateway,
  clientUrl: env.clientUrl,
});
const verifyWebhookUseCase = buildVerifyWebhookUseCase({ paymentGateway });
const getSessionDetailsUseCase = buildGetSessionDetailsUseCase({ paymentGateway });
const paymentsInputPort = createPaymentsInputPort({
  createPaymentIntent: createPaymentIntentUseCase,
  verifyWebhook: verifyWebhookUseCase,
  getSessionDetails: getSessionDetailsUseCase,
});

export const {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} = createPaymentsHttpController({
  paymentsInputPort,
});
