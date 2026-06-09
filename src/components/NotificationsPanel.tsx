import React, { useState, useEffect, useRef } from 'react';
import { Bell, Lightbulb, Newspaper, Calendar } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'insight',
    icon: Lightbulb,
    title: 'Daily Insight',
    content: 'Consider taking a 5-minute walk today to lower carbon footprint compared to driving for short trips.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    type: 'news',
    icon: Newspaper,
    title: 'Sustainability News',
    content: 'Global wind energy capacity reached a new high in Q2.',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 3,
    type: 'reminder',
    icon: Calendar,
    title: 'Reminder',
    content: 'Don\'t forget to log your eco-activity today to keep your streak!',
    time: '1 day ago',
    unread: false,
  }
];

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

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
            {mockNotifications.map(notification => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="p-4 border-b border-surface-variant/30 flex gap-3 hover:bg-surface-variant/40 transition-colors cursor-default last:border-b-0">
                  <div className={`mt-0.5 p-2 rounded-full h-fit ${notification.type === 'insight' ? 'bg-primary-container text-on-primary-container' : notification.type === 'news' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
