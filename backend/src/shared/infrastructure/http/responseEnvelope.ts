import type { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessMeta {
  requestId?: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  meta: SuccessMeta = {},
  status = 200
): void => {
  res.status(status).json({
    success: true,
    data,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  });
};

export const sendCreated = <T>(res: Response, data: T, meta: SuccessMeta = {}): void => {
  sendSuccess(res, data, meta, 201);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).end();
};

export const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): void => {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  meta: SuccessMeta = {}
): void => {
  sendSuccess(res, data, { ...meta, pagination });
};
