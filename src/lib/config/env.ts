const readEnv = (key: string) => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const env = {
  supabaseUrl: readEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: readEnv("VITE_SUPABASE_ANON_KEY"),
  geminiApiKey: readEnv("VITE_GEMINI_API_KEY"),
} as const;

export const integrationStatus = {
  supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  geminiConfigured: Boolean(env.geminiApiKey),
} as const;
