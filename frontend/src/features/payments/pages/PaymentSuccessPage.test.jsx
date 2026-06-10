import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentSuccessPage } from "./PaymentSuccessPage.jsx";

const mockNavigate = jest.fn();
const mockPaymentsInputPort = { getPaymentByOrder: jest.fn() };
const mockOrdersInputPort = {};

jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.location.hash = "#/payment/success?orderId=o1";
});

test("renders success message", () => {
  mockPaymentsInputPort.getPaymentByOrder.mockResolvedValue({ paymentStatus: "paid" });
  render(
    <PaymentSuccessPage
      paymentsInputPort={mockPaymentsInputPort}
      ordersInputPort={mockOrdersInputPort}
    />
  );
  expect(screen.getByText("Payment successful")).toBeInTheDocument();
});

test("navigates to orders page on button click", async () => {
  const user = userEvent.setup();
  mockPaymentsInputPort.getPaymentByOrder.mockResolvedValue({ paymentStatus: "paid" });
  render(
    <PaymentSuccessPage
      paymentsInputPort={mockPaymentsInputPort}
      ordersInputPort={mockOrdersInputPort}
    />
  );
  await user.click(screen.getByText(/view your orders/i));
  expect(mockNavigate).toHaveBeenCalledWith("/profile/orders");
});
