import { useState, useCallback, useEffect, useRef } from 'react';
import { getMessages } from '@/app/actions/chat';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function useChat(activeChatId: string | null, onChatCreated: (newChatId: string) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para control de flujo y estado fresco
  const messagesRef = useRef<Message[]>([]);
  const isStreamingRef = useRef(false);
  const currentStreamChatIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cargar mensajes cuando cambia el activeChatId
  useEffect(() => {
    let isMounted = true;
    
    async function loadHistory() {
      // SI ESTAMOS EN MEDIO DE UN STREAM Y EL CHAT ID ES EL MISMO, 
      // NO CARGAMOS HISTORIAL PARA EVITAR SOBREESCRIBIR EL STREAM.
      if (isStreamingRef.current && activeChatId === currentStreamChatIdRef.current) {
        console.log('🔄 [useChat]: Skip history load (streaming in progress)');
        return;
      }

      if (!activeChatId) {
        setMessages([]);
        return;
      }
      
      setLoading(true);
      try {
        const history = await getMessages(activeChatId);
        if (isMounted) {
          // Solo actualizamos si NO empezamos un stream justo ahora
          if (!isStreamingRef.current) {
            setMessages(history);
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
  }, [activeChatId]);

  const sendMessage = useCallback(async (text: string, mode: string = 'review', currentChatId: string | null, useLocalBrain: boolean = false, config?: any) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    const initialMessages = [...messagesRef.current, userMessage];
    
    setMessages([...initialMessages, { role: 'assistant', text: '' }]);
    setLoading(true);
    setError(null);
    
    isStreamingRef.current = true;
    currentStreamChatIdRef.current = currentChatId;

    const MAX_RETRIES = 3;
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

        // Si es un error temporal (503 o 429), reintentamos
        if (!response.ok) {
          if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
            attempt++;
            const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s...
            console.warn(`⚠️ [useChat]: API Busy (503/429). Retrying in ${delay}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
            setError(`High demand. Retrying in ${Math.round(delay/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
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
        
        // Si llegamos acá, la conexión está abierta y funcionando
        success = true;
        setError(null);

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
                onChatCreated(streamChatId);
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
              buffer = 'data: ' + data + '\n' + buffer;
            }
          }
        }
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message);
        break; // Errores de red reales o fallas críticas, no reintentamos en el catch por ahora
      }
    }

    setLoading(false);
    isStreamingRef.current = false;
    currentStreamChatIdRef.current = null;
  }, [onChatCreated]);

  return { messages, loading, error, sendMessage };
}
