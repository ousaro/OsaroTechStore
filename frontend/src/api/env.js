export const env = Object.freeze({
  apiBaseUrl:      process.env.REACT_APP_API_BASE_URL      || "/api",
  googleAuthUrl:   process.env.REACT_APP_GOOGLE_API_URL    || "/api/auth/google",
  stripePublicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || "",
  nodeEnv:         process.env.NODE_ENV                    || "development",
  isDev:           process.env.NODE_ENV !== "production",
});
