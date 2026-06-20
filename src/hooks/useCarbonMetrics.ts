import { useMemo } from 'react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import type { LoggedActivity } from '../types';
import { subDays, format } from 'date-fns';

interface CategoryBreakdown {
  transport: number;
  food: number;
  home: number;
  goods: number;
  other: number;
}

interface CarbonMetricsResult {
  todaysPoints: number;
  todaysActivities: LoggedActivity[];
  weeklyPoints: number;
  totalPoints: number;
  categoryBreakdown: CategoryBreakdown;
  dailyTrend: Array<{ date: string; points: number }>;
  topActivities: LoggedActivity[];
  weeklyAverage: number;
  daysActive: number;
}

export function useCarbonMetrics(): CarbonMetricsResult {
  const dailyLogs = useSustainlyStore(state => state.dailyLogs);
  
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysLog = dailyLogs[today] || { activities: [], totalPoints: 0 };
    
    // Calculate weekly points (last 7 days)
    let weeklyPoints = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];
      if (log) weeklyPoints += log.totalPoints;
    }
    
    // Calculate total points across all time
    const allLogs = Object.values(dailyLogs);
    const totalPoints = allLogs.reduce((sum, log) => sum + log.totalPoints, 0);
    
    // Category breakdown (today)
    const categoryBreakdown: CategoryBreakdown = { transport: 0, food: 0, home: 0, goods: 0, other: 0 };
    todaysLog.activities.forEach(act => {
      const cat = act.type in categoryBreakdown ? act.type : 'other';
      categoryBreakdown[cat as keyof CategoryBreakdown] += act.points || 0;
    });
    
    // Daily trend (last 14 days)
    const dailyTrend: Array<{ date: string; points: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];
      dailyTrend.push({ date: dateStr, points: log?.totalPoints || 0 });
    }
    
    // Top activities today (sorted by points desc)
    const topActivities = [...todaysLog.activities]
      .filter(a => a.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 3);
    
    // Weekly average
    const daysActive = allLogs.length;
    const weeklyAverage = daysActive > 0 ? Math.round(totalPoints / Math.max(1, Math.ceil(daysActive / 7))) : 0;
    
    return {
      todaysPoints: todaysLog.totalPoints,
      todaysActivities: todaysLog.activities,
      weeklyPoints,
      totalPoints,
      categoryBreakdown,
      dailyTrend,
      topActivities,
      weeklyAverage,
      daysActive,
    };
  }, [dailyLogs]);
}
