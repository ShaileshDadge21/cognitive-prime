export const focusData = [
  { day: "Mon", focus: 4.2, energy: 65, fatigue: 30 },
  { day: "Tue", focus: 6.1, energy: 82, fatigue: 25 },
  { day: "Wed", focus: 5.4, energy: 70, fatigue: 40 },
  { day: "Thu", focus: 7.0, energy: 88, fatigue: 22 },
  { day: "Fri", focus: 4.8, energy: 60, fatigue: 55 },
  { day: "Sat", focus: 3.2, energy: 50, fatigue: 35 },
  { day: "Sun", focus: 5.6, energy: 78, fatigue: 28 },
];

export const cognitiveRadial = [
  { name: "Focus", value: 86, fill: "var(--coral)" },
  { name: "Energy", value: 72, fill: "var(--electric)" },
  { name: "Memory", value: 68, fill: "var(--violet)" },
];

export const tasks = [
  { id: "1", title: "Deep work: Research paper", priority: "high", energy: "high", duration: "90m", done: false },
  { id: "2", title: "Review team PRs", priority: "med", energy: "med", duration: "30m", done: false },
  { id: "3", title: "Sync with design", priority: "med", energy: "low", duration: "20m", done: true },
  { id: "4", title: "Spaced repetition: Spanish", priority: "low", energy: "low", duration: "15m", done: false },
  { id: "5", title: "Strategy planning Q3", priority: "high", energy: "high", duration: "60m", done: false },
];

export const habits = [
  { name: "Morning Meditation", streak: 24, progress: 92 },
  { name: "Hydration 2.5L", streak: 12, progress: 65 },
  { name: "Reading 30m", streak: 41, progress: 88 },
  { name: "Evening Walk", streak: 7, progress: 50 },
];

export const moodOptions = [
  { id: "energetic", label: "Energetic", color: "coral" },
  { id: "focused", label: "Focused", color: "electric" },
  { id: "calm", label: "Calm", color: "violet" },
  { id: "tired", label: "Tired", color: "muted" },
  { id: "stressed", label: "Stressed", color: "destructive" },
];

export const aiMessages = [
  { from: "ai", text: "Good morning. Your cognitive score is 86 — peak focus window detected between 9–11 AM." },
  { from: "user", text: "What should I tackle first?" },
  { from: "ai", text: "I'd start with the research paper. High cognitive load matches your current energy. I've moved meetings to the afternoon." },
];
