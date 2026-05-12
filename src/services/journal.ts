import type { JournalEntry } from "@/components/journal/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/query";
import type { Tables } from "@/types/database";

type JournalRow = Tables<"journal_entries">;

function toEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    mood: row.mood as JournalEntry["mood"],
    energyLevel: row.energy_level as JournalEntry["energyLevel"],
    stressLevel: row.stress_level as JournalEntry["stressLevel"],
    focusQuality: row.focus_quality as JournalEntry["focusQuality"],
    tags: row.tags,
    categories: row.categories as JournalEntry["categories"],
    sentiment: row.sentiment as JournalEntry["sentiment"],
    burnoutIndicators: row.burnout_indicators as JournalEntry["burnoutIndicators"],
    cognitivePatterns: row.cognitive_patterns as JournalEntry["cognitivePatterns"],
    emotionalArc: row.emotional_arc as JournalEntry["emotionalArc"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const journalService = {
  async list() {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(toEntry);
  },

  async upsert(entry: JournalEntry) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from("journal_entries")
      .upsert(toPayload(userId, entry))
      .select("*")
      .single();

    if (error) throw error;
    return toEntry(data);
  },

  async remove(entryId: string) {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", userId)
      .eq("id", entryId);

    if (error) throw error;
  },
};
