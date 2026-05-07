import express from "express";

const okCheck = (name, details = {}) => ({ name, status: "ok", ...details });
const failCheck = (name, error) => ({
  name,
  status: "fail",
  error: error?.message ?? "Health check failed",
});

const runCheck = async ({ name, check }) => {
  try {
    const details = await check();
    return okCheck(name, details);
  } catch (error) {
    return failCheck(name, error);
  }
};

const hasFailedCheck = (checks) => checks.some((check) => check.status === "fail");

export const createHealthRoutes = ({
  healthChecks = [],
  serviceName = "osaro-tech-store-backend",
  version = "unknown",
} = {}) => {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: serviceName,
      version,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/ready", async (_req, res) => {
    const checks = await Promise.all(healthChecks.map(runCheck));
    const status = hasFailedCheck(checks) ? "fail" : "ok";

    res.status(status === "ok" ? 200 : 503).json({
      status,
      service: serviceName,
      version,
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};
