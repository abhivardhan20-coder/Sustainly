import { useState, useEffect, useMemo } from 'react';
import { Sparkles, X, ChevronRight, TrendingUp, Leaf as Seedling, Flame, Zap, Award, Trees, Globe } from 'lucide-react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { auth } from '../lib/firebase';
import Heatmap from '../components/Heatmap';
import BadgeGrid from '../components/dashboard/BadgeGrid';
import BorderGlow from '../components/BorderGlow';
import { useCarbonMetrics } from '../hooks/useCarbonMetrics';
import EmissionsBreakdown from '../components/carbon/EmissionsBreakdown';
import ReductionForecast from '../components/carbon/ReductionForecast';
import ChallengeCard from '../components/gamification/ChallengeCard';
import CarbonCalculator from '../components/carbon/CarbonCalculator';
import FocusTrap from '../components/FocusTrap';
import GlassCard from '../components/GlassCard';
import type { Challenge, GardenState, DailyLog } from '../types';

// Moved badges to proper types without 'any'
const BADGES = [
  { id: 'first_log', title: 'First Step', desc: 'Logged your first activity', icon: Seedling, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => Object.keys(s.dailyLogs).length > 0 },
  { id: 'streak_3', title: 'On Fire', desc: '3-day streak', icon: Flame, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => s.streak >= 3 },
  { id: 'streak_7', title: 'Unstoppable', desc: '7-day streak', icon: Zap, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => s.streak >= 7 },
  { id: 'points_100', title: 'Century', desc: 'Earned 100 points', icon: Award, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => Object.values(s.dailyLogs).reduce((acc, log) => acc + log.totalPoints, 0) >= 100 },
  { id: 'trees_5', title: 'Forester', desc: 'Grew 5 trees', icon: Trees, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => s.garden.trees >= 5 },
  { id: 'diverse_logger', title: 'All-Rounder', desc: 'Logged all categories', icon: Globe, condition: (s: { dailyLogs: Record<string, DailyLog>; streak: number; garden: GardenState }) => {
    const cats = new Set<string>();
    Object.values(s.dailyLogs).forEach(log => log.activities.forEach(act => cats.add(act.type)));
    return cats.size >= 4;
  }},
];

// Fallback tips
const FALLBACK_INSIGHTS = [
  "Switching to LED bulbs can save up to 75% on lighting energy.",
  "Eating one plant-based meal a day reduces your carbon footprint significantly.",
  "Public transit produces 50% less CO₂ than driving alone.",
  "Turning your thermostat down by 2°F in winter saves 5% on heating."
];

// Expiration date for the mock challenge
const MOCK_CHALLENGE_EXPIRES_AT = new Date(Date.now() + 7 * 86400000).toISOString();

export default function Dashboard() {
  const store = useSustainlyStore();
  const metrics = useCarbonMetrics();
  const [activeTab, setActiveTab] = useState<'overview' | 'impact'>('overview');
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Mock challenge data
  const challenge: Challenge = useMemo(() => ({
    id: 'ch-1',
    title: 'Meatless Week',
    description: 'Log 5 vegetarian or vegan meals this week.',
    category: 'food',
    targetCount: 5,
    currentCount: metrics.categoryBreakdown.food > 0 ? 1 : 0, // Mock progress
    expiresAt: MOCK_CHALLENGE_EXPIRES_AT,
    completed: false
  }), [metrics.categoryBreakdown.food]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const token = auth.currentUser 
          ? await auth.currentUser.getIdToken() 
          : (typeof window !== 'undefined' && window.__E2E_AUTH_MOCK__ ? 'test-token' : undefined);
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(typeof window !== 'undefined' && window.__E2E_AUTH_MOCK__ && { 'X-E2E-Mock': 'true' })
          },
          body: JSON.stringify({
            profile: store.profile,
            history: Object.values(store.dailyLogs).slice(-10) // Limit payload
          })
        });
        if (res.ok) {
          const data = await res.json();
          setInsights(data.insights?.length ? data.insights : FALLBACK_INSIGHTS);
        } else {
          setInsights(FALLBACK_INSIGHTS);
        }
      } catch {
        setInsights(FALLBACK_INSIGHTS);
      } finally {
        setLoadingInsights(false);
      }
    }
    fetchInsights();
  }, [store.profile, store.dailyLogs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showInsightsModal) {
        setShowInsightsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInsightsModal]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">
            Welcome back, {store.profile?.name?.split(' ')[0] || 'friend'}
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-1">
            You have a {store.streak}-day streak! Keep it up.
          </p>
        </div>
        <div className="flex gap-2 bg-surface-container rounded-full p-1 border border-surface-variant/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === 'overview' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === 'impact' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Impact
          </button>
        </div>
      </div>

      {/* Insights Ticker */}
      <GlassCard className="mb-8 w-full flex items-center gap-4 cursor-pointer hover:bg-surface-container transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none" tabIndex={0} onClick={() => setShowInsightsModal(true)} onKeyDown={(e) => e.key === 'Enter' && setShowInsightsModal(true)} role="button">
        <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
          <Sparkles className="text-primary" size={20} />
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="absolute w-full animate-[sway_10s_linear_infinite]">
            <p className="text-sm font-medium text-on-surface truncate">
              {loadingInsights ? "Analyzing your impact patterns..." : (insights[0] || FALLBACK_INSIGHTS[0])}
            </p>
          </div>
        </div>
        <ChevronRight className="text-on-surface-variant flex-shrink-0" size={20} />
      </GlassCard>

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Points Card */}
            <BorderGlow backgroundColor="var(--color-surface-container-lowest)" borderRadius={16} className="h-full">
              <div className="p-6 flex flex-col h-full justify-center text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-2">Today's Points</h3>
                <div className="text-6xl font-black text-primary my-4">
                  +{metrics.todaysPoints}
                </div>
                <div className="flex justify-center items-center gap-2 text-sm font-semibold text-secondary">
                  <TrendingUp size={16} />
                  <span>{metrics.weeklyPoints} pts this week</span>
                </div>
              </div>
            </BorderGlow>

            {/* Weekly Challenge */}
            <ChallengeCard challenge={challenge} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmissionsBreakdown dailyLogs={store.dailyLogs} />
            <ReductionForecast dailyLogs={store.dailyLogs} />
          </div>

          <div className="pt-4 border-t border-surface-variant">
            <h2 className="text-xl font-bold text-on-surface mb-6">Your Badges</h2>
            {/* Safe type casting for badge grid */}
            <BadgeGrid badges={BADGES} store={store} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <CarbonCalculator />

          <div className="pt-4 border-t border-surface-variant">
            <h2 className="text-xl font-bold text-on-surface mb-6">Activity Heatmap</h2>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-variant overflow-x-auto">
              <Heatmap logs={store.dailyLogs} days={365} />
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {showInsightsModal && (
        <FocusTrap active={showInsightsModal}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              role="button"
              tabIndex={-1}
              aria-label="Close modal"
              className="fixed inset-0 bg-surface/80 backdrop-blur-sm"
              onClick={() => setShowInsightsModal(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowInsightsModal(false);
                }
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="insights-title"
              className="relative z-10 bg-surface-container-lowest border border-surface-variant rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-lg"
            >
              <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low/50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <h2 id="insights-title" className="text-lg font-bold text-on-surface">Personalized Insights</h2>
                </div>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {loadingInsights ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-on-surface-variant text-sm font-medium">Generating your custom insights...</p>
                  </div>
                ) : (
                  insights.map((insight, idx) => (
                    <div key={idx} className="bg-surface-container p-4 rounded-xl border border-surface-variant/50">
                      <p className="text-on-surface text-sm leading-relaxed font-medium">{insight}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-surface-variant text-center bg-surface-container-low/50 rounded-b-2xl text-xs text-on-surface-variant font-medium">
                AI-generated based on your recent activity
              </div>
            </div>
          </div>
        </FocusTrap>
      )}
    </div>
  );
}
