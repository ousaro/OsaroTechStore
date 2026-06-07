import type { Request, Response, NextFunction } from "express";
import type { IdempotencyStore } from "../../persistence/idempotencyStore.js";
import { randomUUID } from "crypto";

export const createIdempotencyMiddleware = (store: IdempotencyStore) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
      next();
      return;
    }

    const key = (req.headers["idempotency-key"] as string) ?? randomUUID();
    res.setHeader("Idempotency-Key", key);

    try {
      if (await store.isProcessed(key)) {
        res.status(409).json({
          success: false,
          error: {
            code: "IDEMPOTENCY_CONFLICT",
            message: `Request with idempotency key "${key}" has already been processed`,
          },
        });
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = function (body: unknown): Response {
        store.markProcessed(key).catch(() => {});
        return originalJson(body);
      } as typeof res.json;

      next();
    } catch {
      next();
    }
  };
};
