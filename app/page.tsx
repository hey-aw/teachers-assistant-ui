import { MyAssistant } from "@/components/MyAssistant";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <main className="h-dvh">
      <MyAssistant />
      {isAuthenticated ? (
        <button onClick={() => logout({ returnTo: window.location.origin })}>
          Log Out
        </button>
      ) : (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      )}
    </main>
  );
}
