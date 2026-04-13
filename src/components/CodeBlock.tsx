import React, { useState, useEffect, useMemo } from 'react';
import hljs from 'highlight.js';
import { Copy, Check, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsFullScreen] = useState(false);
  
  const lines = useMemo(() => code.split('\n'), [code]);
  const isLongCode = lines.length > 25;
  const shouldCollapse = isLongCode && !isExpanded;

  useEffect(() => {
    hljs.highlightAll();
  }, [code, isExpanded]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden border border-purple-light/20 shadow-2xl transition-all group bg-[#0d0d0e]/80 backdrop-blur-sm">
      {/* Header del Bloque */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-purple-dark/40 border-b border-purple-light/10">
        <div className="flex items-center gap-3">
          {filename ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-yellow-wasp/5 rounded-md border border-yellow-wasp/10">
              <FileCode size={14} className="text-yellow-wasp/70" />
              <span className="text-[10px] font-mono font-bold text-yellow-wasp/80 tracking-tight">{filename}</span>
            </div>
          ) : (
            <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">{language || 'code'}</span>
          )}
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-light/10 text-slate-400 hover:text-yellow-wasp hover:bg-purple-light/20 transition-all text-[10px] font-bold uppercase tracking-tighter"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Fix</span>
            </>
          )}
        </button>
      </div>

      {/* Contenedor de Código */}
      <div className={`relative transition-all duration-500 ${shouldCollapse ? 'max-h-[400px]' : 'max-h-none'}`}>
        <pre className="p-6 overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-purple-light/20 scrollbar-track-transparent font-mono selection:bg-yellow-wasp/30">
          <code className={`language-${language || 'plaintext'}`}>
            {shouldCollapse ? lines.slice(0, 25).join('\n') : code}
          </code>
        </pre>

        {/* Overlay de "Show More" */}
        {shouldCollapse && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0d0e] to-transparent flex items-end justify-center pb-4">
            <button 
              onClick={() => setIsFullScreen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-light/20 hover:bg-purple-light/30 border border-purple-light/30 rounded-full text-[10px] font-black text-yellow-wasp uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <ChevronDown size={14} />
              Show Full Implementation ({lines.length} lines)
            </button>
          </div>
        )}
      </div>

      {/* Botón para colapsar de nuevo (opcional) */}
      {isExpanded && isLongCode && (
        <div className="px-6 py-3 border-t border-purple-light/5 bg-purple-dark/20 flex justify-center">
          <button 
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-2 text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
          >
            <ChevronUp size={12} />
            Collapse Code
          </button>
        </div>
      )}
    </div>
  );
}
