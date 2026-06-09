import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Trees, List, User, Plus, Flame } from 'lucide-react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import NotificationsPanel from './NotificationsPanel';

export default function Layout() {
  const { streak, profile } = useSustainlyStore();

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-surface-container-lowest">
      {/* TopAppBar for Mobile */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm h-16 flex justify-between items-center px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Trees className="text-primary fill-current" size={24} />
          <div className="font-bold text-xl text-primary">Sustainly</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-tertiary-fixed-dim">
            <Flame size={20} className="fill-current" />
            <span className="font-semibold text-xs">{streak}</span>
          </div>
          <NotificationsPanel />
          <NavLink to="/profile" className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-variant flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </NavLink>
        </div>
      </header>

      {/* Floating Notifications for Desktop */}
      <div className="fixed top-6 right-8 z-50 hidden md:block">
        <NotificationsPanel />
      </div>

      {/* SideNavBar for Desktop */}
      <nav className="h-screen w-64 hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low shadow-sm p-4 gap-2 z-40 border-r border-surface-variant/30">
        <div className="mb-8 px-4 py-4 flex items-center gap-3">
          <NavLink to="/profile" className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-variant flex items-center justify-center overflow-hidden font-bold hover:scale-105 transition-transform text-on-surface">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </NavLink>
          <div>
            <div className="flex items-center gap-2">
              <Trees className="text-primary fill-current" size={24} />
              <h1 className="text-xl font-bold text-primary">Sustainly</h1>
            </div>
            <p className="text-xs text-on-surface-variant">Growing together</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-grow">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-secondary-container text-on-secondary-container scale-[0.98]' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
          >
            <Home size={20} /> Home
          </NavLink>
          <NavLink
            to="/garden"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-secondary-container text-on-secondary-container scale-[0.98]' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
          >
            <Trees size={20} /> Garden
          </NavLink>
        </div>

        <NavLink to="/log" className="mt-auto bg-primary text-on-primary font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm">
          <Plus size={18} /> AI Log
        </NavLink>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pt-24 md:pt-8 md:pl-64 pb-24 md:pb-8 relative">
        <Outlet />
      </main>

      {/* BottomNavBar for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full md:hidden bg-surface/90 backdrop-blur-lg rounded-t-xl z-50 flex justify-around items-center px-4 pb-4 pt-2 shadow-[0_-4px_6px_-1px_rgba(22,101,52,0.05)]">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `flex flex-col items-center justify-center transition-transform ${isActive ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90' : 'text-on-surface-variant hover:text-primary'}`}
        >
          {({ isActive }) => (
            <>
              <Home size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-[10px] uppercase font-semibold mt-1">Home</span>
            </>
          )}
        </NavLink>
        
        <NavLink
          to="/garden"
          className={({ isActive }) => `flex flex-col items-center justify-center transition-transform ${isActive ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90' : 'text-on-surface-variant hover:text-primary'}`}
        >
          {({ isActive }) => (
            <>
              <Trees size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-[10px] uppercase font-semibold mt-1">Garden</span>
            </>
          )}
        </NavLink>
        
        <NavLink
          to="/log"
          className={({ isActive }) => `flex flex-col items-center justify-center transition-transform ${isActive ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90' : 'text-on-surface-variant hover:text-primary'}`}
        >
          {({ isActive }) => (
            <>
              <Plus size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-[10px] uppercase font-semibold mt-1">Log</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
