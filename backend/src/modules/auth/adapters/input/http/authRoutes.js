import router from "express";
import { env } from "../../../../../infrastructure/config/env.js";
import {
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} from "./httpHandlers.js";
import { resolveOAuthStrategies } from "../../output/oauth/oauthProviderRegistry.js";
const registerUserHttpHandler = (req, res, next) => registerUserHandler(req, res, next);
const loginUserHttpHandler = (req, res, next) => loginUserHandler(req, res, next);
const externalAuthCallbackHttpHandler = (req, res, next) => googleCallbackHandler(req, res, next);

export const createAuthRoutes = ({
  oauthProviders = env.oauthProviders,
  clientUrl = env.clientUrl,
} = {}) => {
  const authRoutes = router();

  authRoutes.post("/register", registerUserHttpHandler);
  authRoutes.post("/login", loginUserHttpHandler);

  const oauthStrategies = resolveOAuthStrategies({
    oauthProviders,
    clientUrl,
    callbackHandler: externalAuthCallbackHttpHandler,
  });

  for (const strategy of oauthStrategies) {
    authRoutes.get(`/${strategy.name}`, strategy.authenticateHandler);

    if (Array.isArray(strategy.callbackHandler)) {
      authRoutes.get(`/${strategy.name}/callback`, ...strategy.callbackHandler);
    } else {
      authRoutes.get(`/${strategy.name}/callback`, strategy.callbackHandler);
    }
  }

  return authRoutes;
};

export default createAuthRoutes();
