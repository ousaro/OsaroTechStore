import { createHttpProductRepository } from "./productsApi.js";

const mockHttpClient = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("getAll fetches /products with query params and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.getAll({ category: "Phones", status: "active" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products?category=Phones&status=active", { token: "tok-1" });
});

test("getAll omits query string when no params", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.getAll({}, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products", { token: "tok-1" });
});

test("getAll filters out empty values from query", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.getAll({ category: "Phones", status: "", extra: undefined }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products?category=Phones", { token: "tok-1" });
});

test("getById fetches /products/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "p1" } });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.getById("p1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products/p1", { token: "tok-1" });
});

test("create sends POST to /products with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "p1" } });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.create({ name: "Keyboard" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products", { method: "POST", body: { name: "Keyboard" }, token: "tok-1" });
});

test("uploadImage sends POST to /products/uploads with file body and content-type", async () => {
  const file = new Blob(["data"], { type: "image/png" });
  Object.defineProperty(file, "type", { value: "image/png" });
  mockHttpClient.mockResolvedValue({ ok: true, data: { url: "https://cdn.example.com/img.png" } });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.uploadImage(file, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products/uploads", {
    method: "POST", body: file, token: "tok-1", headers: { "Content-Type": "image/png" },
  });
});

test("update sends PUT to /products/:id with patch and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "p1" } });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.update("p1", { price: 99 }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products/p1", { method: "PUT", body: { price: 99 }, token: "tok-1" });
});

test("delete sends DELETE to /products/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.delete("p1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products/p1", { method: "DELETE", token: "tok-1" });
});

test("addReview sends POST to /products/:id/reviews with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "p1", reviews: [] } });
  const repo = createHttpProductRepository({ httpClient: mockHttpClient });
  await repo.addReview("p1", { rating: 5, comment: "Great" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/products/p1/reviews", { method: "POST", body: { rating: 5, comment: "Great" }, token: "tok-1" });
});
