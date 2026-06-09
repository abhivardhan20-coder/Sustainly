import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trees } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import BorderGlow from '../components/BorderGlow';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/onboarding', { state: { name: result.user.displayName || 'User' } });
      }
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/unauthorized-domain')) {
          alert('Firebase Error: You need to add this applet\'s URL to your Firebase Authorized Domains list. Check the Authentication > Settings > Authorized domains tab in your Firebase Console.');
        } else if (error.message.includes('auth/operation-not-allowed')) {
          alert('Firebase Error: Google Sign-In is not enabled. Please go to the Firebase Console -> Authentication -> Sign-in method, and enable Google as a provider.');
        } else if (error.message.includes('auth/network-request-failed')) {
          alert('Firebase Error: A network error occurred. Please check your connection or your Firebase config domain.');
        } else {
          alert(`Failed to connect your account: ${error.message}`);
        }
      } else {
        alert('Failed to connect your account. Please try again.');
      }
    }
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center relative overflow-hidden text-on-surface">
      <div className="absolute inset-0 bg-gradient-to-t from-soft-sage/40 to-transparent pointer-events-none"></div>
      
      <BorderGlow
        className="max-w-sm w-full mx-4"
        edgeSensitivity={30}
        backgroundColor="#f9f9f8" // surface-container-lowest
        borderRadius={16} // rounded-2xl
        glowRadius={40}
        glowIntensity={1.0}
        coneSpread={25}
        animated={true}
      >
        <div className="p-8 lg:p-10 text-center w-full">
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-[4px] border-surface-container-lowest">
            <Trees size={40} className="text-on-primary-container fill-current" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-3">Sustainly</h1>
          <p className="text-on-surface-variant font-medium text-sm mb-10 leading-relaxed">
            Grow your personal impact garden, one choice at a time.
          </p>

          <button 
            onClick={handleLogin}
            className="w-full bg-white text-gray-700 font-bold text-base py-3 px-6 rounded-full shadow-sm hover:shadow-md border border-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            Continue with Google
          </button>
        </div>
      </BorderGlow>
    </div>
  );
}
