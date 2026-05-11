import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Download, Upload } from "lucide-react";
import { PageShell, PageHeader, GlassCard, SectionHeader } from "@/components/PageShell";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalTimeline } from "@/components/journal/JournalTimeline";
import { CognitiveTrends } from "@/components/journal/CognitiveTrends";
import { useJournal } from "@/components/journal/use-journal";
import {
  saveJournalEntry,
  deleteJournalEntry,
  getAverageMetrics,
  exportJournalData,
  importJournalData,
} from "@/components/journal/journal-storage";
import type { JournalCategory, JournalEntry, JournalSearchQuery } from "@/components/journal/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/journal")({
  head: () => ({ meta: [{ title: "Cognitive Journal · NeuroFlow AI" }] }),
  component: JournalPage,
});

function JournalPage() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [searchText, setSearchText] = useState("");
  const [filterMood, setFilterMood] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<JournalCategory | "">("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isExporting, setIsExporting] = useState(false);
  const { entries, isHydrated, saveEntry, deleteEntry } = useJournal();

  // Search and filter
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Text search
    if (searchText) {
      const lowerText = searchText.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerText) || e.content.toLowerCase().includes(lowerText),
      );
    }

    // Mood filter
    if (filterMood) {
      filtered = filtered.filter((e) => e.mood === filterMood);
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((e) => e.categories.includes(filterCategory));
    }

    // Sort
    if (sortBy === "oldest") {
      filtered.reverse();
    }

    return filtered;
  }, [entries, searchText, filterMood, filterCategory, sortBy]);

  const metrics = getAverageMetrics(30);

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setEditorOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditorOpen(true);
  };

  const handleSaveEntry = (data: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();

    if (editingEntry) {
      // Update existing entry
      saveEntry({
        ...editingEntry,
        ...data,
        updatedAt: now,
      });
    } else {
      // Create new entry
      saveEntry({
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    setEditingEntry(undefined);
    setEditorOpen(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = exportJournalData();
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
      element.setAttribute(
        "download",
        `journal-backup-${new Date().toISOString().split("T")[0]}.json`,
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        if (importJournalData(text)) {
          // Force refresh by reloading the page
          window.location.reload();
        } else {
          alert("Failed to import journal data. Please check the file format.");
        }
      }
    };
    input.click();
  };

  if (!isHydrated) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="COGNITIVE REFLECTION"
        title="Journal"
        subtitle="Track your thoughts, emotions, and cognitive patterns for deeper self-understanding"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportData}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button onClick={handleNewEntry} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Entry
            </Button>
          </div>
        }
      />

      <JournalEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialEntry={editingEntry}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />

      {entries.length === 0 ? (
        <GlassCard>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Begin Your Journey</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start journaling today to track your cognitive patterns, emotional well-being, and
              personal growth.
            </p>
            <Button onClick={handleNewEntry} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create First Entry
            </Button>
          </motion.div>
        </GlassCard>
      ) : (
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="trends">Cognitive Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <GlassCard>
              <SectionHeader title="Search & Filter" sub="Find and organize your entries" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterMood} onValueChange={setFilterMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Moods</SelectItem>
                    <SelectItem value="elated">Elated 🤩</SelectItem>
                    <SelectItem value="optimistic">Optimistic 😊</SelectItem>
                    <SelectItem value="calm">Calm 😌</SelectItem>
                    <SelectItem value="neutral">Neutral 😐</SelectItem>
                    <SelectItem value="anxious">Anxious 😰</SelectItem>
                    <SelectItem value="frustrated">Frustrated 😤</SelectItem>
                    <SelectItem value="overwhelmed">Overwhelmed 😵</SelectItem>
                    <SelectItem value="exhausted">Exhausted 😴</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterCategory}
                  onValueChange={(value) => setFilterCategory(value as JournalCategory | "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="reflection">Reflection</SelectItem>
                    <SelectItem value="breakthrough">Breakthrough</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(val) => setSortBy(val as "newest" | "oldest")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600 mt-3">
                Showing {filteredEntries.length} of {entries.length} entries
              </div>
            </GlassCard>

            <GlassCard>
              <JournalTimeline
                entries={filteredEntries}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </GlassCard>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <GlassCard>
              <SectionHeader
                title="Cognitive Trends"
                sub="Analyze your emotional and cognitive patterns over time"
              />
              <div className="mt-6">
                <CognitiveTrends entries={entries} />
              </div>
            </GlassCard>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Statistics */}
              <GlassCard>
                <SectionHeader title="Statistics" sub="Last 30 days" />
                {metrics && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Entries</p>
                      <p className="text-3xl font-bold text-gray-900">{metrics.totalEntries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Energy</p>
                      <p className="text-3xl font-bold text-green-600">{metrics.averageEnergy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Stress</p>
                      <p className="text-3xl font-bold text-red-600">{metrics.averageStress}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Focus</p>
                      <p className="text-3xl font-bold text-blue-600">{metrics.averageFocus}%</p>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Coming Soon Features */}
              <GlassCard className="md:col-span-2">
                <SectionHeader
                  title="AI Features (Coming Soon)"
                  sub="Enhanced analysis with machine learning"
                />
                <div className="space-y-3 mt-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-blue-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-blue-900">✨ Sentiment Analysis</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Analyze emotional tone across your entries
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-3 bg-purple-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-purple-900">🔮 Burnout Prediction</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Early warning indicators for burnout risk
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-orange-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-orange-900">📊 Weekly Summaries</p>
                    <p className="text-xs text-orange-700 mt-1">
                      AI-generated insights and recommendations
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-3 bg-green-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-green-900">🎯 Pattern Detection</p>
                    <p className="text-xs text-green-700 mt-1">
                      Identify cognitive and emotional triggers
                    </p>
                  </motion.div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </PageShell>
  );
}
