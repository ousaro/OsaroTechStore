import { createHttpCategoryRepository } from "./categoriesApi.js";

const mockHttpClient = jest.fn();
const mockSessionStore = { get: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionStore.get.mockReturnValue({ token: "tok-1" });
});

test("getAll fetches /categories with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.getAll("tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/categories", { token: "tok-1" });
});

test("getById fetches /categories/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "c1" } });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.getById("c1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/categories/c1", { token: "tok-1" });
});

test("create sends POST to /categories with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "c1" } });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.create({ name: "Phones" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/categories", { method: "POST", body: { name: "Phones" }, token: "tok-1" });
});

test("update sends PUT to /categories/:id with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "c1" } });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.update("c1", { name: "Tablets" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/categories/c1", { method: "PUT", body: { name: "Tablets" }, token: "tok-1" });
});

test("delete sends DELETE to /categories/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.delete("c1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/categories/c1", { method: "DELETE", token: "tok-1" });
});

test("getAll fetches without token when none available", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpCategoryRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.getAll();
  expect(mockHttpClient).toHaveBeenCalledWith("/categories", { token: undefined });
});
