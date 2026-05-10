import { getStoredValue, setStoredValue, removeStoredValue } from "@/lib/storage";
import type { JournalEntry, JournalStorageSchema, JournalSearchQuery } from "./types.ts";

const JOURNAL_STORAGE_KEY = "neuroflow:journal:entries";
export const JOURNAL_STORAGE_VERSION = 1;

/**
 * Load all journal entries from localStorage
 */
export function loadJournalEntries(): JournalEntry[] {
  const stored = getStoredValue<JournalStorageSchema>(JOURNAL_STORAGE_KEY);

  if (!stored || stored.version !== JOURNAL_STORAGE_VERSION) {
    return [];
  }

  return stored.entries || [];
}

/**
 * Save journal entries to localStorage
 */
export function saveJournalEntries(entries: JournalEntry[]): void {
  const schema: JournalStorageSchema = {
    version: JOURNAL_STORAGE_VERSION,
    persistedAt: new Date().toISOString(),
    entries,
    lastSyncedAt: new Date().toISOString(),
  };

  setStoredValue(JOURNAL_STORAGE_KEY, schema);
}

/**
 * Add or update a journal entry
 */
export function saveJournalEntry(entry: JournalEntry): JournalEntry {
  const entries = loadJournalEntries();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);

  const updatedEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = updatedEntry;
  } else {
    entries.push(updatedEntry);
  }

  // Sort by date descending (newest first)
  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  saveJournalEntries(entries);
  return updatedEntry;
}

/**
 * Delete a journal entry by ID
 */
export function deleteJournalEntry(entryId: string): void {
  const entries = loadJournalEntries();
  const filtered = entries.filter((e) => e.id !== entryId);
  saveJournalEntries(filtered);
}

/**
 * Get a single journal entry by ID
 */
export function getJournalEntry(entryId: string): JournalEntry | undefined {
  const entries = loadJournalEntries();
  return entries.find((e) => e.id === entryId);
}

/**
 * Search and filter journal entries
 */
export function searchJournalEntries(query: JournalSearchQuery): JournalEntry[] {
  let entries = loadJournalEntries();

  // Text search
  if (query.text) {
    const lowerText = query.text.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(lowerText) || e.content.toLowerCase().includes(lowerText),
    );
  }

  // Mood filter
  if (query.moods && query.moods.length > 0) {
    entries = entries.filter((e) => query.moods!.includes(e.mood));
  }

  // Category filter
  if (query.categories && query.categories.length > 0) {
    entries = entries.filter((e) => e.categories.some((cat) => query.categories!.includes(cat)));
  }

  // Tag filter
  if (query.tags && query.tags.length > 0) {
    entries = entries.filter((e) => query.tags!.some((tag) => e.tags.includes(tag)));
  }

  // Date range filter
  if (query.dateRange) {
    const startDate = new Date(query.dateRange.start).getTime();
    const endDate = new Date(query.dateRange.end).getTime();
    entries = entries.filter((e) => {
      const entryDate = new Date(e.createdAt).getTime();
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  // Stress level filter
  if (query.minStressLevel) {
    const stressLevels = ["minimal", "low", "moderate", "high", "critical"];
    const minIndex = stressLevels.indexOf(query.minStressLevel);
    entries = entries.filter((e) => {
      const entryIndex = stressLevels.indexOf(e.stressLevel);
      return entryIndex >= minIndex;
    });
  }

  // Burnout risk filter
  if (query.burnoutRiskFilter) {
    entries = entries.filter((e) => e.burnoutIndicators?.risk === query.burnoutRiskFilter);
  }

  return entries;
}

/**
 * Get entries from the last N days
 */
export function getRecentEntries(days: number): JournalEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const entries = loadJournalEntries();
  return entries.filter((e) => new Date(e.createdAt).getTime() >= cutoffDate.getTime());
}

/**
 * Get all unique tags across all entries
 */
export function getAllTags(): string[] {
  const entries = loadJournalEntries();
  const tagsSet = new Set<string>();

  entries.forEach((e) => {
    e.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get mood distribution for a time period
 */
export function getMoodDistribution(days: number = 30): Record<string, number> {
  const entries = getRecentEntries(days);
  const distribution: Record<string, number> = {};

  entries.forEach((e) => {
    distribution[e.mood] = (distribution[e.mood] || 0) + 1;
  });

  return distribution;
}

/**
 * Clear all journal entries
 */
export function clearJournalData(): void {
  removeStoredValue(JOURNAL_STORAGE_KEY);
}

/**
 * Export all journal data as JSON
 */
export function exportJournalData(): string {
  const entries = loadJournalEntries();
  const schema: JournalStorageSchema = {
    version: JOURNAL_STORAGE_VERSION,
    persistedAt: new Date().toISOString(),
    entries,
  };
  return JSON.stringify(schema, null, 2);
}

/**
 * Import journal data from JSON
 */
export function importJournalData(jsonData: string): boolean {
  try {
    const schema = JSON.parse(jsonData) as JournalStorageSchema;

    if (schema.version !== JOURNAL_STORAGE_VERSION) {
      console.warn(
        `Storage version mismatch. Expected ${JOURNAL_STORAGE_VERSION}, got ${schema.version}`,
      );
    }

    saveJournalEntries(schema.entries || []);
    return true;
  } catch (error) {
    console.error("Failed to import journal data:", error);
    return false;
  }
}

/**
 * Get average metrics for a time period
 */
export function getAverageMetrics(days: number = 30) {
  const entries = getRecentEntries(days);

  if (entries.length === 0) {
    return null;
  }

  const energyMap = { "very-low": 10, low: 30, moderate: 50, high: 70, "very-high": 90 };
  const stressMap = { minimal: 10, low: 30, moderate: 50, high: 70, critical: 90 };
  const focusMap = { poor: 10, fair: 30, good: 60, excellent: 80, exceptional: 100 };

  let avgEnergy = 0;
  let avgStress = 0;
  let avgFocus = 0;

  entries.forEach((e) => {
    avgEnergy += energyMap[e.energyLevel];
    avgStress += stressMap[e.stressLevel];
    avgFocus += focusMap[e.focusQuality];
  });

  return {
    averageEnergy: Math.round(avgEnergy / entries.length),
    averageStress: Math.round(avgStress / entries.length),
    averageFocus: Math.round(avgFocus / entries.length),
    totalEntries: entries.length,
  };
}
