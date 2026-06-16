import { Star, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import type { EcoTip } from '../../types';

interface EcoTipCardProps {
  tip: EcoTip;
  onComplete?: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  transport: { bg: 'bg-primary-container/20', text: 'text-primary', border: 'border-l-primary', label: 'Transport' },
  food: { bg: 'bg-tertiary-container/20', text: 'text-tertiary', border: 'border-l-tertiary', label: 'Food' },
  home: { bg: 'bg-secondary-container/20', text: 'text-secondary', border: 'border-l-secondary', label: 'Home' },
  goods: { bg: 'bg-surface-variant/30', text: 'text-on-surface-variant', border: 'border-l-outline', label: 'Goods' },
  other: { bg: 'bg-surface-variant/20', text: 'text-on-surface-variant', border: 'border-l-outline-variant', label: 'Other' },
};

export default function EcoTipCard({ tip, onComplete }: EcoTipCardProps) {
  const style = CATEGORY_STYLES[tip.category] || CATEGORY_STYLES.other;

  return (
    <div className={`bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/50 overflow-hidden transition-all hover:shadow-md border-l-4 ${style.border} group`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${style.bg} ${style.text}`}>
            {style.label}
          </div>
          <div className="flex" aria-label={`Impact rating: ${tip.impactRating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={14} 
                className={star <= tip.impactRating ? 'fill-secondary text-secondary' : 'text-surface-variant'} 
              />
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-on-surface mb-2">{tip.title}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          {tip.content}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-surface-variant/30">
          {tip.sourceUrl ? (
            <a 
              href={tip.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Read more <ExternalLink size={12} />
            </a>
          ) : (
            <div></div> // Spacer
          )}
          
          {onComplete && (
            <button 
              onClick={() => onComplete(tip.id)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                tip.completed 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              {tip.completed ? (
                <>
                  <CheckCircle size={14} /> Done
                </>
              ) : (
                <>
                  <Circle size={14} /> Mark as done
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
