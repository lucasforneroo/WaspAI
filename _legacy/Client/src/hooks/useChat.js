import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function useChat() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hola, soy WaspAI. ¿En qué código vamos a trabajar hoy? Estoy lista para revisar, debuguear o explicar lo que necesites.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function sendMessage(text, mode = 'review') {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text };
    const assistantMessageId = Date.now() + 1;
    
    setMessages(prev => [...prev, userMessage, { 
      id: assistantMessageId, 
      role: 'assistant', 
      text: '', 
      isStreaming: true 
    }]);
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Lógica de consumo de Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                assistantText += data.text;
                // Actualizamos el mensaje del asistente en tiempo real
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                  ? { ...msg, text: assistantText } 
                  : msg
                ));
              }
              if (data.error) throw new Error(data.error);
            } catch (e) {
              console.error('Error parseando chunk:', e);
            }
          }
        }
      }

      // Marcamos que terminó el streaming
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (err) {
      console.error('[useChat Error]:', err);
      setError(err.message);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== assistantMessageId);
        return [...filtered, { 
          id: assistantMessageId, 
          role: 'assistant', 
          text: `¡Uy, loco! Algo salió mal: ${err.message}.` 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, isLoading, error, sendMessage };
}
