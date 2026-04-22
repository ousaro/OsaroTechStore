export const toCheckoutSessionRecord = (rawSession) => {
  if (!rawSession) {
    return null;
  }

  return {
    id: rawSession.id,
    ...(rawSession.url ? { url: rawSession.url } : {}),
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
