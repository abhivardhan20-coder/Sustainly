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
