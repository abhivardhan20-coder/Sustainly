import React from 'react';
import { Star } from 'lucide-react';

export default function BadgeGrid({ badges, store }: { badges: any[], store: any }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {badges.map(badge => {
        const isUnlocked = badge.condition(store);
        const Icon = badge.icon;
        return (
          <div 
            key={badge.id}
            className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${
              isUnlocked 
                ? 'bg-surface-container border-primary/30 shadow-sm' 
                : 'bg-surface-container-lowest border-surface-variant/30 opacity-60 grayscale'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              isUnlocked ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
            }`}>
              <Icon size={24} className={isUnlocked ? 'fill-current opacity-20 relative' : ''} />
              {isUnlocked && <Icon size={24} className="absolute text-primary" />}
            </div>
            <h4 className={`text-sm font-bold text-center mb-1 ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {badge.title}
            </h4>
            <p className="text-[10px] text-center text-on-surface-variant/80">
              {badge.desc}
            </p>
            {isUnlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center shadow-sm">
                <Star size={12} className="fill-current" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
