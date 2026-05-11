import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SortAsc,
  SortDesc,
  BarChart3,
  Target,
  Flame,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitCard } from "./HabitCard";
import { StreakIndicator, StreakHeatmap, ProgressRing } from "./StreakIndicator";
import { HabitAnalyticsDashboard } from "./HabitAnalyticsDashboard";
import {
  useHabits,
  useHabitSearch,
  useHabitAnalytics,
  useHabitRecommendations,
} from "./use-habits";
import { HABIT_CATEGORIES, type Habit } from "./types";

interface HabitDashboardProps {
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
}

export function HabitDashboard({ onAddHabit, onEditHabit }: HabitDashboardProps) {
  const { habits, loading, error, completeHabit, deleteHabit } = useHabits();
  const analytics = useHabitAnalytics(habits);
  const recommendations = useHabitRecommendations(habits);

  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    frequencyFilter,
    setFrequencyFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredHabits,
  } = useHabitSearch(habits);

  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Card className="rounded-3xl border-white/10 bg-surface/80 p-6 text-center shadow-soft">
          <p className="text-red-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const handleCompleteHabit = (habitId: string, date: string, completed: boolean) => {
    completeHabit(habitId, date, completed);
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Target className="h-3.5 w-3.5" />
              Total habits
            </div>
            <div className="text-2xl font-bold text-foreground">{analytics.totalHabits}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Completed today
            </div>
            <div className="text-2xl font-bold text-foreground">{analytics.completedToday}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Flame className="h-3.5 w-3.5" />
              Longest streak
            </div>
            <div className="text-2xl font-bold text-foreground">{analytics.longestStreak}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Avg consistency
            </div>
            <div className="text-2xl font-bold text-foreground">
              {analytics.averageConsistency}%
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/50 border border-white/10">
          <div className="text-xs text-muted-foreground mb-2">Consistency & completion rates</div>
          <div className="grid gap-2">
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-coral via-electric to-violet"
                style={{ width: `${analytics.averageConsistency}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Consistency: {analytics.averageConsistency}%</span>
              <span>
                Completion rate:{" "}
                {analytics.totalHabits > 0
                  ? Math.round((analytics.completedToday / analytics.totalHabits) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex rounded-2xl bg-surface/40 border border-white/5 p-1">
            {[
              { value: "overview", label: "Overview" },
              { value: "habits", label: "My habits" },
              { value: "analytics", label: "Analytics" },
              { value: "insights", label: "Insights" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Habits */}
          <div className="p-6 rounded-2xl bg-surface/40 border border-white/5">
            <h2 className="text-xl font-semibold text-foreground mb-4">Today's habits</h2>
            {filteredHabits.filter((habit) => {
              const today = new Date().toISOString().slice(0, 10);
              return habit.completionHistory.some((c) => c.date === today && c.completed);
            }).length === 0 ? (
              <p className="text-muted-foreground">
                No habits completed today yet. Let's get started!
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredHabits
                  .filter((habit) => {
                    const today = new Date().toISOString().slice(0, 10);
                    return habit.completionHistory.some((c) => c.date === today && c.completed);
                  })
                  .map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onComplete={handleCompleteHabit}
                      onEdit={onEditHabit}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-6 rounded-2xl bg-surface/40 border border-white/5">
              <h2 className="text-xl font-semibold text-foreground mb-4">Smart recommendations</h2>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map(({ habit, recommendations: recs }) => (
                  <div
                    key={habit.id}
                    className="p-4 rounded-2xl bg-linear-to-br from-coral/10 to-electric/10 border border-white/10"
                  >
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Target className="h-4 w-4 text-electric" />
                      <span className="font-medium">{habit.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {recs[0]?.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          {/* Filters and Search */}
          <div className="p-4 rounded-2xl bg-surface/40 border border-white/5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32 bg-background/50 border-white/10">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(HABIT_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                  <SelectTrigger className="w-32 bg-background/50 border-white/10">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "created" | "title" | "streak" | "consistency")
                  }
                >
                  <SelectTrigger className="w-32 bg-background/50 border-white/10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="consistency">Consistency</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="bg-background/50 border-white/10"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Habits List */}
          {filteredHabits.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface/40 border border-white/5 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-surface/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No habits found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || categoryFilter !== "all" || frequencyFilter !== "all"
                    ? "Try adjusting your filters or search query."
                    : "Start building better habits by adding your first one."}
                </p>
                <button
                  onClick={onAddHabit}
                  className="text-xs px-4 py-2 rounded-full glass flex items-center gap-1 mx-auto"
                >
                  <Plus className="h-3 w-3" /> Add your first habit
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onEdit={onEditHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <HabitAnalyticsDashboard habits={habits} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Habit Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.habitAnalytics.slice(0, 6).map((habitAnalytics) => {
              const habit = habits.find((h) => h.id === habitAnalytics.habitId);
              if (!habit) return null;

              return (
                <div key={habit.id} className="p-6 rounded-2xl bg-surface/40 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{habit.title}</h3>
                    <StreakIndicator
                      streak={habit.streakCount}
                      level={
                        habit.streakCount >= 100
                          ? "legendary"
                          : habit.streakCount >= 50
                            ? "epic"
                            : habit.streakCount >= 25
                              ? "rare"
                              : habit.streakCount >= 7
                                ? "uncommon"
                                : "common"
                      }
                      isActive={habit.streakCount > 0}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Consistency</span>
                      <span className="font-medium">{habitAnalytics.consistencyScore}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Completions</span>
                      <span className="font-medium">{habitAnalytics.totalCompletions}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <span className="font-medium">{habitAnalytics.longestStreak}</span>
                    </div>

                    <StreakHeatmap completionHistory={habit.completionHistory} />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
