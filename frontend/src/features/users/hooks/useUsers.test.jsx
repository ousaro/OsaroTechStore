import { render, screen } from "@testing-library/react";
import { createUsersViewAdapter, useUsers } from "./useUsers.js";

const mockUseAuthDefault = { user: { id: "u1" } };
let mockUseAuthValue = mockUseAuthDefault;

jest.mock("../../auth/hooks/useAuth.js", () => ({
  useAuth: () => mockUseAuthValue,
}));

const createDeps = () => {
  const usersInputPort = {
    getMyProfile: jest.fn().mockResolvedValue(null),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    toggleFavorite: jest.fn(),
    deleteAccount: jest.fn(),
    deleteUser: jest.fn(),
  };
  const sessionStore = { get: jest.fn().mockReturnValue({ token: "tok-1" }) };
  return { usersInputPort, sessionStore };
};

function TestChild() {
  const ctx = useUsers();
  return <div data-testid="ctx">{ctx.profile ? "has-profile" : "no-profile"}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuthValue = mockUseAuthDefault;
});

test("UsersProvider provides context with profile from session", () => {
  const deps = createDeps();
  deps.sessionStore.get.mockReturnValue({ id: "u1", firstName: "John" });
  const { UsersProvider } = createUsersViewAdapter(deps);
  render(<UsersProvider><TestChild /></UsersProvider>);
  expect(screen.getByTestId("ctx").textContent).toBe("has-profile");
});

test("UsersProvider shows no profile when user not authenticated", () => {
  mockUseAuthValue = { user: null };
  const deps = createDeps();
  const { UsersProvider } = createUsersViewAdapter(deps);
  render(<UsersProvider><TestChild /></UsersProvider>);
  expect(screen.getByTestId("ctx").textContent).toBe("no-profile");
});

test("useUsers throws when used outside UsersProvider", () => {
  expect(() => render(<TestChild />)).toThrow("useUsers must be used within UsersProvider");
});
