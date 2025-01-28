import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import React from "react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI;

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={redirectUri}
    >
      {children}
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  return {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
  };
};
