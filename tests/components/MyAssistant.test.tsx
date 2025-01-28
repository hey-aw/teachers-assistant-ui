import { render, screen } from "@testing-library/react";
import { Auth0Provider } from "@auth0/auth0-react";
import { MyAssistant } from "@/components/MyAssistant";

jest.mock("@auth0/auth0-react", () => ({
  Auth0Provider: ({ children }) => <div>{children}</div>,
  useAuth0: () => ({
    isAuthenticated: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe("MyAssistant Component", () => {
  it("should render without crashing", () => {
    render(
      <Auth0Provider>
        <MyAssistant />
      </Auth0Provider>
    );
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("should show Log In button when not authenticated", () => {
    render(
      <Auth0Provider>
        <MyAssistant />
      </Auth0Provider>
    );
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("should show Log Out button when authenticated", () => {
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
        <MyAssistant />
      </Auth0Provider>
    );
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });
});
