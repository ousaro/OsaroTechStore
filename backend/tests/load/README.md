# Load Tests

This directory contains k6 load test scripts for the Osaro Tech Store API.

## Prerequisites

Install k6: https://k6.io/docs/getting-started/installation/

## Running Individual Scripts

```bash
# Product listing
k6 run tests/load/productList.js

# Product search
k6 run tests/load/productSearch.js

# Auth flow (register + login + profile)
k6 run tests/load/authFlow.js

# Checkout flow (order + payment intent)
k6 run tests/load/checkoutFlow.js
```

## Running All Scenarios

```bash
k6 run tests/load/scenarios.js
```

## Specifying a Different Base URL

```bash
k6 run -e BASE_URL=http://localhost:5000 tests/load/productList.js
```

## CI Integration

Load tests run via GitHub Actions using `grafana/k6-action`. See `.github/workflows/load-test.yml`.

## Performance Budgets

| Endpoint | p95 Latency Budget |
|----------|-------------------|
| GET /api/products | <500ms |
| GET /api/products?limit=20 | <500ms |
| POST /api/auth/register | <500ms |
| POST /api/auth/login | <500ms |
| GET /api/users/me | <500ms |
| POST /api/orders | <2s |
| POST /api/payments/intent | <2s |
