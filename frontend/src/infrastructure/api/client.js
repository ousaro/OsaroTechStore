import env from "../../config/env";

const buildHeaders = ({ token, body, headers = {} }) => {
  const nextHeaders = { ...headers };

  if (body !== undefined) {
    nextHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  return nextHeaders;
};

export const apiRequest = async (endpoint, { method = "GET", body, token, headers } = {}) => {
  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    method,
    headers: buildHeaders({ token, body, headers }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return {
    data,
    json: data,
    ok: response.ok,
    status: response.status,
  };
};

export const userToken = (user) => user?.token;
