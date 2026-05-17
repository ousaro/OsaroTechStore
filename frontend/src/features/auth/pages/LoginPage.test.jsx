import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage.jsx";

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../hooks/useAuth.js", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders login form with email and password fields", () => {
  render(<LoginPage />);
  expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  expect(screen.getByLabelText("Password")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});

test("calls login with email and password on submit", async () => {
  const user = userEvent.setup();
  mockLogin.mockResolvedValue({ isAdmin: false });
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email address"), "a@b.com");
  await user.type(screen.getByLabelText("Password"), "secret");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(mockLogin).toHaveBeenCalledWith("a@b.com", "secret");
});

test("navigates to /home for non-admin users", async () => {
  const user = userEvent.setup();
  mockLogin.mockResolvedValue({ isAdmin: false });
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email address"), "a@b.com");
  await user.type(screen.getByLabelText("Password"), "secret");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(mockNavigate).toHaveBeenCalledWith("/home");
});

test("navigates to /dashboard for admin users", async () => {
  const user = userEvent.setup();
  mockLogin.mockResolvedValue({ isAdmin: true });
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email address"), "admin@test.com");
  await user.type(screen.getByLabelText("Password"), "admin123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
});

test("shows error message when login fails", async () => {
  const user = userEvent.setup();
  mockLogin.mockRejectedValue(new Error("Invalid credentials"));
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email address"), "a@b.com");
  await user.type(screen.getByLabelText("Password"), "wrong");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
});

test("disables submit button while loading", async () => {
  const user = userEvent.setup();
  mockLogin.mockImplementation(() => new Promise(() => {}));
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Email address"), "a@b.com");
  await user.type(screen.getByLabelText("Password"), "secret");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
});
