import { subDays, addDays, format } from 'date-fns';
import type { DailyLog } from '../types';

import GlassCard from './GlassCard';

export default function Heatmap({ logs, days = 365 }: { logs: Record<string, DailyLog>, days?: number }) {
  const today = new Date();
  const oneYearAgo = subDays(today, 365);

  const dayLogs: { [date: string]: number } = {};

  Object.keys(logs).forEach(date => {
    const log = logs[date];
    const points = log.totalPoints || 0;
    dayLogs[date] = points;
  });

  const maxPoints = Math.max(...Object.values(dayLogs)) || 1;

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-on-surface mb-2">Your Impact Heatmap</h2>
        <p className="text-sm text-on-surface-variant">
          Each square represents a day. Darker shades indicate higher eco-friendly activity.
        </p>
      </div>

      <div className="relative w-full">
        <div className="absolute inset-0 pointer-events-none grid grid-cols-7 gap-1 text-[10px] text-on-surface-variant">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
            </div>
          ))}
        </div>

        <div className="relative pt-6 pb-4">
          <div className="relative grid grid-cols-7 gap-1.5 w-full">
            {Array.from({ length: 53 }).map((_, weekIndex) => {
              const weekStart = subDays(today, weekIndex * 7 + today.getDay() + 1);
              return Array.from({ length: 7 }).map((_, dayIndex) => {
                const date = addDays(weekStart, dayIndex);
                const dateStr = format(date, 'yyyy-MM-dd');
                const points = dayLogs[dateStr] || 0;
                const intensity = Math.min(4, Math.round((points / maxPoints) * 4));

                return (
                  <div
                    key={`${dateStr}-${weekIndex}-${dayIndex}`}
                    className={`w-4 h-4 rounded transition-colors duration-200 hover:scale-105 ${
                      intensity === 0
                        ? 'bg-surface-container-lowest dark:bg-surface-container-lowest/50'
                        : `bg-surface-container-${intensity} dark:bg-surface-container-${intensity}`}
                    `}
                  />
                );
              });
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
