import React, { useState, useRef } from 'react';
import { LogOut, Trash2, Download, Upload, Moon, Sun } from 'lucide-react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { getAuth, signOut } from 'firebase/auth';
import { z } from 'zod';
import BorderGlow from '../components/BorderGlow';
import ConfirmModal from '../components/ConfirmModal';


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
  dailyLogs: z.record(z.string(), z.object({
    date: z.string(),
    activities: z.array(z.object({
      id: z.string(),
      timestamp: z.string(),
      type: z.enum(['transport', 'food', 'home', 'goods', 'other']),
      description: z.string(),
      points: z.number(),
      icon: z.string(),
      source: z.enum(['gemini', 'manual'])
    })),
    totalPoints: z.number()
  })),
  garden: z.object({
    trees: z.number(),
    flowers: z.number(),
    lastGrown: z.string().nullable()
  }),
  streak: z.number(),
  lastLoggedDate: z.string().nullable()
});

export default function Profile() {
  const store = useSustainlyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importError, setImportError] = useState('');
  
  if (!store.profile) return null;

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      store.resetAllData();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleExport = () => {
    const data = {
      profile: store.profile,
      dailyLogs: store.dailyLogs,
      garden: store.garden,
      streak: store.streak,
      lastLoggedDate: store.lastLoggedDate
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainly-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validatedData = importSchema.parse(json);
        
        // Ensure atomic update via Zustand
        useSustainlyStore.setState({
          profile: validatedData.profile,
          dailyLogs: validatedData.dailyLogs,
          garden: { ...validatedData.garden, lastGrown: validatedData.garden.lastGrown || new Date().toISOString() },
          streak: validatedData.streak,
          lastLoggedDate: validatedData.lastLoggedDate
        });
        
        setImportError('');
      } catch {
        setImportError('Invalid backup file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalLogs = Object.values(store.dailyLogs).reduce((acc, log) => acc + log.activities.length, 0);
  const totalPoints = Object.values(store.dailyLogs).reduce((acc, log) => acc + log.totalPoints, 0);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-on-surface">Your Profile</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="px-4 py-2 bg-surface-variant text-on-surface font-bold text-sm rounded-xl hover:bg-surface-variant/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="p-2 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out? Your data is safely synced to the cloud."
        confirmLabel="Log Out"
        variant="danger"
        titleId="logout-title"
      />

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          store.clearActivityLogs();
          setShowClearModal(false);
        }}
        title="Clear Activity History"
        description="This will permanently delete all your logged activities, reset your streak, and reset your points. Your profile and garden will remain."
        confirmLabel="Clear Data"
        variant="danger"
        titleId="clear-data-title"
      />

      <BorderGlow backgroundColor="var(--color-surface-container-lowest)" borderRadius={16} className="mb-8">
        <div className="p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 bg-primary text-on-primary rounded-full flex items-center justify-center text-4xl font-black">
            {store.profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-on-surface">{store.profile.name}</h2>
            <p className="text-on-surface-variant mt-1 mb-4">{store.profile.city}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-bold rounded-full capitalize">
                {store.profile.diet} Diet
              </span>
              {store.profile.primaryCommute.map(commute => (
                <span key={commute} className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-bold rounded-full capitalize">
                  {commute}
                </span>
              ))}
            </div>
          </div>
        </div>
      </BorderGlow>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/50 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-primary mb-1">{totalPoints}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Points</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/50 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-tertiary mb-1">{store.streak}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Day Streak</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/50 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-secondary mb-1">{totalLogs}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Activities</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/50 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-outline mb-1">{store.garden.trees}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trees Grown</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-surface-container-low rounded-2xl border border-surface-variant overflow-hidden">
          <h3 className="px-6 py-4 border-b border-surface-variant font-bold text-on-surface bg-surface-container/50">
            App Preferences
          </h3>
          <div className="p-2">
            <div className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-variant rounded-lg text-on-surface-variant">
                  {store.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Theme</h4>
                  <p className="text-xs text-on-surface-variant">Choose your app appearance</p>
                </div>
              </div>
              <select 
                value={store.theme}
                onChange={(e) => store.setTheme(e.target.value as 'light' | 'dark')}
                className="bg-surface border border-surface-variant text-on-surface text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl border border-surface-variant overflow-hidden">
          <h3 className="px-6 py-4 border-b border-surface-variant font-bold text-on-surface bg-surface-container/50">
            Data Management
          </h3>
          <div className="p-2">
            {importError && (
              <div className="mx-4 mt-2 p-3 bg-error-container text-on-error-container text-sm font-semibold rounded-lg">
                {importError}
              </div>
            )}
            
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container transition-colors rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-container text-on-primary-container rounded-lg">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-on-surface text-sm">Export Data</h4>
                  <p className="text-xs text-on-surface-variant">Download your logs as JSON</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container transition-colors rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tertiary-container text-on-tertiary-container rounded-lg">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Import Data</h4>
                  <p className="text-xs text-on-surface-variant">Restore from JSON backup</p>
                </div>
              </div>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              className="hidden" 
              aria-label="Import backup file"
            />

            <button 
              onClick={() => setShowClearModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-error/10 transition-colors rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-error group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-error/10 text-error rounded-lg group-hover:bg-error group-hover:text-on-error transition-colors">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-error text-sm">Clear History</h4>
                  <p className="text-xs text-on-surface-variant">Permanently delete all activity logs</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
