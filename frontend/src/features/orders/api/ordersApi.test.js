import { createHttpOrderRepository } from "./ordersApi.js";

const mockHttpClient = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("getAll fetches /orders with query string and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  await repo.getAll({ status: "pending" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders?status=pending", { token: "tok-1" });
});

test("getAll omits query string when params are empty", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  await repo.getAll({}, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders", { token: "tok-1" });
});

test("getById fetches /orders/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "o1" } });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  repo.getById("o1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders/o1", { token: "tok-1" });
});

test("create sends POST to /orders with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "o1" } });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  await repo.create({ items: [] }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders", {
    method: "POST",
    body: { items: [] },
    token: "tok-1",
  });
});

test("update sends PUT to /orders/:id with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "o1" } });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  await repo.update("o1", { orderStatus: "shipped" }, "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders/o1", {
    method: "PUT",
    body: { orderStatus: "shipped" },
    token: "tok-1",
  });
});

test("delete sends DELETE to /orders/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpOrderRepository({ httpClient: mockHttpClient });
  await repo.delete("o1", "tok-1");
  expect(mockHttpClient).toHaveBeenCalledWith("/orders/o1", { method: "DELETE", token: "tok-1" });
});
