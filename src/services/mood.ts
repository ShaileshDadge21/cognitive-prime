import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Inserts, Tables } from "@/types/database";

export type MoodLogInput = Omit<Inserts<"mood_logs">, "id" | "user_id"> & {
  id?: string;
};

export const moodService = {
  async list() {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async listByDateRange(startDate: string, endDate: string) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", startDate)
      .lte("logged_at", endDate)
      .order("logged_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(input: MoodLogInput) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("mood_logs")
      .insert({
        id: input.id ?? crypto.randomUUID(),
        user_id: userId,
        ...input,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },
};
