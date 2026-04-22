const WEBHOOK_STATE_CHANGE_BY_EVENT_TYPE = {
  "checkout.session.completed": { paymentStatus: "paid" },
  "checkout.session.async_payment_failed": { paymentStatus: "failed" },
  "checkout.session.expired": {
    paymentStatus: "failed",
    paymentOutcome: "expired",
  },
};

export const toStripeCheckoutSessionDto = (rawSession) => {
  if (!rawSession) {
    return null;
  }

  return {
    id: rawSession.id,
    ...(rawSession.url ? { url: rawSession.url } : {}),
    ...(rawSession.payment_intent
      ? { providerTransactionId: rawSession.payment_intent }
      : {}),
    ...(
      rawSession.payment_status !== undefined || rawSession.paymentStatus !== undefined
        ? {
            paymentStatus:
              rawSession.payment_status ?? rawSession.paymentStatus,
          }
        : {}
    ),
  };
};

export const toStripeWebhookStateChange = (event) => {
  const stateChange = WEBHOOK_STATE_CHANGE_BY_EVENT_TYPE[event?.type];
  const eventId = event?.id;
  const sessionId = event?.data?.object?.id;
  const providerTransactionId = event?.data?.object?.payment_intent;
  const occurredAt =
    typeof event?.created === "number"
      ? new Date(event.created * 1000)
      : new Date();

  if (
    !stateChange?.paymentStatus ||
    typeof eventId !== "string" ||
    eventId.trim() === "" ||
    typeof sessionId !== "string" ||
    sessionId.trim() === ""
  ) {
    return null;
  }

  return {
    eventId,
    sessionId,
    ...(providerTransactionId ? { providerTransactionId } : {}),
    occurredAt,
    paymentStatus: stateChange.paymentStatus,
    ...(stateChange.paymentOutcome
      ? { paymentOutcome: stateChange.paymentOutcome }
      : {}),
  };
};
