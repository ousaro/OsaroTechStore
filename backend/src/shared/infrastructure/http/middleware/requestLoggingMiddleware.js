const routeLabelFor = (req) => {
  if (req.baseUrl && req.route?.path) return `${req.baseUrl}${req.route.path}`;
  return req.path ?? req.originalUrl?.split("?")[0] ?? "unknown";
};

export const createRequestLoggingMiddleware = (logger) => (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const entry = {
      msg: "HTTP request completed",
      requestId: req.requestId,
      method: req.method,
      route: routeLabelFor(req),
      statusCode: res.statusCode,
      latencyMs: Math.round(latencyMs * 100) / 100,
    };

    if (res.statusCode >= 500) {
      logger.error(entry);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(entry);
      return;
    }

    logger.info(entry);
  });

  next();
};
