'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Database, Palette, Zap, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  onConfigChange: (newConfig: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onConfigChange }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a141b] border border-purple-light/30 rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-light/10 bg-purple-dark/50">
              <h2 className="text-lg font-bold text-yellow-wasp flex items-center gap-2">
                <Zap size={20} />
                Configuración del Sistema
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Model Selection */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
                  <Cpu size={18} className="text-purple-light" />
                  <h3>Cerebro de IA</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Rápido y estable (Recomendado)' },
                    { id: 'custom-model', name: 'Próximamente...', desc: 'Integración con modelos Open Source' }
                  ].map((model) => (
                    <button
                      key={model.id}
                      disabled={model.id === 'custom-model'}
                      onClick={() => model.id !== 'custom-model' && onConfigChange({ ...config, model: model.id })}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        config.model === model.id 
                        ? 'bg-yellow-wasp/10 border-yellow-wasp text-yellow-wasp' 
                        : model.id === 'custom-model'
                          ? 'bg-white/5 border-transparent text-slate-600 cursor-not-allowed opacity-50'
                          : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-sm">{model.name}</div>
                      <div className="text-[10px] opacity-70">{model.desc}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* RAG Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
                  <Database size={18} className="text-purple-light" />
                  <h3>Local Brain (RAG)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Profundidad de contexto</span>
                    <span className="text-yellow-wasp font-mono">{config.ragDepth} fragmentos</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    value={config.ragDepth}
                    onChange={(e) => onConfigChange({ ...config, ragDepth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-purple-dark rounded-lg appearance-none cursor-pointer accent-yellow-wasp"
                  />
                </div>
              </section>

              {/* UI Vibe */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
                  <Palette size={18} className="text-purple-light" />
                  <h3>Apariencia</h3>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent">
                  <div className="text-sm text-slate-300 font-medium">Animación de fondo</div>
                  <button 
                    onClick={() => onConfigChange({ ...config, bgEnabled: !config.bgEnabled })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${config.bgEnabled ? 'bg-yellow-wasp' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-purple-dark rounded-full transition-all ${config.bgEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </section>

              {/* Indexing */}
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-light/20 border border-purple-light/30 text-purple-light hover:bg-purple-light/30 transition-all font-bold text-sm uppercase tracking-wider">
                <RefreshCw size={16} />
                Re-indexar Repositorio
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-purple-dark/30 text-center">
              <p className="text-[10px] text-slate-500 italic">
                Configuración persistente en este navegador
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
