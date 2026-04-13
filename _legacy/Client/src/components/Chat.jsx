import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ModeSelector from './ModeSelector';
import useChat from '../hooks/useChat';
import { Mic, Paperclip, ArrowUp, Loader2 } from 'lucide-react';

export default function Chat() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('review');
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = (force = false) => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: force ? "smooth" : "auto" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput(''); 
    
    // Forzamos el scroll al enviar nuestro mensaje
    setTimeout(() => scrollToBottom(true), 10);
    
    await sendMessage(currentInput, mode);
  };

  return (
    <div className="flex flex-col h-full items-center">
      {/* Messages Container */}
      <div ref={scrollRef} className="flex-1 w-full overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-wasp-yellow/20 flex items-center justify-center border border-wasp-yellow/30">
                <Loader2 size={18} className="text-wasp-yellow animate-spin" />
              </div>
              <div className="bg-wasp-purple-light/30 rounded-2xl px-5 py-3 text-slate-400 italic text-sm">
                WaspAI está analizando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Estilo Claude */}
      <div className="w-full max-w-3xl p-4 mb-4">
        <ModeSelector currentMode={mode} onModeChange={setMode} />
        
        <div className="relative bg-wasp-purple-light rounded-2xl border border-wasp-purple-light focus-within:border-wasp-yellow transition-all p-2 shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega tu código o pregunta algo..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-100 placeholder-slate-400 min-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-wasp-yellow transition-colors rounded-lg hover:bg-wasp-purple">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-wasp-yellow transition-colors rounded-lg hover:bg-wasp-purple">
                <Mic size={20} />
              </button>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading
                ? 'bg-wasp-yellow text-wasp-purple hover:scale-105' 
                : 'bg-wasp-purple text-slate-500'
              }`}
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ArrowUp size={22} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center mt-3 text-slate-500">
          WaspAI puede cometer errores. Considera revisar la información importante.
        </p>
      </div>
    </div>
  );
}
