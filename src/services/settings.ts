import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Tables, Updates } from "@/types/database";

export const settingsService = {
  async get(): Promise<Tables<"user_settings"> | null> {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsert(updates: Updates<"user_settings">) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        theme: "dark",
        accent: "coral",
        preferences: {},
        notification_settings: {},
        ...updates,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },
};
