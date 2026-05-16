import { env } from "./env.js";

export async function httpClient(endpoint, { method = "GET", body, token, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    const error = data?.error || data?.message || (!response.ok ? "Request failed" : null);

    return { data, error, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: error?.message || "Network request failed",
      ok: false,
      status: 0,
    };
  }
}
