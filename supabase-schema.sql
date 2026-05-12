-- NeuroFlow AI Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'productivity', 'learning', 'social', 'creative', 'spiritual', 'other')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  streak_count INTEGER DEFAULT 0,
  consistency_score DECIMAL(3,2) DEFAULT 0.00,
  cognitive_difficulty TEXT NOT NULL CHECK (cognitive_difficulty IN ('low', 'medium', 'high')),
  burnout_impact TEXT NOT NULL CHECK (burnout_impact IN ('low', 'medium', 'high')),
  preferred_window TEXT NOT NULL CHECK (preferred_window IN ('morning', 'afternoon', 'evening', 'anytime')),
  start_date DATE NOT NULL,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  adaptive_recommendation JSONB,
  predictive_adherence JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habit completions table
CREATE TABLE habit_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completion_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(habit_id, completion_date)
);

-- Planner tasks table
CREATE TABLE planner_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  energy TEXT NOT NULL CHECK (energy IN ('low', 'medium', 'high')),
  category TEXT,
  duration TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  energy_load INTEGER NOT NULL,
  complexity TEXT,
  deep_work_intensity TEXT,
  done BOOLEAN DEFAULT FALSE,
  scheduled_hour INTEGER,
  cognitive_analysis JSONB,
  cognitive_load INTEGER,
  fatigue_score INTEGER,
  focus_score INTEGER,
  burnout_risk TEXT,
  schedule_suitability INTEGER,
  recommended_time_window TEXT,
  recommendation_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Scheduled blocks table
CREATE TABLE scheduled_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES planner_tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  hour INTEGER NOT NULL,
  span INTEGER NOT NULL,
  energy_load INTEGER NOT NULL,
  color TEXT NOT NULL,
  cognitive_load INTEGER NOT NULL,
  burnout_risk TEXT NOT NULL,
  focus_score INTEGER NOT NULL,
  recommended_time_window TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('ecstatic', 'happy', 'content', 'neutral', 'sad', 'anxious', 'angry', 'focused', 'tired', 'energetic')),
  energy_level TEXT NOT NULL CHECK (energy_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
  stress_level TEXT NOT NULL CHECK (stress_level IN ('minimal', 'low', 'moderate', 'high', 'critical')),
  focus_quality TEXT NOT NULL CHECK (focus_quality IN ('poor', 'fair', 'good', 'excellent')),
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  sentiment JSONB,
  burnout_indicators JSONB,
  cognitive_patterns JSONB,
  emotional_arc JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mood logs table
CREATE TABLE mood_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  mood TEXT NOT NULL,
  mood_score INTEGER,
  energy_score INTEGER,
  stress_score INTEGER,
  focus_score INTEGER,
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Analytics snapshots table
CREATE TABLE analytics_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  type TEXT NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'dark',
  accent TEXT NOT NULL DEFAULT 'coral',
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for habits
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Users can view own habit completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit completions" ON habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for planner_tasks
CREATE POLICY "Users can view own planner tasks" ON planner_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own planner tasks" ON planner_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own planner tasks" ON planner_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own planner tasks" ON planner_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled_blocks
CREATE POLICY "Users can view own scheduled blocks" ON scheduled_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled blocks" ON scheduled_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled blocks" ON scheduled_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled blocks" ON scheduled_blocks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mood_logs
CREATE POLICY "Users can view own mood logs" ON mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood logs" ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood logs" ON mood_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood logs" ON mood_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view own analytics snapshots" ON analytics_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics snapshots" ON analytics_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics snapshots" ON analytics_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analytics snapshots" ON analytics_snapshots FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX habits_user_id_idx ON habits(user_id);
CREATE INDEX habits_user_id_status_idx ON habits(user_id, status);
CREATE INDEX habit_completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX habit_completions_habit_id_date_idx ON habit_completions(habit_id, completion_date);
CREATE INDEX planner_tasks_user_id_idx ON planner_tasks(user_id);
CREATE INDEX scheduled_blocks_user_id_idx ON scheduled_blocks(user_id);
CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_user_id_created_at_idx ON journal_entries(user_id, created_at DESC);
CREATE INDEX mood_logs_user_id_idx ON mood_logs(user_id);
CREATE INDEX mood_logs_user_id_logged_at_idx ON mood_logs(user_id, logged_at DESC);
CREATE INDEX analytics_snapshots_user_id_idx ON analytics_snapshots(user_id);
CREATE INDEX user_settings_user_id_idx ON user_settings(user_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_habits BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_habit_completions BEFORE UPDATE ON habit_completions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_planner_tasks BEFORE UPDATE ON planner_tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_scheduled_blocks BEFORE UPDATE ON scheduled_blocks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_journal_entries BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_mood_logs BEFORE UPDATE ON mood_logs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_user_settings BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();