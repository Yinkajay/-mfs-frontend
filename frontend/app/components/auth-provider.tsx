"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { authApi } from "@/app/lib/auth-api";
import { createAuthSession, INITIAL_SESSION } from "@/app/lib/auth-session";

const AuthContext = createContext<ReturnType<typeof createAuthSession> | null>(
  null,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session] = useState(() => createAuthSession(authApi));
  useEffect(() => {
    void session.restore();
    const refresh = () => {
      if (document.visibilityState === "visible") void session.restore();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      session.cancelRestore();
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [session]);
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const session = useContext(AuthContext);
  if (!session) throw new Error("AuthProvider is required");
  const state = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    () => INITIAL_SESSION,
  );
  return {
    ...state,
    login: session.login,
    logout: session.logout,
    restore: session.restore,
  };
}
