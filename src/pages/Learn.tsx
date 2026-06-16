import { useState } from 'react';
import { BookOpen, Filter, ChevronLeft, ChevronRight, Star, ExternalLink, CheckCircle, Circle, Leaf } from 'lucide-react';

const ECO_TIPS = [
  {
    id: 'tip-1', title: 'Switch to LED Lighting', 
    content: 'LED bulbs use up to 75% less energy than incandescent bulbs and last 25 times longer. A single LED bulb can save $75 in electricity over its lifetime.',
    category: 'home', impactRating: 4,
    sourceUrl: 'https://www.energy.gov/energysaver/lighting-choices-save-you-money'
  },
  {
    id: 'tip-2', title: 'Try Meatless Mondays', 
    content: 'Reducing meat consumption by just one day per week can save approximately 1,160 gallons of water and reduce your carbon footprint by 3.3 kg CO₂e per meal replaced.',
    category: 'food', impactRating: 5,
  },
  {
    id: 'tip-3', title: 'Bike Short Trips', 
    content: 'Half of all car trips are under 3 miles. Biking these short distances eliminates 0.63 kg CO₂e per trip and provides excellent exercise.',
    category: 'transport', impactRating: 4,
  },
  {
    id: 'tip-4', title: 'Unplug Phantom Loads', 
    content: 'Standby power (phantom loads) account for 5-10% of home energy use. Unplugging devices or using smart power strips can save $100-200 per year.',
    category: 'home', impactRating: 3,
  },
  {
    id: 'tip-5', title: 'Buy Secondhand First', 
    content: 'The fashion industry produces 10% of global carbon emissions. Buying secondhand reduces your clothing\'s carbon footprint by 82% compared to buying new.',
    category: 'goods', impactRating: 5,
  },
  {
    id: 'tip-6', title: 'Cold Water Washing', 
    content: 'Washing clothes in cold water saves up to 90% of the energy used for laundry. Modern detergents work just as well in cold water.',
    category: 'home', impactRating: 3,
  },
  {
    id: 'tip-7', title: 'Eat Local and Seasonal', 
    content: 'Food miles account for 11% of food-related emissions. Choosing local, seasonal produce reduces transportation emissions and supports local farmers.',
    category: 'food', impactRating: 3,
  },
  {
    id: 'tip-8', title: 'Public Transit Over Solo Driving', 
    content: 'Switching from driving alone to public transit can reduce your carbon footprint by 4,800 lbs CO₂ per year — more than any other individual action.',
    category: 'transport', impactRating: 5,
  },
  {
    id: 'tip-9', title: 'Start Composting', 
    content: 'Composting food scraps diverts waste from landfills where it produces methane (25x more potent than CO₂). A home compost can offset 0.2 kg CO₂e per kg composted.',
    category: 'other', impactRating: 4,
  },
  {
    id: 'tip-10', title: 'Reduce AC Usage', 
    content: 'Setting your thermostat 2°F higher in summer saves 5% on cooling costs. Using fans with AC allows you to raise the thermostat 4°F without comfort loss.',
    category: 'home', impactRating: 4,
  },
  {
    id: 'tip-11', title: 'Repair Electronics', 
    content: 'Manufacturing a new smartphone produces 70-80 kg CO₂e. Repairing and extending device life by 1 year reduces its annual carbon footprint by 25%.',
    category: 'goods', impactRating: 4,
  },
  {
    id: 'tip-12', title: 'Bring Reusable Bags', 
    content: 'A single reusable bag replaces 500+ disposable bags over its lifetime. Plastic bags take 500-1000 years to decompose in landfills.',
    category: 'goods', impactRating: 2,
  },
];

const TIPS_PER_PAGE = 6;
const CATEGORIES = ['all', 'transport', 'food', 'home', 'goods', 'other'];
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  transport: { bg: 'bg-primary-container/20', text: 'text-primary', border: 'border-l-primary', label: 'Transport' },
  food: { bg: 'bg-tertiary-container/20', text: 'text-tertiary', border: 'border-l-tertiary', label: 'Food' },
  home: { bg: 'bg-secondary-container/20', text: 'text-secondary', border: 'border-l-secondary', label: 'Home' },
  goods: { bg: 'bg-surface-variant/30', text: 'text-on-surface-variant', border: 'border-l-outline', label: 'Goods' },
  other: { bg: 'bg-surface-variant/20', text: 'text-on-surface-variant', border: 'border-l-outline-variant', label: 'Other' },
};

export default function Learn() {
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTips = ECO_TIPS.filter(tip => 
    selectedCategory === 'all' || tip.category === selectedCategory
  );

  const totalPages = Math.ceil(filteredTips.length / TIPS_PER_PAGE);
  const currentTips = filteredTips.slice(
    (currentPage - 1) * TIPS_PER_PAGE,
    currentPage * TIPS_PER_PAGE
  );

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedTips(newCompleted);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-primary-container text-on-primary-container rounded-2xl">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Learn</h1>
          <h2 className="text-sm font-medium text-on-surface-variant">Build your carbon literacy</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Filter size={18} className="text-on-surface-variant flex-shrink-0" />
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedCategory === category 
                ? 'bg-on-surface text-surface' 
                : 'bg-surface-container hover:bg-surface-variant text-on-surface-variant'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {currentTips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {currentTips.map(tip => {
            const style = CATEGORY_STYLES[tip.category] || CATEGORY_STYLES.other;
            const isCompleted = completedTips.has(tip.id);

            return (
              <div 
                key={tip.id} 
                className={`bg-surface-container-lowest rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${style.border} ${isCompleted ? 'border-r border-t border-b border-primary/20 bg-primary/5' : 'border-surface-variant/50'}`}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${style.bg} ${style.text}`}>
                      {style.label}
                    </div>
                    <div className="flex" aria-label={`Impact rating: ${tip.impactRating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Leaf 
                          key={star} 
                          size={14} 
                          className={star <= tip.impactRating ? 'fill-secondary text-secondary' : 'text-surface-variant opacity-30'} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-on-surface mb-2">{tip.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-1">
                    {tip.content}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-surface-variant/30">
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
                      <div></div>
                    )}
                    
                    <button 
                      onClick={() => toggleComplete(tip.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isCompleted 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle size={14} /> Done
                        </>
                      ) : (
                        <>
                          <Circle size={14} /> Mark as done
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-container-low rounded-2xl">
          <p className="text-on-surface-variant font-medium">No tips found for this category.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-on-surface"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-semibold text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-on-surface"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
