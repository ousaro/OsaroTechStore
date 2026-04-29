/**
 * requestIdMiddleware.
 *
 * Attaches a unique requestId to every incoming request.
 * Echoes the id back in the X-Request-Id response header.
 * Downstream: logger reads req.requestId to correlate log lines.
 *
 * Accepts X-Request-Id from the client (e.g. from a gateway / load balancer)
 * to preserve the ID across a distributed system.
 */
import { randomUUID } from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};
