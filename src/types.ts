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
