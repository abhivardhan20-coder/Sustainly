import React, { useEffect, useState } from 'react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { Leaf, PlusCircle, Bike, Utensils, Home, ShoppingBag, Flame, ArrowRight, ArrowDown, ArrowUp, Minus, Trees, X, Footprints, Zap, Award, Star } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import BorderGlow from '../components/BorderGlow';
import CountUp from '../components/CountUp';
import ScrollVelocity from '../components/ScrollVelocity';

const BADGES = [
  { id: 'first_step', title: 'First Step', desc: 'Logged your first activity', icon: Footprints, condition: (s: any) => Object.keys(s.dailyLogs).length > 0 },
  { id: 'streak_3', title: 'Consistent', desc: 'Maintained a 3-day streak', icon: Flame, condition: (s: any) => s.streak >= 3 },
  { id: 'streak_7', title: 'Unstoppable', desc: 'Maintained a 7-day streak', icon: Zap, condition: (s: any) => s.streak >= 7 },
  { id: 'tree_hugger', title: 'Tree Hugger', desc: 'Planted 5 trees in your garden', icon: Trees, condition: (s: any) => s.garden.trees >= 5 },
  { id: 'carbon_saver', title: 'Carbon Saver', desc: 'Earned 500 total points', icon: Award, condition: (s: any) => {
    let total = 0;
    for (const key in s.dailyLogs) {
      total += s.dailyLogs[key].totalPoints;
    }
    return total >= 500;
  }}
];

export default function Dashboard() {
  const { profile, streak, dailyLogs } = useSustainlyStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, history: dailyLogs }),
        });
        const data = await response.json();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setInsights(data);
          } else {
            setInsights(["🚴 Biking 3 days/week saves 1k lbs CO2", "💡 LED bulbs use 75% less energy", "🥦 1 plant-based meal saves 2k gal water", "🔌 Unplug to prevent phantom drain", "👕 Wash cold to save 90% energy", "🛍️ Reusable bags save plastic"]);
          }
        }
      } catch (error) {
        if (isMounted) {
          setInsights(["🚴 Biking 3 days/week saves 1k lbs CO2", "💡 LED bulbs use 75% less energy", "🥦 1 plant-based meal saves 2k gal water", "🔌 Unplug to prevent phantom drain", "👕 Wash cold to save 90% energy", "🛍️ Reusable bags save plastic"]);
        }
      } finally {
        if (isMounted) {
          setLoadingInsights(false);
        }
      }
    };
    
    fetchInsights();
    
    return () => { isMounted = false; };
  }, [profile, dailyLogs]);

  // For MVP, just calculate points from all logs for "avoided so far" concept
  // Or today's points
  const today = new Date().toISOString().split('T')[0];
  const todaysLog = dailyLogs[today] || { activities: [], totalPoints: 0 };
  const todaysPoints = todaysLog.totalPoints;
  const store = useSustainlyStore();

  const chartData = [
    { name: 'Progress', value: todaysPoints > 0 ? todaysPoints : 0 },
    { name: 'Remaining', value: Math.max(20 - todaysPoints, 1) } // 20 is daily goal
  ];
  if (todaysPoints === 0) {
    chartData[0].value = 0;
    chartData[1].value = 100;
  }
  
  const totalDisplay = todaysPoints;

  const transportPoints = todaysLog.activities.filter(a => a.type === 'transport').reduce((a, b) => a + (b.points || 0), 0);
  const foodPoints = todaysLog.activities.filter(a => a.type === 'food').reduce((a, b) => a + (b.points || 0), 0);
  const homePoints = todaysLog.activities.filter(a => a.type === 'home').reduce((a, b) => a + (b.points || 0), 0);
  const goodsPoints = todaysLog.activities.filter(a => a.type === 'goods' || !['transport', 'food', 'home'].includes(a.type)).reduce((a, b) => a + (b.points || 0), 0);

  const renderTrend = (pts: number) => {
    if (pts > 0) return <><ArrowUp size={14} /> <CountUp to={pts} duration={1.5} /> pts</>;
    if (pts < 0) return <><ArrowDown size={14} /> <CountUp to={Math.abs(pts)} duration={1.5} /> pts</>;
    return <><Minus size={14} /> 0 pts</>;
  };

  const getTrendColor = (pts: number) => {
    if (pts > 0) return 'text-primary';
    if (pts < 0) return 'text-error';
    return 'text-on-surface-variant';
  };

  const topActivities = [...todaysLog.activities]
    .filter(a => a.points > 0)
    .sort((a,b) => (b.points||0) - (a.points||0))
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-500 p-4 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-4 md:hidden">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Welcome back, {profile?.name?.split(' ')[0]}</h2>
        </div>
      </div>
      
      <div className="hidden md:flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Welcome back, {profile?.name?.split(' ')[0]}</h2>
          <p className="text-on-surface-variant font-medium mt-1">You're making a positive impact today.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full shadow-sm">
          <Flame size={20} className="text-tertiary-fixed-dim fill-current" />
          <span className="text-xs uppercase font-bold tracking-wider text-on-surface"><CountUp to={streak} /> Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Did You Know? Section */}
          <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm overflow-hidden hidden md:block border-l-4 border-l-primary pt-2 pb-1 relative">
            <div className="absolute top-0 left-0 bg-primary text-on-primary text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-br-lg z-10 w-auto inline-block">Did you know? • Tips</div>
            <div className="mt-4">
              {!loadingInsights && insights.length > 0 && (
                <ScrollVelocity
                  texts={[
                    insights.join(' • ') + ' • '
                  ]}
                  velocity={40}
                  className="text-on-surface-variant text-sm font-medium px-4 opacity-90"
                  numCopies={6}
                />
              )}
              {loadingInsights && (
                <div className="text-on-surface-variant text-sm font-medium px-4 opacity-70 h-[32px] flex items-center">
                  Generating insights...
                </div>
              )}
            </div>
          </BorderGlow>

          {/* Hero Card: Impact */}
          <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm">
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6 w-full">
              <div className="relative flex-shrink-0 w-40 h-40 flex items-center justify-center">
               <PieChart width={160} height={160}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={65}
                    startAngle={225}
                    endAngle={-45}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#166534" />
                    <Cell fill="#eeeeed" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center animate-sway">
                   <Leaf size={40} className="text-primary fill-current opacity-90" />
                </div>
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h3 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Today's Points</h3>
              <div className="text-4xl font-bold text-primary mb-1">
                {totalDisplay > 0 ? '+' : ''}<CountUp to={totalDisplay} duration={1.5} /> <span className="text-xl font-normal text-on-surface-variant">pts</span>
              </div>
              <p className="text-on-surface-variant font-medium">Earn positive points by making great sustainable choices!</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                {topActivities.length > 0 ? (
                  topActivities.map((act, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-soft-sage/30 text-primary-container">
                        +{act.points} {act.description}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-surface-variant text-on-surface-variant">
                      No actions logged yet today
                  </span>
                )}
              </div>
            </div>
            </div>
          </BorderGlow>

          {/* Logging Action */}
          <Link to="/log" className="w-full bg-primary hover:bg-primary-container text-on-primary text-lg font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98]">
             <PlusCircle size={24} /> Log Today's Activities
          </Link>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
             <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm hover:scale-[1.02] cursor-pointer transition-transform">
               <div className="p-4 text-center" onClick={() => setSelectedCategory('transport')}>
                 <div className="w-10 h-10 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-3 text-primary">
                   <Bike size={20} />
                 </div>
                 <div className="text-xs font-bold tracking-widest text-on-surface uppercase mb-1">Transport</div>
                 <div className={`flex items-center justify-center gap-1 text-xs font-bold ${getTrendColor(transportPoints)}`}>
                   {renderTrend(transportPoints)}
                 </div>
               </div>
             </BorderGlow>
             
             <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm hover:scale-[1.02] cursor-pointer transition-transform">
               <div className="p-4 text-center" onClick={() => setSelectedCategory('food')}>
                 <div className="w-10 h-10 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-3 text-tertiary-container">
                   <Utensils size={20} />
                 </div>
                 <div className="text-xs font-bold tracking-widest text-on-surface uppercase mb-1">Food</div>
                 <div className={`flex items-center justify-center gap-1 text-xs font-bold ${getTrendColor(foodPoints)}`}>
                   {renderTrend(foodPoints)}
                 </div>
               </div>
             </BorderGlow>

             <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm hover:scale-[1.02] cursor-pointer transition-transform">
               <div className="p-4 text-center" onClick={() => setSelectedCategory('home')}>
                 <div className="w-10 h-10 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-3 text-primary-container">
                   <Home size={20} />
                 </div>
                 <div className="text-xs font-bold tracking-widest text-on-surface uppercase mb-1">Home</div>
                 <div className={`flex items-center justify-center gap-1 text-xs font-bold ${getTrendColor(homePoints)}`}>
                   {renderTrend(homePoints)}
                 </div>
               </div>
             </BorderGlow>

             <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full shadow-sm hover:scale-[1.02] cursor-pointer transition-transform">
               <div className="p-4 text-center" onClick={() => setSelectedCategory('goods')}>
                 <div className="w-10 h-10 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-3 text-on-surface-variant">
                   <ShoppingBag size={20} />
                 </div>
                 <div className="text-xs font-bold tracking-widest text-on-surface uppercase mb-1">Goods</div>
                 <div className={`flex items-center justify-center gap-1 text-xs font-bold ${getTrendColor(goodsPoints)}`}>
                   {renderTrend(goodsPoints)}
                 </div>
               </div>
             </BorderGlow>
          </div>
        </div>

        {/* Right Column: Garden Teaser */}
        <div className="lg:col-span-4 flex flex-col">
           <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="w-full h-full shadow-sm group cursor-pointer hover:shadow-md transition-shadow">
             <div className="flex flex-col h-full relative" onClick={() => navigate('/garden')}>
               <div className="h-48 bg-soft-sage relative overflow-hidden flex items-end justify-center pb-4 rounded-t-xl">
                {/* Visual Fake Garden */}
                <svg className="text-primary-container absolute bottom-4 animate-sway opacity-90" width="120" height="140" viewBox="0 0 120 200" fill="none">
                  <path d="M60 200C60 200 50 120 60 60" stroke="#824b0b" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M58 120C58 120 30 100 20 80" stroke="#824b0b" strokeWidth="6" strokeLinecap="round"/>
                  <circle cx="60" cy="50" r="45" fill="currentColor"/>
                  <circle cx="30" cy="70" r="30" fill="currentColor" opacity="0.8"/>
                  <circle cx="90" cy="60" r="35" fill="currentColor" opacity="0.85"/>
                </svg>

                <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-surface-variant/50">
                  <Trees size={16} className="text-primary fill-current" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Level <CountUp to={Math.max(1, streak)} /></span>
                </div>
             </div>
             
             <div className="p-6 flex-grow flex flex-col">
               <h3 className="text-xl font-bold text-on-surface mb-2">Your Impact Garden</h3>
               <p className="text-on-surface-variant font-medium text-sm mb-4 flex-grow">
                 Your sustainable choices are helping a virtual Oak tree sprout. Keep logging to see it grow!
               </p>
               <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-variant/50">
                 <span className="text-xs uppercase font-bold tracking-widest text-primary group-hover:underline">Visit Garden</span>
                 <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
               </div>
             </div>
           </div>
           </BorderGlow>
        </div>

      </div>

      {/* Badges Section */}
      <div className="mt-8 mb-4">
        <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <Star className="text-primary fill-current" size={24} /> 
          Milestone Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BADGES.map(badge => {
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
      </div>

      {/* Insights Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCategory(null)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-variant/50 flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface">
                {selectedCategory} Insights
              </h3>
              <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-4">
                {todaysLog.activities.filter(a => a.type === selectedCategory || (selectedCategory === 'goods' && !['transport', 'food', 'home'].includes(a.type))).length > 0 ? (
                  todaysLog.activities.filter(a => a.type === selectedCategory || (selectedCategory === 'goods' && !['transport', 'food', 'home'].includes(a.type))).map((act, i) => (
                    <div key={i} className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-surface-variant/30">
                      <span className="font-medium text-on-surface">{act.description}</span>
                      <span className={`font-bold flex items-center gap-1 ${getTrendColor(act.points)}`}>{renderTrend(act.points)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant/70 italic text-center py-8">No activities logged in {selectedCategory} today.</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-variant/50 flex justify-end">
              <button onClick={() => setSelectedCategory(null)} className="px-6 py-2 font-bold text-primary hover:bg-primary-container/30 rounded-full transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
