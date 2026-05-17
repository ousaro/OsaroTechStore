import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterPage } from "./RegisterPage.jsx";

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../hooks/useAuth.js", () => ({
  useAuth: () => ({ register: mockRegister }),
}));
jest.mock("../../../hooks/useNavigate.js", () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders registration form with all fields", () => {
  render(<RegisterPage />);
  expect(screen.getAllByText("Create account").length).toBe(2);
  expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
});

test("shows error when passwords do not match", async () => {
  const user = userEvent.setup();
  render(<RegisterPage />);
  await user.type(screen.getByPlaceholderText("John"), "John");
  await user.type(screen.getByPlaceholderText("Doe"), "Doe");
  await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
  const passwordInputs = screen.getAllByLabelText(/password/i);
  await user.type(passwordInputs[0], "pass1");
  await user.type(passwordInputs[1], "pass2");
  await user.click(screen.getByRole("button", { name: /create account/i }));
  expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  expect(mockRegister).not.toHaveBeenCalled();
});

test("calls register with form data on submit", async () => {
  const user = userEvent.setup();
  mockRegister.mockResolvedValue({ isAdmin: false });
  render(<RegisterPage />);
  await user.type(screen.getByPlaceholderText("John"), "John");
  await user.type(screen.getByPlaceholderText("Doe"), "Doe");
  await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
  const passwordInputs = screen.getAllByLabelText(/password/i);
  await user.type(passwordInputs[0], "Secret1!");
  await user.type(passwordInputs[1], "Secret1!");
  await user.click(screen.getByRole("button", { name: /create account/i }));
  expect(mockRegister).toHaveBeenCalledWith({
    firstName: "John", lastName: "Doe", email: "a@b.com",
    password: "Secret1!", confirmPassword: "Secret1!",
  });
});

test("navigates to /home after successful registration (non-admin)", async () => {
  const user = userEvent.setup();
  mockRegister.mockResolvedValue({ isAdmin: false });
  render(<RegisterPage />);
  await user.type(screen.getByPlaceholderText("John"), "John");
  await user.type(screen.getByPlaceholderText("Doe"), "Doe");
  await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
  const passwordInputs = screen.getAllByLabelText(/password/i);
  await user.type(passwordInputs[0], "Secret1!");
  await user.type(passwordInputs[1], "Secret1!");
  await user.click(screen.getByRole("button", { name: /create account/i }));
  expect(mockNavigate).toHaveBeenCalledWith("/home");
});
