/**
 * Auth Routes Factory.
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
  // TODO : if should be admin-only, add roles and permissions to the auth system and check them in requireAuth middleware
  router.use(requireAuth);
  router.get("/users",          controller.listUsers);
  router.get("/users/:id",      controller.getUser);
  router.put("/users/:id",      controller.updateUser);
  router.delete("/users/:id",   controller.deleteUser);

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
