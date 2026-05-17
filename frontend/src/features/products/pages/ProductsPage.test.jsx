import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ProductsPage } from "./ProductsPage.jsx";

const mockProducts = [
  { id: "p1", name: "Keyboard", category: "Peripherals", price: { currency: "$", amount: 99 }, primaryImage: "", status: "new", inStock: true, lowStock: false, stock: 10, reviews: [] },
  { id: "p2", name: "Gaming Mouse", category: "Peripherals", price: { currency: "$", amount: 149 }, primaryImage: "", status: "active", inStock: true, lowStock: false, stock: 5, reviews: [{ id: "r1" }] },
  { id: "p3", name: "Monitor", category: "Displays", price: { currency: "$", amount: 399 }, primaryImage: "", status: "active", inStock: false, lowStock: false, stock: 0, reviews: [] },
];

jest.mock("../hooks/useProducts.js", () => ({
  useProducts: () => ({ products: mockProducts }),
}));
jest.mock("../../auth/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));
jest.mock("../../cart/hooks/useCart.js", () => ({
  useCart: () => ({ addToCart: jest.fn() }),
}));
jest.mock("../../users/hooks/useUsers.js", () => ({
  useUsers: () => ({ profile: { hasFavorite: () => false }, toggleFavorite: jest.fn() }),
}));
jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: jest.fn(), path: "/products" }),
}));

const categories = [
  { id: "c1", name: "Peripherals" },
  { id: "c2", name: "Displays" },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders product catalog with all products and passes axe", async () => {
  const { container } = render(<ProductsPage categories={categories} />);
  expect(screen.getByText("Products")).toBeInTheDocument();
  expect(screen.getByText("Keyboard")).toBeInTheDocument();
  expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
  expect(screen.getByText("Monitor")).toBeInTheDocument();
  await expect(axe(container)).resolves.toHaveNoViolations();
});

test("shows correct product counts", () => {
  render(<ProductsPage categories={categories} />);
  expect(screen.getByText("3 of 3 products ready to browse")).toBeInTheDocument();
});

test("filters products by category", async () => {
  const user = userEvent.setup();
  render(<ProductsPage categories={categories} />);
  const filterButtons = screen.getAllByRole("button", { name: /displays/i });
  await user.click(filterButtons[0]);
  expect(screen.getByText("1 results")).toBeInTheDocument();
  expect(screen.queryByText("Keyboard")).not.toBeInTheDocument();
  expect(screen.getByText("Monitor")).toBeInTheDocument();
});

test("shows empty state when no products match filter", async () => {
  const user = userEvent.setup();
  render(<ProductsPage categories={categories} />);
  const filterButtons = screen.getAllByRole("button", { name: /displays/i });
  await user.click(filterButtons[0]);
  const searchInput = screen.getByPlaceholderText(/search products/i);
  await user.type(searchInput, "zzzznonexistent");
  expect(screen.getByText("No products found")).toBeInTheDocument();
});
