/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ChatLogger from './pages/ChatLogger';
import Garden from './pages/Garden';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ClickSpark from './components/ClickSpark';
import { useSustainlyStore } from './store/useSustainlyStore';

export default function App() {
  const profile = useSustainlyStore(state => state.profile);
  const theme = useSustainlyStore(state => state.theme);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    
    // Fallback: If Firebase takes too long to initialize or network request hangs
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Firebase auth check timed out. Proceeding to app...');
        setAuthChecking(false);
      }
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId);
      if (user) {
        // User logged in, check if they have a profile in Firestore
        try {
          // Add a timeout to the getDoc call to prevent hanging if Firestore is unreachable
          const userDocRef = doc(db, 'users', user.uid);
          const docPromise = getDoc(userDocRef);
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
          
          const userDoc = await Promise.race([docPromise, timeoutPromise]);
          
          if (userDoc && 'exists' in userDoc && userDoc.exists()) {
            const data = userDoc.data();
            useSustainlyStore.setState({
              profile: data.profile,
              dailyLogs: data.dailyLogs || {},
              garden: data.garden || { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
              streak: data.streak || 0,
              lastLoggedDate: data.lastLoggedDate || null,
              todaysActions: data.todaysActions || [],
              theme: data.theme || 'light'
            });
          }
        } catch (err) {
          console.error("Error loading user data from Firestore:", err);
        }
      } else {
        // No user logged in, reset local store if there's a profile
        if (useSustainlyStore.getState().profile) {
            useSustainlyStore.getState().resetAllData();
        }
      }
      if (isMounted) setAuthChecking(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.error("Auth state change error:", error);
      if (isMounted) setAuthChecking(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Sync to Firestore whenever state changes
  useEffect(() => {
    let writeTimer: ReturnType<typeof setTimeout>;
    const unsub = useSustainlyStore.subscribe((state) => {
      clearTimeout(writeTimer);
      writeTimer = setTimeout(() => {
        const user = auth.currentUser;
        if (user && state.profile) {
          setDoc(doc(db, 'users', user.uid), {
            profile: state.profile,
            dailyLogs: state.dailyLogs,
            garden: state.garden,
            streak: state.streak,
            lastLoggedDate: state.lastLoggedDate,
            todaysActions: state.todaysActions,
            theme: state.theme
          }, { merge: true }).catch(err => {
             console.error("Error saving data to Firestore:", err);
          });
        }
      }, 2000);
    });
    return () => {
      unsub();
      clearTimeout(writeTimer);
    };
  }, []);

  if (authChecking) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!profile ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route element={profile ? <ClickSpark sparkColor='#166534' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}><Layout /></ClickSpark> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<ChatLogger />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
