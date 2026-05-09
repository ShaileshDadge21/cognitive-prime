import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { NotebookPen, Sparkles, Send, Smile, Cloud, Sun, Moon } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";

export const Route = createFileRoute("/app/journal")({
  head: () => ({ meta: [{ title: "Journal · NeuroFlow AI" }] }),
  component: JournalPage,
});

const prompts = [
  "What drained you most today?",
  "Which task gave you flow?",
  "What would you redesign about today?",
  "What did you learn about yourself?",
];

const entries = [
  {
    date: "Today · 9:14 AM",
    mood: "Focused",
    icon: Sun,
    snippet: "Started the day with a clear intention. The morning walk helped me arrive at the desk already in flow.",
    tags: ["Morning", "Flow", "Clarity"],
  },
  {
    date: "Yesterday · 8:42 PM",
    mood: "Reflective",
    icon: Moon,
    snippet: "Noticed I context-switched too much in the afternoon. Going to batch reviews into a single block tomorrow.",
    tags: ["Reflection", "Workflow"],
  },
  {
    date: "Thursday · 7:30 AM",
    mood: "Calm",
    icon: Cloud,
    snippet: "Slept 8h. Mental clarity is noticeably higher. The AI suggested protecting this 9–11 AM window for deep work.",
    tags: ["Sleep", "Recovery"],
  },
];

function JournalPage() {
  const [text, setText] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { from: "ai", text: "Take a breath. What's the most honest sentence you could write about today?" },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setAiMessages((m) => [
      ...m,
      { from: "user", text: draft },
      { from: "ai", text: "Mm. I notice that pattern showing up across your last three entries. Want to explore what's underneath it?" },
    ]);
    setDraft("");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Journal"
        title="Think out loud. Let the AI listen."
        subtitle="Daily reflections feed NeuroFlow's understanding of your patterns, blockers, and inner wins."
        actions={
          <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium flex items-center gap-2">
            <NotebookPen className="h-4 w-4" /> New entry
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-7">
          <SectionHeader
            title="Today's reflection"
            sub="Saturday · May 9 · auto-saving"
            action={<span className="text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI prompts on</span>}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Begin writing. The AI will surface patterns, never interrupt..."
            className="w-full min-h-[260px] px-5 py-4 rounded-2xl bg-surface/50 border border-white/10 focus:border-coral/40 focus:outline-none text-sm leading-relaxed resize-none"
          />
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Try a prompt</div>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setText((t) => (t ? t + "\n\n" + p + "\n" : p + "\n"))}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface/60 border border-white/5 hover:bg-white/5 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral to-electric text-background font-medium">Save entry</button>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-5 flex flex-col">
          <SectionHeader title="Reflection assistant" sub="A gentle, curious AI · not a critic" />
          <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {aiMessages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-surface/70 border border-white/5 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="mt-4 flex items-center gap-2 p-2 rounded-2xl bg-surface/60 border border-white/10 focus-within:border-coral/40 transition"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Reply to the assistant…"
              className="flex-1 bg-transparent px-2 text-sm focus:outline-none"
            />
            <button className="h-8 w-8 rounded-full bg-coral text-background flex items-center justify-center">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </GlassCard>

        <GlassCard className="col-span-12">
          <SectionHeader title="Recent entries" sub="Your reflective archive" />
          <div className="grid md:grid-cols-3 gap-4">
            {entries.map((e, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl bg-surface/40 border border-white/5 hover:border-white/15 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <e.icon className="h-3.5 w-3.5" />
                  {e.date}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-coral" />
                  <span className="text-sm">{e.mood}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{e.snippet}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
