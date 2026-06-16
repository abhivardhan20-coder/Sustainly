import React, { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { DailyLog } from '../types';

interface HeatmapProps {
  logs: Record<string, DailyLog>;
  days?: number;
}

export default function Heatmap({ logs, days = 365 }: HeatmapProps) {
  const calendar = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, days - 1);
    const startDayOfWeek = startDate.getDay(); // 0 (Sun) to 6 (Sat)

    const daysArray: ({ date: Date; dateString: string; points: number; activitiesCount: number } | null)[] = [];
    
    // Pad empty spaces at the beginning so the first row always aligns to Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayLog = logs[dateString];
      daysArray.push({
        date,
        dateString,
        points: dayLog ? dayLog.totalPoints : 0,
        activitiesCount: dayLog ? dayLog.activities.length : 0,
      });
    }
    return daysArray;
  }, [logs, days]);

  const getColor = (points: number) => {
    if (points === 0) return 'bg-surface-variant/30 dark:bg-surface-variant/20'; 
    if (points < 20) return 'bg-primary/30';
    if (points < 50) return 'bg-primary/50';
    if (points < 100) return 'bg-primary/80';
    return 'bg-primary'; 
  };

  const getDayLabel = (index: number) => {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return labels[index] || '';
  };

  return (
    <div className="w-full bg-surface-container-low rounded-2xl p-6 border border-surface-variant/50 shadow-sm">
      <h3 className="text-lg font-bold text-on-surface mb-4">Activity Heatmap</h3>
      
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-max flex gap-2">
          
          {/* Day of week labels */}
          <div className="grid grid-rows-7 gap-1 text-[10px] text-on-surface-variant font-medium pr-1 mt-1">
            <div className="h-3 flex items-center leading-none">Sun</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center leading-none">Tue</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center leading-none">Thu</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center leading-none">Sat</div>
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-1 mt-1">
            {calendar.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="w-3 h-3 bg-transparent" />;
              }
              return (
                <div
                  key={day.dateString}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getColor(day.points)} hover:ring-2 ring-primary/50`}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${day.points} pts (${day.activitiesCount} activities)`}
                  role="gridcell"
                  aria-label={`${format(day.date, 'MMM d, yyyy')}, ${day.points} points, ${day.activitiesCount} activities`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center mt-2 gap-2 text-xs text-on-surface-variant font-medium">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-surface-variant/30 dark:bg-surface-variant/20"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
        <div className="w-3 h-3 rounded-sm bg-primary"></div>
        <span>More</span>
      </div>
    </div>
  );
}
