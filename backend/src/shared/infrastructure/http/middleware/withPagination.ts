import { parsePagination, type PaginationParams } from "../../../application/pagination.js";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
    }
  }
}

export const withPagination = (req: Request, _res: Response, next: NextFunction): void => {
  req.pagination = parsePagination(req.query as Record<string, unknown>);
  next();
};
