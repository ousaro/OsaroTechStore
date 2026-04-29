/**
 * HTTP Error Code Mapping.
 *
 * Maps domain/application error .code values to HTTP status codes.
 * This is the ONLY place that couples domain errors to HTTP semantics.
 * The mapping lives in infrastructure — domain and application layers
 * never reference HTTP status codes.
 */

export const HTTP_STATUS_BY_ERROR_CODE = Object.freeze({
  // 400 — client sent bad data
  VALIDATION: 400,
  INVALID_INPUT: 400,

  // 401 — not authenticated
  UNAUTHORIZED: 401,

  // 403 — authenticated but not allowed
  FORBIDDEN: 403,

  // 404 — resource not found
  NOT_FOUND: 404,

  // 409 — business rule conflict
  CONFLICT: 409,

  // 503 — dependency unavailable
  SERVICE_UNAVAILABLE: 503,
});

export const DEFAULT_HTTP_STATUS = 500;
