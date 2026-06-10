/* global __ENV, __VU */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

export const options = {
  vus: 5,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    auth_failures: ["rate<0.01"],
    login_failures: ["rate<0.01"],
    profile_failures: ["rate<0.01"],
  },
};

const authFailureRate = new Rate("auth_failures");
const loginFailureRate = new Rate("login_failures");
const profileFailureRate = new Rate("profile_failures");
const registerTrend = new Trend("register_duration");
const loginTrend = new Trend("login_duration");
const profileTrend = new Trend("profile_duration");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export default function () {
  const userId = `k6user${__VU}_${Date.now()}`;

  const registerPayload = JSON.stringify({
    firstName: `Load${userId}`,
    lastName: "Tester",
    email: `${userId}@loadtest.example`,
    password: "Password123!",
  });

  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { "Content-Type": "application/json" },
  });

  const registerOk = check(registerRes, {
    "register status is 201": (r) => r.status === 201,
    "register returns token": (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.token === "string" && body.token.length > 20;
      } catch {
        return false;
      }
    },
  });

  authFailureRate.add(!registerOk);
  registerTrend.add(registerRes.timings.duration);

  if (!registerOk) {
    sleep(1);
    return;
  }

  let token;
  try {
    token = JSON.parse(registerRes.body).token;
  } catch {
    sleep(1);
    return;
  }

  const loginPayload = JSON.stringify({
    email: `${userId}@loadtest.example`,
    password: "Password123!",
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });

  const loginOk = check(loginRes, {
    "login status is 200": (r) => r.status === 200,
    "login returns token": (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.token === "string" && body.token.length > 20;
      } catch {
        return false;
      }
    },
  });

  loginFailureRate.add(!loginOk);
  loginTrend.add(loginRes.timings.duration);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const profileRes = http.get(`${BASE_URL}/api/users/me`, authHeader);

  const profileOk = check(profileRes, {
    "profile status is 200": (r) => r.status === 200,
    "profile belongs to user": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.email === `${userId}@loadtest.example`;
      } catch {
        return false;
      }
    },
  });

  profileFailureRate.add(!profileOk);
  profileTrend.add(profileRes.timings.duration);

  sleep(1);
}
