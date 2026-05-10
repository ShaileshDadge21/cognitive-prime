import { useState, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { X, Plus, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  HABIT_CATEGORIES,
  HABIT_FREQUENCIES,
  HABIT_DIFFICULTY_ORDER,
  HABIT_BURNOUT_ORDER,
  HABIT_WINDOWS,
  type Habit,
  type HabitCategory,
  type HabitFrequency,
  type HabitDifficulty,
  type HabitBurnoutImpact,
  type ScheduleWindow,
} from "./types";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "updatedAt" | "completionHistory" | "streakCount" | "consistencyScore"
    >,
  ) => void;
  editingHabit?: Habit;
}

export function AddHabitModal({ isOpen, onClose, onAdd, editingHabit }: AddHabitModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    cognitiveDifficulty: HabitDifficulty;
    burnoutImpact: HabitBurnoutImpact;
    notes: string;
    preferredWindow: ScheduleWindow;
    tags: string[];
  }>({
    title: editingHabit?.title || "",
    category: editingHabit?.category || "productivity",
    frequency: editingHabit?.frequency || "daily",
    cognitiveDifficulty: editingHabit?.cognitiveDifficulty || "easy",
    burnoutImpact: editingHabit?.burnoutImpact || "low",
    notes: editingHabit?.notes || "",
    preferredWindow: editingHabit?.preferredWindow || "morning",
    tags: editingHabit?.tags || ([] as string[]),
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.frequency) {
      newErrors.frequency = "Frequency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const habitData = {
      ...formData,
      startDate: new Date().toISOString().slice(0, 10),
      status: "active" as const,
    };

    onAdd(habitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      category: "productivity",
      frequency: "daily",
      cognitiveDifficulty: "easy",
      burnoutImpact: "low",
      notes: "",
      preferredWindow: "morning",
      tags: [],
    });
    setTagInput("");
    setErrors({});
    onClose();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingHabit ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Drink 8 glasses of water"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as HabitCategory }))
                }
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HABIT_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, frequency: value as HabitFrequency }))
                }
              >
                <SelectTrigger className={errors.frequency ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency && <p className="text-sm text-red-600">{errors.frequency}</p>}
            </div>
          </div>

          {/* Difficulty and Burnout Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Cognitive Difficulty</Label>
              <Select
                value={formData.cognitiveDifficulty}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    cognitiveDifficulty: value as HabitDifficulty,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_DIFFICULTY_ORDER.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">How mentally demanding is this habit?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnoutImpact">Burnout Impact</Label>
              <Select
                value={formData.burnoutImpact}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, burnoutImpact: value as HabitBurnoutImpact }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_BURNOUT_ORDER.map((impact) => (
                    <SelectItem key={impact} value={impact}>
                      {impact.charAt(0).toUpperCase() + impact.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">How exhausting is this habit when overdone?</p>
            </div>
          </div>

          {/* Preferred Schedule Window */}
          <div className="space-y-2">
            <Label htmlFor="schedule">Preferred Schedule Window</Label>
            <Select
              value={formData.preferredWindow}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, preferredWindow: value as ScheduleWindow }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time window" />
              </SelectTrigger>
              <SelectContent>
                {HABIT_WINDOWS.map((window) => (
                  <SelectItem key={window} value={window}>
                    {window.charAt(0).toUpperCase() + window.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">When do you prefer to do this habit?</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">Add tags to organize and filter your habits</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this habit..."
              rows={3}
            />
            <p className="text-xs text-gray-500">Any additional context or reminders (Optional)</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">{editingHabit ? "Update Habit" : "Add Habit"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
