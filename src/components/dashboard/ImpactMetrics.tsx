// src/components/dashboard/ImpactMetrics.tsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ImpactMetricsProps {
  logs: Array<{
    type: string;
    co2eSaved: number;
    timestamp: string;
  }>;
  weeklyGoal: number;
}

const CATEGORY_COLORS = {
  transport: '#4CAF50',
  food: '#FF9800',
  waste: '#2196F3',
  energy: '#9C27B0',
  other: '#607D8B',
};

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ logs, weeklyGoal }) => {
  // Calculate weekly trend
  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dayLogs = logs.filter(log => 
        new Date(log.timestamp).toDateString() === date.toDateString()
      );
      return {
        day,
        co2e: dayLogs.reduce((sum, log) => sum + log.co2eSaved, 0),
      };
    });
  }, [logs]);

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const categories = ['transport', 'food', 'waste', 'energy', 'other'];
    return categories.map(cat => ({
      name: cat,
      value: logs
        .filter(log => log.type === cat)
        .reduce((sum, log) => sum + log.co2eSaved, 0),
    })).filter(item => item.value > 0);
  }, [logs]);

  const totalCO2e = useMemo(() => 
    logs.reduce((sum, log) => sum + log.co2eSaved, 0),
    [logs]
  );

  const weeklyProgress = useMemo(() => 
    Math.min((totalCO2e / weeklyGoal) * 100, 100),
    [totalCO2e, weeklyGoal]
  );

  return (
    <section className="impact-metrics" aria-label="Carbon impact dashboard">
      <div className="metrics-grid">
        {/* Weekly Progress */}
        <div className="metric-card" role="figure" aria-label="Weekly progress">
          <h3>Weekly Progress</h3>
          <div 
            className="progress-ring" 
            role="progressbar" 
            aria-valuenow={weeklyProgress} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            <svg viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="12"
                strokeDasharray={`${weeklyProgress * 3.39} 339`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="progress-label">{Math.round(weeklyProgress)}%</span>
          </div>
          <p>{totalCO2e.toFixed(1)} kg CO₂e saved of {weeklyGoal} kg goal</p>
        </div>

        {/* Weekly Trend Chart */}
        <div className="metric-card" role="figure" aria-label="Weekly CO₂e trend">
          <h3>Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} kg CO₂e`} />
              <Line 
                type="monotone" 
                dataKey="co2e" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="metric-card" role="figure" aria-label="Category breakdown">
          <h3>By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#607D8B'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} kg CO₂e`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
