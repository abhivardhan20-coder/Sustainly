import { Trophy, Medal, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import CountUp from '../CountUp';

// Mock data since we don't have a real backend for this
const MOCK_LEADERBOARD = [
  { rank: 1, id: 'u1', name: 'EcoWarrior', points: 4520, trend: 'up' },
  { rank: 2, id: 'u2', name: 'GreenLife', points: 3890, trend: 'same' },
  { rank: 3, id: 'u3', name: 'TreeHugger99', points: 3450, trend: 'up' },
  { rank: 4, id: 'u4', name: 'SustainableMe', points: 2900, trend: 'down' },
  { rank: 5, id: 'u5', name: 'PlantPower', points: 2750, trend: 'up' },
  { rank: 24, id: 'me', name: 'You', points: 1240, trend: 'up' },
];

export default function LeaderboardCard() {
  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={18} className="text-yellow-500 drop-shadow-sm" />;
    if (rank === 2) return <Medal size={18} className="text-gray-400 drop-shadow-sm" />;
    if (rank === 3) return <Medal size={18} className="text-amber-700 drop-shadow-sm" />;
    return <span className="text-sm font-bold text-on-surface-variant w-[18px] text-center">{rank}</span>;
  };

  const renderTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp size={14} className="text-primary" />;
    if (trend === 'down') return <ArrowDown size={14} className="text-error" />;
    return <Minus size={14} className="text-on-surface-variant" />;
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/50 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-surface-variant/30 bg-surface-container-low/50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-on-surface">Weekly Leaderboard</h3>
          <span className="text-xs font-bold px-2 py-1 bg-primary-container text-on-primary-container rounded-lg">
            Top 15%
          </span>
        </div>
        <p className="text-sm text-on-surface-variant">
          You are rank <span className="font-bold text-on-surface">24</span> out of 156 local users
        </p>
      </div>

      <div className="p-2 flex-1">
        <ul className="space-y-1">
          {MOCK_LEADERBOARD.map((user) => {
            const isMe = user.id === 'me';
            return (
              <li 
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isMe ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-variant/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-6">
                    {renderRankIcon(user.rank)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isMe ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <span className={`text-sm font-semibold ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                      {user.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                    {user.points.toLocaleString()} <span className="text-xs font-normal opacity-70">pts</span>
                  </span>
                  <div className="w-4 flex justify-center">
                    {renderTrendIcon(user.trend)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-surface-variant/30 text-center">
          <button className="text-xs font-bold text-primary hover:underline focus:outline-none rounded">
            View Full Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
