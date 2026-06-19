import React from 'react';
import { CheckCircle, Lightbulb, Car, Bus, Bike, Utensils, Home, Trees, Sparkles } from 'lucide-react';
import BorderGlow from '../BorderGlow';

interface Props {
  loggedResult: {
    activities?: { description: string; points: number; icon: string }[];
    suggestedAction?: { title: string; description: string; btnText: string };
  } | null;
  handleCompleteSuggestedAction: () => void;
  isActionCompleted: boolean;
}

const IconMap: Record<string, React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  car: Car,
  bus: Bus,
  bike: Bike,
  restaurant: Utensils,
  home: Home,
  trees: Trees
};

export default function ChatFeedback({ loggedResult, handleCompleteSuggestedAction, isActionCompleted }: Props) {
  if (!loggedResult || !loggedResult.activities || loggedResult.activities.length === 0) return null;

  return (
    <div 
      className="mt-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in duration-500 w-full max-w-2xl mx-auto" 
      role="status" 
      aria-label="Activity logged successfully"
    >
      <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm w-full">
        <div className="p-6 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <CheckCircle size={24} className="fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Logged Successfully!</h3>
              <p className="text-on-surface-variant text-sm font-semibold">Your impact garden is growing.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            {loggedResult.activities.map((act: { description: string; points: number; icon: string }, i: number) => {
              const Icon = IconMap[act.icon] || Sparkles;
              const isPositive = act.points >= 0;
              return (
                <div key={i} className={`p-4 rounded-lg flex flex-col gap-2 ${isPositive ? 'bg-surface-container' : 'bg-error-container/30'}`}>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Icon size={16} aria-hidden="true" /> {act.description}
                  </span>
                  <span className={`text-3xl font-bold ${isPositive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {isPositive ? '+' : ''}{act.points} pts
                  </span>
                </div>
              );
            })}
          </div>

          {loggedResult.suggestedAction && (
            <div className="bg-surface-bright rounded-lg p-5 border border-soft-sage/30 relative z-10">
              <p className="text-xs uppercase font-bold tracking-widest text-primary mb-3 flex items-center gap-2">
                <Lightbulb size={16} aria-hidden="true" /> Suggested Action
              </p>
              <h4 className="text-base font-bold text-on-surface mb-1">{loggedResult.suggestedAction.title}</h4>
              <p className="text-sm font-medium text-text-muted mb-4">{loggedResult.suggestedAction.description}</p>
              
              <button 
                onClick={handleCompleteSuggestedAction}
                disabled={isActionCompleted}
                className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${isActionCompleted 
                  ? 'bg-green-600 text-white cursor-default' 
                  : 'bg-primary text-on-primary hover:bg-primary/90'}`}
                aria-label={isActionCompleted 
                  ? `Completed: ${loggedResult.suggestedAction.title}` 
                  : `Commit to: ${loggedResult.suggestedAction.title}`}
              >
                {isActionCompleted ? '✓ Completed' : loggedResult.suggestedAction.btnText}
              </button>
            </div>
          )}
        </div>
      </BorderGlow>
    </div>
  );
}
