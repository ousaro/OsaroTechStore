const env = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "/api",
  stripePublicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
};

export default env;
