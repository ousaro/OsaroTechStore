import { PaymentEvents } from "./model/PaymentEvents.js";

export function createPaymentsModule({ payments: repo, sessionStore, eventBus, notify }) {
  const tok = () => sessionStore.get()?.token;

  async function initiatePayment(payload) {
    const { ok, data, error } = await repo.createIntent(payload, tok());
    if (!ok) { notify.error(error || "Payment init failed"); throw new Error(error); }
    eventBus.publish(PaymentEvents.initiated(data));
    return data;
  }

  async function getPaymentByOrder(orderId) {
    const { ok, data } = await repo.getByOrder(orderId, tok());
    return ok ? data : null;
  }

  const inputPort = { initiatePayment, getPaymentByOrder };  return inputPort;
}
