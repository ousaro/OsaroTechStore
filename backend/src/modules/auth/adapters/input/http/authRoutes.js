import { Router } from "express";
import { resolveOAuthStrategies } from "../../output/oauth/oauthProviderRegistry.js";

export const createAuthRoutes = ({ controller, requireAuth, oauthProviders, clientUrl }) => {
  const router = Router();

  router.post("/register", controller.registerUser);
  router.post("/login", controller.loginUser);

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
