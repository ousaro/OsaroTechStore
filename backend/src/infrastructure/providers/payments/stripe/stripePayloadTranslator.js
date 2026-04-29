/**
 * Stripe Payload Translator.
 *
 * Maps raw Stripe API objects → internal payment DTOs.
 * This is the Anti-Corruption Layer between Stripe's data model and ours.
 * All Stripe-specific field names (payment_status, payment_intent) stop here.
 */

const WEBHOOK_STATE_BY_STRIPE_EVENT = Object.freeze({
  "checkout.session.completed":           { paymentStatus: "paid" },
  "checkout.session.async_payment_failed":{ paymentStatus: "failed" },
  "checkout.session.expired":             { paymentStatus: "failed", paymentOutcome: "expired" },
});

export const toStripeCheckoutSessionDto = (rawSession) => {
  if (!rawSession) return null;

  return {
    id: rawSession.id,
    provider: "stripe",
    workflowType: "redirect_session",
    ...(rawSession.url              ? { url: rawSession.url }                           : {}),
    ...(rawSession.payment_intent   ? { providerPaymentId: rawSession.payment_intent }  : {}),
    ...(rawSession.payment_status !== undefined
      ? {
          providerStatus: rawSession.payment_status,
          paymentStatus:  rawSession.payment_status === "paid" ? "paid" : "pending",
        }
      : {}),
  };
};

export const toStripeWebhookStateChange = (event) => {
  const stateChange   = WEBHOOK_STATE_BY_STRIPE_EVENT[event?.type];
  const eventId       = event?.id;
  const sessionObj    = event?.data?.object;
  const id            = sessionObj?.id;
  const occurredAt    = typeof event?.created === "number"
    ? new Date(event.created * 1000)
    : new Date();

  if (!stateChange || !eventId || !id) return null;

  return {
    eventId,
    id,
    sessionId: id,
    provider: "stripe",
    workflowType: "redirect_session",
    ...(sessionObj?.payment_intent  ? { providerPaymentId: sessionObj.payment_intent } : {}),
    ...(sessionObj?.payment_status  ? { providerStatus: sessionObj.payment_status }    : {}),
    occurredAt,
    paymentStatus: stateChange.paymentStatus,
    ...(stateChange.paymentOutcome  ? { paymentOutcome: stateChange.paymentOutcome }   : {}),
  };
};
