import { Router } from "express";
import rateLimit from "express-rate-limit";
import { resolveOAuthStrategies } from "../../output/oauth/oauthProviderRegistry.js";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts. Please try again later.",
    },
  },
});

export const createAuthRoutes = ({ controller, requireAuth, oauthProviders, clientUrl }) => {
  const router = Router();

  router.post("/register", authRateLimit, controller.registerUser);
  router.post("/login", authRateLimit, controller.loginUser);

  router.get("/users", requireAuth, requireAuth.requireAdmin, controller.listUsers);
  router.get("/users/:id", requireAuth, requireAuth.requireAdmin, controller.getUser);
  router.put("/users/:id", requireAuth, requireAuth.requireAdmin, controller.updateUser);
  router.delete("/users/:id", requireAuth, requireAuth.requireAdmin, controller.deleteUser);

  const oauthStrategies = resolveOAuthStrategies({
    oauthProviders,
    clientUrl,
    callbackHandler: controller.oauthCallback,
  });

  for (const strategy of oauthStrategies) {
    router.get(`/${strategy.name}`, strategy.authenticateHandler);
    if (Array.isArray(strategy.callbackHandler)) {
      router.get(`/${strategy.name}/callback`, ...strategy.callbackHandler);
    } else {
      router.get(`/${strategy.name}/callback`, strategy.callbackHandler);
    }
  }

  return router;
};
