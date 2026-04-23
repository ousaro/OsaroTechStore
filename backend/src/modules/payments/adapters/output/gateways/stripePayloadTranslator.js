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
    provider: "stripe",
    workflowType: "redirect_session",
    ...(rawSession.url ? { url: rawSession.url } : {}),
    ...(rawSession.payment_intent
      ? { providerPaymentId: rawSession.payment_intent }
      : {}),
    ...(
      rawSession.payment_status !== undefined || rawSession.paymentStatus !== undefined
        ? {
            providerStatus:
              rawSession.payment_status ?? rawSession.paymentStatus,
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
  const id = event?.data?.object?.id;
  const providerPaymentId = event?.data?.object?.payment_intent;
  const occurredAt =
    typeof event?.created === "number"
      ? new Date(event.created * 1000)
      : new Date();

  if (
    !stateChange?.paymentStatus ||
    typeof eventId !== "string" ||
    eventId.trim() === "" ||
    typeof id !== "string" ||
    id.trim() === ""
  ) {
    return null;
  }

  return {
    eventId,
    id,
    sessionId: id,
    provider: "stripe",
    workflowType: "redirect_session",
    ...(providerPaymentId ? { providerPaymentId } : {}),
    ...(event?.data?.object?.payment_status
      ? { providerStatus: event.data.object.payment_status }
      : {}),
    occurredAt,
    paymentStatus: stateChange.paymentStatus,
    ...(stateChange.paymentOutcome
      ? { paymentOutcome: stateChange.paymentOutcome }
      : {}),
  };
};
