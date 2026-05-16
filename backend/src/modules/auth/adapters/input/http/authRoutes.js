import { Router } from "express";
import { resolveOAuthStrategies } from "../../output/oauth/oauthProviderRegistry.js";

const createRateLimitMiddleware = ({ windowMs = 60_000, max = 20 } = {}) => {
  const hitsByKey = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown";
    const hit = hitsByKey.get(key);

    if (!hit || hit.resetAt <= now) {
      hitsByKey.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    hit.count += 1;
    if (hit.count > max) {
      return res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many authentication attempts. Please try again later.",
        },
      });
    }

    return next();
  };
};

export const createAuthRoutes = ({ controller, requireAuth, oauthProviders, clientUrl }) => {
  const router = Router();
  const authRateLimit = createRateLimitMiddleware();

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
