# Habits System

A production-grade adaptive habits tracking system with AI-powered recommendations and cognitive reinforcement.

## Overview

The habits system provides comprehensive habit tracking with adaptive intelligence, including streak calculation, consistency scoring, burnout monitoring, and personalized recommendations.

## Features

### Core Functionality

- **Habit Creation**: Create habits with categories, frequencies, difficulty levels, and burnout impact assessment
- **Completion Tracking**: Mark habits as completed with automatic streak and consistency calculation
- **Streak Visualization**: Visual indicators for streak levels (Common, Uncommon, Rare, Epic, Legendary)
- **Consistency Scoring**: Automatic calculation of habit adherence percentages
- **Burnout Monitoring**: Track habits that may cause burnout and provide warnings

### Adaptive Intelligence

- **Smart Recommendations**: AI-powered suggestions for habit optimization
- **Difficulty Adjustment**: Recommendations to increase/decrease habit difficulty based on performance
- **Schedule Optimization**: Suggestions for optimal timing windows
- **Burnout Prevention**: Automatic detection and recommendations for high-burnout habits

### Analytics & Insights

- **Dashboard Overview**: Comprehensive analytics across all habits
- **Heat Maps**: Visual representation of completion history
- **Progress Rings**: Circular progress indicators for consistency scores
- **Streak Indicators**: Gamified streak tracking with rarity levels

## Architecture

### Components

#### `HabitCard`

- Displays individual habit information
- Completion toggle with streak visualization
- Burnout warnings and consistency scores
- Edit/delete actions

#### `HabitDashboard`

- Main dashboard with tabbed interface (Overview, My Habits, Insights)
- Analytics overview cards
- Filtered habit lists with search and sorting
- Smart recommendations display

#### `AddHabitModal`

- Comprehensive habit creation/editing form
- Category, frequency, difficulty, and burnout impact selection
- Tag management system
- Schedule window preferences

#### `StreakIndicator`

- Visual streak display with rarity levels
- Animated fire indicators for active streaks
- Heat map visualization for completion history
- Progress rings for consistency scores

### Hooks

#### `useHabits`

- CRUD operations for habits
- Loading states and error handling
- Automatic persistence to localStorage

#### `useHabitSearch`

- Text search across habits, notes, and tags
- Category and frequency filtering
- Sortable by various criteria

#### `useHabitStreak`

- Streak calculation and level determination
- Active streak detection

#### `useHabitCompletion`

- Daily completion status checking
- Frequency-based completion logic

#### `useHabitAnalytics`

- Comprehensive analytics calculation
- Consistency and completion rate metrics

#### `useHabitRecommendations`

- AI-powered habit optimization suggestions
- Burnout risk assessment

### Storage Layer

#### `habit-storage.ts`

- localStorage persistence with versioning
- CRUD operations with automatic analytics updates
- Streak and consistency calculation algorithms
- Recommendation generation engine

### Types

#### Core Types

- `Habit`: Complete habit data structure
- `HabitCompletion`: Individual completion records
- `HabitAnalytics`: Computed analytics data
- `HabitCategory`: Categorized habit types
- `HabitFrequency`: Daily, weekly, monthly options
- `HabitDifficulty`: Cognitive demand levels
- `HabitBurnoutImpact`: Burnout risk assessment

## Data Model

```typescript
interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  cognitiveDifficulty: HabitDifficulty;
  burnoutImpact: HabitBurnoutImpact;
  preferredWindow: ScheduleWindow;
  startDate: string;
  status: HabitStatus;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completionHistory: HabitCompletionRecord[];
  streakCount: number;
  consistencyScore: number;
}
```

## Scoring Algorithms

### Streak Calculation

- Frequency-aware streak computation
- Resets appropriately for weekly/monthly habits
- Maintains streak across frequency changes

### Consistency Scoring

- Percentage of completed vs. attempted habit instances
- Rolling calculation over habit lifetime
- Used for analytics and recommendations

### Burnout Risk Assessment

- Based on habit difficulty and completion consistency
- High-burnout habits trigger warnings and recommendations
- Adaptive suggestions to prevent overexertion

## AI Recommendations

The system generates personalized recommendations based on:

1. **Performance Metrics**: Consistency scores and streak lengths
2. **Burnout Indicators**: Difficulty vs. completion rates
3. **Schedule Optimization**: Preferred timing windows
4. **Adaptive Difficulty**: Suggestions to increase/decrease challenge levels

## Usage

### Creating Habits

```typescript
const { addHabit } = useHabits();

const newHabit = {
  title: "Morning Meditation",
  category: "mindfulness",
  frequency: "daily",
  cognitiveDifficulty: "moderate",
  burnoutImpact: "low",
  preferredWindow: "morning",
  tags: ["meditation", "mindfulness"],
};

addHabit(newHabit);
```

### Completing Habits

```typescript
const { completeHabit } = useHabits();
completeHabit(habitId, "2024-01-15", true);
```

### Analytics

```typescript
const analytics = useHabitAnalytics(habits);
// Returns: totalHabits, activeHabits, averageConsistency, etc.
```

## Future AI Integration

### Planned Features

- **Predictive Adherence**: ML models to predict habit completion likelihood
- **Personalized Routines**: AI-generated habit combinations for optimal cognitive load
- **Reinforcement Learning**: Adaptive difficulty scaling based on user performance
- **Cognitive State Integration**: Integration with mood/journaling data for holistic recommendations

### Technical Implementation

- Integration with existing cognitive engine
- Machine learning models for pattern recognition
- Real-time adaptation based on user feedback
- Cross-domain habit optimization (work-life balance)

## Validation

### Streak Logic

- ✅ Correctly calculates streaks for different frequencies
- ✅ Handles missed days appropriately
- ✅ Resets streaks on frequency changes

### Persistence

- ✅ Automatic saving to localStorage
- ✅ Versioned data structure
- ✅ Data integrity across sessions

### Analytics

- ✅ Accurate consistency calculations
- ✅ Real-time updates on completion
- ✅ Comprehensive dashboard metrics

### No State Corruption

- ✅ Immutable state updates
- ✅ Error boundaries for failed operations
- ✅ Graceful degradation on data issues

### TypeScript Compliance

- ✅ Strict mode compilation
- ✅ Comprehensive type definitions
- ✅ No type errors in production build

## Performance

- **Efficient Rendering**: Memoized calculations and virtualized lists
- **Debounced Persistence**: Optimized localStorage writes
- **Lazy Loading**: Components load on demand
- **Responsive Design**: Optimized for all screen sizes

## Testing

The system includes comprehensive mock data and is designed for easy integration testing. All components are fully typed and follow React best practices for maintainability.
