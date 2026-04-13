import React from 'react';
import { Code2, Bug, BookOpen, Wand2 } from 'lucide-react';

const MODES = [
  { id: 'review', label: 'Review', icon: Code2, desc: 'Analiza código y busca mejoras' },
  { id: 'debug', label: 'Debug', icon: Bug, desc: 'Interpreta errores y stack traces' },
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Explicación paso a paso' },
  { id: 'refactor', label: 'Refactor', icon: Wand2, desc: 'Mejora sin cambiar lógica' },
];

export default function ModeSelector({ currentMode, onModeChange }) {
  return (
    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-wasp-yellow text-wasp-purple border-wasp-yellow' 
                : 'bg-wasp-purple-light text-slate-300 border-transparent hover:border-wasp-yellow/50 border'}
              border
            `}
            title={mode.desc}
          >
            <Icon size={14} strokeWidth={isActive ? 3 : 2} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
