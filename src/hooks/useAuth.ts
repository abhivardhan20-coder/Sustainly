import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useSustainlyStore } from '../store/useSustainlyStore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadFromFirestore = useSustainlyStore((state) => state.loadFromFirestore);
  const resetAllData = useSustainlyStore((state) => state.resetAllData);

  useEffect(() => {
    let isMounted = true;
    const isE2EMock = typeof window !== 'undefined' && (window as unknown as { __E2E_AUTH_MOCK__?: boolean }).__E2E_AUTH_MOCK__;
    if (isE2EMock) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setUser({ displayName: 'Test User', uid: 'test-user-id' } as User);
          setLoading(false);
        }
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Firebase auth check timed out. Proceeding to app...');
        setLoading(false);
      }
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (isMounted) setUser(firebaseUser);
        try {
          await loadFromFirestore();
        } catch (err) {
          console.error('Error loading user data from Firestore:', err);
        }
      } else {
        if (isMounted) setUser(null);
        if (useSustainlyStore.getState().profile) {
          resetAllData();
        }
      }
      if (isMounted) setLoading(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error('Auth state change error:', error);
      if (isMounted) setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [loadFromFirestore, resetAllData]);

  return { user, loading };
}
