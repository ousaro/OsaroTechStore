import type { Request, Response, NextFunction } from "express";

const CURRENT_VERSION = "v1";
const DEPRECATED_VERSIONS = new Set();

export const apiVersion = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-API-Version", CURRENT_VERSION);
  next();
};

export const apiDeprecationWarning = (req: Request, res: Response, next: NextFunction): void => {
  const versionMatch = req.path.match(/^\/api\/(v\d+)\//);
  const version = versionMatch?.[1];

  if (version && version !== CURRENT_VERSION) {
    res.setHeader("Sunset", "Sat, 31 Dec 2026 23:59:59 GMT");
    res.setHeader("Deprecation", `version="${version}"`);
    res.setHeader("Link", `</api/${CURRENT_VERSION}>; rel="successor-version"`);
  }

  next();
};

export const API_PREFIX = `/api/${CURRENT_VERSION}`;
