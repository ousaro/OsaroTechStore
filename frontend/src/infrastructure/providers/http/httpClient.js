/**
 * INFRASTRUCTURE — HTTP client provider
 *
 * The only file that calls fetch(). All repository output adapters
 * call this — they do not call fetch directly.
 */
import { env } from "../../config/env.js";

export async function httpClient(endpoint, { method = "GET", body, token, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return { data, ok: response.ok, status: response.status };
}
