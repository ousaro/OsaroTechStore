import { env } from "../../infrastructure/config/env.js";
import { buildCreatePaymentIntentUseCase } from "./application/commands/createPaymentIntentUseCase.js";
import { buildLinkPaymentToOrderUseCase } from "./application/commands/linkPaymentToOrderUseCase.js";
import { buildVerifyWebhookUseCase } from "./application/commands/verifyWebhookUseCase.js";
import { buildGetSessionDetailsUseCase } from "./application/queries/getSessionDetailsUseCase.js";
import { createPaymentsCommandPort } from "./ports/input/paymentsCommandPort.js";
import { createPaymentsQueryPort } from "./ports/input/paymentsQueryPort.js";
import { createPaymentsHttpController } from "./adapters/input/http/paymentsHttpController.js";

const defaultPaymentEventPublisher = null;

export const createPaymentsModule = ({
  paymentGateway,
  paymentRepository,
  paymentEventPublisher = defaultPaymentEventPublisher,
  clientUrl = env.clientUrl,
} = {}) => {
  const linkPaymentToOrder = buildLinkPaymentToOrderUseCase({
    paymentRepository,
  });
  const createPaymentIntentUseCase = buildCreatePaymentIntentUseCase({
    paymentGateway,
    paymentRepository,
    clientUrl,
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

  return {
    ...createPaymentsHttpController({
      paymentsCommandPort,
      paymentsQueryPort,
    }),
    linkPaymentToOrder,
  };
};

export let createPaymentIntentHandler;
export let stripeWebhookHandler;
export let getSessionDetailsHandler;

let paymentsModule;

const getConfiguredPaymentsModule = () => {
  if (!paymentsModule) {
    throw new Error("Payments module has not been configured");
  }

  return paymentsModule;
};

export const linkPaymentToOrder = (...args) =>
  getConfiguredPaymentsModule().linkPaymentToOrder(...args);

export const configurePaymentsModule = (options = {}) => {
  paymentsModule = createPaymentsModule(options);
  ({
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  } = paymentsModule);
};
