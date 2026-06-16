import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { DailyLog } from '../../types';

interface EmissionsBreakdownProps {
  dailyLogs: Record<string, DailyLog>;
}

const COLORS = {
  transport: 'var(--color-primary-container, #166534)',
  food: 'var(--color-tertiary-container, #824b0b)',
  home: 'var(--color-secondary, #006d36)',
  goods: 'var(--color-outline, #707a6f)',
  other: 'var(--color-outline-variant, #c2c9c1)',
};

const LABELS = {
  transport: 'Transport',
  food: 'Food',
  home: 'Home Energy',
  goods: 'Shopping & Goods',
  other: 'Other',
};

export default function EmissionsBreakdown({ dailyLogs }: EmissionsBreakdownProps) {
  // Aggregate points by category
  const breakdown = Object.values(dailyLogs).reduce((acc, log) => {
    log.activities.forEach(act => {
      const cat = act.type;
      const key = cat === 'transport' || cat === 'food' || cat === 'home' || cat === 'goods' ? cat : 'other';
      acc[key] += Math.abs(act.points || 0);
    });
    return acc;
  }, { transport: 0, food: 0, home: 0, goods: 0, other: 0 });

  const data = Object.entries(breakdown)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const totalPoints = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl border border-surface-variant/50 p-6 flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4">
          <span className="text-2xl opacity-50">📊</span>
        </div>
        <h3 className="text-lg font-bold text-on-surface">No Data Yet</h3>
        <p className="text-sm text-on-surface-variant max-w-[200px] mt-2">
          Log some activities to see your emissions breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-2xl border border-surface-variant/50 p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-on-surface mb-6">Emissions Breakdown</h3>
      
      <div className="relative flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} pts`, 'Impact']}
              labelFormatter={(label: string) => LABELS[label as keyof typeof LABELS]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-on-surface">{totalPoints}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Points</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6">
        {data.map((entry) => {
          const percent = Math.round((entry.value / totalPoints) * 100);
          return (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                />
                <span className="text-on-surface-variant font-medium">
                  {LABELS[entry.name as keyof typeof LABELS]}
                </span>
              </div>
              <span className="font-bold text-on-surface">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
