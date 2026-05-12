import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Inserts } from "@/types/database";

export const analyticsSnapshotService = {
  async create(input: Omit<Inserts<"analytics_snapshots">, "id" | "user_id"> & { id?: string }) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("analytics_snapshots")
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
