import { env } from "../../infrastructure/config/env.js";
import { buildCreatePaymentIntentUseCase } from "./application/commands/createPaymentIntentUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "./application/commands/linkPaymentToOrderUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/commands/verifyWebhookUseCase.js";
import { buildGetSessionDetailsUseCase } from "./application/queries/getSessionDetailsUseCase.js";
import { createPaymentsCommandPort } from "./ports/input/paymentsCommandPort.js";
import { createPaymentsQueryPort } from "./ports/input/paymentsQueryPort.js";
import { createStripeGateway } from "./adapters/output/gateways/stripeGateway.js";
import { createMongoosePaymentRepository } from "./adapters/output/repositories/mongoosePaymentRepository.js";
import { createPaymentsHttpController } from "./adapters/input/http/paymentsHttpController.js";

const paymentGateway = createStripeGateway({
  secretKey: env.stripeSecretKey,
  webhookSecret: env.stripeWebhookSecret,
});
const paymentRepository = createMongoosePaymentRepository();
const defaultPaymentEventPublisher = null;

export const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
  paymentRepository,
});
const buildPaymentsModule = ({
  paymentEventPublisher = defaultPaymentEventPublisher,
} = {}) => {
  const createPaymentIntentUseCase = buildCreatePaymentIntentUseCase({
    paymentGateway,
    paymentRepository,
    clientUrl: env.clientUrl,
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

  return createPaymentsHttpController({
    paymentsCommandPort,
    paymentsQueryPort,
  });
};

export let createPaymentIntentHandler;
export let stripeWebhookHandler;
export let getSessionDetailsHandler;

export const configurePaymentsModule = (options = {}) => {
  ({
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  } = buildPaymentsModule(options));
};

configurePaymentsModule();
