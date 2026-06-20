import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import BorderGlow from '../components/BorderGlow';

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (typeof window !== 'undefined' && window.__E2E_AUTH_MOCK__) {
        navigate('/onboarding', { state: { name: 'Test User' } });
        return;
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/onboarding', { state: { name: result.user.displayName || 'User' } });
      }
    } catch (err: unknown) {
      console.error('Firebase Auth Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-primary/20">
      {/* Dynamic background element */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-[sway_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-[sway_15s_ease-in-out_infinite_reverse]" />

      <div className="w-full max-w-md relative z-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 duration-1000">
        <BorderGlow backgroundColor="var(--color-surface-container-lowest)" borderRadius={24} className="shadow-sm">
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-6 shadow-sm">
              <Leaf size={40} className="text-primary fill-current" />
            </div>
            
            <h1 className="text-3xl font-bold text-primary mb-3">Sustainly</h1>
            <p className="text-on-surface-variant font-medium text-sm mb-10 leading-relaxed">Grow your personal impact garden, one choice at a time.</p>
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full relative group overflow-hidden bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <div className="w-6 h-6 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 text-error text-sm font-medium animate-in slide-in-from-top-1">{error}</p>
            )}
          </div>
        </BorderGlow>
      </div>
    </main>
  );
}
