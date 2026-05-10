import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, SortAsc, SortDesc, BarChart3 } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-600 mt-1">Build lasting habits with adaptive intelligence</p>
        </div>
        <Button onClick={onAddHabit} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Habits</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHabits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ProgressRing
              progress={analytics.averageConsistency}
              size={40}
              className="text-green-500"
            >
              <span className="text-xs font-bold">{analytics.averageConsistency}%</span>
            </ProgressRing>
            <div>
              <p className="text-sm text-gray-600">Avg Consistency</p>
              <p className="text-lg font-bold text-gray-900">{analytics.averageConsistency}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completedToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600">🔥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.longestStreak}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">My Habits</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Habits */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Habits</h2>
            {filteredHabits.filter((habit) => {
              const today = new Date().toISOString().slice(0, 10);
              return habit.completionHistory.some((c) => c.date === today && c.completed);
            }).length === 0 ? (
              <p className="text-gray-600">No habits completed today yet. Let's get started!</p>
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
          </Card>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Smart Recommendations</h2>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map(({ habit, recommendations: recs }) => (
                  <div key={habit.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{habit.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{recs[0]?.message}</p>
                    </div>
                    <Badge variant="secondary">{recs[0]?.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          {/* Filters and Search */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
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
                  <SelectTrigger className="w-32">
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
                  <SelectTrigger className="w-32">
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
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Habits List */}
          {filteredHabits.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || categoryFilter !== "all" || frequencyFilter !== "all"
                    ? "Try adjusting your filters or search query."
                    : "Start building better habits by adding your first one."}
                </p>
                <Button onClick={onAddHabit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </div>
            </Card>
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

        <TabsContent value="insights" className="space-y-6">
          {/* Habit Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.habitAnalytics.slice(0, 6).map((habitAnalytics) => {
              const habit = habits.find((h) => h.id === habitAnalytics.habitId);
              if (!habit) return null;

              return (
                <Card key={habit.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{habit.title}</h3>
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
                      <span className="text-sm text-gray-600">Consistency</span>
                      <span className="font-medium">{habitAnalytics.consistencyScore}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Completions</span>
                      <span className="font-medium">{habitAnalytics.totalCompletions}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Longest Streak</span>
                      <span className="font-medium">{habitAnalytics.longestStreak}</span>
                    </div>

                    <StreakHeatmap completionHistory={habit.completionHistory} />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
