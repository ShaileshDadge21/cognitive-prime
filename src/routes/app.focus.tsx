/**
 * Deep Work Operating System
 * Immersive focus sessions with cognitive optimization
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { History, CheckCircle2 } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { FocusTimer } from "@/components/focus/FocusTimer";
import { FocusSession } from "@/components/focus/types";
import {
  FocusStreakCard,
  FatigueCard,
  SessionMetricsCard,
  WeeklyStatsCard,
  BestTimeCard,
} from "@/components/focus/FocusAnalyticsCards";
import {
  useFocusSession,
  useFocusTimer,
  useFocusSessions,
  useCognitiveFatigue,
  useFocusStreak,
  useSessionMetrics,
} from "@/components/focus/use-focus";

export const Route = createFileRoute("/app/focus")({
  head: () => ({ meta: [{ title: "Focus · NeuroFlow AI" }] }),
  component: FocusPage,
});

function FocusPage() {
  const {
    currentSession,
    loading: sessionLoading,
    createSession,
    updateSession,
    completeSession,
    abandonSession,
  } = useFocusSession();

  const timer = useFocusTimer(currentSession?.plannedDuration ?? 25, currentSession?.id);

  const { sessions, todaySessions, loading: sessionsLoading, refetch } = useFocusSessions();

  const fatigue = useCognitiveFatigue(sessions);
  const streak = useFocusStreak(sessions);
  const metrics = useSessionMetrics(sessions);

  const [durationInput, setDurationInput] = useState("25");
  const [titleInput, setTitleInput] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | undefined>();
  const [focusQuality, setFocusQuality] = useState<number | undefined>();
  const [moodAfter, setMoodAfter] = useState<string | undefined>();
  const [sessionNotes, setSessionNotes] = useState("");
  const [showSessionForm, setShowSessionForm] = useState(!currentSession);

  const handleStartSession = useCallback(async () => {
    const duration = parseInt(durationInput, 10) || 25;
    const title = titleInput.trim() || `Focus Session (${duration}m)`;

    try {
      await createSession(title, duration, selectedTask);
      setTitleInput("");
      setShowSessionForm(false);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, [durationInput, titleInput, selectedTask, createSession]);

  const handleEndSession = useCallback(async () => {
    if (!currentSession || !focusQuality) return;

    try {
      const actualDuration = Math.floor(timer.elapsedSeconds / 60);
      await completeSession(focusQuality, moodAfter || "neutral", sessionNotes || undefined);

      await updateSession({
        actualDuration,
        endTime: new Date(),
      } as Partial<FocusSession>);

      // Reset form
      setFocusQuality(undefined);
      setMoodAfter(undefined);
      setSessionNotes("");
      timer.reset();
      setShowSessionForm(true);

      // Refetch sessions
      await refetch();
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  }, [
    currentSession,
    focusQuality,
    moodAfter,
    sessionNotes,
    timer,
    completeSession,
    updateSession,
    refetch,
  ]);

  const handleAbandonSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await abandonSession();
      timer.reset();
      setShowSessionForm(true);
      await refetch();
    } catch (err) {
      console.error("Failed to abandon session:", err);
    }
  }, [currentSession, abandonSession, timer, refetch]);

  const bestQuality =
    sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.focusQuality ?? 5), 0) / sessions.length)
      : 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Deep Work"
        title="Enter the zone."
        subtitle="Optimized focus sessions tailored to your cognitive capacity and recovery needs."
        actions={
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-foreground/10 text-foreground text-sm font-medium flex items-center gap-2 hover:bg-foreground/20 transition-colors">
              <History className="h-4 w-4" /> History
            </button>
          </div>
        }
      />

      {/* Active Session */}
      {currentSession ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-12"
        >
          <GlassCard className="bg-gradient-to-br from-violet-500/5 to-violet-600/5 border-violet-500/20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{currentSession.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Started {new Date(currentSession.startTime).toLocaleTimeString()}
              </p>
            </div>

            <FocusTimer
              elapsedSeconds={timer.elapsedSeconds}
              totalSeconds={timer.totalSeconds}
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
              remainingSeconds={timer.remainingSeconds}
              progress={timer.progress}
              pauseCount={timer.pauseCount}
              onStart={timer.start}
              onPause={timer.pause}
              onResume={timer.resume}
              onReset={timer.reset}
              onStop={() => {
                if (!timer.isRunning && !timer.isPaused && timer.elapsedSeconds > 0) {
                  // Ask for feedback
                  setShowSessionForm(false);
                } else {
                  timer.pause();
                }
              }}
            />

            {/* Session completion form */}
            {!timer.isRunning && timer.elapsedSeconds > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-white/10 space-y-6"
              >
                <h3 className="font-semibold">How was your focus?</h3>

                {/* Focus Quality */}
                <div>
                  <label className="block text-sm font-medium mb-3">Focus Quality (1-10)</label>
                  <div className="flex gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setFocusQuality(i + 1)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          focusQuality === i + 1
                            ? "bg-violet-500 text-white"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood After */}
                <div>
                  <label className="block text-sm font-medium mb-3">How do you feel now?</label>
                  <div className="flex gap-2 flex-wrap">
                    {["energized", "calm", "neutral", "tired", "stressed"].map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setMoodAfter(mood)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                          moodAfter === mood
                            ? "bg-coral text-white"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="What did you accomplish? Any blockers?"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm resize-none h-20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEndSession}
                    disabled={!focusQuality}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Session
                  </button>
                  <button
                    onClick={handleAbandonSession}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 font-semibold hover:bg-red-500/30 transition-colors"
                  >
                    Abandon
                  </button>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      ) : null}

      {/* New Session Form */}
      {!currentSession && showSessionForm ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard>
            <SectionHeader
              title="Start a Deep Work Session"
              sub="Configure your focus session parameters"
            />

            <div className="space-y-6 mt-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Session Title</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g., Design system overhaul, Report writing"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Session Duration (minutes)</label>
                <div className="flex gap-3">
                  {[15, 25, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDurationInput(String(dur))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        durationInput === String(dur)
                          ? "bg-violet-500 text-white"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm"
                    placeholder="Custom"
                  />
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                Begin Focus Session
              </button>
            </div>
          </GlassCard>
        </motion.div>
      ) : null}

      {/* Analytics Grid */}
      {!showSessionForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-12 gap-6"
        >
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <FocusStreakCard streak={streak} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <FatigueCard fatigue={fatigue} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <SessionMetricsCard metrics={metrics} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <WeeklyStatsCard
              totalMinutes={streak.totalDeepWorkMinutesThisWeek}
              sessionCount={streak.totalSessionsThisWeek}
            />
          </div>

          {/* Today's Sessions */}
          {todaySessions.length > 0 && (
            <GlassCard className="col-span-12">
              <SectionHeader
                title="Today's Sessions"
                sub={`${todaySessions.length} session${todaySessions.length !== 1 ? "s" : ""} completed`}
              />

              <div className="space-y-3 mt-6">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.actualDuration ?? 0} min • Quality:{" "}
                        <span className="font-semibold">{session.focusQuality ?? "-"}/10</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">✓</p>
                      <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </PageShell>
  );
}
