import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentCancelledPage } from "./PaymentCancelledPage.jsx";

const mockNavigate = jest.fn();

jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders cancellation message", () => {
  render(<PaymentCancelledPage />);
  expect(screen.getByText("Payment cancelled")).toBeInTheDocument();
});

test("navigates back to checkout on button click", async () => {
  const user = userEvent.setup();
  render(<PaymentCancelledPage />);
  await user.click(screen.getByText(/return to checkout/i));
  expect(mockNavigate).toHaveBeenCalledWith("/checkout");
});
