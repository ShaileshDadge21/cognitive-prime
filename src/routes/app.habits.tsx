import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/PageShell";
import { HabitDashboard } from "@/components/habits/HabitDashboard";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { useHabits } from "@/components/habits/use-habits";
import { type Habit } from "@/components/habits/types";

export const Route = createFileRoute("/app/habits")({
  component: HabitsPage,
});

function HabitsPage() {
  const { addHabit, updateHabit } = useHabits();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const handleAddHabit = (
    habitData: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "completionHistory" | "streakCount" | "consistencyScore"
    >,
  ) => {
    addHabit(habitData);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleUpdateHabit = (
    habitData: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "completionHistory" | "streakCount" | "consistencyScore"
    >,
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      setEditingHabit(undefined);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingHabit(undefined);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Habit Formation"
        title="Build lasting habits with adaptive intelligence."
        subtitle="Cognitive-aware habit tracking with burnout protection, streak analysis, and AI-powered recommendations."
      />

      <HabitDashboard onAddHabit={() => setIsAddModalOpen(true)} onEditHabit={handleEditHabit} />

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAdd={editingHabit ? handleUpdateHabit : handleAddHabit}
        editingHabit={editingHabit}
      />
    </PageShell>
  );
}
