import dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV === "test") {
  process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/osarotechstore-test";
  process.env.SESSION_SECRET ||= "test-session-secret";
  process.env.TOKEN_SECRET ||= "test-token-secret";
  process.env.GOOGLE_CLIENT_ID ||= "test-google-client-id";
  process.env.GOOGLE_CLIENT_SECRET ||= "test-google-client-secret";
  process.env.CALLBACK_URL ||= "http://localhost:5000/api/users/auth/google/callback";
  process.env.CLIENT_URL ||= "http://localhost:3000";
}

const required = ["MONGO_URI", "SESSION_SECRET", "TOKEN_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  sessionSecret: process.env.SESSION_SECRET,
  tokenSecret: process.env.TOKEN_SECRET,
  stripeSecretKey: process.env.STRIPE_SECTET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.CALLBACK_URL || "",
  googleOAuthEnabled: Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.CALLBACK_URL
  ),
  stripePaymentsEnabled: Boolean(process.env.STRIPE_SECTET_KEY),
  stripeWebhookEnabled: Boolean(
    process.env.STRIPE_SECTET_KEY && process.env.STRIPE_WEBHOOK_SECRET
  ),
};
