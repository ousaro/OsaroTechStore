export const buildCreatePaymentIntentUseCase = ({ paymentGateway, clientUrl }) => {
  return async ({ items }) => {
    const session = await paymentGateway.createCheckoutSession({
      items,
      successUrl: `${clientUrl}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientUrl}/Cart`,
    });

    return { url: session.url };
  };
};
