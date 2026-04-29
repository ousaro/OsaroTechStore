/**
 * Auth Routes Factory.
 * Fixed: no longer exports a default pre-built router (was causing singleton coupling).
 * The composition root calls createRoutes({ requireAuth }) explicitly.
 */
import { Router } from "express";
import { resolveOAuthStrategies } from "../../output/oauth/oauthProviderRegistry.js";

export const createAuthRoutes = ({ controller, requireAuth, oauthProviders, clientUrl }) => {
  const router = Router();

  // Public routes
  router.post("/register", controller.registerUser);
  router.post("/login",    controller.loginUser);

  // Admin routes (protected)
  router.get("/users",         requireAuth, controller.listUsers);
  router.get("/users/:id",     requireAuth, controller.getUser);
  router.put("/users/:id",     requireAuth, controller.updateUser);
  router.delete("/users/:id",  requireAuth, controller.deleteUser);

  // OAuth routes
  const oauthStrategies = resolveOAuthStrategies({
    oauthProviders,
    clientUrl,
    callbackHandler: controller.googleCallbackHandler,
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
