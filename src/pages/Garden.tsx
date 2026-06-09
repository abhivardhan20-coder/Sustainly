import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { Leaf, PieChart, Share2, Flame } from 'lucide-react';
import BorderGlow from '../components/BorderGlow';
import CountUp from '../components/CountUp';

export default function Garden() {
  const { garden, profile, streak, dailyLogs } = useSustainlyStore();
  const navigate = useNavigate();

  const allActivities = Object.values(dailyLogs).flatMap(log => log.activities);
  
  const countsByType = allActivities.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { total: 0 } as Record<string, number>);

  const foodPercent = countsByType.total > 0 ? Math.round(((countsByType['food'] || 0) / countsByType.total) * 100) : 0;
  const transportPercent = countsByType.total > 0 ? Math.round(((countsByType['transport'] || 0) / countsByType.total) * 100) : 0;
  const energyPercent = countsByType.total > 0 ? Math.round(((countsByType['home'] || 0) / countsByType.total) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 p-4 lg:p-8">
      
      {/* Left Column: Canvas */}
      <section className="flex-1 flex flex-col gap-6 order-2 lg:order-1 relative">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-3xl font-bold text-primary">Your Impact Garden</h2>
            <p className="text-on-surface-variant font-medium mt-1">A living representation of your sustainable choices.</p>
          </div>
        </div>

        {/* Garden Container */}
        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-surface-variant/20 flex flex-col justify-end p-8 bg-gradient-to-b from-surface to-soft-sage/40">
          
          <div className="absolute top-8 left-8 flex gap-2 opacity-60">
             <div className="animate-swaySlow bg-white rounded-full w-12 h-6 blur-[8px] opacity-80 backdrop-blur" />
             <div className="animate-sway bg-white rounded-full w-16 h-8 mt-4 blur-[8px] opacity-80 backdrop-blur" />
          </div>

          <div className="absolute top-12 right-12 opacity-80 text-tertiary-fixed-dim pointer-events-none">
             <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-full blur-[10px]" />
          </div>

          {/* SVG Elements */}
          <div className="relative z-10 w-full h-full flex items-end justify-center gap-4 md:gap-8 pb-4">
             {/* Plant 1 */}
             <div className="flex flex-col items-center justify-end h-32 animate-grow origin-bottom animate-sway">
               <svg className="text-surface-tint" fill="none" height="80" viewBox="0 0 40 80" width="40">
                 <path d="M20 80C20 80 15 50 20 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                 <path d="M20 60C20 60 5 55 10 40C15 25 20 60 20 60Z" fill="currentColor" />
                 <path d="M20 45C20 45 35 40 30 25C25 10 20 45 20 45Z" fill="currentColor" opacity="0.8" />
               </svg>
             </div>

             {/* Dynamic Trees based on streak or points */}
             {garden.trees > 0 && (
                <div className="flex flex-col items-center justify-end h-64 animate-grow origin-bottom animate-swaySlow">
                  <svg className="text-primary-container" fill="none" height="200" viewBox="0 0 120 200" width="120">
                    <path d="M60 200C60 200 50 120 60 60" stroke="#824b0b" strokeWidth="12" strokeLinecap="round" />
                    <path d="M58 120C58 120 30 100 20 80" stroke="#824b0b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M62 90C62 90 90 70 100 50" stroke="#824b0b" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="60" cy="50" r="45" fill="currentColor" opacity="0.9" />
                    <circle cx="30" cy="70" r="30" fill="currentColor" opacity="0.8" />
                    <circle cx="90" cy="60" r="35" fill="currentColor" opacity="0.85" />
                    <circle cx="60" cy="20" r="30" fill="#a6f4b5" opacity="0.6" />
                  </svg>
                </div>
             )}

             {garden.trees > 1 && (
               <div className="flex flex-col items-center justify-end h-48 animate-grow origin-bottom animate-sway pt-8 px-4">
                  <svg className="text-secondary" fill="none" height="150" viewBox="0 0 90 150" width="90">
                    <path d="M45 150C45 150 40 90 45 40" stroke="#824b0b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M45 40L20 80L45 70L70 80L45 40Z" fill="currentColor" />
                    <path d="M45 20L10 70L45 60L80 70L45 20Z" fill="currentColor" opacity="0.9" />
                    <path d="M45 0L0 60L45 50L90 60L45 0Z" fill="currentColor" opacity="0.8" />
                  </svg>
               </div>
             )}
          </div>
        </div>

        <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-variant/20">
           <div className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
             <Leaf className="text-primary" size={20} />
             <span>Your garden grew by <strong className="text-primary"><CountUp to={garden.trees} /> elements</strong> this week!</span>
           </div>
           <button className="bg-surface-container-lowest text-primary text-xs uppercase font-bold tracking-widest px-4 py-3 rounded-xl border border-primary/20 hover:bg-surface-variant transition-colors flex items-center gap-2 shadow-sm">
             <Share2 size={16} /> Share
           </button>
        </div>
      </section>

      {/* Right Column: Stats */}
      <aside className="w-full lg:w-[350px] flex flex-col gap-6 order-1 lg:order-2">
         {/* Streak */}
         <BorderGlow backgroundColor="#ffffff" borderRadius={16} className="shadow-sm">
           <div className="p-6 relative overflow-hidden group w-full h-full">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center text-primary-container">
                 <Flame size={20} className="fill-current" />
               </div>
               <span className="bg-surface-container py-1 px-3 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary">Active</span>
             </div>
             <div className="relative z-10">
               <h3 className="text-5xl font-bold text-primary mb-1"><CountUp to={streak} /></h3>
               <p className="font-semibold text-on-surface-variant text-sm">Day Impact Streak</p>
             </div>
           </div>
         </BorderGlow>

         {/* Diversity */}
         <BorderGlow backgroundColor="#ffffff" borderRadius={16} className="shadow-sm">
           <div className="p-6 w-full h-full">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-text-main">Choice Diversity</h3>
               <PieChart className="text-soft-sage" size={20} />
             </div>
             
             <div className="space-y-5">
             <div>
               <div className="flex justify-between text-sm mb-2 font-semibold">
                 <span className="text-on-surface-variant flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Food</span>
                 <span className="text-primary font-bold"><CountUp to={foodPercent} />%</span>
               </div>
               <div className="w-full bg-surface-container-highest rounded-full h-2">
                 <div className="bg-primary-container h-2 rounded-full" style={{ width: `${foodPercent}%` }}></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-2 font-semibold">
                 <span className="text-on-surface-variant flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> Transport</span>
                 <span className="text-primary font-bold"><CountUp to={transportPercent} />%</span>
               </div>
               <div className="w-full bg-surface-container-highest rounded-full h-2">
                 <div className="bg-secondary h-2 rounded-full" style={{ width: `${transportPercent}%` }}></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-2 font-semibold">
                 <span className="text-on-surface-variant flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span> Energy</span>
                 <span className="text-primary font-bold"><CountUp to={energyPercent} />%</span>
               </div>
               <div className="w-full bg-surface-container-highest rounded-full h-2">
                 <div className="bg-tertiary-fixed-dim h-2 rounded-full" style={{ width: `${energyPercent}%` }}></div>
               </div>
             </div>
           </div>
         </div>
         </BorderGlow>

         {/* Milestone */}
         <BorderGlow backgroundColor="#f5fdf7" borderRadius={16} className="shadow-sm">
           <div className="p-6 relative overflow-hidden flex flex-col justify-between w-full h-full">
             <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
               <Leaf size={120} className="fill-current" />
             </div>
             
             <div className="mb-4 relative z-10">
               <span className="text-[10px] font-bold tracking-widest text-primary-container uppercase">Next Milestone</span>
               <h3 className="text-lg font-bold text-on-surface mt-2">Oak Tree Status</h3>
               <p className="font-semibold text-on-surface-variant text-sm mt-3 leading-relaxed">
                 {((countsByType['transport'] || 0) < 5) 
                   ? `Log ${5 - (countsByType['transport'] || 0)} more transport action${(5 - (countsByType['transport'] || 0)) === 1 ? '' : 's'} to unlock the mighty Oak for your garden.`
                   : "You've unlocked the mighty Oak for your garden! Keep logging transport actions to grow it further."}
               </p>
             </div>
             <button 
               onClick={() => navigate('/log')}
               className="w-full relative z-10 bg-primary-container text-on-primary font-bold py-3 rounded-xl hover:bg-primary transition-colors mt-2 shadow-sm"
             >
               Log Action
             </button>
           </div>
         </BorderGlow>
      </aside>
    </div>
  );
}
