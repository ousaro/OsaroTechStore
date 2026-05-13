import { PaymentEvents } from "./domain/events/PaymentEvents.js";
import { assertInputPort } from "../../shared/kernel/assertions/portAssertions.js";

export function createPaymentsModule({ payments: repo, sessionStore, eventBus, notify }) {
  const tok = () => sessionStore.get()?.token;

  async function initiatePayment(payload) {
    const { ok, data, error } = await repo.createIntent(payload, tok());
    if (!ok) { notify.error(error || "Payment init failed"); throw new Error(error); }
    eventBus.publish(PaymentEvents.initiated(data));
    return data; // { url, ... }
  }

  async function getPaymentByOrder(orderId) {
    const { ok, data } = await repo.getByOrder(orderId, tok());
    return ok ? data : null;
  }

  const inputPort = { initiatePayment, getPaymentByOrder };
  assertInputPort("PaymentsInputPort", inputPort, ["initiatePayment","getPaymentByOrder"]);
  return inputPort;
}
