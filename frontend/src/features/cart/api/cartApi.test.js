import { createHttpCartRepository } from "./cartApi.js";

const mockHttpClient = jest.fn();
const mockSessionStore = { get: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionStore.get.mockReturnValue({ token: "tok-1" });
});

test("saveCart sends PUT to /users/me/cart with cart lines and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpCartRepository({
    httpClient: mockHttpClient,
    sessionStore: mockSessionStore,
  });
  const lines = [{ productId: "p1", quantity: 2 }];
  await repo.saveCart(lines);
  expect(mockHttpClient).toHaveBeenCalledWith("/users/me/cart", {
    method: "PUT",
    body: { cart: lines },
    token: "tok-1",
  });
});

test("saveCart returns response from server", async () => {
  const expected = { ok: true, data: [{ productId: "p1", quantity: 2 }] };
  mockHttpClient.mockResolvedValue(expected);
  const repo = createHttpCartRepository({
    httpClient: mockHttpClient,
    sessionStore: mockSessionStore,
  });
  const result = await repo.saveCart([]);
  expect(result).toEqual(expected);
});
