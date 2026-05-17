import { createHttpPaymentRepository } from "./paymentsApi.js";

const mockHttpClient = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("createIntent sends POST to /payments/intent with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { url: "https://checkout.stripe.com" } });
  const repo = createHttpPaymentRepository({ httpClient: mockHttpClient });
  const payload = { orderId: "o1", currency: "USD", items: [] };
  await repo.createIntent(payload, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/payments/intent", { method: "POST", body: payload, token: "tok-1" });
});

test("getByOrder fetches /payments/order/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { paymentStatus: "paid" } });
  const repo = createHttpPaymentRepository({ httpClient: mockHttpClient });
  await repo.getByOrder("o1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/payments/order/o1", { token: "tok-1" });
});
