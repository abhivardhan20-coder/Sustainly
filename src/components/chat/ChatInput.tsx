import React, { useRef } from 'react';
import { Send, Mic, Camera, X } from 'lucide-react';
import TextType from '../TextType';

interface Props {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: () => void;
  loading: boolean;
  imageBase64: string | null;
  setImageBase64: React.Dispatch<React.SetStateAction<string | null>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVoice: () => void;
  isRecording: boolean;
}

export default function ChatInput({
  input, setInput, handleSend, loading, imageBase64, setImageBase64, handleFileChange, handleVoice, isRecording
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 md:p-6 bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-variant/50 shrink-0 pb-20 md:pb-6">
      {imageBase64 && (
        <div className="max-w-3xl mx-auto mb-3 relative inline-block">
           <img 
             src={imageBase64} 
             alt="Uploaded content" 
             className="h-24 w-auto rounded-lg object-cover border border-surface-variant shadow-sm" 
           />
           <button 
             onClick={() => setImageBase64(null)} 
             className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 shadow hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-white"
             aria-label="Remove uploaded image"
           >
              <X size={14} />
           </button>
        </div>
      )}
      <div className="max-w-3xl mx-auto flex items-end gap-3 bg-surface-container p-2 rounded-xl border border-surface-variant focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-sm">
         <input 
           type="file" 
           accept="image/*" 
           capture="environment" 
           ref={fileInputRef} 
           onChange={handleFileChange} 
           className="hidden" 
           aria-hidden="true"
         />
         <button 
           aria-label="Take a photo or upload image" 
           onClick={() => fileInputRef.current?.click()} 
           className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
         >
           <Camera size={20} />
         </button>
         <div className="relative w-full text-base font-medium flex items-center">
           <label htmlFor="chat-input" className="sr-only">Describe your daily activities</label>
           {!input && (
             <TextType 
               text={["Tell me about your day...", "What did you eat today?", "Did you bike to work?"]}
               typingSpeed={70}
               pauseDuration={1500}
               showCursor={true}
               cursorCharacter="|"
               className="absolute left-0 top-3 pointer-events-none text-on-surface-variant/60 motion-safe:animate-pulse"
               textColors={['currentColor']}
             />
           )}
           <textarea 
             id="chat-input"
             aria-label="Message input - Describe your daily activities"
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={(e) => {
               if(e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
               }
             }}
             placeholder=""
             className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 text-on-surface h-full outline-none"
             rows={1}
             style={{ minHeight: '48px' }}
           />
         </div>
         <div className="flex items-center gap-2 shrink-0">
           <button 
             aria-label={isRecording ? "Stop voice recording" : "Start voice input"} 
             aria-pressed={isRecording}
             onClick={handleVoice} 
             className={`p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${isRecording ? 'text-error bg-error/10 motion-safe:animate-pulse' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'}`}
           >
             <Mic size={20} />
           </button>
           <button 
             aria-label="Send message to Sustainly" 
             onClick={handleSend} 
             disabled={(!input.trim() && !imageBase64) || loading} 
             className="p-3 bg-primary disabled:opacity-50 text-on-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
           >
             <Send size={20} />
           </button>
         </div>
      </div>
    </div>
  );
}
