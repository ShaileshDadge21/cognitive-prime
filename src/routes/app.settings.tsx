import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { User, Bell, Palette, Brain, Shield, ChevronRight, Check } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { authClient } from "@/lib/auth/client";
import { integrationStatus } from "@/lib/config/env";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { settingsService } from "@/services/settings";
import type { InputHTMLAttributes } from "react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings · NeuroFlow AI" }] }),
  component: SettingsPage,
});

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "cognitive", label: "Cognitive tuning", icon: Brain },
  { id: "privacy", label: "Privacy", icon: Shield },
];

function SettingsPage() {
  const [active, setActive] = useState("profile");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accent, setAccent] = useState<"coral" | "electric" | "violet">("coral");
  const [notif, setNotif] = useState({
    focus: true,
    breaks: true,
    mood: false,
    weekly: true,
    ai: true,
  });
  const [tuning, setTuning] = useState({
    intensity: 70,
    breakFreq: 50,
    aiVoice: 60,
    fatigueGuard: 80,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cloudEnabled = isSupabaseConfigured();

  useEffect(() => {
    const loadSettings = async () => {
      if (!cloudEnabled) {
        setLoading(false);
        return;
      }

      try {
        const settings = await settingsService.get();
        if (settings) {
          setTheme(settings.theme as "dark" | "light" | "system");
          setAccent(settings.accent as "coral" | "electric" | "violet");
          setNotif(settings.notification_settings as typeof notif);
          setTuning(settings.preferences as typeof tuning);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [cloudEnabled]);

  const saveSettings = useCallback(async () => {
    if (!cloudEnabled) return;

    setSaving(true);
    setError(null);

    try {
      await settingsService.upsert({
        theme,
        accent,
        preferences: tuning,
        notification_settings: notif,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [cloudEnabled, theme, accent, tuning, notif]);

  useEffect(() => {
    if (cloudEnabled && !loading) {
      const timeoutId = setTimeout(saveSettings, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [saveSettings, cloudEnabled, loading]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Tune your cognitive workspace."
        subtitle="Personalize how NeuroFlow learns, nudges, and adapts to your mind."
      />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-3 h-fit">
          <nav className="space-y-1">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-white/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  }`}
                >
                  <s.icon className={`h-4 w-4 ${isActive ? "text-coral" : ""}`} />
                  <span className="flex-1 text-left">{s.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                </button>
              );
            })}
          </nav>
        </GlassCard>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          {active === "profile" && (
            <GlassCard>
              <SectionHeader title="Profile" sub="How you appear in the system" />
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-coral via-violet to-electric" />
                <div>
                  <button className="px-3 py-1.5 rounded-lg glass text-xs">Change avatar</button>
                  <div className="text-xs text-muted-foreground mt-2">JPG or PNG, max 2MB</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Field label="Full name" defaultValue="Abdo Hassan" />
                <Field label="Email" defaultValue="abdo@neuroflow.ai" />
                <Field label="Role" defaultValue="Founder" />
                <Field label="Timezone" defaultValue="GMT+1 · Cairo" />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => authClient.signOut()}
                  className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition"
                >
                  Sign out
                </button>
                <button className="px-4 py-2 rounded-xl glass text-sm">Cancel</button>
                <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium">
                  Save
                </button>
              </div>
            </GlassCard>
          )}

          {active === "profile" && (
            <GlassCard>
              <SectionHeader
                title="Integrations"
                sub="Environment readiness for backend services"
              />
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-surface/50 border border-white/10">
                  <div className="text-xs text-muted-foreground">Supabase authentication</div>
                  <div
                    className={`mt-1 text-sm ${integrationStatus.supabaseConfigured ? "text-coral" : "text-muted-foreground"}`}
                  >
                    {integrationStatus.supabaseConfigured
                      ? "Configured"
                      : "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface/50 border border-white/10">
                  <div className="text-xs text-muted-foreground">Gemini assistant</div>
                  <div
                    className={`mt-1 text-sm ${integrationStatus.geminiConfigured ? "text-coral" : "text-muted-foreground"}`}
                  >
                    {integrationStatus.geminiConfigured
                      ? "Configured"
                      : "Missing VITE_GEMINI_API_KEY"}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {active === "appearance" && (
            <GlassCard>
              <SectionHeader title="Appearance" sub="Theme and accent for your interface" />
              <div className="text-xs text-muted-foreground mb-2">Theme</div>
              <div className="grid grid-cols-3 gap-3">
                {(["dark", "light", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`p-4 rounded-2xl border transition text-left capitalize ${
                      theme === t
                        ? "border-coral/60 bg-coral/10"
                        : "border-white/5 bg-surface/40 hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`h-16 rounded-xl mb-3 ${
                        t === "dark"
                          ? "bg-gradient-to-br from-[oklch(0.16_0.008_270)] to-[oklch(0.21_0.01_270)]"
                          : t === "light"
                            ? "bg-gradient-to-br from-white to-slate-200"
                            : "bg-gradient-to-r from-[oklch(0.16_0.008_270)] via-slate-400 to-white"
                      }`}
                    />
                    <div className="text-sm flex items-center justify-between">
                      {t}
                      {theme === t && <Check className="h-4 w-4 text-coral" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mt-6 mb-2">Accent</div>
              <div className="flex gap-3">
                {(["coral", "electric", "violet"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`h-12 w-12 rounded-2xl border-2 transition ${
                      accent === c ? "border-foreground" : "border-transparent"
                    } ${c === "coral" ? "bg-coral" : c === "electric" ? "bg-electric" : "bg-violet"}`}
                  />
                ))}
              </div>
            </GlassCard>
          )}

          {active === "notifications" && (
            <GlassCard>
              <SectionHeader title="Notifications" sub="Decide when NeuroFlow speaks up" />
              <div className="space-y-1">
                <Toggle
                  label="Focus window starting"
                  sub="Heads-up before your peak hours"
                  value={notif.focus}
                  onChange={(v) => setNotif({ ...notif, focus: v })}
                />
                <Toggle
                  label="Break reminders"
                  sub="Gentle nudges to stand, breathe, hydrate"
                  value={notif.breaks}
                  onChange={(v) => setNotif({ ...notif, breaks: v })}
                />
                <Toggle
                  label="Mood check-ins"
                  sub="Twice-daily emotional pulse check"
                  value={notif.mood}
                  onChange={(v) => setNotif({ ...notif, mood: v })}
                />
                <Toggle
                  label="Weekly cognitive report"
                  sub="Sunday morning summary"
                  value={notif.weekly}
                  onChange={(v) => setNotif({ ...notif, weekly: v })}
                />
                <Toggle
                  label="AI insights"
                  sub="Patterns the AI discovered about you"
                  value={notif.ai}
                  onChange={(v) => setNotif({ ...notif, ai: v })}
                />
              </div>
            </GlassCard>
          )}

          {active === "cognitive" && (
            <GlassCard>
              <SectionHeader title="Cognitive tuning" sub="Calibrate how NeuroFlow adapts to you" />
              <div className="space-y-6">
                <Slider
                  label="Focus session intensity"
                  sub="Length and depth of deep work blocks"
                  value={tuning.intensity}
                  onChange={(v) => setTuning({ ...tuning, intensity: v })}
                />
                <Slider
                  label="Break frequency"
                  sub="How often the AI suggests recovery"
                  value={tuning.breakFreq}
                  onChange={(v) => setTuning({ ...tuning, breakFreq: v })}
                />
                <Slider
                  label="AI voice"
                  sub="From quiet observer → active coach"
                  value={tuning.aiVoice}
                  onChange={(v) => setTuning({ ...tuning, aiVoice: v })}
                />
                <Slider
                  label="Fatigue guard"
                  sub="Aggressiveness of burnout protection"
                  value={tuning.fatigueGuard}
                  onChange={(v) => setTuning({ ...tuning, fatigueGuard: v })}
                />
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-coral/10 to-electric/10 border border-white/10 text-sm">
                Your current profile: <span className="text-coral">Deep Operator</span> — long
                sessions, low interruption, strong fatigue guard.
              </div>
            </GlassCard>
          )}

          {active === "privacy" && (
            <GlassCard>
              <SectionHeader title="Privacy" sub="You own every signal" />
              <div className="space-y-3 text-sm">
                <Row label="Export all my data" cta="Download" />
                <Row label="Anonymous analytics" cta="On" />
                <Row label="Delete account" cta="Request" danger />
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl bg-surface/60 border border-white/10 focus:border-coral/40 focus:outline-none text-sm"
      />
    </label>
  );
}

function Toggle({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-coral" : "bg-surface-2"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition ${value ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
        </div>
        <div className="text-sm text-coral">{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full mt-3 accent-coral"
      />
    </div>
  );
}

function Row({ label, cta, danger }: { label: string; cta: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-white/5">
      <div className={`text-sm ${danger ? "text-destructive" : ""}`}>{label}</div>
      <button
        className={`text-xs px-3 py-1.5 rounded-full ${danger ? "bg-destructive/15 text-destructive" : "glass"}`}
      >
        {cta}
      </button>
    </div>
  );
}
