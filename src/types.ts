import type React from 'react';

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  diet: 'everything' | 'pescatarian' | 'vegetarian' | 'vegan';
  primaryCommute: string[];
  homeACUsage: 'track' | 'could-better' | 'not-really';
  createdAt: string;
}

export interface LoggedActivity {
  id: string;
  timestamp: string;
  type: 'transport' | 'food' | 'home' | 'goods' | 'other';
  description: string;
  points: number;
  icon: string;
  source: 'gemini' | 'manual';
}

export interface DailyLog {
  date: string;
  activities: LoggedActivity[];
  totalPoints: number;
}

export interface GardenState {
  trees: number;
  flowers: number;
  lastGrown: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  btnText: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Carbon tracking
// ---------------------------------------------------------------------------

/** CO₂e estimate for a single activity */
export interface CarbonEstimate {
  activityType: LoggedActivity['type'];
  description: string;
  co2eKg: number;
  confidence: 'high' | 'medium' | 'low';
}

/** Aggregated carbon metrics for dashboard display */
export interface CarbonMetrics {
  dailyCo2eKg: number;
  weeklyCo2eKg: number;
  monthlyCo2eKg: number;
  byCategory: Record<LoggedActivity['type'], number>;
  trend: 'improving' | 'stable' | 'worsening';
  /** Percentage compared to national average (e.g. -20 means 20 % below avg) */
  comparedToAverage: number;
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

/** Weekly sustainability challenge */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: LoggedActivity['type'];
  targetCount: number;
  currentCount: number;
  expiresAt: string;
  completed: boolean;
}

/** Eco-education tip */
export interface EcoTip {
  id: string;
  title: string;
  content: string;
  category: LoggedActivity['type'];
  impactRating: 1 | 2 | 3 | 4 | 5;
  sourceUrl?: string;
  completed: boolean;
}

/** Badge definition with typed condition */
export interface BadgeDefinition {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  condition: (store: {
    dailyLogs: Record<string, DailyLog>;
    streak: number;
    garden: GardenState;
  }) => boolean;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/** Chat message (moved from store) */
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}
