import { createHttpUserRepository } from "./usersApi.js";

const mockHttpClient = jest.fn();
const mockSessionStore = { get: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionStore.get.mockReturnValue({ token: "tok-1" });
});

test("getMe fetches /users/me with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "u1" } });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.getMe();
  expect(mockHttpClient).toHaveBeenCalledWith("/users/me", { token: "tok-1" });
});

test("updateMe sends PUT to /users/me with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "u1" } });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.updateMe({ firstName: "Jane" });
  expect(mockHttpClient).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { firstName: "Jane" }, token: "tok-1" });
});

test("updatePassword sends PUT to /users/me/password with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.updatePassword({ currentPassword: "old", newPassword: "new" });
  expect(mockHttpClient).toHaveBeenCalledWith("/users/me/password", { method: "PUT", body: { currentPassword: "old", newPassword: "new" }, token: "tok-1" });
});

test("toggleFavorite sends PUT to /users/me/favorites/:productId with action and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { favorites: ["p1"] } });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.toggleFavorite("p1", "add");
  expect(mockHttpClient).toHaveBeenCalledWith("/users/me/favorites/p1", { method: "PUT", body: { action: "add" }, token: "tok-1" });
});

test("getById fetches /users/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "u1" } });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.getById("u1");
  expect(mockHttpClient).toHaveBeenCalledWith("/users/u1", { token: "tok-1" });
});

test("deleteById sends DELETE to /users/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.deleteById("u1");
  expect(mockHttpClient).toHaveBeenCalledWith("/users/u1", { method: "DELETE", token: "tok-1" });
});

test("updateById sends PUT to /users/:id with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "u1" } });
  const repo = createHttpUserRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.updateById("u1", { isAdmin: true });
  expect(mockHttpClient).toHaveBeenCalledWith("/users/u1", { method: "PUT", body: { isAdmin: true }, token: "tok-1" });
});
