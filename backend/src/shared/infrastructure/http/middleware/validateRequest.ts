import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const details = (
          error as unknown as { issues: Array<{ path: (string | number)[]; message: string }> }
        ).issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        res.status(400).json({ error: "Validation failed", details });
        return;
      }
      next(error);
    }
  };
};
