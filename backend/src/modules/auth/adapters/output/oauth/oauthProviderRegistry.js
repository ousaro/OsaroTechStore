import { setupGooglePassport } from "./googlePassport.js";

const LABELS = Object.freeze({
  google: "Google",
});

const unavailableHandler = (label) => (_req, res) =>
  res.status(503).json({ message: `${label} OAuth is not configured` });

const normalizeProviderName = (name) => name.trim().toLowerCase();

const getProviderLabel = (name, config) => config?.label ?? LABELS[name] ?? name;

const createGoogleStrategy = ({ config, clientUrl, callbackHandler }) => {
  const label = getProviderLabel("google", config);

  if (!(config?.enabled && config?.configured)) {
    return {
      name: "google",
      authenticateHandler: unavailableHandler(label),
      callbackHandler: unavailableHandler(label),
    };
  }

  const passport = setupGooglePassport({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    callbackUrl: config.callbackUrl,
  });

  return {
    name: "google",
    authenticateHandler: passport.authenticate("google", { scope: ["profile", "email"] }),
    callbackHandler: [
      passport.authenticate("google", { failureRedirect: `${clientUrl}/#/login` }),
      callbackHandler,
    ],
  };
};

const PROVIDER_FACTORIES = Object.freeze({
  google: createGoogleStrategy,
});

const createUnsupportedStrategy = ({ name, config }) => {
  const label = getProviderLabel(name, config);

  return {
    name,
    authenticateHandler: unavailableHandler(label),
    callbackHandler: unavailableHandler(label),
  };
};

const resolveProviderStrategy = ({ name, config, clientUrl, callbackHandler }) => {
  const normalizedName = normalizeProviderName(name);
  const createStrategy = PROVIDER_FACTORIES[normalizedName] ?? createUnsupportedStrategy;

  return createStrategy({
    name: normalizedName,
    config,
    clientUrl,
    callbackHandler,
  });
};

export const resolveOAuthStrategies = ({ oauthProviders = {}, clientUrl, callbackHandler }) =>
  Object.entries(oauthProviders).map(([name, config]) =>
    resolveProviderStrategy({ name, config, clientUrl, callbackHandler })
  );
