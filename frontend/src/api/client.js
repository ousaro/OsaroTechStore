import { env } from "./env.js";
import { getErrorMessage } from "../lib/errorUtils.js";

function normalizeApiError(error, fallback = "Request failed") {
  return getErrorMessage(error, fallback);
}

function isRawRequestBody(body) {
  return (
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof FormData !== "undefined" && body instanceof FormData)
  );
}

export async function httpClient(endpoint, { method = "GET", body, token, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  const rawBody = isRawRequestBody(body);
  if (body !== undefined && !rawBody) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? (rawBody ? body : JSON.stringify(body)) : undefined,
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text ? { message: text } : null;
    }
    const error = !response.ok ? normalizeApiError(data?.error || data?.message) : null;

    return { data, error, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: normalizeApiError(error, "Network request failed"),
      ok: false,
      status: 0,
    };
  }
}
