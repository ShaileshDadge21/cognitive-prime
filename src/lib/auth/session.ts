const SESSION_KEY = "neuroflow.session";

export type AuthSession = {
  userId: string;
  email: string;
  createdAt: string;
};

const isBrowser = () => typeof window !== "undefined";

export function getSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function hasSession() {
  return Boolean(getSession());
}

export function createSession(email: string) {
  if (!isBrowser()) {
    return;
  }

  const session: AuthSession = {
    userId: `user-${Date.now()}`,
    email,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}
