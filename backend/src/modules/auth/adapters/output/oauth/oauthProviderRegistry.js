import { env } from "../../../../../infrastructure/config/env.js";
import { setupGooglePassport } from "./googlePassport.js";

const OAUTH_PROVIDER_LABELS = Object.freeze({
  google: "Google",
  github: "GitHub",
  linkedin: "LinkedIn",
});

const createUnavailableOAuthHandlers = (label) => {
  const handler = (_req, res) =>
    res.status(503).json({ message: `${label} OAuth is not configured for this environment` });

  return {
    authenticateHandler: handler,
    callbackHandler: handler,
  };
};

const createGoogleOAuthStrategy = ({ config, clientUrl, callbackHandler }) => {
  if (!(config.enabled && config.configured)) {
    return {
      name: "google",
      label: OAUTH_PROVIDER_LABELS.google,
      ...createUnavailableOAuthHandlers(OAUTH_PROVIDER_LABELS.google),
    };
  }

  const passport = setupGooglePassport({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    callbackUrl: config.callbackUrl,
  });

  return {
    name: "google",
    label: OAUTH_PROVIDER_LABELS.google,
    authenticateHandler: passport.authenticate("google", { scope: ["profile", "email"] }),
    callbackHandler: [
      passport.authenticate("google", { failureRedirect: `${clientUrl}/login` }),
      callbackHandler,
    ],
  };
};

const createUnsupportedOAuthStrategy = ({ providerName }) => {
  const label = OAUTH_PROVIDER_LABELS[providerName] || providerName;

  return {
    name: providerName,
    label,
    ...createUnavailableOAuthHandlers(label),
  };
};

export const resolveOAuthStrategies = ({
  oauthProviders = env.oauthProviders,
  clientUrl = env.clientUrl,
  callbackHandler,
} = {}) => {
  const googleStrategy = createGoogleOAuthStrategy({
    config: oauthProviders.google,
    clientUrl,
    callbackHandler,
  });

  return [
    googleStrategy,
    createUnsupportedOAuthStrategy({ providerName: "github" }),
    createUnsupportedOAuthStrategy({ providerName: "linkedin" }),
  ];
};
