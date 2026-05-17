import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    product_list_failures: ["rate<0.01"],
  },
};

const productListFailureRate = new Rate("product_list_failures");
const productListTrend = new Trend("product_list_duration");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has products array": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  productListFailureRate.add(res.status !== 200);
  productListTrend.add(res.timings.duration);

  sleep(0.5);
}
