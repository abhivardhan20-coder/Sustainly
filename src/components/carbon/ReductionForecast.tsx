import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DailyLog } from '../../types';
import { subDays, format, addDays } from 'date-fns';

import GlassCard from '../GlassCard';

interface ReductionForecastProps {
  dailyLogs: Record<string, DailyLog>;
}

export default function ReductionForecast({ dailyLogs }: ReductionForecastProps) {
  // Generate last 14 days and next 16 days
  const data = [];
  const today = new Date();

  // Calculate average for regression
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let validDays = 0;

  // Past 14 days
  for (let i = -14; i <= 0; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = dailyLogs[dateStr];
    const points = log ? log.totalPoints : 0;

    data.push({
      date: format(date, 'MMM dd'),
      actual: i <= 0 ? points : null,
      projected: null,
      suggested: null,
      isFuture: false
    });

    if (log && points > 0) {
      const x = i + 14; // Normalize to 0-14
      sumX += x;
      sumY += points;
      sumXY += x * points;
      sumXX += x * x;
      validDays++;
    }
  }

  // Simple linear regression (y = mx + b)
  let slope = 0;
  let intercept = validDays > 0 ? sumY / validDays : 10;

  if (validDays > 1) {
    const denom = (validDays * sumXX - sumX * sumX);
    if (denom !== 0) {
      slope = (validDays * sumXY - sumX * sumY) / denom;
      intercept = (sumY - slope * sumX) / validDays;
    }
  }

  // Connect actual to projected exactly on "today"
  const todayIndex = 14;
  const todayVal = data[todayIndex].actual || intercept + slope * todayIndex;
  data[todayIndex].projected = todayVal;
  data[todayIndex].suggested = todayVal;

  // Future 16 days
  for (let i = 1; i <= 16; i++) {
    const date = addDays(today, i);
    const x = i + 14;
    let projectedVal = intercept + slope * x;

    // Don't let it go below 0 for display
    projectedVal = Math.max(0, projectedVal);

    // Suggested is 20% better (higher points)
    const suggestedVal = projectedVal * 1.2;

    data.push({
      date: format(date, 'MMM dd'),
      actual: null,
      projected: Math.round(projectedVal),
      suggested: Math.round(suggestedVal),
      isFuture: true
    });
  }

  if (validDays === 0) {
    return (
      <GlassCard className="p-6 flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-lg font-bold text-on-surface">30-Day Forecast</h3>
        <p className="text-sm text-on-surface-variant max-w-[200px] mt-2">
          Log activities for a few days to see your impact forecast.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 flex flex-col h-full w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface">30-Day Forecast</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Projected Impact Points</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Goal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary, #166534)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary, #166534)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSuggested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary, #006d36)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-secondary, #006d36)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-variant, #e1e3e0)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant, #434842)' }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant, #434842)' }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid var(--color-surface-variant, #e1e3e0)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: 'var(--color-surface-container-lowest, #ffffff)',
                color: 'var(--color-on-surface, #1a1c19)'
              }}
              labelStyle={{ color: 'var(--color-on-surface-variant, #434842)', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-primary, #166534)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
              activeDot={{ r: 6, fill: "var(--color-primary, #166534)", stroke: "var(--color-surface, #f9f9f8)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="var(--color-primary, #166534)"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={0.5}
              fill="url(#colorActual)"
            />
            <Area
              type="monotone"
              dataKey="suggested"
              stroke="var(--color-secondary, #006d36)"
              strokeWidth={2}
              strokeDasharray="3 3"
              fillOpacity={1}
              fill="url(#colorSuggested)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
