import { useNavigate } from "../../../hooks/useNavigate.js";
import { FiXCircle, FiArrowLeft } from "react-icons/fi";

export function PaymentCancelledPage() {
  const { navigate } = useNavigate();

  return (
    <div className="page-shell">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiXCircle size={56} className="text-red-500" />
        <h1 className="mt-4 text-2xl font-bold">Payment cancelled</h1>
        <p className="mt-2 text-ink-muted">
          Your payment was not completed. Your order is saved and you can try again.
        </p>
        <button
          className="btn btn-primary btn-lg mt-6"
          onClick={() => navigate("/checkout")}
        >
          Return to checkout <FiArrowLeft />
        </button>
      </div>
    </div>
  );
}
