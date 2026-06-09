import React, { useState, useRef, useEffect } from 'react';
import { useSustainlyStore, ChatMessage } from '../store/useSustainlyStore';
import { Sparkles, CheckCircle, Send, Mic, Camera, Trees, Lightbulb, Car, Bus, Bike, Utensils, Home, X } from 'lucide-react';
import { format } from 'date-fns';
import BorderGlow from '../components/BorderGlow';
import { auth } from '../lib/firebase';

import TextType from '../components/TextType';

export default function ChatLogger() {
  const { profile, addLog, setSuggestedAction, completeAction, todaysActions, messages, setMessages } = useSustainlyStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedResult, setLoggedResult] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current suggested action is completed
  const currentSuggestedAction = loggedResult?.suggestedAction;
  const isActionCompleted = currentSuggestedAction 
    ? todaysActions.some(a => a.id === currentSuggestedAction.id && a.completed)
    : false;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loggedResult, loading, imageBase64]);

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;
    
    const userMsg = input.trim();
    const currentBase64 = imageBase64;
    
    setInput('');
    setImageBase64(null);
    
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMsg || "📸 Sent an image" }]);
    setLoading(true);

    try {
      const recentHistory = messages.slice(-20);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userMessage: userMsg,
          profile,
          history: recentHistory,
          imageBase64: currentBase64
        })
      });

      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: data.message }]);
      }

      if (data.activities && data.activities.length > 0) {
        setLoggedResult(data);
        
        const totalPoints = data.activities.reduce((sum: number, act: any) => sum + (act.points || 0), 0);
        
        addLog({
          date: format(new Date(), 'yyyy-MM-dd'),
          activities: data.activities,
          totalPoints
        });

        if (data.suggestedAction) {
           setSuggestedAction({
             id: crypto.randomUUID(),
             ...data.suggestedAction,
             completed: false
           });
        }
      }
    } catch (error) {
       console.error("Failed to log", error);
       setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: "Oops, I had trouble understanding that. Could you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSuggestedAction = () => {
    if (!currentSuggestedAction) return;
    
    completeAction(currentSuggestedAction.id);
  };

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    
    if (isRecording) return;
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    recognition.onstart = () => setIsRecording(true);
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
  
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: "Microphone access is not allowed. Please check your browser permissions, or open the app in a new tab." }]);
      } else {
        console.warn("Speech recognition error:", event.error);
      }
      setIsRecording(false);
    };
  
    recognition.onend = () => setIsRecording(false);
  
    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const IconMap: any = {
    car: Car,
    bus: Bus,
    bike: Bike,
    restaurant: Utensils,
    home: Home,
    trees: Trees
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] -mx-4 md:mx-0 lg:-mt-8 md:pt-8 bg-surface-container-lowest">
      {/* Header */}
      <div className="px-4 py-4 md:py-6 border-b border-surface-variant/50 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-soft-sage/30 flex items-center justify-center relative">
          <Sparkles size={16} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-primary -translate-y-[2px]">Understanding your day...</h1>
      </div>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-6" 
        role="log" 
        aria-live="polite" 
        aria-label="Conversation with Sustainly AI"
        aria-busy={loading}
      >
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex flex-col gap-2 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
            role={m.role === 'ai' ? 'status' : undefined}
          >
             <div className={`p-4 rounded-2xl text-base shadow-sm ${m.role === 'user' ? 'bg-soft-sage/20 border border-soft-sage/10 rounded-tr-sm text-on-surface' : 'bg-surface-container-lowest border-l-4 border-primary rounded-tl-sm text-on-surface border border-surface-variant/50'}`}>
                {m.content}
             </div>
          </div>
        ))}
        
        {loading && (
          <div 
            className="self-start max-w-[85%] md:max-w-[70%] flex flex-col gap-2" 
            role="status" 
            aria-label="Sustainly is thinking..."
          >
             <div className="px-5 py-4 rounded-2xl bg-surface-container-lowest border-l-4 border-surface-variant rounded-tl-sm shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-soft-sage animate-bounce [animation-delay:0ms]" aria-hidden="true"></div>
               <div className="w-2 h-2 rounded-full bg-soft-sage animate-bounce [animation-delay:150ms]" aria-hidden="true"></div>
               <div className="w-2 h-2 rounded-full bg-soft-sage animate-bounce [animation-delay:300ms]" aria-hidden="true"></div>
               <span className="sr-only">Sustainly is processing your message</span>
             </div>
          </div>
        )}

        {loggedResult && !loading && (
          <div 
            className="mt-4 animate-in slide-in-from-bottom-4 fade-in duration-500 w-full max-w-2xl mx-auto" 
            role="status" 
            aria-label="Activity logged successfully"
          >
            <BorderGlow backgroundColor="#ffffff" borderRadius={12} className="shadow-sm w-full">
              <div className="p-6 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <CheckCircle size={24} className="fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Logged Successfully!</h3>
                    <p className="text-on-surface-variant text-sm font-semibold">Your impact garden is growing.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  {loggedResult.activities.map((act: any, i: number) => {
                    const Icon = IconMap[act.icon] || Sparkles;
                    const isPositive = act.points >= 0;
                    return (
                      <div key={i} className={`p-4 rounded-lg flex flex-col gap-2 ${isPositive ? 'bg-surface-container' : 'bg-error-container/30'}`}>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant flex items-center gap-2">
                          <Icon size={16} /> {act.description}
                        </span>
                        <span className={`text-3xl font-bold ${isPositive ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {isPositive ? '+' : ''}{act.points} pts
                        </span>
                      </div>
                    );
                  })}
                </div>

                {loggedResult.suggestedAction && (
                  <div className="bg-surface-bright rounded-lg p-5 border border-soft-sage/30 relative z-10">
                    <p className="text-xs uppercase font-bold tracking-widest text-primary mb-3 flex items-center gap-2">
                      <Lightbulb size={16} /> Suggested Action
                    </p>
                    <h4 className="text-base font-bold text-on-surface mb-1">{loggedResult.suggestedAction.title}</h4>
                    <p className="text-sm font-medium text-text-muted mb-4">{loggedResult.suggestedAction.description}</p>
                    
                    <button 
                      onClick={handleCompleteSuggestedAction}
                      disabled={isActionCompleted}
                      className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${isActionCompleted 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-primary text-on-primary hover:bg-primary/90'}`}
                      aria-label={isActionCompleted 
                        ? `Completed: ${loggedResult.suggestedAction.title}` 
                        : `Commit to: ${loggedResult.suggestedAction.title}`}
                    >
                      {isActionCompleted ? '✓ Completed' : loggedResult.suggestedAction.btnText}
                    </button>
                  </div>
                )}
              </div>
            </BorderGlow>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-variant/50 shrink-0 pb-20 md:pb-6">
        {imageBase64 && (
          <div className="max-w-3xl mx-auto mb-3 relative inline-block">
             <img 
               src={imageBase64} 
               alt="Preview of uploaded photo for activity logging" 
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
             {!input && (
               <TextType 
                 text={["Tell me about your day...", "What did you eat today?", "Did you bike to work?"]}
                 typingSpeed={70}
                 pauseDuration={1500}
                 showCursor={true}
                 cursorCharacter="|"
                 className="absolute left-0 top-3 pointer-events-none text-on-surface-variant/60"
                 textColors={['currentColor']}
               />
             )}
             <textarea 
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
               className={`p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${isRecording ? 'text-error bg-error/10 animate-pulse' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'}`}
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
    </div>
  );
}
