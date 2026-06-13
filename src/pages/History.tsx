import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useSustainlyStore } from '../store/useSustainlyStore';
import Heatmap from '../components/Heatmap';
import { Leaf } from 'lucide-react';

export default function History() {
  const dailyLogs = useSustainlyStore(state => state.dailyLogs);

  const sortedDates = useMemo(() => {
    return Object.keys(dailyLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [dailyLogs]);

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-2">History</h1>
          <p className="text-on-surface-variant">Track your consistency and past eco-actions.</p>
        </div>
      </header>

      {/* Heatmap Section */}
      <section>
        <Heatmap logs={dailyLogs} days={365} />
      </section>

      {/* Activity Log List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface">Activity Log</h2>
        {sortedDates.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center border border-surface-variant/50 shadow-sm">
            <Leaf className="mx-auto h-12 w-12 text-tertiary opacity-50 mb-4" />
            <p className="text-on-surface-variant font-medium">No activities logged yet. Start logging to build your history!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => {
              const log = dailyLogs[date];
              if (!log.activities || log.activities.length === 0) return null;

              // Sort activities within the day by timestamp descending (handle missing timestamps)
              const sortedActivities = [...log.activities].sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return timeB - timeA;
              });

              return (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-surface-variant/50 flex-1"></div>
                    <h3 className="font-semibold text-sm text-on-surface-variant uppercase tracking-wider">
                      {format(parseISO(date), 'MMMM d, yyyy')}
                    </h3>
                    <div className="h-px bg-surface-variant/50 flex-1"></div>
                  </div>

                  <div className="bg-surface-container-low rounded-2xl border border-surface-variant/50 divide-y divide-surface-variant/50 overflow-hidden shadow-sm">
                    {sortedActivities.map((activity) => (
                      <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-surface-variant/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl flex-shrink-0">
                          {activity.icon || '🌱'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface font-medium mb-1">{activity.description}</p>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span>{activity.timestamp ? format(parseISO(activity.timestamp), 'h:mm a') : 'Time unknown'}</span>
                            <span>•</span>
                            <span className="capitalize">{activity.type}</span>
                            {activity.source === 'gemini' && (
                              <>
                                <span>•</span>
                                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">AI Log</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <div className="flex items-center justify-center bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-bold text-sm">
                            +{activity.points} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
