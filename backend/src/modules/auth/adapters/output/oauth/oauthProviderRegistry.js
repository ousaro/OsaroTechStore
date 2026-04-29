import { setupGooglePassport } from "./googlePassport.js";

const LABELS = Object.freeze({ google: "Google", github: "GitHub", linkedin: "LinkedIn" });

const unavailableHandler = (label) => (_req, res) =>
  res.status(503).json({ message: `${label} OAuth is not configured` });

const createGoogleStrategy = ({ config, clientUrl, callbackHandler }) => {
  if (!(config?.enabled && config?.configured)) {
    return { name: "google", authenticateHandler: unavailableHandler("Google"), callbackHandler: unavailableHandler("Google") };
  }
  const passport = setupGooglePassport({
    clientId: config.clientId, clientSecret: config.clientSecret, callbackUrl: config.callbackUrl,
  });
  return {
    name: "google",
    authenticateHandler: passport.authenticate("google", { scope: ["profile", "email"] }),
    callbackHandler: [
      passport.authenticate("google", { failureRedirect: `${clientUrl}/login` }),
      callbackHandler,
    ],
  };
};

const unsupported = (name) => ({
  name, authenticateHandler: unavailableHandler(LABELS[name] ?? name), callbackHandler: unavailableHandler(LABELS[name] ?? name),
});

export const resolveOAuthStrategies = ({ oauthProviders, clientUrl, callbackHandler }) => [
  createGoogleStrategy({ config: oauthProviders?.google, clientUrl, callbackHandler }),
  unsupported("github"),
  unsupported("linkedin"),
];
