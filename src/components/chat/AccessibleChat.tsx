// src/components/chat/AccessibleChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon } from 'lucide-react';

interface AccessibleChatProps {
  onSendMessage: (msg: string) => Promise<void>;
  isStreaming: boolean;
  messages: Array<{ role: 'user' | 'ai'; content: string; id: string }>;
}

export const AccessibleChat: React.FC<AccessibleChatProps> = ({ 
  onSendMessage, 
  isStreaming, 
  messages 
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom, but respect reduced motion preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chatEndRef.current?.scrollIntoView({ 
      behavior: prefersReducedMotion ? 'auto' : 'smooth' 
    });
  }, [messages, isStreaming]);

  // Focus management on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const msg = input;
    setInput('');
    await onSendMessage(msg);
    inputRef.current?.focus();
  };

  return (
    <section 
      className="chat-container" 
      aria-label="Chat interface for logging activities"
      role="region"
    >
      <div 
        className="messages-list" 
        role="log" 
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.role}`}
            data-testid={`message-${msg.role}`}
          >
            {/* Screen reader only role announcement */}
            <span className="sr-only">
              {msg.role === 'user' ? 'You said:' : 'AI response:'}
            </span>
            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
          </div>
        ))}
        {isStreaming && (
          <div className="message ai typing" aria-label="AI is typing...">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="chat-input-form"
        aria-label="Message input form"
      >
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your sustainability action..."
            aria-label="Chat message input"
            disabled={isStreaming}
            className="chat-input"
          />
          <div className="button-group">
            <button
              type="button"
              className="icon-btn"
              aria-label="Use microphone for voice input"
              title="Voice input"
              disabled={isStreaming}
            >
              <Mic size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Upload an image of your action"
              title="Upload image"
              disabled={isStreaming}
            >
              <ImageIcon size={20} aria-hidden="true" />
            </button>
            <button
              type="submit"
              className="send-btn"
              aria-label="Send message"
              disabled={!input.trim() || isStreaming}
            >
              <Send size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
