import { renderHook, act } from "@testing-library/react";
import { useNavigate } from "./useNavigate.js";

beforeEach(() => {
  window.location.hash = "";
});

test("returns root path when hash is empty", () => {
  const { result } = renderHook(() => useNavigate());
  expect(result.current.path).toBe("/");
});

test("returns path from hash", () => {
  window.location.hash = "/products";
  const { result } = renderHook(() => useNavigate());
  expect(result.current.path).toBe("/products");
});

test("navigate updates hash and triggers path change", () => {
  const { result } = renderHook(() => useNavigate());
  act(() => {
    result.current.navigate("/cart");
  });
  expect(window.location.hash).toBe("#/cart");
});

test("tracks hashchange events", () => {
  const { result } = renderHook(() => useNavigate());
  act(() => {
    window.location.hash = "/cart";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(result.current.path).toBe("/cart");
});

test("cleans up hashchange listener on unmount", () => {
  const addSpy = jest.spyOn(window, "removeEventListener");
  const { unmount } = renderHook(() => useNavigate());
  unmount();
  expect(addSpy).toHaveBeenCalledWith("hashchange", expect.any(Function));
  addSpy.mockRestore();
});
