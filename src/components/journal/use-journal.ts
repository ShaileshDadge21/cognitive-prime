import { useState, useCallback, useEffect, useRef } from "react";
import { createDebouncedWriter } from "@/lib/storage";
import type {
  EnergyLevel,
  FocusQuality,
  JournalCategory,
  JournalEntry,
  JournalSearchQuery,
  MoodType,
  StressLevel,
} from "./types";
import {
  loadJournalEntries,
  saveJournalEntry as storageSave,
  deleteJournalEntry as storageDelete,
  searchJournalEntries,
  getJournalEntry,
  getAllTags,
} from "./journal-storage";

/**
 * Hook for managing journal entries
 */
export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveDebounced = useRef(createDebouncedWriter(storageToFile, 300));

  /**
   * Save a journal entry (create or update)
   */
  const saveEntry = useCallback((entry: JournalEntry) => {
    const saved = storageSave(entry);
    setEntries((prev) => {
      const existing = prev.findIndex((e) => e.id === saved.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    return saved;
  }, []);

  /**
   * Delete a journal entry
   */
  const deleteEntry = useCallback((entryId: string) => {
    storageDelete(entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  /**
   * Get a single entry by ID
   */
  const getEntry = useCallback((entryId: string): JournalEntry | undefined => {
    return getJournalEntry(entryId);
  }, []);

  /**
   * Hydrate entries from storage on mount
   */
  useEffect(() => {
    const loaded = loadJournalEntries();
    setEntries(loaded);
    setIsHydrated(true);
  }, []);

  return {
    entries,
    isHydrated,
    saveEntry,
    deleteEntry,
    getEntry,
  };
}

/**
 * Hook for searching and filtering journal entries
 */
export function useJournalSearch(query: JournalSearchQuery = {}) {
  const [results, setResults] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const filtered = searchJournalEntries(query);
    setResults(filtered);
  }, [query]);

  return results;
}

/**
 * Hook for managing journal entry form state
 */
export interface JournalFormState {
  title: string;
  content: string;
  mood: MoodType;
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
  focusQuality: FocusQuality;
  tags: string[];
  categories: JournalCategory[];
}

export function useJournalForm(initialEntry?: JournalEntry) {
  const [form, setForm] = useState<JournalFormState>(() => {
    if (initialEntry) {
      return {
        title: initialEntry.title,
        content: initialEntry.content,
        mood: initialEntry.mood,
        energyLevel: initialEntry.energyLevel,
        stressLevel: initialEntry.stressLevel,
        focusQuality: initialEntry.focusQuality,
        tags: initialEntry.tags,
        categories: initialEntry.categories,
      };
    }

    return {
      title: "",
      content: "",
      mood: "neutral",
      energyLevel: "moderate",
      stressLevel: "low",
      focusQuality: "good",
      tags: [],
      categories: [],
    };
  });

  const updateField = useCallback(
    <K extends keyof JournalFormState>(key: K, value: JournalFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: [...new Set([...prev.tags, tag])],
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const addCategory = useCallback((category: JournalCategory) => {
    setForm((prev) => ({
      ...prev,
      categories: [...new Set([...prev.categories, category])],
    }));
  }, []);

  const removeCategory = useCallback((category: JournalCategory) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  }, []);

  const reset = useCallback(() => {
    setForm({
      title: "",
      content: "",
      mood: "neutral",
      energyLevel: "moderate",
      stressLevel: "low",
      focusQuality: "good",
      tags: [],
      categories: [],
    });
  }, []);

  return {
    form,
    updateField,
    addTag,
    removeTag,
    addCategory,
    removeCategory,
    reset,
  };
}

/**
 * Hook for getting available tags
 */
export function useAvailableTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const available = getAllTags();
    setTags(available);
  }, []);

  return tags;
}

/**
 * Dummy storage function for debounced writer
 */
function storageToFile(_data: unknown) {
  // This is called by the debounced writer when needed
  // The actual save happens via storageToFile
  // This maintains parity with the planner pattern
}
