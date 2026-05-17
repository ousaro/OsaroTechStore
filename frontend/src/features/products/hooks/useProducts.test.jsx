import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { createProductsViewAdapter, useProducts } from "./useProducts.js";

jest.mock("../../auth/hooks/useAuth.js", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

jest.mock("../../../store/eventBus.js", () => ({
  eventBus: { subscribe: jest.fn(), unsubscribe: jest.fn() },
}));

const createDeps = () => {
  const productsInputPort = {
    getAllProducts: jest.fn().mockResolvedValue([]),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    uploadProductImage: jest.fn(),
    addProductReview: jest.fn(),
  };
  const productReadModel = {
    useProductReadModel: () => {
      const { useState } = require("react");
      const [products, setProducts] = useState([]);
      const [loaded, setLoaded] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      return { products, setProducts, loaded, setLoaded, loading, setLoading, error, setError };
    },
  };
  return { productsInputPort, productReadModel };
};

function TestChild() {
  const ctx = useProducts();
  return <div data-testid="ctx">{ctx.loading ? "loading" : ctx.loaded ? `products:${ctx.products.length}` : "not-loaded"}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("ProductsProvider provides context and loads products on mount, passes axe", async () => {
  const { productsInputPort, productReadModel } = createDeps();
  const { ProductsProvider } = createProductsViewAdapter({ productsInputPort, productReadModel });
  const { container } = render(<ProductsProvider><TestChild /></ProductsProvider>);
  expect(await screen.findByTestId("ctx")).toBeTruthy();
  await expect(axe(container)).resolves.toHaveNoViolations();
});

test("useProducts throws when used outside ProductsProvider", () => {
  expect(() => render(<TestChild />)).toThrow("useProducts must be used within ProductsProvider");
});
