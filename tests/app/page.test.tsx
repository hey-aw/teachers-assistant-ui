import { render, screen, fireEvent } from "@testing-library/react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import Home from "@/app/page";

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }) => <div>{children}</div>,
  useAuth0: () => ({
    isAuthenticated: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe("Home Page", () => {
  it("should render login button when not authenticated", () => {
    render(
      <Auth0Provider>
        <Home />
      </Auth0Provider>
    );
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("should render logout button when authenticated", () => {
    jest.mock("@auth0/auth0-react", () => ({
      Auth0Provider: ({ children }) => <div>{children}</div>,
      useAuth0: () => ({
        isAuthenticated: true,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
      }),
    }));

    render(
      <Auth0Provider>
        <Home />
      </Auth0Provider>
    );
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("should call loginWithRedirect when login button is clicked", () => {
    const { result } = render(
      <Auth0Provider>
        <Home />
      </Auth0Provider>
    );
    fireEvent.click(screen.getByText("Log In"));
    expect(result.current.loginWithRedirect).toHaveBeenCalled();
  });

  it("should call logout when logout button is clicked", () => {
    jest.mock("@auth0/auth0-react", () => ({
      Auth0Provider: ({ children }) => <div>{children}</div>,
      useAuth0: () => ({
        isAuthenticated: true,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
      }),
    }));

    const { result } = render(
      <Auth0Provider>
        <Home />
      </Auth0Provider>
    );
    fireEvent.click(screen.getByText("Log Out"));
    expect(result.current.logout).toHaveBeenCalled();
  });
});
