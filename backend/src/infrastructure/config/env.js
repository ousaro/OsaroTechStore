import dotenv from "dotenv";

dotenv.config();

const parseProviderList = (value) => {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map((provider) => provider.trim().toLowerCase()).filter(Boolean))];
};

const buildOAuthProviderConfig = ({
  enabledProviders,
  providerName,
  clientId,
  clientSecret,
  callbackUrl,
}) => ({
  enabled: enabledProviders.includes(providerName),
  configured: Boolean(clientId && clientSecret && callbackUrl),
  clientId,
  clientSecret,
  callbackUrl,
});

if (process.env.NODE_ENV === "test") {
  process.env.DATABASE_PROVIDER ||= "mongo";
  process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/osarotechstore-test";
  process.env.SESSION_SECRET ||= "test-session-secret";
  process.env.TOKEN_SECRET ||= "test-token-secret";
  process.env.GOOGLE_CLIENT_ID ||= "test-google-client-id";
  process.env.GOOGLE_CLIENT_SECRET ||= "test-google-client-secret";
  process.env.CALLBACK_URL ||= "http://localhost:5000/api/users/auth/google/callback";
  process.env.CLIENT_URL ||= "http://localhost:3000";
}

const databaseProvider = (process.env.DATABASE_PROVIDER || "mongo").trim().toLowerCase();
const required = ["SESSION_SECRET", "TOKEN_SECRET"];

if (databaseProvider === "mongo") {
  required.unshift("MONGO_URI");
}

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECTET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const databaseConnectionByProvider = {
  mongo: process.env.MONGO_URI || "",
  postgres: process.env.POSTGRES_URL || process.env.DATABASE_URL || "",
  h2: process.env.H2_URL || "",
};
const selectedAuthProviders = parseProviderList(process.env.AUTH_PROVIDERS);
const defaultAuthProviders = [
  "credentials",
  ...(process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.CALLBACK_URL
    ? ["google"]
    : []),
];
const authProviders =
  selectedAuthProviders.length > 0
    ? [...new Set(["credentials", ...selectedAuthProviders])]
    : defaultAuthProviders;
const oauthProviders = {
  google: buildOAuthProviderConfig({
    enabledProviders: authProviders,
    providerName: "google",
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.CALLBACK_URL || "",
  }),
  github: buildOAuthProviderConfig({
    enabledProviders: authProviders,
    providerName: "github",
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackUrl: process.env.GITHUB_CALLBACK_URL || "",
  }),
  linkedin: buildOAuthProviderConfig({
    enabledProviders: authProviders,
    providerName: "linkedin",
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL || "",
  }),
};
const paymentProvider = (process.env.PAYMENT_PROVIDER || "stripe").trim().toLowerCase();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseProvider,
  databaseConnection: databaseConnectionByProvider[databaseProvider] || "",
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  sessionSecret: process.env.SESSION_SECRET,
  tokenSecret: process.env.TOKEN_SECRET,
  authProviders,
  externalAuthProviders: authProviders.filter((provider) => provider !== "credentials"),
  oauthProviders,
  stripeSecretKey,
  stripeWebhookSecret,
  paymentProvider,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.CALLBACK_URL || "",
  googleOAuthEnabled: oauthProviders.google.enabled && oauthProviders.google.configured,
  stripePaymentsEnabled: paymentProvider === "stripe" && Boolean(stripeSecretKey),
  stripeWebhookEnabled: paymentProvider === "stripe" && Boolean(stripeSecretKey && stripeWebhookSecret),
};
