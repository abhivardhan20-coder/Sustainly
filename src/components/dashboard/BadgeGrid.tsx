import React from 'react';
import type { BadgeDefinition as Badge } from '../../types';

import GlassCard from '../GlassCard';

import type { SustainlyStore } from '../../store/useSustainlyStore';

interface BadgeGridProps {
  badges: Badge[];
  store: Pick<SustainlyStore, 'dailyLogs' | 'streak' | 'garden'>;
}

export default function BadgeGrid({ badges, store }: BadgeGridProps) {
  const unlockedBadges = badges.filter(badge => badge.condition(store));
  const lockedBadges = badges.filter(badge => !badge.condition(store));

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-bold text-on-surface">Achievements</h2>
          <span className="text-sm text-on-surface-variant">
            {unlockedBadges.length}/{badges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {unlockedBadges.map(badge => (
            <div
              key={badge.id}
              className="flex items-center gap-3 p-4 bg-surface-container-lowest dark:bg-surface-container-lowest/50 rounded-xl border border-surface-variant/30 hover:bg-surface-container-lowest transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <badge.icon size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface line-clamp-1">
                  {badge.title}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}

          {lockedBadges.map(badge => (
            <div
              key={badge.id}
              className="flex items-center gap-3 p-4 bg-surface-container-lowest dark:bg-surface-container-lowest/50 rounded-xl border border-surface-variant/30 border-dashed hover:bg-surface-container-lowest/50 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                  <badge.icon size={20} className="text-on-surface-variant opacity-60" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-on-surface-variant line-clamp-1">
                  {badge.title}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {badge.desc}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs font-medium text-on-surface-variant">
                  Locked
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
