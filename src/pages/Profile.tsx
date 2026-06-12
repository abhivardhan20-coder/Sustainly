import React, { useState, useRef, useEffect } from 'react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { User, Activity, Flame, Leaf, Settings, LogOut, ChartNoAxesCombined, Download, Upload, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BorderGlow from '../components/BorderGlow';
import CountUp from '../components/CountUp';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { z } from 'zod';

export default function Profile() {
  const { profile, streak, dailyLogs, resetAllData, clearActivityLogs, theme, setTheme } = useSustainlyStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);

  if (!profile) return null;

  const allActivities = Object.values(dailyLogs).flatMap(log => log.activities);
  const totalPoints = allActivities.reduce((acc, curr) => acc + (curr.points || 0), 0);
  const totalLogs = allActivities.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      resetAllData();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) setShowLogoutConfirm(false);
        if (showClearLogsConfirm) setShowClearLogsConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm, showClearLogsConfirm]);

  const handleExport = () => {
    const state = useSustainlyStore.getState();
    const data = {
      profile: state.profile,
      dailyLogs: state.dailyLogs,
      garden: state.garden,
      streak: state.streak,
      lastLoggedDate: state.lastLoggedDate,
      todaysActions: state.todaysActions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainly-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSchema = z.object({
    profile: z.object({
      id: z.string(),
      name: z.string(),
      city: z.string(),
      diet: z.enum(['everything', 'pescatarian', 'vegetarian', 'vegan']),
      primaryCommute: z.array(z.string()),
      homeACUsage: z.enum(['track', 'could-better', 'not-really']),
      createdAt: z.string()
    }),
    dailyLogs: z.record(z.any()).optional(),
    garden: z.object({
      trees: z.number(),
      flowers: z.number(),
      lastGrown: z.string().optional()
    }).optional(),
    streak: z.number().optional(),
    lastLoggedDate: z.string().nullable().optional(),
    todaysActions: z.array(z.any()).optional()
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);
        const parsed = importSchema.safeParse(rawData);
        if (!parsed.success) {
          alert('Invalid backup file format. The file does not match the expected schema.');
          console.error('Import validation errors:', parsed.error.format());
          return;
        }
        const data = parsed.data;
        useSustainlyStore.setState({
          profile: data.profile,
          dailyLogs: data.dailyLogs || {},
          garden: data.garden || { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
          streak: data.streak || 0,
          lastLoggedDate: data.lastLoggedDate || null,
          todaysActions: data.todaysActions || []
        });
        alert('Data imported successfully! The system has been configured with the new data.');
      } catch (err) {
        alert('Error parsing JSON file. Please ensure it is a valid backup.');
        console.error(err);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-500 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-on-surface">Your Profile</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button 
            onClick={() => navigate('/onboarding')}
            aria-label="Edit profile preferences"
            className="text-primary hover:bg-primary-container/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Settings size={16} /> Edit
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Log out of Sustainly"
            className="text-error hover:bg-error-container/30 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-error/50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="logout-title"
        >
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-lg border border-surface-variant/40">
            <h3 id="logout-title" className="text-xl font-bold text-on-surface mb-2">Confirm Logout</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Are you sure you want to log out and clear all your local data? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold bg-error text-on-error hover:bg-error/90 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-error/50"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearLogsConfirm && (
        <div 
          className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="clear-logs-title"
        >
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-lg border border-surface-variant/40">
            <h3 id="clear-logs-title" className="text-xl font-bold text-on-surface mb-2">Clear All Logs</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Are you sure you want to clear your daily logs, chats, and garden data? Your profile details will remain intact. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowClearLogsConfirm(false)}
                className="px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  clearActivityLogs();
                  setShowClearLogsConfirm(false);
                }}
                className="px-4 py-2 rounded-lg font-semibold bg-error text-on-error hover:bg-error/90 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-error/50"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <BorderGlow backgroundColor="#ffffff" borderRadius={16} className="md:col-span-1 shadow-sm h-full">
          <div className="p-8 flex flex-col items-center text-center h-full">
            <div className="w-24 h-24 rounded-full border-[3px] border-primary-container bg-surface-variant flex items-center justify-center overflow-hidden mb-4 shadow-sm text-3xl font-bold text-on-surface">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-bold text-primary mb-1">{profile.name}</h3>
            <p className="text-on-surface-variant font-medium text-sm flex items-center gap-1 mb-6">
              <span className="capitalize">{profile.city}</span> Environment
            </p>
            
            <div className="w-full flex flex-col gap-3 text-left">
              <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-start justify-between gap-4 text-sm">
                <span className="text-on-surface-variant font-semibold whitespace-nowrap pt-0.5">Diet</span>
                <span className="font-bold text-primary capitalize text-right">{profile.diet}</span>
              </div>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-start justify-between gap-4 text-sm">
                <span className="text-on-surface-variant font-semibold whitespace-nowrap pt-0.5">Commute</span>
                <span className="font-bold text-primary capitalize text-right">{profile.primaryCommute.join(', ')}</span>
              </div>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-start justify-between gap-4 text-sm">
                <span className="text-on-surface-variant font-semibold whitespace-nowrap pt-0.5">Joined</span>
                <span className="font-bold text-primary text-right">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Stats & Insights */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm">
              <div className="p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-fixed/30 text-primary-container flex items-center justify-center">
                  <Leaf size={20} className="fill-current" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-on-surface">{totalPoints > 0 ? '+' : ''}<CountUp to={totalPoints} /></div>
                  <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mt-1">Total Impact Points</div>
                </div>
              </div>
            </BorderGlow>

            <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm">
              <div className="p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <Flame size={20} className="fill-current" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-on-surface"><CountUp to={streak} /></div>
                  <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mt-1">Day Streak</div>
                </div>
              </div>
            </BorderGlow>
          </div>

          <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="flex-1 shadow-sm h-full">
            <div className="p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <ChartNoAxesCombined className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-on-surface">Your Impact Journey</h3>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-soft-sage/20 rounded-xl border border-soft-sage/30">
                <div className="bg-surface-container-lowest p-3 rounded-full text-primary shadow-sm">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Consistent Logger</h4>
                  <p className="text-sm font-medium text-on-surface-variant">You've logged <CountUp to={totalLogs} /> actions total.</p>
                </div>
              </div>
            </div>
          </BorderGlow>
          
          <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2">App Preferences</h3>
              <p className="text-sm text-on-surface-variant mb-6">Customize your experience</p>
              
              <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline/10">
                <div className="flex items-center gap-3">
                  <div className="text-primary bg-primary-container p-2 rounded-lg">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Dark Mode</div>
                    <div className="text-xs text-on-surface-variant">Switch between light and dark themes</div>
                  </div>
                </div>

                {/* Improved Switch */}
                <button
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label="Toggle dark mode"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50 ${theme === 'dark' ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </BorderGlow>
          
          <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2">Data Management</h3>
              <p className="text-sm text-on-surface-variant mb-6">Export your account data to a JSON file, or import existing data.</p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowClearLogsConfirm(true)}
                  aria-label="Clear all activity data and logs"
                  className="flex items-center gap-2 bg-error-container text-on-error-container hover:bg-error-container/80 px-5 py-3 rounded-xl font-bold transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-error/50"
                >
                  <LogOut size={18} /> Clear Activity Data
                </button>
                <button
                  onClick={handleExport}
                  aria-label="Export all your data as JSON file"
                  className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/80 px-5 py-3 rounded-xl font-bold transition-colors shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <Download size={18} /> Export Data
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Import data from JSON file"
                  />
                  <button 
                    className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant px-5 py-3 rounded-xl font-bold text-on-surface transition-colors shadow-sm border border-outline/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label="Import data from JSON file"
                  >
                    <Upload size={18} /> Import Data
                  </button>
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
}
