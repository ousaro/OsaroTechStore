import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutPage } from "./CheckoutPage.jsx";

var mockUseCartValue = {
  cart: { isEmpty: false, lines: [{ productId: "p1", quantity: 2 }] },
};
const mockProducts = [
  { id: "p1", name: "Keyboard", price: { currency: "$", amount: 99 }, primaryImage: "", stock: 5 },
];
const mockProfile = {
  address: "123 Main St",
  city: "NYC",
  state: "NY",
  postalCode: "10001",
  country: "US",
  phone: "+1 555-0000",
};
const mockOrdersInputPort = { placeOrder: jest.fn() };
const mockPaymentsInputPort = { initiatePayment: jest.fn() };

jest.mock("../../users/hooks/useUsers.js", () => ({
  useUsers: () => ({ profile: mockProfile }),
}));
jest.mock("../../cart/hooks/useCart.js", () => ({
  useCart: () => mockUseCartValue,
}));
jest.mock("../../products/hooks/useProducts.js", () => ({
  useProducts: () => ({ products: mockProducts }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCartValue = {
    cart: { isEmpty: false, lines: [{ productId: "p1", quantity: 2 }] },
  };
});

test("renders checkout form with delivery address fields", () => {
  render(
    <CheckoutPage ordersInputPort={mockOrdersInputPort} paymentsInputPort={mockPaymentsInputPort} />
  );
  expect(screen.getByText("Review and pay")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("123 Main Street")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Casablanca")).toHaveValue("NYC");
});

test("shows error when placeOrder fails", async () => {
  const user = userEvent.setup();
  mockOrdersInputPort.placeOrder.mockRejectedValue(new Error("Order failed"));
  render(
    <CheckoutPage ordersInputPort={mockOrdersInputPort} paymentsInputPort={mockPaymentsInputPort} />
  );
  await user.click(screen.getByRole("button", { name: /pay/i }));
  expect(await screen.findByText(/order failed/i)).toBeInTheDocument();
});

test("disables pay button when cart is empty", () => {
  mockUseCartValue = { cart: { isEmpty: true, lines: [] } };
  render(
    <CheckoutPage ordersInputPort={mockOrdersInputPort} paymentsInputPort={mockPaymentsInputPort} />
  );
  expect(screen.getByRole("button", { name: /pay/i })).toBeDisabled();
});
