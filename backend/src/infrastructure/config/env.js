
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertNonEmptyString } from "../../shared/kernel/assertions/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../../..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const required = (key) => {
  const val = process.env[key];
  assertNonEmptyString(
    val,
    key,
    `[Config] Missing required environment variable: ${key}\n` +
      "Copy .env.example to .env and fill in all required values."
  );
  return val;
};

const optional = (key, fallback = undefined) => process.env[key] ?? fallback;

const optionalBoolean = (key, fallback = false) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return !["false", "0", "no", "off"].includes(String(value).toLowerCase());
};

const buildGoogleOAuthConfig = () => {
  const clientId = optional("GOOGLE_CLIENT_ID");
  const clientSecret = optional("GOOGLE_CLIENT_SECRET");
  const callbackUrl = optional("GOOGLE_CALLBACK_URL");
  const configured = Boolean(clientId && clientSecret && callbackUrl);
  const enabled = optional("GOOGLE_OAUTH_ENABLED", "false") === "true";

  return { clientId, clientSecret, callbackUrl, configured, enabled };
};

export const env = Object.freeze({
  serviceName: optional("SERVICE_NAME", "osaro-tech-store-backend"),
  appVersion: optional("APP_VERSION", "2.0.0"),
  nodeEnv: optional("NODE_ENV", "development"),
  port: parseInt(optional("PORT", "5000"), 10),

  loggerProvider: optional("LOGGER_PROVIDER", "console"),

  no_color: optionalBoolean("NO_COLOR", false),
  loggerTimestampFormat: optional("LOGGER_TIMESTAMP_FORMAT", "YYYY-MM-DD HH:mm:ss.SSS"),
  loggerTimestampEnabled: optionalBoolean("LOGGER_TIMESTAMP_ENABLED", true),

  tokenSecret: required("TOKEN_SECRET"),
  tokenExpiresIn: optional("TOKEN_EXPIRES_IN", "2d"),

  databaseProvider: optional("DATABASE_PROVIDER", "mongo"),
  mongoUri: optional("MONGO_URI"),
  postgresUrl: optional("POSTGRES_URL"),

  paymentProvider: optional("PAYMENT_PROVIDER", "disabled"),
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  paypalClientId: optional("PAYPAL_CLIENT_ID"),
  paypalClientSecret: optional("PAYPAL_CLIENT_SECRET"),

  eventBusProvider: optional("EVENT_BUS_PROVIDER", "inprocess"),
  redisUrl: optional("REDIS_URL"),

  clientUrl: optional("CLIENT_URL", "http://localhost:3000"),

  oauthProviders: {
    google: buildGoogleOAuthConfig(),
  },
});
