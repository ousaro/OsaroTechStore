import { createHttpAuthRepository } from "./authApi.js";

const mockHttpClient = jest.fn();
const mockSessionStore = { get: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionStore.get.mockReturnValue({ token: "tok-1" });
});

test("login posts email and password to /auth/login", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { user: { id: "u1" } } });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  const result = await repo.login("a@b.com", "secret");
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.com", password: "secret" } });
  expect(result.ok).toBe(true);
});

test("register posts payload to /auth/register", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { user: { id: "u1" } } });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  const payload = { firstName: "John", lastName: "Doe", email: "a@b.com", password: "secret" };
  await repo.register(payload);
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/register", { method: "POST", body: payload });
});

test("listUsers fetches /auth/users with auth token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.listUsers();
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/users", { token: "tok-1" });
});

test("deleteUser sends DELETE to /auth/users/:id with token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.deleteUser("u1");
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/users/u1", { method: "DELETE", token: "tok-1" });
});

test("updateUser sends PUT to /auth/users/:id with body and token", async () => {
  mockHttpClient.mockResolvedValue({ ok: true, data: { id: "u1" } });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.updateUser("u1", { isAdmin: true });
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/users/u1", { method: "PUT", body: { isAdmin: true }, token: "tok-1" });
});

test("works without a token in session", async () => {
  mockSessionStore.get.mockReturnValue(null);
  mockHttpClient.mockResolvedValue({ ok: true, data: [] });
  const repo = createHttpAuthRepository({ httpClient: mockHttpClient, sessionStore: mockSessionStore });
  await repo.listUsers();
  expect(mockHttpClient).toHaveBeenCalledWith("/auth/users", { token: undefined });
});
