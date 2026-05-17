import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomePage } from "./HomePage.jsx";

var mockProducts = [
  { id: "p1", name: "Keyboard", category: "Peripherals", price: { currency: "$", amount: 99 }, primaryImage: "", status: "new", inStock: true, lowStock: false, stock: 10, reviews: [] },
  { id: "p2", name: "Mouse", category: "Peripherals", price: { currency: "$", amount: 49 }, primaryImage: "img.jpg", status: "active", inStock: true, lowStock: false, stock: 15, reviews: [{ id: "r1" }] },
];
const mockNavigate = jest.fn();

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
  useNavigate: () => ({ navigate: mockNavigate }),
}));

const categories = [{ id: "c1", name: "Peripherals" }];

beforeEach(() => {
  jest.clearAllMocks();
  mockProducts = [
    { id: "p1", name: "Keyboard", category: "Peripherals", price: { currency: "$", amount: 99 }, primaryImage: "", status: "new", inStock: true, lowStock: false, stock: 10, reviews: [] },
    { id: "p2", name: "Mouse", category: "Peripherals", price: { currency: "$", amount: 49 }, primaryImage: "img.jpg", status: "active", inStock: true, lowStock: false, stock: 15, reviews: [{ id: "r1" }] },
  ];
});

test("renders hero section with live products stat", () => {
  render(<HomePage categories={categories} />);
  expect(screen.getByText("live products")).toBeInTheDocument();
});

test("renders product cards", () => {
  render(<HomePage categories={categories} />);
  expect(screen.getAllByText("Keyboard").length).toBeGreaterThanOrEqual(1);
});

test("navigates to products page on shop now click", async () => {
  const user = userEvent.setup();
  render(<HomePage categories={categories} />);
  await user.click(screen.getByText("Shop now"));
  expect(mockNavigate).toHaveBeenCalledWith("/products");
});

test("renders category strip with all products option", () => {
  render(<HomePage categories={categories} />);
  expect(screen.getByText("All products")).toBeInTheDocument();
  expect(screen.getAllByText("Peripherals").length).toBeGreaterThanOrEqual(1);
});

test("shows empty state when no products exist", () => {
  mockProducts = [];
  render(<HomePage categories={categories} />);
  expect(screen.getByText("No products yet")).toBeInTheDocument();
});
