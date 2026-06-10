const E = { intent: "/payments/intent", byOrder: (id) => `/payments/order/${id}` };

export function createHttpPaymentRepository({ httpClient }) {
  const adapter = {
    async createIntent(payload, token) {
      return httpClient(E.intent, { method: "POST", body: payload, token });
    },
    async getByOrder(orderId, token) {
      return httpClient(E.byOrder(orderId), { token });
    },
  };
  return adapter;
}
