import router from "express";
import { env } from "../../../../../infrastructure/config/env.js";
import {
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} from "./httpHandlers.js";
import { setupGooglePassport } from "../../output/oauth/googlePassport.js";

const googleOauthUnavailable = (_req, res) =>
  res.status(503).json({ message: "Google OAuth is not configured for this environment" });
const registerUserHttpHandler = (req, res, next) => registerUserHandler(req, res, next);
const loginUserHttpHandler = (req, res, next) => loginUserHandler(req, res, next);
const googleCallbackHttpHandler = (req, res, next) => googleCallbackHandler(req, res, next);

export const createAuthRoutes = ({
  googleOAuthEnabled = env.googleOAuthEnabled,
  googleClientId = env.googleClientId,
  googleClientSecret = env.googleClientSecret,
  googleCallbackUrl = env.googleCallbackUrl,
  clientUrl = env.clientUrl,
} = {}) => {
  const authRoutes = router();

  authRoutes.post("/register", registerUserHttpHandler);
  authRoutes.post("/login", loginUserHttpHandler);

  if (googleOAuthEnabled) {
    const passport = setupGooglePassport({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      callbackUrl: googleCallbackUrl,
    });

    authRoutes.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    authRoutes.get(
      "/google/callback",
      passport.authenticate("google", { failureRedirect: `${clientUrl}/login` }),
      googleCallbackHttpHandler
    );
  } else {
    authRoutes.get("/google", googleOauthUnavailable);
    authRoutes.get("/google/callback", googleOauthUnavailable);
  }

  return authRoutes;
};

export default createAuthRoutes();
