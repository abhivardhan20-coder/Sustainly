import React from 'react';
import { Trophy, CheckCircle, Circle, Car, Utensils, Home, ShoppingBag, Lightbulb } from 'lucide-react';
import type { Challenge } from '../../types';
import CountUp from '../CountUp';
import GlassCard from '../GlassCard';

interface ChallengeCardProps {
  challenge: Challenge;
  onProgress?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  transport: Car,
  food: Utensils,
  home: Home,
  goods: ShoppingBag,
  other: Lightbulb,
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; fill: string }> = {
  transport: { bg: 'bg-primary-container/30', text: 'text-primary', fill: 'bg-primary' },
  food: { bg: 'bg-tertiary-container/30', text: 'text-tertiary', fill: 'bg-tertiary' },
  home: { bg: 'bg-secondary-container/30', text: 'text-secondary', fill: 'bg-secondary' },
  goods: { bg: 'bg-outline/10', text: 'text-outline', fill: 'bg-outline' },
  other: { bg: 'bg-outline-variant/30', text: 'text-on-surface-variant', fill: 'bg-outline-variant' },
};

export default function ChallengeCard({ challenge, onProgress }: ChallengeCardProps) {
  const Icon = CATEGORY_ICONS[challenge.category] || CATEGORY_ICONS.other;
  const style = CATEGORY_STYLES[challenge.category] || CATEGORY_STYLES.other;

  const percentComplete = Math.min(100, Math.round((challenge.currentCount / challenge.targetCount) * 100));
  const isCompleted = challenge.completed || percentComplete >= 100;

  return (
    <GlassCard className={`${isCompleted ? 'border-primary border-2' : 'border-surface-variant/50'} transition-all duration-300`}>
      {isCompleted && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-start justify-end p-3">
          <Trophy size={18} className="text-primary animate-[sway_3s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="flex gap-4">
        <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
          <Icon size={24} />
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h4 className={`text-base font-bold truncate ${isCompleted ? 'text-primary' : 'text-on-surface'}`}>
            {challenge.title}
          </h4>
          <p className="text-sm text-on-surface-variant mt-1 leading-snug line-clamp-2">
            {challenge.description}
          </p>

          <div className="mt-4">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-semibold text-on-surface-variant">Progress</span>
              <span className="text-sm font-bold text-on-surface">
                <CountUp to={challenge.currentCount} duration={0.5} /> / {challenge.targetCount}
              </span>
            </div>

            <div className="w-full h-2 bg-surface-variant/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${style.fill}`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {onProgress && !isCompleted && (
            <button
              onClick={() => onProgress(challenge.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-surface-variant hover:bg-surface-variant/80 text-sm font-bold text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Circle size={16} />
              Log Progress
            </button>
          )}

          {isCompleted && (
            <div className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary/10 text-sm font-bold text-primary">
              <CheckCircle size={16} />
              Challenge Completed
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}