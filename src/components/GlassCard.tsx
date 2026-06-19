import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  tabIndex?: number;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  role?: string;
}

export default function GlassCard({ className = '', children, ...props }: GlassCardProps) {
  return (
    <div className={`bg-surface-container-lowest/80 dark:bg-surface-container-lowest/60 backdrop-blur-sm border border-surface-variant/20 dark:border-surface-variant/40 rounded-2xl p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}