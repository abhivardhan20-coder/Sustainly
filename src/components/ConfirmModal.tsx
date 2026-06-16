import React, { useEffect } from 'react';
import FocusTrap from './FocusTrap';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  titleId: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  titleId
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen}>
      <div 
        className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby={titleId}
        onClick={onClose}
      >
        <div 
          className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-lg border border-surface-variant/40"
          onClick={e => e.stopPropagation()}
        >
          <h3 id={titleId} className="text-xl font-bold text-on-surface mb-2">{title}</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            {description}
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm focus:outline-none focus-visible:ring-2 ${
                variant === 'danger' 
                  ? 'bg-error text-on-error hover:bg-error/90 focus-visible:ring-error/50' 
                  : 'bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary/50'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
