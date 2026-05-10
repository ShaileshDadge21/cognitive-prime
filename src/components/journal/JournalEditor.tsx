import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { MoodSelector } from "./MoodSelector";
import { useJournalForm, type JournalFormState } from "./use-journal";
import type {
  EnergyLevel,
  FocusQuality,
  JournalCategory,
  JournalEntry,
  MoodType,
  StressLevel,
} from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JournalEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntry?: JournalEntry;
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: (entryId: string) => void;
}

export function JournalEditor({
  open,
  onOpenChange,
  initialEntry,
  onSave,
  onDelete,
}: JournalEditorProps) {
  const form = useJournalForm(initialEntry);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim()) {
      form.addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!form.form.title.trim() || !form.form.content.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        title: form.form.title,
        content: form.form.content,
        mood: form.form.mood,
        energyLevel: form.form.energyLevel,
        stressLevel: form.form.stressLevel,
        focusQuality: form.form.focusQuality,
        tags: form.form.tags,
        categories: form.form.categories,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (initialEntry && onDelete) {
      onDelete(initialEntry.id);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialEntry ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>Reflect on your thoughts, feelings, and experiences</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Mood Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Current Mood</label>
            <MoodSelector
              value={form.form.mood as MoodType}
              onChange={(mood) => form.updateField("mood", mood)}
              size="md"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-gray-900">
              Title
            </label>
            <Input
              id="title"
              placeholder="Give your reflection a title..."
              value={form.form.title}
              onChange={(e) => form.updateField("title", e.target.value)}
              className="text-base"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-semibold text-gray-900">
              What's on your mind?
            </label>
            <Textarea
              id="content"
              placeholder="Write your thoughts, feelings, and observations... AI analysis of your entries will help identify patterns and provide insights."
              value={form.form.content}
              onChange={(e) => form.updateField("content", e.target.value)}
              className="min-h-50 resize-none"
            />
          </div>

          {/* Cognitive Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="energy" className="text-sm font-semibold text-gray-900">
                Energy Level
              </label>
              <Select
                value={form.form.energyLevel}
                onValueChange={(value) => form.updateField("energyLevel", value as EnergyLevel)}
              >
                <SelectTrigger id="energy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-low">Very Low</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very-high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="stress" className="text-sm font-semibold text-gray-900">
                Stress Level
              </label>
              <Select
                value={form.form.stressLevel}
                onValueChange={(value) => form.updateField("stressLevel", value as StressLevel)}
              >
                <SelectTrigger id="stress">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="focus" className="text-sm font-semibold text-gray-900">
                Focus Quality
              </label>
              <Select
                value={form.form.focusQuality}
                onValueChange={(value) => form.updateField("focusQuality", value as FocusQuality)}
              >
                <SelectTrigger id="focus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="exceptional">Exceptional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>

            {form.form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.form.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => form.removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Categories</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "personal",
                  "work",
                  "health",
                  "learning",
                  "relationships",
                  "creative",
                  "reflection",
                  "breakthrough",
                ] as const
              ).map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (form.form.categories.includes(category)) {
                      form.removeCategory(category);
                    } else {
                      form.addCategory(category);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    form.form.categories.includes(category)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {initialEntry && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete
              </Button>
            )}

            <div className="flex-1" />

            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !form.form.title.trim() || !form.form.content.trim()}
            >
              {isSaving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
