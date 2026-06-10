import { useEffect, useState } from "react";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";

export function PaymentSuccessPage({ paymentsInputPort, ordersInputPort }) {
  const { navigate } = useNavigate();
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const orderId = params.get("orderId");
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      while (!cancelled && attempts < 10) {
        attempts++;
        const payment = await paymentsInputPort.getPaymentByOrder(orderId);
        if (payment?.paymentStatus === "paid") {
          setPolling(false);
          if (!cancelled) return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setPolling(false);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentsInputPort]);

  return (
    <div className="page-shell">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiCheckCircle size={56} className="text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
        <p className="mt-2 text-ink-muted">
          {polling
            ? "Confirming your payment…"
            : "Your order has been placed and payment confirmed."}
        </p>
        <button className="btn btn-primary btn-lg mt-6" onClick={() => navigate("/profile/orders")}>
          View your orders <FiArrowRight />
        </button>
      </div>
    </div>
  );
}
