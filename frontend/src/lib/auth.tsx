import * as React from "react";

import { apiFetch, loginUrl } from "@/lib/api";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Re-checks GET /me against the current session. */
  refresh: () => Promise<void>;
  /** POST /auth/logout, then clears client auth state regardless of the result. */
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const refresh = React.useCallback(async () => {
    setStatus("loading");
    try {
      const me = await apiFetch<AuthUser>("/me");
      setUser(me);
      setStatus("authenticated");
    } catch {
      // 401 means signed out; any other failure is treated the same way --
      // there is no session worth trusting, so the visitor sees the sign-in screen.
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = React.useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Even if the server call failed, the client must not keep acting signed in.
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = React.useMemo(
    () => ({ status, user, refresh, signOut }),
    [status, user, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

/** Full-page navigation to the backend's OAuth entry point -- this is not a fetch. */
export function startGoogleSignIn(): void {
  window.location.href = loginUrl();
}
