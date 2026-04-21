'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import Greeting from './Greeting';
import { useChat } from '../hooks/useChat';
import { 
  Mic, Paperclip, ArrowUp, Loader2, 
  ChevronUp, Terminal, Map, GitBranch, ShieldAlert, 
  SearchCode, MessageSquare, Bug, Zap, Brain, Sparkles
} from 'lucide-react';

interface ChatProps {
  activeChatId: string | null;
  onChatCreated: (id: string) => void;
  config: any;
  user?: { name: string; avatar: string };
}

export default function Chat({ activeChatId, onChatCreated, config, user }: ChatProps) {
  const [mode, setMode] = useState('review');
  const [activeAgent, setActiveAgent] = useState('general');
  const [useLocalBrain, setUseLocalBrain] = useState(false);

  // Callback para cuando se carga el historial de un chat anterior
  // USAMOS useCallback para evitar loops infinitos de re-renderizado
  const handleModeLoaded = useCallback((loadedMode: string) => {
    if (['execution', 'architecture', 'github', 'security', 'general'].includes(loadedMode)) {
      setActiveAgent(loadedMode);
    } else {
      setMode(loadedMode);
    }
  }, []);

  const { messages, loading, sendMessage } = useChat(activeChatId, onChatCreated, handleModeLoaded);
  const [input, setInput] = useState('');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: 'general', name: 'General Assistant', icon: <Sparkles size={16} />, color: 'text-blue-400' },
    { id: 'execution', name: 'Agente de Ejecución', icon: <Terminal size={16} />, color: 'text-green-400' },
    { id: 'architecture', name: 'Mapeo de Arquitectura', icon: <Map size={16} />, color: 'text-purple-400' },
    { id: 'github', name: 'PR Ghost Reviewer', icon: <GitBranch size={16} />, color: 'text-orange-400' },
    { id: 'security', name: 'Agente de Seguridad', icon: <ShieldAlert size={16} />, color: 'text-red-400' },
  ];

  const modes = [
    { id: 'review', name: 'Review', icon: <SearchCode size={16} /> },
    { id: 'explain', name: 'Explain', icon: <MessageSquare size={16} /> },
    { id: 'debug', name: 'Debug', icon: <Bug size={16} /> },
    { id: 'refactor', name: 'Refactor', icon: <Zap size={16} /> },
    { id: 'local', name: 'Local Brain', icon: <Brain size={16} />, isToggle: true },
  ];

  const currentAgent = agents.find(a => a.id === activeAgent) || agents[0];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const currentInput = input.trim();
    setInput(''); 
    
    // COMANDO DE TEST VISUAL PARA SEGURIDAD
    if (currentInput.startsWith('/test-security')) {
      // Actualizamos los mensajes localmente para ver el efecto
      return; 
    }

    setTimeout(() => scrollToBottom(true), 10);
    
    // Si el agente no es general, usamos el ID del agente como modo para persistencia
    const effectiveMode = activeAgent !== 'general' ? activeAgent : mode;
    
    await sendMessage(currentInput, effectiveMode, activeChatId, useLocalBrain, { ...config, agent: activeAgent });
  };

  const scrollToBottom = (force = false) => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (force || scrollHeight - scrollTop - clientHeight < 100) {
      messagesEndRef.current?.scrollIntoView({ behavior: force ? "smooth" : "auto" });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  return (
    <div className="flex flex-col h-full items-center relative">
      <div ref={scrollRef} className="flex-1 w-full overflow-y-auto px-4 pt-4 pb-24 scroll-smooth">
        <div className={`max-w-3xl mx-auto space-y-6 flex flex-col ${messages.length === 0 ? 'pt-12 pb-6' : 'py-6'}`}>
          {messages.length === 0 && !loading && (
            <Greeting userName={user?.name || 'Developer'} />
          )}
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {loading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-yellow-wasp/10 flex items-center justify-center border border-yellow-wasp/20">
                <Loader2 size={18} className="text-yellow-wasp animate-spin" />
              </div>
              <div className="bg-purple-light/30 rounded-2xl px-5 py-2 text-slate-100 italic text-sm border border-purple-light/20 backdrop-blur-md opacity-100-forced">
                WaspAI está analizando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Terminal Area */}
      <div className="w-full max-w-3xl p-3 mb-2 flex flex-col items-center">
        
        {/* AGENT SELECTOR (Top attached) */}
        <div className="relative w-full">
          <AnimatePresence>
            {isAgentMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a141b] border border-purple-light/30 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
              >
                <div className="p-2 space-y-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => { setActiveAgent(agent.id); setIsAgentMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all ${
                        activeAgent === agent.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <span className={agent.color}>{agent.icon}</span>
                      <span className="text-sm font-bold">{agent.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a141b] border-t border-l border-r border-purple-light/30 rounded-t-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-wasp transition-all"
          >
            <span className={currentAgent.color}>{currentAgent.icon}</span>
            Agent: <span className="text-white">{currentAgent.name}</span>
            <ChevronUp size={10} className={`transition-transform ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Textarea Container */}
        <div className="w-full relative bg-[#3b2a3d]/90 backdrop-blur-lg rounded-b-xl rounded-tr-xl border border-purple-light/40 focus-within:border-yellow-wasp transition-all p-1.5 shadow-2xl opacity-100-forced">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Command in ${mode.toUpperCase()}...`}
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-slate-100 placeholder-slate-500 min-h-[60px] text-sm opacity-100-forced"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="flex items-center gap-0.5 relative">
              <button className="p-1.5 text-slate-300 hover:text-yellow-wasp transition-colors rounded-lg hover:bg-purple-light/20 opacity-100-forced">
                <Paperclip size={18} />
              </button>
              <button className="p-1.5 text-slate-300 hover:text-yellow-wasp transition-colors rounded-lg hover:bg-purple-light/20 opacity-100-forced">
                <Mic size={18} />
              </button>

              {/* MODE SELECTOR (Inside action bar) */}
              <div className="relative ml-1 border-l border-white/10 pl-1">
                <AnimatePresence>
                  {isModeMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-4 w-48 bg-[#1a141b] border border-purple-light/30 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                    >
                      <div className="p-2 space-y-1">
                        {modes.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (m.isToggle) setUseLocalBrain(!useLocalBrain);
                              else setMode(m.id);
                              if (!m.isToggle) setIsModeMenuOpen(false);
                            }}
                            className={`flex items-center justify-between w-full p-2 rounded-xl transition-all ${
                              (m.isToggle ? useLocalBrain : mode === m.id) 
                              ? 'bg-yellow-wasp/10 text-yellow-wasp' 
                              : 'text-slate-400 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {m.icon}
                              <span className="text-xs font-bold">{m.name}</span>
                            </div>
                            {m.isToggle && (
                              <div className={`w-1.5 h-1.5 rounded-full ${useLocalBrain ? 'bg-yellow-wasp shadow-[0_0_8px_#f5ff88]' : 'bg-slate-600'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-200 transition-all"
                >
                  <span className="text-yellow-wasp">{mode}</span>
                  {useLocalBrain && <Brain size={10} className="text-yellow-wasp animate-pulse" />}
                  <ChevronUp size={10} className={`transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-1.5 rounded-lg transition-all opacity-100-forced ${
                input.trim() && !loading
                ? 'bg-yellow-wasp text-purple shadow-[0_0_20px_rgba(245,255,136,0.2)] hover:scale-105' 
                : 'bg-purple-dark text-slate-500 opacity-50'
              }`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
        <p className="text-[9px] text-center mt-1.5 text-slate-500 font-bold uppercase tracking-widest opacity-100-forced">
          WaspAI Engineering Terminal — April 2026 Edition
        </p>
      </div>
    </div>
  );
}
