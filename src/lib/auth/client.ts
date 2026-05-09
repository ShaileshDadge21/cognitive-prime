import { integrationStatus } from "@/lib/config/env";
import { createSession, clearSession, getSession } from "@/lib/auth/session";

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupInput = AuthCredentials & {
  name?: string;
};

export const authClient = {
  isConfigured: integrationStatus.supabaseConfigured,
  async signIn(input: AuthCredentials) {
    createSession(input.email);
    return getSession();
  },
  async signUp(input: SignupInput) {
    createSession(input.email);
    return getSession();
  },
  async signOut() {
    clearSession();
  },
};
