import { renderHook, act } from "@testing-library/react-hooks";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/lib/auth";
import React from "react";

const mockAuth0 = {
  isAuthenticated: false,
  loginWithRedirect: jest.fn(),
  logout: jest.fn(),
  user: null,
};

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }) => <div>{children}</div>,
  useAuth0: () => mockAuth0,
}));

describe("useAuth", () => {
  it("should return isAuthenticated as false initially", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should call loginWithRedirect when login is triggered", () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.loginWithRedirect();
    });
    expect(mockAuth0.loginWithRedirect).toHaveBeenCalled();
  });

  it("should call logout when logout is triggered", () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });
    expect(mockAuth0.logout).toHaveBeenCalled();
  });

  it("should return user as null initially", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBe(null);
  });
});
