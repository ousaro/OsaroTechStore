import { render, screen } from "@testing-library/react";
import { createAuthViewAdapter, useAuth } from "./useAuth.js";
import { Events } from "../../../lib/events.js";

const createDeps = () => {
  const eventBus = { subscribe: jest.fn(), unsubscribe: jest.fn() };
  const authInputPort = {
    getSession: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  };
  return { authInputPort, eventBus };
};

function TestChild() {
  const ctx = useAuth();
  return (
    <div data-testid="ctx">
      {ctx.loading ? "loading" : ctx.user ? `user:${ctx.user.id}` : "no-user"}
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("Provider shows loading then user from getSession", () => {
  const { authInputPort, eventBus } = createDeps();
  authInputPort.getSession.mockReturnValue({ id: "u1", isAdmin: false });
  const { AuthProvider } = createAuthViewAdapter({ authInputPort, eventBus });
  render(
    <AuthProvider>
      <TestChild />
    </AuthProvider>
  );
  expect(screen.getByTestId("ctx").textContent).toBe("user:u1");
});

test("Provider shows no-user when getSession returns null", () => {
  const { authInputPort, eventBus } = createDeps();
  authInputPort.getSession.mockReturnValue(null);
  const { AuthProvider } = createAuthViewAdapter({ authInputPort, eventBus });
  render(
    <AuthProvider>
      <TestChild />
    </AuthProvider>
  );
  expect(screen.getByTestId("ctx").textContent).toBe("no-user");
});

test("useAuth throws when used outside provider", () => {
  expect(() => render(<TestChild />)).toThrow("useAuth must be used within AuthProvider");
});

test("Provider subscribes to auth events on mount", () => {
  const { authInputPort, eventBus } = createDeps();
  authInputPort.getSession.mockReturnValue(null);
  const { AuthProvider } = createAuthViewAdapter({ authInputPort, eventBus });
  render(
    <AuthProvider>
      <TestChild />
    </AuthProvider>
  );
  expect(eventBus.subscribe).toHaveBeenCalledWith(Events.USER_LOGGED_IN, expect.any(Function));
  expect(eventBus.subscribe).toHaveBeenCalledWith(Events.USER_LOGGED_OUT, expect.any(Function));
  expect(eventBus.subscribe).toHaveBeenCalledWith(Events.USER_REGISTERED, expect.any(Function));
});

test("Provider unsubscribes from events on unmount", () => {
  const { authInputPort, eventBus } = createDeps();
  authInputPort.getSession.mockReturnValue(null);
  const { AuthProvider } = createAuthViewAdapter({ authInputPort, eventBus });
  const { unmount } = render(
    <AuthProvider>
      <TestChild />
    </AuthProvider>
  );
  unmount();
  expect(eventBus.unsubscribe).toHaveBeenCalledWith(Events.USER_LOGGED_IN, expect.any(Function));
  expect(eventBus.unsubscribe).toHaveBeenCalledWith(Events.USER_LOGGED_OUT, expect.any(Function));
  expect(eventBus.unsubscribe).toHaveBeenCalledWith(Events.USER_REGISTERED, expect.any(Function));
});
