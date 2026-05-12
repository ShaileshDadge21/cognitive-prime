export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      planner_tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          priority: string;
          energy: string;
          category: string | null;
          duration: string;
          duration_min: number;
          energy_load: number;
          complexity: string | null;
          deep_work_intensity: string | null;
          done: boolean;
          scheduled_hour: number | null;
          cognitive_analysis: Json | null;
          cognitive_load: number | null;
          fatigue_score: number | null;
          focus_score: number | null;
          burnout_risk: string | null;
          schedule_suitability: number | null;
          recommended_time_window: string | null;
          recommendation_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["planner_tasks"]["Row"],
          "created_at" | "updated_at"
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<Database["public"]["Tables"]["planner_tasks"]["Row"], "id" | "user_id">
        >;
      };
      scheduled_blocks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          title: string;
          hour: number;
          span: number;
          energy_load: number;
          color: string;
          cognitive_load: number;
          burnout_risk: string;
          focus_score: number;
          recommended_time_window: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scheduled_blocks"]["Row"],
          "created_at" | "updated_at"
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<Database["public"]["Tables"]["scheduled_blocks"]["Row"], "id" | "user_id">
        >;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          frequency: string;
          streak_count: number;
          consistency_score: number;
          cognitive_difficulty: string;
          burnout_impact: string;
          preferred_window: string;
          start_date: string;
          last_completed_at: string | null;
          status: string;
          notes: string | null;
          tags: string[];
          adaptive_recommendation: Json | null;
          predictive_adherence: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["habits"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["habits"]["Row"], "id" | "user_id">>;
      };
      habit_completions: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          completion_date: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["habit_completions"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<
            Database["public"]["Tables"]["habit_completions"]["Row"],
            "id" | "user_id" | "habit_id"
          >
        >;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          mood: string;
          energy_level: string;
          stress_level: string;
          focus_quality: string;
          tags: string[];
          categories: string[];
          sentiment: Json | null;
          burnout_indicators: Json | null;
          cognitive_patterns: Json | null;
          emotional_arc: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["journal_entries"]["Row"],
          "created_at" | "updated_at"
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<Database["public"]["Tables"]["journal_entries"]["Row"], "id" | "user_id">
        >;
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          mood: string;
          mood_score: number | null;
          energy_score: number | null;
          stress_score: number | null;
          focus_score: number | null;
          note: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["mood_logs"]["Row"],
          "created_at" | "updated_at"
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["mood_logs"]["Row"], "id" | "user_id">>;
      };
      analytics_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          type: string;
          metrics: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_snapshots"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<
          Omit<Database["public"]["Tables"]["analytics_snapshots"]["Row"], "id" | "user_id">
        >;
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: string;
          accent: string;
          preferences: Json;
          notification_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_settings"]["Row"],
          "created_at" | "updated_at"
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["user_settings"]["Row"], "user_id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
