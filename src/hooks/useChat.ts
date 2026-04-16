import { useState, useCallback, useEffect, useRef } from 'react';
import { getMessages } from '@/app/actions/chat';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function useChat(
  activeChatId: string | null, 
  onChatCreated: (newChatId: string) => void,
  onModeLoaded?: (mode: string) => void
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para control de flujo y estado fresco
  const messagesRef = useRef<Message[]>([]);
  const isStreamingRef = useRef(false);
  const currentStreamChatIdRef = useRef<string | null>(null);
  const onModeLoadedRef = useRef(onModeLoaded);

  // Sincronizar la ref con el callback actual
  useEffect(() => {
    onModeLoadedRef.current = onModeLoaded;
  }, [onModeLoaded]);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cargar mensajes cuando cambia el activeChatId
  useEffect(() => {
    let isMounted = true;
    
    async function loadHistory() {
      if (isStreamingRef.current && activeChatId === currentStreamChatIdRef.current) {
        return;
      }

      if (!activeChatId) {
        setMessages([]);
        return;
      }
      
      setLoading(true);
      try {
        const { messages: history, mode } = await getMessages(activeChatId);
        if (isMounted) {
          if (!isStreamingRef.current) {
            setMessages(history);
            if (onModeLoadedRef.current && mode) {
              onModeLoadedRef.current(mode);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();

    return () => { isMounted = false; };
  }, [activeChatId]); // Ya no dependemos de onModeLoaded!

  const sendMessage = useCallback(async (text: string, mode: string = 'review', currentChatId: string | null, useLocalBrain: boolean = false, config?: any) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    const initialMessages = [...messagesRef.current, userMessage];
    
    setMessages([...initialMessages, { role: 'assistant', text: '' }]);
    setLoading(true);
    setError(null);
    
    isStreamingRef.current = true;
    currentStreamChatIdRef.current = currentChatId;

    const MAX_RETRIES = 5;
    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: initialMessages,
            mode,
            chatId: currentChatId,
            useLocalBrain,
            config,
          }),
        });

        if (!response.ok) {
          // Manejo específico de 429 (Quota Exceeded)
          if (response.status === 429) {
            console.error('🚫 [useChat]: Quota Exceeded (429).');
            setError('Gemini API quota reached. Please wait a moment before sending more messages.');
            // No reintentamos agresivamente el 429 en el cliente para no bloquear la IP
            break; 
          }

          // Si es un error temporal 503, reintentamos
          if (response.status === 503) {
            attempt++;
            if (attempt < MAX_RETRIES) {
              const delay = Math.pow(2, attempt) * 1000;
              console.warn(`⚠️ [useChat]: API Busy (503). Retrying in ${delay}ms...`);
              setError(`High demand. Retrying in ${Math.round(delay/1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamChatId = currentChatId;
        let accumulatedText = '';
        let buffer = '';

        if (!reader) throw new Error('No reader found');
        
        success = true;
        setError(null);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
              
              const data = trimmedLine.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.chatId && !streamChatId) {
                  streamChatId = parsed.chatId;
                  currentStreamChatIdRef.current = streamChatId;
                  if (streamChatId) {
                    onChatCreated(streamChatId);
                  }
                }

                if (parsed.error) throw new Error(parsed.error);
                
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                      last.text = accumulatedText;
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // Si el JSON es inválido, puede ser un chunk cortado, lo guardamos para el siguiente ciclo
                buffer = 'data: ' + data + '\n' + buffer;
              }
            }
          }
        } catch (streamErr: any) {
          console.error('Streaming error mid-way:', streamErr);
          // Si falló a mitad del stream, intentamos al menos mostrar lo que llegamos a recibir
          setError(`Connection interrupted. Displaying partial response.`);
        }
      } catch (err: any) {
        console.error('Chat error:', err);
        
        // Si el error es temporal (503/429), permitimos que el bucle siga e intente de nuevo
        const isTransient = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('demand');
        
        if (isTransient && attempt < MAX_RETRIES - 1) {
          attempt++;
          const delay = Math.pow(2, attempt) * 500;
          console.warn(`🔄 [useChat]: Transient error during stream. Retrying (${attempt}/${MAX_RETRIES})...`);
          setError(`Connection hiccup. Retrying in ${Math.round(delay/1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // No hacemos break, volvemos a intentar el fetch
        }

        setError(err.message);
        break; // Error crítico o intentos agotados
      }
    }

    setLoading(false);
    isStreamingRef.current = false;
    currentStreamChatIdRef.current = null;
  }, [onChatCreated]);

  return { messages, loading, error, sendMessage };
}
