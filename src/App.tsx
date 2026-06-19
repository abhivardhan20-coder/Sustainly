/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChatLogger from './pages/ChatLogger';
import ClickSpark from './components/ClickSpark';
import { useSustainlyStore } from './store/useSustainlyStore';
import { useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/LoadingScreen';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Garden = lazy(() => import('./pages/Garden'));
const History = lazy(() => import('./pages/History'));
const Learn = lazy(() => import('./pages/Learn'));

export default function App() {
  const profile = useSustainlyStore((state) => state.profile);
  const theme = useSustainlyStore((state) => state.theme);
  const { loading } = useAuth();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!profile ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route element={profile ? <ClickSpark sparkColor='#166534' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}><Layout /></ClickSpark> : <Navigate to="/" replace />}>
          <Route path="/dashboard" element={<Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>} />
          <Route path="/log" element={<ChatLogger />} />
          <Route path="/garden" element={<Suspense fallback={<LoadingScreen />}><Garden /></Suspense>} />
          <Route path="/history" element={<Suspense fallback={<LoadingScreen />}><History /></Suspense>} />
          <Route path="/learn" element={<Suspense fallback={<LoadingScreen />}><Learn /></Suspense>} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
