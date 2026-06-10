import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProductCard } from "./ProductCard.jsx";

expect.extend(toHaveNoViolations);

const mockAddToCart = jest.fn();
const mockNavigate = jest.fn();
const mockToggleFavorite = jest.fn();

jest.mock("../../cart/hooks/useCart.js", () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));

jest.mock("../../users/hooks/useUsers.js", () => ({
  useUsers: () => ({
    profile: { hasFavorite: () => false },
    toggleFavorite: mockToggleFavorite,
  }),
}));

jest.mock("../../auth/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

const product = {
  id: "product-1",
  name: "Osaro Keyboard",
  category: "Peripherals",
  primaryImage: "",
  status: "new",
  inStock: true,
  lowStock: false,
  stock: 12,
  reviews: [{ id: "review-1" }],
  price: { currency: "$", amount: 129.99 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("ProductCard renders product details and passes axe checks", async () => {
  const { container } = render(<ProductCard product={product} />);

  expect(screen.getByRole("link", { name: /view osaro keyboard/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /peripherals osaro keyboard/i })).toBeInTheDocument();
  expect(screen.getByText("Peripherals")).toBeInTheDocument();
  expect(screen.getByText("Osaro Keyboard")).toBeInTheDocument();
  expect(screen.getByText("1 review")).toBeInTheDocument();
  expect(screen.getByText("In stock (12)")).toBeInTheDocument();
  await expect(axe(container)).resolves.toHaveNoViolations();
});

test("ProductCard adds in-stock products to the cart", async () => {
  const user = userEvent.setup();
  render(<ProductCard product={product} />);

  await user.click(screen.getByRole("button", { name: /add to cart/i }));

  expect(mockAddToCart).toHaveBeenCalledWith("product-1", 1);
});

test("ProductCard navigates to the product detail on card click", async () => {
  const user = userEvent.setup();
  render(<ProductCard product={product} />);

  await user.click(screen.getByRole("link", { name: /view osaro keyboard/i }));

  expect(mockNavigate).toHaveBeenCalledWith("/product/product-1");
});
