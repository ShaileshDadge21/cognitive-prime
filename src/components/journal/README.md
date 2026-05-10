# Cognitive Journal System

Production-grade cognitive journaling system for NeuroFlow AI with AI-ready architecture for future enhancements.

## Features

### Core Features

✅ **Journal Entry Creation** - Rich text entries with mood tracking  
✅ **Mood Tracking** - 8 distinct emotional states with emoji indicators  
✅ **Cognitive Metrics** - Track energy, stress, and focus quality  
✅ **Smart Tagging** - Organize entries with custom tags  
✅ **Categories** - Predefined categories (work, personal, health, learning, relationships, creative, reflection, breakthrough)  
✅ **Timeline View** - Chronological entry display with mood indicators  
✅ **Search & Filter** - Search by text, mood, category, tags, date range  
✅ **Cognitive Trends** - Visual analysis of 30-day metrics  
✅ **Data Export/Import** - Full JSON backup and restore  
✅ **Local Persistence** - Browser-based storage with auto-save

### AI-Ready Architecture

🔮 **Sentiment Analysis** - (Coming Soon) Emotional tone detection  
🔮 **Burnout Prediction** - (Coming Soon) Risk indicators and alerts  
🔮 **Pattern Recognition** - (Coming Soon) Identify triggers and patterns  
🔮 **Weekly Reports** - (Coming Soon) AI-generated summaries  
🔮 **Smart Recommendations** - (Coming Soon) Personalized suggestions

## Quick Start

### Load Mock Data (for testing)

```typescript
import { loadMockJournalData } from "@/components/journal/mock-journal-data";

// In your setup or dev code:
loadMockJournalData();
```

This loads 9 sample entries covering various moods and scenarios.

### Create an Entry Programmatically

```typescript
import { saveJournalEntry } from "@/components/journal/journal-storage";
import type { JournalEntry } from "@/components/journal/types";

const entry: JournalEntry = {
  id: crypto.randomUUID(),
  title: "Today's Reflection",
  content: "What I learned today...",
  mood: "optimistic",
  energyLevel: "high",
  stressLevel: "low",
  focusQuality: "excellent",
  tags: ["learning", "growth"],
  categories: ["personal", "reflection"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

saveJournalEntry(entry);
```

### Use the Journal Hook

```typescript
import { useJournal } from '@/components/journal/use-journal';

function MyComponent() {
  const { entries, isHydrated, saveEntry, deleteEntry } = useJournal();

  return (
    <>
      <p>Total entries: {entries.length}</p>
      {entries.map(entry => (
        <div key={entry.id}>
          <h3>{entry.title}</h3>
          <p>{entry.mood} 😊</p>
        </div>
      ))}
    </>
  );
}
```

### Search and Filter

```typescript
import { useJournalSearch } from '@/components/journal/use-journal';

function SearchDemo() {
  const results = useJournalSearch({
    text: "flow",
    moods: ["elated", "optimistic"],
    categories: ["work"],
    minStressLevel: "low",
    dateRange: {
      start: "2026-05-01",
      end: "2026-05-31",
    },
  });

  return <JournalTimeline entries={results} />;
}
```

## Component API

### `MoodSelector`

Emoji-based mood picker component.

**Props:**

- `value: MoodType` - Current mood
- `onChange: (mood: MoodType) => void` - Change callback
- `size?: 'sm' | 'md' | 'lg'` - Emoji size

**Usage:**

```tsx
<MoodSelector value={mood} onChange={setMood} size="lg" />
```

### `JournalEditor`

Modal dialog for creating and editing entries.

**Props:**

- `open: boolean` - Dialog open state
- `onOpenChange: (open: boolean) => void` - State callback
- `initialEntry?: JournalEntry` - Entry to edit
- `onSave: (data) => void` - Save handler
- `onDelete?: (entryId: string) => void` - Delete handler

**Usage:**

```tsx
<JournalEditor
  open={isOpen}
  onOpenChange={setIsOpen}
  initialEntry={editingEntry}
  onSave={(data) => {
    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    saveEntry(entry);
  }}
  onDelete={deleteEntry}
/>
```

### `JournalTimeline`

Displays entries in reverse chronological order.

**Props:**

- `entries: JournalEntry[]` - Entries to display
- `onEdit: (entry) => void` - Edit callback
- `onDelete: (entryId) => void` - Delete callback
- `loading?: boolean` - Loading state

### `CognitiveTrends`

Shows aggregated metrics and insights.

**Props:**

- `entries: JournalEntry[]` - Entries to analyze

## Data Model

### JournalEntry

```typescript
type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  energyLevel: EnergyLevel;
  stressLevel: StressLevel;
  focusQuality: FocusQuality;
  tags: string[];
  categories: JournalCategory[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // AI-ready fields (optional)
  sentiment?: {
    score: number;
    label: "negative" | "neutral" | "positive";
  };
  burnoutIndicators?: {
    score: number;
    risk: "low" | "moderate" | "high" | "critical";
    factors: string[];
  };
  cognitivePatterns?: {
    dominantTheme: string;
    emotionalTone: string;
    reflectionDepth: number;
  };
  emotionalArc?: {
    startMood: MoodType;
    endMood: MoodType;
    trajectory: "declining" | "stable" | "improving";
  };
};
```

### Mood Types

- `elated` 🤩 - Feeling joyful and inspired
- `optimistic` 😊 - Positive and hopeful
- `calm` 😌 - Peaceful and grounded
- `neutral` 😐 - Neither positive nor negative
- `anxious` 😰 - Worried or uneasy
- `frustrated` 😤 - Annoyed or irritated
- `overwhelmed` 😵 - Too much to handle
- `exhausted` 😴 - Tired and drained

### Energy Levels

- `very-low` (10%)
- `low` (30%)
- `moderate` (50%)
- `high` (70%)
- `very-high` (90%)

### Stress Levels

- `minimal` (10%)
- `low` (30%)
- `moderate` (50%)
- `high` (70%)
- `critical` (90%)

### Focus Quality

- `poor` (10%)
- `fair` (30%)
- `good` (60%)
- `excellent` (80%)
- `exceptional` (100%)

## Storage API

### `loadJournalEntries()`

Load all entries from localStorage.

```typescript
const entries = loadJournalEntries();
```

### `saveJournalEntry(entry)`

Create or update an entry.

```typescript
const saved = saveJournalEntry(entry);
```

### `deleteJournalEntry(entryId)`

Delete an entry by ID.

```typescript
deleteJournalEntry(entryId);
```

### `searchJournalEntries(query)`

Search with comprehensive filtering.

```typescript
const results = searchJournalEntries({
  text: "work",
  moods: ["anxious", "overwhelmed"],
  categories: ["work"],
  dateRange: { start: "2026-05-01", end: "2026-05-31" },
});
```

### `getRecentEntries(days)`

Get entries from the last N days.

```typescript
const lastWeek = getRecentEntries(7);
```

### `getAllTags()`

Get all unique tags.

```typescript
const tags = getAllTags();
```

### `getAverageMetrics(days)`

Calculate average metrics for a time period.

```typescript
const metrics = getAverageMetrics(30);
// { averageEnergy, averageStress, averageFocus, totalEntries }
```

### `exportJournalData()`

Export all entries as JSON.

```typescript
const json = exportJournalData();
// Download or share
```

### `importJournalData(json)`

Import entries from JSON.

```typescript
const success = importJournalData(jsonString);
```

## Styling

The journal system uses:

- **Tailwind CSS** for utility-first styling
- **Radix UI** components (pre-styled)
- **Framer Motion** for animations
- **Custom gradient colors** defined in theme

Key CSS classes:

- `.glass` - Glassmorphism effect
- `.text-coral`, `.text-electric`, `.text-violet` - Accent colors
- Responsive grid utilities (md:, lg: breakpoints)

## Performance Considerations

- ✅ Entries sorted by date on save (O(n log n))
- ✅ Search using native array filtering (optimized for < 1000 entries)
- ✅ Memoized computations in React components
- ✅ Debounced localStorage writes (300ms)
- ✅ Virtual scrolling ready for large datasets

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile: iOS 14+, Android 9+

Requires:

- ES2020 JavaScript support
- localStorage API
- JSON support

## Future Enhancements

### Phase 1: Advanced Analytics

- [ ] Heatmap visualization of mood patterns
- [ ] Correlation matrix (what factors affect mood)
- [ ] Time series forecasting
- [ ] Export to PDF/CSV

### Phase 2: AI Integration

- [ ] Sentiment analysis with transformers.js
- [ ] Burnout risk scoring
- [ ] Automatic tag suggestions
- [ ] Content summarization

### Phase 3: Cloud Sync

- [ ] Cloudflare Workers backend
- [ ] D1 Database persistence
- [ ] Multi-device sync
- [ ] Real-time collaboration

### Phase 4: Advanced Features

- [ ] Voice-to-text journaling
- [ ] Image attachments
- [ ] Collaborators (for shared journals)
- [ ] HIPAA-compliant mode

## Contributing

When adding features:

1. Update types in `types.ts`
2. Update storage functions in `journal-storage.ts`
3. Create/update React hooks in `use-journal.ts`
4. Create UI components following the pattern
5. Update this README

## License

Part of NeuroFlow AI - Proprietary

## Support

For issues or questions, refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) document for detailed system design.
