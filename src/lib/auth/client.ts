import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithPassword, signOut, signUpWithPassword } from "@/lib/supabase/auth";

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupInput = AuthCredentials & {
  name?: string;
};

export const authClient = {
  isConfigured: isSupabaseConfigured(),
  async signIn(input: AuthCredentials) {
    return signInWithPassword(input.email, input.password);
  },
  async signUp(input: SignupInput) {
    return signUpWithPassword(input.email, input.password, input.name);
  },
  async signOut() {
    return signOut();
  },
};
