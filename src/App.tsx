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
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Garden = lazy(() => import('./pages/Garden'));
const History = lazy(() => import('./pages/History'));
const Learn = lazy(() => import('./pages/Learn'));
import ChatLogger from './pages/ChatLogger';
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
      if (user) {
        // User logged in, check if they have a profile in Firestore
        try {
          await useSustainlyStore.getState().loadFromFirestore();
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
      clearTimeout(timeoutId);
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

  // Client-side Firestore sync has been securely moved to backend API routes

  if (authChecking) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!profile ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route element={profile ? <ClickSpark sparkColor='#166534' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}><Layout /></ClickSpark> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Suspense fallback={<div className="flex h-full items-center justify-center p-8 text-primary">Loading...</div>}><Dashboard /></Suspense>} />
          <Route path="/log" element={<ChatLogger />} />
          <Route path="/garden" element={<Suspense fallback={<div className="flex h-full items-center justify-center p-8 text-primary">Loading...</div>}><Garden /></Suspense>} />
          <Route path="/history" element={<Suspense fallback={<div className="flex h-full items-center justify-center p-8 text-primary">Loading...</div>}><History /></Suspense>} />
          <Route path="/learn" element={<Suspense fallback={<div className="flex h-full items-center justify-center p-8 text-primary">Loading...</div>}><Learn /></Suspense>} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
