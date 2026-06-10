/* global __ENV */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    search_failures: ["rate<0.01"],
  },
};

const searchFailureRate = new Rate("search_failures");
const searchTrend = new Trend("search_duration");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const searchTerms = ["phone", "keyboard", "mouse", "monitor", "laptop", "headphones", "cable"];

export default function () {
  const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const res = http.get(`${BASE_URL}/api/products?limit=20&offset=0`, {
    tags: { searchTerm: term },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is valid JSON": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  searchFailureRate.add(res.status !== 200);
  searchTrend.add(res.timings.duration);

  sleep(0.3);
}
