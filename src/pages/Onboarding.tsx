import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { Building2, Home, Trees, Utensils, Fish, Leaf, Apple, Car, Bus, Bike, Footprints } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useSustainlyStore(state => state.profile);
  const setProfile = useSustainlyStore(state => state.setProfile);
  
  const [name, setName] = useState(profile?.name || location.state?.name || '');
  const [environment, setEnvironment] = useState(profile?.city || 'urban');
  const [diet, setDiet] = useState<'everything' | 'pescatarian' | 'vegetarian' | 'vegan'>(profile?.diet || 'everything');
  const [commute, setCommute] = useState<string[]>(profile?.primaryCommute || []);
  const [energy, setEnergy] = useState<'track' | 'could-better' | 'not-really'>(profile?.homeACUsage || 'could-better');

  const isEditing = !!profile;

  const toggleCommute = (mode: string) => {
    setCommute(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleComplete = () => {
    if (!name.trim()) return;
    setProfile({
      id: profile?.id || crypto.randomUUID(),
      name: name,
      city: environment,
      diet,
      primaryCommute: commute.length > 0 ? commute : ['other'],
      homeACUsage: energy,
      createdAt: profile?.createdAt || new Date().toISOString()
    });
    navigate(isEditing ? '/profile' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-x-hidden text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="text-primary fill-current" size={24} />
            <div className="text-xl text-primary font-bold">Sustainly</div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-24 pb-32">
        <div className="mb-12 text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-on-surface mb-3">{isEditing ? 'Edit Profile' : 'Welcome to Sustainly'}</h1>
          <p className="text-lg text-on-surface-variant max-w-[500px] mx-auto">
            {isEditing ? 'Update your lifestyle preferences constraints.' : 'We\'re glad you\'re here. Let\'s learn a little bit about your lifestyle so we can help you grow your personal impact garden.'}
          </p>
        </div>

        <div className="space-y-8">
          {/* Name */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/50 relative overflow-hidden transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2">What's your name?</h2>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg border border-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Your name"
            />
          </div>

          {/* Environment */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/50 relative overflow-hidden transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-1">Where do you spend most of your time?</h2>
            <p className="text-on-surface-variant mb-6 font-semibold opacity-80 text-sm">This helps us tailor your local action suggestions.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                 { id: 'urban', icon: Building2, label: 'Urban City' },
                 { id: 'suburban', icon: Home, label: 'Suburbs' },
                 { id: 'rural', icon: Trees, label: 'Rural Area' }
              ].map(opt => (
                <label key={opt.id} className="cursor-pointer group relative">
                  <input type="radio" name="environment" className="peer sr-only" checked={environment === opt.id} onChange={() => setEnvironment(opt.id)} />
                  <div className="p-4 rounded-lg border-2 border-surface-variant bg-surface group-hover:border-soft-sage peer-checked:border-primary peer-checked:bg-primary-fixed/20 transition-all flex flex-col items-center text-center gap-2">
                    <opt.icon className="text-on-surface-variant peer-checked:text-primary mb-1" size={32} />
                    <span className="font-semibold text-on-surface text-sm">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/50 relative overflow-hidden transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-1">What's your typical diet like?</h2>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { id: 'everything', icon: Utensils, label: 'Everything' },
                { id: 'pescatarian', icon: Fish, label: 'Pescatarian' },
                { id: 'vegetarian', icon: Leaf, label: 'Vegetarian' },
                { id: 'vegan', icon: Apple, label: 'Vegan' },
              ].map(opt => (
                <label key={opt.id} className="cursor-pointer">
                  <input type="radio" name="diet" className="peer sr-only" checked={diet === opt.id} onChange={() => setDiet(opt.id as any)} />
                  <div className="px-6 py-3 rounded-full border border-surface-variant bg-surface hover:bg-surface-container-highest peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition-all font-semibold text-sm flex items-center gap-2">
                    <opt.icon size={18} /> {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Commute */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/50 relative overflow-hidden transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-1">How do you usually get around?</h2>
            <p className="text-on-surface-variant mb-6 text-sm font-semibold opacity-80">Select all that apply.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'car', icon: Car, label: 'Car' },
                { id: 'transit', icon: Bus, label: 'Transit' },
                { id: 'bike', icon: Bike, label: 'Bike' },
                { id: 'walk', icon: Footprints, label: 'Walk' },
              ].map(opt => (
                <label key={opt.id} className="cursor-pointer group relative">
                  <input type="checkbox" className="peer sr-only" checked={commute.includes(opt.id)} onChange={() => toggleCommute(opt.id)} />
                  <div className="p-3 rounded-lg border-2 border-surface-variant bg-surface group-hover:border-soft-sage peer-checked:border-primary peer-checked:bg-primary-fixed/20 transition-all flex flex-col items-center text-center gap-1">
                    <opt.icon className="text-on-surface-variant peer-checked:text-primary" size={28} />
                    <span className="text-sm font-semibold text-on-surface">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 w-full bg-surface/90 backdrop-blur-lg border-t border-surface-variant/30 p-4 z-50 shadow-[0_-8px_30px_rgba(22,101,52,0.05)]">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button 
            disabled={!name.trim()}
            onClick={handleComplete}
            className="w-full md:w-auto bg-primary disabled:opacity-50 text-on-primary font-bold text-lg py-4 px-8 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
            {isEditing ? 'Save Preferences' : 'Let\'s grow your garden together'} <Trees size={20} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
