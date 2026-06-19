import React, { useState, useEffect, useRef } from 'react';
import { Bell, Lightbulb, Flame, TreePine, Award, TrendingUp } from 'lucide-react';
import { useSustainlyStore } from '../store/useSustainlyStore';

interface Notification {
  id: string;
  type: 'insight' | 'streak' | 'garden' | 'achievement';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  content: string;
  time: string;
  unread: boolean;
}

function generateNotifications(store: ReturnType<typeof useSustainlyStore.getState>): Notification[] {
  const notifications: Notification[] = [];
  const today = new Date().toISOString().split('T')[0];
  const todaysLog = store.dailyLogs[today];

  // Streak notification
  if (store.streak >= 3) {
    notifications.push({
      id: 'streak',
      type: 'streak',
      icon: Flame,
      title: `${store.streak}-Day Streak! 🔥`,
      content: `You've been logging sustainably for ${store.streak} days in a row. Keep it up!`,
      time: 'Today',
      unread: true,
    });
  }

  // Garden milestone
  if (store.garden.trees >= 5) {
    notifications.push({
      id: 'garden-5',
      type: 'garden',
      icon: TreePine,
      title: 'Garden Milestone',
      content: `Your garden has grown to ${store.garden.trees} trees! Your impact is truly blossoming.`,
      time: 'Today',
      unread: store.garden.trees === 5,
    });
  }

  // Today's activity summary
  if (todaysLog && todaysLog.activities.length > 0) {
    notifications.push({
      id: 'today-summary',
      type: 'achievement',
      icon: TrendingUp,
      title: "Today's Progress",
      content: `You've logged ${todaysLog.activities.length} activit${todaysLog.activities.length === 1 ? 'y' : 'ies'} for ${todaysLog.totalPoints > 0 ? '+' : ''}${todaysLog.totalPoints} points today.`,
      time: 'Just now',
      unread: true,
    });
  }

  // Points milestone
  const totalPoints = Object.values(store.dailyLogs).reduce((sum, log) => sum + log.totalPoints, 0);
  if (totalPoints >= 100) {
    notifications.push({
      id: 'points-100',
      type: 'achievement',
      icon: Award,
      title: 'Century Club! 🎉',
      content: `You've earned ${totalPoints} total impact points. You're making a real difference!`,
      time: 'Milestone',
      unread: totalPoints < 150,
    });
  }

  // Daily tip reminder if no log today
  if (!todaysLog || todaysLog.activities.length === 0) {
    notifications.push({
      id: 'daily-reminder',
      type: 'insight',
      icon: Lightbulb,
      title: 'Daily Reminder',
      content: "You haven't logged any activities today. Chat with Sustainly to track your eco-actions!",
      time: 'Today',
      unread: true,
    });
  }

  return notifications;
}

export default function NotificationsPanel() {
  const store = useSustainlyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = generateNotifications(store);

  useEffect(() => {
    setHasUnread(notifications.some(n => n.unread));
  }, [notifications.length]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={togglePanel}
        className="relative p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-[400px] overflow-y-auto bg-surface-container-high shadow-lg rounded-2xl border border-surface-variant z-50 flex flex-col">
          <div className="p-4 border-b border-surface-variant/50 sticky top-0 bg-surface-container-high/90 backdrop-blur-sm z-10 font-bold text-on-surface">
            Notifications
          </div>
          <div className="flex flex-col">
            {notifications.length > 0 ? (
              notifications.map(notification => {
                const Icon = notification.icon;
                return (
                  <div key={notification.id} className="p-4 border-b border-surface-variant/30 flex gap-3 hover:bg-surface-variant/40 transition-colors cursor-default last:border-b-0">
                    <div className={`mt-0.5 p-2 rounded-full h-fit ${
                      notification.type === 'insight' ? 'bg-primary-container text-on-primary-container' : 
                      notification.type === 'streak' ? 'bg-tertiary-container text-on-tertiary-container' : 
                      notification.type === 'garden' ? 'bg-primary-container text-on-primary-container' :
                      'bg-secondary-container text-on-secondary-container'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-on-surface">{notification.title}</h4>
                      <p className="text-sm text-on-surface-variant mt-1 leading-snug">{notification.content}</p>
                      <span className="text-xs text-on-surface-variant/70 mt-2 block">{notification.time}</span>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-on-surface-variant text-sm">
                No notifications yet. Start logging activities!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
