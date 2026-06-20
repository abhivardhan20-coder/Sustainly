import React, { useState, useRef, useEffect } from 'react';
import { useSustainlyStore } from '../store/useSustainlyStore';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { auth } from '../lib/firebase';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import ChatFeedback from '../components/chat/ChatFeedback';

export default function ChatLogger() {
  const { profile, addLog, setSuggestedAction, completeAction, todaysActions, messages, setMessages } = useSustainlyStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loggedResult, setLoggedResult] = useState<{ activities?: Array<{ id: string; type: string; description: string; points: number; icon: string }>; message?: string; suggestedAction?: { title: string; description: string; btnText: string } } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if current suggested action is completed
  const isActionCompleted = todaysActions[0]?.completed || false;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loggedResult, loading, imageBase64]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 3);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;
    
    const userMsg = input.trim();
    const currentBase64 = imageBase64;
    
    setInput('');
    setImageBase64(null);
    
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMsg || "📸 Sent an image" }]);
    setLoading(true);
    setLoadingStep(0);

    try {
      const recentHistory = messages.slice(-20);
      const token = auth.currentUser 
        ? await auth.currentUser.getIdToken() 
        : (typeof window !== 'undefined' && (window as any).__E2E_AUTH_MOCK__ ? 'test-token' : '');
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(typeof window !== 'undefined' && (window as any).__E2E_AUTH_MOCK__ && { 'X-E2E-Mock': 'true' })
        },
        body: JSON.stringify({
          userMessage: userMsg,
          profile,
          history: recentHistory,
          imageBase64: currentBase64
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse activity");
      }
      
      if (data.message) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: data.message }]);
      }

      if (data.activities && data.activities.length > 0) {
        setLoggedResult(data);
        
        const totalPoints = data.activities.reduce((sum: number, act: { points?: number }) => sum + (act.points || 0), 0);
        
        addLog({
          date: format(new Date(), 'yyyy-MM-dd'),
          activities: data.activities.map((act: { id?: string; type: string; description: string; points: number; icon: string; timestamp?: string; source?: string }) => ({
            ...act,
            id: act.id || crypto.randomUUID(),
            timestamp: act.timestamp || new Date().toISOString()
          })),
          totalPoints
        });

        if (data.suggestedAction) {
           setSuggestedAction({
             id: crypto.randomUUID(),
             ...data.suggestedAction,
             completed: false
           });
        }
        
        // Sync server-calculated streak and lastLoggedDate
        await useSustainlyStore.getState().loadFromFirestore();
      }
    } catch (error: unknown) {
       console.error("Failed to log", error);
       const errMsg = error instanceof Error ? error.message : "Oops, I had trouble understanding that. Could you try again?";
       setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSuggestedAction = () => {
    if (todaysActions[0]) {
      completeAction(todaysActions[0].id);
    }
  };

  const handleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  
    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
  
    recognition.onerror = (event: { error: string }) => {
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
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1024;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setImageBase64(compressedBase64);
          } else {
            setImageBase64(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] -mx-4 md:mx-0 lg:-mt-8 md:pt-8 bg-surface-container-lowest">
      {/* Header */}
      <div className="px-4 py-4 md:py-6 border-b border-surface-variant/50 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-soft-sage/30 flex items-center justify-center relative">
          <Sparkles size={16} className="text-primary" aria-hidden="true" />
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
        <ChatMessages messages={messages} loading={loading} loadingStep={loadingStep} chatEndRef={chatEndRef} />
        
        {!loading && (
          <ChatFeedback 
            loggedResult={loggedResult} 
            handleCompleteSuggestedAction={handleCompleteSuggestedAction} 
            isActionCompleted={isActionCompleted} 
          />
        )}
      </div>

      {/* Input Area */}
      <ChatInput 
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
        imageBase64={imageBase64}
        setImageBase64={setImageBase64}
        handleFileChange={handleFileChange}
        handleVoice={handleVoice}
        isRecording={isRecording}
      />
    </div>
  );
}
