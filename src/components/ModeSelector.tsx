import React from 'react';
import { Code2, Bug, BookOpen, Wand2, LucideIcon, BrainCircuit, Terminal, Layout } from 'lucide-react';

interface Mode {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const MODES: Mode[] = [
  { id: 'review', label: 'Review', icon: Code2, desc: 'Analiza código y busca mejoras' },
  { id: 'debug', label: 'Debug', icon: Bug, desc: 'Interpreta errores y stack traces' },
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Explicación paso a paso' },
  { id: 'refactor', label: 'Refactor', icon: Wand2, desc: 'Mejora sin cambiar lógica' },
  { id: 'architecture', label: 'Architecture', icon: Layout, desc: 'Mapeo de arquitectura y diagramas' },
  { id: 'execution', label: 'Execution', icon: Terminal, desc: 'Implementación de código y fixes' },
];

interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (id: string) => void;
  useLocalBrain: boolean;
  onLocalBrainToggle: (enabled: boolean) => void;
}

export default function ModeSelector({ 
  currentMode, 
  onModeChange, 
  useLocalBrain, 
  onLocalBrainToggle 
}: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border
                  ${isActive 
                    ? 'bg-yellow-wasp text-purple border-yellow-wasp shadow-[0_0_10px_rgba(245,255,136,0.2)]' 
                    : 'bg-purple-light/20 text-slate-300 border-purple-light/30 hover:border-yellow-wasp/50'}
                `}
                title={mode.desc}
              >
                <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                {mode.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onLocalBrainToggle(!useLocalBrain)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ml-2
            ${useLocalBrain 
              ? 'bg-purple-light text-yellow-wasp border-yellow-wasp shadow-[0_0_15px_rgba(245,255,136,0.3)]' 
              : 'bg-slate-800/40 text-slate-500 border-slate-700/50 grayscale opacity-70'}
          `}
          title="Usa el código local del repo como contexto (RAG)"
        >
          <BrainCircuit size={14} strokeWidth={useLocalBrain ? 3 : 2} />
          LOCAL BRAIN
        </button>
      </div>
    </div>
  );
}
