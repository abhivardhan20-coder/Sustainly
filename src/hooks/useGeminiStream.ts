// src/hooks/useGeminiStream.ts
import { useState, useCallback, useRef } from 'react';

interface StreamChunk {
  type: 'text' | 'action' | 'error';
  content: string;
  data?: unknown;
}

interface UseGeminiStreamOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export function useGeminiStream(options: UseGeminiStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (prompt: string, context: unknown) => {
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const chunk = JSON.parse(line.slice(6)) as StreamChunk;
                options.onChunk?.(chunk);
                
                if (chunk.type === 'error') {
                  throw new Error(chunk.content);
                }
              } catch {
                // Handle JSON parse errors gracefully
                console.warn('Failed to parse chunk:', line);
              }
            }
          }
        }

        options.onComplete?.({ success: true });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, this is expected
          return;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { stream, cancel, isStreaming, error };
}
