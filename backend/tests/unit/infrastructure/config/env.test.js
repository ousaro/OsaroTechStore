import test from "node:test";
import assert from "node:assert/strict";

const MANAGED_ENV_KEYS = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "APP_VERSION",
  "CLIENT_URL",
  "CORS_ALLOWED_ORIGINS",
  "DATABASE_PROVIDER",
  "EVENT_BUS_PROVIDER",
  "GOOGLE_CALLBACK_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_ENABLED",
  "LOGGER_PROVIDER",
  "LOGGER_TIMESTAMP_ENABLED",
  "LOGGER_TIMESTAMP_FORMAT",
  "MONGO_MAX_POOL_SIZE",
  "MONGO_MIN_POOL_SIZE",
  "MONGO_URI",
  "NO_COLOR",
  "NODE_ENV",
  "PAYMENT_PROVIDER",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PORT",
  "POSTGRES_URL",
  "REDIS_URL",
  "SERVICE_NAME",
  "SESSION_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "TOKEN_EXPIRES_IN",
  "TOKEN_SECRET",
];

const originalEnv = { ...process.env };
let importCounter = 0;

const resetManagedEnv = () => {
  for (const key of MANAGED_ENV_KEYS) delete process.env[key];
  process.env.NODE_ENV = "test";
};

const importEnv = async () => {
  importCounter += 1;
  return import(`../../../../src/infrastructure/config/env.js?test=${importCounter}`);
};

test.afterEach(() => {
  resetManagedEnv();
  Object.assign(process.env, originalEnv);
});

test("env returns required values and documented optional defaults", async () => {
  resetManagedEnv();
  process.env.TOKEN_SECRET = "token-secret";

  const { env } = await importEnv();

  assert.equal(env.tokenSecret, "token-secret");
  assert.equal(env.serviceName, "osaro-tech-store-backend");
  assert.equal(env.appVersion, "2.0.0");
  assert.equal(env.nodeEnv, "test");
  assert.equal(env.port, 5000);
  assert.equal(env.sessionSecret, "development-session-secret-change-in-production");
  assert.equal(env.tokenExpiresIn, "15m");
  assert.equal(env.databaseProvider, "mongo");
  assert.equal(env.paymentProvider, "disabled");
  assert.equal(env.eventBusProvider, "inprocess");
  assert.deepEqual(env.corsAllowedOrigins, ["http://localhost:3000"]);
});

test("env throws a meaningful error when TOKEN_SECRET is missing", async () => {
  resetManagedEnv();

  await assert.rejects(
    importEnv(),
    /\[Config\] Missing required environment variable: TOKEN_SECRET/
  );
});

test("env parses optional booleans from false-like strings", async () => {
  for (const value of ["false", "0", "no", "off"]) {
    resetManagedEnv();
    process.env.TOKEN_SECRET = "token-secret";
    process.env.NO_COLOR = value;
    process.env.LOGGER_TIMESTAMP_ENABLED = value;

    const { env } = await importEnv();

    assert.equal(env.no_color, false);
    assert.equal(env.loggerTimestampEnabled, false);
  }
});

test("env parses optional booleans from true-like strings and defaults", async () => {
  resetManagedEnv();
  process.env.TOKEN_SECRET = "token-secret";
  process.env.NO_COLOR = "yes";
  process.env.LOGGER_TIMESTAMP_ENABLED = "1";

  let imported = await importEnv();

  assert.equal(imported.env.no_color, true);
  assert.equal(imported.env.loggerTimestampEnabled, true);

  resetManagedEnv();
  process.env.TOKEN_SECRET = "token-secret";

  imported = await importEnv();

  assert.equal(imported.env.no_color, false);
  assert.equal(imported.env.loggerTimestampEnabled, true);
});

test("env falls back for invalid integers and trims comma-separated origins", async () => {
  resetManagedEnv();
  process.env.TOKEN_SECRET = "token-secret";
  process.env.PORT = "8080";
  process.env.MONGO_MIN_POOL_SIZE = "not-a-number";
  process.env.MONGO_MAX_POOL_SIZE = "25";
  process.env.CORS_ALLOWED_ORIGINS = " https://app.example.com, ,https://admin.example.com ";

  const { env } = await importEnv();

  assert.equal(env.port, 8080);
  assert.equal(env.mongoMinPoolSize, 2);
  assert.equal(env.mongoMaxPoolSize, 25);
  assert.deepEqual(env.corsAllowedOrigins, [
    "https://app.example.com",
    "https://admin.example.com",
  ]);
});

test("env reports Google OAuth as configured only when all required values exist", async () => {
  resetManagedEnv();
  process.env.TOKEN_SECRET = "token-secret";
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_CALLBACK_URL = "https://api.example.com/auth/google/callback";
  process.env.GOOGLE_OAUTH_ENABLED = "true";

  const { env } = await importEnv();

  assert.deepEqual(env.oauthProviders.google, {
    clientId: "client-id",
    clientSecret: "client-secret",
    callbackUrl: "https://api.example.com/auth/google/callback",
    configured: true,
    enabled: true,
  });
});
