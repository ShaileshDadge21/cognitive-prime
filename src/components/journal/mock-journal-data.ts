import type { JournalEntry } from "./types";

/**
 * Mock journal entries for development and testing
 */
export const mockJournalEntries: JournalEntry[] = [
  {
    id: "journal-1",
    title: "Deep Flow State Achieved",
    content:
      "Had an incredible session this morning. Got into deep work by 9 AM and stayed in flow for 3 hours straight. The key was blocking out all notifications and setting a clear intention at the start. Completed the refactoring task I'd been dreading. Feel energized and accomplished.",
    mood: "elated",
    energyLevel: "very-high",
    stressLevel: "low",
    focusQuality: "exceptional",
    tags: ["flow", "productivity", "deep-work", "breakthrough"],
    categories: ["work", "reflection"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: 0.85,
      label: "positive",
    },
    burnoutIndicators: {
      score: 0.15,
      risk: "low",
      factors: [],
    },
  },
  {
    id: "journal-2",
    title: "Dealing with Context Switching",
    content:
      "Started strong this morning but got pulled into back-to-back meetings. Felt fragmented the rest of the day. Really struggled to maintain focus after the interruptions. Ended up doing surface-level work instead of the deep stuff I planned. Tomorrow I'm blocking mornings as sacred time - no meetings before 11 AM.",
    mood: "frustrated",
    energyLevel: "low",
    stressLevel: "high",
    focusQuality: "fair",
    tags: ["context-switching", "meetings", "workflow", "improvement"],
    categories: ["work", "reflection", "learning"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: -0.3,
      label: "negative",
    },
    burnoutIndicators: {
      score: 0.35,
      risk: "low",
      factors: ["frequent interruptions", "low focus quality"],
    },
  },
  {
    id: "journal-3",
    title: "Breakthrough in Understanding",
    content:
      "Had a conversation with my mentor today that completely reframed how I think about my current challenges. She pointed out that what I saw as failures were actually valuable learning experiences. This perspective shift is powerful. I'm feeling more optimistic about the obstacles I was worried about.",
    mood: "optimistic",
    energyLevel: "high",
    stressLevel: "moderate",
    focusQuality: "excellent",
    tags: ["mentorship", "breakthrough", "perspective", "growth"],
    categories: ["learning", "relationships", "reflection", "breakthrough"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: 0.72,
      label: "positive",
    },
    burnoutIndicators: {
      score: 0.25,
      risk: "low",
      factors: [],
    },
  },
  {
    id: "journal-4",
    title: "Rest Day Reflections",
    content:
      "Took the day off today to recharge. Went for a long walk in nature, read a book I've been putting off, and cooked a nice dinner. Feeling calm and centered. Reminded myself that rest is productive too. Looking forward to the week with fresh energy.",
    mood: "calm",
    energyLevel: "moderate",
    stressLevel: "minimal",
    focusQuality: "good",
    tags: ["rest", "recovery", "self-care", "balance"],
    categories: ["personal", "health"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: 0.65,
      label: "positive",
    },
    burnoutIndicators: {
      score: 0.1,
      risk: "low",
      factors: [],
    },
  },
  {
    id: "journal-5",
    title: "Overwhelmed by Deadlines",
    content:
      "Three major projects all have overlapping deadlines next week. Feeling overwhelmed and anxious. Keep thinking about all the things that could go wrong. Need to break this down into smaller tasks and create a realistic timeline. Also realizing I might need to ask for help or adjust expectations.",
    mood: "overwhelmed",
    energyLevel: "low",
    stressLevel: "critical",
    focusQuality: "poor",
    tags: ["stress", "deadlines", "overwhelm", "work-life-balance"],
    categories: ["work", "reflection"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: -0.72,
      label: "negative",
    },
    burnoutIndicators: {
      score: 0.68,
      risk: "high",
      factors: ["critical stress level", "low energy", "poor focus", "multiple deadlines"],
    },
  },
  {
    id: "journal-6",
    title: "Creative Energy",
    content:
      "Spent the evening working on my side project. The creative energy was flowing. Designed three new features that I'm really excited about. This reminds me why I love what I do. When I'm creating something that feels meaningful, nothing else matters.",
    mood: "elated",
    energyLevel: "very-high",
    stressLevel: "low",
    focusQuality: "exceptional",
    tags: ["creativity", "passion", "side-project", "joy"],
    categories: ["creative", "personal", "learning"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: 0.88,
      label: "positive",
    },
    burnoutIndicators: {
      score: 0.1,
      risk: "low",
      factors: [],
    },
  },
  {
    id: "journal-7",
    title: "Anxiety and Self-Doubt",
    content:
      "Questioning my abilities today. That code review feedback hit harder than I expected. I know I shouldn't take it personally, but I kept replaying it in my head. Trying to reframe it as learning opportunity, but the anxiety is real. Maybe I'm not cut out for this.",
    mood: "anxious",
    energyLevel: "moderate",
    stressLevel: "high",
    focusQuality: "fair",
    tags: ["self-doubt", "anxiety", "feedback", "growth-mindset"],
    categories: ["personal", "work", "learning"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: -0.45,
      label: "negative",
    },
    burnoutIndicators: {
      score: 0.42,
      risk: "moderate",
      factors: ["anxiety", "high stress", "self-doubt"],
    },
  },
  {
    id: "journal-8",
    title: "Productive Weekend",
    content:
      "Managed to get a lot done this weekend without feeling rushed. Completed the house cleaning, meal prepped for the week, and still had time to relax. This balance feels sustainable. I think the key was planning the weekend in advance and setting realistic goals.",
    mood: "optimistic",
    energyLevel: "high",
    stressLevel: "low",
    focusQuality: "good",
    tags: ["balance", "planning", "sustainability", "home"],
    categories: ["personal", "reflection"],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: 0.68,
      label: "positive",
    },
    burnoutIndicators: {
      score: 0.15,
      risk: "low",
      factors: [],
    },
  },
  {
    id: "journal-9",
    title: "Exhaustion",
    content:
      "Didn't sleep well last night and it's showing. Can barely keep my eyes open. Everything feels harder. Decided to take it easy today and postpone non-urgent tasks. Listening to my body's signals. Planning an early bedtime tonight.",
    mood: "exhausted",
    energyLevel: "very-low",
    stressLevel: "moderate",
    focusQuality: "poor",
    tags: ["sleep", "rest", "recovery", "health"],
    categories: ["health", "personal"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: {
      score: -0.38,
      label: "negative",
    },
    burnoutIndicators: {
      score: 0.35,
      risk: "moderate",
      factors: ["very low energy", "poor sleep", "low focus"],
    },
  },
];

/**
 * Load mock data into journal storage
 */
import { saveJournalEntries } from "./journal-storage";

export function loadMockJournalData() {
  saveJournalEntries(mockJournalEntries);
}
