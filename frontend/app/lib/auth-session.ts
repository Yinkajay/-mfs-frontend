import {
  AuthApiError,
  authErrorMessage,
  type AuthApi,
  type Customer,
  type LoginInput,
} from "./auth-api";

export type SessionSnapshot = {
  phase: "checking" | "signed-in" | "signed-out" | "error";
  user: Customer | null;
  busy: "login" | "logout" | null;
  error: string | null;
};

export const INITIAL_SESSION: SessionSnapshot = {
  phase: "checking",
  user: null,
  busy: null,
  error: null,
};

// Only the safe profile lives in memory. The browser alone handles the cookie.
export function createAuthSession(api: AuthApi) {
  let snapshot = INITIAL_SESSION;
  let revision = 0;
  let pendingRestore: AbortController | undefined;
  const listeners = new Set<() => void>();
  function update(next: SessionSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }
  function cancelRestore() {
    revision += 1;
    pendingRestore?.abort();
    pendingRestore = undefined;
  }
  const store = {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async restore() {
      if (snapshot.busy) return;
      cancelRestore();
      const current = revision;
      const controller = new AbortController();
      pendingRestore = controller;
      update({ ...snapshot, phase: "checking" });
      try {
        const user = await api.me(controller.signal);
        if (revision !== current) return;
        update({
          user,
          phase: user ? "signed-in" : "signed-out",
          busy: null,
          error: null,
        });
      } catch {
        if (revision !== current) return;
        // Passive checks stay quiet. Keep the state unknown (not signed out),
        // and preserve any earlier explicit logout error until it is resolved.
        update({ ...snapshot, phase: "error" });
      } finally {
        if (revision === current) pendingRestore = undefined;
      }
    },
    async login(input: LoginInput) {
      if (snapshot.busy)
        throw new AuthApiError("Please wait for the current request.");
      const previous = snapshot;
      cancelRestore();
      update({ ...snapshot, busy: "login", error: null });
      try {
        await api.login(input);
        // Prove the browser retained the cookie before showing a signed-in UI.
        const user = await api.me();
        if (!user)
          throw new AuthApiError(
            "Could not keep you signed in. Please allow cookies and try again.",
          );
        update({ user, phase: "signed-in", busy: null, error: null });
      } catch (error) {
        // The form owns login errors; do not leak them into every navigation.
        update({
          user: previous.user,
          phase: previous.user ? "signed-in" : "signed-out",
          busy: null,
          error: null,
        });
        throw error;
      }
    },
    async logout() {
      if (snapshot.busy) return;
      cancelRestore();
      update({ ...snapshot, busy: "logout", error: null });
      try {
        await api.logout();
        update({ user: null, phase: "signed-out", busy: null, error: null });
      } catch (error) {
        // A network failure does not prove that the server revoked the session.
        update({
          ...snapshot,
          phase: "error",
          busy: null,
          error: authErrorMessage(error),
        });
      }
    },
    cancelRestore,
  };
  return store;
}
