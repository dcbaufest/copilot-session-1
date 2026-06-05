import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { TokenResponse } from "../api/auth.ts";

interface AuthState {
  token: string | null;
  user: string | null;
  expiresAt: number | null; // Unix timestamp in ms
  isAuthenticated: boolean;
  signIn: (tokenData: TokenResponse, username: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "flowops_token";
const USER_KEY = "flowops_user";
const EXPIRES_AT_KEY = "flowops_expires_at";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<string | null>(() =>
    sessionStorage.getItem(USER_KEY),
  );
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const raw = sessionStorage.getItem(EXPIRES_AT_KEY);
    return raw ? Number(raw) : null;
  });

  const signIn = useCallback((tokenData: TokenResponse, username: string) => {
    const expMs = Date.now() + tokenData.expires_in * 1000;
    sessionStorage.setItem(TOKEN_KEY, tokenData.access_token);
    sessionStorage.setItem(USER_KEY, username);
    sessionStorage.setItem(EXPIRES_AT_KEY, String(expMs));
    setToken(tokenData.access_token);
    setUser(username);
    setExpiresAt(expMs);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(EXPIRES_AT_KEY);
    setToken(null);
    setUser(null);
    setExpiresAt(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        expiresAt,
        signIn,
        signOut,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
