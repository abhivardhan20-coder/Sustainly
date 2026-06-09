import React from 'react';
import { ChatMessage } from '../../store/useSustainlyStore';
import DOMPurify from 'dompurify';

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({ messages, loading, chatEndRef }: Props) {
  return (
    <div role="log" aria-live="polite" aria-label="Conversation history" className="flex flex-col gap-4">
      {messages.map((m) => (
        <div 
          key={m.id} 
          className={`flex flex-col gap-2 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
          role={m.role === 'ai' ? 'status' : undefined}
        >
           <div 
             className={`p-4 rounded-2xl text-base shadow-sm ${m.role === 'user' ? 'bg-soft-sage/20 border border-soft-sage/10 rounded-tr-sm text-on-surface' : 'bg-surface-container-lowest border-l-4 border-primary rounded-tl-sm text-on-surface border border-surface-variant/50'}`}
             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.content) }}
           />
        </div>
      ))}
      
      {loading && (
        <div 
          className="self-start max-w-[85%] md:max-w-[70%] flex flex-col gap-2" 
          role="status" 
          aria-label="Sustainly is thinking..."
        >
           <div className="px-5 py-4 rounded-2xl bg-surface-container-lowest border-l-4 border-surface-variant rounded-tl-sm shadow-sm flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-soft-sage motion-safe:animate-bounce [animation-delay:0ms]" aria-hidden="true"></div>
             <div className="w-2 h-2 rounded-full bg-soft-sage motion-safe:animate-bounce [animation-delay:150ms]" aria-hidden="true"></div>
             <div className="w-2 h-2 rounded-full bg-soft-sage motion-safe:animate-bounce [animation-delay:300ms]" aria-hidden="true"></div>
             <span className="sr-only">Sustainly is processing your message</span>
           </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
