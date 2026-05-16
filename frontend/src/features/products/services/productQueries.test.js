import { createProductQueries } from "./productQueries.js";

test("product listing maps API results into Product models", async () => {
  const products = {
    getAll: jest.fn(async () => ({
      ok: true,
      data: [{ _id: "product-1", name: "Keyboard", category: "Peripherals", price: 99 }],
    })),
  };
  const sessionStore = {
    get: jest.fn(() => ({ token: "token-1" })),
  };

  const queries = createProductQueries({ products, sessionStore });
  const result = await queries.getAllProducts({ category: "Peripherals" });

  expect(products.getAll).toHaveBeenCalledWith({ category: "Peripherals" }, "token-1");
  expect(result[0].id).toBe("product-1");
  expect(result[0].name).toBe("Keyboard");
});

test("product detail throws a useful error when the API rejects the lookup", async () => {
  const products = {
    getById: jest.fn(async () => ({ ok: false, error: "Missing product" })),
  };
  const sessionStore = {
    get: jest.fn(() => ({ token: "token-1" })),
  };

  const queries = createProductQueries({ products, sessionStore });

  await expect(queries.getProductById("missing")).rejects.toThrow("Missing product");
});
