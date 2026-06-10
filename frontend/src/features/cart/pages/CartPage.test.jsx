import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CartPage } from "./CartPage.jsx";

const defaultUseCart = {
  cart: {
    isEmpty: false,
    count: 2,
    lines: [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ],
  },
  removeFromCart: jest.fn(),
  setQuantity: jest.fn(),
};
var mockUseCartValue = defaultUseCart;
const mockProducts = [
  { id: "p1", name: "Keyboard", price: { currency: "$", amount: 99 }, primaryImage: "", stock: 5 },
  { id: "p2", name: "Mouse", price: { currency: "$", amount: 49 }, primaryImage: "", stock: 10 },
];
const mockNavigate = jest.fn();

jest.mock("../hooks/useCart.js", () => ({
  useCart: () => mockUseCartValue,
}));
jest.mock("../../products/hooks/useProducts.js", () => ({
  useProducts: () => ({ products: mockProducts }),
}));
jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCartValue = defaultUseCart;
});

test("renders cart items with product details and passes axe", async () => {
  const { container } = render(<CartPage />);
  expect(screen.getByText("Keyboard")).toBeInTheDocument();
  expect(screen.getByText("Mouse")).toBeInTheDocument();
  await expect(axe(container)).resolves.toHaveNoViolations();
});

test("displays empty cart when cart is empty", () => {
  mockUseCartValue = {
    cart: { isEmpty: true, count: 0, lines: [] },
    removeFromCart: jest.fn(),
    setQuantity: jest.fn(),
  };
  render(<CartPage />);
  expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
});

test("shows order summary with total", () => {
  render(<CartPage />);
  expect(screen.getByText("Order summary")).toBeInTheDocument();
});

test("navigates to checkout on proceed button click", async () => {
  const user = userEvent.setup();
  render(<CartPage />);
  await user.click(screen.getByRole("button", { name: /proceed to checkout/i }));
  expect(mockNavigate).toHaveBeenCalledWith("/checkout");
});
