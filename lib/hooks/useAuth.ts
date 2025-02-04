export function useAuth() {
  const user = null;
  const error = null;
  const isLoading = false;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
